import { CARDS, CARD_ORDER, DIFFICULTY } from './cards.js';
import {
  WORLD, RIVER, BRIDGE, TEAMS, MANA, MATCH, DEPLOY, SPAWN, createTowers
} from './config.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rand = (a, b) => a + Math.random() * (b - a);

export class Game {
  constructor() {
    this.events = [];
    this.reset('normal');
    this.phase = 'title';
  }

  reset(difficulty = 'normal') {
    this.difficulty = difficulty;
    this.towers = createTowers().map(t => ({ ...t, isTower: true }));
    this.units = [];
    this.projectiles = [];
    this.effects = [];
    this.time = 0;
    this.matchTime = MATCH.regular;
    this.overtime = false;
    this.phase = 'ready';
    this.paused = false;
    this.mana = MANA.start;
    this.enemyMana = MANA.start;
    this.crowns = [0, 0];
    this.cooldowns = Object.fromEntries(CARD_ORDER.map(id => [id, 0]));
    this.enemyCooldowns = Object.fromEntries(CARD_ORDER.map(id => [id, 0]));
    this.result = null;
    this.shake = 0;
    this.stats = {
      deployed: 0, manaSpent: 0, damage: 0, towers: 0,
      enemyDeployed: 0, enemyDamage: 0, enemyTowers: 0, healed: 0
    };
    this.aiTimer = .8;
    this.aiGlobal = 1.2;
    this.retarget = 0;
    this.seq = 0;
    this.events.length = 0;
    this.kingAwake = [false, false];
    this.firstBlood = false;
  }

  beginMatch(difficulty = this.difficulty) {
    this.reset(difficulty);
    this.phase = 'countdown';
  }

  begin() {
    if (this.phase !== 'countdown') return;
    this.phase = 'battle';
    this.events.push({ type: 'battleStart' });
  }

  setPaused(v) {
    if (this.phase === 'over' || this.phase === 'title' || this.phase === 'ready' || this.phase === 'countdown') return false;
    this.paused = v;
    return true;
  }

  drainEvents() {
    const e = this.events;
    this.events = [];
    return e;
  }

  /* ---------------------------------------------------------------- */
  /* deployment                                                       */
  /* ---------------------------------------------------------------- */
  canDeploy(team, x, y) {
    const d = DEPLOY[team];
    if (x < d.x1 || x > d.x2 || y < d.y1 || y > d.y2) return false;
    for (const t of this.towers) {
      if (t.team === team && !t.destroyed && Math.hypot(t.x - x, t.y - y) < t.radius + 20) return false;
    }
    return true;
  }

  playCard(cardId, x, y, team = 0) {
    if (this.phase !== 'battle' && this.phase !== 'overtime') return { ok: false, reason: 'phase' };
    if (this.paused) return { ok: false, reason: 'paused' };
    const c = CARDS[cardId];
    if (!c) return { ok: false, reason: 'card' };
    const mana = team === 0 ? this.mana : this.enemyMana;
    const cd = team === 0 ? this.cooldowns : this.enemyCooldowns;
    if (cd[cardId] > 0) return { ok: false, reason: 'cooldown' };
    if (mana < c.cost) return { ok: false, reason: 'mana' };
    if (!this.canDeploy(team, x, y)) return { ok: false, reason: 'zone' };

    if (team === 0) {
      this.mana -= c.cost;
      this.stats.deployed++;
      this.stats.manaSpent += c.cost;
    } else {
      this.enemyMana -= c.cost;
      this.stats.enemyDeployed++;
    }
    cd[cardId] = 1.35;
    this.spawnUnit(cardId, team, x, y);
    this.events.push({ type: 'deploy', team, card: cardId, x, y, cost: c.cost });
    return { ok: true };
  }

  spawnUnit(cardId, team, x, y) {
    const c = CARDS[cardId];
    const unit = {
      id: ++this.seq, card: cardId, team,
      x, y, spawnX: x, spawnY: y,
      hp: c.hp, maxHp: c.hp,
      dmg: c.dmg, attackSpeed: c.attackSpeed, range: c.range,
      speed: c.speed, radius: c.radius,
      cd: .3, target: null, targetTower: false,
      materialize: .62, walkPhase: rand(0, TAU), seed: rand(0, 10),
      moving: false, attackAnim: 0, hitFlash: 0,
      slowT: 0, slowAmount: 0,
      whirlCount: 0, shadowCd: 1.4, shadowCrit: false,
      healCd: .8, dying: 0, dead: false, retarget: 0,
      isUnit: true
    };
    this.units.push(unit);
    this.addEffect('deploy', { x, y, team, color: TEAMS[team].color });
    return unit;
  }

  /* ---------------------------------------------------------------- */
  /* main update                                                      */
  /* ---------------------------------------------------------------- */
  update(dt) {
    if (this.paused) return;
    const active = this.phase === 'battle' || this.phase === 'overtime';
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 24);

    for (const id of CARD_ORDER) {
      this.cooldowns[id] = Math.max(0, this.cooldowns[id] - dt);
      this.enemyCooldowns[id] = Math.max(0, this.enemyCooldowns[id] - dt);
    }

    if (active) {
      this.tickClock(dt);
      this.regen(dt);
      this.updateTowers(dt);
      this.updateUnits(dt);
      this.updateAI(dt);
      this.aiGlobal = Math.max(0, this.aiGlobal - dt);
      this.retarget -= dt;
    } else if (this.phase !== 'over') {
      // idle scene — let the chibis breathe
      this.updateEffects(dt);
      return;
    }

    this.updateProjectiles(dt);
    this.updateEffects(dt);

    if (this.towers.some(t => t.kind === 'king' && t.destroyed)) {
      // handled by destroyTower
    }
  }

  tickClock(dt) {
    this.matchTime -= dt;
    if (this.matchTime > 0) return;
    if (!this.overtime) {
      if (this.crowns[0] === this.crowns[1]) {
        this.overtime = true;
        this.matchTime = MATCH.overtime;
        this.events.push({ type: 'overtime' });
      } else {
        this.finishByScore();
      }
    } else {
      this.finishByScore();
    }
  }

  regen(dt) {
    const rate = this.overtime ? MANA.overtimeRegen : MANA.regen;
    this.mana = Math.min(MANA.max, this.mana + rate * dt);
    this.enemyMana = Math.min(MANA.max, this.enemyMana + rate * dt);
  }

  finishByScore() {
    if (this.phase === 'over') return;
    if (this.crowns[0] > this.crowns[1]) return this.endMatch(0, 'crowns');
    if (this.crowns[1] > this.crowns[0]) return this.endMatch(1, 'crowns');
    const pk = this.towers.find(t => t.team === 0 && t.kind === 'king');
    const ek = this.towers.find(t => t.team === 1 && t.kind === 'king');
    const pr = pk.hp / pk.maxHp;
    const er = ek.hp / ek.maxHp;
    if (pr > er + .001) return this.endMatch(0, 'hp');
    if (er > pr + .001) return this.endMatch(1, 'hp');
    this.endMatch(-1, 'draw');
  }

  endMatch(winner, reason) {
    if (this.phase === 'over') return;
    this.phase = 'over';
    this.result = { winner, outcome: winner === 0 ? 'win' : winner === 1 ? 'lose' : 'draw', reason };
    this.events.push({ type: 'matchEnd', result: this.result });
  }

  /* ---------------------------------------------------------------- */
  /* towers                                                           */
  /* ---------------------------------------------------------------- */
  updateTowers(dt) {
    for (const t of this.towers) {
      if (t.destroyed) continue;
      t.cd = Math.max(0, t.cd - dt);
      t.hitFlash = Math.max(0, t.hitFlash - dt);
      if (t.kind === 'king') {
        const princessDown = this.towers.some(o => o.team === t.team && o.kind === 'princess' && o.destroyed);
        const shouldWake = t.hp < t.maxHp || princessDown;
        if (shouldWake && !t.active) {
          t.active = true;
          this.kingAwake[t.team] = true;
          this.events.push({ type: 'kingWake', team: t.team });
          this.addEffect('ring', { x: t.x, y: t.y - 60, color: TEAMS[t.team].color, r: 60, life: .6 });
          this.addEffect('text', { x: t.x, y: t.y - 132, text: 'QUEEN AWAKENS', color: TEAMS[t.team].light, size: 11, life: 1.6, vy: -12 });
        }
      }
      if (!t.active) continue;
      let best = null, bestD = t.range;
      for (const u of this.units) {
        if (u.dead || u.team === t.team || u.dying > 0) continue;
        const d = Math.hypot(u.x - t.x, u.y - t.y);
        if (d < bestD) { bestD = d; best = u; }
      }
      t.target = best;
      if (!best || t.cd > 0) continue;
      t.cd = t.cooldown;
      const sx = t.x, sy = t.y - (t.kind === 'king' ? 116 : 64);
      this.projectiles.push({
        x: sx, y: sy, target: best, targetTower: false,
        speed: t.projSpeed, dmg: t.dmg, team: t.team,
        kind: 'bolt', life: 3, trail: [], targetX: best.x, targetY: best.y
      });
      this.addEffect('muzzle', { x: sx, y: sy, color: TEAMS[t.team].color, team: t.team });
      this.events.push({ type: 'towerShot', team: t.team, kind: t.kind });
    }
  }

  /* ---------------------------------------------------------------- */
  /* units                                                            */
  /* ---------------------------------------------------------------- */
  updateUnits(dt) {
    for (const u of this.units) {
      if (u.dead) {
        u.dying += dt;
        continue;
      }
      u.attackAnim = Math.max(0, u.attackAnim - dt * 4.2);
      u.hitFlash = Math.max(0, u.hitFlash - dt);
      u.materialize = Math.max(0, u.materialize - dt);
      u.slowT = Math.max(0, u.slowT - dt);
      u.cd = Math.max(0, u.cd - dt);
      u.shadowCd = Math.max(0, u.shadowCd - dt);
      u.retarget -= dt;
      if (u.materialize > 0) { u.moving = false; continue; }

      this.updateUnitTarget(u);
      const target = u.target;
      if (!target) { u.moving = false; continue; }

      const tx = target.x;
      const ty = target.y;
      const d = Math.hypot(tx - u.x, ty - u.y);
      const reach = u.range + (target.isTower ? target.radius * .82 : target.radius * .6);

      if (d <= reach) {
        u.moving = false;
        if (u.cd <= 0) this.unitAttack(u, target, d);
      } else {
        u.moving = true;
        this.moveUnit(u, tx, ty, dt);
      }

      // ranged healer pulse
      if (u.card === 'hana') {
        u.healCd -= dt;
        if (u.healCd <= 0) {
          u.healCd = CARDS.hana.healInterval;
          this.healPulse(u);
        }
      }
    }
    // sweep the dead
    this.units = this.units.filter(u => !(u.dead && u.dying > 1.05));
  }

  updateUnitTarget(u) {
    const t = u.target;
    if (u.targetTower) {
      if (!t || t.destroyed) { u.target = null; u.targetTower = false; }
    } else if (t && (t.dead || t.dying > 0)) {
      u.target = null;
    }

    const aggro = u.range > 100 ? 175 : 148;
    if (!u.target) {
      const enemy = this.nearestEnemyUnit(u, aggro);
      if (enemy) this.lockUnitTarget(u, enemy);
      else this.lockTowerTarget(u);
      return;
    }

    // tower target → switch to a nearby unit when it is safe to do so
    if (u.targetTower && u.retarget <= 0) {
      u.retarget = .45;
      const enemy = this.nearestEnemyUnit(u, aggro);
      if (enemy) this.lockUnitTarget(u, enemy);
    }
    // unit target that ran far away → consider a tower
    if (!u.targetTower && u.retarget <= 0) {
      u.retarget = .5;
      if (dist(u, u.target) > 320) {
        u.target = null;
        this.lockTowerTarget(u);
      }
    }
  }

  lockUnitTarget(u, enemy) {
    u.target = enemy;
    u.targetTower = false;
    if (u.card === 'kuro' && u.shadowCd <= 0 && Math.hypot(enemy.x - u.x, enemy.y - u.y) > 85) {
      this.shadowStep(u, enemy);
    }
  }

  lockTowerTarget(u) {
    const enemyTeam = 1 - u.team;
    const princesses = this.towers.filter(t => t.team === enemyTeam && t.kind === 'princess' && !t.destroyed);
    let best = null, bestD = Infinity;
    for (const t of princesses) {
      const d = Math.hypot(t.x - u.x, t.y - u.y);
      if (d < bestD) { bestD = d; best = t; }
    }
    if (!best) best = this.towers.find(t => t.team === enemyTeam && t.kind === 'king' && !t.destroyed) || null;
    u.target = best;
    u.targetTower = Boolean(best);
  }

  nearestEnemyUnit(u, maxDist) {
    let best = null, bestD = maxDist;
    for (const o of this.units) {
      if (o.dead || o.team === u.team || o.dying > 0) continue;
      const d = Math.hypot(o.x - u.x, o.y - u.y);
      if (d < bestD) { bestD = d; best = o; }
    }
    return best;
  }

  moveUnit(u, tx, ty, dt) {
    let dx = tx - u.x;
    let dy = ty - u.y;

    // steer through the bridge when crossing the river
    const crossing = (u.y - RIVER.center) * (ty - RIVER.center) < 0;
    if (crossing && u.y > RIVER.top - 36 && u.y < RIVER.bottom + 36) {
      const bx = clamp(u.x, BRIDGE.left + 22, BRIDGE.right - 22);
      dx = bx - u.x + (tx - u.x) * .12;
      dy = RIVER.center - u.y + (ty - u.y) * .55;
    }

    // do not walk through friendly towers
    for (const t of this.towers) {
      if (t.team !== u.team || t.destroyed) continue;
      const ox = u.x - t.x, oy = u.y - t.y;
      const od = Math.hypot(ox, oy);
      const minD = t.radius + u.radius + 9;
      if (od < minD && od > .001) {
        dx += (ox / od) * (minD - od) * 2.4;
        dy += (oy / od) * (minD - od) * 2.4;
      }
    }

    // gentle ally separation
    for (const o of this.units) {
      if (o === u || o.dead || o.dying > 0) continue;
      const ox = u.x - o.x, oy = u.y - o.y;
      const od = Math.hypot(ox, oy);
      const minD = u.radius + o.radius + 3;
      if (od < minD && od > .001) {
        const push = (minD - od) * .7;
        dx += (ox / od) * push;
        dy += (oy / od) * push;
      }
    }

    const len = Math.hypot(dx, dy);
    if (len < .001) return;
    let speed = u.speed;
    if (u.slowT > 0) speed *= (1 - u.slowAmount);
    if (u.card === 'kuro' && u.attackAnim > .5) speed *= .6;
    const step = speed * dt;
    u.x = clamp(u.x + (dx / len) * step, 54, 546);
    u.y = clamp(u.y + (dy / len) * step, 44, 690);
  }

  unitAttack(u, target, d) {
    u.cd = u.attackSpeed * (u.slowT > 0 ? 1.45 : 1);
    u.attackAnim = 1;
    const c = CARDS[u.card];

    if (u.card === 'sakura') {
      u.whirlCount++;
      if (u.whirlCount % 3 === 0) {
        this.addEffect('whirl', { x: u.x, y: u.y - 26, team: u.team, color: c.aura, r: 70 });
        this.events.push({ type: 'whirl', team: u.team });
        for (const o of this.units) {
          if (o.dead || o.team === u.team || o.dying > 0) continue;
          if (Math.hypot(o.x - u.x, o.y - u.y) <= 78) {
            this.dealDamage(o, u.dmg * 1.45, u, { crit: true });
          }
        }
        if (target.isTower) this.dealDamage(target, u.dmg * 1.1, u, {});
        this.shake = Math.max(this.shake, 2.5);
        return;
      }
    }

    let dmg = u.dmg;
    let crit = false;
    if (u.card === 'kuro' && u.shadowCrit) {
      dmg *= CARDS.kuro.critMultiplier;
      crit = true;
      u.shadowCrit = false;
      this.addEffect('text', { x: target.x, y: target.y - 64, text: `CRIT ${Math.round(dmg)}`, color: '#e0a8ff', size: 12, life: 1, vy: -34 });
      this.events.push({ type: 'crit', team: u.team });
    }

    if (u.range > 90) {
      this.projectiles.push({
        x: u.x, y: u.y - 34, target, targetTower: target.isTower,
        speed: u.card === 'yuki' ? 470 : 380,
        dmg, team: u.team,
        kind: u.card === 'yuki' ? 'arrow' : 'petal',
        slow: u.card === 'yuki',
        crit, life: 2.2, trail: [],
        targetX: target.x, targetY: target.y,
        arc: u.card === 'hana' ? 16 : 0
      });
      this.events.push({ type: u.card === 'yuki' ? 'arrow' : 'petal', team: u.team });
      this.addEffect('muzzle', { x: u.x + (target.x > u.x ? 12 : -12), y: u.y - 36, color: CARDS[u.card].aura });
    } else {
      this.dealDamage(target, dmg, u, { crit, slow: false });
      this.addEffect('slash', {
        x: (u.x + target.x) / 2, y: target.isTower ? target.y - 30 : target.y - 30,
        angle: Math.atan2(target.y - u.y, target.x - u.x),
        color: u.card === 'kuro' ? '#c77dff' : CARDS[u.card].outfitLight,
        size: u.card === 'kuro' ? 26 : 22
      });
      this.events.push({ type: 'melee', card: u.card, team: u.team });
    }

    if (target.isTower) {
      this.shake = Math.max(this.shake, u.card === 'kuro' ? 2.2 : 1.1);
    }
  }

  shadowStep(u, enemy) {
    u.shadowCd = CARDS.kuro.stepCooldown;
    this.addEffect('shadow', { x: u.x, y: u.y - 30, color: '#b06bff' });
    const ang = Math.atan2(enemy.y - u.y, enemy.x - u.x);
    const nx = clamp(enemy.x + Math.cos(ang) * 36, 60, 540);
    const ny = clamp(enemy.y + Math.sin(ang) * 36, 60, 900);
    this.addEffect('shadow', { x: nx, y: ny - 30, color: '#d8b4ff' });
    u.x = nx; u.y = ny;
    u.shadowCrit = true;
    u.cd = Math.min(u.cd, .18);
    this.events.push({ type: 'shadowstep', team: u.team });
  }

  healPulse(u) {
    let best = null, bestRatio = .999;
    for (const o of this.units) {
      if (o.dead || o.dying > 0 || o.team !== u.team) continue;
      if (Math.hypot(o.x - u.x, o.y - u.y) > CARDS.hana.healRange) continue;
      const r = o.hp / o.maxHp;
      if (r < bestRatio) { bestRatio = r; best = o; }
    }
    if (!best) return;
    const amount = Math.min(CARDS.hana.heal, best.maxHp - best.hp);
    if (amount <= 0) return;
    best.hp += amount;
    this.stats.healed += u.team === 0 ? amount : 0;
    this.addEffect('heal', { x: best.x, y: best.y - 34, color: '#9dffc4' });
    this.addEffect('text', { x: best.x + 8, y: best.y - 70, text: `+${Math.round(amount)}`, color: '#9dffc4', size: 10, life: .8, vy: -22 });
    this.events.push({ type: 'heal', team: u.team });
  }

  dealDamage(target, amount, source, opts = {}) {
    if (!target || target.dead || target.destroyed) return 0;
    const dealt = Math.min(target.hp, amount);
    target.hp -= amount;
    target.hitFlash = .16;
    if (target.isTower) {
      if (source?.team === 0) this.stats.damage += dealt;
      else if (source?.team === 1) this.stats.enemyDamage += dealt;
      if (target.kind === 'king') target.active = true;
      if (opts.crit) this.addEffect('text', { x: target.x + rand(-10, 10), y: target.y - 70, text: `${Math.round(amount)}`, color: '#ffe7a8', size: 12, life: .8, vy: -26 });
    } else {
      if (opts.slow) {
        target.slowT = Math.max(target.slowT, CARDS.yuki.slowDur);
        target.slowAmount = CARDS.yuki.slowAmount;
        this.addEffect('slow', { x: target.x, y: target.y - 30, color: '#9be8ff' });
        this.events.push({ type: 'slow', team: source?.team });
      }
      if (opts.crit) {
        this.addEffect('hit', { x: target.x, y: target.y - 34, color: '#e0b0ff', big: true });
      } else if (Math.random() < .3) {
        this.addEffect('text', { x: target.x + rand(-6, 6), y: target.y - 56, text: `${Math.round(amount)}`, color: '#fff1f6', size: 9, life: .55, vy: -20 });
      }
    }
    if (target.hp <= 0) {
      target.hp = 0;
      if (target.isTower) this.destroyTower(target, source?.team ?? 0);
      else this.killUnit(target, source?.team ?? 0);
    }
    return dealt;
  }

  killUnit(u, byTeam) {
    if (u.dead) return;
    u.dead = true;
    u.dying = .001;
    u.moving = false;
    this.addEffect('death', { x: u.x, y: u.y - 30, color: TEAMS[u.team].color, card: u.card });
    this.events.push({ type: 'unitDown', team: u.team, card: u.card });
  }

  destroyTower(t, byTeam) {
    if (t.destroyed) return;
    t.destroyed = true;
    t.destroyedAt = this.time;
    t.hp = 0;
    t.target = null;
    this.addEffect('boom', { x: t.x, y: t.y - (t.kind === 'king' ? 80 : 55), color: TEAMS[t.team].color, size: t.kind === 'king' ? 1.5 : 1 });
    this.addEffect('ring', { x: t.x, y: t.y - 16, color: '#ffe1a8', r: 90, life: .8 });
    this.shake = t.kind === 'king' ? 16 : 10;
    this.events.push({ type: 'towerDown', team: t.team, kind: t.kind });
    this.crowns[byTeam] = t.kind === 'king' ? 3 : this.crowns[byTeam] + 1;
    if (byTeam === 0) this.stats.towers++; else this.stats.enemyTowers++;
    this.events.push({ type: 'crown', team: byTeam, kind: t.kind, crowns: this.crowns[byTeam] });

    if (t.kind === 'king') {
      this.endMatch(byTeam, 'king');
      return;
    }
    // wake the king
    const king = this.towers.find(o => o.team === t.team && o.kind === 'king');
    if (king && !king.active) {
      king.active = true;
      this.kingAwake[t.team] = true;
      this.events.push({ type: 'kingWake', team: t.team });
    }
    if (this.overtime) this.endMatch(byTeam, 'sudden');
  }

  /* ---------------------------------------------------------------- */
  /* projectiles                                                      */
  /* ---------------------------------------------------------------- */
  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (p.dead) continue;
      const target = p.target;
      if (target && !target.dead && !target.destroyed) {
        p.targetX = target.x;
        p.targetY = target.y - (target.isTower ? (target.kind === 'king' ? 60 : 40) : 30);
      }
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const d = Math.hypot(dx, dy);
      const step = p.speed * dt;
      p.life -= dt;
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 7) p.trail.shift();
      if (p.kind === 'petal') {
        p.x += dx / (d || 1) * step + Math.sin(p.life * 18) * .7;
        p.y += dy / (d || 1) * step;
      } else {
        p.x += dx / (d || 1) * step;
        p.y += dy / (d || 1) * step;
      }
      if (d <= Math.max(12, step + 6) || p.life <= 0) {
        p.dead = true;
        if (target && !target.dead && !target.destroyed && d <= 26) {
          this.dealDamage(target, p.dmg, { team: p.team, isProjectile: true }, {
            slow: p.slow, crit: p.crit
          });
          this.addEffect('hit', {
            x: p.targetX, y: p.targetY,
            color: p.kind === 'arrow' ? '#bfefff' : p.kind === 'petal' ? '#ffc4dc' : TEAMS[p.team].color,
            big: Boolean(p.crit)
          });
          this.events.push({ type: 'impact', kind: p.kind, team: p.team });
        } else {
          this.addEffect('fizzle', { x: p.x, y: p.y, color: TEAMS[p.team].color });
        }
      }
    }
    this.projectiles = this.projectiles.filter(p => !p.dead);
  }

  /* ---------------------------------------------------------------- */
  /* enemy AI                                                         */
  /* ---------------------------------------------------------------- */
  updateAI(dt) {
    if (this.phase !== 'battle' && this.phase !== 'overtime') return;
    if (this.aiGlobal > 0) return;
    this.aiTimer -= dt;
    if (this.aiTimer > 0) return;
    const d = DIFFICULTY[this.difficulty] || DIFFICULTY.normal;
    this.aiTimer = d.think * rand(.85, 1.25);

    const threats = this.units.filter(u => !u.dead && u.team === 0 && u.dying <= 0 && u.y < 458);
    const affordable = CARD_ORDER.filter(id => this.enemyMana >= CARDS[id].cost && this.enemyCooldowns[id] <= 0);
    if (!affordable.length) return;

    let pick = null;
    let spot = null;

    if (threats.length) {
      threats.sort((a, b) => (a.y - b.y));
      const threat = threats[0];
      const myUnits = this.units.filter(u => !u.dead && u.team === 1);
      const mistake = Math.random() < d.mistake;
      if (!mistake) {
        if (myUnits.some(u => u.hp < u.maxHp * .55) && affordable.includes('hana') && !myUnits.some(u => u.card === 'hana')) pick = 'hana';
        else if ((threat.card === 'yuki' || threat.card === 'hana') && affordable.includes('kuro')) pick = 'kuro';
        else if ((threat.card === 'sakura' || threat.card === 'kuro') && affordable.includes('yuki')) pick = 'yuki';
        else if (affordable.includes('sakura')) pick = 'sakura';
      }
      if (!pick) pick = affordable[Math.floor(Math.random() * affordable.length)];
      const front = threat.y;
      spot = {
        x: clamp(threat.x + rand(-44, 44), 140, 460),
        y: clamp(front + rand(18, 62), 130, 334)
      };
      if (pick === 'yuki' || pick === 'hana') {
        spot.y = clamp(front + rand(52, 84), 150, 340);
        spot.x = clamp(threat.x + rand(-20, 20), 180, 420);
      }
    } else {
      const ready = this.enemyMana >= (this.overtime ? Math.min(d.save, 5) : d.save) || this.enemyMana >= 9;
      if (!ready) return;
      const weights = { sakura: .34, yuki: .24, hana: .14, kuro: .28 };
      if (this.difficulty === 'hard') { weights.kuro += .12; weights.sakura += .04; weights.hana -= .04; }
      let roll = Math.random();
      for (const id of CARD_ORDER) {
        if (!affordable.includes(id)) continue;
        roll -= weights[id] || 0;
        if (roll <= 0) { pick = id; break; }
      }
      if (!pick) pick = affordable[0];
      if (pick === 'hana' && this.enemyMana < 8 && !this.units.some(u => u.team === 1 && !u.dead)) {
        pick = affordable.find(id => id !== 'hana') || 'hana';
      }
      spot = {
        x: clamp(300 + rand(-52, 52), 230, 370),
        y: rand(284, 338)
      };
    }

    if (!pick) return;
    const res = this.playCard(pick, spot.x, spot.y, 1);
    if (res.ok) {
      this.aiGlobal = rand(.55, 1.05);
      this.aiTimer = d.think;
    }
  }

  /* ---------------------------------------------------------------- */
  /* effects                                                          */
  /* ---------------------------------------------------------------- */
  addEffect(type, props = {}) {
    this.effects.push({ type, age: 0, life: .5, ...props });
    if (this.effects.length > 240) this.effects.splice(0, 30);
  }

  updateEffects(dt) {
    for (const e of this.effects) e.age += dt;
    this.effects = this.effects.filter(e => e.age < e.life);
  }

  /* ---------------------------------------------------------------- */
  /* helpers for UI / render                                          */
  /* ---------------------------------------------------------------- */
  kingOf(team) {
    return this.towers.find(t => t.team === team && t.kind === 'king');
  }

  enemyPrincesses(team) {
    return this.towers.filter(t => t.team === 1 - team && t.kind === 'princess' && !t.destroyed).length;
  }

  clockString() {
    const t = Math.max(0, this.matchTime);
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}

export { WORLD, RIVER, BRIDGE, TEAMS, MANA };
