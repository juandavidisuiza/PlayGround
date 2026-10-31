import { WORLD, ARENA, RIVER, BRIDGE, TEAMS, TOWER_STATS, DEPLOY } from './config.js';
import { CARDS } from './cards.js';
import { drawTower, drawUnit } from './sprites.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function rrect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = 0; this.h = 0;
    this.scale = 1; this.ox = 0; this.oy = 0;
    this.time = 0;
    this.selected = null;
    this.hover = null;
    this.shakeX = 0; this.shakeY = 0;
    this.decor = makeDecor();
    this.bgPetals = makeScreenPetals();
    this.bgCanvas = null;
    this.bgMargin = 30;
    this.resize();
    const ro = new ResizeObserver(() => this.resize());
    const stage = document.getElementById('stage');
    if (stage) ro.observe(stage);
    const dock = document.getElementById('dock');
    if (dock) ro.observe(dock);
    const top = document.getElementById('topbar');
    if (top) ro.observe(top);
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.w = w; this.h = h;
    const bw = Math.round(w * this.dpr), bh = Math.round(h * this.dpr);
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw; this.canvas.height = bh;
    }
    const dock = document.getElementById('dock');
    const top = document.getElementById('topbar');
    const dockH = dock && !dock.hidden ? dock.offsetHeight : 0;
    const topH = top && !top.hidden ? top.offsetHeight : 0;
    const padTop = topH ? topH + 4 : 6;
    const padBottom = dockH ? dockH + 2 : 6;
    const availH = Math.max(160, h - padTop - padBottom);
    const availW = Math.max(160, w - 12);
    this.scale = clamp(Math.min(availW / WORLD.w, availH / WORLD.h), .28, 1.05);
    this.ox = (w - WORLD.w * this.scale) / 2;
    this.oy = padTop + Math.max(0, (availH - WORLD.h * this.scale) / 2);
  }

  screenToWorld(cx, cy) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (cx - r.left - this.ox) / this.scale,
      y: (cy - r.top - this.oy) / this.scale
    };
  }

  draw(game, t) {
    this.time = t;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    drawSky(ctx, this.w, this.h, t);

    const sh = game.shake || 0;
    this.shakeX = (Math.random() - .5) * sh;
    this.shakeY = (Math.random() - .5) * sh;

    ctx.save();
    ctx.translate(this.ox + this.shakeX, this.oy + this.shakeY);
    ctx.scale(this.scale, this.scale);
    this.drawArena(ctx, game, t);
    ctx.restore();

    drawForegroundPetals(ctx, this.w, this.h, t, this.bgPetals);
  }

  /* -------------------------------------------------------------- */
  drawArena(ctx, game, t) {
    if (!this.bgCanvas) this.buildBackground();
    const m = this.bgMargin;
    ctx.drawImage(this.bgCanvas, -m, -m);

    ctx.save();
    rrect(ctx, ARENA.left, ARENA.top, ARENA.right - ARENA.left, ARENA.bottom - ARENA.top, 26);
    ctx.clip();

    this.drawDeployZone(ctx, game, t);
    this.drawTowerPads(ctx, game);
    this.drawRiverLife(ctx, t);
    this.drawArenaPetals(ctx, t);

    // buildings sit behind the maidens; towers sorted back-to-front
    const towers = game.towers.slice().sort((a, b) => a.y - b.y);
    for (const tw of towers) drawTower(ctx, tw, t, game.time);
    const units = game.units.slice().sort((a, b) => a.y - b.y);
    for (const u of units) drawUnit(ctx, u, t);

    this.drawProjectiles(ctx, game);
    this.drawHealthBars(ctx, game, t);
    this.drawEffects(ctx, game);
    this.drawGhost(ctx, game, t);

    // inner light + shade
    const lg = ctx.createRadialGradient(300, 300, 60, 300, 480, 620);
    lg.addColorStop(0, 'rgba(255,220,240,.08)');
    lg.addColorStop(1, 'rgba(20,8,34,.28)');
    ctx.fillStyle = lg;
    ctx.fillRect(ARENA.left, ARENA.top, ARENA.right - ARENA.left, ARENA.bottom - ARENA.top);

    ctx.restore();
  }

  /* Static scenery is baked once into an offscreen canvas. Only the live
     pieces (river highlights, petals, towers, units, effects) redraw. */
  buildBackground() {
    const m = this.bgMargin = 30;
    const c = document.createElement('canvas');
    c.width = WORLD.w + m * 2;
    c.height = WORLD.h + m * 2;
    const x = c.getContext('2d');
    x.translate(m, m);

    // drop shadow + frame
    x.save();
    x.shadowColor = 'rgba(0,0,0,.55)';
    x.shadowBlur = 26;
    x.shadowOffsetY = 10;
    rrect(x, ARENA.left, ARENA.top, ARENA.right - ARENA.left, ARENA.bottom - ARENA.top, 26);
    x.fillStyle = '#2c4a3a';
    x.fill();
    x.restore();

    x.save();
    rrect(x, ARENA.left, ARENA.top, ARENA.right - ARENA.left, ARENA.bottom - ARENA.top, 26);
    x.clip();

    this.drawGrass(x, 0);
    this.drawPath(x, 0);
    this.drawRiver(x, 0);
    this.drawBridge(x, 0);
    this.drawDecorStatic(x, 0);

    x.restore();

    // rim
    x.save();
    rrect(x, ARENA.left, ARENA.top, ARENA.right - ARENA.left, ARENA.bottom - ARENA.top, 26);
    x.strokeStyle = 'rgba(255,209,149,.55)';
    x.lineWidth = 3;
    x.stroke();
    rrect(x, ARENA.left + 5, ARENA.top + 5, ARENA.right - ARENA.left - 10, ARENA.bottom - ARENA.top - 10, 22);
    x.strokeStyle = 'rgba(80,40,60,.55)';
    x.lineWidth = 2;
    x.stroke();
    x.restore();

    this.bgCanvas = c;
  }

  drawGrass(ctx, t) {
    const g = ctx.createLinearGradient(0, ARENA.top, 0, ARENA.bottom);
    g.addColorStop(0, '#6fae73');
    g.addColorStop(.28, '#79b97d');
    g.addColorStop(.5, '#67a86f');
    g.addColorStop(.72, '#7cbb7d');
    g.addColorStop(1, '#5f9d66');
    ctx.fillStyle = g;
    ctx.fillRect(ARENA.left, ARENA.top, ARENA.right - ARENA.left, ARENA.bottom - ARENA.top);

    // mowing bands
    ctx.save();
    ctx.globalAlpha = .06;
    ctx.fillStyle = '#0d3a20';
    for (let y = ARENA.top; y < ARENA.bottom; y += 74) {
      ctx.fillRect(ARENA.left, y, ARENA.right - ARENA.left, 37);
    }
    ctx.restore();

    // soft blotches
    ctx.save();
    for (const b of this.decor.blotches) {
      ctx.globalAlpha = b.a;
      ctx.fillStyle = b.c;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.rx, b.ry, b.rot, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // tiny flowers + tufts
    for (const f of this.decor.flowers) {
      const sway = Math.sin(t * 1.4 + f.p) * .6;
      ctx.fillStyle = f.c;
      ctx.globalAlpha = .9;
      ctx.beginPath();
      ctx.arc(f.x + sway, f.y, f.r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffe9a8';
      ctx.beginPath();
      ctx.arc(f.x + sway, f.y, f.r * .38, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(32,88,50,.5)';
    ctx.lineWidth = 1.2;
    for (const gtuft of this.decor.tufts) {
      ctx.beginPath();
      ctx.moveTo(gtuft.x, gtuft.y);
      ctx.quadraticCurveTo(gtuft.x + 2, gtuft.y - 5, gtuft.x + 4, gtuft.y - 7);
      ctx.moveTo(gtuft.x + 2, gtuft.y);
      ctx.quadraticCurveTo(gtuft.x + 5, gtuft.y - 4, gtuft.x + 8, gtuft.y - 5);
      ctx.stroke();
    }
  }

  drawPath(ctx, t) {
    const x = 218, w = 164, y = ARENA.top + 2, h = ARENA.bottom - ARENA.top - 4;
    ctx.save();
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#b9a99a');
    g.addColorStop(.16, '#d8cbbd');
    g.addColorStop(.5, '#e4d8c9');
    g.addColorStop(.84, '#d2c3b4');
    g.addColorStop(1, '#b7a696');
    ctx.fillStyle = g;
    rrect(ctx, x, y, w, h, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(92,70,58,.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // flagstone lines
    ctx.save();
    ctx.globalAlpha = .28;
    ctx.strokeStyle = '#806b5c';
    ctx.lineWidth = 1;
    for (let yy = y + 26; yy < y + h; yy += 38) {
      ctx.beginPath();
      ctx.moveTo(x + 5, yy);
      ctx.lineTo(x + w - 5, yy);
      ctx.stroke();
    }
    for (let row = 0; row < 24; row++) {
      const yy = y + 26 + row * 38;
      const off = row % 2 ? 34 : 0;
      for (let xx = x + 22 + off; xx < x + w - 12; xx += 68) {
        ctx.beginPath();
        ctx.moveTo(xx, yy - 38);
        ctx.lineTo(xx, yy);
        ctx.stroke();
      }
    }
    ctx.restore();

    // speckles
    ctx.globalAlpha = .16;
    ctx.fillStyle = '#5f4a3c';
    for (const s of this.decor.stones) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // side trims
    ctx.save();
    ctx.strokeStyle = 'rgba(90,60,70,.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 40);
    ctx.lineTo(x + 2, y + h - 40);
    ctx.moveTo(x + w - 2, y + 40);
    ctx.lineTo(x + w - 2, y + h - 40);
    ctx.stroke();
    ctx.restore();
  }

  drawRiver(ctx, t) {
    const top = RIVER.top, h = RIVER.bottom - RIVER.top;
    ctx.save();
    rrect(ctx, ARENA.left - 4, top - 8, ARENA.right - ARENA.left + 8, h + 16, 18);
    const g = ctx.createLinearGradient(0, top, 0, top + h);
    g.addColorStop(0, '#2f7087');
    g.addColorStop(.28, '#3f9db4');
    g.addColorStop(.62, '#2c7f9c');
    g.addColorStop(1, '#1c5670');
    ctx.fillStyle = g;
    ctx.fill();

    // bank stones
    ctx.fillStyle = 'rgba(220,210,190,.35)';
    for (let x = ARENA.left + 8; x < ARENA.right - 8; x += 26) {
      ctx.beginPath();
      ctx.ellipse(x, top - 7 + Math.sin(x) * 1.5, 12, 4, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 12, top + h + 6 + Math.cos(x) * 1.5, 12, 4, 0, 0, TAU);
      ctx.fill();
    }

    // ripples
    ctx.strokeStyle = 'rgba(210,248,255,.34)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) {
      const yy = top + 12 + i * 8.5;
      ctx.beginPath();
      for (let x = ARENA.left; x <= ARENA.right; x += 10) {
        const wy = yy + Math.sin(x * .035 + t * 1.6 + i * .9) * 2.2;
        if (x === ARENA.left) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
      }
      ctx.globalAlpha = .24 + (i % 3) * .08;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  drawRiverLife(ctx, t) {
    const top = RIVER.top, h = RIVER.bottom - RIVER.top;
    ctx.save();
    // drifting highlights
    ctx.strokeStyle = 'rgba(220,250,255,.3)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 2; i++) {
      const yy = top + 10 + ((t * 9 + i * 18) % (h - 18));
      ctx.globalAlpha = .45;
      ctx.beginPath();
      for (let x = ARENA.left; x <= ARENA.right; x += 14) {
        const wy = yy + Math.sin(x * .035 + t * 1.8 + i * 1.4) * 2;
        if (x === ARENA.left) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // koi
    for (const k of this.decor.koi) {
      const x = ARENA.left + 30 + ((k.x + t * k.sp) % (ARENA.right - ARENA.left - 60));
      const y = top + 12 + k.y * (h - 24) + Math.sin(t * .9 + k.p) * 3;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t * .6 + k.p) * .2);
      ctx.fillStyle = k.c;
      ctx.globalAlpha = .65;
      ctx.beginPath(); ctx.ellipse(0, 0, 7, 3, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-12, -4); ctx.lineTo(-12, 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = .5;
      ctx.beginPath(); ctx.arc(3, -.7, .8, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  drawBridge(ctx, t) {
    const x = BRIDGE.left, w = BRIDGE.right - BRIDGE.left;
    const y = RIVER.top - 14, h = RIVER.bottom - RIVER.top + 28;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#9a714f';
    rrect(ctx, x, y, w, h, 5);
    ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#b98a62');
    g.addColorStop(1, '#8a5f42');
    ctx.fillStyle = g;
    rrect(ctx, x, y, w, h, 5);
    ctx.fill();

    // planks
    ctx.strokeStyle = 'rgba(58,34,22,.45)';
    ctx.lineWidth = 1.2;
    for (let yy = y + 7; yy < y + h; yy += 8.5) {
      ctx.beginPath(); ctx.moveTo(x + 3, yy); ctx.lineTo(x + w - 3, yy); ctx.stroke();
    }
    // grain
    ctx.globalAlpha = .25;
    ctx.strokeStyle = '#f0cfa5';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 12 + i * 26, y + 4);
      ctx.lineTo(x + 16 + i * 26, y + h - 4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // rails
    ctx.strokeStyle = '#6e4830';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 4, y + 2); ctx.lineTo(x + w - 4, y + 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 4, y + h - 2); ctx.lineTo(x + w - 4, y + h - 2); ctx.stroke();
    ctx.fillStyle = '#5d3d2a';
    for (const px of [x + 4, x + w - 4]) {
      for (const py of [y + 2, y + h - 2]) {
        roundPost(ctx, px, py);
      }
    }
    // rope
    ctx.strokeStyle = 'rgba(240,220,180,.55)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i <= 4; i++) {
      const px = x + 4 + (w - 8) * i / 4;
      ctx.beginPath();
      ctx.moveTo(px, y + 2);
      ctx.quadraticCurveTo(px, y + 10, px, y + 15);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawTowerPads(ctx, game) {
    for (const tw of game.towers) {
      const r = tw.kind === 'king' ? 54 : 42;
      ctx.save();
      const g = ctx.createRadialGradient(tw.x, tw.y - 8, 4, tw.x, tw.y - 4, r);
      g.addColorStop(0, 'rgba(230,220,205,.75)');
      g.addColorStop(.7, 'rgba(196,180,160,.55)');
      g.addColorStop(1, 'rgba(120,100,90,.1)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(tw.x, tw.y - 3, r, r * .42, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = tw.destroyed ? 'rgba(80,50,60,.4)' : TEAMS[tw.team].color + '66';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(tw.x, tw.y - 3, r * .9, r * .38, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawDeployZone(ctx, game, t) {
    if (!this.selected) return;
    const z = DEPLOY[0];
    ctx.save();
    const g = ctx.createLinearGradient(0, z.y1, 0, z.y2);
    g.addColorStop(0, 'rgba(86,217,255,.02)');
    g.addColorStop(.4, 'rgba(86,217,255,.10)');
    g.addColorStop(1, 'rgba(86,217,255,.16)');
    ctx.fillStyle = g;
    rrect(ctx, z.x1, z.y1, z.x2 - z.x1, z.y2 - z.y1, 18);
    ctx.fill();

    ctx.setLineDash([10, 8]);
    ctx.lineDashOffset = -t * 26;
    ctx.strokeStyle = 'rgba(140,240,255,.7)';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = 'rgba(86,217,255,.8)';
    ctx.shadowBlur = 12;
    rrect(ctx, z.x1, z.y1, z.x2 - z.x1, z.y2 - z.y1, 18);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    ctx.font = '900 11px "Trebuchet MS",sans-serif';
    ctx.textAlign = 'left';
    const lx = z.x1 + 14, ly = z.y2 - 20;
    const lw = ctx.measureText('YOUR HALF').width;
    rrect(ctx, lx - 7, ly - 11, lw + 14, 16, 8);
    ctx.fillStyle = 'rgba(8,26,34,.72)';
    ctx.fill();
    ctx.fillStyle = 'rgba(190,250,255,.85)';
    ctx.fillText('YOUR HALF', lx, ly);
    ctx.restore();
  }

  drawDecorStatic(ctx, t) {
    for (const tr of this.decor.trees) drawTree(ctx, tr, t);
    for (const l of this.decor.lanterns) drawLantern(ctx, l, t);
    for (const r of this.decor.rocks) drawRock(ctx, r);
  }

  drawArenaPetals(ctx, t) {
    ctx.save();
    for (const p of this.decor.petals) {
      const x = p.x + Math.sin(t * .6 + p.p) * 12;
      const y = ARENA.top + ((p.y + t * p.sp) % (ARENA.bottom - ARENA.top));
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.ellipse(x, y, 3.2, 1.8, p.r + Math.sin(t + p.p) * .5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  drawProjectiles(ctx, game) {
    for (const p of game.projectiles) {
      ctx.save();
      if (p.kind === 'bolt') {
        const col = TEAMS[p.team];
        for (let i = 0; i < p.trail.length; i++) {
          const q = p.trail[i];
          ctx.globalAlpha = (i / p.trail.length) * .45;
          ctx.fillStyle = col.light;
          ctx.beginPath(); ctx.arc(q.x, q.y, 1.2 + i * .45, 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowColor = col.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = col.light;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4.4, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, TAU); ctx.fill();
      } else if (p.kind === 'arrow') {
        const prev = p.trail[p.trail.length - 1] || { x: p.x - 4, y: p.y };
        ctx.strokeStyle = 'rgba(170,235,255,.5)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.strokeStyle = '#eaffff';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(p.x - 6, p.y + 3); ctx.lineTo(p.x, p.y); ctx.lineTo(p.x - 6, p.y - 3); ctx.stroke();
        ctx.fillStyle = '#9be8ff';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, TAU); ctx.fill();
      } else {
        // petal
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 5);
        ctx.fillStyle = 'rgba(255,168,205,.9)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 5.2, 2.6, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,240,250,.8)';
        ctx.beginPath(); ctx.arc(1.4, -.6, 1, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }

  drawHealthBars(ctx, game, t) {
    for (const tw of game.towers) {
      if (tw.destroyed) continue;
      const king = tw.kind === 'king';
      const w = king ? 92 : 74;
      const y = clamp(tw.y - (king ? 142 : 84), ARENA.top + 8, ARENA.bottom - 20);
      const x = tw.x - w / 2;
      const ratio = clamp(tw.hp / tw.maxHp, 0, 1);
      ctx.save();
      // plate
      rrect(ctx, x - 2, y - 2, w + 4, 13, 6);
      ctx.fillStyle = 'rgba(14,7,24,.78)';
      ctx.fill();
      ctx.strokeStyle = king ? 'rgba(255,209,102,.65)' : 'rgba(255,255,255,.22)';
      ctx.lineWidth = 1;
      ctx.stroke();
      rrect(ctx, x, y, w, 8, 4);
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      ctx.fill();
      if (ratio > 0) {
        const g = ctx.createLinearGradient(x, 0, x + w, 0);
        g.addColorStop(0, TEAMS[tw.team].dark);
        g.addColorStop(.65, TEAMS[tw.team].color);
        g.addColorStop(1, TEAMS[tw.team].light);
        rrect(ctx, x, y, Math.max(3, w * ratio), 8, 4);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        rrect(ctx, x + 1, y + 1, Math.max(2, w * ratio - 2), 2.4, 2);
        ctx.fill();
      }
      // hp text
      ctx.fillStyle = 'rgba(255,245,250,.9)';
      ctx.font = '900 7.5px "Trebuchet MS",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.ceil(tw.hp)}`, tw.x, y - 5);
      if (king) {
        drawMiniCrown(ctx, tw.x - w / 2 - 9, y - 1, 8, '#ffd166');
      }
      ctx.restore();
    }

    for (const u of game.units) {
      if (u.dead || u.materialize > .1) continue;
      const w = 30;
      const y = u.y - 92;
      const x = u.x - w / 2;
      const ratio = clamp(u.hp / u.maxHp, 0, 1);
      ctx.save();
      rrect(ctx, x - 1, y - 1, w + 2, 7, 3.5);
      ctx.fillStyle = 'rgba(10,5,18,.72)';
      ctx.fill();
      rrect(ctx, x, y, w, 5, 2.5);
      ctx.fillStyle = 'rgba(255,255,255,.16)';
      ctx.fill();
      if (ratio > 0) {
        rrect(ctx, x, y, Math.max(2, w * ratio), 5, 2.5);
        ctx.fillStyle = TEAMS[u.team].color;
        ctx.fill();
      }
      if (u.slowT > 0) {
        drawSnowflake(ctx, x + w + 5, y + 2.5, 4.5, 'rgba(160,235,255,.95)');
      }
      if (u.shadowCrit) {
        ctx.fillStyle = '#c77dff';
        ctx.shadowColor = '#c77dff';
        ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(x - 6, y + 2.5, 2, 0, TAU); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }
  }

  drawEffects(ctx, game) {
    for (const e of game.effects) {
      const p = clamp(e.age / e.life, 0, 1);
      const a = 1 - p;
      ctx.save();
      switch (e.type) {
        case 'slash': {
          ctx.translate(e.x, e.y);
          ctx.rotate(e.angle);
          ctx.globalAlpha = a;
          ctx.strokeStyle = e.color || '#fff';
          ctx.lineWidth = 3.2 * (1 - p) + 1;
          ctx.shadowColor = e.color || '#fff';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, e.size || 22, -.9 + p * .8, .9 + p * .8);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,.85)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(0, 0, (e.size || 22) * .7, -.7 + p * .8, .6 + p * .8);
          ctx.stroke();
          break;
        }
        case 'whirl': {
          ctx.translate(e.x, e.y);
          ctx.globalAlpha = a * .9;
          ctx.strokeStyle = e.color || '#ffc0da';
          ctx.lineWidth = 4 - p * 2;
          ctx.shadowColor = e.color;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 0, 12 + p * (e.r || 70), 0, TAU);
          ctx.stroke();
          ctx.globalAlpha = a;
          for (let i = 0; i < 3; i++) {
            ctx.rotate(TAU / 3);
            ctx.beginPath();
            ctx.arc(0, 0, 16 + p * (e.r || 70), 0, .9);
            ctx.stroke();
          }
          break;
        }
        case 'hit': {
          ctx.translate(e.x, e.y);
          ctx.globalAlpha = a;
          ctx.strokeStyle = e.color || '#fff';
          ctx.lineWidth = e.big ? 3 : 1.8;
          ctx.shadowColor = e.color || '#fff';
          ctx.shadowBlur = 9;
          const n = e.big ? 8 : 5;
          for (let i = 0; i < n; i++) {
            const ang = (i / n) * TAU + .4;
            const r0 = 3 + p * 6, r1 = 10 + p * (e.big ? 22 : 13);
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * r0, Math.sin(ang) * r0);
            ctx.lineTo(Math.cos(ang) * r1, Math.sin(ang) * r1);
            ctx.stroke();
          }
          ctx.fillStyle = 'rgba(255,255,255,.9)';
          ctx.beginPath(); ctx.arc(0, 0, (1 - p) * (e.big ? 7 : 4), 0, TAU); ctx.fill();
          break;
        }
        case 'death': {
          ctx.translate(e.x, e.y);
          ctx.globalAlpha = a * .8;
          ctx.fillStyle = e.color;
          for (let i = 0; i < 9; i++) {
            const ang = i * .7 + p * 2.4;
            const r = 8 + p * (24 + i * 3);
            ctx.globalAlpha = a * .55;
            ctx.beginPath();
            ctx.ellipse(Math.cos(ang) * r, -Math.sin(ang) * r * .6, 3, 1.8, ang, 0, TAU);
            ctx.fill();
          }
          ctx.globalAlpha = a * .3;
          ctx.beginPath(); ctx.arc(0, -20 - p * 26, 8 - p * 5, 0, TAU); ctx.fill();
          break;
        }
        case 'deploy': {
          ctx.translate(e.x, e.y);
          ctx.globalAlpha = a;
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = e.color;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.ellipse(0, 2, 10 + p * 26, 4 + p * 9, 0, 0, TAU);
          ctx.stroke();
          const g = ctx.createLinearGradient(0, -70, 0, 4);
          g.addColorStop(0, 'rgba(255,255,255,0)');
          g.addColorStop(1, e.color);
          ctx.globalAlpha = a * .45;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(-9, 2); ctx.lineTo(-4, -64); ctx.lineTo(4, -64); ctx.lineTo(9, 2);
          ctx.closePath(); ctx.fill();
          break;
        }
        case 'heal': {
          ctx.translate(e.x, e.y);
          ctx.globalAlpha = a;
          ctx.strokeStyle = e.color;
          ctx.lineWidth = 2;
          ctx.shadowColor = e.color;
          ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.ellipse(0, 6, 8 + p * 22, 3 + p * 8, 0, 0, TAU); ctx.stroke();
          for (let i = 0; i < 4; i++) {
            const ang = i * 1.9 + .4;
            const px = Math.cos(ang) * (12 + p * 18);
            const py = -p * 30 - Math.abs(Math.sin(ang)) * 8;
            ctx.globalAlpha = a * .9;
            ctx.fillStyle = '#b3ffd0';
            ctx.fillRect(px - 1, py - 4, 2, 8);
            ctx.fillRect(px - 4, py - 1, 8, 2);
          }
          break;
        }
        case 'slow': {
          ctx.translate(e.x, e.y);
          ctx.globalAlpha = a;
          drawSnowflake(ctx, 0, 0, 4 + p * 12, e.color || '#9be8ff');
          ctx.strokeStyle = e.color || '#9be8ff';
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.ellipse(0, 8, 10 + p * 20, 3 + p * 7, 0, 0, TAU); ctx.stroke();
          break;
        }
        case 'shadow': {
          ctx.translate(e.x, e.y);
          ctx.globalAlpha = a * .8;
          ctx.fillStyle = e.color || '#b06bff';
          for (let i = 0; i < 6; i++) {
            const ang = i * 1.1;
            ctx.beginPath();
            ctx.arc(Math.cos(ang) * p * 26, Math.sin(ang) * p * 18, 8 - p * 5, 0, TAU);
            ctx.fill();
          }
          ctx.globalAlpha = a;
          ctx.strokeStyle = '#e2c4ff';
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(0, 0, 8 + p * 28, 0, TAU); ctx.stroke();
          break;
        }
        case 'boom': {
          const s = e.size || 1;
          ctx.translate(e.x, e.y);
          ctx.globalAlpha = a;
          const g = ctx.createRadialGradient(0, 0, 2, 0, 0, (30 + p * 60) * s);
          g.addColorStop(0, 'rgba(255,240,190,.95)');
          g.addColorStop(.35, 'rgba(255,170,90,.8)');
          g.addColorStop(1, 'rgba(255,90,90,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(0, 0, (30 + p * 60) * s, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(255,230,180,.7)';
          ctx.lineWidth = 3 * a;
          ctx.beginPath(); ctx.arc(0, 0, (18 + p * 74) * s, 0, TAU); ctx.stroke();
          for (let i = 0; i < 14; i++) {
            const ang = i * .9;
            const r = p * (44 + (i % 5) * 13) * s;
            ctx.globalAlpha = a;
            ctx.fillStyle = i % 3 === 0 ? '#ffe7a8' : i % 3 === 1 ? '#ff9b6a' : e.color;
            ctx.beginPath();
            ctx.arc(Math.cos(ang) * r, Math.sin(ang) * r, (3 - p * 2) * s, 0, TAU);
            ctx.fill();
          }
          break;
        }
        case 'ring': {
          ctx.translate(e.x, e.y);
          ctx.globalAlpha = a;
          ctx.strokeStyle = e.color || '#fff';
          ctx.lineWidth = 2.4 * (1 - p) + .6;
          ctx.shadowColor = e.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.ellipse(0, 0, 8 + p * (e.r || 50), 3 + p * (e.r || 50) * .36, 0, 0, TAU);
          ctx.stroke();
          break;
        }
        case 'muzzle': {
          ctx.translate(e.x, e.y);
          ctx.globalAlpha = a;
          ctx.fillStyle = e.color;
          ctx.shadowColor = e.color;
          ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.arc(0, 0, 3 + p * 5, 0, TAU); ctx.fill();
          break;
        }
        case 'text': {
          ctx.globalAlpha = Math.min(1, a * 1.6);
          ctx.fillStyle = e.color || '#fff';
          ctx.font = `900 ${e.size || 10}px "Trebuchet MS",sans-serif`;
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,.65)';
          ctx.shadowBlur = 4;
          ctx.fillText(e.text, e.x, e.y + (e.vy || -24) * p);
          break;
        }
        case 'fizzle': {
          ctx.translate(e.x, e.y);
          ctx.globalAlpha = a * .5;
          ctx.fillStyle = e.color || '#fff';
          ctx.beginPath(); ctx.arc(0, 0, 2 + p * 6, 0, TAU); ctx.fill();
          break;
        }
        case 'crown': {
          ctx.globalAlpha = a;
          ctx.fillStyle = '#ffd166';
          drawMiniCrown(ctx, e.x, e.y - p * 40, 10, '#ffd166');
          break;
        }
        default: break;
      }
      ctx.restore();
    }
  }

  drawGhost(ctx, game, t) {
    if (!this.hover) return;
    const { x, y, valid } = this.hover;
    const col = valid ? '#7dffc4' : '#ff6b86';
    const pulse = .5 + .5 * Math.sin(t * 4.4);
    ctx.save();
    ctx.translate(x, y);

    // filled landing pool
    const pool = ctx.createRadialGradient(0, 2, 2, 0, 2, 36);
    pool.addColorStop(0, valid ? 'rgba(125,255,196,.42)' : 'rgba(255,107,134,.42)');
    pool.addColorStop(1, valid ? 'rgba(125,255,196,0)' : 'rgba(255,107,134,0)');
    ctx.fillStyle = pool;
    ctx.beginPath(); ctx.ellipse(0, 2, 36, 14, 0, 0, TAU); ctx.fill();

    // pulsing outer ring
    ctx.strokeStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 14;
    ctx.globalAlpha = .95;
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.ellipse(0, 2, 30, 11.5, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = .35 + pulse * .35;
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(0, 2, 24 + pulse * 8, 9 + pulse * 3, 0, 0, TAU); ctx.stroke();
    ctx.shadowBlur = 0;

    // rotating corner sparks
    for (let i = 0; i < 4; i++) {
      const a = t * 1.5 + i * TAU / 4;
      ctx.globalAlpha = .5 + Math.sin(t * 3 + i) * .25;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 26, 2 + Math.sin(a) * 9, 1.7, 0, TAU);
      ctx.fill();
    }

    // downward marker arrow
    ctx.globalAlpha = .9;
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.lineDashOffset = -t * 26;
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(0, -52);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(-5, -44); ctx.lineTo(0, -53); ctx.lineTo(5, -44);
    ctx.stroke();

    // center spark
    ctx.globalAlpha = .95;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(0, 2, 2.2, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

/* ================================================================== */
/* decor data                                                          */
/* ================================================================== */
function makeDecor() {
  const rng = mulberry32(20261031);
  const blotches = [];
  for (let i = 0; i < 26; i++) {
    blotches.push({
      x: 40 + rng() * 520, y: 26 + rng() * 668,
      rx: 12 + rng() * 46, ry: 6 + rng() * 20, rot: rng() * TAU,
      a: .03 + rng() * .05, c: rng() > .5 ? '#2f6b42' : '#94c98c'
    });
  }
  const flowers = [];
  for (let i = 0; i < 64; i++) {
    const x = 42 + rng() * 516;
    const y = 26 + rng() * 668;
    if (x > 205 && x < 395) continue;
    if (y > RIVER.top - 16 && y < RIVER.bottom + 16) continue;
    flowers.push({ x, y, r: 1.3 + rng() * 1.7, c: ['#ffd6e6', '#ffe9a8', '#e8c8ff', '#fff'][Math.floor(rng() * 4)], p: rng() * 6 });
  }
  const tufts = [];
  for (let i = 0; i < 60; i++) {
    const x = 44 + rng() * 512;
    const y = 26 + rng() * 668;
    if (x > 200 && x < 400) continue;
    if (y > RIVER.top - 10 && y < RIVER.bottom + 10) continue;
    tufts.push({ x, y });
  }
  const stones = [];
  for (let i = 0; i < 70; i++) {
    stones.push({ x: 228 + rng() * 144, y: 26 + rng() * 668, r: .6 + rng() * 1.6 });
  }
  const trees = [
    { x: 62, y: 88, s: .82, p: 1.1 }, { x: 536, y: 128, s: .9, p: 2.4 },
    { x: 68, y: 268, s: .96, p: 3.3 }, { x: 530, y: 300, s: .8, p: .7 },
    { x: 62, y: 486, s: .92, p: 2.1 }, { x: 536, y: 520, s: 1.0, p: 4.2 },
    { x: 92, y: 660, s: .76, p: 5.1 }, { x: 508, y: 672, s: .84, p: 1.8 }
  ];
  const lanterns = [
    { x: 152, y: 306, p: .4 }, { x: 448, y: 306, p: 1.7 },
    { x: 148, y: 430, p: 2.8 }, { x: 452, y: 430, p: 3.9 },
    { x: 156, y: 648, p: 1.2 }, { x: 444, y: 648, p: 2.2 }
  ];
  const rocks = [
    { x: 124, y: 352, s: .9 }, { x: 472, y: 382, s: 1.1 },
    { x: 94, y: 442, s: .7 }, { x: 502, y: 468, s: .8 },
    { x: 116, y: 592, s: .6 }, { x: 480, y: 226, s: .7 }
  ];
  const petals = [];
  for (let i = 0; i < 18; i++) {
    petals.push({
      x: 30 + rng() * 540, y: rng() * 690,
      sp: 5 + rng() * 11, p: rng() * 6, a: .25 + rng() * .4,
      c: rng() > .3 ? '#ffc8dd' : '#fff1f6', r: rng() * 6
    });
  }
  const koi = [
    { x: 40, y: .3, sp: 8, p: .4, c: '#ffb27a' },
    { x: 230, y: .68, sp: 6, p: 2.1, c: '#fff0e0' },
    { x: 380, y: .45, sp: 10, p: 4.4, c: '#ff8f8f' }
  ];
  return { blotches, flowers, tufts, stones, trees, lanterns, rocks, petals, koi };
}

function makeScreenPetals() {
  const rng = mulberry32(777);
  const petals = [];
  for (let i = 0; i < 18; i++) {
    petals.push({
      x: rng(), y: rng(), speed: 10 + rng() * 26, size: 2.5 + rng() * 4,
      phase: rng() * TAU, sway: .01 + rng() * .03, rot: rng() * TAU, a: .18 + rng() * .35
    });
  }
  return petals;
}

function drawForegroundPetals(ctx, w, h, t, petals) {
  ctx.save();
  for (const p of petals) {
    const y = ((p.y * h + t * p.speed) % (h + 60)) - 30;
    const x = p.x * w + Math.sin(t * .55 + p.phase) * p.sway * w;
    ctx.globalAlpha = p.a;
    ctx.fillStyle = 'linear-gradient';
    ctx.fillStyle = '#ffc4dc';
    ctx.beginPath();
    ctx.ellipse(x, y, p.size, p.size * .58, p.rot + t * .4, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = p.a * .5;
    ctx.fillStyle = '#fff0f7';
    ctx.beginPath();
    ctx.ellipse(x - p.size * .2, y - p.size * .15, p.size * .4, p.size * .22, p.rot, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawSky(ctx, w, h, t) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#2a1747');
  g.addColorStop(.45, '#1b1033');
  g.addColorStop(1, '#0c0716');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // glows
  const glow = ctx.createRadialGradient(w * .18, h * .08, 10, w * .18, h * .08, w * .75);
  glow.addColorStop(0, 'rgba(255,120,175,.20)');
  glow.addColorStop(1, 'rgba(255,120,175,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const glow2 = ctx.createRadialGradient(w * .9, h * .82, 10, w * .9, h * .82, w * .8);
  glow2.addColorStop(0, 'rgba(100,120,255,.14)');
  glow2.addColorStop(1, 'rgba(100,120,255,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, w, h);

  // moon
  ctx.save();
  ctx.globalAlpha = .6;
  const mx = w * .82, my = h * .12, mr = Math.min(w, h) * .075;
  const mg = ctx.createRadialGradient(mx - mr * .3, my - mr * .3, 1, mx, my, mr);
  mg.addColorStop(0, '#fff6e0');
  mg.addColorStop(.7, '#ffd9c0');
  mg.addColorStop(1, 'rgba(255,190,200,.05)');
  ctx.fillStyle = mg;
  ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
  ctx.restore();

  // distant mountain silhouettes
  ctx.save();
  ctx.globalAlpha = .3;
  ctx.fillStyle = '#221238';
  ctx.beginPath();
  ctx.moveTo(0, h * .78);
  ctx.quadraticCurveTo(w * .2, h * .62, w * .38, h * .78);
  ctx.quadraticCurveTo(w * .55, h * .9, w * .72, h * .76);
  ctx.quadraticCurveTo(w * .88, h * .66, w, h * .8);
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = .22;
  ctx.fillStyle = '#160c28';
  ctx.beginPath();
  ctx.moveTo(0, h * .88);
  ctx.quadraticCurveTo(w * .25, h * .76, w * .5, h * .88);
  ctx.quadraticCurveTo(w * .76, h * .98, w, h * .86);
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
  ctx.fill();
  ctx.restore();

  // torii silhouettes on side strips
  drawTorii(ctx, w * .06, h * .55, Math.min(w, h) * .11, 'rgba(255,150,190,.12)');
  drawTorii(ctx, w * .95, h * .7, Math.min(w, h) * .09, 'rgba(160,150,255,.1)');

  // cherry branches top corners
  drawBranch(ctx, -10, h * .04, 1, 'rgba(255,170,205,.22)');
  drawBranch(ctx, w + 10, h * .02, -1, 'rgba(255,190,215,.18)');
}

function drawTorii(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.fillRect(-s * .5, 0, s * .09, s * 1.15);
  ctx.fillRect(s * .41, 0, s * .09, s * 1.15);
  ctx.beginPath();
  ctx.moveTo(-s * .72, -s * .06);
  ctx.quadraticCurveTo(0, -s * .2, s * .72, -s * .06);
  ctx.lineTo(s * .66, s * .04);
  ctx.quadraticCurveTo(0, -s * .08, -s * .66, s * .04);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-s * .56, s * .28, s * 1.12, s * .07);
  ctx.restore();
}

function drawBranch(ctx, x, y, dir, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(40, 20, 80, 30, 130, 90);
  ctx.stroke();
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(30 + i * 24, 12 + i * 16);
    ctx.quadraticCurveTo(48 + i * 24, 4 + i * 14, 64 + i * 26, 20 + i * 18);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  for (let i = 0; i < 9; i++) {
    const bx = 34 + (i * 37) % 110;
    const by = 14 + (i * 29) % 70;
    ctx.beginPath();
    ctx.arc(bx, by, 5 + (i % 3), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawTree(ctx, tr, t) {
  const { x, y, s, p } = tr;
  const sway = Math.sin(t * .7 + p) * 1.4;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // shadow
  ctx.fillStyle = 'rgba(10,30,20,.25)';
  ctx.beginPath(); ctx.ellipse(4, 6, 34, 11, 0, 0, TAU); ctx.fill();
  // trunk
  const tg = ctx.createLinearGradient(-8, 0, 8, 0);
  tg.addColorStop(0, '#5a3a2c');
  tg.addColorStop(.5, '#80543c');
  tg.addColorStop(1, '#4a2f24');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(-9, 6);
  ctx.quadraticCurveTo(-5, -34, -3, -62);
  ctx.lineTo(5, -62);
  ctx.quadraticCurveTo(4, -32, 10, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a2f24';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -44);
  ctx.quadraticCurveTo(-18, -56, -26, -72);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2, -54);
  ctx.quadraticCurveTo(20, -64, 26, -80);
  ctx.stroke();
  // canopy
  const blobs = [
    { x: -24, y: -76, r: 24 }, { x: 2, y: -92, r: 30 }, { x: 26, y: -74, r: 23 },
    { x: -6, y: -68, r: 24 }, { x: 14, y: -86, r: 20 }
  ];
  for (let i = 0; i < blobs.length; i++) {
    const b = blobs[i];
    const grad = ctx.createRadialGradient(b.x - b.r * .3 + sway * .2, b.y - b.r * .35, 2, b.x + sway * .2, b.y, b.r);
    grad.addColorStop(0, i % 2 ? '#ffd9e8' : '#ffc3dc');
    grad.addColorStop(.7, '#f59fc3');
    grad.addColorStop(1, '#cf6fa3');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x + sway, b.y, b.r, 0, TAU);
    ctx.fill();
  }
  // highlights
  ctx.fillStyle = 'rgba(255,245,250,.35)';
  for (const b of blobs) {
    ctx.beginPath();
    ctx.ellipse(b.x + sway - b.r * .25, b.y - b.r * .32, b.r * .4, b.r * .24, -.5, 0, TAU);
    ctx.fill();
  }
  // falling petals
  ctx.fillStyle = 'rgba(255,190,215,.8)';
  for (let i = 0; i < 3; i++) {
    const px = Math.sin(t * .8 + p + i * 2) * 28;
    const py = -50 + ((t * 14 + i * 22) % 58);
    ctx.beginPath();
    ctx.ellipse(px, py, 2.4, 1.3, t + i, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawLantern(ctx, l, t) {
  const flick = .85 + Math.sin(t * 3.1 + l.p) * .15;
  ctx.save();
  ctx.translate(l.x, l.y);
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath(); ctx.ellipse(0, 3, 9, 3.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#4d3a2f';
  ctx.fillRect(-1.6, -38, 3.2, 41);
  ctx.fillStyle = '#6a4c3a';
  ctx.fillRect(-1.6, -38, 1.2, 41);
  // lamp
  ctx.fillStyle = '#3c2a22';
  ctx.beginPath(); ctx.ellipse(0, -44, 8, 3, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2f201a';
  rrect(ctx, -6, -56, 12, 13, 3); ctx.fill();
  ctx.fillStyle = `rgba(255,190,110,${.8 * flick})`;
  ctx.shadowColor = '#ffb15e';
  ctx.shadowBlur = 16 * flick;
  rrect(ctx, -4, -54, 8, 9, 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#3c2a22';
  ctx.beginPath(); ctx.ellipse(0, -57, 7, 2.4, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawRock(ctx, r) {
  ctx.save();
  ctx.translate(r.x, r.y);
  ctx.scale(r.s, r.s);
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath(); ctx.ellipse(0, 2, 10, 4, 0, 0, TAU); ctx.fill();
  const g = ctx.createLinearGradient(-8, -8, 8, 6);
  g.addColorStop(0, '#b7b1b0');
  g.addColorStop(1, '#726d74');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-9, 2);
  ctx.quadraticCurveTo(-11, -7, -2, -9);
  ctx.quadraticCurveTo(8, -11, 10, -2);
  ctx.quadraticCurveTo(11, 3, 2, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ctx.beginPath(); ctx.ellipse(-2, -5, 4, 2, -.4, 0, TAU); ctx.fill();
  ctx.restore();
}

function roundPost(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 3.4, 0, TAU);
  ctx.fill();
}

function drawMiniCrown(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-s * .55, s * .32);
  ctx.lineTo(-s * .62, -s * .28);
  ctx.lineTo(-s * .22, s * .02);
  ctx.lineTo(0, -s * .45);
  ctx.lineTo(s * .22, s * .02);
  ctx.lineTo(s * .62, -s * .28);
  ctx.lineTo(s * .55, s * .32);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSnowflake(ctx, x, y, r, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
    ctx.stroke();
  }
  ctx.restore();
}
