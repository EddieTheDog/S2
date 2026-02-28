// ============================================================
// NETFLIX TV CLONE - APP.JS
// Full keyboard/gamepad navigable TV UI
// ============================================================

"use strict";

// ======================== STATE ========================
const state = {
  currentScreen: 'profiles',   // profiles | pin | browse | search | mylist | player | detail
  selectedProfileIdx: 0,
  currentProfile: null,
  heroIdx: 0,
  heroTimer: null,
  myList: [...MY_LIST],
  focusZone: 'profiles',       // profiles | manage | nav | hero | rows | detail | search | player
  profileFocusIdx: 0,
  navFocusIdx: 0,
  heroFocusIdx: 0,             // 0=play, 1=more
  rowFocusRow: 0,
  rowFocusCol: 0,
  rowOffset: 0,                // vertical scroll of rows
  detailFocusIdx: 0,           // 0=play, 1=list, 2=like, 3=close
  pinInput: '',
  pinFocusIdx: 0,
  searchFocusZone: 'keyboard', // keyboard | results
  searchKeyFocusIdx: 0,
  searchResultFocusIdx: 0,
  playerFocusIdx: 1,           // 0=back, 1=rewind, 2=play, 3=fwd
  isPlaying: false,
  currentItem: null,
};

// ======================== DOM REFS ========================
const screens = {
  profiles: document.getElementById('profiles-screen'),
  pin: document.getElementById('pin-screen'),
  browse: document.getElementById('browse-screen'),
  search: document.getElementById('search-screen'),
  mylist: document.getElementById('mylist-screen'),
  player: document.getElementById('player-screen'),
  detail: document.getElementById('detail-overlay'),
};

// ======================== INIT ========================
function init() {
  renderProfiles();
  renderRows();
  renderMyList();
  renderKeyboard();
  renderSearchResults(CONTENT_ROWS[0].items);
  setupHeroRotation();
  showScreen('profiles');
  setProfileFocus(0);
}

// ======================== SCREEN MANAGEMENT ========================
function showScreen(name) {
  // Hide all
  Object.values(screens).forEach(s => {
    s.classList.remove('active');
    s.style.display = '';
  });

  state.currentScreen = name;
  screens[name].classList.add('active');
  screens[name].classList.add('screen-transition');

  // Show browse behind overlays
  if (['search', 'mylist', 'detail'].includes(name)) {
    screens.browse.classList.add('active');
    screens[name].style.display = ['search','mylist'].includes(name) ? 'block' : 'flex';
  }
}

// ======================== PROFILES ========================
function renderProfiles() {
  const grid = document.getElementById('profiles-grid');
  grid.innerHTML = '';

  PROFILES.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'profile-item';
    div.dataset.idx = i;
    div.innerHTML = `
      <div class="profile-avatar-wrap">
        <img src="${p.avatar}" alt="${p.name}" onerror="this.src='https://picsum.photos/seed/profile${i}/200/200'">
        ${p.locked ? `<div style="position:absolute;bottom:6px;right:6px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg></div>` : ''}
      </div>
      <div class="profile-name">${p.name}</div>
    `;
    div.addEventListener('click', () => selectProfile(i));
    grid.appendChild(div);
  });

  // Add profile button
  const addDiv = document.createElement('div');
  addDiv.className = 'profile-item profile-add';
  addDiv.dataset.idx = PROFILES.length;
  addDiv.innerHTML = `
    <div class="profile-avatar-wrap">
      <svg class="plus-icon" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
    </div>
    <div class="profile-name">Add Profile</div>
  `;
  grid.appendChild(addDiv);
}

function setProfileFocus(idx) {
  state.profileFocusIdx = idx;
  const items = document.querySelectorAll('#profiles-grid .profile-item');
  const manageBtn = document.getElementById('manage-btn');
  items.forEach((el, i) => el.classList.toggle('focused', i === idx && state.focusZone === 'profiles'));
  manageBtn.classList.toggle('focused', state.focusZone === 'manage');
}

function selectProfile(idx) {
  if (idx >= PROFILES.length) return; // Add Profile - do nothing
  const profile = PROFILES[idx];
  state.selectedProfileIdx = idx;
  state.currentProfile = profile;

  // Set nav avatar
  document.getElementById('nav-profile-avatar').src = profile.avatar;
  document.getElementById('nav-profile-avatar').onerror = function() {
    this.src = `https://picsum.photos/seed/profile${idx}/200/200`;
  };

  if (profile.locked) {
    // Show PIN screen
    state.pinInput = '';
    updatePinDots();
    state.pinFocusIdx = 0;
    setPinFocus(0);
    screens.pin.style.display = 'flex';
    screens.pin.classList.add('active');
    state.currentScreen = 'pin';
  } else {
    enterBrowse();
  }
}

// ======================== PIN ========================
function renderPinNumpad() {
  const pad = document.getElementById('pin-numpad');
  pad.innerHTML = '';
  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','OK'];
  keys.forEach((k, i) => {
    const btn = document.createElement('button');
    btn.className = 'pin-key';
    if (k === '⌫') btn.className += ' backspace';
    btn.textContent = k;
    btn.dataset.key = k;
    btn.dataset.idx = i;
    btn.addEventListener('click', () => handlePinKey(k));
    pad.appendChild(btn);
  });
}

function setPinFocus(idx) {
  state.pinFocusIdx = idx;
  document.querySelectorAll('.pin-key').forEach((el, i) => {
    el.classList.toggle('focused', i === idx);
  });
}

function handlePinKey(key) {
  if (key === '⌫') {
    state.pinInput = state.pinInput.slice(0, -1);
  } else if (key === 'OK') {
    const profile = PROFILES[state.selectedProfileIdx];
    if (state.pinInput === profile.pin) {
      screens.pin.classList.remove('active');
      screens.pin.style.display = 'none';
      enterBrowse();
    } else {
      // Shake animation
      const dots = document.getElementById('pin-dots');
      dots.style.animation = 'none';
      dots.offsetHeight;
      dots.style.animation = 'shake 0.4s';
      state.pinInput = '';
      updatePinDots();
    }
  } else if (state.pinInput.length < 4) {
    state.pinInput += key;
    updatePinDots();
    if (state.pinInput.length === 4) {
      // Auto-verify after a tick
      setTimeout(() => handlePinKey('OK'), 300);
    }
  }
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    document.getElementById(`dot-${i}`).classList.toggle('filled', i < state.pinInput.length);
  }
}

// ======================== BROWSE ========================
function enterBrowse() {
  showScreen('browse');
  state.focusZone = 'hero';
  state.heroFocusIdx = 0;
  updateHero();
  setHeroFocus(0);
  state.rowFocusRow = 0;
  state.rowFocusCol = 0;
}

function setupHeroRotation() {
  clearInterval(state.heroTimer);
  state.heroTimer = setInterval(() => {
    if (state.focusZone === 'rows') return;
    state.heroIdx = (state.heroIdx + 1) % HERO_CONTENT.length;
    updateHero();
  }, 8000);
}

function updateHero() {
  const h = HERO_CONTENT[state.heroIdx];
  document.getElementById('hero-bg').src = h.bg;
  document.getElementById('hero-title').textContent = h.title;
  document.getElementById('hero-match').textContent = h.match;
  document.getElementById('hero-year').textContent = h.year;
  document.getElementById('hero-rating').textContent = h.rating;
  document.getElementById('hero-seasons').textContent = h.seasons || '';
  document.getElementById('hero-desc').textContent = h.description;
}

function setHeroFocus(idx) {
  state.heroFocusIdx = idx;
  const play = document.getElementById('hero-play-btn');
  const info = document.getElementById('hero-info-btn');
  play.classList.toggle('focused', idx === 0);
  info.classList.toggle('focused', idx === 1);
}

// ======================== ROWS ========================
function renderRows() {
  const inner = document.getElementById('rows-inner');
  inner.innerHTML = '';

  CONTENT_ROWS.forEach((row, rowIdx) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    rowEl.dataset.row = rowIdx;

    const title = document.createElement('div');
    title.className = 'row-title';
    title.textContent = row.title;

    const items = document.createElement('div');
    items.className = 'row-items';

    row.items.forEach((item, colIdx) => {
      const card = createCard(item, rowIdx, colIdx);
      items.appendChild(card);
    });

    rowEl.appendChild(title);
    rowEl.appendChild(items);
    inner.appendChild(rowEl);
  });
}

function createCard(item, rowIdx, colIdx) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.row = rowIdx;
  card.dataset.col = colIdx;
  card.dataset.id = item.id;
  card.innerHTML = `
    <img src="${item.thumb}" alt="${item.title}" onerror="this.src='https://picsum.photos/seed/${item.id}/400/225'">
    <div class="card-label">${item.title}</div>
  `;
  card.addEventListener('click', () => openDetail(item.id));
  return card;
}

function setRowFocus(row, col) {
  state.rowFocusRow = Math.max(0, Math.min(row, CONTENT_ROWS.length - 1));
  state.rowFocusCol = Math.max(0, Math.min(col, CONTENT_ROWS[state.rowFocusRow].items.length - 1));

  document.querySelectorAll('.card').forEach(el => el.classList.remove('focused'));

  const rowEl = document.querySelector(`.row[data-row="${state.rowFocusRow}"]`);
  if (!rowEl) return;
  const card = rowEl.querySelector(`.card[data-col="${state.rowFocusCol}"]`);
  if (card) {
    card.classList.add('focused');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // Vertical scroll rows container
  scrollRowsToFocused();
}

function scrollRowsToFocused() {
  const CARD_H = 160; // approx row height
  const offset = state.rowFocusRow * CARD_H;
  document.getElementById('rows-inner').style.transform = `translateY(-${Math.max(0, offset - 20)}px)`;
}

// ======================== DETAIL OVERLAY ========================
function openDetail(id) {
  const item = ALL_CONTENT[id] || HERO_CONTENT.find(h => h.id === id);
  if (!item) return;
  state.currentItem = item;

  document.getElementById('detail-img').src = item.thumb || item.bg;
  document.getElementById('detail-title').textContent = item.title;
  document.getElementById('detail-match').textContent = item.match || '';
  document.getElementById('detail-year').textContent = item.year || '';
  document.getElementById('detail-seasons').textContent = item.seasons || (item.type === 'movie' ? 'Film' : '');
  document.getElementById('detail-desc').textContent = item.desc || item.description || '';
  document.getElementById('detail-cast').innerHTML = item.cast ? `<span style="color:var(--netflix-light-gray)">Cast: </span>${item.cast.join(', ')}` : '';
  document.getElementById('detail-genres').innerHTML = item.genres ? `<span style="color:var(--netflix-light-gray)">Genres: </span>${item.genres.join(', ')}` : '';

  // Check if in My List
  const inList = state.myList.includes(id);
  const listBtn = document.getElementById('detail-list-btn');
  listBtn.innerHTML = inList
    ? `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`
    : `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`;

  screens.detail.classList.add('active');
  screens.detail.style.display = 'flex';
  state.currentScreen = 'detail';
  state.detailFocusIdx = 0;
  setDetailFocus(0);
}

function closeDetail() {
  screens.detail.classList.remove('active');
  screens.detail.style.display = 'none';
  state.currentScreen = 'browse';
  state.focusZone = 'rows';
  setRowFocus(state.rowFocusRow, state.rowFocusCol);
}

function setDetailFocus(idx) {
  state.detailFocusIdx = idx;
  const btns = [
    document.getElementById('detail-play-btn'),
    document.getElementById('detail-list-btn'),
    document.getElementById('detail-like-btn'),
    document.getElementById('detail-close-btn'),
  ];
  btns.forEach((b, i) => b && b.classList.toggle('focused', i === idx));
}

function toggleMyList(id) {
  const idx = state.myList.indexOf(id);
  if (idx === -1) {
    state.myList.push(id);
  } else {
    state.myList.splice(idx, 1);
  }
  renderMyList();
  // Update button
  const listBtn = document.getElementById('detail-list-btn');
  const inList = state.myList.includes(id);
  listBtn.innerHTML = inList
    ? `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`
    : `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`;
}

// ======================== MY LIST ========================
function renderMyList() {
  const grid = document.getElementById('mylist-grid');
  grid.innerHTML = '';

  state.myList.forEach((id, i) => {
    const item = ALL_CONTENT[id];
    if (!item) return;
    const card = document.createElement('div');
    card.className = 'mylist-card';
    card.dataset.idx = i;
    card.innerHTML = `<img src="${item.thumb || item.bg}" alt="${item.title}" onerror="this.src='https://picsum.photos/seed/${id}/400/225'">`;
    card.addEventListener('click', () => openDetail(id));
    grid.appendChild(card);
  });
}

// ======================== SEARCH ========================
function renderKeyboard() {
  const grid = document.getElementById('keyboard-grid');
  grid.innerHTML = '';

  KEYBOARD_KEYS.forEach((k, i) => {
    const btn = document.createElement('button');
    btn.dataset.idx = i;
    btn.dataset.key = k;

    if (k === '{SPACE}') {
      btn.className = 'key-btn wide';
      btn.textContent = 'Space';
    } else if (k === '{DEL}') {
      btn.className = 'key-btn';
      btn.textContent = '⌫';
    } else if (k === '{CLEAR}') {
      btn.className = 'key-btn';
      btn.textContent = 'Clear';
    } else {
      btn.className = 'key-btn';
      btn.textContent = k.toUpperCase();
    }

    btn.addEventListener('click', () => handleSearchKey(k));
    grid.appendChild(btn);
  });
}

function setKeyboardFocus(idx) {
  state.searchKeyFocusIdx = idx;
  document.querySelectorAll('.key-btn').forEach((el, i) => {
    el.classList.toggle('focused', i === idx);
  });
}

function handleSearchKey(key) {
  const input = document.getElementById('search-input');
  if (key === '{DEL}') {
    input.value = input.value.slice(0, -1);
  } else if (key === '{CLEAR}') {
    input.value = '';
  } else if (key === '{SPACE}') {
    input.value += ' ';
  } else {
    input.value += key;
  }
  filterSearch(input.value);
}

function filterSearch(query) {
  const q = query.toLowerCase().trim();
  const heading = document.getElementById('search-results-heading');
  if (!q) {
    heading.textContent = 'Trending';
    renderSearchResults(CONTENT_ROWS[0].items);
    return;
  }
  heading.textContent = 'Top Results';
  const all = Object.values(ALL_CONTENT);
  const results = all.filter(item =>
    item.title.toLowerCase().includes(q) ||
    (item.genres && item.genres.some(g => g.toLowerCase().includes(q))) ||
    (item.cast && item.cast.some(c => c.toLowerCase().includes(q)))
  );
  renderSearchResults(results.slice(0, 12));
}

function renderSearchResults(items) {
  const grid = document.getElementById('search-results-grid');
  grid.innerHTML = '';
  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.dataset.idx = i;
    card.innerHTML = `
      <img src="${item.thumb || item.bg}" alt="${item.title}" onerror="this.src='https://picsum.photos/seed/${item.id || i}/400/225'">
      <div class="card-title">${item.title}</div>
    `;
    card.addEventListener('click', () => {
      screens.search.classList.remove('active');
      screens.search.style.display = 'none';
      state.currentScreen = 'browse';
      openDetail(item.id);
    });
    grid.appendChild(card);
  });
}

// ======================== PLAYER ========================
function openPlayer(item) {
  state.currentItem = item;
  document.getElementById('player-still').src = item.bg || item.thumb;
  document.getElementById('player-show-title').textContent = item.title;
  document.getElementById('player-ep-title').textContent = item.seasons ? 'Season 1, Episode 1' : '';
  showScreen('player');
  state.isPlaying = true;
  updatePlayIcon();
  state.playerFocusIdx = 2;
  setPlayerFocus(2);
}

function updatePlayIcon() {
  const icon = document.getElementById('play-icon');
  icon.innerHTML = state.isPlaying
    ? `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`
    : `<path d="M8 5v14l11-7z"/>`;
}

function setPlayerFocus(idx) {
  state.playerFocusIdx = idx;
  const btns = [
    document.getElementById('player-back-btn'),
    document.getElementById('player-rewind-btn'),
    document.getElementById('player-play-btn'),
    document.getElementById('player-fwd-btn'),
  ];
  btns.forEach((b, i) => b && b.classList.toggle('focused', i === idx));
}

// ======================== NAV FOCUS ========================
const NAV_ITEMS = ['home', 'tvshows', 'movies', 'new', 'mylist', 'search', 'profile'];

function setNavFocus(idx) {
  state.navFocusIdx = Math.max(0, Math.min(idx, NAV_ITEMS.length - 1));
  document.querySelectorAll('[data-nav-item]').forEach(el => {
    el.classList.toggle('focused', el.dataset.navItem === NAV_ITEMS[state.navFocusIdx]);
  });
  document.getElementById('nav-search-btn').classList.toggle('focused', NAV_ITEMS[state.navFocusIdx] === 'search');
  document.getElementById('nav-profile-img').classList.toggle('focused', NAV_ITEMS[state.navFocusIdx] === 'profile');
}

function activateNavItem() {
  const item = NAV_ITEMS[state.navFocusIdx];
  document.querySelectorAll('[data-nav-item]').forEach(el => el.classList.remove('active'));
  const active = document.querySelector(`[data-nav-item="${item}"]`);
  if (active) active.classList.add('active');

  if (item === 'search') {
    showScreen('search');
    state.focusZone = 'search';
    state.searchFocusZone = 'keyboard';
    document.getElementById('search-input').value = '';
    renderSearchResults(CONTENT_ROWS[0].items);
    setKeyboardFocus(0);
  } else if (item === 'mylist') {
    showScreen('mylist');
    state.focusZone = 'mylist';
  } else if (item === 'home') {
    showScreen('browse');
    state.focusZone = 'hero';
    setHeroFocus(0);
  } else {
    showScreen('browse');
    state.focusZone = 'hero';
    setHeroFocus(0);
  }
}

// ======================== KEYBOARD INPUT ========================
document.addEventListener('keydown', (e) => {
  const key = e.key;

  // Prevent default scrolling
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter',' ','Backspace'].includes(key)) {
    e.preventDefault();
  }

  switch(state.currentScreen) {
    case 'profiles': handleProfilesKeys(key); break;
    case 'pin': handlePinKeys(key); break;
    case 'browse': handleBrowseKeys(key); break;
    case 'detail': handleDetailKeys(key); break;
    case 'search': handleSearchKeys(key); break;
    case 'mylist': handleMyListKeys(key); break;
    case 'player': handlePlayerKeys(key); break;
  }
});

function handleProfilesKeys(key) {
  const totalProfiles = PROFILES.length + 1; // +1 for Add Profile

  if (state.focusZone === 'profiles') {
    if (key === 'ArrowRight') {
      const next = state.profileFocusIdx + 1;
      if (next >= totalProfiles) return;
      setProfileFocus(next);
    } else if (key === 'ArrowLeft') {
      const prev = state.profileFocusIdx - 1;
      if (prev < 0) return;
      setProfileFocus(prev);
    } else if (key === 'ArrowDown') {
      state.focusZone = 'manage';
      setProfileFocus(state.profileFocusIdx);
    } else if (key === 'Enter' || key === ' ') {
      selectProfile(state.profileFocusIdx);
    }
  } else if (state.focusZone === 'manage') {
    if (key === 'ArrowUp') {
      state.focusZone = 'profiles';
      setProfileFocus(state.profileFocusIdx);
    } else if (key === 'Enter') {
      // Manage profiles - show alert
      alert('Manage Profiles would open here.');
    }
  }
}

function handlePinKeys(key) {
  const keys = document.querySelectorAll('.pin-key');
  const count = keys.length; // 12

  if (key === 'ArrowRight') {
    const next = state.pinFocusIdx + 1;
    if (next % 3 !== 0) setPinFocus(next);
  } else if (key === 'ArrowLeft') {
    if (state.pinFocusIdx % 3 !== 0) setPinFocus(state.pinFocusIdx - 1);
  } else if (key === 'ArrowDown') {
    if (state.pinFocusIdx + 3 < count) setPinFocus(state.pinFocusIdx + 3);
  } else if (key === 'ArrowUp') {
    if (state.pinFocusIdx - 3 >= 0) setPinFocus(state.pinFocusIdx - 3);
  } else if (key === 'Enter' || key === ' ') {
    handlePinKey(keys[state.pinFocusIdx].dataset.key);
  } else if (key === 'Escape' || key === 'Backspace') {
    screens.pin.classList.remove('active');
    screens.pin.style.display = 'none';
    state.currentScreen = 'profiles';
    state.focusZone = 'profiles';
    setProfileFocus(state.selectedProfileIdx);
  } else if (/^[0-9]$/.test(key)) {
    handlePinKey(key);
  }
}

function handleBrowseKeys(key) {
  if (state.focusZone === 'nav') {
    if (key === 'ArrowLeft') setNavFocus(state.navFocusIdx - 1);
    else if (key === 'ArrowRight') setNavFocus(state.navFocusIdx + 1);
    else if (key === 'ArrowDown') {
      state.focusZone = 'hero';
      setHeroFocus(0);
      setNavFocus(-1); // clear nav focus
    }
    else if (key === 'Enter') activateNavItem();
    else if (key === 'Escape') { /* nothing */ }
  } else if (state.focusZone === 'hero') {
    if (key === 'ArrowUp') {
      state.focusZone = 'nav';
      setNavFocus(0);
      setHeroFocus(-1);
    } else if (key === 'ArrowDown') {
      state.focusZone = 'rows';
      setHeroFocus(-1);
      setRowFocus(0, 0);
    } else if (key === 'ArrowLeft') {
      if (state.heroFocusIdx > 0) setHeroFocus(state.heroFocusIdx - 1);
    } else if (key === 'ArrowRight') {
      if (state.heroFocusIdx < 1) setHeroFocus(state.heroFocusIdx + 1);
    } else if (key === 'Enter') {
      if (state.heroFocusIdx === 0) {
        openPlayer(HERO_CONTENT[state.heroIdx]);
      } else {
        openDetail(HERO_CONTENT[state.heroIdx].id);
      }
    }
  } else if (state.focusZone === 'rows') {
    const maxRow = CONTENT_ROWS.length - 1;
    const maxCol = CONTENT_ROWS[state.rowFocusRow].items.length - 1;

    if (key === 'ArrowUp') {
      if (state.rowFocusRow === 0) {
        state.focusZone = 'hero';
        document.querySelectorAll('.card').forEach(c => c.classList.remove('focused'));
        setHeroFocus(0);
        document.getElementById('rows-inner').style.transform = 'translateY(0)';
      } else {
        const newRow = state.rowFocusRow - 1;
        const newCol = Math.min(state.rowFocusCol, CONTENT_ROWS[newRow].items.length - 1);
        setRowFocus(newRow, newCol);
      }
    } else if (key === 'ArrowDown') {
      if (state.rowFocusRow < maxRow) {
        const newRow = state.rowFocusRow + 1;
        const newCol = Math.min(state.rowFocusCol, CONTENT_ROWS[newRow].items.length - 1);
        setRowFocus(newRow, newCol);
      }
    } else if (key === 'ArrowLeft') {
      if (state.rowFocusCol > 0) setRowFocus(state.rowFocusRow, state.rowFocusCol - 1);
    } else if (key === 'ArrowRight') {
      if (state.rowFocusCol < maxCol) setRowFocus(state.rowFocusRow, state.rowFocusCol + 1);
    } else if (key === 'Enter' || key === ' ') {
      const item = CONTENT_ROWS[state.rowFocusRow].items[state.rowFocusCol];
      openDetail(item.id);
    } else if (key === 'Escape' || key === 'Backspace') {
      state.focusZone = 'nav';
      document.querySelectorAll('.card').forEach(c => c.classList.remove('focused'));
      setNavFocus(0);
    }
  }
}

function handleDetailKeys(key) {
  const items = ['detail-play-btn','detail-list-btn','detail-like-btn','detail-close-btn'];
  if (key === 'ArrowRight') {
    setDetailFocus(Math.min(state.detailFocusIdx + 1, items.length - 1));
  } else if (key === 'ArrowLeft') {
    setDetailFocus(Math.max(state.detailFocusIdx - 1, 0));
  } else if (key === 'Enter' || key === ' ') {
    const focused = items[state.detailFocusIdx];
    if (focused === 'detail-play-btn') openPlayer(state.currentItem);
    else if (focused === 'detail-list-btn') toggleMyList(state.currentItem.id);
    else if (focused === 'detail-close-btn') closeDetail();
  } else if (key === 'Escape' || key === 'Backspace') {
    closeDetail();
  }
}

function handleSearchKeys(key) {
  if (state.searchFocusZone === 'keyboard') {
    const keys = document.querySelectorAll('.key-btn');
    const cols = 7;
    const idx = state.searchKeyFocusIdx;

    if (key === 'ArrowRight') {
      setKeyboardFocus(Math.min(idx + 1, keys.length - 1));
    } else if (key === 'ArrowLeft') {
      if (idx > 0) setKeyboardFocus(idx - 1);
    } else if (key === 'ArrowDown') {
      const next = idx + cols;
      if (next < keys.length) setKeyboardFocus(next);
      else {
        state.searchFocusZone = 'results';
        setKeyboardFocus(-1);
        setSearchResultFocus(0);
      }
    } else if (key === 'ArrowUp') {
      const prev = idx - cols;
      if (prev >= 0) setKeyboardFocus(prev);
    } else if (key === 'Enter' || key === ' ') {
      handleSearchKey(keys[idx].dataset.key);
    } else if (key === 'Escape' || key === 'Backspace') {
      screens.search.classList.remove('active');
      screens.search.style.display = 'none';
      state.currentScreen = 'browse';
      state.focusZone = 'nav';
      setNavFocus(0);
    } else if (key.length === 1) {
      // Direct typing
      document.getElementById('search-input').value += key;
      filterSearch(document.getElementById('search-input').value);
    }
  } else if (state.searchFocusZone === 'results') {
    const cards = document.querySelectorAll('.search-result-card');
    const cols = 4;
    const idx = state.searchResultFocusIdx;

    if (key === 'ArrowRight') setSearchResultFocus(Math.min(idx + 1, cards.length - 1));
    else if (key === 'ArrowLeft') setSearchResultFocus(Math.max(idx - 1, 0));
    else if (key === 'ArrowDown') { if (idx + cols < cards.length) setSearchResultFocus(idx + cols); }
    else if (key === 'ArrowUp') {
      if (idx - cols >= 0) setSearchResultFocus(idx - cols);
      else {
        state.searchFocusZone = 'keyboard';
        setSearchResultFocus(-1);
        setKeyboardFocus(0);
      }
    } else if (key === 'Enter') {
      cards[idx] && cards[idx].click();
    } else if (key === 'Escape' || key === 'Backspace') {
      screens.search.classList.remove('active');
      screens.search.style.display = 'none';
      state.currentScreen = 'browse';
      state.focusZone = 'nav';
      setNavFocus(0);
    }
  }
}

function setSearchResultFocus(idx) {
  state.searchResultFocusIdx = idx;
  document.querySelectorAll('.search-result-card').forEach((el, i) => {
    el.classList.toggle('focused', i === idx);
  });
}

function handleMyListKeys(key) {
  const cards = document.querySelectorAll('.mylist-card');
  const cols = 6;
  const idx = state.searchResultFocusIdx;

  if (key === 'ArrowRight') setMyListFocus(Math.min(idx + 1, cards.length - 1));
  else if (key === 'ArrowLeft') setMyListFocus(Math.max(idx - 1, 0));
  else if (key === 'ArrowDown') { if (idx + cols < cards.length) setMyListFocus(idx + cols); }
  else if (key === 'ArrowUp') { if (idx - cols >= 0) setMyListFocus(idx - cols); }
  else if (key === 'Enter') { cards[idx] && cards[idx].click(); }
  else if (key === 'Escape' || key === 'Backspace') {
    screens.mylist.classList.remove('active');
    screens.mylist.style.display = 'none';
    state.currentScreen = 'browse';
    state.focusZone = 'hero';
    setHeroFocus(0);
  }
}

function setMyListFocus(idx) {
  state.searchResultFocusIdx = idx;
  document.querySelectorAll('.mylist-card').forEach((el, i) => {
    el.classList.toggle('focused', i === idx);
  });
}

function handlePlayerKeys(key) {
  if (key === 'ArrowLeft') setPlayerFocus(Math.max(state.playerFocusIdx - 1, 0));
  else if (key === 'ArrowRight') setPlayerFocus(Math.min(state.playerFocusIdx + 1, 3));
  else if (key === 'Enter' || key === ' ') {
    if (state.playerFocusIdx === 0) {
      // Back
      showScreen('browse');
      state.focusZone = 'rows';
      setRowFocus(state.rowFocusRow, state.rowFocusCol);
    } else if (state.playerFocusIdx === 2) {
      state.isPlaying = !state.isPlaying;
      updatePlayIcon();
    }
  } else if (key === 'Escape' || key === 'Backspace') {
    showScreen('browse');
    state.focusZone = 'rows';
    setRowFocus(state.rowFocusRow, state.rowFocusCol);
  }
}

// ======================== GAMEPAD ========================
let gamepadInterval = null;
let gamepadLastKeys = {};

function pollGamepad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const pad of pads) {
    if (!pad) continue;

    const now = Date.now();
    const press = (btn, key) => {
      if (pad.buttons[btn] && pad.buttons[btn].pressed) {
        if (!gamepadLastKeys[btn] || now - gamepadLastKeys[btn] > 200) {
          gamepadLastKeys[btn] = now;
          document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        }
      } else {
        gamepadLastKeys[btn] = 0;
      }
    };

    // Standard gamepad mapping
    press(12, 'ArrowUp');
    press(13, 'ArrowDown');
    press(14, 'ArrowLeft');
    press(15, 'ArrowRight');
    press(0, 'Enter');   // A / Cross
    press(1, 'Escape');  // B / Circle
    press(2, 'Backspace'); // X / Square

    // D-pad via axes
    const ax = pad.axes[0], ay = pad.axes[1];
    if (Math.abs(ax) > 0.5 || Math.abs(ay) > 0.5) {
      const axKey = ax > 0.5 ? 'ArrowRight' : ax < -0.5 ? 'ArrowLeft' : null;
      const ayKey = ay > 0.5 ? 'ArrowDown' : ay < -0.5 ? 'ArrowUp' : null;
      const axisKey = 'axis';
      if (axKey && (!gamepadLastKeys[axisKey+'x'] || now - gamepadLastKeys[axisKey+'x'] > 150)) {
        gamepadLastKeys[axisKey+'x'] = now;
        document.dispatchEvent(new KeyboardEvent('keydown', { key: axKey, bubbles: true }));
      }
      if (ayKey && (!gamepadLastKeys[axisKey+'y'] || now - gamepadLastKeys[axisKey+'y'] > 150)) {
        gamepadLastKeys[axisKey+'y'] = now;
        document.dispatchEvent(new KeyboardEvent('keydown', { key: ayKey, bubbles: true }));
      }
    }
  }
}

window.addEventListener('gamepadconnected', () => {
  gamepadInterval = setInterval(pollGamepad, 16);
});

window.addEventListener('gamepaddisconnected', () => {
  if (gamepadInterval) clearInterval(gamepadInterval);
});

// Also start polling immediately in case gamepad is already connected
gamepadInterval = setInterval(pollGamepad, 16);

// ======================== BUTTON CLICK HANDLERS ========================
document.getElementById('hero-play-btn').addEventListener('click', () => openPlayer(HERO_CONTENT[state.heroIdx]));
document.getElementById('hero-info-btn').addEventListener('click', () => openDetail(HERO_CONTENT[state.heroIdx].id));
document.getElementById('detail-close-btn').addEventListener('click', closeDetail);
document.getElementById('detail-play-btn').addEventListener('click', () => openPlayer(state.currentItem));
document.getElementById('detail-list-btn').addEventListener('click', () => toggleMyList(state.currentItem.id));
document.getElementById('player-back-btn').addEventListener('click', () => {
  showScreen('browse');
  state.focusZone = 'rows';
  setRowFocus(state.rowFocusRow, state.rowFocusCol);
});
document.getElementById('player-play-btn').addEventListener('click', () => {
  state.isPlaying = !state.isPlaying;
  updatePlayIcon();
});
document.getElementById('nav-search-btn').addEventListener('click', () => {
  state.focusZone = 'search';
  showScreen('search');
  document.getElementById('search-input').value = '';
  renderSearchResults(CONTENT_ROWS[0].items);
  setKeyboardFocus(0);
});
document.getElementById('nav-mylist-link').addEventListener('click', (e) => {
  e.preventDefault();
  showScreen('mylist');
  state.focusZone = 'mylist';
  state.searchResultFocusIdx = 0;
  setMyListFocus(0);
});

// Render pin numpad
renderPinNumpad();

// ADD CSS for shake animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-10px); }
    40% { transform: translateX(10px); }
    60% { transform: translateX(-10px); }
    80% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// ======================== START ========================
init();
