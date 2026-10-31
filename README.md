# Sakura Clash

A tiny, one-lane **Clash Royale**-style browser game with four anime heroines, symmetric towers, and a reactive AI opponent. Everything — characters, towers, arena, effects, and sound — is generated at runtime with Canvas 2D and the Web Audio API. No images, libraries, or build step.

## Play

Open `index.html`, or serve the folder:

```bash
python3 -m http.server 3002
# http://localhost:3002
```

## Controls

- **Tap a card, then tap your half** of the lane to summon.
- **Drag a card** onto the arena for one-gesture deployment.
- **1–4** selects a heroine, **Esc** cancels, **Enter/Space** toggles the focused card.
- The sound button persists your preference in `localStorage`.

## Rules

- Destroy the enemy **Queen Tower** for an instant 3-crown victory.
- **Princess Tower** — 1,500 HP. When it falls, the owner's Queen Tower activates.
- **Queen Tower** — 2,400 HP, fires only after it is damaged or the Princess Tower falls.
- Three-minute match. Ties go to a 60-second **sudden-death overtime**; the first tower to fall wins. If time expires, the side with more total tower HP wins.
- Mana caps at 10. Regen doubles in the final minute and during overtime.

## Heroines

| Card | Cost | Role | Mechanic |
| --- | --- | --- | --- |
| **Sakura** | 2 | Rush | Fast, cheap melee duelist. |
| **Yumi** | 3 | Ranged | Long-range arrows from behind the line. |
| **Hana** | 4 | Healer | Periodically heals nearby allies. |
| **Kaede** | 5 | Tank | Huge HP pool and 30% damage reduction. |

Both sides draw from the same four cards, so every matchup is symmetric. Hoshino, the AI, reacts to your threats and pushes when mana allows.

## Project layout

- `js/game.js` — simulation, combat, mana, AI, towers, match flow.
- `js/ui.js` — HUD, hand, input, menus, result screen.
- `js/render.js` — canvas compositor, HP bars, particles, deploy zone.
- `js/art.js` / `js/units-art.js` / `js/portraits.js` — procedural art.
- `styles.css` — mobile-first frame, HUD, cards, overlays.

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://omgithub.com).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://omgithub.com/juandavidisuiza/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/juandavidisuiza/PlayGround)

- 🎮 [Open the project](https://omgithub.com/juandavidisuiza/PlayGround).
- ✨ [Remix this project](https://omgithub.com/?remix=juandavidisuiza%2FPlayGround).
- 💻 [Explore the source](https://github.com/juandavidisuiza/PlayGround).
- 🛠️ [Check build runs](https://github.com/juandavidisuiza/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/juandavidisuiza/PlayGround/issues).
- 👤 [Explore the creator's projects](https://omgithub.com/juandavidisuiza).
- 🌍 [Create with OMGithub](https://omgithub.com).
<!-- omgithub:readme:end -->
