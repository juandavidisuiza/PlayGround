/* Sakura Clash — arena, towers and projectile art.
   Everything is original vector art drawn at runtime. No external assets. */
(function () {
  'use strict';

  const TAU = Math.PI * 2;

  function rr(ctx, x, y, w, h, r) {
    const q = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + q, y);
    ctx.arcTo(x + w, y, x + w, y + h, q);
    ctx.arcTo(x + w, y + h, x, y + h, q);
    ctx.arcTo(x, y + h, x, y, q);
    ctx.arcTo(x, y, x + w, y, q);
    ctx.closePath();
  }

  function ell(ctx, x, y, rx, ry, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
  }

  function petal(ctx, x, y, s, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.35, s * 0.7, s * 0.7, 0, s);
    ctx.bezierCurveTo(-s * 0.7, s * 0.7, -s * 0.95, -s * 0.35, 0, -s);
    ctx.fill();
    ctx.restore();
  }

  function seeded(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function star(ctx, x, y, r, color, points, inner) {
    const n = points || 5;
    const k = inner || 0.45;
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI / n) * i - Math.PI / 2;
      const rad = i % 2 ? r * k : r;
      const px = x + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  /* ------------------------------------------------------------------ */
  /*  GROUND                                                            */
  /* ------------------------------------------------------------------ */

  function drawTree(ctx, x, y, s, seed) {
    const rnd = seeded(seed);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    ctx.fillStyle = 'rgba(38, 62, 36, 0.25)';
    ell(ctx, 5, 3, 25, 8);
    ctx.fill();

    ctx.strokeStyle = '#78513e';
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(-2, -10, 3, -18, 1, -30);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 224, 198, 0.28)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-1.2, 0);
    ctx.bezierCurveTo(-3, -12, 1, -2, 0, -28);
    ctx.stroke();

    const blobs = [
      [-13, -36, 15], [12, -37, 16], [0, -47, 18], [-3, -31, 13], [18, -26, 10], [-19, -25, 9]
    ];
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const shade = i % 3;
      ctx.fillStyle = shade === 0 ? '#f7accb' : shade === 1 ? '#ffc6dc' : '#ec8db8';
      ell(ctx, b[0], b[1], b[2], b[2] * 0.82);
      ctx.fill();
    }
    for (let i = 0; i < 11; i++) {
      const bx = (rnd() - 0.5) * 52;
      const by = -24 - rnd() * 34;
      petal(ctx, bx, by, 2.2 + rnd() * 1.8, rnd() * TAU, 'rgba(255, 240, 247, 0.7)');
    }
    ctx.fillStyle = 'rgba(255, 243, 249, 0.32)';
    ell(ctx, -8, -48, 10, 6, -0.4);
    ctx.fill();
    ctx.restore();
  }

  function drawLantern(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.strokeStyle = '#6d4a3a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -22);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 170, 110, 0.16)';
    ell(ctx, 0, -26, 12, 12);
    ctx.fill();
    ctx.fillStyle = '#e8514f';
    rr(ctx, -5.5, -31, 11, 12, 4);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 226, 170, 0.85)';
    rr(ctx, -3.5, -29, 7, 8, 3);
    ctx.fill();
    ctx.fillStyle = '#3b2a2d';
    rr(ctx, -6.5, -32, 13, 2.4, 1.2);
    ctx.fill();
    rr(ctx, -6, -20.5, 12, 2, 1);
    ctx.fill();
    ctx.restore();
  }

  function drawGround(ctx, L) {
    const { W, H, cx, pathW, riverTop, riverBottom } = L;

    const grass = ctx.createLinearGradient(0, 0, 0, H);
    grass.addColorStop(0, '#b9dc95');
    grass.addColorStop(0.42, '#a9d486');
    grass.addColorStop(0.72, '#b4da8f');
    grass.addColorStop(1, '#9dca7c');
    ctx.fillStyle = grass;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#f8ffd9';
    for (let y = -20; y < H + 20; y += 46) {
      ctx.fillRect(0, y, W, 18);
    }
    ctx.restore();

    const sideGlow = ctx.createRadialGradient(cx, H * 0.5, 60, cx, H * 0.5, W * 0.85);
    sideGlow.addColorStop(0, 'rgba(255, 246, 202, 0.20)');
    sideGlow.addColorStop(0.6, 'rgba(255, 246, 202, 0.02)');
    sideGlow.addColorStop(1, 'rgba(36, 86, 44, 0.14)');
    ctx.fillStyle = sideGlow;
    ctx.fillRect(0, 0, W, H);

    /* stone lane */
    const pg = ctx.createLinearGradient(cx - pathW / 2, 0, cx + pathW / 2, 0);
    pg.addColorStop(0, '#cdb995');
    pg.addColorStop(0.16, '#eadcbe');
    pg.addColorStop(0.5, '#f4e8ce');
    pg.addColorStop(0.84, '#e2d0ad');
    pg.addColorStop(1, '#c5ae88');
    ctx.fillStyle = 'rgba(69, 86, 48, 0.22)';
    rr(ctx, cx - pathW / 2 - 4, -20, pathW + 8, H + 40, 30);
    ctx.fill();
    ctx.fillStyle = pg;
    rr(ctx, cx - pathW / 2, -20, pathW, H + 40, 26);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    rr(ctx, cx - pathW / 2, -20, pathW, H + 40, 26);
    ctx.clip();
    ctx.strokeStyle = 'rgba(128, 104, 74, 0.20)';
    ctx.lineWidth = 1;
    let row = 0;
    for (let y = -16; y < H + 30; y += 23) {
      ctx.beginPath();
      ctx.moveTo(cx - pathW / 2, y);
      ctx.lineTo(cx + pathW / 2, y);
      ctx.stroke();
      const joints = row % 2 ? [-0.28, 0.22] : [-0.04, 0.4];
      for (let j = 0; j < joints.length; j++) {
        const jx = cx + joints[j] * pathW;
        ctx.beginPath();
        ctx.moveTo(jx, y);
        ctx.lineTo(jx, y + 23);
        ctx.stroke();
      }
      row++;
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
    for (let y = 4; y < H; y += 46) {
      ell(ctx, cx + ((y / 46) % 2 ? 16 : -18), y, 12, 2.4);
      ctx.fill();
    }
    ctx.restore();

    /* river banks */
    const bankGrad = ctx.createLinearGradient(0, riverTop - 14, 0, riverTop + 6);
    bankGrad.addColorStop(0, 'rgba(209, 192, 145, 0)');
    bankGrad.addColorStop(1, '#dccb9f');
    ctx.fillStyle = bankGrad;
    ctx.fillRect(0, riverTop - 16, W, 22);
    const bankGrad2 = ctx.createLinearGradient(0, riverBottom - 6, 0, riverBottom + 16);
    bankGrad2.addColorStop(0, '#dccb9f');
    bankGrad2.addColorStop(1, 'rgba(209, 192, 145, 0)');
    ctx.fillStyle = bankGrad2;
    ctx.fillRect(0, riverBottom - 6, W, 22);

    /* grass tufts + tiny flowers */
    const rnd = seeded(90210);
    for (let i = 0; i < 30; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      if (Math.abs(x - cx) < pathW / 2 + 5) continue;
      if (y > riverTop - 12 && y < riverBottom + 12) continue;
      ctx.strokeStyle = 'rgba(76, 130, 62, 0.42)';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x - 1.4, y - 5, x - 3, y - 7);
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 1.6, y - 4, x + 4, y - 6);
      ctx.stroke();
      if (i % 5 === 0) {
        ctx.fillStyle = i % 10 ? 'rgba(255, 241, 250, 0.9)' : 'rgba(255, 201, 92, 0.9)';
        ell(ctx, x + 3, y - 7, 1.6, 1.6);
        ctx.fill();
      }
    }

    /* rocks */
    const rocks = [[0.17, 0.53], [0.83, 0.44], [0.12, 0.76], [0.9, 0.77], [0.2, 0.1]];
    for (let i = 0; i < rocks.length; i++) {
      const rx = rocks[i][0] * W;
      const ry = rocks[i][1] * H;
      ctx.fillStyle = 'rgba(52, 70, 42, 0.2)';
      ell(ctx, rx + 2, ry + 3, 8, 3);
      ctx.fill();
      ctx.fillStyle = i % 2 ? '#a7a98e' : '#b4b39a';
      ell(ctx, rx, ry, 6.5, 4.5);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ell(ctx, rx - 2, ry - 1.4, 3, 1.6, -0.4);
      ctx.fill();
    }

    /* lanterns */
    drawLantern(ctx, cx - pathW / 2 - 13, H * 0.33, 0.9);
    drawLantern(ctx, cx + pathW / 2 + 13, H * 0.33, 0.9);
    drawLantern(ctx, cx - pathW / 2 - 13, H * 0.67, 0.9);
    drawLantern(ctx, cx + pathW / 2 + 13, H * 0.67, 0.9);
    drawLantern(ctx, cx - pathW / 2 - 15, H * 0.86, 0.75);

    /* cherry trees */
    drawTree(ctx, W * 0.10, H * 0.18, 1.0, 11);
    drawTree(ctx, W * 0.91, H * 0.26, 0.82, 23);
    drawTree(ctx, W * 0.08, H * 0.60, 1.08, 37);
    drawTree(ctx, W * 0.93, H * 0.64, 0.92, 53);
    drawTree(ctx, W * 0.14, H * 0.87, 0.78, 71);
    drawTree(ctx, W * 0.88, H * 0.88, 0.72, 89);

    /* drifting petals on the grass */
    const prnd = seeded(4242);
    for (let i = 0; i < 18; i++) {
      const x = prnd() * W;
      const y = prnd() * H;
      if (Math.abs(x - cx) < pathW / 2 - 2) continue;
      petal(ctx, x, y, 2.3, prnd() * TAU, 'rgba(255, 226, 240, 0.62)');
    }
  }

  /* ------------------------------------------------------------------ */
  /*  WATER + BRIDGE                                                    */
  /* ------------------------------------------------------------------ */

  function drawWater(ctx, L, t) {
    const { W, riverTop, riverBottom } = L;
    const h = riverBottom - riverTop;

    const wg = ctx.createLinearGradient(0, riverTop, 0, riverBottom);
    wg.addColorStop(0, '#6cc7d3');
    wg.addColorStop(0.22, '#54b6c9');
    wg.addColorStop(0.6, '#3d9fbb');
    wg.addColorStop(1, '#66c2cd');
    ctx.fillStyle = wg;
    ctx.fillRect(0, riverTop, W, h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.17)';
    ctx.fillRect(0, riverTop, W, 1.4);
    ctx.fillRect(0, riverBottom - 1.4, W, 1.4);

    ctx.save();
    ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = 'rgba(233, 255, 255, ' + (0.12 + k * 0.05) + ')';
      ctx.lineWidth = 1.2 + k * 0.5;
      ctx.beginPath();
      for (let x = -10; x <= W + 10; x += 12) {
        const y = riverTop + h * (0.28 + k * 0.21) +
          Math.sin(x * 0.055 + t * (1.1 + k * 0.24) + k * 2.1) * 2.4;
        if (x === -10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    const rnd = seeded(777);
    for (let i = 0; i < 16; i++) {
      const x = rnd() * W;
      const y = riverTop + 5 + rnd() * (h - 10);
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.8 + i * 1.7));
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.18 * tw) + ')';
      ell(ctx, x, y, 2.5 + rnd() * 3, 0.7);
      ctx.fill();
    }

    /* lily pads hugging the banks */
    for (let i = 0; i < 3; i++) {
      const x = 12 + i * 26;
      const y = riverTop + 9 + (i % 2) * 8;
      ctx.fillStyle = '#5e9e6e';
      ell(ctx, x, y, 7, 3.2);
      ctx.fill();
      ctx.fillStyle = '#7ebd84';
      ell(ctx, x - 1, y - 0.8, 5.4, 2.3);
      ctx.fill();
    }
    ctx.fillStyle = '#5e9e6e';
    ell(ctx, W - 18, riverBottom - 10, 6.5, 3);
    ctx.fill();
    petal(ctx, W - 30, riverTop + 8, 3, 1.4, 'rgba(255, 210, 230, 0.85)');
    petal(ctx, 24, riverBottom - 7, 2.6, 2.7, 'rgba(255, 228, 240, 0.8)');
  }

  function drawBridge(ctx, L, t) {
    const { bridgeL, bridgeR, riverTop, riverBottom } = L;
    const top = riverTop - 12;
    const bottom = riverBottom + 12;
    const w = bridgeR - bridgeL;

    ctx.save();
    ctx.fillStyle = 'rgba(34, 65, 56, 0.28)';
    rr(ctx, bridgeL + 4, top + 5, w, bottom - top, 5);
    ctx.fill();

    const wood = ctx.createLinearGradient(bridgeL, 0, bridgeR, 0);
    wood.addColorStop(0, '#9c613f');
    wood.addColorStop(0.18, '#c98d5e');
    wood.addColorStop(0.5, '#ddaa72');
    wood.addColorStop(0.82, '#c07f52');
    wood.addColorStop(1, '#8f5336');
    ctx.fillStyle = wood;
    rr(ctx, bridgeL, top, w, bottom - top, 4);
    ctx.fill();

    ctx.save();
    rr(ctx, bridgeL, top, w, bottom - top, 4);
    ctx.clip();
    for (let y = top + 4; y < bottom; y += 8) {
      ctx.strokeStyle = 'rgba(90, 47, 27, 0.34)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bridgeL, y);
      ctx.lineTo(bridgeR, y);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 219, 167, 0.16)';
      ctx.beginPath();
      ctx.moveTo(bridgeL, y + 1.2);
      ctx.lineTo(bridgeR, y + 1.2);
      ctx.stroke();
    }
    ctx.restore();

    /* rails */
    const railX = [bridgeL + 5, bridgeR - 5];
    for (let side = 0; side < 2; side++) {
      const x = railX[side];
      ctx.strokeStyle = '#7c3b32';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, top + 3);
      ctx.lineTo(x, bottom - 3);
      ctx.stroke();
      ctx.strokeStyle = '#c65b45';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x - 0.8, top + 4);
      ctx.lineTo(x - 0.8, bottom - 4);
      ctx.stroke();
      for (let y = top + 5; y <= bottom - 4; y += 13) {
        ctx.fillStyle = '#6f352f';
        rr(ctx, x - 2.8, y, 5.6, 7, 1.4);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 197, 142, 0.45)';
        ctx.fillRect(x - 2.2, y + 0.7, 1.2, 5);
      }
    }

    /* torii-ish caps */
    for (let side = 0; side < 2; side++) {
      const x = railX[side];
      for (let e = 0; e < 2; e++) {
        const y = e ? bottom - 3 : top + 3;
        ctx.fillStyle = '#a74d38';
        rr(ctx, x - 3.4, y - 6, 6.8, 12, 2);
        ctx.fill();
        ctx.fillStyle = '#e2a052';
        rr(ctx, x - 4.2, y - 7.4, 8.4, 2.4, 1.2);
        ctx.fill();
      }
    }

    ctx.fillStyle = 'rgba(255, 240, 206, 0.26)';
    for (let i = 0; i < 4; i++) {
      ell(ctx, bridgeL + 14 + i * (w - 28) / 3, top + 9 + i * 9, 3, 0.8);
      ctx.fill();
    }
    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /*  TOWERS                                                            */
  /* ------------------------------------------------------------------ */

  const TEAM = {
    player: {
      roof: '#35b9dd', roofDark: '#177b9f', roofLight: '#a8f2ff',
      banner: '#5ee6ff', glow: 'rgba(92, 231, 255, 0.85)',
      stone: '#d8d3e2', stoneDark: '#a49db5', gold: '#ffd36e'
    },
    enemy: {
      roof: '#ef4a76', roofDark: '#9d2047', roofLight: '#ffc0d3',
      banner: '#ff7095', glow: 'rgba(255, 112, 149, 0.85)',
      stone: '#ded3dc', stoneDark: '#a99ab0', gold: '#ffd36e'
    }
  };

  function drawTower(ctx, tower, L, t) {
    const pal = TEAM[tower.team];
    const x = tower.x;
    const y = tower.y;
    const r = tower.r;
    const queen = tower.type === 'queen';
    const hpRatio = Math.max(0, tower.hp / tower.maxHp);
    const flash = tower.flash > 0;
    const active = tower.team === 'player' ? true : tower.active;

    ctx.save();
    ctx.translate(x, y);

    /* shadow + platform */
    ctx.fillStyle = 'rgba(34, 48, 37, 0.28)';
    ell(ctx, 2, r * 0.58, r * 1.28, r * 0.38);
    ctx.fill();
    ctx.fillStyle = '#a9a293';
    ell(ctx, 0, r * 0.42, r * 1.18, r * 0.34);
    ctx.fill();
    ctx.fillStyle = '#c8c1b1';
    ell(ctx, 0, r * 0.34, r * 1.08, r * 0.29);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ell(ctx, -r * 0.2, r * 0.25, r * 0.55, r * 0.12);
    ctx.fill();

    /* body */
    const bodyW = r * 1.46;
    const bodyTop = -r * 1.42;
    const bodyBottom = r * 0.34;
    const bodyH = bodyBottom - bodyTop;
    const bg = ctx.createLinearGradient(-bodyW / 2, 0, bodyW / 2, 0);
    bg.addColorStop(0, pal.stoneDark);
    bg.addColorStop(0.22, pal.stone);
    bg.addColorStop(0.62, '#f0ecf5');
    bg.addColorStop(1, pal.stoneDark);
    ctx.fillStyle = bg;
    rr(ctx, -bodyW / 2, bodyTop, bodyW, bodyH, r * 0.12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(74, 63, 86, 0.20)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const yy = bodyTop + (bodyH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(-bodyW / 2 + 2, yy);
      ctx.lineTo(bodyW / 2 - 2, yy);
      ctx.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const yy = bodyTop + (bodyH / 4) * i;
      const xx = i % 2 ? 0 : -bodyW * 0.22;
      ctx.beginPath();
      ctx.moveTo(xx, yy);
      ctx.lineTo(xx, yy + bodyH / 4);
      ctx.stroke();
    }

    /* battlements */
    ctx.fillStyle = pal.stone;
    rr(ctx, -bodyW / 2 - 2, bodyTop - r * 0.22, bodyW + 4, r * 0.26, 2);
    ctx.fill();
    for (let i = -1; i <= 1; i++) {
      rr(ctx, i * bodyW * 0.33 - bodyW * 0.11, bodyTop - r * 0.36, bodyW * 0.22, r * 0.22, 1.5);
      ctx.fillStyle = i === 0 ? '#f2eef6' : pal.stone;
      ctx.fill();
      ctx.fillStyle = 'rgba(91, 80, 104, 0.18)';
      ctx.fillRect(i * bodyW * 0.33 - bodyW * 0.11, bodyTop - r * 0.18, bodyW * 0.22, r * 0.04);
      ctx.fillStyle = pal.stone;
    }

    /* roof */
    const roofBase = bodyTop - r * 0.34;
    const roofTip = roofBase - r * (queen ? 1.42 : 1.06);
    const roofHalf = bodyW * (queen ? 0.62 : 0.6);
    const rg = ctx.createLinearGradient(0, roofTip, 0, roofBase);
    rg.addColorStop(0, pal.roofLight);
    rg.addColorStop(0.28, pal.roof);
    rg.addColorStop(1, pal.roofDark);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(-roofHalf, roofBase);
    ctx.quadraticCurveTo(-roofHalf * 0.58, roofTip + r * 0.18, 0, roofTip);
    ctx.quadraticCurveTo(roofHalf * 0.58, roofTip + r * 0.18, roofHalf, roofBase);
    ctx.quadraticCurveTo(0, roofBase + r * 0.16, -roofHalf, roofBase);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = pal.gold;
    ctx.lineWidth = Math.max(1.2, r * 0.055);
    ctx.beginPath();
    ctx.moveTo(-roofHalf - r * 0.08, roofBase);
    ctx.quadraticCurveTo(0, roofBase + r * 0.2, roofHalf + r * 0.08, roofBase);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-roofHalf * 0.52, roofBase - r * 0.12);
    ctx.quadraticCurveTo(-roofHalf * 0.24, roofTip + r * 0.28, 0, roofTip + r * 0.12);
    ctx.stroke();

    /* side flags */
    for (let side = -1; side <= 1; side += 2) {
      const fx = side * bodyW * 0.66;
      ctx.strokeStyle = '#8f7a5d';
      ctx.lineWidth = Math.max(1, r * 0.045);
      ctx.beginPath();
      ctx.moveTo(fx, bodyTop - r * 0.1);
      ctx.lineTo(fx, bodyTop - r * 0.92);
      ctx.stroke();
      const wave = Math.sin(t * 2.2 + side * 1.3) * r * 0.05;
      ctx.fillStyle = pal.banner;
      ctx.beginPath();
      ctx.moveTo(fx, bodyTop - r * 0.9);
      ctx.quadraticCurveTo(fx + side * r * 0.24, bodyTop - r * 0.86 + wave, fx + side * r * 0.44, bodyTop - r * 0.8);
      ctx.lineTo(fx + side * r * 0.38, bodyTop - r * 0.56);
      ctx.quadraticCurveTo(fx + side * r * 0.18, bodyTop - r * 0.6 - wave, fx, bodyTop - r * 0.62);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(fx + side * 2, bodyTop - r * 0.86, side * r * 0.22, r * 0.035);
    }

    /* emblem */
    const emY = bodyTop + bodyH * 0.44;
    const emR = r * 0.35;
    if (active) {
      const glow = ctx.createRadialGradient(0, emY, 1, 0, emY, emR * 2.4);
      glow.addColorStop(0, pal.glow);
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glow;
      ell(ctx, 0, emY, emR * 2.4, emR * 2.4);
      ctx.fill();
    }
    ctx.fillStyle = active ? '#2a1c3a' : 'rgba(45, 36, 56, 0.75)';
    ell(ctx, 0, emY, emR * 1.14, emR * 1.2);
    ctx.fill();
    ctx.strokeStyle = pal.gold;
    ctx.lineWidth = Math.max(1, r * 0.05);
    ell(ctx, 0, emY, emR * 1.04, emR * 1.1);
    ctx.stroke();

    ctx.save();
    ctx.translate(0, emY);
    if (queen) {
      ctx.scale(emR * 0.088, emR * 0.088);
      ctx.fillStyle = active ? pal.gold : 'rgba(255, 211, 110, 0.35)';
      ctx.beginPath();
      ctx.moveTo(-8, 5);
      ctx.lineTo(-10, -6);
      ctx.lineTo(-3, -1);
      ctx.lineTo(0, -9);
      ctx.lineTo(3, -1);
      ctx.lineTo(10, -6);
      ctx.lineTo(8, 5);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.scale(emR * 0.1, emR * 0.1);
      ctx.fillStyle = active ? '#ffd0e0' : 'rgba(255, 208, 224, 0.35)';
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(-12, 0, -9, -9, 0, -3);
      ctx.bezierCurveTo(9, -9, 12, 0, 0, 8);
      ctx.fill();
    }
    ctx.restore();

    /* ornaments: hanging petals + rope */
    ctx.strokeStyle = 'rgba(255, 240, 210, 0.65)';
    ctx.lineWidth = 0.9;
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.moveTo(i * bodyW * 0.3, bodyTop + bodyH * 0.08);
      ctx.quadraticCurveTo(i * bodyW * 0.34, bodyTop + bodyH * 0.25, i * bodyW * 0.3, bodyTop + bodyH * 0.34);
      ctx.stroke();
      ctx.fillStyle = pal.gold;
      ell(ctx, i * bodyW * 0.3, bodyTop + bodyH * 0.36, r * 0.045, r * 0.06);
      ctx.fill();
    }

    /* queen crown above roof */
    if (queen) {
      const crownY = roofTip - r * 0.3;
      ctx.save();
      ctx.translate(0, crownY);
      ctx.fillStyle = pal.gold;
      ctx.beginPath();
      ctx.moveTo(-r * 0.27, r * 0.08);
      ctx.lineTo(-r * 0.33, -r * 0.16);
      ctx.lineTo(-r * 0.11, -r * 0.04);
      ctx.lineTo(0, -r * 0.24);
      ctx.lineTo(r * 0.11, -r * 0.04);
      ctx.lineTo(r * 0.33, -r * 0.16);
      ctx.lineTo(r * 0.27, r * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff2c4';
      ell(ctx, 0, -r * 0.05, r * 0.035, r * 0.035);
      ctx.fill();
      ctx.restore();
    } else {
      /* spire */
      ctx.strokeStyle = pal.gold;
      ctx.lineWidth = Math.max(1, r * 0.05);
      ctx.beginPath();
      ctx.moveTo(0, roofTip);
      ctx.lineTo(0, roofTip - r * 0.24);
      ctx.stroke();
      ctx.fillStyle = pal.gold;
      ell(ctx, 0, roofTip - r * 0.28, r * 0.06, r * 0.06);
      ctx.fill();
    }

    /* cracks when hurt */
    if (hpRatio < 0.62) {
      ctx.strokeStyle = 'rgba(64, 46, 74, 0.5)';
      ctx.lineWidth = Math.max(0.8, r * 0.035);
      ctx.beginPath();
      ctx.moveTo(-bodyW * 0.18, bodyTop + r * 0.05);
      ctx.lineTo(-bodyW * 0.05, bodyTop + r * 0.28);
      ctx.lineTo(-bodyW * 0.14, bodyTop + r * 0.44);
      ctx.lineTo(-bodyW * 0.02, bodyTop + r * 0.58);
      ctx.stroke();
      if (hpRatio < 0.3) {
        ctx.beginPath();
        ctx.moveTo(bodyW * 0.28, bodyTop + bodyH * 0.3);
        ctx.lineTo(bodyW * 0.1, bodyTop + bodyH * 0.48);
        ctx.lineTo(bodyW * 0.2, bodyTop + bodyH * 0.66);
        ctx.stroke();
      }
    }

    if (flash) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(0.55, tower.flash * 2);
      ctx.fillStyle = '#ffffff';
      rr(ctx, -bodyW / 2, bodyTop, bodyW, bodyH, r * 0.12);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    /* frost/glow aura for active queen */
    if (active && queen) {
      ctx.strokeStyle = pal.glow;
      ctx.globalAlpha = 0.12 + 0.06 * Math.sin(t * 3);
      ctx.lineWidth = 2;
      ell(ctx, 0, r * 0.34, r * 1.4, r * 0.42);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawRubble(ctx, tower, t) {
    const x = tower.x;
    const y = tower.y;
    const r = tower.r;
    const pal = TEAM[tower.team];
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(34, 48, 37, 0.3)';
    ell(ctx, 0, r * 0.46, r * 1.05, r * 0.32);
    ctx.fill();
    ctx.fillStyle = '#a9a293';
    ell(ctx, 0, r * 0.38, r * 1.02, r * 0.26);
    ctx.fill();
    const rnd = seeded(tower.seed || 17);
    for (let i = 0; i < 7; i++) {
      const bx = (rnd() - 0.5) * r * 1.6;
      const by = r * 0.1 + rnd() * r * 0.34;
      const bw = r * (0.12 + rnd() * 0.2);
      ctx.fillStyle = i % 3 ? pal.stoneDark : '#777083';
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate((rnd() - 0.5) * 1.2);
      rr(ctx, -bw / 2, -bw * 0.35, bw, bw * 0.7, 1.5);
      ctx.fill();
      ctx.restore();
    }
    const piece = r * 0.34;
    ctx.save();
    ctx.translate(-r * 0.55, -r * 0.05);
    ctx.rotate(-0.42);
    ctx.fillStyle = pal.roofDark;
    ctx.beginPath();
    ctx.moveTo(-piece, 0);
    ctx.quadraticCurveTo(0, -piece * 0.8, piece, 0);
    ctx.lineTo(piece * 0.7, piece * 0.4);
    ctx.lineTo(-piece * 0.7, piece * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = pal.gold;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-piece, 0);
    ctx.quadraticCurveTo(0, -piece * 0.8, piece, 0);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = 'rgba(58, 48, 62, 0.25 + 0.05 * Math.sin(t * 2))';
    ell(ctx, 0, -r * 0.2, r * 0.85, r * 0.3);
    ctx.fill();
    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /*  PROJECTILES                                                       */
  /* ------------------------------------------------------------------ */

  function drawProjectile(ctx, p, t) {
    const col = p.color;
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.kind === 'arrow') {
      const ang = Math.atan2(p.vy || -1, p.vx || 0);
      ctx.rotate(ang);
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-6, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#ffeab0';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(7, 0);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(3, -4.2);
      ctx.lineTo(3, 4.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      star(ctx, 12, 0, 2.4, 'rgba(255,255,255,0.9)', 4, 0.35);
    } else if (p.kind === 'petal') {
      ctx.rotate(t * 5 + p.seed);
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = col;
      ell(ctx, 0, 0, 10, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      petal(ctx, 0, 0, 5, 0, col);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ell(ctx, -1, -1, 1.2, 0.7);
      ctx.fill();
    } else if (p.kind === 'slash') {
      ctx.rotate(p.rot || 0);
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 13, -0.9, 0.9);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 13, -0.65, 0.65);
      ctx.stroke();
    } else {
      /* glowing bolt */
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = col;
      ell(ctx, 0, 0, 12, 12);
      ctx.fill();
      ctx.globalAlpha = 0.7;
      ell(ctx, 0, 0, 6, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ell(ctx, 0, 0, 2.8, 2.8);
      ctx.fill();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-p.vx * 0.02, -p.vy * 0.02);
      ctx.lineTo(0, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  window.ART = {
    drawGround: drawGround,
    drawWater: drawWater,
    drawBridge: drawBridge,
    drawTower: drawTower,
    drawRubble: drawRubble,
    drawProjectile: drawProjectile
  };
  window.ART.util = { TAU: TAU, rr: rr, ell: ell, petal: petal, seeded: seeded, star: star };
})();
