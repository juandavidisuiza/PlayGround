/* Sakura Clash — UI, input, HUD, menu and main loop. */
(function () {
  'use strict';

  const G = window.Game;
  const $ = function (s) { return document.querySelector(s); };
  const TAU = Math.PI * 2;
  const SOUND_KEY = 'sakura-clash-sound';

  const ui = {};
  let soundOn = true;
  try { soundOn = localStorage.getItem(SOUND_KEY) !== '0'; } catch (e) { soundOn = true; }
  let lastManaFloor = -1;
  let lastPhase = '';
  let lastTimer = '';
  let toastTimer = null;
  let lastToast = 0;
  let announceTimer = null;
  let countdownTimer = null;
  let drag = null;
  let loopStarted = false;

  function init() {
    ui.canvas = $('#arena');
    ui.wrap = $('#arenaWrap');
    ui.ctx = ui.canvas.getContext('2d');
    ui.timer = $('#timer');
    ui.phase = $('#phase');
    ui.manaTrack = $('#manaTrack');
    ui.manaNum = $('#manaNum');
    ui.hand = $('#hand');
    ui.menu = $('#menu');
    ui.result = $('#result');
    ui.heroRow = $('#heroRow');
    ui.menuPetals = $('#menuPetals');
    ui.enemyCrowns = $('#enemyCrowns');
    ui.playerCrowns = $('#playerCrowns');
    ui.enemyFill = $('#enemyQueenFill');
    ui.playerFill = $('#playerQueenFill');
    ui.enemyHp = $('#enemyQueenHp');
    ui.playerHp = $('#playerQueenHp');
    ui.soundBtn = $('#soundBtn');
    ui.announce = $('#announce');
    ui.toast = $('#toast');
    ui.countdown = $('#countdown');
    ui.hint = $('#hint');
    ui.playBtn = $('#playBtn');
    ui.rematchBtn = $('#rematchBtn');
    ui.menuBtn = $('#menuBtn');
    ui.resultKicker = $('#resultKicker');
    ui.resultCrowns = $('#resultCrowns');
    ui.resultTitle = $('#resultTitle');
    ui.resultSub = $('#resultSub');
    ui.statTowers = $('#statTowers');
    ui.statHeroes = $('#statHeroes');
    ui.statDamage = $('#statDamage');
    ui.mvpRow = $('#mvpRow');

    buildHand();
    buildMenu();
    buildMana();
    bindEvents();
    resize(true);
    G.resetBoard();
    syncSoundButton();
    updateHUD();
    G.updateHUD = updateHUD;
    G.hideHint = function () { ui.hint.classList.add('hide'); };
    G.showCountdown = showCountdown;
    G.announce = announce;
    G.toast = toast;
    G.showResult = showResult;
    G.onMatchEnd = function () { ui.hint.classList.add('hide'); };

    if (!loopStarted) {
      loopStarted = true;
      requestAnimationFrame(loop);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  BUILD                                                             */
  /* ------------------------------------------------------------------ */

  function buildHand() {
    G.cards.forEach(function (card, i) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'card';
      el.dataset.card = card.id;
      el.style.setProperty('--c', card.color);
      el.setAttribute('aria-label', card.name + ', ' + card.cost + ' mana, ' + card.title);
      el.innerHTML =
        '<div class="card-art"><span class="cost">' + card.cost + '</span>' +
        '<canvas aria-hidden="true"></canvas></div>' +
        '<div class="card-meta"><span class="card-name">' + card.name + '</span>' +
        '<span class="card-role">' + card.role + '</span></div>';
      ui.hand.appendChild(el);
      const cv = el.querySelector('canvas');
      if (window.ART && ART.drawPortrait) ART.drawPortrait(cv, card);
      card.el = el;
      el.addEventListener('pointerdown', function (e) { onCardDown(e, card); });
      el.addEventListener('pointermove', onCardMove);
      el.addEventListener('pointerup', function (e) { onCardUp(e, card); });
      el.addEventListener('pointercancel', function () { drag = null; G.pointer = null; });
      el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (G.state !== 'playing') { flashToast('BATTLE STARTS SOON'); return; }
          toggleCard(card);
        }
      });
    });
  }

  function buildMenu() {
    G.cards.forEach(function (card) {
      const d = document.createElement('div');
      d.className = 'hero';
      d.style.setProperty('--c', card.color);
      d.innerHTML =
        '<div class="hero-face"><canvas aria-hidden="true"></canvas>' +
        '<span class="hero-cost">' + card.cost + '</span></div>' +
        '<span class="hero-name">' + card.name + '</span>';
      ui.heroRow.appendChild(d);
      const cv = d.querySelector('canvas');
      if (window.ART && ART.drawPortrait) ART.drawPortrait(cv, card);
    });

    const rnd = function () { return Math.random(); };
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('span');
      p.className = 'menu-petal';
      p.style.left = (rnd() * 104 - 2) + '%';
      p.style.width = (5 + rnd() * 7) + 'px';
      p.style.height = (4 + rnd() * 5) + 'px';
      p.style.animationDuration = (8 + rnd() * 12) + 's';
      p.style.animationDelay = (-rnd() * 18) + 's';
      p.style.opacity = (0.2 + rnd() * 0.5).toFixed(2);
      ui.menuPetals.appendChild(p);
    }
  }

  function buildMana() {
    ui.manaTrack.innerHTML = '';
    ui.segs = [];
    for (let i = 0; i < 10; i++) {
      const seg = document.createElement('span');
      seg.className = 'mana-seg';
      ui.manaTrack.appendChild(seg);
      ui.segs.push(seg);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  RESIZE                                                            */
  /* ------------------------------------------------------------------ */

  function resize(initial) {
    const rect = ui.wrap.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) {
      if (initial) requestAnimationFrame(function () { resize(true); });
      return;
    }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    ui.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    ui.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    G.layout(rect.width, rect.height, dpr);
    if (G.state === 'menu') updateHUD();
  }

  /* ------------------------------------------------------------------ */
  /*  HUD                                                               */
  /* ------------------------------------------------------------------ */

  function crownsMarkup(n) {
    let s = '';
    for (let i = 0; i < 3; i++) {
      s += '<svg class="crown' + (i < n ? ' on pop' : '') + '" viewBox="0 0 24 24" aria-hidden="true">' +
        '<use href="#i-crown"></use></svg>';
    }
    return s;
  }

  function setCrowns(el, n) {
    if (!el) return;
    if (el.dataset.count === String(n)) return;
    el.dataset.count = String(n);
    el.innerHTML = crownsMarkup(n);
  }

  function updateHUD() {
    if (!G.L) return;

    /* timer + phase */
    const left = Math.max(0, Math.ceil(G.timeLeft));
    const mm = Math.floor(left / 60);
    const ss = left % 60;
    const tstr = mm + ':' + (ss < 10 ? '0' : '') + ss;
    if (tstr !== lastTimer) {
      lastTimer = tstr;
      ui.timer.textContent = tstr;
    }
    let phase = 'BATTLE';
    let hot = false;
    if (G.state === 'menu') phase = 'READY';
    else if (G.state === 'countdown') phase = 'GET READY';
    else if (G.state === 'ended') phase = 'MATCH OVER';
    else if (G.overtime) { phase = 'SUDDEN DEATH'; hot = true; }
    else if (G.timeLeft <= 60) { phase = '2× MANA'; hot = true; }
    if (phase !== lastPhase) {
      lastPhase = phase;
      ui.phase.textContent = phase;
      ui.phase.classList.toggle('hot', hot);
    }

    /* queen bars */
    const eq = G.tower.enemy.queen;
    const pq = G.tower.player.queen;
    if (eq) {
      ui.enemyFill.style.width = Math.max(0, (eq.hp / eq.maxHp) * 100) + '%';
      ui.enemyHp.textContent = Math.max(0, Math.ceil(eq.hp));
    }
    if (pq) {
      ui.playerFill.style.width = Math.max(0, (pq.hp / pq.maxHp) * 100) + '%';
      ui.playerHp.textContent = Math.max(0, Math.ceil(pq.hp));
    }

    setCrowns(ui.enemyCrowns, G.crowns.enemy);
    setCrowns(ui.playerCrowns, G.crowns.player);

    /* mana */
    const floor = Math.floor(G.mana + 0.0001);
    if (floor !== lastManaFloor) {
      lastManaFloor = floor;
      for (let i = 0; i < ui.segs.length; i++) {
        const full = i < floor;
        ui.segs[i].classList.toggle('full', full);
        if (full && i === floor - 1) {
          ui.segs[i].classList.remove('pulse');
          void ui.segs[i].offsetWidth;
          ui.segs[i].classList.add('pulse');
        }
      }
      ui.manaNum.textContent = floor;
    }

    /* card availability */
    const playing = G.state === 'playing';
    G.cards.forEach(function (card) {
      const el = card.el;
      if (!el) return;
      const poor = !playing || G.mana + 0.001 < card.cost;
      if (el.classList.contains('poor') !== poor) el.classList.toggle('poor', poor);
      const sel = G.selected === card && playing;
      if (el.classList.contains('selected') !== sel) el.classList.toggle('selected', sel);
      el.setAttribute('aria-disabled', poor ? 'true' : 'false');
    });
  }

  /* ------------------------------------------------------------------ */
  /*  FEEDBACK                                                          */
  /* ------------------------------------------------------------------ */

  function announce(text, gold) {
    clearTimeout(announceTimer);
    ui.announce.textContent = text;
    ui.announce.classList.remove('show', 'gold');
    void ui.announce.offsetWidth;
    if (gold) ui.announce.classList.add('gold');
    ui.announce.classList.add('show');
    announceTimer = setTimeout(function () {
      ui.announce.classList.remove('show');
    }, 1750);
  }

  function toast(text, quiet) {
    const now = performance.now();
    if (quiet && now - lastToast < 2400) return;
    lastToast = now;
    clearTimeout(toastTimer);
    ui.toast.textContent = text;
    ui.toast.classList.add('show');
    toastTimer = setTimeout(function () { ui.toast.classList.remove('show'); }, 1550);
  }

  function flashToast(text) { toast(text); }

  function shakeCard(card) {
    const el = card.el;
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(function () { el.classList.remove('shake'); }, 380);
  }

  function showCountdown(text, fight) {
    clearTimeout(countdownTimer);
    ui.countdown.innerHTML = '<span>' + text + '</span>';
    ui.countdown.classList.remove('hidden');
    countdownTimer = setTimeout(function () {
      ui.countdown.classList.add('hidden');
    }, fight ? 820 : 960);
  }

  /* ------------------------------------------------------------------ */
  /*  INPUT                                                             */
  /* ------------------------------------------------------------------ */

  function updatePointerFromClient(cx, cy) {
    const rect = ui.canvas.getBoundingClientRect();
    if (cx < rect.left || cx > rect.right || cy < rect.top || cy > rect.bottom) {
      G.pointer = null;
      return;
    }
    const x = ((cx - rect.left) / rect.width) * G.W;
    const y = ((cy - rect.top) / rect.height) * G.L.H;
    G.pointer = { x: x, y: y, valid: G.canDeploy(x, y) };
  }

  function onCardDown(e, card) {
    if (e.button !== undefined && e.button !== 0) return;
    if (G.state !== 'playing') {
      if (G.state === 'countdown') flashToast('THE BATTLE STARTS IN A MOMENT');
      return;
    }
    e.preventDefault();
    G.setSoundEnabled(soundOn);
    if (G.mana + 0.001 < card.cost) {
      shakeCard(card);
      flashToast('NEED ' + card.cost + ' MANA');
      G.playSound('deny');
      return;
    }
    const wasSelected = G.selected === card;
    G.selected = card;
    G.playSound('select');
    drag = {
      card: card, pointerId: e.pointerId, moved: false, wasSelected: wasSelected,
      startX: e.clientX, startY: e.clientY
    };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    updateHUD();
  }

  function onCardMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) > 9) {
      drag.moved = true;
      ui.hint.classList.add('hide');
    }
    if (drag.moved) updatePointerFromClient(e.clientX, e.clientY);
  }

  function onCardUp(e, card) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const d = drag;
    drag = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}

    if (d.moved) {
      updatePointerFromClient(e.clientX, e.clientY);
      const p = G.pointer;
      if (p) attemptDeploy(p.x, p.y);
      else G.pointer = null;
    } else if (d.wasSelected) {
      G.selected = null;
      G.pointer = null;
      updateHUD();
    } else {
      G.pointer = null;
      updateHUD();
    }
  }

  function toggleCard(card) {
    if (G.selected === card) {
      G.selected = null;
      G.pointer = null;
      updateHUD();
      return;
    }
    if (G.mana + 0.001 < card.cost) {
      shakeCard(card);
      flashToast('NEED ' + card.cost + ' MANA');
      G.playSound('deny');
      return;
    }
    G.selected = card;
    G.pointer = null;
    G.playSound('select');
    updateHUD();
  }

  function attemptDeploy(x, y) {
    const card = G.selected;
    if (!card) return;
    if (G.state !== 'playing') { flashToast('WAIT FOR THE BATTLE'); return; }
    if (G.mana + 0.001 < card.cost) {
      shakeCard(card);
      flashToast('NEED ' + card.cost + ' MANA');
      G.playSound('deny');
      return;
    }
    if (!G.canDeploy(x, y)) {
      flashToast('SUMMON IN YOUR HALF');
      G.playSound('deny');
      if (G.addRing) G.addRing(x, y, 4, 18, '#ff7c9f', 0.3, 1.4);
      return;
    }
    if (G.deployCard(card, 'player', x, y)) {
      G.pointer = null;
      ui.hint.classList.add('hide');
      updateHUD();
    }
  }

  function bindEvents() {
    ui.canvas.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      if (G.state !== 'playing') return;
      if (!G.selected) {
        flashToast('PICK A HEROINE FIRST');
        return;
      }
      e.preventDefault();
      G.setSoundEnabled(soundOn);
      const rect = ui.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * G.W;
      const y = ((e.clientY - rect.top) / rect.height) * G.L.H;
      attemptDeploy(x, y);
    });

    ui.canvas.addEventListener('pointermove', function (e) {
      if (drag) return;
      if (G.selected && G.state === 'playing') updatePointerFromClient(e.clientX, e.clientY);
    });

    ui.canvas.addEventListener('pointerleave', function () {
      if (!drag) G.pointer = null;
    });

    ui.canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    ui.playBtn.addEventListener('click', function () {
      G.setSoundEnabled(soundOn);
      startMatch();
    });

    ui.rematchBtn.addEventListener('click', function () {
      G.setSoundEnabled(soundOn);
      startMatch();
    });

    ui.menuBtn.addEventListener('click', function () {
      G.resetBoard();
      G.state = 'menu';
      ui.result.classList.add('hidden');
      ui.menu.classList.remove('hidden');
      ui.hint.classList.remove('hide');
      G.selected = null;
      G.pointer = null;
      lastManaFloor = -1;
      updateHUD();
    });

    ui.soundBtn.addEventListener('click', function () {
      soundOn = !soundOn;
      G.setSoundEnabled(soundOn);
      try { localStorage.setItem(SOUND_KEY, soundOn ? '1' : '0'); } catch (e) {}
      syncSoundButton();
      G.playSound('select');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key >= '1' && e.key <= '4') {
        if (G.state !== 'playing') return;
        const card = G.cards[Number(e.key) - 1];
        if (card) toggleCard(card);
      } else if (e.key === 'Escape') {
        G.selected = null;
        G.pointer = null;
        updateHUD();
      }
    });

    window.addEventListener('resize', function () { resize(false); });
    window.addEventListener('orientationchange', function () {
      setTimeout(function () { resize(false); }, 180);
    });
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(function () { resize(false); });
      ro.observe(ui.wrap);
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        /* avoid a huge dt jump after the tab wakes up */
      }
    });
  }

  function syncSoundButton() {
    ui.soundBtn.innerHTML = '<svg class="icon"><use href="#' +
      (soundOn ? 'i-sound' : 'i-mute') + '"></use></svg>';
    ui.soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    ui.soundBtn.title = soundOn ? 'Mute sound' : 'Enable sound';
  }

  /* ------------------------------------------------------------------ */
  /*  MATCH FLOW                                                        */
  /* ------------------------------------------------------------------ */

  function startMatch() {
    G.resetBoard();
    ui.menu.classList.add('hidden');
    ui.result.classList.add('hidden');
    ui.hint.classList.remove('hide');
    G.state = 'countdown';
    G.countdown = 3.05;
    G.lastCountdown = 4;
    G.selected = null;
    G.pointer = null;
    lastManaFloor = -1;
    lastPhase = '';
    lastTimer = '';
    showCountdown('3');
    updateHUD();
    G.playSound('start');
  }

  function showResult() {
    const winner = G.winner;
    const win = winner === 'player';
    const lose = winner === 'enemy';
    const draw = winner === 'draw';
    const reason = G.resultReason || 'queen';

    ui.resultKicker.textContent = draw ? 'DRAW' : win ? 'VICTORY' : 'DEFEAT';
    ui.resultKicker.classList.toggle('lose', lose);
    ui.resultCrowns.innerHTML = crownsMarkup(draw ? 0 : win ? G.crowns.player : G.crowns.enemy);

    if (draw) {
      ui.resultTitle.textContent = 'A perfect stalemate';
      ui.resultSub.textContent = reason === 'hp'
        ? 'Time! Both sides stood equal. The cherry blossoms keep the score.'
        : 'Neither queen fell. The cherry blossoms keep the score.';
    } else if (reason === 'sudden') {
      ui.resultTitle.textContent = win ? 'Sudden death!' : 'Sudden death';
      ui.resultSub.textContent = win
        ? 'You shattered the first tower in overtime. The lane is yours.'
        : 'Hoshino shattered the first tower in overtime.';
    } else if (reason === 'hp') {
      ui.resultTitle.textContent = win ? 'Towers stand taller' : 'Hoshino holds the lane';
      ui.resultSub.textContent = win
        ? "Time! Your towers outlasted Hoshino's in sudden death."
        : "Time! Hoshino's towers outlasted yours in sudden death.";
    } else if (reason === 'time') {
      ui.resultTitle.textContent = win ? 'The crown is yours' : 'Hoshino takes the crown';
      ui.resultSub.textContent = win
        ? 'Time! You held more crowns than Hoshino.'
        : 'Time! Hoshino held more crowns.';
    } else {
      ui.resultTitle.textContent = win ? 'The crown is yours' : 'Hoshino takes the crown';
      ui.resultSub.textContent = win
        ? "Hoshino's Queen Tower is rubble. The lane belongs to you."
        : 'Your Queen Tower has fallen. Hoshino holds the lane.';
    }

    ui.statTowers.textContent = G.stats.towers;
    ui.statHeroes.textContent = G.stats.summoned;
    ui.statDamage.textContent = Math.round(G.stats.damage).toLocaleString('en-US');

    let mvp = null;
    let best = -1;
    G.cards.forEach(function (card) {
      const dmg = G.stats.perCard[card.id] || 0;
      if (dmg > best) { best = dmg; mvp = card; }
    });
    ui.mvpRow.innerHTML = '';
    if (mvp && best > 0) {
      const face = document.createElement('div');
      face.className = 'mvp-face';
      const cv = document.createElement('canvas');
      face.appendChild(cv);
      const text = document.createElement('div');
      text.className = 'mvp-text';
      text.innerHTML = '<span>MVP HEROINE</span><b>' + mvp.name + ' · ' + mvp.title +
        '</b><small>' + Math.round(best).toLocaleString('en-US') + ' damage dealt</small>';
      ui.mvpRow.appendChild(face);
      ui.mvpRow.appendChild(text);
      if (window.ART && ART.drawPortrait) ART.drawPortrait(cv, mvp);
    } else {
      ui.mvpRow.innerHTML = '<div class="mvp-text"><span>MVP HEROINE</span>' +
        '<b>No damage dealt</b><small>No heroine landed a hit this match.</small></div>';
    }

    ui.result.classList.remove('hidden');
  }

  /* ------------------------------------------------------------------ */
  /*  LOOP                                                              */
  /* ------------------------------------------------------------------ */

  let last = performance.now();

  function loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    G.update(dt);
    updateHUD();
    if (G.renderFrame) G.renderFrame(now / 1000);
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
