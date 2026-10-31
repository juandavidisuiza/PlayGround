import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { AudioEngine } from './audio.js';
import { UI } from './ui.js';

const canvas = document.getElementById('game');
const game = new Game();
const renderer = new Renderer(canvas);
const audio = new AudioEngine();
const ui = new UI(game, renderer, audio);

// Exposed for verification and tinkering from the console.
window.__hanami = {
  game, renderer, ui, audio,
  start: (diff) => ui.startMatch(diff || ui.difficulty),
  deploy: (id, x, y, team = 0) => game.playCard(id, x, y, team),
  fillMana: () => { game.mana = 10; game.enemyMana = 10; }
};

// Fixed-step simulation with catch-up: keeps the clock and combat accurate
// even when the renderer is slow (software canvas, low-end phones, etc.).
const STEP = 1 / 60;
const MAX_STEPS = 20;
let last = performance.now();
let acc = 0;
function frame(now) {
  const elapsed = Math.min(.3, Math.max(0, (now - last) / 1000));
  last = now;
  acc += elapsed;
  let steps = 0;
  while (acc >= STEP && steps < MAX_STEPS) {
    game.update(STEP);
    acc -= STEP;
    steps++;
  }
  if (steps === MAX_STEPS) acc = Math.min(acc, STEP);
  ui.handleEvents(game.drainEvents());
  ui.update();
  renderer.draw(game, now / 1000);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
