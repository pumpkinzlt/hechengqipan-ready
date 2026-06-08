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

## V14 Retention & Conversion Update

- Compact game lobby ratio and stronger Start Game CTA.
- First-run quick tutorial for merge controls and tool usage.
- 7-day login reward cycle with coins and tools.
- Stronger combo, rare tile, Gold Rush, and special tile feedback.
- Level Map now displays all 30 stages with current/completed visual states.
- Collection summary shows the next treasure target.
- Game Over copy and rescue panel are tuned for close-failure recovery.

## V16 Mode Differentiation Update

- Beginner Mode is now a relaxed tutorial run with fewer penalties, longer timer, and safer special tiles.
- Classic Mode is now a high-score rush: score mission, combo streak bonuses, and Gold Tile spawns.
- Arena Mode is now a 6x6 AI rival race with live ranking, faster timer, rival surges, and win/loss based on final rank.
- Level Mode is now a puzzle stage mode with limited moves, target tile completion, and move/time-based star rating.


## V21 Mobile Adaptation

This version adds dedicated mobile layout rules for:
- Home screen proportions
- Bottom navigation grid
- Game HUD and stage panel
- Canvas safe play area
- Item bar
- Game Over modal
- Shop / Mode / Collection screens
- Small phone widths around 390px and below


## V22 Mobile Gameplay-First Adaptation

This version improves the actual mobile game screen:
- Hides the top brand bar while playing on mobile
- Keeps only Score / Time / Combo / Rush in the mobile HUD
- Compresses the stage panel
- Expands the Canvas play area
- Shrinks action buttons and item buttons
- Keeps 5 item buttons in one row on phones
- Adds landscape phone layout with side controls


## V23 Layout and Game Feel Polish

This version improves mobile gameplay feel:
- Larger board scaling on mobile
- Stage objective shown as an overlay instead of taking layout height
- Cleaner mobile HUD and controls
- First-tap merge hints
- Idle merge hints
- Softer invalid move feedback
- Small board shake on invalid attempts
- Stronger combo/merge feedback

## V24 PC and Payment Safety Guard

This version keeps the mobile gameplay layout improvements scoped to mobile screens only. Desktop/PC layout keeps the existing rules and is not overridden by the mobile optimization layer.

Payment logic is not changed in this version. The existing PayApi-v2 / CryptoJS loading checks, pending order handling, and success return logic are preserved.
