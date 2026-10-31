// World geometry and balance constants for Hanami Clash.
export const WORLD = { w: 600, h: 720 };
export const ARENA = { left: 16, right: 584, top: 10, bottom: 710 };
export const RIVER = { top: 352, bottom: 392, center: 372 };
export const BRIDGE = { left: 230, right: 370 };

export const TEAMS = {
  0: { id: 0, name: 'You', short: 'YOU', color: '#4cc9f0', dark: '#1d6fa5', light: '#c7f4ff', banner: '#38bdf8', glow: 'rgba(76,201,240,.65)' },
  1: { id: 1, name: 'Kitsune', short: 'KITSUNE', color: '#ff5d7a', dark: '#a52345', light: '#ffd3dc', banner: '#f43f5e', glow: 'rgba(255,93,122,.65)' }
};

export const TOWER_STATS = {
  princess: { hp: 1750, dmg: 54, range: 198, cooldown: 0.85, radius: 29, projSpeed: 520, label: 'Crown Tower' },
  king: { hp: 3000, dmg: 100, range: 178, cooldown: 1.15, radius: 42, projSpeed: 470, label: 'Queen Tower' }
};

export const DEPLOY = {
  0: { x1: 108, x2: 492, y1: RIVER.bottom + 12, y2: 602 },
  1: { x1: 108, x2: 492, y1: 106, y2: RIVER.top - 12 }
};

export const SPAWN = {
  0: { x: 300, y: 578 },
  1: { x: 300, y: 186 }
};

export const MANA = { max: 10, start: 5, regen: 1 / 2.7, overtimeRegen: 1 / 1.35 };

export const MATCH = { regular: 180, overtime: 60 };

export function createTowers() {
  const make = (id, team, kind, x, y) => ({
    id, team, kind, x, y,
    ...TOWER_STATS[kind],
    maxHp: TOWER_STATS[kind].hp,
    hp: TOWER_STATS[kind].hp,
    cd: 0,
    target: null,
    destroyed: false,
    active: kind === 'princess',
    flash: 0,
    hitFlash: 0,
    destroyedAt: 0
  });
  return [
    make('e-king', 1, 'king', 300, 162),
    make('e-left', 1, 'princess', 188, 250),
    make('e-right', 1, 'princess', 412, 250),
    make('p-left', 0, 'princess', 188, 494),
    make('p-right', 0, 'princess', 412, 494),
    make('p-king', 0, 'king', 300, 582)
  ];
}
