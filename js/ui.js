import { CARDS, CARD_ORDER, DIFFICULTY } from './cards.js';
import { WORLD } from './config.js';
import { crownSVG, portraitSVG, foxAvatarSVG, crestSVG } from './art.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

export class UI {
  constructor(game, renderer, audio) {
    this.game = game;
    this.renderer = renderer;
    this.audio = audio;
    this.difficulty = 'normal';
    this.selected = null;
    this.drag = null;
    this.token = 0;
    this.bannerQueue = [];
    this.bannerTimer = null;
    this.toastTimer = null;
    this.resultTimer = null;
    this.crownSig = '';
    this.deployedOnce = false;
    this.cardEls = new Map();

    const $ = id => document.getElementById(id);
    this.el = {
      stage: $('stage'), topbar: $('topbar'), dock: $('dock'),
      hand: $('hand'), banner: $('banner'), bannerText: $('bannerText'), bannerIco: $('bannerIco'),
      toast: $('toast'), clock: $('clock'), clockText: $('clockText'), clockTag: $('clockTag'),
      foeCrowns: $('foeCrowns'), youCrowns: $('youCrowns'),
      foeAvatar: $('foeAvatar'), youAvatar: $('youAvatar'),
      manaFill: $('manaFill'), manaNow: $('manaNow'), manaBar: $('manaBar'),
      title: $('titleScreen'), countdown: $('countdownScreen'), countNum: $('countdownNum'),
      countFight: $('countdownFight'), pause: $('pauseScreen'), result: $('resultScreen'),
      help: $('helpScreen'), resultTitle: $('resultTitle'), resultKicker: $('resultKicker'),
      resultCrowns: $('resultCrowns'), resultScore: $('resultScore'), resultStats: $('resultStats'),
      lineup: $('lineup'), lineupDesc: $('lineupDesc'), helpCards: $('helpCards'),
      bgPetals: $('bgPetals'), playBtn: $('playBtn'), helpBtn: $('helpBtn'), helpBtn2: $('helpBtn2'),
      closeHelp: $('closeHelp'), pauseBtn: $('pauseBtn'), resumeBtn: $('resumeBtn'),
      restartBtn: $('restartBtn'), quitBtn: $('quitBtn'), rematchBtn: $('rematchBtn'),
      homeBtn: $('homeBtn'), soundBtn: $('soundBtn')
    };

    this.buildStatic();
    this.bind();
    this.syncSound();
    this.updateCrowns(true);
    this.update(true);
    requestAnimationFrame(() => this.renderer.resize());
  }

  /* -------------------------------------------------------------- */
  buildStatic() {
    this.el.hand.innerHTML = CARD_ORDER.map((id, i) => {
      const c = CARDS[id];
      return `<button class="card" data-card="${id}" aria-label="${c.name}, ${c.title}, ${c.cost} mana. ${c.mechanic}">
        <span class="card-art">${portraitSVG(id)}</span>
        <span class="card-cost">${c.cost}</span>
        <span class="card-key">${i + 1}</span>
        <span class="card-namebar"><span class="card-name">${c.name}</span><span class="card-ability">${c.ability}</span></span>
        <span class="card-cd"></span>
      </button>`;
    }).join('');
    for (const el of this.el.hand.querySelectorAll('.card')) this.cardEls.set(el.dataset.card, el);

    this.el.lineup.innerHTML = CARD_ORDER.map(id => {
      const c = CARDS[id];
      return `<button class="lineup-card" data-card="${id}" aria-label="${c.name}, ${c.cost} mana. ${c.mechanic}">
        ${portraitSVG(id)}
        <span class="lineup-cost">${c.cost}</span>
        <span class="lineup-meta"><b>${c.name}</b><small>${c.ability}</small></span>
      </button>`;
    }).join('');

    this.el.helpCards.innerHTML = CARD_ORDER.map(id => {
      const c = CARDS[id];
      return `<div class="help-card">
        <div class="mini">${portraitSVG(id)}</div>
        <div class="hc-body">
          <div class="hc-name">${c.name} · ${c.title}<span>${c.cost} mana</span></div>
          <div class="hc-text">${c.mechanic}</div>
        </div>
      </div>`;
    }).join('');

    this.el.foeAvatar.innerHTML = foxAvatarSVG();
    this.el.youAvatar.innerHTML = crestSVG();
    this.el.bgPetals.innerHTML = Array.from({ length: 16 }, (_, i) => {
      const left = Math.random() * 100;
      const dur = 11 + Math.random() * 16;
      const delay = -Math.random() * 24;
      const size = 6 + Math.random() * 9;
      return `<span class="bg-petal" style="left:${left}%;width:${size}px;height:${size * .68}px;animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
    }).join('');

    const first = this.el.lineup.querySelector('.lineup-card');
    if (first) {
      first.classList.add('active');
      this.setLineupDesc(first.dataset.card);
    }
  }

  setLineupDesc(id) {
    const c = CARDS[id];
    this.el.lineupDesc.innerHTML = `<b>${c.name} · ${c.ability}</b> — ${c.mechanic}`;
  }

  bind() {
    const el = this.el;
    el.playBtn.addEventListener('click', () => this.startMatch(this.difficulty));
    el.helpBtn.addEventListener('click', () => this.openHelp());
    el.helpBtn2.addEventListener('click', () => this.openHelp());
    el.closeHelp.addEventListener('click', () => this.closeHelp());
    el.help.addEventListener('click', e => { if (e.target === el.help) this.closeHelp(); });
    el.pauseBtn.addEventListener('click', () => this.openPause());
    el.resumeBtn.addEventListener('click', () => this.resume());
    el.restartBtn.addEventListener('click', () => { this.hidePause(); this.startMatch(this.difficulty); });
    el.quitBtn.addEventListener('click', () => this.goHome());
    el.rematchBtn.addEventListener('click', () => { el.result.hidden = true; this.startMatch(this.difficulty); });
    el.homeBtn.addEventListener('click', () => this.goHome());
    el.soundBtn.addEventListener('click', () => {
      this.audio.toggleMute();
      this.syncSound();
      this.audio.sfx('ui');
    });

    for (const b of document.querySelectorAll('.difficulty button')) {
      b.addEventListener('click', () => {
        this.difficulty = b.dataset.diff;
        for (const o of document.querySelectorAll('.difficulty button')) o.classList.toggle('active', o === b);
        this.audio.sfx('ui');
      });
    }

    el.lineup.addEventListener('click', e => {
      const b = e.target.closest('.lineup-card');
      if (!b) return;
      for (const o of el.lineup.querySelectorAll('.lineup-card')) o.classList.toggle('active', o === b);
      this.setLineupDesc(b.dataset.card);
      this.audio.sfx('ui');
    });

    // card drag + tap
    el.hand.addEventListener('pointerdown', e => this.onCardDown(e));
    el.hand.addEventListener('pointermove', e => this.onCardMove(e));
    el.hand.addEventListener('pointerup', e => this.onCardUp(e));
    el.hand.addEventListener('pointercancel', () => { this.drag = null; this.renderer.hover = null; });

    const canvas = this.renderer.canvas;
    canvas.addEventListener('pointermove', e => this.onCanvasMove(e));
    canvas.addEventListener('pointerdown', e => this.onCanvasDown(e));
    canvas.addEventListener('pointerleave', () => {
      if (!this.drag) this.renderer.hover = null;
    });

    document.addEventListener('keydown', e => this.onKey(e));
    document.addEventListener('pointerdown', e => {
      if (!e.target.closest('.card, .stage, .screen')) return;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && (this.game.phase === 'battle' || this.game.phase === 'overtime') && !this.game.paused) {
        this.openPause();
      }
    });
    window.addEventListener('resize', () => this.setDockVar());
    this.setDockVar();
  }

  syncSound() {
    this.el.soundBtn.textContent = this.audio.muted ? '🔇' : '🔊';
    this.el.soundBtn.classList.toggle('muted', this.audio.muted);
    this.el.soundBtn.setAttribute('aria-label', this.audio.muted ? 'Unmute sound' : 'Mute sound');
  }

  setDockVar() {
    const h = this.el.dock.hidden ? 0 : this.el.dock.offsetHeight;
    this.el.stage.style.setProperty('--dock-h', `${h}px`);
  }

  /* -------------------------------------------------------------- */
  /* match lifecycle                                                 */
  /* -------------------------------------------------------------- */
  async startMatch(diff = this.difficulty) {
    const token = ++this.token;
    this.difficulty = diff;
    this.audio.unlock();
    this.audio.startMusic();
    this.audio.duckMusic(false);
    this.game.beginMatch(diff);
    this.selected = null;
    this.deployedOnce = false;
    this.renderer.selected = null;
    this.renderer.hover = null;
    this.clearScreens();
    document.querySelectorAll('.card.hintpop').forEach(c => c.classList.remove('hintpop'));
    this.el.topbar.hidden = false;
    this.el.dock.hidden = false;
    this.el.stage.dataset.screen = 'battle';
    this.setDockVar();
    this.updateCrowns(true);
    this.renderer.resize();
    this.update(true);

    this.el.countdown.hidden = false;
    this.el.countNum.style.display = 'block';
    this.el.countFight.style.display = 'none';

    const step = 330;
    for (const n of ['3', '2', '1']) {
      if (token !== this.token) return;
      this.showCount(n);
      this.audio.sfx('count');
      await wait(step);
    }
    if (token !== this.token) return;
    this.el.countNum.style.display = 'none';
    this.el.countFight.style.display = 'block';
    this.restartAnim(this.el.countFight);
    this.audio.sfx('fight');
    this.game.begin();
    this.update(true);
    await wait(680);
    if (token !== this.token) return;
    this.el.countdown.hidden = true;
    this.showHint();
  }

  clearScreens() {
    this.el.title.hidden = true;
    this.el.pause.hidden = true;
    this.el.result.hidden = true;
    this.el.help.hidden = true;
    this.el.countdown.hidden = true;
    this.el.banner.hidden = true;
    this.bannerQueue.length = 0;
    if (this.bannerTimer) { clearTimeout(this.bannerTimer); this.bannerTimer = null; }
    if (this.resultTimer) { clearTimeout(this.resultTimer); this.resultTimer = null; }
    this.el.toast.hidden = true;
  }

  showCount(n) {
    const el = this.el.countNum;
    el.textContent = n;
    el.style.display = 'block';
    this.restartAnim(el);
  }

  restartAnim(el) {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }

  showHint() {
    if (this.deployedOnce) return;
    this.toast('Tap a card, then tap your half to deploy', false, 2600);
    const first = this.el.hand.querySelector('.card');
    if (first) {
      first.classList.add('hintpop');
      setTimeout(() => first.classList.remove('hintpop'), 3200);
    }
  }

  openPause() {
    if (this.el.help.hidden === false) return;
    if (!this.game.setPaused(true)) {
      if (this.game.phase === 'countdown') this.toast('The fight is about to begin!', false, 1200);
      return;
    }
    this.el.pause.hidden = false;
    this.audio.sfx('ui');
  }

  hidePause() {
    this.el.pause.hidden = true;
  }

  resume() {
    this.game.setPaused(false);
    this.el.pause.hidden = true;
    this.audio.sfx('ui');
  }

  goHome() {
    this.token++;
    if (this.resultTimer) { clearTimeout(this.resultTimer); this.resultTimer = null; }
    this.game.paused = false;
    this.game.reset(this.difficulty);
    this.game.phase = 'title';
    this.selected = null;
    this.renderer.selected = null;
    this.renderer.hover = null;
    this.clearScreens();
    this.el.topbar.hidden = true;
    this.el.dock.hidden = true;
    this.el.stage.dataset.screen = 'title';
    this.el.title.hidden = false;
    this.el.banner.hidden = true;
    this.audio.duckMusic(false);
    this.audio.sfx('ui');
    this.setDockVar();
    this.renderer.resize();
    this.update(true);
  }

  openHelp() {
    this.helpWasRunning = (this.game.phase === 'battle' || this.game.phase === 'overtime') && !this.game.paused;
    if (this.helpWasRunning) this.game.setPaused(true);
    this.el.help.hidden = false;
    this.audio.sfx('ui');
  }

  closeHelp() {
    this.el.help.hidden = true;
    if (this.helpWasRunning) {
      this.helpWasRunning = false;
      this.game.setPaused(false);
    }
    this.audio.sfx('ui');
  }

  /* -------------------------------------------------------------- */
  /* card play                                                       */
  /* -------------------------------------------------------------- */
  isPlayable(id) {
    const g = this.game;
    if (g.phase !== 'battle' && g.phase !== 'overtime') return false;
    if (g.paused) return false;
    return g.cooldowns[id] <= 0 && g.mana >= CARDS[id].cost;
  }

  onCardDown(e) {
    const card = e.target.closest('.card');
    if (!card) return;
    e.preventDefault();
    const id = card.dataset.card;
    if (!this.isPlayable(id)) {
      const g = this.game;
      if (g.cooldowns[id] > 0) this.toast('That card is still recharging', true);
      else if (g.mana < CARDS[id].cost) this.toast(`Not enough mana — ${CARDS[id].name} costs ${CARDS[id].cost}`, true);
      else this.toast('Wait for the battle to begin', true);
      this.audio.sfx('error');
      card.classList.remove('flash');
      void card.offsetWidth;
      card.classList.add('flash');
      return;
    }
    if (this.selected === id) {
      this.deselect();
      return;
    }
    this.select(id);
    this.drag = { id, x: e.clientX, y: e.clientY, moved: false, pointerId: e.pointerId };
    try { card.setPointerCapture(e.pointerId); } catch {}
  }

  onCardMove(e) {
    if (!this.drag || e.pointerId !== this.drag.pointerId) return;
    const dx = e.clientX - this.drag.x;
    const dy = e.clientY - this.drag.y;
    if (!this.drag.moved && Math.hypot(dx, dy) > 9) this.drag.moved = true;
    if (!this.drag.moved) return;
    const w = this.renderer.screenToWorld(e.clientX, e.clientY);
    const inside = w.x > 0 && w.x < WORLD.w && w.y > 0 && w.y < WORLD.h;
    this.renderer.hover = inside ? { x: w.x, y: w.y, valid: this.game.canDeploy(0, w.x, w.y) } : null;
  }

  onCardUp(e) {
    if (!this.drag || e.pointerId !== this.drag.pointerId) return;
    const wasDrag = this.drag.moved;
    this.drag = null;
    if (!wasDrag) return;
    const w = this.renderer.screenToWorld(e.clientX, e.clientY);
    this.renderer.hover = null;
    if (w.x < 0 || w.x > WORLD.w || w.y < 0 || w.y > WORLD.h) return;
    if (w.y > 612) return; // released on the dock
    this.tryDeploy(this.selected, e.clientX, e.clientY);
  }

  onCanvasMove(e) {
    if (!this.selected || this.drag) return;
    const w = this.renderer.screenToWorld(e.clientX, e.clientY);
    const inside = w.x > 0 && w.x < WORLD.w && w.y > 0 && w.y < WORLD.h;
    this.renderer.hover = inside ? { x: w.x, y: w.y, valid: this.game.canDeploy(0, w.x, w.y) } : null;
  }

  onCanvasDown(e) {
    if (!this.selected) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this.tryDeploy(this.selected, e.clientX, e.clientY);
  }

  select(id) {
    this.selected = id;
    this.renderer.selected = id;
    this.audio.sfx('select');
    this.update(true);
  }

  deselect() {
    this.selected = null;
    this.renderer.selected = null;
    this.renderer.hover = null;
    this.audio.sfx('ui');
    this.update(true);
  }

  tryDeploy(id, clientX, clientY) {
    if (!id) return;
    const w = this.renderer.screenToWorld(clientX, clientY);
    const res = this.game.playCard(id, w.x, w.y, 0);
    if (res.ok) {
      this.deployedOnce = true;
      this.el.hand.querySelectorAll('.card.hintpop').forEach(c => c.classList.remove('hintpop'));
      if (this.toastTimer) { clearTimeout(this.toastTimer); this.toastTimer = null; }
      this.el.toast.hidden = true;
      this.deselect();
      return;
    }
    if (res.reason === 'zone') this.toast('Deploy on your half of the lane', true);
    else if (res.reason === 'mana') this.toast('Not enough mana', true);
    else if (res.reason === 'cooldown') this.toast('That card is still recharging', true);
    else this.toast('You cannot deploy right now', true);
    this.audio.sfx('error');
    const card = this.cardEls.get(id);
    if (card) {
      card.classList.remove('flash');
      void card.offsetWidth;
      card.classList.add('flash');
    }
  }

  /* -------------------------------------------------------------- */
  /* keyboard                                                        */
  /* -------------------------------------------------------------- */
  onKey(e) {
    if (!this.el.help.hidden) {
      if (e.key === 'Escape') this.closeHelp();
      return;
    }
    if (!this.el.result.hidden) return;
    if (!this.el.pause.hidden) {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') this.resume();
      return;
    }
    if (this.game.phase === 'title' || this.game.phase === 'ready') {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.startMatch(this.difficulty); }
      return;
    }
    if (e.key >= '1' && e.key <= '4') {
      const id = CARD_ORDER[Number(e.key) - 1];
      if (this.isPlayable(id)) this.select(id);
      else {
        this.audio.sfx('error');
        this.toast(this.game.mana < CARDS[id].cost ? 'Not enough mana' : 'That card is recharging', true);
      }
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (this.selected) this.tryDeployWorld(this.selected, 300, 470);
      return;
    }
    if (e.key === 'Escape') {
      if (this.selected) this.deselect();
      else this.openPause();
      return;
    }
    if (e.key === 'p' || e.key === 'P') { this.openPause(); return; }
    if (e.key === 'm' || e.key === 'M') {
      this.audio.toggleMute();
      this.syncSound();
    }
  }

  tryDeployWorld(id, x, y) {
    const res = this.game.playCard(id, x, y, 0);
    if (res.ok) {
      this.deployedOnce = true;
      if (this.toastTimer) { clearTimeout(this.toastTimer); this.toastTimer = null; }
      this.el.toast.hidden = true;
      this.deselect();
    } else {
      this.toast(res.reason === 'zone' ? 'Deploy on your half of the lane' : 'Not enough mana', true);
      this.audio.sfx('error');
    }
  }

  /* -------------------------------------------------------------- */
  /* events                                                          */
  /* -------------------------------------------------------------- */
  handleEvents(events) {
    for (const e of events) {
      switch (e.type) {
        case 'deploy':
          this.audio.sfx('deploy');
          break;
        case 'melee': this.audio.sfx('melee'); break;
        case 'arrow': this.audio.sfx('arrow'); break;
        case 'petal': this.audio.sfx('petal'); break;
        case 'slow': this.audio.sfx('slow'); break;
        case 'heal': this.audio.sfx('heal'); break;
        case 'towerShot': this.audio.sfx('bolt'); break;
        case 'impact': this.audio.sfx('impact'); break;
        case 'crit': this.audio.sfx('crit'); break;
        case 'whirl': this.audio.sfx('whirl'); break;
        case 'shadowstep': this.audio.sfx('shadowstep'); break;
        case 'towerDown':
          this.audio.sfx('towerDown');
          if (e.kind === 'king') this.showBanner('Queen Tower Destroyed!', '♛');
          else this.showBanner(e.team === 1 ? 'Enemy Crown Tower Down!' : 'Your Crown Tower Fell!', '✦');
          break;
        case 'crown':
          this.audio.sfx('crown');
          break;
        case 'kingWake':
          this.audio.sfx('kingWake');
          this.showBanner(e.team === 0 ? 'Your Queen Tower Awakens!' : 'Enemy Queen Tower Awakens!', '♛');
          break;
        case 'overtime':
          this.audio.sfx('overtime');
          this.showBanner('Overtime · Double Mana!', '⏱');
          this.el.clock.classList.add('ot');
          break;
        case 'matchEnd':
          this.onMatchEnd(e.result);
          break;
        default: break;
      }
    }
  }

  showBanner(text, icon = '✦') {
    this.bannerQueue.push({ text, icon });
    this.pumpBanner();
  }

  pumpBanner() {
    if (this.bannerTimer || !this.bannerQueue.length) return;
    const b = this.bannerQueue.shift();
    this.el.bannerText.textContent = b.text;
    this.el.bannerIco.textContent = b.icon;
    this.el.banner.hidden = false;
    this.restartAnim(this.el.banner);
    this.bannerTimer = setTimeout(() => {
      this.el.banner.hidden = true;
      this.bannerTimer = null;
      if (this.bannerQueue.length) setTimeout(() => this.pumpBanner(), 160);
    }, 1750);
  }

  toast(text, bad = false, ms = 1600) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.el.toast.textContent = text;
    this.el.toast.classList.toggle('bad', bad);
    this.el.toast.hidden = false;
    this.restartAnim(this.el.toast);
    this.toastTimer = setTimeout(() => { this.el.toast.hidden = true; this.toastTimer = null; }, ms);
  }

  onMatchEnd(result) {
    this.game.paused = false;
    this.audio.duckMusic(true);
    this.audio.sfx(result.outcome === 'win' ? 'win' : result.outcome === 'lose' ? 'lose' : 'ui');
    this.selected = null;
    this.renderer.selected = null;
    this.renderer.hover = null;
    const token = this.token;
    if (this.resultTimer) clearTimeout(this.resultTimer);
    this.resultTimer = setTimeout(() => {
      if (token !== this.token) return;
      this.showResult(result);
    }, 1500);
  }

  showResult(result) {
    const g = this.game;
    const win = result.outcome === 'win';
    const lose = result.outcome === 'lose';
    this.el.resultTitle.textContent = win ? 'Victory!' : lose ? 'Defeat' : 'Draw';
    this.el.resultTitle.classList.toggle('lose', lose);
    this.el.resultTitle.classList.toggle('draw', !win && !lose);
    const reason = {
      king: 'QUEEN TOWER DESTROYED',
      sudden: 'SUDDEN DEATH',
      crowns: 'MORE CROWNS',
      hp: 'TOWER HEALTH TIEBREAK',
      draw: 'PERFECTLY MATCHED',
      time: 'TIME UP'
    }[result.reason] || 'MATCH COMPLETE';
    this.el.resultKicker.textContent = reason;
    this.el.resultCrowns.innerHTML = Array.from({ length: 3 }, (_, i) => crownSVG(i < Math.min(3, g.crowns[0]))).join('');
    this.el.resultScore.textContent = `You ${g.crowns[0]} — ${g.crowns[1]} Kitsune`;
    const stats = [
      ['Crowns', g.crowns[0]],
      ['Mana spent', Math.round(g.stats.manaSpent)],
      ['Units deployed', g.stats.deployed],
      ['Tower damage', Math.round(g.stats.damage)]
    ];
    this.el.resultStats.innerHTML = stats.map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`).join('');
    this.el.result.hidden = false;
    this.audio.sfx('ui');
  }

  /* -------------------------------------------------------------- */
  /* per-frame                                                       */
  /* -------------------------------------------------------------- */
  update(force = false) {
    const g = this.game;
    const el = this.el;

    // clock + mana + cards are only meaningful in a match
    if (g.phase === 'battle' || g.phase === 'overtime' || g.phase === 'over') {
      const mins = g.clockString();
      if (el.clockText.textContent !== mins) el.clockText.textContent = mins;
      el.clockTag.hidden = !g.overtime;
      el.clock.classList.toggle('ot', g.overtime);
      el.clock.classList.toggle('hurry', !g.overtime && g.matchTime <= 30 && g.phase !== 'over');

      const mana = g.mana;
      el.manaFill.style.width = `${Math.min(100, mana / 10 * 100)}%`;
      el.manaBar.classList.toggle('full', mana >= 9.99);
      el.manaNow.textContent = Math.floor(mana);
    }

    this.updateCrowns(false);

    for (const [id, card] of this.cardEls) {
      const cd = g.cooldowns[id];
      const affordable = g.mana >= CARDS[id].cost;
      const playable = this.isPlayable(id);
      card.classList.toggle('disabled', !playable);
      card.classList.toggle('cooldown', cd > 0);
      card.classList.toggle('selected', this.selected === id);
      card.style.setProperty('--cd', `${Math.min(100, cd / 1.35 * 100)}%`);
      card.classList.toggle('unaffordable', !affordable && cd <= 0);
    }

    if (g.phase === 'over' && this.selected) {
      this.selected = null;
      this.renderer.selected = null;
      this.renderer.hover = null;
    }
  }

  updateCrowns(force) {
    const sig = `${this.game.crowns[0]}|${this.game.crowns[1]}`;
    if (!force && sig === this.crownSig) return;
    this.crownSig = sig;
    const draw = (el, n) => { el.innerHTML = Array.from({ length: 3 }, (_, i) => crownSVG(i < Math.min(3, n))).join(''); };
    draw(this.el.youCrowns, this.game.crowns[0]);
    draw(this.el.foeCrowns, this.game.crowns[1]);
  }
}
