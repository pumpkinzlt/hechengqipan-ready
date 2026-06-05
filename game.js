(() => {
  'use strict';

  const SAVE_KEY = 'mergeMeadowRushSaveV1';
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const fmt = (n) => Math.floor(n).toLocaleString('en-US');

  const TILE_ICONS = ['·', '🌱', '🌿', '🌼', '🍓', '🍇', '💎', '🌟', '👑', '🚀'];
  const TILE_NAMES = ['Empty', 'Seed', 'Sprout', 'Bloom', 'Berry', 'Grape', 'Crystal', 'Star', 'Crown', 'Rocket'];
  const SPECIAL_TILES = {
    rainbow: { value: -1, icon: '🌈', title: 'Rainbow Tile', desc: 'Merges with any adjacent normal tile.' },
    bomb: { value: -2, icon: '💣', title: 'Bomb Tile', desc: 'Tap with any neighbor to clear a 3×3 area.' },
    gold: { value: -3, icon: '🟡', title: 'Gold Tile', desc: 'Turns the next adjacent merge into bonus score and coins.' },
    chest: { value: -4, icon: '🎁', title: 'Chest Tile', desc: 'Open it for coins, tools, time, or a shuffle.' }
  };
  const SPECIAL_BY_VALUE = Object.fromEntries(Object.values(SPECIAL_TILES).map(t => [t.value, t]));
  const TILE_COLORS = {
    default: ['#000000', '#85f0a6', '#5ad68b', '#ffd166', '#ff8ea3', '#ad7cff', '#67d9ff', '#fff475', '#ffb347', '#7cf7e9'],
    candy: ['#000000', '#ff9fcb', '#ff74ad', '#ffd166', '#ff6b6b', '#b892ff', '#7bdff2', '#f6f7d7', '#f7aef8', '#b8f2e6'],
    neon: ['#000000', '#53ffbd', '#00d084', '#faff00', '#ff2b7a', '#8c52ff', '#00d9ff', '#fff700', '#ff9f1c', '#3cfffa'],
    ocean: ['#000000', '#a5f3fc', '#67e8f9', '#38bdf8', '#0ea5e9', '#2563eb', '#7dd3fc', '#fde68a', '#c084fc', '#99f6e4']
  };

  const COIN_PACKS = [
    { id: 'starter', title: 'Starter Pack', price: 0.99, coins: 100 },
    { id: 'mini', title: 'Mini Pack', price: 2.99, coins: 350 },
    { id: 'popular', title: 'Popular Pack', price: 4.99, coins: 650 },
    { id: 'value', title: 'Best Value Pack', price: 9.99, coins: 1400 },
    { id: 'pro', title: 'Pro Pack', price: 19.99, coins: 3000 },
    { id: 'mega', title: 'Mega Pack', price: 49.99, coins: 8000 }
  ];

  const BUNDLES = [
    { id: 'starterBoost', title: 'Starter Boost Pack', price: 0.99, coins: 120, items: { autoMerge: 1, shuffle: 1 }, badge: 'Best for new players', desc: 'A cheap first boost that helps players feel the power of tools.' },
    { id: 'rescue', title: 'Level Rescue Pack', price: 2.99, coins: 300, items: { autoMerge: 3, freeze: 3, shuffle: 2 }, badge: 'For close failures', desc: 'Designed for players who are 1–2 merges away from winning.' },
    { id: 'rush', title: 'Score Rush Pack', price: 4.99, coins: 650, items: { doubleYield: 5, autoMerge: 2, shuffle: 2 }, badge: 'High score push', desc: 'Great for Arena and leaderboard runs.' },
    { id: 'weekend', title: 'Weekend Meadow Deal', price: 9.99, coins: 1500, items: { autoMerge: 6, shuffle: 6, freeze: 5, doubleYield: 5 }, skin: 'candy', badge: 'Limited style value', desc: 'Coins, tools, and a skin unlock in one pack.' }
  ];

  const DAILY_REWARDS = [
    { day: 1, label: '50 Coins', coins: 50 },
    { day: 2, label: 'Shuffle ×1', coins: 20, items: { shuffle: 1 } },
    { day: 3, label: '100 Coins', coins: 100 },
    { day: 4, label: 'Freeze Time ×1', coins: 30, items: { freeze: 1 } },
    { day: 5, label: 'Chest Bonus', coins: 120, items: { autoMerge: 1 } },
    { day: 6, label: '200 Coins', coins: 200 },
    { day: 7, label: 'Rare Skin Trial', coins: 250, items: { doubleYield: 1, autoMerge: 1 } }
  ];

  const ITEMS = {
    autoMerge: { title: 'Auto Merge', icon: '⚙️', cost: 120, cooldown: 14, duration: 8, desc: 'Auto-merges matching pairs for 8 seconds.' },
    shuffle: { title: 'Shuffle', icon: '🔀', cost: 90, cooldown: 12, duration: 0, desc: 'Refreshes the board and creates new chances.' },
    freeze: { title: 'Freeze Time', icon: '❄️', cost: 150, cooldown: 30, duration: 15, desc: 'Stops the game timer for 15 seconds.' },
    doubleYield: { title: 'Double Yield', icon: '✨', cost: 180, cooldown: 30, duration: 20, desc: 'Doubles score and earned coins for 20 seconds.' }
  };

  const SKINS = {
    default: { title: 'Default Garden', cost: 0, desc: 'Friendly meadow tiles.' },
    candy: { title: 'Candy Lab', cost: 450, desc: 'Soft candy colors and sweet tile glow.' },
    neon: { title: 'Neon Garden', cost: 650, desc: 'High-energy arcade glow.' },
    ocean: { title: 'Ocean Gems', cost: 550, desc: 'Cool aquatic treasure style.' }
  };

  const MODE_CONFIG = {
    beginner: { label: 'Beginner', time: 300, spawnMax: 2, multiplier: 0.9, save: false, target: 'Learn & Relax', ai: false, boardSize: 5, style: 'tutorial', specialChance: .045 },
    classic: { label: 'Classic', time: 180, spawnMax: 3, multiplier: 1.2, save: true, target: 'High Score Rush', ai: false, boardSize: 5, style: 'scoreRush', specialChance: .095 },
    arena: { label: 'Arena', time: 105, spawnMax: 3, multiplier: 1.55, save: true, target: 'Beat AI Rivals', ai: true, boardSize: 6, style: 'rivalRace', specialChance: .13 },
    level: { label: 'Level', time: 210, spawnMax: 2, multiplier: 1.08, save: true, target: 'Clear Stage Goal', ai: false, boardSize: 5, style: 'stagePuzzle', specialChance: .065 }
  };

  const LEVEL_MAP = Array.from({ length: 30 }, (_, i) => {
    const level = i + 1;
    return {
      level,
      title: level <= 10 ? 'Meadow Trail' : level <= 20 ? 'Candy Grove' : 'Star Orchard',
      targetLevel: clamp(4 + Math.floor((level - 1) / 3), 4, 9),
      reward: 35 + level * 5
    };
  });

  const $ = (id) => document.getElementById(id);
  const els = {
    app: $('app'), brandHome: $('brandHome'), accountPill: $('accountPill'),
    screens: {
      home: $('homeScreen'), mode: $('modeScreen'), shop: $('shopScreen'),
      leader: $('leaderScreen'), settings: $('settingsScreen'), collection: $('collectionScreen'), game: $('gameScreen')
    },
    authLoggedOut: $('authLoggedOut'), authLoggedIn: $('authLoggedIn'), signedInText: $('signedInText'),
    email: $('emailInput'), pass: $('passwordInput'), login: $('loginBtn'), register: $('registerBtn'), logout: $('logoutBtn'),
    homeCoins: $('homeCoins'), homeBest: $('homeBest'), homeSkin: $('homeSkin'), dailyState: $('dailyState'), dailyReward: $('dailyRewardBtn'),
    primaryStart: $('primaryStartBtn'), modeNav: $('modeNavBtn'), shopNav: $('shopNavBtn'), leaderNav: $('leaderNavBtn'), settingsNav: $('settingsNavBtn'), collectionNav: $('collectionNavBtn'),
    shopContent: $('shopContent'), leaderBody: $('leaderBody'), paymentMethods: $('paymentMethods'), collectionBody: $('collectionBody'), levelMap: $('levelMap'),
    musicToggle: $('musicToggle'), sfxToggle: $('sfxToggle'), accessibilityToggle: $('accessibilityToggle'), contrastToggle: $('contrastToggle'), motionToggle: $('motionToggle'), resetData: $('resetDataBtn'),
    canvasWrap: $('canvasWrap'), canvas: $('gameCanvas'),
    hudScore: $('hudScore'), hudBest: $('hudBest'), hudCoins: $('hudCoins'), hudMode: $('hudMode'), hudGoal: $('hudGoal'), hudTime: $('hudTime'), hudCombo: $('hudCombo'), hudRush: $('hudRush'),
    stagePanel: $('stagePanel'), stageTitle: $('stageTitle'), stageObjective: $('stageObjective'), stageDeadline: $('stageDeadline'), stageProgressFill: $('stageProgressFill'), stageProgressText: $('stageProgressText'),
    pause: $('pauseBtn'), resume: $('resumeBtn'), restart: $('restartBtn'), gameHome: $('gameHomeBtn'), itemBar: $('itemBar'), arenaRank: $('arenaRank'),
    modal: $('gameOverModal'), gameOverSubtitle: $('gameOverSubtitle'), gameOverTitle: $('gameOverTitle'), finalScore: $('finalScore'), finalBest: $('finalBest'), finalCoins: $('finalCoins'), finalStars: $('finalStars'), rescueHint: $('rescueHint'), rescueUse: $('rescueUseBtn'), rescueShop: $('rescueShopBtn'), modalRestart: $('modalRestartBtn'), modalHome: $('modalHomeBtn'),
    toast: $('toast')
  };
  const ctx = els.canvas.getContext('2d');

  function defaultProfile(email = 'Guest') {
    return {
      playerName: email === 'Guest' ? 'Guest' : email.split('@')[0],
      password: '',
      coins: email === 'Guest' ? 0 : 180,
      bestScore: 0,
      ownedSkins: ['default'],
      equippedSkin: 'default',
      ownedItems: { autoMerge: email === 'Guest' ? 0 : 2, shuffle: email === 'Guest' ? 0 : 2, freeze: email === 'Guest' ? 0 : 1, doubleYield: email === 'Guest' ? 0 : 1, continueToken: email === 'Guest' ? 0 : 1 },
      levelProgress: { unlocked: 1, stars: {} },
      collection: { discovered: [1], specials: [], bestTile: 1, chestsOpened: 0 },
      playerLevel: email === 'Guest' ? 1 : 2,
      xp: email === 'Guest' ? 0 : 40,
      leaderboard: [],
      dailyReward: { lastLoginDate: null, streak: 0 },
      tutorialSeen: false,
      settings: {}
    };
  }

  function defaultSave() {
    return {
      currentUser: null,
      accounts: {},
      guest: defaultProfile('Guest'),
      settings: { music: true, sfx: true, accessibility: false, highContrast: false, reducedMotion: false },
      pendingPayment: null,
      completedOrders: []
    };
  }

  let save = loadSave();
  let selectedPayType = 8004;
  let shopTab = 'coins';
  let activeScreen = 'home';
  let lastHomeNavButtonId = 'primaryStartBtn';
  let gameReturnScreen = 'mode';
  let lastMode = 'beginner';
  let audioReady = false;
  let audioCtx = null;
  let musicTimer = null;

  const game = {
    active: false,
    paused: false,
    mode: 'beginner',
    level: 1,
    boardSize: 5,
    board: [],
    selected: null,
    pointerStart: null,
    score: 0,
    coinsEarned: 0,
    combo: 0,
    timeLeft: 0,
    maxTime: 0,
    targetLevel: 4,
    targetReached: false,
    stageNumber: 1,
    stageTotal: 30,
    stageClear: false,
    endAt: 0,
    lastFrame: 0,
    loopId: null,
    boardRect: { x: 0, y: 0, size: 0, cell: 0 },
    particles: [],
    floats: [],
    activeItems: { autoMerge: 0, freeze: 0, doubleYield: 0 },
    cooldowns: { autoMerge: 0, shuffle: 0, freeze: 0, doubleYield: 0 },
    autoMergeTick: 0,
    ai: [],
    lastAiTick: 0,
    merges: 0,
    rushMeter: 0,
    rushTime: 0,
    mission: null,
    lastSurprise: 0,
    specialSpawnCooldown: 0,
    rescueUsed: false,
    lastFailureGap: 0,
    movesLeft: 0,
    maxMoves: 0,
    arenaPressureTimer: 0,
    classicBonusCount: 0
  };

  function normalizeSave(parsed) {
    if (!parsed || typeof parsed !== 'object') return defaultSave();
    const base = defaultSave();
    const merged = { ...base, ...parsed };
    merged.settings = { ...base.settings, ...(parsed.settings || {}) };
    merged.accounts = parsed.accounts || {};
    merged.guest = { ...defaultProfile('Guest'), ...(parsed.guest || {}) };
    merged.completedOrders = Array.isArray(parsed.completedOrders) ? parsed.completedOrders : [];
    return merged;
  }

  function loadSave() {
    try {
      return normalizeSave(JSON.parse(localStorage.getItem(SAVE_KEY)));
    } catch (err) {
      return normalizeSave(window.__MMR_MEMORY_SAVE || null);
    }
  }

  function persist() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (err) {
      window.__MMR_MEMORY_SAVE = JSON.parse(JSON.stringify(save));
    }
  }

  function currentUser() { return save.currentUser; }
  function isLoggedIn() { return Boolean(currentUser() && save.accounts[currentUser()]); }
  function profile() { return isLoggedIn() ? save.accounts[currentUser()] : save.guest; }
  function ensureAccountDefaults(email) {
    save.accounts[email] = { ...defaultProfile(email), ...(save.accounts[email] || {}) };
    save.accounts[email].ownedItems = { ...defaultProfile(email).ownedItems, ...(save.accounts[email].ownedItems || {}) };
    save.accounts[email].ownedSkins = Array.from(new Set(['default', ...(save.accounts[email].ownedSkins || [])]));
    save.accounts[email].levelProgress = { ...defaultProfile(email).levelProgress, ...(save.accounts[email].levelProgress || {}) };
    save.accounts[email].collection = { ...defaultProfile(email).collection, ...(save.accounts[email].collection || {}) };
    save.accounts[email].collection.discovered = Array.from(new Set([1, ...((save.accounts[email].collection || {}).discovered || [])]));
    save.accounts[email].collection.specials = Array.from(new Set(((save.accounts[email].collection || {}).specials || [])));
    save.accounts[email].dailyReward = { ...defaultProfile(email).dailyReward, ...(save.accounts[email].dailyReward || {}) };
    save.accounts[email].playerLevel = save.accounts[email].playerLevel || 1;
    save.accounts[email].xp = save.accounts[email].xp || 0;
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.remove('hidden');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.add('hidden'), 3200);
  }

  async function copyText(text) {
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('textarea');
        input.value = text;
        input.setAttribute('readonly', 'readonly');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      showToast(`Copied: ${text}`);
    } catch (err) {
      showToast('Copy failed. You can still long-press or use Ctrl/Cmd + C.');
    }
  }

  function bindCopyInteractions() {
    document.addEventListener('click', (event) => {
      const target = event.target.closest('.copyable');
      if (!target || event.target.closest('button, input, label, canvas')) return;
      const selectedText = window.getSelection && window.getSelection().toString().trim();
      if (selectedText) return;
      const text = (target.dataset.copy || target.textContent || '').trim();
      if (text) copyText(text);
    });
  }

  function setScreen(name) {
    if (activeScreen === 'game' && name !== 'game') { stopGameLoop(true); stopMusic(); document.body.classList.remove('rush-active'); }
    Object.values(els.screens).forEach(s => s.classList.remove('active-screen'));
    els.screens[name].classList.add('active-screen');
    activeScreen = name;
    els.modal.classList.add('hidden');
    if (name === 'home') {
      const homeNav = document.querySelector('[data-group="homeNav"]');
      homeNav?.querySelectorAll('.ui-btn').forEach(b => b.classList.remove('selected'));
      const selectedHomeNav = document.getElementById(lastHomeNavButtonId) || els.primaryStart;
      selectedHomeNav?.classList.add('selected');
    }
    updateUi();
    if (name === 'leader') renderLeaderboard();
    if (name === 'shop') renderShop();
    if (name === 'collection') renderCollection();
    if (name === 'mode') renderLevelMap();
    if (name === 'game') resizeCanvas();
  }

  function returnFromGame() {
    const target = gameReturnScreen && gameReturnScreen !== 'game' ? gameReturnScreen : 'mode';
    setScreen(target);
  }

  function updateUi() {
    const p = profile();
    const logged = isLoggedIn();
    els.authLoggedOut.classList.toggle('hidden', logged);
    els.authLoggedIn.classList.toggle('hidden', !logged);
    els.signedInText.textContent = logged ? `Signed in: ${currentUser()}` : '';
    els.accountPill.textContent = logged ? `Signed in: ${currentUser()}` : 'Guest Mode';
    els.homeCoins.textContent = fmt(p.coins || 0);
    els.homeBest.textContent = fmt(p.bestScore || 0);
    els.homeSkin.textContent = SKINS[p.equippedSkin || 'default'].title.replace(' Garden', '');
    if (document.getElementById('homeCollection')) document.getElementById('homeCollection').textContent = `${(p.collection?.discovered || [1]).length}/${TILE_NAMES.length - 1}`;
    if (document.getElementById('homeLevel')) document.getElementById('homeLevel').textContent = `Lv.${p.playerLevel || 1}`;
    els.primaryStart.innerHTML = logged
      ? '<span class="btn-title">▶ Start Game</span><small>Earn coins and unlock treasures</small>'
      : '<span class="btn-title">▶ Beginner Mode</span><small>Try a relaxed practice run</small>';
    const claimed = p.dailyReward?.lastLoginDate === todayKey();
    const nextDay = nextDailyDay(p);
    const reward = DAILY_REWARDS[nextDay - 1] || DAILY_REWARDS[0];
    els.dailyState.textContent = logged ? (claimed ? `Day ${nextDay} Claimed` : `Day ${nextDay} Ready`) : 'Log In';
    els.dailyReward.textContent = logged ? (claimed ? `Claimed Today · ${reward.label}` : `Claim Day ${nextDay}: ${reward.label}`) : 'Log in to Claim Reward';
    els.dailyReward.disabled = !logged || claimed;
    document.body.classList.toggle('high-contrast', save.settings.highContrast);
    document.body.classList.toggle('reduced-motion', save.settings.reducedMotion);
    els.musicToggle.checked = save.settings.music;
    els.sfxToggle.checked = save.settings.sfx;
    els.accessibilityToggle.checked = save.settings.accessibility;
    els.contrastToggle.checked = save.settings.highContrast;
    els.motionToggle.checked = save.settings.reducedMotion;
    document.querySelectorAll('[data-mode]').forEach(btn => {
      const mode = btn.dataset.mode;
      const lock = btn.querySelector('.mode-lock');
      if (lock && mode !== 'beginner') lock.textContent = logged ? 'Open' : 'Login Required';
    });
  }

  function setGroupSelected(button) {
    const group = button.closest('.mutual-group');
    if (!group || button.classList.contains('press-only')) return;
    group.querySelectorAll('.ui-btn').forEach(b => b.classList.remove('selected'));
    button.classList.add('selected');
    if (group.dataset.group === 'homeNav' && button.id) {
      lastHomeNavButtonId = button.id;
    }
  }

  function initButtons() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      unlockAudio();
      clickSound();
      setGroupSelected(button);
    });

    document.querySelectorAll('.home-link').forEach(btn => btn.addEventListener('click', () => setScreen('home')));
    els.brandHome.addEventListener('click', () => activeScreen === 'game' ? returnFromGame() : setScreen('home'));
    els.modeNav.addEventListener('click', () => setScreen('mode'));
    els.shopNav.addEventListener('click', () => setScreen('shop'));
    els.leaderNav.addEventListener('click', () => setScreen('leader'));
    els.settingsNav.addEventListener('click', () => setScreen('settings'));
    if (els.collectionNav) els.collectionNav.addEventListener('click', () => setScreen('collection'));
    els.primaryStart.addEventListener('click', () => startGame(isLoggedIn() ? 'classic' : 'beginner'));
    els.login.addEventListener('click', login);
    els.register.addEventListener('click', register);
    els.logout.addEventListener('click', logout);
    els.dailyReward.addEventListener('click', claimDailyReward);
    els.resetData.addEventListener('click', resetData);
    document.getElementById('tutorialStartBtn')?.addEventListener('click', closeTutorial);
    document.getElementById('tutorialSkipBtn')?.addEventListener('click', closeTutorial);

    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode !== 'beginner' && !isLoggedIn()) {
          showToast('Please log in or register to unlock this mode.');
          return;
        }
        startGame(mode);
      });
    });

    document.querySelectorAll('[data-shop-tab]').forEach(btn => {
      btn.addEventListener('click', () => { shopTab = btn.dataset.shopTab; renderShop(); });
    });
    document.querySelectorAll('[data-pay-type]').forEach(btn => {
      btn.addEventListener('click', () => { selectedPayType = Number(btn.dataset.payType); });
    });

    els.pause.addEventListener('click', pauseGame);
    els.resume.addEventListener('click', resumeGame);
    els.restart.addEventListener('click', () => restartGame());
    els.gameHome.addEventListener('click', returnFromGame);
    if (els.rescueUse) els.rescueUse.addEventListener('click', useRescueContinue);
    if (els.rescueShop) els.rescueShop.addEventListener('click', () => { els.modal.classList.add('hidden'); shopTab = 'bundles'; setScreen('shop'); });
    els.modalRestart.addEventListener('click', () => restartGame());
    els.modalHome.addEventListener('click', returnFromGame);

    ['music', 'sfx', 'accessibility', 'highContrast', 'reducedMotion'].forEach(key => {
      const map = { music: els.musicToggle, sfx: els.sfxToggle, accessibility: els.accessibilityToggle, highContrast: els.contrastToggle, reducedMotion: els.motionToggle };
      map[key].addEventListener('change', () => {
        save.settings[key] = map[key].checked;
        persist();
        updateUi();
        if (key === 'music') save.settings.music ? startMusic() : stopMusic();
      });
    });

    els.canvas.addEventListener('pointerdown', pointerDown);
    els.canvas.addEventListener('pointerup', pointerUp);
    els.canvas.addEventListener('pointercancel', () => { game.selected = null; });
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleKeys);
  }

  function login() {
    const email = els.email.value.trim().toLowerCase();
    const pass = els.pass.value;
    if (!email || !pass) return showToast('Enter email and password.');
    if (!save.accounts[email] || save.accounts[email].password !== pass) return showToast('Invalid account or password.');
    save.currentUser = email;
    ensureAccountDefaults(email);
    persist();
    updateUi();
    showToast('Login successful. Full modes unlocked.');
    successSound();
  }

  function register() {
    const email = els.email.value.trim().toLowerCase();
    const pass = els.pass.value;
    if (!email.includes('@')) return showToast('Please use a valid email address.');
    if (pass.length < 6) return showToast('Password must be at least 6 characters.');
    if (save.accounts[email]) return showToast('This account already exists. Please log in.');
    save.accounts[email] = defaultProfile(email);
    save.accounts[email].password = pass;
    save.currentUser = email;
    persist();
    updateUi();
    showToast('Registration successful. Welcome bonus tools added.');
    successSound();
  }

  function logout() {
    save.currentUser = null;
    persist();
    updateUi();
    showToast('Logged out. Beginner Mode remains available.');
  }

  function dateOffsetKey(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function nextDailyDay(p) {
    const dr = { streak: 0, ...(p.dailyReward || {}) };
    if (dr.lastLoginDate === todayKey()) return clamp(dr.streak || 1, 1, 7);
    if (dr.lastLoginDate === dateOffsetKey(-1)) return ((dr.streak || 0) % 7) + 1;
    return 1;
  }

  function grantDailyReward(p, reward) {
    p.coins = (p.coins || 0) + (reward.coins || 0);
    p.ownedItems = { ...defaultProfile(currentUser() || 'player@example.com').ownedItems, ...(p.ownedItems || {}) };
    Object.entries(reward.items || {}).forEach(([id, count]) => { p.ownedItems[id] = (p.ownedItems[id] || 0) + count; });
  }

  function claimDailyReward() {
    if (!isLoggedIn()) return showToast('Log in to claim the daily reward.');
    const p = profile();
    p.dailyReward = { streak: 0, ...(p.dailyReward || {}) };
    if (p.dailyReward.lastLoginDate === todayKey()) return showToast('Daily reward already claimed today.');
    const day = nextDailyDay(p);
    const reward = DAILY_REWARDS[day - 1] || DAILY_REWARDS[0];
    grantDailyReward(p, reward);
    p.dailyReward.lastLoginDate = todayKey();
    p.dailyReward.streak = day;
    persist();
    updateUi();
    renderShop();
    showToast(`Day ${day} reward claimed: ${reward.label}.`);
    coinSound();
  }

  function resetData() {
    if (!confirm('Reset all local game data in this browser?')) return;
    stopGameLoop(false);
    save = defaultSave();
    persist();
    updateUi();
    renderShop();
    renderLeaderboard();
    renderCollection();
    renderLevelMap();
    setScreen('home');
    showToast('Local data reset.');
  }

  function renderShop() {
    const p = profile();
    if (shopTab === 'coins') {
      els.paymentMethods.classList.remove('hidden');
      els.shopContent.innerHTML = `<div class="store-grid">${COIN_PACKS.map(pack => `
        <article class="store-card">
          <span class="store-badge">Coin Pack</span>
          <h3>${pack.title}</h3>
          <div class="price">$${pack.price.toFixed(2)}</div>
          <span>${fmt(pack.coins)} Coins</span>
          <p>Use coins for tools, skins, and faster progression.</p>
          <button class="ui-btn primary buy-pack" data-pack="${pack.id}" type="button">Pay Now</button>
        </article>`).join('')}</div>`;
      els.shopContent.querySelectorAll('.buy-pack').forEach(btn => btn.addEventListener('click', () => buyCoinPack(btn.dataset.pack)));
    } else if (shopTab === 'bundles') {
      els.paymentMethods.classList.remove('hidden');
      els.shopContent.innerHTML = `<div class="store-grid">${BUNDLES.map(bundle => `
        <article class="store-card bundle-card">
          <span class="store-badge">${escapeHtml(bundle.badge)}</span>
          <h3>${bundle.title}</h3>
          <div class="price">$${bundle.price.toFixed(2)}</div>
          <p>${escapeHtml(bundle.desc)}</p>
          <span>${fmt(bundle.coins)} Coins</span>
          <span>${Object.entries(bundle.items).map(([id, count]) => `${ITEMS[id].icon} ${ITEMS[id].title} ×${count}`).join(' · ')}</span>
          ${bundle.skin ? `<span>🎨 Includes ${SKINS[bundle.skin].title}</span>` : ''}
          <button class="ui-btn primary buy-bundle" data-bundle="${bundle.id}" type="button">Buy Bundle</button>
        </article>`).join('')}</div>`;
      els.shopContent.querySelectorAll('.buy-bundle').forEach(btn => btn.addEventListener('click', () => buyBundle(btn.dataset.bundle)));
    } else if (shopTab === 'items') {
      els.paymentMethods.classList.add('hidden');
      const continueCard = { title: 'Continue Token', icon: '💚', cost: 220, desc: 'Continue once after a close failure. Best used when you are 1–2 merges from success.' };
      const cards = [...Object.entries(ITEMS).map(([id, item]) => [id, item]), ['continueToken', continueCard]];
      els.shopContent.innerHTML = `<div class="store-grid">${cards.map(([id, item]) => `
        <article class="store-card">
          <h3>${item.icon} ${item.title}</h3>
          <p>${item.desc}</p>
          <span class="owned">Owned: ${p.ownedItems?.[id] || 0}</span>
          <div class="price">${item.cost} Coins</div>
          <button class="ui-btn primary buy-item" data-item="${id}" type="button">Buy Item</button>
        </article>`).join('')}</div>`;
      els.shopContent.querySelectorAll('.buy-item').forEach(btn => btn.addEventListener('click', () => buyItem(btn.dataset.item)));
    } else {
      els.paymentMethods.classList.add('hidden');
      els.shopContent.innerHTML = `<div class="store-grid">${Object.entries(SKINS).map(([id, skin]) => {
        const owned = p.ownedSkins?.includes(id);
        const equipped = p.equippedSkin === id;
        return `<article class="store-card">
          <h3>${skin.title}</h3>
          <p>${skin.desc}</p>
          <div class="price">${skin.cost ? `${skin.cost} Coins` : 'Free'}</div>
          <button class="ui-btn ${equipped ? 'selected' : 'primary'} skin-action" data-skin="${id}" type="button">${equipped ? 'Equipped' : owned ? 'Equip' : 'Buy'}</button>
        </article>`;
      }).join('')}</div>`;
      els.shopContent.querySelectorAll('.skin-action').forEach(btn => btn.addEventListener('click', () => handleSkin(btn.dataset.skin)));
    }
  }

  function paymentReturnBase() {
    if (!location || !location.protocol || location.protocol === 'file:') return '';
    if (!/^https?:$/.test(location.protocol)) return '';
    return `${location.origin}${location.pathname}`;
  }

  function canOpenPayment() {
    return Boolean(paymentReturnBase() && typeof window.DoRequest === 'function' && typeof window.CryptoJS !== 'undefined');
  }

  function openPayment(options, pending, successMessage) {
    if (!paymentReturnBase()) {
      showToast('Payment requires a deployed HTTPS/HTTP page. Local file preview cannot complete checkout.');
      return false;
    }
    if (typeof window.DoRequest !== 'function' || typeof window.CryptoJS === 'undefined') {
      showToast('Payment scripts are not loaded. Please check PayApi-v2.js and crypto-js.min.js.');
      return false;
    }
    save.pendingPayment = pending;
    persist();
    try {
      window.DoRequest(options);
      showToast(successMessage);
      return true;
    } catch (err) {
      save.pendingPayment = null;
      persist();
      showToast('Unable to open payment. Please check the selected payment method and try again.');
      return false;
    }
  }

  function buyBundle(bundleId) {
    if (!isLoggedIn()) return showToast('Log in to buy bundles.');
    const bundle = BUNDLES.find(b => b.id === bundleId);
    if (!bundle) return;
    const orderId = `MMRB${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
    const returnBase = paymentReturnBase();
    const pending = { orderId, user: currentUser(), bundleId, type: 'bundle', coins: bundle.coins, items: bundle.items, skin: bundle.skin || null, amount: bundle.price, createdAt: new Date().toISOString() };
    const options = {
      orderId,
      amount: bundle.price,
      currency: 'USD',
      payTypes: selectedPayType,
      name: `${bundle.title} - Merge Meadow Rush`,
      email: currentUser(),
      firstName: 'Merge',
      lastName: 'Player',
      phone: '0000000000',
      successUrl: `${returnBase}?payment=success&orderId=${orderId}`,
      backUrl: `${returnBase}?payment=failed&orderId=${orderId}`
    };
    openPayment(options, pending, 'Payment page opened. Bundle unlocks after successful return.');
  }

  function buyCoinPack(packId) {
    if (!isLoggedIn()) return showToast('Log in to buy coin packs.');
    const pack = COIN_PACKS.find(p => p.id === packId);
    if (!pack) return;
    const orderId = `MMR${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
    const returnBase = paymentReturnBase();
    const pending = { orderId, user: currentUser(), packId, type: 'coins', coins: pack.coins, amount: pack.price, createdAt: new Date().toISOString() };
    const options = {
      orderId,
      amount: pack.price,
      currency: 'USD',
      payTypes: selectedPayType,
      name: `${pack.title} - ${pack.coins} Coins`,
      email: currentUser(),
      firstName: 'Merge',
      lastName: 'Player',
      phone: '0000000000',
      successUrl: `${returnBase}?payment=success&orderId=${orderId}`,
      backUrl: `${returnBase}?payment=failed&orderId=${orderId}`
    };
    openPayment(options, pending, 'Payment page opened. Coins will be added after successful return.');
  }

  function handlePaymentReturn() {
    const params = new URLSearchParams(location.search);
    const status = params.get('payment');
    if (!status) return;
    const orderId = params.get('orderId');
    const pending = save.pendingPayment;
    if (status === 'success' && pending && pending.orderId === orderId && !save.completedOrders.includes(orderId)) {
      ensureAccountDefaults(pending.user);
      const account = save.accounts[pending.user];
      if (pending.type === 'bundle') {
        const bundle = BUNDLES.find(b => b.id === pending.bundleId) || { coins: pending.coins || 0, items: pending.items || {}, skin: pending.skin || null, title: 'Bundle' };
        applyBundle(account, bundle);
        showToast(`Payment successful. ${bundle.title} unlocked.`);
      } else {
        account.coins = (account.coins || 0) + (pending.coins || 0);
        showToast(`Payment successful. ${pending.coins || 0} Coins added.`);
      }
      save.completedOrders.push(orderId);
      save.pendingPayment = null;
      save.currentUser = pending.user;
      persist();
      updateUi();
      renderShop();
    } else if (status === 'failed') {
      save.pendingPayment = null;
      persist();
      showToast('Payment was cancelled or failed. No coins were added.');
    } else {
      showToast('Payment return did not match a pending order. No duplicate coins added.');
    }
    history.replaceState(null, '', location.pathname);
  }

  function applyBundle(account, bundle) {
    account.coins = (account.coins || 0) + bundle.coins;
    account.ownedItems = { ...defaultProfile(account.playerName || 'player@example.com').ownedItems, ...(account.ownedItems || {}) };
    Object.entries(bundle.items || {}).forEach(([id, count]) => { account.ownedItems[id] = (account.ownedItems[id] || 0) + count; });
    if (bundle.skin) account.ownedSkins = Array.from(new Set([...(account.ownedSkins || ['default']), bundle.skin]));
    account.xp = (account.xp || 0) + 80;
    account.playerLevel = Math.max(account.playerLevel || 1, Math.floor(account.xp / 100) + 1);
  }

  function buyItem(itemId) {
    if (!isLoggedIn()) return showToast('Log in to buy and save items.');
    const p = profile();
    const item = itemId === 'continueToken' ? { title: 'Continue Token', cost: 220 } : ITEMS[itemId];
    if (!item) return;
    if ((p.coins || 0) < item.cost) return showToast('Not enough coins. Try a bundle or earn more in-game.');
    p.coins -= item.cost;
    p.ownedItems[itemId] = (p.ownedItems[itemId] || 0) + 1;
    addXp(8);
    persist();
    updateUi();
    renderShop();
    showToast(`${item.title} purchased.`);
    successSound();
  }

  function handleSkin(skinId) {
    if (!isLoggedIn()) return showToast('Log in to unlock and equip skins.');
    const skin = SKINS[skinId];
    const p = profile();
    if (!skin) return;
    if (!p.ownedSkins.includes(skinId)) {
      if (p.coins < skin.cost) return showToast('Not enough coins for this skin.');
      p.coins -= skin.cost;
      p.ownedSkins.push(skinId);
      showToast(`${skin.title} unlocked.`);
    }
    p.equippedSkin = skinId;
    persist();
    updateUi();
    renderShop();
    successSound();
  }

  function renderCollection() {
    if (!els.collectionBody) return;
    const p = profile();
    const discovered = new Set(p.collection?.discovered || [1]);
    const specials = new Set(p.collection?.specials || []);
    const normalCards = TILE_NAMES.slice(1).map((name, idx) => {
      const level = idx + 1;
      const unlocked = discovered.has(level);
      return `<article class="collection-card ${unlocked ? 'unlocked' : 'locked'}">
        <div class="collection-icon">${unlocked ? TILE_ICONS[level] : '❔'}</div>
        <strong>${unlocked ? name : 'Locked'}</strong>
        <span>${unlocked ? `Level ${level} discovered` : `Merge to level ${level} to reveal`}</span>
      </article>`;
    }).join('');
    const specialCards = Object.values(SPECIAL_TILES).map(s => {
      const unlocked = specials.has(s.title);
      return `<article class="collection-card ${unlocked ? 'unlocked special' : 'locked'}">
        <div class="collection-icon">${unlocked ? s.icon : '❔'}</div>
        <strong>${unlocked ? s.title : 'Mystery Special'}</strong>
        <span>${unlocked ? s.desc : 'Find this special tile in a run'}</span>
      </article>`;
    }).join('');
    const nextLevel = TILE_NAMES.slice(1).findIndex((_, idx) => !discovered.has(idx + 1)) + 1;
    const nextText = nextLevel > 0 ? `Next: ${TILE_NAMES[nextLevel]}` : 'All core treasures discovered';
    els.collectionBody.innerHTML = `<div class="collection-summary"><strong>${discovered.size}/${TILE_NAMES.length - 1} treasures</strong><span>${specials.size}/${Object.keys(SPECIAL_TILES).length} special tiles discovered · Best: ${TILE_NAMES[p.collection?.bestTile || 1]} · ${nextText}</span></div><div class="collection-grid">${normalCards}${specialCards}</div>`;
  }

  function renderLevelMap() {
    if (!els.levelMap) return;
    const p = profile();
    const unlocked = isLoggedIn() ? (p.levelProgress?.unlocked || 1) : 0;
    els.levelMap.innerHTML = LEVEL_MAP.map(meta => {
      const open = isLoggedIn() && meta.level <= unlocked;
      const current = isLoggedIn() && meta.level === unlocked;
      const stars = p.levelProgress?.stars?.[meta.level] || 0;
      return `<button class="level-node ui-btn ${open ? '' : 'locked'} ${stars ? 'completed' : ''} ${current ? 'current' : ''}" data-level-node="${meta.level}" type="button" ${open ? '' : 'disabled'}>
        <strong>${meta.level}</strong><span>${meta.title}</span><em>${TILE_NAMES[meta.targetLevel]} · ${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 3-stars))}</em>
      </button>`;
    }).join('');
    els.levelMap.querySelectorAll('[data-level-node]').forEach(btn => btn.addEventListener('click', () => {
      if (!isLoggedIn()) return showToast('Log in to play Level Map.');
      const selected = Number(btn.dataset.levelNode);
      profile().levelProgress.unlocked = Math.max(profile().levelProgress.unlocked || 1, selected);
      startGame('level');
    }));
  }

  function renderLeaderboard() {
    const rows = [];
    Object.entries(save.accounts).forEach(([email, acc]) => {
      (acc.leaderboard || []).forEach(row => rows.push({ ...row, player: acc.playerName || email.split('@')[0] }));
    });
    (save.guest.leaderboard || []).forEach(row => rows.push({ ...row, player: 'Guest' }));
    if (!rows.length) {
      rows.push(
        { player: 'AvaBot', score: 2380, mode: 'Arena', date: todayKey() },
        { player: 'MergeMax', score: 1860, mode: 'Classic', date: todayKey() },
        { player: 'LunaAI', score: 1420, mode: 'Beginner', date: todayKey() }
      );
    }
    rows.sort((a, b) => b.score - a.score);
    els.leaderBody.innerHTML = rows.slice(0, 20).map((row, index) => `<tr><td class="copyable">#${index + 1}</td><td class="copyable">${escapeHtml(row.player)}</td><td class="copyable">${fmt(row.score)}</td><td class="copyable">${escapeHtml(row.mode)}</td><td class="copyable">${escapeHtml(row.date)}</td></tr>`).join('');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
  }

  function startGame(mode) {
    if (mode !== 'beginner' && !isLoggedIn()) return showToast('Please log in to play full modes.');
    if (activeScreen !== 'game') {
      gameReturnScreen = 'mode';
    }
    lastMode = mode;
    const cfg = MODE_CONFIG[mode];
    const p = profile();
    game.active = true;
    game.paused = false;
    game.mode = mode;
    game.level = mode === 'level' ? (p.levelProgress?.unlocked || 1) : 1;
    game.boardSize = cfg.boardSize || 5;
    game.stageNumber = getStageNumber(mode, p);
    game.stageTotal = LEVEL_MAP.length;
    game.board = makeBoard(game.boardSize, cfg.spawnMax);
    game.selected = null;
    game.pointerStart = null;
    game.score = 0;
    game.coinsEarned = 0;
    game.combo = 0;
    game.maxTime = cfg.time + (save.settings.accessibility ? 50 : 0) + (mode === 'level' ? Math.max(0, 28 - game.level) : 0);
    game.timeLeft = game.maxTime;
    game.endAt = Date.now() + Math.ceil(game.maxTime * 1000);
    game.stageClear = false;
    game.targetLevel = mode === 'level' ? (LEVEL_MAP[clamp(game.level, 1, LEVEL_MAP.length) - 1]?.targetLevel || 4) : 0;
    game.maxMoves = mode === 'level' ? Math.max(14, 30 - Math.floor(game.level / 2)) : 0;
    game.movesLeft = game.maxMoves;
    game.targetReached = false;
    game.particles = [];
    game.floats = [];
    game.activeItems = { autoMerge: 0, freeze: 0, doubleYield: 0 };
    game.cooldowns = { autoMerge: 0, shuffle: 0, freeze: 0, doubleYield: 0 };
    game.autoMergeTick = 0;
    game.ai = cfg.ai ? makeAiScores() : [];
    game.lastAiTick = 0;
    game.merges = 0;
    game.rushMeter = 0;
    game.rushTime = 0;
    game.lastSurprise = 0;
    game.specialSpawnCooldown = 0;
    game.rescueUsed = false;
    game.lastFailureGap = 0;
    game.arenaPressureTimer = mode === 'arena' ? 12 : 0;
    game.classicBonusCount = 0;
    game.mission = createMission(mode);
    setScreen('game');
    els.pause.classList.remove('hidden');
    els.resume.classList.add('hidden');
    els.arenaRank.classList.toggle('hidden', !cfg.ai);
    resizeCanvas();
    ensurePlayableBoard();
    updateHud();
    renderItemBar();
    startMusic();
    beginLoop();
    startSound();
    showModeIntro(mode);
    showTutorialIfNeeded();
  }


  function getStageNumber(mode, p) {
    if (mode === 'level') return clamp(p.levelProgress?.unlocked || 1, 1, LEVEL_MAP.length);
    if (mode === 'classic') return clamp(Math.floor((p.bestScore || 0) / 1800) + 1, 1, LEVEL_MAP.length);
    if (mode === 'arena') return clamp(p.playerLevel || 1, 1, LEVEL_MAP.length);
    return 1;
  }

  function stageLabel() {
    const modeName = MODE_CONFIG[game.mode]?.label || 'Stage';
    return `${modeName} Stage ${game.stageNumber}/${game.stageTotal}`;
  }

  function missionProgressRatio() {
    const m = game.mission;
    if (!m) return 0;
    if (m.done) return 1;
    if (m.type === 'level') return clamp((m.progress || 0) / Math.max(1, m.targetLevel || 1), 0, 1);
    if (m.type === 'score') return clamp((m.progress || 0) / Math.max(1, m.target || 1), 0, 1);
    if (m.type === 'rank') return clamp((4 - arenaRankPosition()) / 3, 0, 1);
    return clamp((m.progress || 0) / Math.max(1, m.target || 1), 0, 1);
  }

  function showModeIntro(mode) {
    const messages = {
      beginner: 'Beginner Stage: clear the merge target before the timer ends.',
      classic: `Classic Stage ${game.stageNumber}: reach the score target before time runs out.`,
      arena: 'Arena Stage: 6×6 rival race. Finish #1 before the timer ends.',
      level: `Level Stage ${game.level}: reach ${TILE_NAMES[game.targetLevel]} within ${game.movesLeft} moves and the timer.`
    };
    addCenterFloat(messages[mode] || 'Start merging!');
    showToast(messages[mode] || 'Start merging!');
  }

  function restartGame() {
    els.modal.classList.add('hidden');
    stopGameLoop(false);
    startGame(lastMode || game.mode || 'beginner');
  }

  function pauseGame() {
    if (!game.active || game.paused) return;
    game.paused = true;
    els.pause.classList.add('hidden');
    els.resume.classList.remove('hidden');
    showToast('Paused');
  }

  function resumeGame() {
    if (!game.active || !game.paused) return;
    game.paused = false;
    game.lastFrame = performance.now();
    els.pause.classList.remove('hidden');
    els.resume.classList.add('hidden');
    showToast('Resumed');
  }


  function showTutorialIfNeeded() {
    const p = profile();
    if (p.tutorialSeen || !document.getElementById('tutorialModal')) return;
    p.tutorialSeen = true;
    persist();
    game.paused = true;
    els.pause.classList.add('hidden');
    els.resume.classList.remove('hidden');
    document.getElementById('tutorialModal').classList.remove('hidden');
  }

  function closeTutorial() {
    const modal = document.getElementById('tutorialModal');
    if (modal) modal.classList.add('hidden');
    if (game.active && game.paused) resumeGame();
  }

  function stopGameLoop(clearActive = true) {
    if (game.loopId) cancelAnimationFrame(game.loopId);
    game.loopId = null;
    if (clearActive) game.active = false;
  }

  function beginLoop() {
    stopGameLoop(false);
    game.lastFrame = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - game.lastFrame) / 1000 || 0);
      game.lastFrame = now;
      if (game.active && !game.paused) updateGame(dt);
      drawGame();
      if (game.active) game.loopId = requestAnimationFrame(frame);
    };
    game.loopId = requestAnimationFrame(frame);
  }

  function makeBoard(size, maxLevel) {
    const board = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) row.push(randomTile(maxLevel));
      board.push(row);
    }
    return board;
  }

  function randomTile(maxLevel) {
    const cap = save.settings.accessibility ? Math.max(1, maxLevel - 1) : maxLevel;
    const roll = Math.random();
    if (roll < 0.68) return 1;
    if (roll < 0.92) return Math.min(2, cap);
    return Math.min(3, cap);
  }

  function randomSpawnTile(maxLevel) {
    if (!game.active) return randomTile(maxLevel);
    game.specialSpawnCooldown = Math.max(0, (game.specialSpawnCooldown || 0) - 1);
    const cfg = MODE_CONFIG[game.mode] || MODE_CONFIG.classic;
    const baseChance = cfg.specialChance ?? .085;
    const chance = save.settings.accessibility ? Math.min(.18, baseChance + .035) : baseChance;
    if (game.merges > 2 && game.specialSpawnCooldown <= 0 && Math.random() < chance) {
      game.specialSpawnCooldown = game.mode === 'arena' ? 3 : game.mode === 'beginner' ? 6 : 4;
      const roll = Math.random();
      let specialValue;
      if (game.mode === 'beginner') {
        specialValue = roll < .45 ? SPECIAL_TILES.rainbow.value : roll < .75 ? SPECIAL_TILES.chest.value : SPECIAL_TILES.gold.value;
      } else if (game.mode === 'arena') {
        specialValue = roll < .28 ? SPECIAL_TILES.bomb.value : roll < .56 ? SPECIAL_TILES.gold.value : roll < .78 ? SPECIAL_TILES.rainbow.value : SPECIAL_TILES.chest.value;
      } else if (game.mode === 'level') {
        specialValue = roll < .36 ? SPECIAL_TILES.rainbow.value : roll < .62 ? SPECIAL_TILES.bomb.value : roll < .82 ? SPECIAL_TILES.chest.value : SPECIAL_TILES.gold.value;
      } else {
        specialValue = roll < .38 ? SPECIAL_TILES.gold.value : roll < .62 ? SPECIAL_TILES.chest.value : roll < .82 ? SPECIAL_TILES.rainbow.value : SPECIAL_TILES.bomb.value;
      }
      const special = SPECIAL_BY_VALUE[specialValue];
      if (special) addCenterFloat(`${special.icon} ${special.title} appeared!`);
      return specialValue;
    }
    return randomTile(maxLevel);
  }

  function ensurePlayableBoard() {
    let tries = 0;
    while (!findMergePair() && tries < 30) {
      const x = Math.floor(Math.random() * (game.boardSize - 1));
      const y = Math.floor(Math.random() * game.boardSize);
      game.board[y][x] = 1;
      game.board[y][x + 1] = 1;
      tries++;
    }
  }

  function createMission(mode) {
    const stage = game.stageNumber || 1;
    if (mode === 'beginner') return { type: 'merges', title: 'Stage Goal: make 8 safe merges', target: 8, progress: 0, rewardScore: 180, rewardCoins: 6, timeBonus: 0, done: false, endsRun: true };
    if (mode === 'classic') {
      const scoreTarget = 1800 + stage * 450;
      return { type: 'score', title: `Stage ${stage} Goal: reach ${fmt(scoreTarget)} points`, target: scoreTarget, progress: 0, rewardScore: 380 + stage * 20, rewardCoins: 12, timeBonus: 0, done: false, endsRun: true };
    }
    if (mode === 'arena') return { type: 'rank', title: 'Arena Stage: finish #1 before time ends', target: 1, progress: 4, rewardScore: 420, rewardCoins: 12, timeBonus: 0, done: false, endsRun: false };
    if (mode === 'level') {
      const meta = LEVEL_MAP[clamp(game.level, 1, LEVEL_MAP.length) - 1] || LEVEL_MAP[0];
      return { type: 'level', title: `Stage ${game.level} Goal: make ${TILE_NAMES[game.targetLevel]}`, targetLevel: game.targetLevel, progress: 0, rewardScore: 220 + game.level * 20, rewardCoins: Math.floor(meta.reward / 4), timeBonus: 0, done: false, endsRun: true };
    }
    return { type: 'merges', title: 'Stage Goal: keep merging', target: 10, progress: 0, rewardScore: 160, rewardCoins: 5, timeBonus: 0, done: false, endsRun: true };
  }

  function missionText() {
    const m = game.mission;
    if (!m) return MODE_CONFIG[game.mode]?.target || 'Free Merge';
    if (m.done) return 'Quest Complete ✓';
    if (m.type === 'level') return `${m.title} ${m.progress}/${m.targetLevel}${game.movesLeft ? ` · ${game.movesLeft} moves` : ''}`;
    if (m.type === 'score') return `${m.title} ${fmt(Math.min(m.progress, m.target))}/${fmt(m.target)}`;
    if (m.type === 'rank') return `${m.title} · current #${arenaRankPosition()}`;
    return `${m.title} ${Math.min(m.progress, m.target)}/${m.target}`;
  }

  function updateMission(nextLevel, automated) {
    const m = game.mission;
    if (!m || m.done) return;
    if (m.type === 'merges') m.progress += 1;
    if (m.type === 'combo') m.progress = Math.max(m.progress, game.combo);
    if (m.type === 'score') m.progress = Math.max(m.progress, game.score);
    if (m.type === 'rank') m.progress = arenaRankPosition();
    if (m.type === 'level') m.progress = Math.max(m.progress, nextLevel);
    const complete = m.type === 'level' ? m.progress >= m.targetLevel : m.type === 'rank' ? m.progress <= m.target : m.progress >= m.target;
    if (!complete) return;
    m.done = true;
    game.score += m.rewardScore;
    game.coinsEarned += m.rewardCoins;
    if (m.timeBonus) game.timeLeft = Math.min(game.maxTime + 30, game.timeLeft + m.timeBonus);
    addCenterFloat(`Stage Goal Complete +${m.rewardScore}`);
    showToast(`${m.title} complete! Stage clear bonus awarded.`);
    successSound();
    if (m.endsRun && !game.stageClear) {
      game.stageClear = true;
      game.targetReached = true;
      setTimeout(() => endGame(true, 'Stage Clear'), 500);
    }
  }

  function addXp(amount) {
    const p = profile();
    if (!isLoggedIn()) return;
    p.xp = (p.xp || 0) + amount;
    const nextLevel = Math.floor(p.xp / 100) + 1;
    if (nextLevel > (p.playerLevel || 1)) {
      p.playerLevel = nextLevel;
      p.coins = (p.coins || 0) + 25;
      showToast(`Player Level ${nextLevel}! Bonus 25 Coins.`);
    }
  }

  function discoverTile(level) {
    const p = profile();
    p.collection = { ...defaultProfile().collection, ...(p.collection || {}) };
    p.collection.discovered = Array.from(new Set([1, ...(p.collection.discovered || [])]));
    if (level > 0 && !p.collection.discovered.includes(level)) {
      p.collection.discovered.push(level);
      p.collection.bestTile = Math.max(p.collection.bestTile || 1, level);
      game.score += level * 80;
      game.coinsEarned += Math.max(3, level);
      addCenterFloat(`New Discovery: ${TILE_NAMES[level]}!`);
      showToast(`Collection updated: ${TILE_NAMES[level]} discovered.`);
    }
  }

  function discoverSpecial(value) {
    const special = SPECIAL_BY_VALUE[value];
    if (!special) return;
    const p = profile();
    p.collection = { ...defaultProfile().collection, ...(p.collection || {}) };
    p.collection.specials = Array.from(new Set([...(p.collection.specials || []), special.title]));
  }

  function addRush(amount) {
    if (game.rushTime > 0) return;
    game.rushMeter = Math.min(100, game.rushMeter + amount);
    if (game.rushMeter >= 100) activateGoldRush();
  }

  function activateGoldRush() {
    game.rushMeter = 0;
    game.rushTime = save.settings.accessibility ? 15 : 12;
    game.timeLeft = Math.min(game.maxTime + 35, game.timeLeft + 4);
    addCenterFloat('🔥 GOLD RUSH! Score boost ON');
    showToast('Gold Rush activated: higher score, bonus coins, and glowing board.');
    successSound();
  }

  function triggerSurpriseDrop(tx, ty) {
    const roll = Math.random();
    if (roll < .34) {
      const bonus = save.settings.accessibility ? 10 : 7;
      game.timeLeft = Math.min(game.maxTime + 35, game.timeLeft + bonus);
      addFloat(`🎁 +${bonus}s`, tx, ty, '#ffd166');
      showToast(`Surprise Drop: +${bonus}s time bonus.`);
    } else if (roll < .68) {
      const bonusScore = 120 + game.combo * 18;
      const bonusCoins = 5;
      game.score += bonusScore;
      game.coinsEarned += bonusCoins;
      addFloat(`🎁 +${bonusScore}`, tx, ty, '#7ef2b0');
      showToast('Surprise Drop: bonus score and coins.');
    } else {
      shuffleBoard(true);
      addFloat('🎁 Lucky Shuffle', tx, ty, '#4de5ff');
      showToast('Surprise Drop: lucky board shuffle.');
    }
    makeParticles(tx, ty, 7);
    coinSound();
  }

  function maybeLuckyChain(automated) {
    if (automated || game.combo < 3 || Math.random() > .22) return;
    const pair = findMergePair();
    if (!pair) return;
    setTimeout(() => {
      if (!game.active || game.paused) return;
      addCenterFloat('⚡ Lucky Chain');
      mergeTiles(pair.a, pair.b, true);
    }, 180);
  }

  function updateGame(dt) {
    const freeze = game.activeItems.freeze > 0;
    if (!freeze) game.timeLeft -= dt;
    if (game.rushTime > 0) {
      game.rushTime = Math.max(0, game.rushTime - dt);
      if (game.rushTime === 0) addCenterFloat('Gold Rush ended');
    }
    document.body.classList.toggle('rush-active', game.rushTime > 0);
    Object.keys(game.activeItems).forEach(k => { if (game.activeItems[k] > 0) game.activeItems[k] = Math.max(0, game.activeItems[k] - dt); });
    Object.keys(game.cooldowns).forEach(k => { if (game.cooldowns[k] > 0) game.cooldowns[k] = Math.max(0, game.cooldowns[k] - dt); });
    game.particles.forEach(p => { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.size += p.grow * dt; });
    game.particles = game.particles.filter(p => p.life > 0);
    game.floats.forEach(f => { f.life -= dt; f.y -= 34 * dt; });
    game.floats = game.floats.filter(f => f.life > 0);
    if (game.activeItems.autoMerge > 0) {
      game.autoMergeTick -= dt;
      if (game.autoMergeTick <= 0) {
        game.autoMergeTick = 1.05;
        const pair = findMergePair();
        if (pair) mergeTiles(pair.a, pair.b, true);
      }
    }
    if (MODE_CONFIG[game.mode].ai) {
      updateAi(dt);
      updateArenaPressure(dt);
    }
    if (!findMergePair() && Math.random() < dt * (save.settings.accessibility ? 2 : 1)) shuffleBoard(true);
    if (game.mode === 'level' && game.movesLeft <= 0 && !game.targetReached) endGame(false, 'No moves left');
    if (game.timeLeft <= 0) {
      if (game.mode === 'arena') endGame(arenaRankPosition() === 1, arenaRankPosition() === 1 ? 'You beat the AI rivals' : 'AI rivals finished ahead');
      else endGame(false, 'Time is up');
    }
    updateHud();
    renderItemBar(false);
  }


  function updateArenaPressure(dt) {
    if (game.mode !== 'arena') return;
    game.arenaPressureTimer -= dt;
    if (game.arenaPressureTimer > 0) return;
    game.arenaPressureTimer = 14;
    const leaderBoost = Math.floor(rand(180, 360));
    const fastest = game.ai.reduce((best, ai) => ai.speed > best.speed ? ai : best, game.ai[0]);
    if (fastest) fastest.score += leaderBoost;
    addRandomSpecial(SPECIAL_TILES.gold.value);
    addCenterFloat(`Arena Surge: rivals +${leaderBoost}`);
    showToast('Arena Surge: rivals sped up. Use Gold tiles and combos to overtake them.');
  }

  function addRandomSpecial(value) {
    const cells = [];
    for (let y = 0; y < game.boardSize; y++) {
      for (let x = 0; x < game.boardSize; x++) if (game.board[y][x] > 0) cells.push({ x, y });
    }
    if (!cells.length) return false;
    const spot = choice(cells);
    game.board[spot.y][spot.x] = value;
    const special = SPECIAL_BY_VALUE[value];
    if (special) addFloat(`${special.icon} ${special.title}`, spot.x, spot.y, '#ffd166');
    return true;
  }

  function updateAi(dt) {
    game.lastAiTick += dt;
    if (game.lastAiTick < .7) return;
    game.lastAiTick = 0;
    game.ai.forEach(ai => { ai.score += Math.floor(rand(ai.speed * 0.4, ai.speed * 1.1)); });
    renderArenaRank();
  }

  function makeAiScores() {
    return [
      { name: 'AvaBot', score: 0, speed: 22 },
      { name: 'LunaAI', score: 0, speed: 17 },
      { name: 'MergeMax', score: 0, speed: 26 },
      { name: 'BotanicalBoss', score: 0, speed: 20 }
    ];
  }

  function arenaRows() {
    return [{ name: 'You', score: game.score }, ...game.ai].sort((a, b) => b.score - a.score);
  }

  function arenaRankPosition() {
    if (game.mode !== 'arena') return 1;
    const rows = arenaRows();
    return Math.max(1, rows.findIndex(row => row.name === 'You') + 1);
  }

  function findMergePair() {
    for (let y = 0; y < game.boardSize; y++) {
      for (let x = 0; x < game.boardSize; x++) {
        const v = game.board[y][x];
        if (!v) continue;
        const right = x + 1 < game.boardSize ? game.board[y][x + 1] : 0;
        const down = y + 1 < game.boardSize ? game.board[y + 1][x] : 0;
        if (right === v) return { a: { x, y }, b: { x: x + 1, y } };
        if (down === v) return { a: { x, y }, b: { x, y: y + 1 } };
      }
    }
    return null;
  }

  function isAdjacent(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1; }
  function tileAtClient(clientX, clientY) {
    const rect = els.canvas.getBoundingClientRect();
    const sx = els.canvas.width / rect.width;
    const sy = els.canvas.height / rect.height;
    const px = (clientX - rect.left) * sx;
    const py = (clientY - rect.top) * sy;
    const br = game.boardRect;
    if (px < br.x || py < br.y || px > br.x + br.size || py > br.y + br.size) return null;
    return { x: clamp(Math.floor((px - br.x) / br.cell), 0, game.boardSize - 1), y: clamp(Math.floor((py - br.y) / br.cell), 0, game.boardSize - 1) };
  }

  function pointerDown(event) {
    if (!game.active || game.paused) return;
    event.preventDefault();
    const tile = tileAtClient(event.clientX, event.clientY);
    if (!tile) return;
    game.pointerStart = tile;
  }

  function pointerUp(event) {
    if (!game.active || game.paused) return;
    event.preventDefault();
    const tile = tileAtClient(event.clientX, event.clientY);
    if (!tile) return;
    const start = game.pointerStart;
    game.pointerStart = null;
    if (start && (start.x !== tile.x || start.y !== tile.y)) {
      tryMerge(start, tile);
      return;
    }
    if (game.selected && (game.selected.x !== tile.x || game.selected.y !== tile.y)) {
      tryMerge(game.selected, tile);
      return;
    }
    game.selected = tile;
  }

  function tryMerge(a, b) {
    if (!a || !b) return;
    const av = game.board[a.y]?.[a.x];
    const bv = game.board[b.y]?.[b.x];
    if (!av || !bv || !isAdjacent(a, b)) {
      game.combo = 0;
      game.selected = b;
      failSound();
      addFloat('Match adjacent twins', b.x, b.y, '#ffd166');
      return;
    }
    if (av < 0 || bv < 0) {
      handleSpecialMerge(a, b);
      game.selected = null;
      return;
    }
    if (av === bv) {
      mergeTiles(a, b, false);
      game.selected = null;
      return;
    }
    game.combo = 0;
    game.selected = b;
    failSound();
    addFloat('Match adjacent twins', b.x, b.y, '#ffd166');
  }

  function handleSpecialMerge(a, b) {
    const av = game.board[a.y][a.x];
    const bv = game.board[b.y][b.x];
    const specialPos = av < 0 ? a : b;
    const otherPos = av < 0 ? b : a;
    const special = game.board[specialPos.y][specialPos.x];
    const other = game.board[otherPos.y][otherPos.x];
    discoverSpecial(special);
    if (special === SPECIAL_TILES.rainbow.value && other > 0) {
      game.board[specialPos.y][specialPos.x] = other;
      mergeTiles(specialPos, otherPos, false);
      addCenterFloat('🌈 Rainbow Merge');
      return;
    }
    if (special === SPECIAL_TILES.gold.value && other > 0) {
      game.rushMeter = Math.min(100, game.rushMeter + 30);
      game.score += other * 120;
      game.coinsEarned += Math.max(8, other * 3);
      game.board[specialPos.y][specialPos.x] = other;
      mergeTiles(specialPos, otherPos, false);
      addCenterFloat('🟡 Gold Bonus Merge');
      return;
    }
    if (special === SPECIAL_TILES.bomb.value) {
      clearArea(specialPos.x, specialPos.y);
      addCenterFloat('💣 Bomb cleared space');
      return;
    }
    if (special === SPECIAL_TILES.chest.value) {
      openChest(specialPos.x, specialPos.y);
      return;
    }
    failSound();
  }

  function clearArea(cx, cy) {
    let cleared = 0;
    for (let y = Math.max(0, cy - 1); y <= Math.min(game.boardSize - 1, cy + 1); y++) {
      for (let x = Math.max(0, cx - 1); x <= Math.min(game.boardSize - 1, cx + 1); x++) {
        if (game.board[y][x]) { game.board[y][x] = randomTile(2); cleared += 1; }
      }
    }
    game.score += cleared * 35;
    game.coinsEarned += Math.max(2, Math.floor(cleared / 2));
    game.combo += 1;
    makeParticles(cx, cy, 7);
    addRush(18);
    ensurePlayableBoard();
    updateHud();
    successSound();
  }

  function openChest(x, y) {
    const p = profile();
    game.board[y][x] = randomTile(2);
    p.collection = { ...defaultProfile().collection, ...(p.collection || {}) };
    p.collection.chestsOpened = (p.collection.chestsOpened || 0) + 1;
    const roll = Math.random();
    if (roll < .32) {
      const coins = 18 + Math.floor(Math.random() * 18);
      game.coinsEarned += coins;
      addFloat(`🎁 +${coins} Coins`, x, y, '#ffd166');
    } else if (roll < .66 && isLoggedIn()) {
      const id = choice(Object.keys(ITEMS));
      p.ownedItems[id] = (p.ownedItems[id] || 0) + 1;
      addFloat(`🎁 ${ITEMS[id].title}`, x, y, '#7ef2b0');
      renderItemBar();
    } else {
      game.timeLeft = Math.min(game.maxTime + 35, game.timeLeft + 8);
      addFloat('🎁 +8s', x, y, '#4de5ff');
    }
    game.score += 120;
    addRush(16);
    makeParticles(x, y, 7);
    ensurePlayableBoard();
    showToast('Chest opened! Surprise reward added.');
    coinSound();
  }

  function mergeTiles(a, b, automated) {
    const level = game.board[a.y][a.x];
    if (!level || game.board[b.y][b.x] !== level) return false;
    const next = clamp(level + 1, 1, TILE_ICONS.length - 1);
    game.board[b.y][b.x] = next;
    game.board[a.y][a.x] = 0;
    collapseAndSpawn(a.x, a.y);
    game.combo += 1;
    game.merges += 1;
    if (game.mode === 'level') game.movesLeft = Math.max(0, game.movesLeft - 1);
    const cfg = MODE_CONFIG[game.mode];
    const itemBoost = game.activeItems.doubleYield > 0 ? 2 : 1;
    const rushBoost = game.rushTime > 0 ? 1.75 : 1;
    const comboBoost = 1 + Math.min(game.combo - 1, 7) * 0.2;
    const gain = Math.floor((next * next * 12) * cfg.multiplier * comboBoost * itemBoost * rushBoost);
    const coinGain = Math.max(1, Math.floor(gain / (game.rushTime > 0 ? 28 : 38)));
    game.score += gain;
    game.coinsEarned += coinGain;
    makeParticles(b.x, b.y, next);
    addFloat(`${game.rushTime > 0 ? '🔥 ' : ''}+${gain}`, b.x, b.y, game.activeItems.doubleYield > 0 || game.rushTime > 0 ? '#ffd166' : '#7ef2b0');
    mergeSound(next);
    discoverTile(next);
    addXp(5 + next);
    updateMission(next, automated);
    addRush(12 + next * 3 + Math.min(game.combo, 6));
    if (game.combo > 1) addFloat(`Combo ×${game.combo}`, b.x, b.y, '#4de5ff');
    if (next >= 6) {
      makeParticles(b.x, b.y, next + 4);
      addCenterFloat(`Rare ${TILE_NAMES[next]} unlocked!`);
    }
    if (game.combo === 3) addCenterFloat('Combo ×3! Keep chaining');
    if (game.combo > 0 && game.combo % 5 === 0) {
      const timeBonus = game.mode === 'arena' ? 3 : game.mode === 'level' ? 0 : 5;
      if (timeBonus) game.timeLeft = Math.min(game.maxTime + 35, game.timeLeft + timeBonus);
      game.score += 100 * game.combo;
      addCenterFloat(timeBonus ? `Combo ×${game.combo}! +${timeBonus}s` : `Combo ×${game.combo}! Score Boost`);
    }
    applyModeMergeBonus(next, b.x, b.y);
    if (game.merges - game.lastSurprise >= 6 && Math.random() < (automated ? .28 : .52)) {
      game.lastSurprise = game.merges;
      triggerSurpriseDrop(b.x, b.y);
    }
    maybeLuckyChain(automated);
    if (game.mode === 'level' && next >= game.targetLevel && !game.stageClear) {
      game.targetReached = true;
      game.stageClear = true;
      setTimeout(() => endGame(true, `${TILE_NAMES[next]} target reached`), 350);
    }
    ensurePlayableBoard();
    return true;
  }


  function applyModeMergeBonus(nextLevel, x, y) {
    if (game.mode === 'beginner') {
      if (game.merges === 1) addCenterFloat('Nice! Match identical neighbors.');
      if (game.combo === 2) game.timeLeft = Math.min(game.maxTime + 30, game.timeLeft + 3);
      return;
    }
    if (game.mode === 'classic') {
      if (game.combo > 0 && game.combo % 4 === 0) {
        game.classicBonusCount += 1;
        addRandomSpecial(SPECIAL_TILES.gold.value);
        game.score += 180 + game.classicBonusCount * 40;
        addCenterFloat('Classic Streak: Gold Tile spawned');
      }
      return;
    }
    if (game.mode === 'arena') {
      if (game.combo >= 3) {
        game.score += 140;
        addRush(8);
        addFloat('Rival Overtake +140', x, y, '#ffd166');
      }
      return;
    }
    if (game.mode === 'level') {
      if (nextLevel >= game.targetLevel - 1 && game.movesLeft > 0) {
        addFloat(`${game.movesLeft} moves left`, x, y, '#4de5ff');
      }
    }
  }

  function collapseAndSpawn(emptyX, emptyY) {
    for (let y = emptyY; y > 0; y--) game.board[y][emptyX] = game.board[y - 1][emptyX];
    game.board[0][emptyX] = randomSpawnTile(MODE_CONFIG[game.mode].spawnMax + Math.floor(game.score / 1600));
  }

  function shuffleBoard(silent = false) {
    const values = game.board.flat().filter(Boolean);
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    let index = 0;
    for (let y = 0; y < game.boardSize; y++) {
      for (let x = 0; x < game.boardSize; x++) game.board[y][x] = values[index++] || randomTile(2);
    }
    ensurePlayableBoard();
    if (!silent) {
      showToast('Board shuffled.');
      successSound();
    }
  }

  function useItem(itemId) {
    if (!game.active || game.paused) return;
    if (!isLoggedIn()) return showToast('Items are saved assets. Log in to use them.');
    const p = profile();
    const item = ITEMS[itemId];
    if (!item) return;
    if ((p.ownedItems[itemId] || 0) <= 0) return showToast(`${item.title}: EMPTY`);
    if (game.cooldowns[itemId] > 0) return showToast(`${item.title}: Cooldown ${Math.ceil(game.cooldowns[itemId])}s`);
    p.ownedItems[itemId] -= 1;
    game.cooldowns[itemId] = item.cooldown;
    if (itemId === 'shuffle') {
      shuffleBoard(false);
      addCenterFloat('Shuffle activated');
    } else {
      game.activeItems[itemId] = item.duration;
      addCenterFloat(`${item.title} ON`);
      if (itemId === 'autoMerge') game.autoMergeTick = .2;
    }
    persist();
    renderItemBar();
    itemSound();
  }

  function renderItemBar(force = true) {
    if (!force && renderItemBar.last && performance.now() - renderItemBar.last < 400) return;
    renderItemBar.last = performance.now();
    const p = profile();
    els.itemBar.innerHTML = Object.entries(ITEMS).map(([id, item], index) => {
      const active = game.activeItems[id] > 0;
      const cooldown = game.cooldowns[id] > 0;
      const count = p.ownedItems?.[id] || 0;
      const status = active ? `ON ${Math.ceil(game.activeItems[id])}s` : cooldown ? `Cooldown ${Math.ceil(game.cooldowns[id])}s` : count > 0 ? `READY ×${count}` : 'EMPTY';
      const cls = active ? 'on' : cooldown ? 'cooldown' : '';
      return `<button class="ui-btn item-button press-only ${cls}" data-use-item="${id}" type="button">${index + 1}. ${item.icon} ${item.title}<small>${status}</small></button>`;
    }).join('');
    els.itemBar.querySelectorAll('[data-use-item]').forEach(btn => btn.addEventListener('click', () => useItem(btn.dataset.useItem)));
  }

  function updateHud() {
    const p = profile();
    const cfg = MODE_CONFIG[game.mode];
    els.hudScore.textContent = fmt(game.score);
    els.hudBest.textContent = fmt(Math.max(p.bestScore || 0, game.score));
    els.hudCoins.textContent = fmt((p.coins || 0) + game.coinsEarned);
    els.hudMode.textContent = cfg.label;
    let goalText = game.rushTime > 0 ? `Gold Rush ${Math.ceil(game.rushTime)}s` : missionText();
    if (game.mode === 'arena') goalText = `${goalText} · Rank #${arenaRankPosition()}`;
    els.hudGoal.textContent = goalText;
    els.hudTime.textContent = game.mode === 'level'
      ? `${Math.ceil(game.timeLeft)}s · ${game.movesLeft} moves`
      : game.activeItems.freeze > 0 ? `❄ ${Math.ceil(game.timeLeft)}s` : `${Math.ceil(game.timeLeft)}s`;
    if (els.hudCombo) els.hudCombo.textContent = `×${game.combo}`;
    if (els.hudRush) els.hudRush.textContent = game.rushTime > 0 ? `🔥 ${Math.ceil(game.rushTime)}s` : `${Math.floor(game.rushMeter)}%`;
    const ratio = missionProgressRatio();
    if (els.stageTitle) els.stageTitle.textContent = stageLabel();
    if (els.stageObjective) els.stageObjective.textContent = missionText();
    if (els.stageDeadline) els.stageDeadline.textContent = game.activeItems.freeze > 0 ? `Frozen · ${Math.ceil(game.timeLeft)}s left` : `Ends in ${Math.ceil(game.timeLeft)}s`;
    if (els.stageProgressFill) els.stageProgressFill.style.width = `${Math.round(ratio * 100)}%`;
    if (els.stageProgressText) els.stageProgressText.textContent = `${Math.round(ratio * 100)}% clear`;
  }

  function renderArenaRank() {
    if (game.mode !== 'arena') return;
    const rows = arenaRows();
    els.arenaRank.innerHTML = rows.map((row, i) => `<div class="${row.name === 'You' ? 'you-rank' : ''}"><span>#${i + 1} ${escapeHtml(row.name)}</span><strong>${fmt(row.score)}</strong></div>`).join('');
  }

  function endGame(won, reason) {
    if (!game.active) return;
    game.active = false;
    stopGameLoop(false);
    const p = profile();
    const cfg = MODE_CONFIG[game.mode];
    let awardedCoins = game.coinsEarned;
    let stars = '-';
    if (isLoggedIn() && cfg.save) {
      p.coins += awardedCoins;
      if (game.score > (p.bestScore || 0)) p.bestScore = game.score;
      if (game.mode === 'level' && won) {
        const timeRatio = game.timeLeft / game.maxTime;
        const moveRatio = game.maxMoves ? game.movesLeft / game.maxMoves : 0;
        const performance = (timeRatio + moveRatio) / 2;
        stars = performance > .45 ? '★★★' : performance > .22 ? '★★' : '★';
        p.levelProgress.stars[game.level] = Math.max(p.levelProgress.stars[game.level] || 0, stars.length);
        p.levelProgress.unlocked = Math.max(p.levelProgress.unlocked || 1, game.level + 1);
        p.coins += LEVEL_MAP[clamp(game.level, 1, LEVEL_MAP.length) - 1]?.reward || 40;
        addXp(35 + game.level * 2);
      }
      if (game.mode === 'arena' && won) {
        const arenaBonus = 35 + Math.max(0, 5 - arenaRankPosition()) * 5;
        p.coins += arenaBonus;
        awardedCoins += arenaBonus;
        stars = 'Champion';
        addXp(45);
      }
      addLeaderboardEntry(p, cfg.label);
    } else {
      save.guest.bestScore = Math.max(save.guest.bestScore || 0, game.score);
      addLeaderboardEntry(save.guest, cfg.label);
      awardedCoins = 0;
    }
    persist();
    updateUi();
    renderLeaderboard();
    els.finalScore.textContent = fmt(game.score);
    els.finalBest.textContent = fmt(Math.max(p.bestScore || 0, game.score));
    els.finalCoins.textContent = fmt(awardedCoins);
    els.finalStars.textContent = stars;
    els.gameOverTitle.textContent = won ? 'Stage Clear!' : 'Stage Failed';
    els.gameOverSubtitle.textContent = reason || (won ? 'Challenge Complete' : 'Run Complete');
    renderRescueHint(won);
    els.modal.classList.remove('hidden');
    stopMusic();
    gameOverSound();
  }

  function renderRescueHint(won) {
    if (!els.rescueHint) return;
    const p = profile();
    const closeGap = game.mode === 'level' ? Math.max(0, game.targetLevel - (game.mission?.progress || 0)) : Math.max(0, 6 - game.combo);
    game.lastFailureGap = closeGap;
    const hasToken = (p.ownedItems?.continueToken || 0) > 0;
    els.rescueHint.classList.toggle('hidden', won || !isLoggedIn());
    if (won || !isLoggedIn()) return;
    const tool = game.mode === 'level' || closeGap <= 2 ? 'Auto Merge / Continue Token' : 'Freeze Time / Shuffle';
    els.rescueHint.querySelector('.rescue-text').textContent = closeGap <= 2
      ? `You were only ${Math.max(1, closeGap)} merge${closeGap === 1 ? '' : 's'} away. ${tool} can save this run.`
      : `The board slowed down near the end. ${tool} helps turn close failures into wins.`;
    els.rescueUse.disabled = !hasToken || game.rescueUsed;
    els.rescueUse.textContent = hasToken ? 'Use Continue Token' : 'No Continue Token';
  }

  function useRescueContinue() {
    if (!isLoggedIn() || game.rescueUsed) return;
    const p = profile();
    if ((p.ownedItems?.continueToken || 0) <= 0) return showToast('No Continue Token. Try the Rescue Pack.');
    p.ownedItems.continueToken -= 1;
    if (MODE_CONFIG[game.mode]?.save) p.coins = Math.max(0, (p.coins || 0) - game.coinsEarned);
    game.active = true;
    game.paused = false;
    game.rescueUsed = true;
    game.timeLeft = Math.max(25, Math.min(game.maxTime, 35));
    game.activeItems.freeze = 4;
    els.modal.classList.add('hidden');
    persist();
    renderItemBar();
    beginLoop();
    startMusic();
    addCenterFloat('Continue! +35s');
    showToast('Continue Token used. Finish the goal now!');
  }

  function addLeaderboardEntry(p, modeLabel) {
    p.leaderboard = p.leaderboard || [];
    p.leaderboard.push({ score: game.score, mode: modeLabel, date: todayKey() });
    p.leaderboard.sort((a, b) => b.score - a.score);
    p.leaderboard = p.leaderboard.slice(0, 20);
  }

  function resizeCanvas() {
    const rect = els.canvasWrap.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    els.canvas.width = Math.max(320, Math.floor(rect.width * ratio));
    els.canvas.height = Math.max(320, Math.floor(rect.height * ratio));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    computeBoardRect();
    drawGame();
  }

  function computeBoardRect() {
    const w = els.canvas.width;
    const h = els.canvas.height;
    const size = Math.min(w, h) * 0.82;
    game.boardRect.size = size;
    game.boardRect.cell = size / game.boardSize;
    game.boardRect.x = (w - size) / 2;
    game.boardRect.y = (h - size) / 2 + (h > w ? -10 : 6);
  }

  function drawGame() {
    const w = els.canvas.width;
    const h = els.canvas.height;
    ctx.clearRect(0, 0, w, h);
    drawCanvasBackground(w, h);
    if (!game.board.length) return;
    drawBoard();
    drawParticles();
    drawFloats();
    if (game.paused) drawOverlay('Paused');
  }

  function drawCanvasBackground(w, h) {
    const grd = ctx.createLinearGradient(0, 0, w, h);
    if (game.rushTime > 0) {
      grd.addColorStop(0, '#35220a'); grd.addColorStop(.52, '#18385a'); grd.addColorStop(1, '#59410f');
    } else {
      grd.addColorStop(0, '#0a2039'); grd.addColorStop(1, '#11334a');
    }
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.globalAlpha = save.settings.reducedMotion ? .05 : .12;
    for (let i = 0; i < 80; i++) {
      const x = (i * 97 + performance.now() * 0.006) % w;
      const y = (i * 53) % h;
      ctx.fillStyle = i % 4 ? '#ffffff' : '#4de5ff';
      ctx.beginPath(); ctx.arc(x, y, (i % 3) + 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawBoard() {
    const br = game.boardRect;
    const gap = Math.max(5, br.cell * .06);
    roundedRect(br.x - gap, br.y - gap, br.size + gap * 2, br.size + gap * 2, 26, 'rgba(2,8,18,.42)', 'rgba(255,255,255,.16)');
    const colors = TILE_COLORS[profile().equippedSkin || 'default'] || TILE_COLORS.default;
    for (let y = 0; y < game.boardSize; y++) {
      for (let x = 0; x < game.boardSize; x++) {
        const level = game.board[y][x];
        const cx = br.x + x * br.cell + gap;
        const cy = br.y + y * br.cell + gap;
        const s = br.cell - gap * 2;
        const selected = game.selected && game.selected.x === x && game.selected.y === y;
        const hint = save.settings.accessibility && isHintTile(x, y);
        roundedRect(cx, cy, s, s, 20, level ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.025)', selected ? '#4de5ff' : hint ? '#ffd166' : 'rgba(255,255,255,.18)', selected || hint ? 4 : 1.3);
        if (level < 0) drawSpecialTile(cx, cy, s, level);
        else if (level) drawTile(cx, cy, s, level, colors[level] || '#fff');
      }
    }
  }

  function drawSpecialTile(x, y, size, value) {
    const special = SPECIAL_BY_VALUE[value];
    if (!special) return;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const t = performance.now() / 1000;
    const pulse = save.settings.reducedMotion ? 0 : Math.sin(t * 4) * 3;
    const gradients = {
      [-1]: ['#fdf2f8', '#67e8f9'],
      [-2]: ['#111827', '#fb7185'],
      [-3]: ['#fef3c7', '#f59e0b'],
      [-4]: ['#ede9fe', '#8b5cf6']
    };
    const g = ctx.createRadialGradient(cx - size * .15, cy - size * .2, size * .05, cx, cy, size * .48);
    const pair = gradients[value] || ['#ffffff', '#4de5ff'];
    g.addColorStop(0, pair[0]); g.addColorStop(1, pair[1]);
    ctx.save();
    ctx.shadowColor = pair[1];
    ctx.shadowBlur = save.settings.highContrast ? 28 : 18;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, size * .36 + pulse, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = `${Math.floor(size * .36)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(special.icon, cx, cy + size * .01);
    ctx.font = `900 ${Math.floor(size * .105)}px sans-serif`;
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 4;
    ctx.strokeText(special.title.replace(' Tile', ''), cx, y + size - size * .1);
    ctx.fillText(special.title.replace(' Tile', ''), cx, y + size - size * .1);
    ctx.restore();
  }

  function drawTile(x, y, size, level, color) {
    const t = performance.now() / 1000;
    const pulse = save.settings.reducedMotion ? 0 : Math.sin(t * 3 + level) * 1.5;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const radius = size * .36 + pulse;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = save.settings.highContrast ? 22 : 12;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.beginPath(); ctx.arc(cx - radius * .24, cy - radius * .2, radius * .18, 0, Math.PI * 2); ctx.fill();
    ctx.font = `${Math.floor(size * .34)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#06111f';
    ctx.fillText(TILE_ICONS[level], cx, cy + size * .01);
    if (save.settings.highContrast) {
      ctx.font = `900 ${Math.floor(size * .13)}px sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(TILE_NAMES[level], cx, y + size - size * .12);
      ctx.fillText(TILE_NAMES[level], cx, y + size - size * .12);
    }
    ctx.restore();
  }

  function isHintTile(x, y) {
    const pair = findMergePair();
    if (!pair) return false;
    return (pair.a.x === x && pair.a.y === y) || (pair.b.x === x && pair.b.y === y);
  }

  function roundedRect(x, y, w, h, r, fill, stroke, lineWidth = 1) {
    ctx.save();
    ctx.beginPath();
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y); ctx.lineTo(x + w - rr, y); ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr); ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr); ctx.quadraticCurveTo(x, y, x + rr, y); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
    ctx.restore();
  }

  function makeParticles(tx, ty, level) {
    if (save.settings.reducedMotion) return;
    const br = game.boardRect;
    const cx = br.x + tx * br.cell + br.cell / 2;
    const cy = br.y + ty * br.cell + br.cell / 2;
    const count = save.settings.accessibility ? 8 : 15;
    const colors = TILE_COLORS[profile().equippedSkin || 'default'] || TILE_COLORS.default;
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const speed = rand(60, 190);
      game.particles.push({ x: cx, y: cy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, size: rand(2, 6), grow: rand(-1, 2), life: rand(.35, .75), color: colors[Math.max(1, level)] || '#fff' });
    }
  }

  function drawParticles() {
    ctx.save();
    game.particles.forEach(p => {
      ctx.globalAlpha = clamp(p.life * 1.8, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }

  function addFloat(text, tx, ty, color) {
    const br = game.boardRect;
    game.floats.push({ text, x: br.x + tx * br.cell + br.cell / 2, y: br.y + ty * br.cell + br.cell * .25, color, life: .85 });
  }

  function addCenterFloat(text) {
    game.floats.push({ text, x: els.canvas.width / 2, y: els.canvas.height * .18, color: '#ffd166', life: 1.1 });
  }

  function drawFloats() {
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 ${Math.max(18, Math.floor(els.canvas.width * .025))}px sans-serif`;
    game.floats.forEach(f => {
      ctx.globalAlpha = clamp(f.life, 0, 1);
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    });
    ctx.restore();
  }

  function drawOverlay(text) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.52)'; ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 ${Math.floor(els.canvas.width * .06)}px sans-serif`;
    ctx.fillStyle = '#fff'; ctx.fillText(text, els.canvas.width / 2, els.canvas.height / 2);
    ctx.restore();
  }

  function handleKeys(event) {
    if (event.target && ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
    if (event.key.toLowerCase() === 'p') game.paused ? resumeGame() : pauseGame();
    if (event.key.toLowerCase() === 'r' && activeScreen === 'game') restartGame();
    const itemKeys = ['1', '2', '3', '4'];
    if (itemKeys.includes(event.key) && activeScreen === 'game') useItem(Object.keys(ITEMS)[Number(event.key) - 1]);
  }

  function unlockAudio() {
    if (audioReady) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioReady = true;
      if (save.settings.music) startMusic();
    } catch (err) {
      audioReady = false;
    }
  }

  function beep(freq = 420, duration = .07, type = 'sine', gain = .035) {
    if (!save.settings.sfx || !audioReady || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq; g.gain.value = gain;
    osc.connect(g); g.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.start(now); osc.stop(now + duration);
  }
  function clickSound() { beep(280, .04, 'triangle', .018); }
  function successSound() { beep(660, .07, 'sine', .035); setTimeout(() => beep(880, .09, 'sine', .03), 80); }
  function startSound() { beep(420, .08, 'triangle', .028); setTimeout(() => beep(620, .1, 'triangle', .026), 90); }
  function mergeSound(level) { beep(300 + level * 55, .08, 'sine', .032); }
  function failSound() { beep(120, .12, 'sawtooth', .025); }
  function coinSound() { beep(900, .08, 'square', .024); }
  function itemSound() { beep(520, .08, 'triangle', .03); setTimeout(() => beep(720, .08, 'triangle', .026), 70); }
  function gameOverSound() { beep(220, .14, 'sine', .03); setTimeout(() => beep(160, .18, 'sine', .024), 150); }

  function startMusic() {
    if (!save.settings.music || !audioReady || !audioCtx || musicTimer || activeScreen !== 'game') return;
    const pattern = game.mode === 'arena' ? [330, 392, 494, 587] : game.mode === 'beginner' ? [262, 330, 392, 330] : [294, 370, 440, 554];
    let i = 0;
    musicTimer = setInterval(() => {
      if (!save.settings.music || activeScreen !== 'game' || game.paused) return;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.value = pattern[i++ % pattern.length];
      g.gain.value = .012;
      osc.connect(g); g.connect(audioCtx.destination);
      const now = audioCtx.currentTime;
      g.gain.setValueAtTime(.012, now);
      g.gain.exponentialRampToValueAtTime(.0001, now + .35);
      osc.start(now); osc.stop(now + .36);
    }, game.mode === 'arena' ? 290 : 520);
  }
  function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; }


  function hideThirdPartyFloatingPanels() {
    const badText = /(aiprice|在线客服|客服|通知|论坛|更新日志|合作建议|customer service|live support|live chat)/i;
    const badAttr = /(aiprice|live-chat|customer-service|support-widget|chat-widget)/i;
    const safeTags = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE']);
    document.querySelectorAll('body > *').forEach(el => {
      if (!el || el.id === 'app' || safeTags.has(el.tagName)) return;
      const idClass = `${el.id || ''} ${el.className || ''}`;
      const text = (el.innerText || el.textContent || '').slice(0, 1200);
      let rect = { left: 9999, top: 9999, width: 0, height: 0 };
      let style = null;
      try { rect = el.getBoundingClientRect(); style = window.getComputedStyle(el); } catch (err) { return; }
      const z = Number.parseInt(style.zIndex || '0', 10) || 0;
      const isFixed = style.position === 'fixed' || style.position === 'sticky';
      const isLeftFloating = rect.left <= 110 && rect.top >= window.innerHeight * 0.28 && rect.width <= 520 && rect.height <= 620;
      const isSuspiciousWidget = isFixed && isLeftFloating && z >= 10;
      if (badText.test(text) || badAttr.test(idClass) || isSuspiciousWidget) {
        el.dataset.mmrHiddenThirdParty = 'true';
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
      }
    });
  }

  function watchThirdPartyFloatingPanels() {
    hideThirdPartyFloatingPanels();
    let timer = null;
    const runSoon = () => {
      clearTimeout(timer);
      timer = setTimeout(hideThirdPartyFloatingPanels, 80);
    };
    try {
      const observer = new MutationObserver(runSoon);
      observer.observe(document.documentElement, { childList: true, subtree: true });
    } catch (err) {}
    setInterval(hideThirdPartyFloatingPanels, 2000);
  }

  function init() {
    watchThirdPartyFloatingPanels();
    initButtons();
    bindCopyInteractions();
    handlePaymentReturn();
    updateUi();
    renderShop();
    renderLeaderboard();
    renderCollection();
    renderLevelMap();
    resizeCanvas();
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.addEventListener('touchmove', (e) => { if (activeScreen === 'game') e.preventDefault(); }, { passive: false });
  }

  window.__MMR_TEST__ = { loadSave, defaultSave, makeBoard, randomTile, randomSpawnTile, MODE_CONFIG, ITEMS, SKINS, BUNDLES, LEVEL_MAP, SPECIAL_TILES, getGame: () => game, findMergePair, profile: () => profile(), useItem, buyItem, buyBundle, mergeTiles, tryMerge, handleSpecialMerge, startGame, restartGame, pauseGame, resumeGame, endGame, renderShop, renderCollection, renderLevelMap, updateGame, applyBundle };
  init();
})();
