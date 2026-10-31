import { CARDS } from './cards.js';

let uid = 0;
const nextId = () => `p${++uid}`;

/* ------------------------------------------------------------------ */
/* shared bits                                                         */
/* ------------------------------------------------------------------ */
function defs(p, c) {
  return `<defs>
    <radialGradient id="${p}bg" cx="50%" cy="30%" r="82%">
      <stop offset="0" stop-color="${c.bg1}"/><stop offset="1" stop-color="${c.bg2}"/>
    </radialGradient>
    <linearGradient id="${p}hair" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.hairLight}"/><stop offset=".55" stop-color="${c.hair}"/><stop offset="1" stop-color="${c.hairDark}"/>
    </linearGradient>
    <linearGradient id="${p}skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff4ec"/><stop offset=".7" stop-color="${c.skin}"/><stop offset="1" stop-color="${c.skinShade}"/>
    </linearGradient>
    <linearGradient id="${p}outfit" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.outfitLight}"/><stop offset=".38" stop-color="${c.outfit}"/><stop offset="1" stop-color="${c.outfitDark}"/>
    </linearGradient>
    <linearGradient id="${p}iris" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.eye}" stop-opacity=".45"/>
      <stop offset=".45" stop-color="${c.eye}"/>
      <stop offset="1" stop-color="#3b1245"/>
    </linearGradient>
    <linearGradient id="${p}halo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <filter id="${p}soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2.2"/>
    </filter>
    <filter id="${p}glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
}

function eyes(p, c, cy = 118) {
  const one = (cx) => `
    <ellipse cx="${cx}" cy="${cy}" rx="11.4" ry="13.6" fill="#fffbfd"/>
    <ellipse cx="${cx}" cy="${cy + 1}" rx="9.2" ry="11.4" fill="url(#${p}iris)"/>
    <ellipse cx="${cx}" cy="${cy + 2.5}" rx="4.3" ry="6" fill="#2a1430"/>
    <circle cx="${cx - 3.4}" cy="${cy - 4.2}" r="3.1" fill="#fff" opacity=".96"/>
    <circle cx="${cx + 3.5}" cy="${cy + 5}" r="1.5" fill="#fff" opacity=".8"/>
    <circle cx="${cx + 2.4}" cy="${cy - 5}" r="1.15" fill="#fff" opacity=".85"/>
    <path d="M${cx - 12.6} ${cy - 4} Q${cx - 8.5} ${cy - 16.4} ${cx + 1} ${cy - 14.6} Q${cx + 9.8} ${cy - 13.2} ${cx + 12.6} ${cy - 5}"
      fill="none" stroke="#2a1430" stroke-width="3" stroke-linecap="round"/>
    <path d="M${cx - 12.6} ${cy - 4} l-3.4 -3.2" stroke="#2a1430" stroke-width="2.1" stroke-linecap="round"/>
    <path d="M${cx + 12.4} ${cy - 4.4} l3.2 -3" stroke="#2a1430" stroke-width="2.1" stroke-linecap="round"/>
    <path d="M${cx - 7.5} ${cy + 12.6} Q${cx} ${cy + 15} ${cx + 7.5} ${cy + 12.6}" fill="none" stroke="#b56a80" stroke-width=".9" opacity=".45"/>`;
  return one(83) + one(117);
}

function brows(c, y = 102) {
  return `<path d="M72 ${y + 2} Q82 ${y - 3} 92 ${y + 1.5}" fill="none" stroke="${c.hairDark}" stroke-width="2.1" stroke-linecap="round" opacity=".85"/>
          <path d="M108 ${y + 1.5} Q118 ${y - 3} 128 ${y + 2}" fill="none" stroke="${c.hairDark}" stroke-width="2.1" stroke-linecap="round" opacity=".85"/>`;
}

function face(c) {
  return `
    <path d="M66 90 C66 62 134 62 134 90 L132 116 C132 142 115 156 100 156 C85 156 68 142 68 116 Z" fill="url(#SKIN)"/>
    <path d="M69 116 C69 142 86 156 100 156 C114 156 131 142 131 116 L131 128 C131 150 116 160 100 160 C84 160 69 150 69 128 Z" fill="${c.skinShade}" opacity=".35"/>
    <ellipse cx="66.5" cy="118" rx="4.4" ry="7" fill="url(#SKIN)"/>
    <ellipse cx="133.5" cy="118" rx="4.4" ry="7" fill="url(#SKIN)"/>
    <ellipse cx="78" cy="133" rx="8" ry="3.4" fill="#ff8fa8" opacity=".3" filter="url(#SOFT)"/>
    <ellipse cx="122" cy="133" rx="8" ry="3.4" fill="#ff8fa8" opacity=".3" filter="url(#SOFT)"/>
    <path d="M100 135 q2.6 2.4 .2 3.6" fill="none" stroke="${c.skinShade}" stroke-width="1.3" stroke-linecap="round" opacity=".8"/>
    <path d="M94 145 Q100 150.5 106 145" fill="none" stroke="#a83a55" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M97 146.5 Q100 148.6 103 146.5" fill="#d15872" opacity=".55"/>`;
}

function neckBody(p, c, extra = '') {
  return `
    <path d="M89 149 L89 174 Q100 182 111 174 L111 149 Z" fill="${c.skinShade}"/>
    <path d="M89 149 L89 170 Q100 176 111 170 L111 149 Z" fill="url(#${p}skin)" opacity=".75"/>
    <path d="M42 250 C42 206 66 180 100 180 C134 180 158 206 158 250 Z" fill="url(#${p}outfit)"/>
    ${extra}`;
}

/* ------------------------------------------------------------------ */
/* character-specific hair, outfits and props                          */
/* ------------------------------------------------------------------ */
const SAKURA = (c) => ({
  back: `
    <path d="M60 96 C54 50 76 32 100 32 C124 32 146 50 140 96 L152 168 C154 198 130 216 100 216 C70 216 46 198 48 168 Z" fill="url(#HAIR)"/>
    <path d="M58 92 C34 116 26 170 38 216 C44 232 63 232 69 218 C56 178 64 132 84 110 Z" fill="url(#HAIR)"/>
    <path d="M142 92 C166 116 174 170 162 216 C156 232 137 232 131 218 C144 178 136 132 116 110 Z" fill="url(#HAIR)"/>
    <path d="M44 178 C32 198 34 222 46 236 C54 226 56 204 60 190 Z" fill="${c.hairDark}"/>
    <path d="M156 178 C168 198 166 222 154 236 C146 226 144 204 140 190 Z" fill="${c.hairDark}"/>`,
  bangs: `
    <path d="M64 96 C62 62 82 44 100 44 C118 44 138 62 136 96 C130 86 122 74 114 68 C113 84 107 96 100 101 C93 96 87 84 86 68 C78 74 70 86 64 96 Z" fill="url(#HAIR)"/>
    <path d="M66 92 C68 66 84 52 100 50" fill="none" stroke="${c.hairLight}" stroke-width="2.2" stroke-linecap="round" opacity=".65"/>
    <path d="M133 94 C132 70 118 54 104 50" fill="none" stroke="${c.hairDark}" stroke-width="1.6" stroke-linecap="round" opacity=".45"/>`,
  side: `
    <path d="M65 90 C58 118 60 152 68 172 C74 170 78 160 78 148 C74 126 76 106 80 94 Z" fill="url(#HAIR)"/>
    <path d="M135 90 C142 118 140 152 132 172 C126 170 122 160 122 148 C126 126 124 106 120 94 Z" fill="url(#HAIR)"/>`,
  outfit: `
    <path d="M76 182 L100 214 L124 182 L134 190 L100 232 L66 190 Z" fill="#fff6f2"/>
    <path d="M100 214 L108 226 L100 238 L92 226 Z" fill="${c.outfitDark}"/>
    <path d="M66 190 L78 186 L84 200 L70 208 Z" fill="${c.outfitDark}" opacity=".55"/>
    <path d="M134 190 L122 186 L116 200 L130 208 Z" fill="${c.outfitDark}" opacity=".55"/>
    <circle cx="100" cy="224" r="5.2" fill="${c.accent}"/>
    <circle cx="100" cy="224" r="2.4" fill="#fff2c4"/>
    <path d="M52 250 C54 224 68 204 82 196" fill="none" stroke="${c.accent}" stroke-width="2.4" opacity=".8"/>`,
  acc: `
    <g transform="translate(126 76)">
      <circle cx="0" cy="-7" r="4.1" fill="#ff8db4"/><circle cx="6.6" cy="-2" r="4.1" fill="#ff8db4"/>
      <circle cx="4" cy="6" r="4.1" fill="#ff8db4"/><circle cx="-4" cy="6" r="4.1" fill="#ff8db4"/>
      <circle cx="-6.6" cy="-2" r="4.1" fill="#ff8db4"/><circle cx="0" cy="0" r="3.4" fill="#ffd166"/>
    </g>
    <g fill="${c.outfitDark}">
      <path d="M56 200 l-10 -6 2 12 -9 4 11 6 1 10 8-8 9 2 -6-9 5-8 -10 2z" opacity=".85"/>
      <path d="M144 208 l10 -4 -2 10 8 5 -10 4 -2 10 -7-8 -9 1 6-8 -4-8 9 2z" opacity=".8"/>
    </g>`,
  bg: `<g opacity=".5" fill="#ffd0e2">
      <circle cx="24" cy="52" r="3"/><circle cx="176" cy="36" r="2.2"/><circle cx="164" cy="192" r="2.6"/>
      <path d="M300 0" />
      <path d="M36 186 q8 -9 16 0 q-8 9 -16 0z"/><path d="M170 112 q7 -8 14 0 q-7 8 -14 0z" opacity=".7"/>
    </g>`
});

const YUKI = (c) => ({
  back: `
    <path d="M58 92 C58 44 80 30 100 30 C120 30 142 44 142 92 L154 232 L46 232 Z" fill="url(#HAIR)"/>
    <path d="M62 120 L52 240 L76 240 L82 130 Z" fill="${c.hairDark}" opacity=".35"/>
    <path d="M138 120 L148 240 L124 240 L118 130 Z" fill="${c.hairDark}" opacity=".35"/>
    <path d="M76 70 C84 44 116 44 124 70" fill="none" stroke="${c.hairLight}" stroke-width="2.4" opacity=".7"/>`,
  bangs: `
    <path d="M62 94 C62 58 82 42 102 42 C120 42 138 58 138 94 C132 88 126 76 120 66 C114 82 106 94 98 100 C94 90 90 78 88 70 C78 78 68 88 62 94 Z" fill="url(#HAIR)"/>
    <path d="M100 44 C96 66 94 88 98 104 C104 94 108 72 110 50 Z" fill="${c.hairLight}" opacity=".45"/>
    <path d="M62 90 C64 66 76 52 92 46" fill="none" stroke="${c.hairLight}" stroke-width="2" opacity=".6"/>`,
  side: `
    <path d="M63 92 C56 126 58 168 66 196 L78 192 C72 158 72 120 78 98 Z" fill="url(#HAIR)"/>
    <path d="M137 92 C144 126 142 168 134 196 L122 192 C128 158 128 120 122 98 Z" fill="url(#HAIR)"/>`,
  outfit: `
    <path d="M44 216 C52 190 72 180 86 178 C80 190 74 200 72 214 C62 220 52 230 48 250 L42 250 Z" fill="${c.outfitLight}"/>
    <path d="M156 216 C148 190 128 180 114 178 C120 190 126 200 128 214 C138 220 148 230 152 250 L158 250 Z" fill="${c.outfitLight}"/>
    <path d="M68 186 C78 172 88 168 100 168 C112 168 122 172 132 186 C126 198 116 206 100 206 C84 206 74 198 68 186 Z" fill="#f8fdff"/>
    <path d="M74 188 C82 178 90 174 100 174 C110 174 118 178 126 188 C118 196 110 200 100 200 C90 200 82 196 74 188 Z" fill="${c.outfit}" opacity=".28"/>
    <path d="M78 208 L100 240 L122 208 L130 214 L100 250 L70 214 Z" fill="${c.outfitDark}"/>
    <circle cx="100" cy="232" r="4" fill="${c.accent}"/><path d="M100 224 L104 232 L100 240 L96 232 Z" fill="#fff"/>`,
  acc: `
    <g transform="translate(128 67)" stroke="#dff6ff" stroke-width="1.5" opacity=".95">
      <path d="M0 -8 V8 M-7 -4 L7 4 M-7 4 L7 -4"/>
      <path d="M0 -8 l-2 -3 M0 -8 l2 -3 M-7 -4 l-3 -1 M7 -4 l3 -1" stroke-width="1.1"/>
      <circle cx="0" cy="0" r="1.8" fill="#fff"/>
    </g>
    <path d="M62 236 C70 244 78 246 88 244" fill="none" stroke="${c.accent}" stroke-width="2" opacity=".5"/>`,
  bg: `<g fill="#e8f8ff" opacity=".45">
      <g stroke="#dff6ff" stroke-width="1.2">
        <path d="M30 60 V78 M21 69 H39 M24 63 L36 75 M36 63 L24 75"/>
        <path d="M168 168 V184 M160 176 H176 M162 170 L174 182 M174 170 L162 182"/>
      </g>
      <circle cx="150" cy="48" r="2"/><circle cx="52" cy="156" r="1.6"/><circle cx="116" cy="24" r="1.4"/>
    </g>`
});

const HANA = (c) => ({
  back: `
    <path d="M60 92 C54 48 78 32 100 32 C122 32 146 48 140 92 L146 154 C150 184 132 200 112 196 C98 206 82 206 62 194 L52 154 Z" fill="url(#HAIR)"/>
    <path d="M58 120 C46 150 48 190 60 212 C66 222 80 220 82 208 C72 186 72 150 82 128 Z" fill="url(#HAIR)"/>
    <path d="M142 120 C154 150 152 190 140 212 C134 222 120 220 118 208 C128 186 128 150 118 128 Z" fill="url(#HAIR)"/>
    <path d="M48 196 C40 214 46 232 60 240 C64 226 62 210 64 200 Z" fill="${c.hairDark}" opacity=".8"/>`,
  bangs: `
    <path d="M64 96 C62 60 82 44 100 44 C118 44 138 60 136 96 C130 88 124 78 118 72 C112 86 106 96 99 102 C94 92 88 80 84 72 C76 80 69 88 64 96 Z" fill="url(#HAIR)"/>
    <path d="M70 84 C80 66 88 56 100 50" fill="none" stroke="${c.hairLight}" stroke-width="2.2" opacity=".6"/>
    <path d="M130 84 C120 66 112 56 100 50" fill="none" stroke="${c.hairLight}" stroke-width="1.6" opacity=".5"/>`,
  side: `
    <path d="M66 94 C60 126 62 160 70 182 C76 180 80 170 79 158 C75 134 76 110 81 98 Z" fill="url(#HAIR)"/>
    <path d="M134 94 C140 126 138 160 130 182 C124 180 120 170 121 158 C125 134 124 110 119 98 Z" fill="url(#HAIR)"/>
    <path d="M128 166 C136 178 136 194 128 206 C122 208 118 200 120 190 C122 182 122 174 124 168 Z" fill="${c.hairDark}" opacity=".55"/>`,
  outfit: `
    <path d="M74 182 L100 212 L126 182 L136 190 L100 230 L64 190 Z" fill="${c.outfitLight}"/>
    <path d="M80 208 C88 218 94 224 100 230 C106 224 112 218 120 208 L124 218 C116 232 108 240 100 246 C92 240 84 232 76 218 Z" fill="${c.outfit}"/>
    <path d="M70 202 C78 210 86 214 100 214 C114 214 122 210 130 202" fill="none" stroke="${c.outfitDark}" stroke-width="3"/>
    <path d="M106 214 C112 224 112 236 106 244" fill="none" stroke="${c.outfitLight}" stroke-width="2.4"/>
    <circle cx="120" cy="198" r="3.4" fill="${c.accent}"/><circle cx="80" cy="198" r="3.4" fill="${c.accent}"/>`,
  acc: `
    <g transform="translate(100 56)">
      <path d="M-24 4 Q-12 -10 0 0 Q12 -10 24 4 Q12 6 8 18 Q0 8 -8 18 Q-12 6 -24 4Z" fill="#6fbf8b" opacity=".9"/>
      <g fill="#ffe3ef" stroke="#ff9ec4" stroke-width=".8">
        <circle cx="-18" cy="2" r="3.4"/><circle cx="-10" cy="-4" r="3.4"/><circle cx="-2" cy="1" r="3.4"/>
        <circle cx="7" cy="-4" r="3.4"/><circle cx="16" cy="2" r="3.4"/>
      </g>
      <g fill="#fff6c9"><circle cx="-18" cy="2" r="1.2"/><circle cx="-10" cy="-4" r="1.2"/><circle cx="-2" cy="1" r="1.2"/><circle cx="7" cy="-4" r="1.2"/><circle cx="16" cy="2" r="1.2"/></g>
    </g>
    <g fill="#ffc9dd"><circle cx="74" cy="150" r="2"/><circle cx="126" cy="146" r="1.7"/><circle cx="120" cy="160" r="1.4"/></g>`,
  bg: `<g fill="#d9ffe6" opacity=".4">
      <path d="M28 108 q9 -10 18 0 q-9 10 -18 0z"/><path d="M158 66 q8 -9 16 0 q-8 9 -16 0z"/>
      <circle cx="46" cy="40" r="2.2"/><circle cx="170" cy="186" r="2.6"/><circle cx="150" cy="24" r="1.5"/>
    </g>`
});

const KURO = (c) => ({
  back: `
    <path d="M46 250 C42 196 48 134 52 104 C56 58 78 38 100 38 C122 38 144 58 148 104 C152 134 158 196 154 250 Z" fill="${c.outfitDark}"/>
    <path d="M56 108 C46 64 72 22 100 22 C128 22 154 64 144 108 L136 92 C130 60 118 48 100 48 C82 48 70 60 64 92 Z" fill="${c.outfit}"/>
    <path d="M60 96 C58 56 82 34 100 34 C118 34 142 56 140 96 L148 200 L132 196 L128 108 L72 108 L68 196 L52 200 Z" fill="${c.outfitDark}" opacity=".65"/>
    <path d="M64 60 C74 36 92 28 100 28" fill="none" stroke="${c.hairLight}" stroke-width="2" opacity=".35"/>`,
  bangs: `
    <path d="M66 100 C64 64 84 48 100 48 C116 48 136 64 134 100 C128 90 120 80 114 74 C110 90 104 100 98 104 C92 94 88 84 86 74 C78 82 70 92 66 100 Z" fill="url(#HAIR)"/>
    <path d="M78 70 C88 54 96 48 104 46" fill="none" stroke="${c.hairLight}" stroke-width="2" opacity=".5"/>`,
  side: `
    <path d="M67 94 C60 126 62 158 70 178 C76 178 79 170 78 160 C74 136 76 112 81 100 Z" fill="url(#HAIR)"/>
    <path d="M133 94 C140 126 138 158 130 178 C124 178 121 170 122 160 C126 136 124 112 119 100 Z" fill="url(#HAIR)"/>`,
  outfit: `
    <path d="M74 184 C80 196 88 206 100 212 C112 206 120 196 126 184 L142 194 C138 218 124 234 100 240 C76 234 62 218 58 194 Z" fill="${c.outfitDark}"/>
    <path d="M76 186 C84 196 92 202 100 206 C108 202 116 196 124 186" fill="none" stroke="${c.outfitLight}" stroke-width="2.4" opacity=".8"/>
    <path d="M58 250 C58 226 70 210 84 202 L84 250 Z" fill="${c.outfit}"/>
    <path d="M142 250 C142 226 130 210 116 202 L116 250 Z" fill="${c.outfit}"/>
    <g transform="translate(100 226)">
      <path d="M-16 0 C-8 -10 8 -10 16 0 C8 8 -8 8 -16 0Z" fill="${c.accent}" opacity=".28" filter="url(#GLOW)"/>
      <path d="M0 -6 L4 0 L0 6 L-4 0Z" fill="${c.accent}"/>
    </g>`,
  acc: `
    <g fill="${c.accent}" filter="url(#GLOW)" opacity=".9">
      <path d="M62 44 L68 52 L60 58 L58 48 Z"/><path d="M138 44 L132 52 L140 58 L142 48 Z"/>
    </g>
    <path d="M56 180 l14 12 -4 12 -14 -12 z" fill="${c.outfitLight}" opacity=".35"/>
    <path d="M144 180 l-14 12 4 12 14 -12 z" fill="${c.outfitLight}" opacity=".35"/>`,
  bg: `<g fill="${c.accent}" opacity=".22">
      <path d="M34 176 q20 -26 40 -6 q-18 18 -40 6z"/><path d="M152 92 q-18 -22 -34 -4 q16 16 34 4z"/>
      <circle cx="30" cy="72" r="2"/><circle cx="168" cy="156" r="2.4"/><circle cx="164" cy="40" r="1.4"/>
    </g>`
});

const PARTS = { sakura: SAKURA, yuki: YUKI, hana: HANA, kuro: KURO };

/* ------------------------------------------------------------------ */
/* portrait                                                            */
/* ------------------------------------------------------------------ */
export function portraitSVG(id) {
  const c = CARDS[id];
  if (!c) return '';
  const p = nextId();
  const part = PARTS[id](c);
  const glow = id === 'kuro' ? `<ellipse cx="83" cy="119" rx="6" ry="5" fill="${c.eye}" opacity=".4" filter="url(#${p}glow)"/><ellipse cx="117" cy="119" rx="6" ry="5" fill="${c.eye}" opacity=".4" filter="url(#${p}glow)"/>` : '';
  const body = neckBody(p, c, part.outfit)
    .replaceAll('url(#SKIN)', `url(#${p}skin)`)
    .replaceAll('url(#SOFT)', `url(#${p}soft)`);
  const faceSVG = face(c)
    .replaceAll('url(#SKIN)', `url(#${p}skin)`)
    .replaceAll('url(#SOFT)', `url(#${p}soft)`)
    .replaceAll('#SKIN', `#${p}skin`);
  const back = part.back.replaceAll('url(#HAIR)', `url(#${p}hair)`);
  const bangs = part.bangs.replaceAll('url(#HAIR)', `url(#${p}hair)`);
  const side = part.side.replaceAll('url(#HAIR)', `url(#${p}hair)`);
  const acc = part.acc.replaceAll('url(#GLOW)', `url(#${p}glow)`);
  const bg = part.bg;

  return `<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${c.name}, ${c.title}">
    ${defs(p, c)}
    <rect width="200" height="250" fill="url(#${p}bg)"/>
    ${bg}
    <ellipse cx="100" cy="112" rx="76" ry="82" fill="url(#${p}halo)" opacity=".5"/>
    <path d="M0 214 Q60 190 120 208 T200 198 L200 250 L0 250Z" fill="#000" opacity=".18"/>
    ${back}
    ${body}
    ${faceSVG}
    ${glow}
    ${eyes(p, c, 118)}
    ${brows(c, 101)}
    ${side}
    ${bangs}
    ${acc}
    <path d="M0 0 H200 V250 H0Z" fill="none" stroke="${c.hairLight}" stroke-opacity=".18" stroke-width="2"/>
  </svg>`;
}

/* ------------------------------------------------------------------ */
/* small icons                                                         */
/* ------------------------------------------------------------------ */
export function crownPath() {
  return 'M2.2 6.3 L7 9.4 L12 2.2 L17 9.4 L21.8 6.3 L20.1 17.4 H3.9 Z';
}

export function crownSVG(on = true) {
  return `<svg viewBox="0 0 24 20" aria-hidden="true" class="${on ? 'on' : ''}"><path d="${crownPath()}"/></svg>`;
}

export function foxAvatarSVG() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="fx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe8ef"/><stop offset="1" stop-color="#ffb3c8"/></linearGradient>
      <linearGradient id="fbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b2340"/><stop offset="1" stop-color="#2a1024"/></linearGradient>
    </defs>
    <rect width="64" height="64" fill="url(#fbg)"/>
    <circle cx="32" cy="34" r="26" fill="#ff5d7a" opacity=".14"/>
    <path d="M13 30 L9 10 L24 20 Z" fill="url(#fx)"/><path d="M51 30 L55 10 L40 20 Z" fill="url(#fx)"/>
    <path d="M32 12 C44 12 52 22 52 34 C52 48 43 56 32 56 C21 56 12 48 12 34 C12 22 20 12 32 12Z" fill="url(#fx)"/>
    <path d="M32 18 C34 24 40 26 46 24 C42 32 40 38 32 40 C24 38 22 32 18 24 C24 26 30 24 32 18Z" fill="#e84368" opacity=".85"/>
    <path d="M20 36 q5 -6 10 0 q-5 4 -10 0z" fill="#3a1630"/><path d="M34 36 q5 -6 10 0 q-5 4 -10 0z" fill="#3a1630"/>
    <circle cx="25" cy="36" r="1.6" fill="#ffd166"/><circle cx="39" cy="36" r="1.6" fill="#ffd166"/>
    <path d="M28 46 Q32 50 36 46" fill="none" stroke="#3a1630" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 30 q-6 -4 -8 2 q6 4 8 2zM52 30 q6 -4 8 2 q-6 4 -8 2z" fill="#ffb3c8" opacity=".6"/>
  </svg>`;
}

export function crestSVG() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="cb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b4d7a"/><stop offset="1" stop-color="#0b1d3a"/></linearGradient></defs>
    <rect width="64" height="64" fill="url(#cb)"/>
    <circle cx="32" cy="32" r="23" fill="none" stroke="#7fdcff" stroke-width="2" opacity=".5"/>
    <g transform="translate(32 32)" fill="#c7f4ff">
      <circle cx="0" cy="-13" r="6.4"/><circle cx="12.4" cy="-4" r="6.4"/><circle cx="7.6" cy="10.5" r="6.4"/>
      <circle cx="-7.6" cy="10.5" r="6.4"/><circle cx="-12.4" cy="-4" r="6.4"/>
    </g>
    <circle cx="32" cy="32" r="5" fill="#ffd166"/>
    <path d="M32 14 L35 23 L29 23 Z" fill="#ff7aa8"/>
  </svg>`;
}
