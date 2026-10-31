/* Sakura Clash — canvas renderer. */
(function () {
  'use strict';

  const G = window.Game;
  const ART = window.ART;
  const U = ART.util;
  const TAU = U.TAU;
  const rr = U.rr;
  const ell = U.ell;
  const petal = U.petal;

  let canvas = null;
  let ctx = null;

  function ensure() {
    if (!canvas) {
      canvas = document.getElementById('arena');
      ctx = canvas.getContext('2d');
    }
    return !!(canvas && ctx);
  }

  function bar(x, y, w, h, ratio, ally, flash) {
    ratio = Math.max(0, Math.min(1, ratio));
    ctx.fillStyle = 'rgba(16, 8, 24, 0.8)';
    rr(ctx, x - w / 2 - 1, y - h / 2 - 1, w + 2, h + 2, (h + 2) / 2);
    ctx.fill();
    const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    if (ally) {
      g.addColorStop(0, '#2ab8da');
      g.addColorStop(0.55, '#79efff');
      g.addColorStop(1, '#b8fbff');
    } else {
      g.addColorStop(0, '#e03363');
      g.addColorStop(0.55, '#ff6f96');
      g.addColorStop(1, '#ffb4c6');
    }
    ctx.fillStyle = g;
    rr(ctx, x - w / 2, y - h / 2, w * ratio, h, h / 2);
    ctx.fill();
    if (flash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(0.7, flash * 4) + ')';
      rr(ctx, x - w / 2, y - h / 2, w * ratio, h, h / 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 0.6;
    rr(ctx, x - w / 2, y - h / 2, w, h, h / 2);
    ctx.stroke();
  }

  function towerScaled(fn) {
    const ts = G.towerScale || 0.8;
    ctx.save();
    const t = G._towerRef;
    ctx.translate(t.x, t.y);
    ctx.scale(ts, ts);
    ctx.translate(-t.x, -t.y);
    fn();
    ctx.restore();
  }

  function drawTowerEntity(t, time) {
    G._towerRef = t;
    if (t.alive) {
      towerScaled(function () { ART.drawTower(ctx, t, G.L, time); });
      const flash = t.flash > 0 ? t.flash : 0;
      const ts = G.towerScale || 0.8;
      bar(
        t.x,
        t.y - t.r * 1.95 * ts,
        Math.max(36, t.r * 1.35 * ts + 14),
        4.2,
        t.hp / t.maxHp,
        t.team === 'player',
        flash
      );
    } else {
      towerScaled(function () { ART.drawRubble(ctx, t, time); });
    }
  }

  function drawUnitEntity(u, time) {
    const us = G.unitScale || 1;
    if (us !== 1) {
      ctx.save();
      ctx.translate(u.x, u.y);
      ctx.scale(us, us);
      ctx.translate(-u.x, -u.y);
      ART.drawUnit(ctx, u, time);
      ctx.restore();
    } else {
      ART.drawUnit(ctx, u, time);
    }
    if (u.hp < u.maxHp - 0.5) {
      const top = (u.card.id === 'kaede' ? 78 : 69) * us;
      bar(u.x, u.y - top, 23, 3.2, u.hp / u.maxHp, u.team === 'player', u.flash);
    }
    if (u.deploy > 0) {
      const p = 1 - u.deploy / 0.9;
      ctx.save();
      ctx.strokeStyle = u.team === 'player' ? 'rgba(126, 239, 255, 0.8)' : 'rgba(255, 137, 167, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(u.x, u.y - 24 * us, 17 * us, -Math.PI / 2, -Math.PI / 2 + TAU * p);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawZones(time) {
    if (!G.selected || G.state !== 'playing') return;
    const L = G.L;
    const top = L.riverBottom + 12;
    const pulse = 0.5 + 0.5 * Math.sin(time * 4);
    const g = ctx.createLinearGradient(0, top, 0, L.H);
    g.addColorStop(0, 'rgba(114, 240, 255, ' + (0.012 + pulse * 0.012) + ')');
    g.addColorStop(0.5, 'rgba(114, 240, 255, 0.06)');
    g.addColorStop(1, 'rgba(114, 240, 255, 0.02)');
    ctx.fillStyle = g;
    ctx.fillRect(0, top, L.W, L.H - top);

    ctx.save();
    ctx.strokeStyle = 'rgba(158, 247, 255, ' + (0.42 + pulse * 0.2) + ')';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([7, 7]);
    ctx.lineDashOffset = -time * 18;
    ctx.beginPath();
    ctx.moveTo(0, top);
    ctx.lineTo(L.W, top);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(232, 255, 255, ' + (0.38 + pulse * 0.16) + ')';
    ctx.font = '900 7px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('YOUR SUMMON ZONE', L.cx, top + 12);
    ctx.restore();
  }

  function drawGhost(time) {
    if (!G.pointer || !G.selected || G.state !== 'playing') return;
    const p = G.pointer;
    const card = G.selected;
    const good = p.valid;
    const us = G.unitScale || 1;
    ctx.save();
    ctx.globalAlpha = 0.5;
    if (us !== 1) {
      ctx.translate(p.x, p.y);
      ctx.scale(us, us);
      ctx.translate(-p.x, -p.y);
    }
    ART.drawUnit(ctx, {
      x: p.x, y: p.y, team: 'player', card: card, seed: 1.7,
      appear: 1, moving: false, walkPhase: 0, attackAnim: 0
    }, time);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = good ? 'rgba(126, 246, 255, 0.95)' : 'rgba(255, 106, 140, 0.95)';
    ctx.fillStyle = good ? 'rgba(126, 246, 255, 0.12)' : 'rgba(255, 106, 140, 0.14)';
    ctx.lineWidth = 1.4;
    const rad = (15 + Math.sin(time * 5) * 1.2) * us;
    ell(ctx, p.x, p.y, rad, rad * 0.42);
    ctx.fill();
    ctx.stroke();
    if (!good) {
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p.x - 4 * us, p.y - 7 * us);
      ctx.lineTo(p.x + 4 * us, p.y + 1 * us);
      ctx.moveTo(p.x + 4 * us, p.y - 7 * us);
      ctx.lineTo(p.x - 4 * us, p.y + 1 * us);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawAuras(time) {
    for (let i = 0; i < G.units.length; i++) {
      const u = G.units[i];
      if (!u.alive || !u.card.heal || u.deploy > 0) continue;
      const R = u.card.heal.radius;
      const pulse = 0.5 + 0.5 * Math.sin(time * 3.4 + u.seed);
      ctx.save();
      ctx.strokeStyle = 'rgba(120, 255, 190, ' + (0.08 + pulse * 0.08) + ')';
      ctx.fillStyle = 'rgba(120, 255, 190, ' + (0.025 + pulse * 0.02) + ')';
      ctx.lineWidth = 1.2;
      ell(ctx, u.x, u.y + 2, R, R * 0.48);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(160, 255, 210, ' + (0.16 + pulse * 0.1) + ')';
      ctx.setLineDash([3, 7]);
      ctx.lineDashOffset = -time * 14;
      ell(ctx, u.x, u.y + 2, R * 0.72, R * 0.345);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  function drawProjectiles(time) {
    for (let i = 0; i < G.projectiles.length; i++) {
      ART.drawProjectile(ctx, G.projectiles[i], time);
    }
  }

  function drawParticles(time) {
    for (let i = 0; i < G.particles.length; i++) {
      const p = G.particles[i];
      const a = Math.max(0, p.life / p.maxLife);
      ctx.save();
      if (p.kind === 'petal') {
        ctx.globalAlpha = Math.min(1, a * 1.6);
        petal(ctx, p.x, p.y, p.size, p.rot, p.color);
      } else if (p.kind === 'text') {
        ctx.globalAlpha = Math.min(1, a * 2);
        ctx.font = '900 ' + p.size + 'px "Trebuchet MS", sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(30, 12, 40, 0.8)';
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.kind === 'ring') {
        const r = p.r0 + (p.r1 - p.r0) * (1 - a);
        ctx.globalAlpha = a * 0.9;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.width || 2;
        ell(ctx, p.x, p.y, r, r * 0.46);
        ctx.stroke();
      } else if (p.kind === 'smoke') {
        ctx.globalAlpha = a * 0.55;
        ctx.fillStyle = p.color;
        ell(ctx, p.x, p.y, p.size, p.size);
        ctx.fill();
      } else if (p.kind === 'slash') {
        ctx.globalAlpha = a;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, 15, -0.85, 0.85);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 15, -0.6, 0.6);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawAmbient(time) {
    for (let i = 0; i < G.ambient.length; i++) {
      const p = G.ambient[i];
      ctx.save();
      ctx.globalAlpha = p.tone > 0.5 ? 0.5 : 0.32;
      petal(ctx, p.x, p.y, p.size, p.rot, p.tone > 0.5 ? '#ffd4e5' : '#fff2f8');
      ctx.restore();
    }
  }

  function renderFrame(time) {
    if (!ensure() || !G.L) return;
    const L = G.L;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const s = G.renderScale || 1;
    ctx.setTransform(s, 0, 0, s, 0, 0);

    if (G.shake > 0.2) {
      ctx.translate((Math.random() - 0.5) * G.shake, (Math.random() - 0.5) * G.shake);
    }

    ART.drawGround(ctx, L);
    ART.drawWater(ctx, L, time);
    ART.drawBridge(ctx, L, time);
    drawZones(time);
    drawAuras(time);

    /* depth-sort towers and units together */
    const things = [];
    for (let i = 0; i < G.towers.length; i++) {
      const t = G.towers[i];
      if (t.alive || t.hp <= 0) things.push({ y: t.y, tower: t });
    }
    for (let i = 0; i < G.units.length; i++) {
      const u = G.units[i];
      if (u.alive) things.push({ y: u.y, unit: u });
    }
    things.sort(function (a, b) { return a.y - b.y; });
    for (let i = 0; i < things.length; i++) {
      if (things[i].tower) drawTowerEntity(things[i].tower, time);
      else drawUnitEntity(things[i].unit, time);
    }

    drawProjectiles(time);
    drawParticles(time);
    drawGhost(time);
    drawAmbient(time);

    const vg = ctx.createRadialGradient(L.cx, L.H * 0.5, Math.min(L.W, L.H) * 0.32, L.cx, L.H * 0.5, Math.max(L.W, L.H) * 0.66);
    vg.addColorStop(0, 'rgba(18, 6, 28, 0)');
    vg.addColorStop(1, 'rgba(18, 6, 28, 0.26)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, L.W, L.H);
  }

  G.renderFrame = renderFrame;
})();
