import { CARDS } from './cards.js';
import { TEAMS, TOWER_STATS } from './config.js';

const TAU = Math.PI * 2;

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}

/* ================================================================== */
/* CHIBI MAIDENS                                                       */
/* ================================================================== */
export function drawUnit(ctx, u, t) {
  const c = CARDS[u.card];
  const team = TEAMS[u.team];
  const walk = u.moving ? 1 : 0;
  const phase = (u.walkPhase || 0) + t * 9;
  const bob = Math.sin(phase) * 1.35 * walk + Math.sin(t * 2.6 + (u.seed || 0)) * .55;
  const swing = u.attackAnim || 0;
  const lunge = Math.sin(Math.min(1, swing) * Math.PI) * 3.4;
  const spawnScale = u.materialize > 0 ? 1 - 0.38 * (u.materialize / 0.62) : 1;
  const alpha = u.dying > 0 ? Math.max(0, 1 - u.dying / 0.75) : 1;
  if (alpha <= 0) return;

  const dir = Math.sign((u.target?.x ?? u.x + 1) - u.x) || 1;
  const leanX = u.moving ? dir * 1.2 : dir * (u.attackAnim ? 3.2 : .6);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(u.x, u.y);

  // ground shadow + team ring
  ellipse(ctx, 0, 1.5, 17, 5.6, 'rgba(6,2,12,.38)');
  ctx.save();
  ctx.globalAlpha = alpha * .85;
  ellipse(ctx, 0, 2, 20, 7, null);
  ctx.strokeStyle = team.color;
  ctx.lineWidth = 2;
  ctx.shadowColor = team.color;
  ctx.shadowBlur = 7;
  ctx.stroke();
  ctx.restore();

  if (u.slowUntil > 0) {
    ctx.save();
    ellipse(ctx, 0, 1, 21, 7.5, null);
    ctx.strokeStyle = '#8fe8ff';
    ctx.globalAlpha = .55 + Math.sin(t * 6) * .2;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }

  ctx.translate(0, bob - (u.dying ? u.dying * 6 : 0));
  ctx.rotate((u.dying || 0) * .5 * dir);
  ctx.scale(spawnScale, spawnScale);
  ctx.translate(leanX + lunge * dir, 0);
  if (u.team === 1) ctx.scale(-1, 1);

  if (u.slowUntil > 0) ctx.filter = 'saturate(.75) brightness(1.08) hue-rotate(8deg)';
  else if (u.hitFlash > 0) ctx.filter = 'brightness(1.9) saturate(1.15)';

  const step = Math.sin(phase) * walk;
  drawLegs(ctx, c, step);
  drawHairBack(ctx, u.card, c, t, u);
  drawBody(ctx, u.card, c, swing, team);
  drawHead(ctx, u.card, c, t, u);
  drawWeapon(ctx, u.card, c, swing, team, u, t);
  if (u.shadowCrit) {
    ctx.save();
    ctx.globalAlpha = .5 + Math.sin(t * 14) * .2;
    ellipse(ctx, 0, -52, 24, 26, null);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.4;
    ctx.shadowColor = c.accent;
    ctx.shadowBlur = 11;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // spawn light column
  if (u.materialize != null && u.materialize > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, u.materialize) * .8;
    const g = ctx.createLinearGradient(0, -80, 0, 4);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, team.color);
    ctx.fillStyle = g;
    ctx.fillRect(u.x - 13, u.y - 80, 26, 82);
    ctx.globalAlpha = Math.max(0, 1 - u.materialize / .62) * .9;
    ellipse(ctx, u.x, u.y + 1, 30, 10, null);
    ctx.strokeStyle = team.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

/* ---------- legs ---------- */
function drawLegs(ctx, c, step) {
  const off = step * 2.4;
  ctx.fillStyle = c.outfitDark;
  roundRect(ctx, -7.5 + off * .5, -14, 6, 14, 2.6);
  ctx.fill();
  roundRect(ctx, 1.5 - off * .5, -14, 6, 14, 2.6);
  ctx.fill();
  ctx.fillStyle = '#2a1a30';
  roundRect(ctx, -8 + off * .5, -4.5, 7, 4.8, 2);
  ctx.fill();
  roundRect(ctx, 1 - off * .5, -4.5, 7, 4.8, 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ---------- hair silhouettes behind the body ---------- */
function drawHairBack(ctx, id, c, t, u) {
  ctx.save();
  ctx.fillStyle = c.hairDark;
  const sway = Math.sin(t * 2.2 + (u.seed || 0)) * 1.2;
  if (id === 'sakura') {
    ellipse(ctx, 0, -54, 19, 20, c.hairDark);
    ctx.beginPath();
    ctx.moveTo(-16, -54);
    ctx.bezierCurveTo(-28, -40, -30, -20, -24, -6 + sway);
    ctx.bezierCurveTo(-18, -10, -14, -24, -12, -40);
    ctx.closePath();
    ctx.fillStyle = c.hair;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(16, -54);
    ctx.bezierCurveTo(28, -40, 30, -20, 24, -6 + sway);
    ctx.bezierCurveTo(18, -10, 14, -24, 12, -40);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, -24, -12 + sway, 6, 10, c.hair);
    ellipse(ctx, 24, -12 + sway, 6, 10, c.hair);
  } else if (id === 'yuki') {
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    ctx.moveTo(-17, -68);
    ctx.bezierCurveTo(-24, -46, -24, -22, -20, -8);
    ctx.lineTo(20, -8);
    ctx.bezierCurveTo(24, -22, 24, -46, 17, -68);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.hairDark;
    ctx.fillRect(-18, -30, 5, 21);
    ctx.fillRect(13, -30, 5, 21);
    ctx.fillStyle = c.hairLight;
    ctx.globalAlpha = .45;
    ctx.fillRect(-15, -64, 3, 46);
  } else if (id === 'hana') {
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    ctx.moveTo(-18, -64);
    ctx.bezierCurveTo(-30, -44, -26, -24, -18, -12);
    ctx.quadraticCurveTo(-10, -20, -8, -44);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(18, -64);
    ctx.bezierCurveTo(30, -44, 26, -24, 18, -12);
    ctx.quadraticCurveTo(10, -20, 8, -44);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, 0, -54, 18, 19, c.hairDark);
  } else {
    // kuro — hood
    ctx.fillStyle = c.outfitDark;
    ctx.beginPath();
    ctx.moveTo(-22, -34);
    ctx.bezierCurveTo(-26, -62, -16, -78, 0, -79);
    ctx.bezierCurveTo(16, -78, 26, -62, 22, -34);
    ctx.bezierCurveTo(16, -24, -16, -24, -22, -34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = c.outfitLight;
    ctx.globalAlpha = .35;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------- outfit ---------- */
function drawBody(ctx, id, c, swing, team) {
  const outfit = c.outfit;
  // dress silhouette
  ctx.fillStyle = outfit;
  ctx.beginPath();
  ctx.moveTo(-11, -42);
  ctx.lineTo(11, -42);
  ctx.quadraticCurveTo(15, -30, 20, -11);
  ctx.quadraticCurveTo(0, -6, -20, -11);
  ctx.quadraticCurveTo(-15, -30, -11, -42);
  ctx.closePath();
  ctx.fill();
  // skirt shading
  ctx.fillStyle = c.outfitDark;
  ctx.globalAlpha = .4;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(16, -11);
  ctx.quadraticCurveTo(0, -7, -8, -10);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  // sash
  ctx.fillStyle = c.outfitLight;
  roundRect(ctx, -12, -31, 24, 3, 1.5);
  ctx.fill();
  // chest / collar
  ctx.fillStyle = c.outfitLight;
  ctx.beginPath();
  ctx.moveTo(-9, -42);
  ctx.lineTo(0, -34);
  ctx.lineTo(9, -42);
  ctx.lineTo(6, -45);
  ctx.lineTo(0, -40);
  ctx.lineTo(-6, -45);
  ctx.closePath();
  ctx.fill();
  // arms
  const handY = -25 + Math.sin(swing * Math.PI) * 4;
  ctx.strokeStyle = c.outfit;
  ctx.lineWidth = 4.6;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-10, -38); ctx.lineTo(-14, -27); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -38); ctx.lineTo(14, handY); ctx.stroke();
  ctx.fillStyle = c.skin;
  ellipse(ctx, -14, -26, 2.3, 2.3);
  ellipse(ctx, 14, handY + 1.2, 2.3, 2.3);

  if (id === 'yuki') {
    ctx.fillStyle = '#f6fdff';
    ellipse(ctx, -8, -42, 6, 3.6);
    ellipse(ctx, 8, -42, 6, 3.6);
    ellipse(ctx, 0, -43, 7, 4);
  }
  if (id === 'kuro') {
    ctx.fillStyle = c.outfitDark;
    ctx.beginPath();
    ctx.moveTo(-13, -42);
    ctx.lineTo(13, -42);
    ctx.lineTo(19, -9);
    ctx.lineTo(-19, -9);
    ctx.closePath();
    ctx.globalAlpha = .35;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (id === 'sakura') {
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-9, -34);
    ctx.lineTo(0, -29);
    ctx.lineTo(9, -34);
    ctx.stroke();
  }
}

/* ---------- head, face, bangs ---------- */
function drawHead(ctx, id, c, t, u) {
  // hair mass behind head top
  ctx.fillStyle = c.hair;
  ctx.beginPath();
  ctx.ellipse(0, -55, 16.5, 17, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = c.hairDark; ctx.globalAlpha = .5; ctx.lineWidth = 1.1; ctx.stroke(); ctx.globalAlpha = 1;
  // face
  ctx.fillStyle = c.skin;
  ctx.beginPath();
  ctx.ellipse(0, -52.5, 12.8, 13.6, 0, 0, TAU);
  ctx.fill();
  // jaw shade
  ctx.fillStyle = c.skinShade;
  ctx.globalAlpha = .35;
  ctx.beginPath();
  ctx.ellipse(0, -48.5, 10, 7, 0, 0, Math.PI);
  ctx.fill();
  ctx.globalAlpha = 1;

  // eyes
  const blink = Math.sin(t * 1.7 + (u.seed || 0)) > .992;
  for (const ex of [-5.2, 5.2]) {
    ctx.fillStyle = '#fffaff';
    ctx.beginPath();
    ctx.ellipse(ex, -53.5, 3.6, blink ? .7 : 4.4, 0, 0, TAU);
    ctx.fill();
    if (!blink) {
      ctx.fillStyle = c.eye;
      ctx.beginPath();
      ctx.ellipse(ex, -53.2, 2.7, 3.5, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#241026';
      ctx.beginPath();
      ctx.ellipse(ex, -52.8, 1.25, 1.9, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.95)';
      ellipse(ctx, ex - 1.1, -55, 1.05, 1.05);
      ellipse(ctx, ex + 1.2, -51.8, .55, .55, 'rgba(255,255,255,.8)');
      ctx.strokeStyle = '#2a132c';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(ex - 3.8, -56.8);
      ctx.quadraticCurveTo(ex, -58.6, ex + 3.8, -56.9);
      ctx.stroke();
    }
  }
  // brows
  ctx.strokeStyle = c.hairDark;
  ctx.lineWidth = 1;
  ctx.globalAlpha = .8;
  ctx.beginPath(); ctx.moveTo(-8, -60.4); ctx.lineTo(-3.4, -61.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3.4, -61.2); ctx.lineTo(8, -60.4); ctx.stroke();
  ctx.globalAlpha = 1;
  // blush
  ctx.fillStyle = 'rgba(255,120,150,.32)';
  ellipse(ctx, -8.6, -47.8, 2.6, 1.2);
  ellipse(ctx, 8.6, -47.8, 2.6, 1.2);
  // mouth
  ctx.strokeStyle = '#a63c58';
  ctx.lineWidth = .9;
  ctx.beginPath();
  ctx.arc(0, -46.4, 1.5, .15, Math.PI - .15);
  ctx.stroke();

  // bangs
  ctx.fillStyle = c.hair;
  ctx.beginPath();
  if (id === 'sakura' || id === 'hana') {
    ctx.moveTo(-15, -56);
    ctx.quadraticCurveTo(-16, -68, -5, -70);
    ctx.quadraticCurveTo(0, -70.5, 5, -70);
    ctx.quadraticCurveTo(16, -68, 15, -56);
    ctx.quadraticCurveTo(12, -60, 9, -64);
    ctx.quadraticCurveTo(7, -58, 3, -56);
    ctx.quadraticCurveTo(0, -62, -3, -56);
    ctx.quadraticCurveTo(-7, -58, -9, -64);
    ctx.quadraticCurveTo(-12, -60, -15, -56);
  } else if (id === 'yuki') {
    ctx.moveTo(-15.5, -54);
    ctx.quadraticCurveTo(-16, -68, -3, -70.5);
    ctx.quadraticCurveTo(8, -71, 15.5, -57);
    ctx.quadraticCurveTo(11, -64, 7, -67);
    ctx.quadraticCurveTo(8, -58, 2, -55);
    ctx.quadraticCurveTo(0, -64, -5, -66);
    ctx.quadraticCurveTo(-4, -58, -9, -56);
    ctx.quadraticCurveTo(-12, -61, -15.5, -54);
  } else {
    ctx.moveTo(-16, -58);
    ctx.quadraticCurveTo(-17, -70, -4, -71);
    ctx.quadraticCurveTo(9, -72, 16, -59);
    ctx.quadraticCurveTo(11, -66, 7, -68);
    ctx.quadraticCurveTo(8, -59, 2, -57);
    ctx.quadraticCurveTo(0, -65, -5, -68);
    ctx.quadraticCurveTo(-6, -59, -10, -57);
    ctx.quadraticCurveTo(-13, -63, -16, -58);
  }
  ctx.closePath();
  ctx.fill();

  // side locks
  ctx.fillStyle = c.hairDark;
  ctx.beginPath();
  ctx.moveTo(-15, -58);
  ctx.quadraticCurveTo(-18, -44, -14, -34);
  ctx.quadraticCurveTo(-10, -42, -11, -55);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(15, -58);
  ctx.quadraticCurveTo(18, -44, 14, -34);
  ctx.quadraticCurveTo(10, -42, 11, -55);
  ctx.closePath();
  ctx.fill();

  // hair shine
  ctx.strokeStyle = c.hairLight;
  ctx.globalAlpha = .65;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(-2, -60, 7.5, Math.PI * 1.12, Math.PI * 1.55);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // accessories
  if (id === 'sakura') {
    flower(ctx, 10.5, -64, 3.1, '#ff9ec4', '#ffd166');
  } else if (id === 'yuki') {
    ctx.strokeStyle = '#e6faff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(11 - Math.cos(a) * 3, -63 - Math.sin(a) * 3);
      ctx.lineTo(11 + Math.cos(a) * 3, -63 + Math.sin(a) * 3);
      ctx.stroke();
    }
  } else if (id === 'hana') {
    ctx.fillStyle = '#6fbf8b';
    ctx.beginPath();
    ctx.moveTo(-12, -67);
    ctx.quadraticCurveTo(0, -73, 12, -67);
    ctx.quadraticCurveTo(0, -69, -12, -67);
    ctx.fill();
    flower(ctx, -7, -68, 2, '#ffe3ef', '#ffd166');
    flower(ctx, 0, -70, 2, '#ffe3ef', '#ffd166');
    flower(ctx, 7, -68, 2, '#ffe3ef', '#ffd166');
  } else {
    ctx.fillStyle = c.accent;
    ctx.shadowColor = c.accent;
    ctx.shadowBlur = 6;
    ellipse(ctx, -5.2, -53.5, 1.15, 1.5);
    ellipse(ctx, 5.2, -53.5, 1.15, 1.5);
    ctx.shadowBlur = 0;
  }
}

function flower(ctx, x, y, r, petal, center) {
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    ellipse(ctx, x + Math.cos(a) * r * .85, y + Math.sin(a) * r * .85, r * .62, r * .62);
  }
  ellipse(ctx, x, y, r * .5, r * .5, center);
}

/* ---------- weapons ---------- */
function drawWeapon(ctx, id, c, swing, team, u, t) {
  const handX = 15, handY = -26;
  const swingT = Math.sin(Math.min(1, swing) * Math.PI);
  ctx.save();
  if (id === 'sakura') {
    ctx.translate(handX, handY - 4);
    ctx.rotate(-1.05 + swingT * 1.9 + Math.sin(t * 2 + (u.seed || 0)) * .04);
    // blade
    const g = ctx.createLinearGradient(0, 0, 0, -30);
    g.addColorStop(0, '#d8e6f2');
    g.addColorStop(.5, '#ffffff');
    g.addColorStop(1, '#b7c9dc');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-1.6, -2);
    ctx.lineTo(-2.4, -20);
    ctx.quadraticCurveTo(0, -30, 2.4, -20);
    ctx.lineTo(1.6, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.lineWidth = .7;
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, -22); ctx.stroke();
    // guard + hilt
    ctx.fillStyle = c.accent;
    roundRect(ctx, -3.4, -2, 6.8, 2.4, 1);
    ctx.fill();
    ctx.fillStyle = '#4a2434';
    roundRect(ctx, -1.7, 0, 3.4, 7.5, 1.5);
    ctx.fill();
  } else if (id === 'yuki') {
    ctx.translate(handX, handY);
    ctx.strokeStyle = '#dfefff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -2, 12, -Math.PI * .62, Math.PI * .62);
    ctx.stroke();
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = .8;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(0, 10);
    ctx.stroke();
    // arrow
    ctx.strokeStyle = '#eaf8ff';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-4, -2);
    ctx.lineTo(13, -2);
    ctx.stroke();
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(15, -2); ctx.lineTo(10, -4.6); ctx.lineTo(10, .6); ctx.closePath();
    ctx.fill();
  } else if (id === 'hana') {
    ctx.translate(handX, handY);
    ctx.strokeStyle = '#7b5a3c';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, -20);
    ctx.stroke();
    ctx.strokeStyle = '#b98a5a';
    ctx.lineWidth = .9;
    ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, -18); ctx.stroke();
    const pulse = .85 + Math.sin(t * 3.4 + (u.seed || 0)) * .15;
    ctx.shadowColor = '#ff9ec4';
    ctx.shadowBlur = 12;
    ctx.fillStyle = 'rgba(255,180,215,.35)';
    ellipse(ctx, 0, -23, 8 * pulse, 8 * pulse);
    ctx.fillStyle = '#ffe3ef';
    ellipse(ctx, 0, -23, 3.4 * pulse, 3.4 * pulse);
    ctx.fillStyle = '#ffd166';
    ellipse(ctx, 0, -23, 1.5, 1.5);
    ctx.shadowBlur = 0;
  } else {
    ctx.translate(handX, handY + 1);
    ctx.rotate(.7 - swingT * 1.3);
    ctx.fillStyle = '#43465f';
    ctx.beginPath();
    ctx.moveTo(-1.8, 0);
    ctx.lineTo(-1, -14);
    ctx.lineTo(0, -17);
    ctx.lineTo(1, -14);
    ctx.lineTo(1.8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = .7;
    ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, -14); ctx.stroke();
    ctx.fillStyle = '#2a1a3a';
    roundRect(ctx, -2, 0, 4, 5, 1);
    ctx.fill();
  }
  ctx.restore();
}

/* ================================================================== */
/* TOWERS                                                              */
/* ================================================================== */
export function drawTower(ctx, tower, t, gameTime) {
  const team = TEAMS[tower.team];
  const isKing = tower.kind === 'king';
  const s = .78;
  const hpRatio = Math.max(0, tower.hp / tower.maxHp);

  ctx.save();
  ctx.translate(tower.x, tower.y);

  // ground shadow
  ellipse(ctx, 0, 4, 46 * s, 14 * s, 'rgba(5,2,10,.4)');

  if (tower.destroyed) {
    drawRubble(ctx, tower, t, s, team);
    ctx.restore();
    return;
  }

  // base plinth
  ctx.fillStyle = '#6b5a62';
  roundRect(ctx, -40 * s, -16 * s, 80 * s, 22 * s, 8 * s);
  ctx.fill();
  ctx.fillStyle = '#8b7880';
  roundRect(ctx, -40 * s, -20 * s, 80 * s, 8 * s, 4 * s);
  ctx.fill();
  ctx.fillStyle = '#4e3f48';
  roundRect(ctx, -33 * s, -5 * s, 66 * s, 9 * s, 3 * s);
  ctx.fill();

  // team aura on the plinth
  ctx.save();
  ctx.globalAlpha = .18 + Math.sin(t * 2.2) * .05;
  ctx.fillStyle = team.color;
  ellipse(ctx, 0, -9 * s, 36 * s, 12 * s);
  ctx.restore();

  const bodyH = isKing ? 62 : 44;
  const bodyTop = -20 - bodyH;
  // wooden body
  ctx.fillStyle = '#8c2f3c';
  ctx.beginPath();
  ctx.moveTo(-31 * s, -20 * s);
  ctx.lineTo(31 * s, -20 * s);
  ctx.lineTo(25 * s, bodyTop * s);
  ctx.lineTo(-25 * s, bodyTop * s);
  ctx.closePath();
  ctx.fill();
  // dark side shade
  ctx.fillStyle = 'rgba(40,10,22,.35)';
  ctx.beginPath();
  ctx.moveTo(9 * s, -20 * s);
  ctx.lineTo(31 * s, -20 * s);
  ctx.lineTo(25 * s, bodyTop * s);
  ctx.lineTo(9 * s, bodyTop * s);
  ctx.closePath();
  ctx.fill();
  // gold pillars
  ctx.fillStyle = '#e8b45a';
  for (const px of [-23, 0, 23]) {
    roundRect(ctx, (px - 1.4) * s, bodyTop * s, 2.8 * s, bodyH * s, 1.2 * s);
    ctx.fill();
  }
  // glow window
  const glowPulse = .72 + Math.sin(t * 3 + tower.x) * .18;
  ctx.save();
  ctx.shadowColor = team.color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = team.color;
  ctx.globalAlpha = .75 * glowPulse;
  roundRect(ctx, -6 * s, (bodyTop + bodyH * .32) * s, 12 * s, 14 * s, 3 * s);
  ctx.fill();
  ctx.restore();
  // door
  ctx.fillStyle = '#3a1620';
  roundRect(ctx, -7 * s, -32 * s, 14 * s, 13 * s, 5 * s);
  ctx.fill();
  ctx.strokeStyle = '#e8b45a';
  ctx.lineWidth = 1 * s;
  ctx.stroke();

  // team banner
  ctx.save();
  ctx.translate(27 * s, bodyTop * s + 8 * s);
  ctx.fillStyle = team.dark;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(13 * s, 2 * s);
  ctx.lineTo(13 * s, 24 * s);
  ctx.lineTo(0, 21 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = team.light;
  ctx.globalAlpha = .9;
  if (isKing) {
    ctx.beginPath();
    ctx.moveTo(2 * s, 14 * s); ctx.lineTo(1 * s, 7 * s); ctx.lineTo(5 * s, 10 * s);
    ctx.lineTo(6.5 * s, 5 * s); ctx.lineTo(8 * s, 10 * s); ctx.lineTo(12 * s, 7 * s);
    ctx.lineTo(11 * s, 14 * s); ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(6.5 * s, 11 * s, 3.4 * s, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // roof(s)
  drawRoof(ctx, 0, bodyTop * s, 56 * s, 24 * s, isKing ? t : t + 1);
  if (isKing) {
    // upper storey
    ctx.fillStyle = '#7c2836';
    roundRect(ctx, -20 * s, -108 * s, 40 * s, 26 * s, 2 * s);
    ctx.fill();
    ctx.fillStyle = '#e8b45a';
    roundRect(ctx, -14 * s, -106 * s, 3 * s, 22 * s, 1);
    ctx.fill();
    roundRect(ctx, 11 * s, -106 * s, 3 * s, 22 * s, 1);
    ctx.fill();
    drawRoof(ctx, 0, -108 * s, 42 * s, 20 * s, t + 2);
    // finial
    ctx.strokeStyle = '#f2c56e';
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.moveTo(0, -140 * s);
    ctx.lineTo(0, -126 * s);
    ctx.stroke();
    ctx.fillStyle = team.color;
    ctx.shadowColor = team.color;
    ctx.shadowBlur = 14;
    ellipse(ctx, 0, -144 * s, 5 * s, 5 * s);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffe6a6';
    ellipse(ctx, -1.4 * s, -145.5 * s, 1.6 * s, 1.6 * s);
    // the Queen's crown
    ctx.save();
    ctx.translate(0, -154 * s);
    ctx.fillStyle = '#ffd166';
    ctx.shadowColor = '#ffd166';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(-13, 6); ctx.lineTo(-15, -5); ctx.lineTo(-7, 1); ctx.lineTo(0, -9);
    ctx.lineTo(7, 1); ctx.lineTo(15, -5); ctx.lineTo(13, 6); ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = team.color;
    ellipse(ctx, 0, 1, 2.4, 2.4);
    ctx.restore();
  } else {
    ctx.strokeStyle = '#f2c56e';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(0, -86 * s);
    ctx.lineTo(0, -74 * s);
    ctx.stroke();
    ctx.fillStyle = team.color;
    ctx.shadowColor = team.color;
    ctx.shadowBlur = 12;
    ellipse(ctx, 0, -89 * s, 4 * s, 4 * s);
    ctx.shadowBlur = 0;
  }

  // damage cracks
  if (hpRatio < .66) {
    ctx.save();
    ctx.strokeStyle = 'rgba(30,8,14,.7)';
    ctx.lineWidth = 1.4 * s;
    ctx.beginPath();
    ctx.moveTo(-10 * s, bodyTop * s + 4 * s);
    ctx.lineTo(-2 * s, bodyTop * s + 16 * s);
    ctx.lineTo(-7 * s, bodyTop * s + 26 * s);
    ctx.stroke();
    if (hpRatio < .33) {
      ctx.beginPath();
      ctx.moveTo(12 * s, bodyTop * s + 2 * s);
      ctx.lineTo(5 * s, bodyTop * s + 14 * s);
      ctx.lineTo(12 * s, bodyTop * s + 24 * s);
      ctx.stroke();
    }
    ctx.restore();
  }

  // hit flash
  if (tower.hitFlash > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(.45, tower.hitFlash * 1.4);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, -bodyH * s * .55, 30 * s, bodyH * s * .62, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawRoof(ctx, x, y, w, h, t) {
  ctx.save();
  const grad = ctx.createLinearGradient(0, y - h, 0, y + 4);
  grad.addColorStop(0, '#4a1e36');
  grad.addColorStop(.5, '#96283f');
  grad.addColorStop(1, '#341226');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y + 2);
  ctx.quadraticCurveTo(x - w * .34, y - h * .9, x, y - h);
  ctx.quadraticCurveTo(x + w * .34, y - h * .9, x + w / 2, y + 2);
  ctx.quadraticCurveTo(x + w * .22, y - h * .22, x, y - h * .16);
  ctx.quadraticCurveTo(x - w * .22, y - h * .22, x - w / 2, y + 2);
  ctx.closePath();
  ctx.fill();
  // gold trim
  ctx.strokeStyle = 'rgba(232,180,90,.75)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + 2, y + 1);
  ctx.quadraticCurveTo(x - w * .3, y - h * .82, x, y - h + 1);
  ctx.quadraticCurveTo(x + w * .3, y - h * .82, x + w / 2 - 2, y + 1);
  ctx.stroke();
  // eave tips
  ctx.strokeStyle = '#e8b45a';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - w / 2, y + 2); ctx.lineTo(x - w / 2 - 5, y - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + w / 2, y + 2); ctx.lineTo(x + w / 2 + 5, y - 2); ctx.stroke();
  // tiles
  ctx.strokeStyle = 'rgba(255,210,160,.12)';
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * w * .14, y - 2);
    ctx.lineTo(x + i * w * .1, y - h * .74);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRubble(ctx, tower, t, s, team) {
  const isKing = tower.kind === 'king';
  ctx.save();
  ctx.fillStyle = '#2a1d2b';
  ellipse(ctx, 0, -2, 40 * s, 13 * s);
  ctx.fillStyle = '#51404a';
  ctx.beginPath();
  ctx.moveTo(-34 * s, 2);
  ctx.lineTo(-22 * s, -16 * s);
  ctx.lineTo(-4 * s, -8 * s);
  ctx.lineTo(12 * s, -18 * s);
  ctx.lineTo(32 * s, -2 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6d2a3e';
  ctx.save();
  ctx.rotate(-.18);
  roundRect(ctx, -18 * s, -16 * s, 26 * s, 5 * s, 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.rotate(.22);
  roundRect(ctx, 2 * s, -20 * s, 24 * s, 5 * s, 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#e8b45a';
  ctx.globalAlpha = .4;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-10 * s, -4 * s);
  ctx.lineTo(8 * s, -14 * s);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // embers
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + t * .7;
    ctx.globalAlpha = .25 + Math.sin(t * 4 + i) * .18;
    ctx.fillStyle = i % 2 ? '#ffb168' : team.color;
    ellipse(ctx, Math.cos(a) * 18 * s, -14 * s - Math.sin(a) * 8 * s, 1.8, 1.8);
  }
  // smoke
  ctx.globalAlpha = .18;
  ctx.fillStyle = '#cbb8d8';
  ellipse(ctx, Math.sin(t * .8) * 7, -32 * s, 9, 12);
  ellipse(ctx, Math.cos(t * .6) * 10, -48 * s, 6, 9);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function towerBarY(tower) {
  const isKing = tower.kind === 'king';
  return tower.y - (isKing ? 142 : 84);
}

export const SPRITE_SCALE = 1;
