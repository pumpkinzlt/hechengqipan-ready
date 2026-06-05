# Merge Meadow Rush V4

HTML5 Canvas merge game for PC and mobile browsers. Open `index.html` directly or deploy the folder to GitHub Pages.

## V4 Gameplay Upgrade

- Collection book: players discover normal treasures and special tiles.
- Level map: 30-stage progression with star rewards and increasing targets.
- Special tiles: Rainbow, Bomb, Gold, and Chest tiles create surprise moments in each run.
- Failure rescue: close failures show a targeted rescue panel with Continue Token / Rescue Pack guidance.
- Bundle shop: Starter Boost Pack, Level Rescue Pack, Score Rush Pack, Weekend Meadow Deal.
- Existing systems retained: login/register, guest Beginner Mode, Classic/Arena/Level modes, localStorage saves, coins, items, skins, leaderboard, daily reward, accessibility settings, payment entry logic.

## Files

```text
index.html
style.css
game.js
README.md
.gitignore
.nojekyll
```

## Notes

- Data is saved in `localStorage` only.
- Payment calls use the provided `DoRequest(options)` pattern. Payment is blocked in local file preview to avoid invalid checkout callbacks; deploy to HTTPS/HTTP first, then test real success/failure returns.
- The game remains front-end only and can be uploaded to GitHub Pages.

- No online customer service/chat module is included in the game package.
