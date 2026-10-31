/* Sakura Clash — chibi heroine art for the battlefield. */
(function () {
  'use strict';

  const U = window.ART.util;
  const TAU = U.TAU;
  const ell = U.ell;
  const rr = U.rr;
  const petal = U.petal;
  const star = U.star;

  function hairCap(ctx, a, style) {
    ctx.fillStyle = a.hair;
    ctx.beginPath();
    ctx.moveTo(-11.2, -46.5);
    ctx.bezierCurveTo(-12.5, -59, -6.5, -62.5, 0, -62.5);
    ctx.bezierCurveTo(7.5, -62.5, 12.8, -58, 11.4, -46.5);

    if (style === 'yumi') {
      ctx.lineTo(9, -49.4);
      ctx.quadraticCurveTo(6.4, -50.8, 4.2, -49.2);
      ctx.quadraticCurveTo(2.6, -50.8, 0.4, -49.3);
      ctx.quadraticCurveTo(-1.8, -50.6, -3.6, -49.1);
      ctx.quadraticCurveTo(-5.6, -50.7, -7.6, -49.3);
      ctx.lineTo(-11.2, -46.5);
    } else if (style === 'kaede') {
      ctx.lineTo(9.2, -48.6);
      ctx.lineTo(6.6, -52);
      ctx.lineTo(4.2, -48.9);
      ctx.lineTo(1.4, -52.2);
      ctx.lineTo(-1.2, -48.8);
      ctx.lineTo(-4.2, -52.4);
      ctx.lineTo(-6.8, -49);
      ctx.lineTo(-9.6, -51.2);
      ctx.lineTo(-11.2, -46.5);
    } else if (style === 'hana') {
      ctx.quadraticCurveTo(8, -49.2, 6.2, -47.8);
      ctx.quadraticCurveTo(3.3, -50.2, 0.4, -48.2);
      ctx.quadraticCurveTo(-2.6, -50.4, -5.2, -48);
      ctx.quadraticCurveTo(-8, -50.2, -11.2, -46.5);
    } else {
      ctx.quadraticCurveTo(8.4, -50.6, 7, -47.5);
      ctx.quadraticCurveTo(4.4, -51, 2.5, -47.8);
      ctx.quadraticCurveTo(0, -51.6, -1.8, -47.8);
      ctx.quadraticCurveTo(-4.4, -51, -6.6, -47.4);
      ctx.quadraticCurveTo(-8.8, -50.4, -11.2, -46.5);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
    ctx.lineWidth = 0.9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(-1.5, -52, 7.2, 3.55, 4.8);
    ctx.stroke();

    /* side locks */
    ctx.fillStyle = a.hair;
    ctx.beginPath();
    ctx.moveTo(-10.4, -50);
    ctx.bezierCurveTo(-14, -45, -13.4, -38, -11.8, -34.5);
    ctx.bezierCurveTo(-10.6, -38, -9.2, -43, -8.4, -48);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10.4, -50);
    ctx.bezierCurveTo(14, -45, 13.4, -38, 11.8, -34.5);
    ctx.bezierCurveTo(10.6, -38, 9.2, -43, 8.4, -48);
    ctx.closePath();
    ctx.fill();
  }

  function backHair(ctx, a, style) {
    ctx.fillStyle = a.hairDark;
    ell(ctx, 0, -48, 13.4, 13.6);
    ctx.fill();

    if (style === 'sakura') {
      ctx.strokeStyle = a.hair;
      ctx.lineWidth = 6.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-8, -53);
      ctx.bezierCurveTo(-22, -49, -22, -31, -17.5, -21);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, -53);
      ctx.bezierCurveTo(22, -49, 22, -31, 17.5, -21);
      ctx.stroke();
      ctx.strokeStyle = a.hairLight;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-9, -50);
      ctx.bezierCurveTo(-19, -44, -19, -31, -16, -24);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(9, -50);
      ctx.bezierCurveTo(19, -44, 19, -31, 16, -24);
      ctx.stroke();
      ctx.fillStyle = a.accent;
      ell(ctx, -8.4, -53.2, 2.4, 2.1);
      ctx.fill();
      ell(ctx, 8.4, -53.2, 2.4, 2.1);
      ctx.fill();
    } else if (style === 'yumi') {
      ctx.strokeStyle = a.hair;
      ctx.lineWidth = 6.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(2, -57);
      ctx.bezierCurveTo(15, -59, 23, -49, 22, -36);
      ctx.bezierCurveTo(21.4, -28, 18.5, -23, 16.5, -19);
      ctx.stroke();
      ctx.strokeStyle = a.hairLight;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(5, -55);
      ctx.bezierCurveTo(14, -55, 19.6, -47, 19.4, -37);
      ctx.stroke();
      ctx.fillStyle = a.accent;
      ell(ctx, 3.4, -57, 2.2, 2.2);
      ctx.fill();
    } else if (style === 'hana') {
      ctx.fillStyle = a.hair;
      ctx.beginPath();
      ctx.moveTo(-11, -55);
      ctx.bezierCurveTo(-20, -45, -18, -32, -13, -24);
      ctx.quadraticCurveTo(-8, -28, -6, -22);
      ctx.quadraticCurveTo(-1, -28, 3, -21);
      ctx.quadraticCurveTo(8, -27, 11, -23);
      ctx.bezierCurveTo(18, -33, 19, -46, 10, -55);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = a.hairLight;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-13, -40);
      ctx.quadraticCurveTo(-10, -34, -11, -27);
      ctx.moveTo(13, -41);
      ctx.quadraticCurveTo(11, -34, 12, -27);
      ctx.stroke();
    } else {
      ctx.fillStyle = a.hair;
      ctx.beginPath();
      ctx.moveTo(-10, -58);
      ctx.bezierCurveTo(-21, -51, -20, -34, -15, -23);
      ctx.lineTo(-10, -27);
      ctx.lineTo(-6, -20);
      ctx.lineTo(-1, -26);
      ctx.lineTo(4, -20);
      ctx.lineTo(8, -27);
      ctx.lineTo(14, -23);
      ctx.bezierCurveTo(20, -38, 19, -51, 10, -58);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = a.hairLight;
      ctx.beginPath();
      ctx.moveTo(-14, -31);
      ctx.lineTo(-10, -23);
      ctx.lineTo(-7, -30);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(14, -30);
      ctx.lineTo(11, -22);
      ctx.lineTo(8, -29);
      ctx.closePath();
      ctx.fill();
    }
  }

  function weaponBack(ctx, a, style, attack) {
    ctx.save();
    if (style === 'sakura') {
      const lift = attack * 2.2;
      ctx.translate(10, -33 - lift);
      ctx.rotate(-0.32 - attack * 0.45);
      ctx.strokeStyle = '#4a2b35';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(1.5, -5);
      ctx.stroke();
      ctx.strokeStyle = '#ffe9b0';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 3.2);
      ctx.lineTo(1, -4);
      ctx.stroke();
      ctx.fillStyle = a.accent;
      rr(ctx, -2.6, -3.6, 7.2, 1.8, 0.9);
      ctx.fill();
      const blade = ctx.createLinearGradient(1, -7, 5, -29);
      blade.addColorStop(0, '#eef6ff');
      blade.addColorStop(0.55, '#b9d3e9');
      blade.addColorStop(1, '#ffffff');
      ctx.strokeStyle = blade;
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      ctx.moveTo(1.6, -6);
      ctx.lineTo(4.6, -25);
      ctx.lineTo(6.2, -31);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(2.2, -8);
      ctx.lineTo(4.4, -24);
      ctx.stroke();
    } else if (style === 'yumi') {
      ctx.translate(12, -9);
      ctx.rotate(0.05 + attack * 0.15);
      const bg = ctx.createLinearGradient(0, -45, 8, 0);
      bg.addColorStop(0, a.accent);
      bg.addColorStop(0.6, '#fff1c4');
      bg.addColorStop(1, a.accent);
      ctx.strokeStyle = bg;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(9, -22, 0, -44);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -44);
      ctx.stroke();
      ctx.fillStyle = a.accent;
      ell(ctx, 0, 0, 1.8, 1.8);
      ctx.fill();
      ell(ctx, 0, -44, 1.8, 1.8);
      ctx.fill();
    } else if (style === 'hana') {
      const orbGlow = 0.65 + Math.sin(attack * 4) * 0.1;
      ctx.strokeStyle = '#8f6a4b';
      ctx.lineWidth = 1.9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(15, -49);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 240, 186, 0.7)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(11.6, -1);
      ctx.lineTo(14.6, -47);
      ctx.stroke();
      ctx.fillStyle = 'rgba(157, 255, 198, ' + (0.14 * orbGlow) + ')';
      ell(ctx, 15, -54, 9, 9);
      ctx.fill();
      ctx.fillStyle = '#d6ffe6';
      ell(ctx, 15, -54, 3.4, 3.4);
      ctx.fill();
      ctx.fillStyle = a.accent;
      for (let i = 0; i < 5; i++) {
        const ang = (TAU / 5) * i;
        ell(ctx, 15 + Math.cos(ang) * 2.6, -54 + Math.sin(ang) * 2.6, 2.1, 1.1, ang);
        ctx.fill();
      }
    } else {
      ctx.translate(11, -30);
      ctx.rotate(-0.2 - attack * 0.3);
      const cg = ctx.createLinearGradient(-2, 0, 5, -27);
      cg.addColorStop(0, '#5a3a2f');
      cg.addColorStop(0.5, '#8d5d43');
      cg.addColorStop(1, '#4a2f2b');
      ctx.strokeStyle = cg;
      ctx.lineWidth = 4.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(5, -25);
      ctx.stroke();
      ctx.strokeStyle = a.accent;
      ctx.lineWidth = 1.1;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-2.4 + i * 0.6, -i * 6.5);
        ctx.lineTo(2.6 + i * 0.6, -i * 6.7);
        ctx.stroke();
      }
      ctx.fillStyle = '#d8b06a';
      ell(ctx, 5.2, -25.5, 2.2, 2.6);
      ctx.fill();
      ctx.fillStyle = '#3b2630';
      for (let i = 0; i < 4; i++) {
        ell(ctx, 2.3 + i * 0.75, -8 - i * 5, 0.85, 0.85);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function accessory(ctx, a, style) {
    if (style === 'sakura') {
      ctx.save();
      ctx.translate(7.6, -56.2);
      ctx.rotate(-0.2);
      for (let i = 0; i < 5; i++) {
        const ang = (TAU / 5) * i;
        ctx.fillStyle = i % 2 ? '#ffd9e7' : '#ff9dc4';
        ell(ctx, Math.cos(ang) * 2.2, Math.sin(ang) * 2.2, 1.7, 1.1, ang);
        ctx.fill();
      }
      ctx.fillStyle = '#ffd36e';
      ell(ctx, 0, 0, 1.1, 1.1);
      ctx.fill();
      ctx.restore();
    } else if (style === 'yumi') {
      ctx.save();
      ctx.translate(-6.6, -56.5);
      star(ctx, 0, 0, 3.1, '#ffe19a', 4, 0.34);
      ctx.fillStyle = '#fff6cf';
      ell(ctx, 0, 0, 0.9, 0.9);
      ctx.fill();
      ctx.restore();
    } else if (style === 'hana') {
      const spots = [[-6, -58.4, '#fff2c8'], [-2, -60.2, '#ffb7d2'], [2.2, -60.3, '#fff2c8'], [6.2, -58.6, '#ffb7d2']];
      for (let i = 0; i < spots.length; i++) {
        const s = spots[i];
        ctx.fillStyle = s[2];
        ctx.beginPath();
        ctx.arc(s[0], s[1], 2.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffd36e';
        ell(ctx, s[0], s[1], 0.8, 0.8);
        ctx.fill();
      }
      ctx.fillStyle = '#63b37d';
      ell(ctx, -8.4, -57.4, 2, 0.9, 0.6);
      ctx.fill();
      ell(ctx, 8.2, -57.6, 2, 0.9, -0.6);
      ctx.fill();
    } else {
      /* horns */
      ctx.fillStyle = '#e8c9a8';
      ctx.beginPath();
      ctx.moveTo(-7.8, -58.4);
      ctx.quadraticCurveTo(-10.4, -65.5, -5.6, -64.6);
      ctx.quadraticCurveTo(-5.4, -60.4, -3.8, -58.2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(7.8, -58.4);
      ctx.quadraticCurveTo(10.4, -65.5, 5.6, -64.6);
      ctx.quadraticCurveTo(5.4, -60.4, 3.8, -58.2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c49a72';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-7, -59.4);
      ctx.quadraticCurveTo(-8.6, -63.6, -6.2, -63.6);
      ctx.moveTo(7, -59.4);
      ctx.quadraticCurveTo(8.6, -63.6, 6.2, -63.6);
      ctx.stroke();
    }
  }

  function outfit(ctx, a, style) {
    /* legs */
    ctx.fillStyle = a.skin;
    rr(ctx, -5.6, -13, 4.4, 10, 2);
    ctx.fill();
    rr(ctx, 1.2, -13, 4.4, 10, 2);
    ctx.fill();
    ctx.fillStyle = '#463044';
    rr(ctx, -6.2, -5, 5.2, 4.6, 2);
    ctx.fill();
    rr(ctx, 1, -5, 5.2, 4.6, 2);
    ctx.fill();

    /* skirt */
    if (style === 'kaede') {
      ctx.fillStyle = a.outfitDark;
      ctx.beginPath();
      ctx.moveTo(-9.4, -27);
      ctx.lineTo(9.4, -27);
      ctx.lineTo(11.6, -10.5);
      ctx.lineTo(-11.6, -10.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = a.accent;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-10.4, -14);
      ctx.lineTo(10.4, -14);
      ctx.stroke();
      ctx.fillStyle = '#39243a';
      ctx.beginPath();
      ctx.moveTo(-4, -10.5);
      ctx.lineTo(0, -15);
      ctx.lineTo(4, -10.5);
      ctx.closePath();
      ctx.fill();
    } else {
      const skirt = ctx.createLinearGradient(0, -28, 0, -10);
      skirt.addColorStop(0, a.outfit);
      skirt.addColorStop(1, a.outfitDark);
      ctx.fillStyle = skirt;
      ctx.beginPath();
      ctx.moveTo(-8.6, -27);
      ctx.quadraticCurveTo(0, -29, 8.6, -27);
      ctx.lineTo(11.6, -10.5);
      ctx.quadraticCurveTo(0, -8, -11.6, -10.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(-8.8, -24.6);
      ctx.quadraticCurveTo(0, -26.2, 8.8, -24.6);
      ctx.stroke();
    }

    /* torso */
    const tg = ctx.createLinearGradient(-8, -38, 8, -22);
    tg.addColorStop(0, a.outfit);
    tg.addColorStop(1, a.outfitDark);
    ctx.fillStyle = tg;
    rr(ctx, -8, -38, 16, 14, 4.8);
    ctx.fill();

    /* collar */
    ctx.fillStyle = a.outfitDark;
    ctx.beginPath();
    ctx.moveTo(-8, -37.5);
    ctx.lineTo(-2.8, -33.5);
    ctx.lineTo(0, -37.5);
    ctx.lineTo(2.8, -33.5);
    ctx.lineTo(8, -37.5);
    ctx.lineTo(6.6, -40.6);
    ctx.lineTo(-6.6, -40.6);
    ctx.closePath();
    ctx.fill();

    /* outfit accents */
    if (style === 'sakura') {
      ctx.fillStyle = a.accent;
      rr(ctx, -8.2, -27.4, 16.4, 2.6, 1.2);
      ctx.fill();
      ctx.fillStyle = '#ffd36e';
      ell(ctx, 0, -26.2, 1.6, 1.6);
      ctx.fill();
      ctx.strokeStyle = a.accent;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-4.4, -35.4);
      ctx.lineTo(-1.4, -37.4);
      ctx.lineTo(1.4, -34.2);
      ctx.stroke();
    } else if (style === 'yumi') {
      ctx.fillStyle = a.accent;
      ctx.fillRect(-8.2, -29.4, 16.4, 0.9);
      ctx.fillRect(-8.2, -27.8, 16.4, 0.6);
      ctx.strokeStyle = '#e9c37e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-7, -38);
      ctx.lineTo(6.4, -26);
      ctx.stroke();
    } else if (style === 'hana') {
      ctx.fillStyle = '#5dbd8b';
      ctx.beginPath();
      ctx.moveTo(-7.6, -38);
      ctx.lineTo(-3.4, -34.6);
      ctx.lineTo(0, -36.2);
      ctx.lineTo(-4.4, -40);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = a.accent;
      ctx.beginPath();
      ctx.moveTo(0, -33.2);
      ctx.quadraticCurveTo(2.4, -31.4, 0, -29.4);
      ctx.quadraticCurveTo(-2.4, -31.4, 0, -33.2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#432b3d';
      rr(ctx, -9.4, -40.4, 18.8, 4.4, 2);
      ctx.fill();
      ctx.fillStyle = a.accent;
      rr(ctx, -9.2, -40.2, 18.4, 1, 0.5);
      ctx.fill();
      ctx.fillStyle = '#b23c4a';
      ctx.beginPath();
      ctx.moveTo(-5.6, -36.8);
      ctx.lineTo(0, -32.6);
      ctx.lineTo(5.6, -36.8);
      ctx.lineTo(4.4, -39);
      ctx.lineTo(0, -35.4);
      ctx.lineTo(-4.4, -39);
      ctx.closePath();
      ctx.fill();
    }

    /* arms */
    ctx.fillStyle = a.outfit;
    rr(ctx, -11.6, -36.2, 4.6, 12.4, 2.3);
    ctx.fill();
    rr(ctx, 7, -36.2, 4.6, 12.4, 2.3);
    ctx.fill();
    ctx.fillStyle = a.skin;
    ell(ctx, -9.4, -23.4, 2.2, 2.2);
    ctx.fill();
    ell(ctx, 9.4, -23.4, 2.2, 2.2);
    ctx.fill();
  }

  function face(ctx, a, style) {
    /* neck */
    ctx.fillStyle = a.skinShade;
    rr(ctx, -2.6, -39, 5.2, 4.4, 1.2);
    ctx.fill();

    /* head */
    const fg = ctx.createLinearGradient(-10, -55, 10, -37);
    fg.addColorStop(0, '#fff0e4');
    fg.addColorStop(0.65, a.skin);
    fg.addColorStop(1, a.skinShade);
    ctx.fillStyle = fg;
    ell(ctx, 0, -47, 10.4, 10.8);
    ctx.fill();

    /* ears */
    ctx.fillStyle = a.skin;
    ell(ctx, -10.4, -47, 1.7, 2.4);
    ctx.fill();
    ell(ctx, 10.4, -47, 1.7, 2.4);
    ctx.fill();

    /* eyes */
    const eyeY = -46.3;
    [-4.15, 4.15].forEach(function (ex, idx) {
      ctx.fillStyle = '#fffafd';
      ell(ctx, ex, eyeY, 2.15, 2.65);
      ctx.fill();
      ctx.fillStyle = a.eye;
      ell(ctx, ex, eyeY + 0.2, 1.65, 2.15);
      ctx.fill();
      ctx.fillStyle = '#2a182f';
      ell(ctx, ex, eyeY + 0.3, 0.95, 1.55);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ell(ctx, ex - 0.6, eyeY - 0.8, 0.72, 0.72);
      ctx.fill();
      ell(ctx, ex + 0.7, eyeY + 0.9, 0.38, 0.38);
      ctx.fill();
      /* lash */
      ctx.strokeStyle = '#3a2036';
      ctx.lineWidth = 0.85;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(ex, eyeY - 0.2, 2.35, Math.PI + 0.28, TAU - 0.22);
      ctx.stroke();
      if (idx === 1) {
        ctx.beginPath();
        ctx.moveTo(ex + 2, eyeY - 1.7);
        ctx.lineTo(ex + 2.8, eyeY - 2.3);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(ex - 2, eyeY - 1.7);
        ctx.lineTo(ex - 2.8, eyeY - 2.3);
        ctx.stroke();
      }
      /* brow */
      ctx.strokeStyle = a.hairDark;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      if (style === 'kaede') {
        ctx.moveTo(ex - 2, eyeY - 4.2);
        ctx.lineTo(ex + 2.2, eyeY - 4.8);
      } else {
        ctx.moveTo(ex - 1.9, eyeY - 4.5);
        ctx.quadraticCurveTo(ex, eyeY - 5.3, ex + 1.9, eyeY - 4.6);
      }
      ctx.stroke();
    });

    /* blush */
    ctx.fillStyle = 'rgba(255, 131, 160, 0.32)';
    ell(ctx, -6.4, -42.9, 2.3, 1.15);
    ctx.fill();
    ell(ctx, 6.4, -42.9, 2.3, 1.15);
    ctx.fill();

    /* mouth */
    ctx.strokeStyle = '#b34b65';
    ctx.lineWidth = 0.65;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (style === 'kaede') {
      ctx.moveTo(-1.2, -41);
      ctx.quadraticCurveTo(0, -40, 1.2, -41.1);
    } else {
      ctx.moveTo(-1, -41.2);
      ctx.quadraticCurveTo(0, -40.1, 1, -41.2);
    }
    ctx.stroke();
    if (style === 'kaede') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0.9, -40.9);
      ctx.lineTo(1.7, -40.4);
      ctx.lineTo(1.2, -40.1);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawUnit(ctx, u, t) {
    const a = u.card.art;
    const style = a.style;
    const teamColor = u.team === 'player' ? 'rgba(103, 228, 255, 0.9)' : 'rgba(255, 105, 146, 0.92)';
    const teamSoft = u.team === 'player' ? 'rgba(103, 228, 255, 0.28)' : 'rgba(255, 105, 146, 0.28)';
    const appear = u.appear == null ? 1 : u.appear;
    const walk = u.moving ? u.walkPhase : 0;
    const bob = Math.sin(t * 3.2 + u.seed) * 0.65 + (u.moving ? Math.abs(Math.sin(walk)) * 1.1 : 0);
    const lunge = u.attackAnim > 0 ? Math.sin((1 - u.attackAnim / 0.3) * Math.PI) * 2.4 : 0;
    const atk01 = u.attackAnim > 0 ? Math.sin((1 - u.attackAnim / 0.3) * Math.PI) : 0;

    ctx.save();
    ctx.translate(u.x, u.y);

    /* team ring */
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 1.3;
    ell(ctx, 0, 1.5, 13.5, 4.4);
    ctx.stroke();
    ctx.strokeStyle = teamSoft;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ell(ctx, 0, 1.5, 17.5, 5.8);
    ctx.stroke();
    ctx.setLineDash([]);

    /* shadow */
    ctx.fillStyle = 'rgba(39, 55, 40, 0.26)';
    ell(ctx, 0, 1.5, 11.5, 3.7);
    ctx.fill();

    const scale = (u.card.id === 'kaede' ? 1.1 : 1) * (0.32 + 0.68 * appear);
    if (u.team === 'enemy') ctx.scale(-1, 1);
    ctx.scale(scale, scale);
    ctx.translate(lunge, -bob);
    ctx.globalAlpha = Math.min(1, 0.25 + appear);

    weaponBack(ctx, a, style, atk01);
    backHair(ctx, a, style);
    outfit(ctx, a, style);
    face(ctx, a, style);
    hairCap(ctx, a, style);
    accessory(ctx, a, style);

    /* queen-of-the-lane sparkle for the tank */
    if (u.card.id === 'kaede') {
      ctx.strokeStyle = 'rgba(255, 211, 110, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-8.6, -34);
      ctx.lineTo(-8.6, -22);
      ctx.stroke();
    }

    ctx.restore();
  }

  window.ART.drawUnit = drawUnit;
})();
