/* Sakura Clash — 320x320 anime portrait busts for cards and menus. */
(function () {
  'use strict';

  const U = window.ART.util;
  const TAU = U.TAU;
  const ell = U.ell;
  const rr = U.rr;
  const petal = U.petal;
  const seeded = U.seeded;
  const star = U.star;

  function hairGrad(ctx, a, y1, y2) {
    const g = ctx.createLinearGradient(0, y1, 0, y2);
    g.addColorStop(0, a.hairLight);
    g.addColorStop(0.4, a.hair);
    g.addColorStop(1, a.hairDark);
    return g;
  }

  function bg(ctx, a, index) {
    const g = ctx.createLinearGradient(0, 0, 320, 320);
    g.addColorStop(0, a.bg1);
    g.addColorStop(1, a.bg2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 320, 320);

    const rnd = seeded(index * 91 + 17);

    ctx.save();
    ctx.translate(160, 142);
    for (let i = 0; i < 14; i++) {
      ctx.rotate(TAU / 14);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (i % 2 ? 0.022 : 0.04) + ')';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(310, -38);
      ctx.lineTo(310, 38);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    const halo = ctx.createRadialGradient(160, 138, 20, 160, 138, 150);
    halo.addColorStop(0, a.bgGlow || 'rgba(255, 255, 255, 0.18)');
    halo.addColorStop(0.5, 'rgba(255, 255, 255, 0.045)');
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, 320, 320);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.2;
    ell(ctx, 160, 138, 128, 128);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ell(ctx, 160, 138, 143, 143);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.11)';
    for (let y = 24; y < 320; y += 14) {
      for (let x = 18 + (y % 28); x < 320; x += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, TAU);
        ctx.fill();
      }
    }

    for (let i = 0; i < 26; i++) {
      const x = rnd() * 320;
      const y = rnd() * 320;
      const s = 2 + rnd() * 4.5;
      petal(ctx, x, y, s, rnd() * TAU, 'rgba(255, 226, 240, ' + (0.12 + rnd() * 0.28) + ')');
    }

    const vg = ctx.createRadialGradient(160, 145, 80, 160, 145, 215);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(8, 3, 16, 0.5)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, 320, 320);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(-20, 70);
    ctx.lineTo(100, -20);
    ctx.lineTo(142, -20);
    ctx.lineTo(-20, 132);
    ctx.closePath();
    ctx.fill();
  }

  /* ------------------------------------------------------------------ */
  /*  WEAPONS (behind the bust)                                         */
  /* ------------------------------------------------------------------ */

  function weaponBack(ctx, a, style) {
    ctx.save();
    if (style === 'sakura') {
      ctx.translate(238, 318);
      ctx.rotate(-0.5);
      ctx.strokeStyle = 'rgba(220, 239, 255, 0.9)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, 62);
      ctx.lineTo(10, -54);
      ctx.stroke();
      ctx.strokeStyle = '#5b3646';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-15, 56);
      ctx.lineTo(-5, 30);
      ctx.stroke();
      ctx.fillStyle = a.accent;
      rr(ctx, -20, 22, 30, 6, 3);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8, 54);
      ctx.lineTo(4, -46);
      ctx.stroke();
    } else if (style === 'yumi') {
      ctx.translate(35, 178);
      ctx.rotate(-0.08);
      ctx.strokeStyle = 'rgba(255, 226, 160, 0.85)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(14, 78);
      ctx.quadraticCurveTo(-30, 0, 14, -78);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(14, 78);
      ctx.lineTo(14, -78);
      ctx.stroke();
      ctx.fillStyle = a.accent;
      ell(ctx, 14, 78, 5, 5);
      ctx.fill();
      ell(ctx, 14, -78, 5, 5);
      ctx.fill();
    } else if (style === 'hana') {
      ctx.translate(278, 318);
      ctx.rotate(0.05);
      ctx.strokeStyle = '#8a6548';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(10, -190);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 239, 190, 0.65)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-2, -4);
      ctx.lineTo(8, -186);
      ctx.stroke();
      const og = ctx.createRadialGradient(10, -206, 2, 10, -206, 38);
      og.addColorStop(0, 'rgba(192, 255, 216, 0.7)');
      og.addColorStop(0.5, 'rgba(130, 236, 173, 0.2)');
      og.addColorStop(1, 'rgba(130, 236, 173, 0)');
      ctx.fillStyle = og;
      ell(ctx, 10, -206, 38, 38);
      ctx.fill();
      ctx.fillStyle = '#e0ffeb';
      ell(ctx, 10, -205, 12, 12);
      ctx.fill();
      ctx.fillStyle = a.accent;
      for (let i = 0; i < 5; i++) {
        const ang = (TAU / 5) * i - 0.4;
        ell(ctx, 10 + Math.cos(ang) * 10, -205 + Math.sin(ang) * 10, 8, 4.5, ang);
        ctx.fill();
      }
      ctx.fillStyle = '#ffd36e';
      ell(ctx, 10, -205, 4, 4);
      ctx.fill();
    } else {
      ctx.translate(38, 316);
      ctx.rotate(0.28);
      const cg = ctx.createLinearGradient(-10, 0, 24, -180);
      cg.addColorStop(0, '#4b2c27');
      cg.addColorStop(0.5, '#966044');
      cg.addColorStop(1, '#3b2622');
      ctx.strokeStyle = cg;
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, -168);
      ctx.stroke();
      ctx.fillStyle = a.accent;
      for (let i = 1; i <= 5; i++) {
        ctx.save();
        ctx.translate(1.5 + i * 4.2, -i * 29);
        ctx.rotate(0.28);
        rr(ctx, -13, 0, 26, 5, 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#d8b06a';
      ell(ctx, 26, -172, 8, 10);
      ctx.fill();
      ctx.fillStyle = '#39222c';
      for (let i = 0; i < 6; i++) {
        ell(ctx, 4 + i * 3.2, -22 - i * 25, 2.2, 2.2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /*  BACK HAIR                                                         */
  /* ------------------------------------------------------------------ */

  function backHair(ctx, a, style) {
    const g = hairGrad(ctx, a, 44, 300);
    ctx.fillStyle = g;

    /* common silhouette */
    ctx.beginPath();
    ctx.moveTo(84, 158);
    ctx.bezierCurveTo(76, 88, 108, 44, 160, 44);
    ctx.bezierCurveTo(212, 44, 244, 88, 236, 158);
    ctx.lineTo(240, 238);
    ctx.quadraticCurveTo(210, 266, 160, 268);
    ctx.quadraticCurveTo(110, 266, 80, 238);
    ctx.closePath();
    ctx.fill();

    if (style === 'sakura') {
      /* twin tails */
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(100, 106);
      ctx.bezierCurveTo(58, 116, 38, 178, 48, 252);
      ctx.bezierCurveTo(53, 284, 82, 292, 90, 268);
      ctx.bezierCurveTo(102, 236, 82, 182, 112, 146);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(220, 106);
      ctx.bezierCurveTo(262, 116, 282, 178, 272, 252);
      ctx.bezierCurveTo(267, 284, 238, 292, 230, 268);
      ctx.bezierCurveTo(218, 236, 238, 182, 208, 146);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(78, 146);
      ctx.bezierCurveTo(60, 190, 66, 238, 74, 264);
      ctx.moveTo(242, 146);
      ctx.bezierCurveTo(260, 190, 254, 238, 246, 264);
      ctx.stroke();
      /* ribbons */
      ctx.fillStyle = a.ribbon || '#c92f64';
      ctx.beginPath();
      ctx.moveTo(84, 118);
      ctx.lineTo(54, 104);
      ctx.lineTo(62, 134);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(84, 118);
      ctx.lineTo(66, 96);
      ctx.lineTo(96, 100);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(236, 118);
      ctx.lineTo(266, 104);
      ctx.lineTo(258, 134);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(236, 118);
      ctx.lineTo(254, 96);
      ctx.lineTo(224, 100);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = a.accent;
      ell(ctx, 84, 118, 7, 7);
      ctx.fill();
      ell(ctx, 236, 118, 7, 7);
      ctx.fill();
    } else if (style === 'yumi') {
      /* high ponytail */
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(196, 66);
      ctx.bezierCurveTo(250, 44, 292, 80, 286, 132);
      ctx.bezierCurveTo(280, 192, 252, 242, 238, 276);
      ctx.bezierCurveTo(230, 292, 206, 284, 212, 258);
      ctx.bezierCurveTo(224, 210, 252, 178, 248, 138);
      ctx.bezierCurveTo(246, 106, 224, 92, 194, 96);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.27)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(224, 92);
      ctx.bezierCurveTo(270, 104, 266, 158, 248, 208);
      ctx.stroke();
      ctx.strokeStyle = a.hairDark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(214, 92);
      ctx.bezierCurveTo(252, 104, 250, 154, 234, 202);
      ctx.stroke();
      /* tie */
      ctx.fillStyle = a.accent;
      ctx.save();
      ctx.translate(212, 92);
      ctx.rotate(0.5);
      rr(ctx, -15, -7, 30, 14, 5);
      ctx.fill();
      ctx.fillStyle = '#fff2c4';
      ctx.fillRect(-15, -2, 30, 3);
      ctx.restore();
    } else if (style === 'hana') {
      /* long wavy hair */
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(88, 150);
      ctx.bezierCurveTo(64, 200, 70, 244, 58, 276);
      ctx.quadraticCurveTo(78, 274, 84, 292);
      ctx.quadraticCurveTo(104, 276, 112, 292);
      ctx.quadraticCurveTo(130, 274, 140, 288);
      ctx.lineTo(146, 252);
      ctx.lineTo(174, 288);
      ctx.lineTo(180, 250);
      ctx.quadraticCurveTo(198, 278, 208, 290);
      ctx.quadraticCurveTo(222, 270, 236, 290);
      ctx.quadraticCurveTo(246, 272, 260, 278);
      ctx.bezierCurveTo(250, 242, 254, 198, 232, 150);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(82, 186);
      ctx.bezierCurveTo(76, 226, 82, 250, 94, 274);
      ctx.moveTo(238, 186);
      ctx.bezierCurveTo(244, 226, 238, 250, 226, 274);
      ctx.stroke();
    } else {
      /* wild dark mane */
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(86, 140);
      ctx.bezierCurveTo(50, 196, 58, 250, 44, 286);
      ctx.lineTo(76, 272);
      ctx.lineTo(86, 300);
      ctx.lineTo(110, 268);
      ctx.lineTo(124, 296);
      ctx.lineTo(142, 262);
      ctx.lineTo(160, 294);
      ctx.lineTo(178, 262);
      ctx.lineTo(196, 296);
      ctx.lineTo(212, 268);
      ctx.lineTo(236, 300);
      ctx.lineTo(246, 272);
      ctx.lineTo(276, 286);
      ctx.bezierCurveTo(262, 246, 270, 194, 234, 140);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = a.hairLight;
      ctx.beginPath();
      ctx.moveTo(60, 262);
      ctx.lineTo(76, 272);
      ctx.lineTo(82, 292);
      ctx.lineTo(70, 278);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(260, 262);
      ctx.lineTo(246, 272);
      ctx.lineTo(240, 292);
      ctx.lineTo(252, 278);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 154, 132, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(96, 168);
      ctx.bezierCurveTo(74, 210, 80, 250, 92, 280);
      ctx.moveTo(224, 168);
      ctx.bezierCurveTo(246, 210, 240, 250, 228, 280);
      ctx.stroke();
    }
  }

  /* ------------------------------------------------------------------ */
  /*  BODY                                                              */
  /* ------------------------------------------------------------------ */

  function body(ctx, a, style) {
    /* neck */
    const ng = ctx.createLinearGradient(140, 200, 180, 260);
    ng.addColorStop(0, a.skinShade);
    ng.addColorStop(0.5, a.skin);
    ng.addColorStop(1, a.skinShade);
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.moveTo(140, 198);
    ctx.bezierCurveTo(140, 224, 138, 244, 132, 258);
    ctx.quadraticCurveTo(160, 270, 188, 258);
    ctx.bezierCurveTo(182, 244, 180, 224, 180, 198);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(196, 116, 112, 0.18)';
    ell(ctx, 160, 212, 21, 8);
    ctx.fill();

    /* shoulders */
    const og = ctx.createLinearGradient(40, 250, 280, 320);
    og.addColorStop(0, a.outfitDark);
    og.addColorStop(0.35, a.outfit);
    og.addColorStop(1, a.outfitDark);
    ctx.fillStyle = og;
    ctx.beginPath();
    ctx.moveTo(22, 320);
    ctx.bezierCurveTo(30, 276, 70, 250, 116, 242);
    ctx.bezierCurveTo(132, 256, 146, 262, 160, 262);
    ctx.bezierCurveTo(174, 262, 188, 256, 204, 242);
    ctx.bezierCurveTo(250, 250, 290, 276, 298, 320);
    ctx.closePath();
    ctx.fill();

    /* neckline / collar */
    if (style === 'sakura') {
      ctx.fillStyle = '#fff8fa';
      ctx.beginPath();
      ctx.moveTo(116, 244);
      ctx.lineTo(160, 304);
      ctx.lineTo(144, 314);
      ctx.lineTo(104, 258);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(204, 244);
      ctx.lineTo(160, 304);
      ctx.lineTo(176, 314);
      ctx.lineTo(216, 258);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = a.accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(116, 248);
      ctx.lineTo(160, 300);
      ctx.lineTo(204, 248);
      ctx.stroke();
      ctx.fillStyle = a.accent;
      ctx.beginPath();
      ctx.moveTo(154, 286);
      ctx.lineTo(166, 286);
      ctx.lineTo(170, 312);
      ctx.lineTo(160, 304);
      ctx.lineTo(150, 312);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffd36e';
      ell(ctx, 160, 290, 4, 4);
      ctx.fill();
      ctx.save();
      ctx.translate(160, 300);
      ctx.rotate(0.2);
      rr(ctx, -20, 0, 40, 15, 3);
      ctx.fillStyle = '#d94577';
      ctx.fill();
      ctx.fillStyle = '#ffd36e';
      ctx.fillRect(-20, 5, 40, 3);
      ctx.restore();
    } else if (style === 'yumi') {
      ctx.fillStyle = '#1e2c55';
      ctx.beginPath();
      ctx.moveTo(116, 242);
      ctx.quadraticCurveTo(140, 252, 160, 268);
      ctx.quadraticCurveTo(180, 252, 204, 242);
      ctx.lineTo(216, 258);
      ctx.quadraticCurveTo(188, 274, 160, 292);
      ctx.quadraticCurveTo(132, 274, 104, 258);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = a.accent;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(112, 250);
      ctx.quadraticCurveTo(138, 262, 160, 280);
      ctx.quadraticCurveTo(182, 262, 208, 250);
      ctx.stroke();
      ctx.fillStyle = a.accent;
      ctx.beginPath();
      ctx.moveTo(160, 278);
      ctx.lineTo(170, 292);
      ctx.lineTo(160, 308);
      ctx.lineTo(150, 292);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#243467';
      ctx.beginPath();
      ctx.moveTo(56, 262);
      ctx.lineTo(96, 278);
      ctx.lineTo(90, 302);
      ctx.lineTo(46, 292);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(264, 262);
      ctx.lineTo(224, 278);
      ctx.lineTo(230, 302);
      ctx.lineTo(274, 292);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = a.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(48, 287);
      ctx.lineTo(90, 296);
      ctx.moveTo(272, 287);
      ctx.lineTo(230, 296);
      ctx.stroke();
      /* quiver strap */
      ctx.strokeStyle = '#8a5a35';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(112, 244);
      ctx.lineTo(208, 318);
      ctx.stroke();
      ctx.strokeStyle = a.accent;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(114, 248);
      ctx.lineTo(204, 316);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (style === 'hana') {
      ctx.fillStyle = '#e9fbf0';
      ctx.beginPath();
      ctx.moveTo(112, 244);
      ctx.quadraticCurveTo(136, 254, 160, 280);
      ctx.quadraticCurveTo(184, 254, 208, 244);
      ctx.lineTo(220, 264);
      ctx.quadraticCurveTo(188, 286, 160, 310);
      ctx.quadraticCurveTo(132, 286, 100, 264);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5fbe8a';
      ctx.beginPath();
      ctx.moveTo(160, 270);
      ctx.bezierCurveTo(146, 280, 142, 296, 160, 316);
      ctx.bezierCurveTo(178, 296, 174, 280, 160, 270);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3d966b';
      ctx.beginPath();
      ctx.moveTo(160, 270);
      ctx.lineTo(160, 314);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      /* leaf clasp */
      ctx.fillStyle = '#4d9e6f';
      ctx.save();
      ctx.translate(160, 282);
      ctx.rotate(-0.4);
      ell(ctx, -12, 0, 14, 5);
      ctx.fill();
      ctx.rotate(0.8);
      ell(ctx, -12, 0, 14, 5);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = a.accent;
      ell(ctx, 160, 282, 8, 8);
      ctx.fill();
      /* cape folds */
      ctx.strokeStyle = 'rgba(61, 150, 107, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(106, 258);
      ctx.bezierCurveTo(94, 280, 92, 300, 96, 320);
      ctx.moveTo(214, 258);
      ctx.bezierCurveTo(226, 280, 228, 300, 224, 320);
      ctx.stroke();
    } else {
      /* armor */
      ctx.fillStyle = '#2c1b2a';
      ctx.beginPath();
      ctx.moveTo(108, 244);
      ctx.quadraticCurveTo(136, 258, 160, 274);
      ctx.quadraticCurveTo(184, 258, 212, 244);
      ctx.lineTo(226, 266);
      ctx.lineTo(196, 292);
      ctx.lineTo(160, 306);
      ctx.lineTo(124, 292);
      ctx.lineTo(94, 266);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5d2c3c';
      ctx.beginPath();
      ctx.moveTo(98, 258);
      ctx.lineTo(136, 280);
      ctx.lineTo(112, 318);
      ctx.lineTo(80, 306);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(222, 258);
      ctx.lineTo(184, 280);
      ctx.lineTo(208, 318);
      ctx.lineTo(240, 306);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = a.accent;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(80, 305);
      ctx.lineTo(112, 317);
      ctx.moveTo(240, 305);
      ctx.lineTo(208, 317);
      ctx.moveTo(160, 278);
      ctx.lineTo(160, 314);
      ctx.stroke();
      /* scarf */
      ctx.fillStyle = '#b3394c';
      ctx.beginPath();
      ctx.moveTo(126, 240);
      ctx.quadraticCurveTo(160, 260, 194, 240);
      ctx.quadraticCurveTo(206, 254, 190, 264);
      ctx.quadraticCurveTo(160, 280, 130, 264);
      ctx.quadraticCurveTo(114, 254, 126, 240);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d95662';
      ctx.beginPath();
      ctx.moveTo(158, 266);
      ctx.lineTo(176, 320);
      ctx.lineTo(158, 304);
      ctx.lineTo(144, 320);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = a.accent;
      ell(ctx, 160, 258, 7, 7);
      ctx.fill();
      ctx.fillStyle = '#3c2130';
      ell(ctx, 160, 258, 3, 3);
      ctx.fill();
    }

    /* shoulder rim light */
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(54, 280);
    ctx.quadraticCurveTo(82, 256, 114, 247);
    ctx.moveTo(266, 280);
    ctx.quadraticCurveTo(238, 256, 206, 247);
    ctx.stroke();
  }

  /* ------------------------------------------------------------------ */
  /*  FACE                                                              */
  /* ------------------------------------------------------------------ */

  function eye(ctx, cx, cy, a, style, side) {
    ctx.save();

    const white = ctx.createLinearGradient(0, cy - 16, 0, cy + 16);
    white.addColorStop(0, '#fffafd');
    white.addColorStop(1, '#ffe4ee');
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 2);
    ctx.bezierCurveTo(cx - 13, cy - 16, cx + 13, cy - 16, cx + 15, cy - 2);
    ctx.bezierCurveTo(cx + 11, cy + 14, cx - 11, cy + 14, cx - 15, cy - 2);
    ctx.closePath();
    ctx.fill();

    /* iris */
    const ig = ctx.createLinearGradient(0, cy - 12, 0, cy + 13);
    ig.addColorStop(0, a.eyeDark);
    ig.addColorStop(0.48, a.eye);
    ig.addColorStop(1, a.eyeLight || a.eye);
    ctx.fillStyle = ig;
    ell(ctx, cx, cy + 1, 10, 12.6);
    ctx.fill();

    /* iris top shade */
    ctx.fillStyle = 'rgba(30, 12, 36, 0.24)';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 7, 9.8, 5.4, 0, 0, TAU);
    ctx.fill();

    /* pupil */
    const pg = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 8);
    pg.addColorStop(0, '#3b2545');
    pg.addColorStop(1, '#1a0e22');
    ctx.fillStyle = pg;
    ell(ctx, cx, cy + 1, 4.4, 7.2);
    ctx.fill();

    /* iris bottom glow */
    ctx.fillStyle = a.eyeLight || 'rgba(255,255,255,0.6)';
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, 6.4, 2.6, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;

    /* highlights */
    ctx.fillStyle = '#ffffff';
    ell(ctx, cx - 4, cy - 5.4, 3.3, 3.3);
    ctx.fill();
    ell(ctx, cx + 4.4, cy + 4.4, 1.7, 1.7);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ell(ctx, cx + 2.2, cy - 5, 1, 1);
    ctx.fill();

    /* upper lashes */
    ctx.strokeStyle = a.lash || '#3a2036';
    ctx.lineWidth = 4.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 15.5, cy - 2.5);
    ctx.bezierCurveTo(cx - 13, cy - 17, cx + 12, cy - 17, cx + 15.5, cy - 3);
    ctx.stroke();
    ctx.lineWidth = 2.2;
    const outer = side < 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + outer * 14, cy - 6);
    ctx.lineTo(cx + outer * 19, cy - 10);
    ctx.stroke();

    /* lower lid */
    ctx.strokeStyle = 'rgba(100, 48, 68, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 13.4);
    ctx.quadraticCurveTo(cx, cy + 17, cx + 12, cy + 13.4);
    ctx.stroke();

    /* crease */
    ctx.strokeStyle = 'rgba(110, 56, 76, 0.3)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - 11, cy - 17);
    ctx.quadraticCurveTo(cx, cy - 20.5, cx + 11, cy - 17);
    ctx.stroke();

    /* brow */
    ctx.strokeStyle = a.hairDark;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (style === 'kaede') {
      ctx.moveTo(cx - 13, cy - 27);
      ctx.lineTo(cx + 13, cy - 30);
    } else if (style === 'yumi') {
      ctx.moveTo(cx - 12, cy - 28);
      ctx.quadraticCurveTo(cx, cy - 31.5, cx + 12, cy - 27);
    } else {
      ctx.moveTo(cx - 12, cy - 27);
      ctx.quadraticCurveTo(cx - 2, cy - 31.5, cx + 12, cy - 27.5);
    }
    ctx.stroke();
    ctx.restore();
  }

  function face(ctx, a, style) {
    /* ears */
    ctx.fillStyle = a.skinShade;
    ell(ctx, 96, 162, 8, 12, -0.16);
    ctx.fill();
    ell(ctx, 224, 162, 8, 12, 0.16);
    ctx.fill();
    ctx.fillStyle = 'rgba(198, 116, 120, 0.24)';
    ell(ctx, 96, 162, 4.2, 7.5, -0.16);
    ctx.fill();
    ell(ctx, 224, 162, 4.2, 7.5, 0.16);
    ctx.fill();

    /* face */
    const fg = ctx.createLinearGradient(0, 80, 0, 218);
    fg.addColorStop(0, '#fff4ea');
    fg.addColorStop(0.5, a.skin);
    fg.addColorStop(1, a.skinShade);
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(160, 77);
    ctx.bezierCurveTo(202, 77, 221, 102, 220, 142);
    ctx.bezierCurveTo(221, 172, 205, 207, 160, 214);
    ctx.bezierCurveTo(115, 207, 99, 172, 100, 142);
    ctx.bezierCurveTo(99, 102, 118, 77, 160, 77);
    ctx.closePath();
    ctx.fill();

    /* side shading */
    ctx.fillStyle = 'rgba(214, 134, 128, 0.16)';
    ell(ctx, 107, 156, 9, 33);
    ctx.fill();
    ell(ctx, 213, 156, 9, 33);
    ctx.fill();

    /* forehead light */
    ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
    ell(ctx, 160, 116, 38, 14);
    ctx.fill();

    eye(ctx, 131, 160, a, style, -1);
    eye(ctx, 189, 160, a, style, 1);

    /* nose */
    ctx.strokeStyle = 'rgba(182, 100, 102, 0.5)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(160, 182);
    ctx.quadraticCurveTo(157, 186, 160.5, 186.6);
    ctx.stroke();

    /* blush */
    const blush = ctx.createRadialGradient(118, 190, 2, 118, 190, 19);
    blush.addColorStop(0, 'rgba(255, 116, 148, 0.3)');
    blush.addColorStop(1, 'rgba(255, 116, 148, 0)');
    ctx.fillStyle = blush;
    ctx.fillRect(96, 172, 46, 36);
    const blush2 = ctx.createRadialGradient(202, 190, 2, 202, 190, 19);
    blush2.addColorStop(0, 'rgba(255, 116, 148, 0.3)');
    blush2.addColorStop(1, 'rgba(255, 116, 148, 0)');
    ctx.fillStyle = blush2;
    ctx.fillRect(180, 172, 46, 36);

    /* mouth */
    ctx.fillStyle = '#b8445c';
    ctx.beginPath();
    ctx.moveTo(151, 199);
    ctx.quadraticCurveTo(160, 195.5, 169, 199);
    ctx.quadraticCurveTo(160, 210, 151, 199);
    ctx.fill();
    ctx.fillStyle = '#ff9eb1';
    ctx.beginPath();
    ctx.moveTo(154, 203);
    ctx.quadraticCurveTo(160, 207, 166, 203);
    ctx.quadraticCurveTo(160, 210, 154, 203);
    ctx.fill();
    if (style === 'kaede') {
      ctx.fillStyle = '#fff8f2';
      ctx.beginPath();
      ctx.moveTo(154.5, 199.5);
      ctx.lineTo(158, 199.3);
      ctx.lineTo(155.5, 203.6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(130, 60, 78, 0.34)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(151, 198);
    ctx.quadraticCurveTo(160, 195, 169, 198);
    ctx.stroke();

    /* chin shadow */
    ctx.fillStyle = 'rgba(210, 124, 120, 0.18)';
    ell(ctx, 160, 208, 15, 4);
    ctx.fill();

    /* earring */
    if (style === 'yumi') {
      ctx.strokeStyle = a.accent;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(224, 172);
      ctx.lineTo(224, 178);
      ctx.stroke();
      ctx.fillStyle = a.accent;
      star(ctx, 224, 183, 4, a.accent, 4, 0.4);
    }
    if (style === 'sakura') {
      ctx.fillStyle = '#ffd36e';
      ell(ctx, 97, 174, 2.4, 2.4);
      ctx.fill();
      ell(ctx, 223, 174, 2.4, 2.4);
      ctx.fill();
    }
  }

  /* ------------------------------------------------------------------ */
  /*  FRONT HAIR + ACCESSORIES                                          */
  /* ------------------------------------------------------------------ */

  function frontHair(ctx, a, style) {
    if (style === 'kaede') {
      /* horns behind fringe */
      ctx.fillStyle = '#e7c8a6';
      ctx.beginPath();
      ctx.moveTo(118, 74);
      ctx.bezierCurveTo(108, 48, 92, 26, 82, 34);
      ctx.bezierCurveTo(86, 52, 102, 74, 116, 84);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(202, 74);
      ctx.bezierCurveTo(212, 48, 228, 26, 238, 34);
      ctx.bezierCurveTo(234, 52, 218, 74, 204, 84);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(168, 116, 78, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(110, 70);
      ctx.bezierCurveTo(102, 52, 94, 42, 91, 39);
      ctx.moveTo(210, 70);
      ctx.bezierCurveTo(218, 52, 226, 42, 229, 39);
      ctx.stroke();
      ctx.strokeStyle = a.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(112, 78);
      ctx.lineTo(122, 86);
      ctx.moveTo(208, 78);
      ctx.lineTo(198, 86);
      ctx.stroke();
    }

    const hg = hairGrad(ctx, a, 50, 160);
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.moveTo(92, 152);
    ctx.bezierCurveTo(85, 92, 114, 56, 160, 56);
    ctx.bezierCurveTo(206, 56, 235, 92, 228, 152);

    if (style === 'yumi') {
      ctx.lineTo(218, 138);
      ctx.quadraticCurveTo(210, 141, 204, 137);
      ctx.lineTo(196, 122);
      ctx.lineTo(184, 140);
      ctx.lineTo(174, 122);
      ctx.lineTo(162, 141);
      ctx.lineTo(150, 122);
      ctx.lineTo(138, 140);
      ctx.lineTo(126, 122);
      ctx.lineTo(116, 138);
      ctx.quadraticCurveTo(106, 142, 100, 138);
      ctx.lineTo(92, 152);
    } else if (style === 'kaede') {
      ctx.lineTo(222, 132);
      ctx.lineTo(214, 154);
      ctx.lineTo(204, 128);
      ctx.lineTo(194, 152);
      ctx.lineTo(182, 122);
      ctx.lineTo(170, 150);
      ctx.lineTo(158, 120);
      ctx.lineTo(146, 152);
      ctx.lineTo(136, 124);
      ctx.lineTo(124, 150);
      ctx.lineTo(114, 130);
      ctx.lineTo(102, 154);
      ctx.lineTo(96, 132);
      ctx.closePath();
      ctx.fill();
      /* long center strand over right eye */
      ctx.fillStyle = a.hair;
      ctx.beginPath();
      ctx.moveTo(196, 112);
      ctx.bezierCurveTo(212, 134, 204, 174, 188, 196);
      ctx.bezierCurveTo(198, 166, 194, 136, 184, 118);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = a.hairLight;
      ctx.beginPath();
      ctx.moveTo(206, 110);
      ctx.bezierCurveTo(210, 100, 216, 88, 221, 82);
      ctx.bezierCurveTo(218, 94, 214, 106, 212, 118);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 160, 140, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(214, 118);
      ctx.bezierCurveTo(214, 148, 204, 170, 192, 188);
      ctx.stroke();
    } else if (style === 'hana') {
      ctx.quadraticCurveTo(220, 150, 210, 142);
      ctx.quadraticCurveTo(204, 152, 197, 139);
      ctx.quadraticCurveTo(188, 154, 179, 138);
      ctx.quadraticCurveTo(170, 152, 163, 136);
      ctx.quadraticCurveTo(155, 153, 146, 138);
      ctx.quadraticCurveTo(136, 153, 126, 138);
      ctx.quadraticCurveTo(117, 152, 108, 139);
      ctx.quadraticCurveTo(100, 151, 92, 152);
    } else {
      ctx.quadraticCurveTo(220, 148, 212, 136);
      ctx.quadraticCurveTo(205, 150, 198, 137);
      ctx.quadraticCurveTo(190, 152, 182, 132);
      ctx.quadraticCurveTo(174, 146, 166, 126);
      ctx.quadraticCurveTo(160, 146, 154, 126);
      ctx.quadraticCurveTo(146, 146, 138, 132);
      ctx.quadraticCurveTo(130, 152, 122, 137);
      ctx.quadraticCurveTo(115, 150, 108, 136);
      ctx.quadraticCurveTo(101, 148, 92, 152);
    }
    ctx.closePath();
    ctx.fill();

    /* side locks */
    ctx.fillStyle = a.hair;
    ctx.beginPath();
    ctx.moveTo(94, 128);
    ctx.bezierCurveTo(82, 166, 88, 212, 104, 238);
    ctx.bezierCurveTo(106, 204, 110, 170, 114, 146);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(226, 128);
    ctx.bezierCurveTo(238, 166, 232, 212, 216, 238);
    ctx.bezierCurveTo(214, 204, 210, 170, 206, 146);
    ctx.closePath();
    ctx.fill();

    if (style === 'sakura') {
      ctx.beginPath();
      ctx.moveTo(100, 130);
      ctx.bezierCurveTo(84, 168, 92, 220, 112, 250);
      ctx.bezierCurveTo(112, 208, 114, 168, 120, 142);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(220, 130);
      ctx.bezierCurveTo(236, 168, 228, 220, 208, 250);
      ctx.bezierCurveTo(208, 208, 206, 168, 200, 142);
      ctx.closePath();
      ctx.fill();
    }

    /* shine */
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.36)';
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(148, 96, 45, 3.5, 5.2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(156, 88, 52, 3.7, 5.4);
    ctx.stroke();

    if (style === 'yumi') {
      /* star clip */
      ctx.fillStyle = 'rgba(255, 220, 140, 0.2)';
      ell(ctx, 210, 110, 17, 17);
      ctx.fill();
      star(ctx, 210, 110, 12, a.accent, 4, 0.35);
      ctx.fillStyle = '#fff6d6';
      ell(ctx, 210, 110, 3.5, 3.5);
      ctx.fill();
    } else if (style === 'sakura') {
      ctx.save();
      ctx.translate(214, 108);
      ctx.rotate(-0.3);
      for (let i = 0; i < 5; i++) {
        const ang = (TAU / 5) * i - 0.3;
        ctx.fillStyle = i % 2 ? '#ffd6e6' : '#ff8fbd';
        ell(ctx, Math.cos(ang) * 10, Math.sin(ang) * 10, 9, 5.5, ang);
        ctx.fill();
      }
      ctx.fillStyle = '#ffd36e';
      ell(ctx, 0, 0, 5, 5);
      ctx.fill();
      ctx.strokeStyle = '#ffd36e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6, 12);
      ctx.lineTo(20, 30);
      ctx.moveTo(2, 14);
      ctx.lineTo(12, 34);
      ctx.stroke();
      ctx.restore();
    } else if (style === 'hana') {
      /* flower crown */
      const flowers = [
        [103, 96, '#ffd2e2'], [126, 78, '#fff4ce'], [153, 69, '#ffb8d0'],
        [182, 72, '#fff4ce'], [207, 86, '#ffc6dc'], [224, 106, '#fff4ce']
      ];
      for (let i = 0; i < flowers.length; i++) {
        const f = flowers[i];
        ctx.save();
        ctx.translate(f[0], f[1]);
        ctx.rotate(i * 0.7);
        for (let p = 0; p < 5; p++) {
          const ang = (TAU / 5) * p;
          ctx.fillStyle = f[2];
          ell(ctx, Math.cos(ang) * 6.4, Math.sin(ang) * 6.4, 5.6, 3.6, ang);
          ctx.fill();
        }
        ctx.fillStyle = i % 2 ? '#e9a33a' : '#ffd36e';
        ell(ctx, 0, 0, 3, 3);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = 'rgba(91, 175, 118, 0.9)';
      ell(ctx, 113, 84, 8, 3.4, -0.6);
      ctx.fill();
      ell(ctx, 196, 76, 8, 3.4, 0.5);
      ctx.fill();
    }
  }

  /* ------------------------------------------------------------------ */
  /*  FOREGROUND / PORTRAIT ENTRY                                       */
  /* ------------------------------------------------------------------ */

  function foreground(ctx, a, index) {
    const rnd = seeded(index * 53 + 7);
    for (let i = 0; i < 9; i++) {
      const x = rnd() * 320;
      const y = rnd() * 320;
      const s = 2 + rnd() * 3;
      petal(ctx, x, y, s, rnd() * TAU, 'rgba(255, 235, 245, ' + (0.2 + rnd() * 0.3) + ')');
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    for (let i = 0; i < 5; i++) {
      const x = 24 + rnd() * 272;
      const y = 22 + rnd() * 120;
      star(ctx, x, y, 1.2 + rnd() * 2.2, 'rgba(255,255,255,0.7)', 4, 0.25);
    }

    /* rim light on hair */
    ctx.strokeStyle = 'rgba(255, 240, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(160, 126, 77, 3.45, 4.7);
    ctx.stroke();

    const vg = ctx.createRadialGradient(160, 150, 110, 160, 150, 230);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(10, 4, 18, 0.36)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, 320, 320);
  }

  function drawPortrait(canvas, char) {
    const ctx = canvas.getContext('2d');
    const a = char.art;
    canvas.width = 320;
    canvas.height = 320;
    ctx.clearRect(0, 0, 320, 320);

    bg(ctx, a, char.index || 0);
    weaponBack(ctx, a, a.style);
    backHair(ctx, a, a.style);
    body(ctx, a, a.style);
    face(ctx, a, a.style);
    frontHair(ctx, a, a.style);
    foreground(ctx, a, char.index || 0);
  }

  window.ART.drawPortrait = drawPortrait;
})();
