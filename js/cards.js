// The four maidens. Stats drive the simulation; palette drives all art.
export const CARD_ORDER = ['sakura', 'yuki', 'hana', 'kuro'];

export const CARDS = {
  sakura: {
    id: 'sakura', name: 'Sakura', title: 'Blade Dancer', cost: 3,
    ability: 'Whirlwind', mechanic: 'Every third slash becomes a spinning critical that cuts every nearby foe.',
    blurb: 'A swift duelist who shreds packs and duels fragile ranged girls.',
    hp: 820, dmg: 100, attackSpeed: 0.8, range: 42, speed: 100, radius: 16, size: 1.08,
    special: 'whirlwind',
    hair: '#ff9ec4', hairDark: '#dc5f92', hairLight: '#ffd5e6',
    eye: '#ff4f86', outfit: '#e63b60', outfitDark: '#9c1a3f', outfitLight: '#fff2f5',
    accent: '#ffd166', skin: '#ffe7da', skinShade: '#f4c6b4',
    aura: '#ff8db4', bg1: '#ff9dbf', bg2: '#5d1c45',
    glow: 'rgba(255,110,160,.55)'
  },
  yuki: {
    id: 'yuki', name: 'Yuki', title: 'Frost Archer', cost: 4,
    ability: 'Chill', mechanic: 'Her arrows freeze the target, slowing movement and attacks for 2 seconds.',
    blurb: 'Long-range control. Kites melee bruisers and locks down pushes.',
    hp: 540, dmg: 66, attackSpeed: 1.2, range: 142, speed: 72, radius: 15, size: 1.02,
    special: 'slow', slowAmount: .5, slowDur: 2.1,
    hair: '#d7ecff', hairDark: '#7fb0dd', hairLight: '#f4fbff',
    eye: '#3fb7ff', outfit: '#3568cf', outfitDark: '#1c3c86', outfitLight: '#eef8ff',
    accent: '#9fe8ff', skin: '#ffe8dd', skinShade: '#f3cab9',
    aura: '#7fdcff', bg1: '#9fd8ff', bg2: '#1c3168',
    glow: 'rgba(100,200,255,.55)'
  },
  hana: {
    id: 'hana', name: 'Hana', title: 'Bloom Healer', cost: 4,
    ability: 'Petal Mend', mechanic: 'Pulses healing onto the most wounded ally nearby while she peppers foes with petals.',
    blurb: 'Sustain support. Keeps a push alive but folds under focused burst.',
    hp: 650, dmg: 42, attackSpeed: 1.1, range: 126, speed: 68, radius: 15, size: 1.02,
    special: 'heal', heal: 58, healInterval: 1.4, healRange: 158,
    hair: '#bce9c9', hairDark: '#67b98a', hairLight: '#e8fff0',
    eye: '#45be82', outfit: '#7fcf9f', outfitDark: '#3c8a62', outfitLight: '#fdf6e8',
    accent: '#ff9ec4', skin: '#ffe9da', skinShade: '#f2c9b4',
    aura: '#8df0b5', bg1: '#bff3cf', bg2: '#1f5540',
    glow: 'rgba(120,235,165,.5)'
  },
  kuro: {
    id: 'kuro', name: 'Kuro', title: 'Shadow Assassin', cost: 5,
    ability: 'Shadowstep', mechanic: 'Blinks behind a new target and lands a guaranteed critical strike. Fragile, terrifying.',
    blurb: 'High-risk finisher. Deletes healers and archers, but towers shred her.',
    hp: 730, dmg: 180, attackSpeed: 1.15, range: 40, speed: 132, radius: 16, size: 1.08,
    special: 'shadowstep', critMultiplier: 2.15, stepCooldown: 5.5,
    hair: '#5b4678', hairDark: '#2a1d3f', hairLight: '#8c6bb0',
    eye: '#c77dff', outfit: '#2c2140', outfitDark: '#171023', outfitLight: '#6b4a8f',
    accent: '#c77dff', skin: '#ffe3d6', skinShade: '#eec3b0',
    aura: '#b06bff', bg1: '#8459c9', bg2: '#1a0f2c',
    glow: 'rgba(180,100,255,.55)'
  }
};

export const DIFFICULTY = {
  easy:   { label: 'Casual', think: 1.05, mistake: .36, save: 4.0, aggression: .42 },
  normal: { label: 'Normal', think: .62,  mistake: .12, save: 5.5, aggression: .64 },
  hard:   { label: 'Hard',   think: .34,  mistake: .02, save: 7.0, aggression: .82 }
};
