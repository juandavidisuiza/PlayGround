/* Sakura Clash — core simulation: heroines, mana, combat, AI, towers. */
(function () {
  'use strict';

  const G = (window.Game = window.Game || {});
  const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  const dist = function (a, b) { return Math.hypot(a.x - b.x, a.y - b.y); };
  const TAU = Math.PI * 2;

  G.W = 400;
  G.L = null;
  G.state = 'menu';
  G.units = [];
  G.projectiles = [];
  G.particles = [];
  G.ambient = [];
  G.towers = [];
  G.tower = { player: {}, enemy: {} };
  G.selected = null;
  G.pointer = null;
  G.shake = 0;
  G.time = 0;
  G.mana = 5;
  G.aiMana = 5;
  G.timeLeft = 180;
  G.overtime = false;
  G.crowns = { player: 0, enemy: 0 };
  G.winner = null;
  G.stats = { damage: 0, summoned: 0, towers: 0, perCard: {} };
  G.resultShown = false;
  G.pendingResult = 0;
  G.drag = null;
  G.doubleAnnounced = false;
  G.overtimeAnnounced = false;
  G.countdown = 0;
  G.lastCountdown = 4;
  G.aiThink = 2;
  G.aiPlan = 0;
  G.guideSeen = false;

  /* ------------------------------------------------------------------ */
  /*  HEROINES                                                          */
  /* ------------------------------------------------------------------ */

  const CARDS = [
    {
      id: 'sakura', name: 'Sakura', title: 'Blade Dancer', role: 'RUSH', cost: 2,
      hp: 460, dmg: 56, atkCd: 0.55, speed: 100, range: 25, radius: 11,
      color: '#ff6fa5', desc: 'A cheap, blindingly fast duelist.',
      art: {
        style: 'sakura', hair: '#ffa7cb', hairDark: '#e36397', hairLight: '#ffd9e8',
        eye: '#e98a3f', eyeDark: '#a84d21', eyeLight: '#ffcf7a', lash: '#4a2035',
        skin: '#ffe2d2', skinShade: '#f2b9a5', outfit: '#fff4f8', outfitDark: '#f4bfd1',
        accent: '#ff4f8f', ribbon: '#d92f69', bg1: '#7a2b58', bg2: '#231127',
        bgGlow: 'rgba(255,167,203,0.24)'
      }
    },
    {
      id: 'yumi', name: 'Yumi', title: 'Star Archer', role: 'RANGED', cost: 3,
      hp: 300, dmg: 52, atkCd: 0.95, speed: 58, range: 100, radius: 10.5,
      projectile: 'arrow', color: '#9484ff', desc: 'Arrows from the far side of the lane.',
      art: {
        style: 'yumi', hair: '#a79bff', hairDark: '#6b58c9', hairLight: '#dfd8ff',
        eye: '#7a5cff', eyeDark: '#3d2b9e', eyeLight: '#c2b6ff', lash: '#31204f',
        skin: '#ffe2d2', skinShade: '#f0b9a8', outfit: '#2b3868', outfitDark: '#1b2448',
        accent: '#ffd36e', bg1: '#3a2f78', bg2: '#141026', bgGlow: 'rgba(164,148,255,0.24)'
      }
    },
    {
      id: 'hana', name: 'Hana', title: 'Bloom Healer', role: 'HEALER', cost: 4,
      hp: 420, dmg: 24, atkCd: 1.0, speed: 60, range: 92, radius: 11,
      projectile: 'petal', color: '#74e0ad',
      heal: { amount: 30, radius: 92, cd: 1.1 },
      desc: 'Mends every ally close to her, every second.',
      art: {
        style: 'hana', hair: '#f7d99a', hairDark: '#d9a85e', hairLight: '#fff0c2',
        eye: '#3fbf8f', eyeDark: '#1c7e5b', eyeLight: '#8ef0c7', lash: '#4e3a2b',
        skin: '#ffe5d6', skinShade: '#f0bda8', outfit: '#e3f8ec', outfitDark: '#9ed8b9',
        accent: '#ff9fc4', bg1: '#2c6d57', bg2: '#0f2923', bgGlow: 'rgba(140,240,190,0.22)'
      }
    },
    {
      id: 'kaede', name: 'Kaede', title: 'Iron Guardian', role: 'TANK', cost: 5,
      hp: 1300, dmg: 80, atkCd: 1.7, speed: 42, range: 30, radius: 14,
      armor: 0.7, color: '#ff8a5c', desc: 'A wall of armor. Takes 30% less damage.',
      art: {
        style: 'kaede', hair: '#7a3d52', hairDark: '#3c1c2c', hairLight: '#c06b7e',
        eye: '#ff5d4e', eyeDark: '#a51f2b', eyeLight: '#ffa08a', lash: '#2d1420',
        skin: '#ffe0cf', skinShade: '#efb49f', outfit: '#352333', outfitDark: '#241521',
        accent: '#ffc45e', bg1: '#6d2434', bg2: '#1b0d16', bgGlow: 'rgba(255,130,100,0.2)'
      }
    }
  ];
  CARDS.forEach(function (c, i) { c.index = i; });
  G.cards = CARDS;

  const TOWER_STATS = {
    princess: { hp: 1500, dmg: 54, atkCd: 0.8, range: 122 },
    queen: { hp: 2400, dmg: 68, atkCd: 0.9, range: 132 }
  };

  /* ------------------------------------------------------------------ */
  /*  SOUND (tiny WebAudio synth, no assets)                            */
  /* ------------------------------------------------------------------ */

  const Sound = {
    enabled: true,
    ctx: null,
    init: function () {
      if (!this.ctx) {
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) this.ctx = new AC();
        } catch (e) { this.ctx = null; }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    tone: function (freq, dur, type, vol, endFreq, delay) {
      if (!this.ctx) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      if (endFreq) o.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.04, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.03);
    },
    play: function (name) {
      if (!this.enabled || !this.ctx) return;
      const T = this.tone.bind(this);
      switch (name) {
        case 'select': T(760, 0.06, 'triangle', 0.05, 980); break;
        case 'deploy':
          T(520, 0.16, 'sine', 0.07, 920);
          T(900, 0.09, 'triangle', 0.035, 1200, 0.03);
          break;
        case 'deny': T(190, 0.12, 'square', 0.045, 120); break;
        case 'hit': T(165, 0.06, 'square', 0.035, 90); break;
        case 'heavy': T(115, 0.16, 'sawtooth', 0.055, 55); break;
        case 'arrow': T(1050, 0.06, 'triangle', 0.03, 620); break;
        case 'petal': T(700, 0.09, 'sine', 0.03, 1040); break;
        case 'heal':
          T(780, 0.12, 'sine', 0.032);
          T(1080, 0.16, 'sine', 0.028, 1320, 0.06);
          break;
        case 'towerShot': T(430, 0.07, 'triangle', 0.025, 760); break;
        case 'tower':
          T(95, 0.5, 'sawtooth', 0.09, 38);
          T(190, 0.32, 'square', 0.04, 60, 0.05);
          break;
        case 'crown':
          T(880, 0.12, 'triangle', 0.05);
          T(1180, 0.22, 'sine', 0.045, 1520, 0.09);
          break;
        case 'victory':
          [523, 659, 784, 1047].forEach(function (f, i) {
            T(f, 0.24, 'triangle', 0.05, f, i * 0.13);
          });
          break;
        case 'defeat':
          [392, 330, 262].forEach(function (f, i) {
            T(f, 0.28, 'sine', 0.045, f * 0.92, i * 0.17);
          });
          break;
        case 'start':
          T(440, 0.14, 'triangle', 0.05, 880);
          T(660, 0.18, 'sine', 0.045, 990, 0.1);
          break;
        case 'fight':
          T(330, 0.1, 'sawtooth', 0.05, 660);
          T(990, 0.24, 'triangle', 0.055, 1320, 0.06);
          break;
        case 'pop': T(320, 0.09, 'triangle', 0.035, 180); break;
        case 'crackle': T(240, 0.1, 'square', 0.025, 160); break;
      }
    }
  };
  G.playSound = function (name) { Sound.play(name); };
  G.soundEnabled = function () { return Sound.enabled; };
  G.setSoundEnabled = function (on) {
    Sound.enabled = !!on;
    if (on) Sound.init();
  };

  /* ------------------------------------------------------------------ */
  /*  LAYOUT                                                            */
  /* ------------------------------------------------------------------ */

  G.layout = function (cssW, cssH, dpr) {
    if (!cssW || !cssH) return;
    const scale = cssW / G.W;
    const H = cssH / scale;
    const L = G.layoutData || {};
    L.W = G.W;
    L.H = H;
    L.cx = G.W / 2;
    L.pathW = 154;
    L.bridgeL = L.cx - 58;
    L.bridgeR = L.cx + 58;
    L.riverTop = H * 0.46;
    L.riverBottom = H * 0.54;
    L.queenR = 31;
    L.princessR = 25;
    const ts = clamp(H / 700, 0.5, 0.88);
    G.towerScale = ts;
    G.unitScale = clamp(ts / 0.88, 0.6, 1);
    const towerGap = Math.max(72, 31 * 3.4 * ts + 20);
    L.enQueenY = Math.max(31 * 3.4 * ts + 7, H * 0.14);
    L.enPrincessY = Math.min(L.enQueenY + towerGap, L.riverTop - 26);
    L.plQueenY = H - 34;
    L.plPrincessY = L.plQueenY - towerGap;
    G.layoutData = L;
    G.L = L;
    G.cssW = cssW;
    G.cssH = cssH;
    G.scale = scale;
    G.dpr = dpr;
    G.renderScale = scale * dpr;

    if (G.tower.player.queen) {
      G.tower.player.queen.y = L.plQueenY;
      G.tower.player.princess.y = L.plPrincessY;
      G.tower.enemy.queen.y = L.enQueenY;
      G.tower.enemy.princess.y = L.enPrincessY;
      G.towers.forEach(function (t) { t.x = L.cx; });
    }
    G.resetAmbient(true);
  };

  function makeTower(team, type) {
    const L = G.L;
    const stats = TOWER_STATS[type];
    const r = type === 'queen' ? L.queenR : L.princessR;
    const y = type === 'queen'
      ? (team === 'player' ? L.plQueenY : L.enQueenY)
      : (team === 'player' ? L.plPrincessY : L.enPrincessY);
    return {
      kind: 'tower', team: team, type: type, x: L.cx, y: y, r: r,
      maxHp: stats.hp, hp: stats.hp, dmg: stats.dmg,
      atkCd: stats.atkCd, range: stats.range, cd: 0,
      alive: true, flash: 0, active: type !== 'queen',
      seed: (type === 'queen' ? 31 : 17) + (team === 'enemy' ? 3 : 0)
    };
  }

  G.resetBoard = function () {
    if (!G.L) return;
    G.units.length = 0;
    G.projectiles.length = 0;
    G.particles.length = 0;
    G.ambient.length = 0;
    G.towers.length = 0;
    G.state = 'menu';
    G.time = 0;
    G.mana = 5;
    G.aiMana = 5;
    G.timeLeft = 180;
    G.overtime = false;
    G.crowns = { player: 0, enemy: 0 };
    G.winner = null;
    G.resultReason = null;
    G.resultShown = false;
    G.pendingResult = 0;
    G.selected = null;
    G.pointer = null;
    G.drag = null;
    G.shake = 0;
    G.doubleAnnounced = false;
    G.overtimeAnnounced = false;
    G.aiThink = 2;
    G.aiPlan = 0;
    G.countdown = 0;
    G.lastCountdown = 4;
    G.guideSeen = false;
    G.stats = { damage: 0, summoned: 0, towers: 0, perCard: {} };
    CARDS.forEach(function (c) { G.stats.perCard[c.id] = 0; });

    G.tower = { player: {}, enemy: {} };
    const pq = makeTower('player', 'queen');
    const pp = makeTower('player', 'princess');
    const eq = makeTower('enemy', 'queen');
    const ep = makeTower('enemy', 'princess');
    G.tower.player = { queen: pq, princess: pp };
    G.tower.enemy = { queen: eq, princess: ep };
    G.towers.push(eq, ep, pq, pp);
    G.resetAmbient(true);
  };

  /* ------------------------------------------------------------------ */
  /*  DEPLOYMENT                                                        */
  /* ------------------------------------------------------------------ */

  G.canDeploy = function (x, y) {
    const L = G.L;
    if (!L) return false;
    if (x < 16 || x > L.W - 16) return false;
    if (y < L.riverBottom + 12 || y > L.H - 16) return false;
    const towers = [G.tower.player.queen, G.tower.player.princess];
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      if (t.alive && dist({ x: x, y: y }, t) < t.r + 21) return false;
    }
    return true;
  };

  function canEnemyDeploy(x, y) {
    const L = G.L;
    if (!L) return false;
    if (x < 16 || x > L.W - 16) return false;
    if (y < 18 || y > L.riverTop - 14) return false;
    const towers = [G.tower.enemy.queen, G.tower.enemy.princess];
    for (let i = 0; i < towers.length; i++) {
      const t = towers[i];
      if (t.alive && dist({ x: x, y: y }, t) < t.r + 21) return false;
    }
    return true;
  }

  function makeUnit(card, team, x, y) {
    return {
      kind: 'unit', card: card, team: team, x: x, y: y,
      hp: card.hp, maxHp: card.hp, radius: card.radius,
      deploy: 0.9, appear: 0, alive: true,
      target: null, retarget: 0, atkCd: 0.15 + Math.random() * 0.2,
      healCd: 0.55, attackAnim: 0, flash: 0,
      moving: false, walkPhase: Math.random() * TAU, seed: Math.random() * TAU,
      speed: card.speed * (0.96 + Math.random() * 0.08)
    };
  }

  G.deployCard = function (card, team, x, y) {
    if (G.state !== 'playing' || !card) return false;
    if (team === 'player') {
      if (G.mana + 0.001 < card.cost) { if (G.toast) G.toast('NOT ENOUGH MANA'); return false; }
      if (!G.canDeploy(x, y)) { if (G.toast) G.toast('SUMMON IN YOUR HALF'); return false; }
      G.mana -= card.cost;
      G.stats.summoned++;
      G.stats.perCard[card.id] = (G.stats.perCard[card.id] || 0);
      G.selected = null;
      G.pointer = null;
      G.guideSeen = true;
      if (G.hideHint) G.hideHint();
    } else {
      if (G.aiMana + 0.001 < card.cost) return false;
      if (!canEnemyDeploy(x, y)) return false;
      G.aiMana -= card.cost;
    }
    const u = makeUnit(card, team, x, y);
    G.units.push(u);
    const col = team === 'player' ? '#6fe8ff' : '#ff7c9f';
    addRing(x, y, 8, 30, col, 0.5, 2);
    burst(x, y, team === 'player' ? '#9ff6ff' : '#ffb1c8', 8, 34, 2.4);
    G.playSound('deploy');
    if (team === 'enemy' && card.cost >= 4 && G.toast) G.toast('HOSHINO SUMMONS ' + card.name.toUpperCase() + '!', true);
    return true;
  };

  G.deployById = function (id, team, x, y) {
    const card = CARDS.find(function (c) { return c.id === id; });
    return card ? G.deployCard(card, team, x, y) : false;
  };

  /* ------------------------------------------------------------------ */
  /*  COMBAT                                                            */
  /* ------------------------------------------------------------------ */

  function navGoal(u) {
    const t = u.target;
    const L = G.L;
    let gx = t.x;
    let gy = t.y;
    if (t.kind === 'tower') gy = t.y;
    const inRiver = u.y >= L.riverTop && u.y <= L.riverBottom;
    const crosses = (u.y < L.riverTop && t.y > L.riverBottom) || (u.y > L.riverBottom && t.y < L.riverTop);
    if ((crosses || inRiver) && (u.x < L.bridgeL + 3 || u.x > L.bridgeR - 3)) {
      const bankY = u.y < (L.riverTop + L.riverBottom) / 2 ? L.riverTop - 9 : L.riverBottom + 9;
      return { x: L.cx, y: bankY };
    }
    if (inRiver) gx = clamp(u.x, L.bridgeL + 9, L.bridgeR - 9);
    return { x: gx, y: gy };
  }

  function acquireTarget(u) {
    const aggro = Math.max(132, u.card.range + 56);
    let best = null;
    let bestD = aggro;
    for (let i = 0; i < G.units.length; i++) {
      const e = G.units[i];
      if (!e.alive || e.team === u.team) continue;
      const d = dist(u, e);
      if (d < bestD) { bestD = d; best = e; }
    }
    if (best) return best;
    let tower = null;
    let td = Infinity;
    for (let i = 0; i < G.towers.length; i++) {
      const t = G.towers[i];
      if (!t.alive || t.team === u.team) continue;
      const d = dist(u, t);
      if (d < td) { td = d; tower = t; }
    }
    return tower;
  }

  function updateUnits(dt) {
    const L = G.L;
    for (let i = 0; i < G.units.length; i++) {
      const u = G.units[i];
      if (!u.alive) continue;
      u.attackAnim = Math.max(0, u.attackAnim - dt);
      u.flash = Math.max(0, u.flash - dt);
      u.atkCd = Math.max(0, u.atkCd - dt);

      if (u.deploy > 0) {
        u.deploy -= dt;
        u.appear = clamp(1 - u.deploy / 0.9, 0, 1);
        if (u.deploy <= 0) {
          u.deploy = 0;
          u.appear = 1;
          u.retarget = 0;
          addRing(u.x, u.y, 6, 26, u.team === 'player' ? '#9ff6ff' : '#ffb1c8', 0.4, 1.6);
        }
        continue;
      }

      if (u.card.heal) {
        u.healCd -= dt;
        if (u.healCd <= 0) {
          u.healCd = u.card.heal.cd;
          healAllies(u);
        }
      }

      u.retarget -= dt;
      if (!u.target || !u.target.alive || u.retarget <= 0) {
        u.target = acquireTarget(u);
        u.retarget = 0.28 + Math.random() * 0.1;
      }
      const t = u.target;
      if (!t) { u.moving = false; continue; }

      const d = dist(u, t);
      const reach = u.card.range + (t.kind === 'unit' ? t.radius * 0.85 : t.r * 0.82);
      if (d <= reach) {
        u.moving = false;
        if (u.atkCd <= 0) attackUnit(u, t);
      } else {
        const goal = navGoal(u);
        let dx = goal.x - u.x;
        let dy = goal.y - u.y;
        const gd = Math.hypot(dx, dy);
        if (gd > 0.4) {
          const step = Math.min(gd, u.speed * dt);
          u.x += (dx / gd) * step;
          u.y += (dy / gd) * step;
          u.moving = true;
          u.walkPhase += dt * (u.card.speed * 0.16 + 3);
        } else {
          u.moving = false;
        }
      }

      if (u.y > L.riverTop && u.y < L.riverBottom) {
        u.x = clamp(u.x, L.bridgeL + 9, L.bridgeR - 9);
      }
    }

    /* soft separation so squads fan out instead of stacking */
    for (let i = 0; i < G.units.length; i++) {
      const a = G.units[i];
      if (!a.alive || a.deploy > 0) continue;
      for (let j = i + 1; j < G.units.length; j++) {
        const b = G.units[j];
        if (!b.alive || b.deploy > 0) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const min = (a.radius + b.radius) * 0.82;
        if (d > 0.01 && d < min) {
          const push = (min - d) * 0.5;
          const nx = dx / d;
          const ny = dy / d;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
        }
      }
      a.x = clamp(a.x, 12, L.W - 12);
      a.y = clamp(a.y, 12, L.H - 8);
    }

    for (let i = G.units.length - 1; i >= 0; i--) {
      if (!G.units[i].alive) G.units.splice(i, 1);
    }
  }

  function attackUnit(u, t) {
    u.atkCd = u.card.atkCd;
    u.attackAnim = 0.3;
    if (u.card.projectile) {
      spawnProjectile(
        u.x, u.y - 24, t, u.card.projectile, u.card.color,
        u.card.id === 'yumi' ? 540 : 420, u.card.dmg, u.team, u
      );
      G.playSound(u.card.id === 'yumi' ? 'arrow' : 'petal');
    } else {
      dealDamage(t, u.card.dmg, u);
      addSlash(t.x, t.y - (t.kind === 'unit' ? 24 : t.r * 0.8), u.card.color, u.team);
      G.playSound(u.card.id === 'kaede' ? 'heavy' : 'hit');
      burst(t.x, t.y - 20, u.card.color, 3, 30, 1.5);
    }
  }

  function healAllies(u) {
    const heal = u.card.heal;
    let healed = 0;
    for (let i = 0; i < G.units.length; i++) {
      const a = G.units[i];
      if (!a.alive || a.team !== u.team || a.deploy > 0.4) continue;
      if (a.hp >= a.maxHp) continue;
      if (dist(u, a) > heal.radius) continue;
      a.hp = Math.min(a.maxHp, a.hp + heal.amount);
      healed++;
      if (Math.random() < 0.35) addText(a.x, a.y - 34, '+' + heal.amount, '#9fffca', 9);
    }
    if (healed) {
      addRing(u.x, u.y - 18, 12, heal.radius, '#8bf0bb', 0.55, 1.6);
      burst(u.x, u.y - 24, '#b7ffd5', 5, 26, 1.4);
      if (Math.random() < 0.5) G.playSound('heal');
    }
  }

  function spawnProjectile(x, y, target, kind, color, speed, dmg, team, sourceUnit) {
    G.projectiles.push({
      x: x, y: y, target: target, kind: kind, color: color,
      speed: speed, dmg: dmg, team: team, source: sourceUnit || null,
      life: 2.6, vx: 0, vy: -1, seed: Math.random() * TAU
    });
  }

  function updateProjectiles(dt) {
    for (let i = G.projectiles.length - 1; i >= 0; i--) {
      const p = G.projectiles[i];
      p.life -= dt;
      if (!p.target || !p.target.alive || p.target.hp <= 0 || p.life <= 0) {
        G.projectiles.splice(i, 1);
        continue;
      }
      const tx = p.target.x;
      const ty = p.target.y - (p.target.kind === 'unit' ? 23 : p.target.r * 0.85);
      const dx = tx - p.x;
      const dy = ty - p.y;
      const d = Math.hypot(dx, dy);
      const step = p.speed * dt;
      if (d <= step + 7) {
        dealDamage(p.target, p.dmg, p.source);
        burst(tx, ty, p.color, 4, 40, 1.8);
        G.projectiles.splice(i, 1);
      } else {
        p.vx = dx / d;
        p.vy = dy / d;
        p.x += p.vx * step;
        p.y += p.vy * step;
      }
    }
  }

  function dealDamage(target, amount, source) {
    if (!target || !target.alive || target.hp <= 0) return;
    let amt = amount;
    if (target.kind === 'unit' && target.card.armor) amt *= target.card.armor;
    target.hp -= amt;
    target.flash = 0.12;

    if (source && source.team === 'player' && target.team === 'enemy') {
      G.stats.damage += amt;
      G.stats.perCard[source.card.id] = (G.stats.perCard[source.card.id] || 0) + amt;
    }

    if (target.kind === 'unit') {
      if (Math.random() < 0.5 && amt >= 1) {
        addText(target.x + (Math.random() - 0.5) * 8, target.y - 36, Math.round(amt), '#fff3f8', 9);
      }
      if (target.hp <= 0) killUnit(target);
    } else {
      if (target.type === 'queen' && !target.active) {
        target.active = true;
        addRing(target.x, target.y, 10, target.r * 2.6, '#ffe6a6', 0.6, 2);
      }
      addText(
        target.x + (Math.random() - 0.5) * 18,
        target.y - target.r * 2.2,
        Math.round(amt),
        source && source.team === 'player' ? '#ffffff' : '#ffd7e1',
        11
      );
      if (target.hp <= 0) destroyTower(target, source ? source.team : null);
    }
  }

  function killUnit(u) {
    u.alive = false;
    u.hp = 0;
    const col = u.team === 'player' ? '#8ff0ff' : '#ffaac0';
    burst(u.x, u.y - 22, col, 12, 55, 2.4);
    addRing(u.x, u.y, 2, 24, col, 0.35, 1.2);
    G.playSound('pop');
  }

  function destroyTower(t, attacker) {
    t.alive = false;
    t.hp = 0;
    G.shake = 9;
    const col = t.team === 'player' ? '#8ff0ff' : '#ff9cb8';
    burst(t.x, t.y - t.r * 1.2, col, 26, 110, 3.2);
    burst(t.x, t.y - t.r * 1.2, '#ffe2b8', 12, 80, 2.4);
    addRing(t.x, t.y, 8, t.r * 3.2, '#ffd36e', 0.8, 3);
    for (let i = 0; i < 7; i++) {
      addSmoke(t.x + (Math.random() - 0.5) * t.r * 2, t.y - t.r * (0.3 + Math.random()), 10 + Math.random() * 8);
    }
    G.playSound('tower');

    if (t.type === 'queen') {
      if (attacker) G.crowns[attacker] = 3;
      if (attacker === 'player') G.stats.towers++;
      finish(attacker || (t.team === 'player' ? 'enemy' : 'player'), 'queen');
      return;
    }

    if (attacker) G.crowns[attacker] = Math.min(3, G.crowns[attacker] + 1);
    const owner = t.team;
    const queen = G.tower[owner] && G.tower[owner].queen;
    if (queen && queen.alive) {
      queen.active = true;
      addRing(queen.x, queen.y, 10, queen.r * 2.8, '#ffe6a6', 0.6, 2);
    }
    if (attacker === 'player') G.stats.towers++;
    G.playSound('crown');

    if (G.overtime) {
      if (G.announce) G.announce('SUDDEN DEATH!', true);
      finish(attacker || 'draw', 'sudden');
      return;
    }
    if (attacker === 'player') {
      if (G.announce) G.announce('ENEMY PRINCESS DOWN!', true);
    } else if (attacker === 'enemy') {
      if (G.announce) G.announce('YOUR PRINCESS FELL!', false);
    }
  }

  function updateTowers(dt) {
    for (let i = 0; i < G.towers.length; i++) {
      const t = G.towers[i];
      if (!t.alive) continue;
      t.flash = Math.max(0, t.flash - dt);
      if (t.type === 'queen' && !t.active) continue;
      t.cd = Math.max(0, t.cd - dt);
      if (t.cd > 0) continue;
      let target = null;
      let bestD = t.range;
      for (let j = 0; j < G.units.length; j++) {
        const u = G.units[j];
        if (!u.alive || u.team === t.team || u.deploy > 0) continue;
        const d = dist(u, t);
        if (d < bestD) { bestD = d; target = u; }
      }
      if (target) {
        t.cd = t.atkCd;
        spawnProjectile(
          t.x, t.y - t.r * 1.15, target, 'bolt',
          t.team === 'player' ? '#69e6ff' : '#ff8aa6',
          t.team === 'player' ? 500 : 470, t.dmg, t.team, null
        );
        G.playSound('towerShot');
        burst(t.x, t.y - t.r * 1.15, t.team === 'player' ? '#aef7ff' : '#ffc3d2', 2, 22, 1.2);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  AI                                                                */
  /* ------------------------------------------------------------------ */

  function updateAI(dt) {
    if (G.state !== 'playing') return;
    const rate = G.isDoubleMana() ? 1 / 1.2 : 1 / 2.4;
    G.aiMana = Math.min(10, G.aiMana + dt * rate);
    G.aiThink -= dt;
    if (G.aiThink > 0) return;

    const L = G.L;
    const threats = G.units.filter(function (u) {
      return u.team === 'player' && u.alive && u.deploy <= 0 && u.y < L.riverTop + 62;
    });
    const urgent = threats.length > 0;
    G.aiThink = urgent ? 0.55 + Math.random() * 0.5 : 0.9 + Math.random() * 0.85;

    let pool;
    if (urgent) {
      const ids = threats.map(function (u) { return u.card.id; });
      if (ids.indexOf('kaede') >= 0) pool = ['yumi', 'hana', 'kaede', 'yumi'];
      else if (threats.length >= 2) pool = ['yumi', 'hana', 'kaede'];
      else pool = ['sakura', 'yumi', 'hana'];
    } else {
      if (G.aiMana >= 8) pool = ['kaede', 'hana', 'yumi', 'kaede'];
      else if (G.aiMana >= 5) pool = ['yumi', 'kaede', 'sakura'];
      else if (G.aiMana >= 3) pool = ['sakura', 'yumi'];
      else return;
      if (Math.random() < 0.22) return;
    }

    let card = null;
    for (let i = 0; i < pool.length; i++) {
      const c = CARDS.find(function (x) { return x.id === pool[i]; });
      if (c && G.aiMana >= c.cost) { card = c; break; }
    }
    if (!card) {
      const affordable = CARDS.filter(function (c) { return c.cost <= G.aiMana; });
      if (!affordable.length) return;
      card = affordable[Math.floor(Math.random() * affordable.length)];
    }

    let y;
    if (urgent) {
      const lo = L.enPrincessY + 22;
      const hi = L.riverTop - 34;
      y = lo < hi ? lo + Math.random() * (hi - lo) : (lo + hi) / 2;
    } else {
      const lo = L.enQueenY + 56;
      const hi = L.enPrincessY - 18;
      y = lo < hi ? lo + Math.random() * (hi - lo) : L.enPrincessY - 20;
    }
    let x = L.cx + (Math.random() - 0.5) * 92;
    x = clamp(x, 30, L.W - 30);
    if (!canEnemyDeploy(x, y)) {
      x = L.cx + (Math.random() - 0.5) * 40;
      y = clamp(y, 26, L.riverTop - 20);
    }
    if (canEnemyDeploy(x, y)) G.deployCard(card, 'enemy', x, y);
  }

  /* ------------------------------------------------------------------ */
  /*  MATCH TIMER / UPDATE                                              */
  /* ------------------------------------------------------------------ */

  G.isDoubleMana = function () {
    return G.overtime || G.timeLeft <= 60;
  };

  function finish(winner, reason) {
    if (G.state === 'ended') return;
    G.state = 'ended';
    G.winner = winner;
    G.resultReason = reason || 'queen';
    G.pendingResult = 1.15;
    G.resultShown = false;
    G.selected = null;
    G.pointer = null;
    G.playSound(winner === 'player' ? 'victory' : winner === 'enemy' ? 'defeat' : 'crown');
    if (G.onMatchEnd) G.onMatchEnd(winner, reason);
  }
  G.finish = finish;

  function handleTimeUp() {
    if (!G.overtime) {
      if (G.crowns.player !== G.crowns.enemy) {
        finish(G.crowns.player > G.crowns.enemy ? 'player' : 'enemy', 'time');
      } else {
        G.overtime = true;
        G.timeLeft = 60;
        G.overtimeAnnounced = true;
        if (G.announce) G.announce('OVERTIME!', true);
        G.playSound('crown');
      }
    } else {
      const p = G.tower.player.queen.hp + G.tower.player.princess.hp;
      const e = G.tower.enemy.queen.hp + G.tower.enemy.princess.hp;
      finish(p === e ? 'draw' : p > e ? 'player' : 'enemy', 'hp');
    }
  }

  G.update = function (dt) {
    G.time += dt;
    updateParticles(dt);
    updateAmbient(dt);
    G.shake = Math.max(0, G.shake - dt * 24);

    if (G.state === 'countdown') {
      G.countdown -= dt;
      const n = Math.ceil(G.countdown);
      if (n !== G.lastCountdown) {
        G.lastCountdown = n;
        if (n > 0) G.showCountdown(String(n));
      }
      if (G.countdown <= 0) {
        G.state = 'playing';
        G.showCountdown('FIGHT!', true);
        G.playSound('fight');
        G.aiThink = 1.4;
      }
      return;
    }

    if (G.state === 'playing') {
      const rate = G.isDoubleMana() ? 1 / 1.2 : 1 / 2.4;
      G.mana = Math.min(10, G.mana + dt * rate);
      G.timeLeft -= dt;

      if (!G.doubleAnnounced && !G.overtime && G.timeLeft <= 60) {
        G.doubleAnnounced = true;
        if (G.announce) G.announce('DOUBLE MANA!', true);
        G.playSound('crown');
      }
      if (G.timeLeft <= 0) {
        handleTimeUp();
        if (G.state !== 'playing') return;
      }

      updateAI(dt);
      updateUnits(dt);
      updateTowers(dt);
      updateProjectiles(dt);
      G.units = G.units.filter(function (u) { return u.alive; });
      return;
    }

    if (G.state === 'ended') {
      G.pendingResult -= dt;
      if (G.pendingResult <= 0 && !G.resultShown) {
        G.resultShown = true;
        if (G.showResult) G.showResult();
      }
      updateProjectiles(dt);
      return;
    }
  };

  /* ------------------------------------------------------------------ */
  /*  FX / AMBIENT                                                      */
  /* ------------------------------------------------------------------ */

  function addText(x, y, text, color, size) {
    G.particles.push({
      kind: 'text', x: x, y: y, vy: -26, life: 0.85, maxLife: 0.85,
      text: String(text), color: color || '#fff', size: size || 10
    });
  }
  G.addText = addText;

  function burst(x, y, color, n, speed, size) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const v = speed * (0.35 + Math.random() * 0.75);
      G.particles.push({
        kind: 'petal', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 18,
        rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 9,
        size: (size || 2) * (0.6 + Math.random() * 0.8),
        life: 0.5 + Math.random() * 0.5, maxLife: 1, color: color,
        gravity: 60 + Math.random() * 40
      });
    }
  }
  G.burst = burst;

  function addRing(x, y, r0, r1, color, life, width) {
    G.particles.push({
      kind: 'ring', x: x, y: y, r0: r0, r1: r1, color: color,
      life: life || 0.45, maxLife: life || 0.45, width: width || 2
    });
  }
  G.addRing = addRing;

  function addSmoke(x, y, size) {
    G.particles.push({
      kind: 'smoke', x: x, y: y, vx: (Math.random() - 0.5) * 14, vy: -10 - Math.random() * 15,
      size: size, life: 1.4, maxLife: 1.4, color: 'rgba(90, 74, 92, 0.5)'
    });
  }
  G.addSmoke = addSmoke;

  function addSlash(x, y, color, team) {
    G.particles.push({
      kind: 'slash', x: x, y: y, rot: (Math.random() - 0.5) * 0.8,
      color: color, life: 0.2, maxLife: 0.2, team: team
    });
  }
  G.addSlash = addSlash;

  function updateParticles(dt) {
    for (let i = G.particles.length - 1; i >= 0; i--) {
      const p = G.particles[i];
      p.life -= dt;
      if (p.life <= 0) { G.particles.splice(i, 1); continue; }
      if (p.kind === 'petal') {
        p.vy += (p.gravity || 60) * dt;
        p.vx *= 1 - 1.8 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
      } else if (p.kind === 'text') {
        p.y += p.vy * dt;
        p.vy *= 1 - 1.2 * dt;
      } else if (p.kind === 'smoke') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.size += dt * 10;
      }
    }
  }
  G.updateParticles = updateParticles;

  G.resetAmbient = function (force) {
    const L = G.L;
    if (!L) return;
    if (!force && G.ambient.length) return;
    G.ambient.length = 0;
    for (let i = 0; i < 22; i++) {
      G.ambient.push({
        x: Math.random() * L.W,
        y: Math.random() * L.H,
        vy: 12 + Math.random() * 22,
        sway: 6 + Math.random() * 16,
        phase: Math.random() * TAU,
        rot: Math.random() * TAU,
        vr: (Math.random() - 0.5) * 2,
        size: 1.8 + Math.random() * 2.8,
        tone: Math.random()
      });
    }
  };

  function updateAmbient(dt) {
    const L = G.L;
    if (!L) return;
    for (let i = 0; i < G.ambient.length; i++) {
      const p = G.ambient[i];
      p.phase += dt * 0.8;
      p.y += p.vy * dt;
      p.x += Math.sin(p.phase) * p.sway * dt;
      p.rot += p.vr * dt;
      if (p.y > L.H + 8) {
        p.y = -8;
        p.x = Math.random() * L.W;
      }
      if (p.x < -8) p.x = L.W + 8;
      if (p.x > L.W + 8) p.x = -8;
    }
  }
  G.updateAmbient = updateAmbient;

  /* debug hooks used by the capture harness */
  G.debug = {
    state: function () {
      return {
        state: G.state, mana: G.mana, aiMana: G.aiMana, timeLeft: G.timeLeft,
        crowns: Object.assign({}, G.crowns), units: G.units.length,
        winner: G.winner, overtime: G.overtime
      };
    },
    skipCountdown: function () {
      if (G.state === 'countdown') {
        G.countdown = 0.001;
      }
    },
    setMana: function (v) { G.mana = v; },
    setTime: function (v) { G.timeLeft = v; },
    spawn: function (id, team, x, y) { return G.deployById(id, team, x, y); }
  };
})();
