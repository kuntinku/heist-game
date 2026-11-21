# kuntinku/heist-game

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/kuntinku/heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/kuntinku/heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**Gilded Trust — Marble Hall Job**: a top-down heist. Cross an art deco bank hall,
read the guards' sweeping flashlight cones and the CCTV lenses before you move, bag
3 loot piles (you slow down carrying the duffel), and get to the van. Tools cost
uses: 2 smoke bombs hide you from every lens, 1 EMP blacks out the cameras. The
alarm meter is always in frame — every spotted second feeds it, it cools while
nothing sees you, and at 100 the whole floor goes into lockdown. Carpet is louder
than marble, guards hear footsteps and whistles, patrols are learnable. Full HUD,
WebAudio synth, win/lose screens. Pure HTML5 canvas + vanilla JS ES modules, no
libraries, no CDN, fully offline.

Controls: WASD move · SHIFT sneak · SPACE run · E whistle · Q smoke · X emp · R restart.

## Run it

```sh
node serve.ts            # serves game/ on http://localhost:8080
```

Deterministic screenshot scenes: `?shot=crossing|cameras|vault|getaway&seed=7` (see `screenshots/`).

Source layout: `config.js` tuning · `level.js` grid, collision, line-of-sight ·
`thief.js` movement, noise, tools · `guards.js` patrol–suspicious–lockdown–search AI ·
`cameras.js` sweeping CCTV · `audio.js` synth · `render.js` lighting, cones, alarm
meter, HUD · `game.js` state machine · `shots.js` staged deterministic scenes.

---

<sub>Entered on [make.fun](https://make.fun/?ref=m88kv07r&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
