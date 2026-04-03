/* ============================================================
   EnesBlast — game.js
   Sürükle-bırak (mouse + touch), krem/mavi tema
   ============================================================ */
'use strict';

const GRID_SIZE = 8;
const COLORS    = ['--c1','--c2','--c3','--c4','--c5','--c6','--c7'];
const SHAPES    = [
  [[0,0]],
  [[0,0],[0,1]], [[0,0],[1,0]],
  [[0,0],[0,1],[0,2]], [[0,0],[1,0],[2,0]],
  [[0,0],[0,1],[0,2],[0,3]], [[0,0],[1,0],[2,0],[3,0]],
  [[0,0],[0,1],[0,2],[0,3],[0,4]], [[0,0],[1,0],[2,0],[3,0],[4,0]],
  [[0,0],[0,1],[1,0],[1,1]],
  [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]],
  [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],
  [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],
  [[0,0],[1,0],[2,0],[2,1]], [[0,0],[0,1],[1,0],[2,0]],
  [[0,0],[0,1],[0,2],[1,0]], [[0,0],[1,0],[1,1],[1,2]],
  [[0,0],[0,1],[1,1],[2,1]], [[0,2],[1,2],[1,1],[1,0]],
  [[0,0],[0,1],[0,2],[1,1]], [[0,1],[1,0],[1,1],[2,1]], [[0,1],[1,0],[1,1],[1,2]],
  [[0,1],[0,2],[1,0],[1,1]], [[0,0],[0,1],[1,1],[1,2]],
  [[0,0],[0,1],[1,0]], [[0,0],[0,1],[1,1]], [[0,0],[1,0],[1,1]], [[0,1],[1,0],[1,1]],
];

// ─── State ──────────────────────────────────────────────────
let grid       = [];
let pieces     = [null, null, null];
let score      = 0;
let best       = parseInt(localStorage.getItem('eb_best') || '0');
let comboCount = 0;
let comboTimer = null;

const drag = {
  active: false, pieceIndex: -1, piece: null,
  originFracR: 0, originFracC: 0,
};

// ─── DOM ────────────────────────────────────────────────────
const boardEl      = document.getElementById('board');
const trayEl       = document.getElementById('tray');
const scoreEl      = document.getElementById('score');
const bestEl       = document.getElementById('best');
const comboEl      = document.getElementById('combo');
const ghostEl      = document.getElementById('ghost');
const overlayEl    = document.getElementById('overlay');
const finalScoreEl = document.getElementById('finalScore');

document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('overlayRestartBtn').addEventListener('click', restartGame);

// ─── Init ────────────────────────────────────────────────────
function init() {
  grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  score = 0; comboCount = 0; pieces = [null, null, null];
  overlayEl.classList.remove('show');
  scoreEl.textContent = 0;
  bestEl.textContent  = best;
  dealPieces();
  renderBoard();
}

// ─── Board ──────────────────────────────────────────────────
function renderBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const el = document.createElement('div');
      el.className = 'cell' + (grid[r][c] ? ' filled' : '');
      if (grid[r][c]) el.style.background = `var(${grid[r][c]})`;
      el.dataset.r = r; el.dataset.c = c;
      boardEl.appendChild(el);
    }
  }
}

function getCell(r, c) {
  if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return null;
  return boardEl.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

// ─── Pieces ──────────────────────────────────────────────────
function dealPieces() {
  for (let i = 0; i < 3; i++) if (!pieces[i]) pieces[i] = randomPiece();
  renderTray();
}

function randomPiece() {
  return {
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

function renderTray() {
  trayEl.innerHTML = '';
  pieces.forEach((p, i) => {
    const slot = document.createElement('div');
    slot.className = 'piece-slot' + (p ? '' : ' empty');
    if (p) {
      slot.appendChild(buildPieceGrid(p, false));
      slot.addEventListener('mousedown', e => startDrag(e, i, false));
      slot.addEventListener('touchstart', e => startDrag(e, i, true), { passive: false });
    }
    trayEl.appendChild(slot);
  });
}

function buildPieceGrid(p, large) {
  const maxR = Math.max(...p.shape.map(([r]) => r));
  const maxC = Math.max(...p.shape.map(([, c]) => c));
  const cs   = getComputedStyle(document.documentElement);
  const sz   = large ? cs.getPropertyValue('--cell').trim() : cs.getPropertyValue('--pcell').trim();
  const gap  = large ? '3px' : '2px';

  const wrap = document.createElement('div');
  wrap.className = 'piece-grid';
  wrap.style.gridTemplateColumns = `repeat(${maxC + 1}, ${sz})`;
  wrap.style.gridTemplateRows    = `repeat(${maxR + 1}, ${sz})`;
  wrap.style.gap = gap;

  const map = new Set(p.shape.map(([r, c]) => `${r},${c}`));
  for (let r = 0; r <= maxR; r++) {
    for (let c = 0; c <= maxC; c++) {
      const el = document.createElement('div');
      if (map.has(`${r},${c}`)) {
        el.className = 'piece-cell';
        el.style.background = `var(${p.color})`;
      } else {
        el.style.width = sz; el.style.height = sz;
      }
      wrap.appendChild(el);
    }
  }
  return wrap;
}

// ─── Drag Start ──────────────────────────────────────────────
function startDrag(e, idx, isTouch) {
  if (!pieces[idx]) return;
  const p = pieces[idx];
  drag.active = true; drag.pieceIndex = idx; drag.piece = p;

  trayEl.querySelectorAll('.piece-slot')[idx].classList.add('dragging');

  ghostEl.innerHTML = '';
  ghostEl.appendChild(buildPieceGrid(p, true));
  ghostEl.classList.add('active');

  drag.originFracR = (Math.max(...p.shape.map(([r]) => r)) + 1) / 2 - 0.5;
  drag.originFracC = (Math.max(...p.shape.map(([, c]) => c)) + 1) / 2 - 0.5;

  const pt = isTouch ? e.touches[0] : e;
  moveGhost(pt.clientX, pt.clientY);

  if (!isTouch) {
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onEnd);
  } else {
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend',  onEnd);
    e.preventDefault();
  }
}

// ─── Drag Move ───────────────────────────────────────────────
function onMove(e) {
  if (!drag.active) return;
  const pt = e.touches ? e.touches[0] : e;
  moveGhost(pt.clientX, pt.clientY);
  highlightDrop(pt.clientX, pt.clientY);
  if (e.cancelable) e.preventDefault();
}

// ─── Drag End ────────────────────────────────────────────────
function onEnd(e) {
  if (!drag.active) return;
  const pt = e.changedTouches ? e.changedTouches[0] : e;

  document.removeEventListener('mousemove', onMove);
  document.removeEventListener('mouseup',   onEnd);
  document.removeEventListener('touchmove', onMove);
  document.removeEventListener('touchend',  onEnd);

  ghostEl.classList.remove('active');
  const slots = trayEl.querySelectorAll('.piece-slot');
  if (slots[drag.pieceIndex]) slots[drag.pieceIndex].classList.remove('dragging');

  clearHighlights();

  const { r, c } = dropTarget(pt.clientX, pt.clientY);
  if (r !== -1 && canPlace(drag.piece.shape, r, c)) {
    placePiece(drag.piece, r, c);
    pieces[drag.pieceIndex] = null;

    const cleared = clearLines();
    if (cleared > 0) { comboCount++; showCombo(); }
    else              { comboCount = 0; hideCombo(); }

    const pts = drag.piece.shape.length * 10 + cleared * 80 + (comboCount > 1 ? comboCount * 20 : 0);
    addScore(pts);

    if (pieces.every(x => !x)) dealPieces(); else renderTray();
    renderBoard();
    if (!anyFits()) setTimeout(showGameOver, 400);
  }

  drag.active = false; drag.piece = null;
}

// ─── Ghost helpers ───────────────────────────────────────────
function cellPx()  { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell'))  || 46; }
function gapPx()   { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap'))   || 4;  }

function moveGhost(cx, cy) {
  const c = cellPx(), g = gapPx();
  ghostEl.style.left = (cx - drag.originFracC * (c + g)) + 'px';
  ghostEl.style.top  = (cy - drag.originFracR * (c + g)) + 'px';
}

function highlightDrop(cx, cy) {
  clearHighlights();
  const { r, c } = dropTarget(cx, cy);
  if (r === -1) return;
  const valid = canPlace(drag.piece.shape, r, c);
  drag.piece.shape.forEach(([dr, dc]) => {
    const el = getCell(r + dr, c + dc);
    if (el) { el.classList.add('highlight'); if (!valid) el.classList.add('invalid'); }
  });
}

function dropTarget(cx, cy) {
  // Parmak/fare altındaki elemana bak — ghost pointer-events:none olduğu için çalışır
  const el = document.elementFromPoint(cx, cy);
  if (!el) return { r: -1, c: -1 };
  const cell = el.closest('#board .cell');
  if (!cell) return { r: -1, c: -1 };

  const c = cellPx(), g = gapPx();
  const boardRect = boardEl.getBoundingClientRect();
  const pad = parseInt(getComputedStyle(boardEl).paddingLeft) || 10;

  const fracC = (cx - boardRect.left - pad) / (c + g);
  const fracR = (cy - boardRect.top  - pad) / (c + g);

  return {
    r: Math.round(fracR - drag.originFracR),
    c: Math.round(fracC - drag.originFracC),
  };
}

function clearHighlights() {
  boardEl.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight', 'invalid'));
}

// ─── Game logic ──────────────────────────────────────────────
function canPlace(shape, r, c) {
  return shape.every(([dr, dc]) => {
    const nr = r + dr, nc = c + dc;
    return nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !grid[nr][nc];
  });
}

function placePiece(p, r, c) {
  p.shape.forEach(([dr, dc]) => { grid[r + dr][c + dc] = p.color; });
}

function clearLines() {
  const rows = [], cols = [];
  for (let r = 0; r < GRID_SIZE; r++) if (grid[r].every(v => v)) rows.push(r);
  for (let c = 0; c < GRID_SIZE; c++) if (grid.every(row => row[c])) cols.push(c);
  const total = rows.length + cols.length;
  if (!total) return 0;

  const cells = new Set();
  rows.forEach(r => { for (let c = 0; c < GRID_SIZE; c++) cells.add(`${r},${c}`); });
  cols.forEach(c => { for (let r = 0; r < GRID_SIZE; r++) cells.add(`${r},${c}`); });
  cells.forEach(k => { const [r, c] = k.split(',').map(Number); getCell(r, c)?.classList.add('clearing'); });

  setTimeout(() => {
    rows.forEach(r => { for (let c = 0; c < GRID_SIZE; c++) grid[r][c] = null; });
    cols.forEach(c => { for (let r = 0; r < GRID_SIZE; r++) grid[r][c] = null; });
    renderBoard();
  }, 380);

  return total;
}

function anyFits() {
  return pieces.some(p => {
    if (!p) return false;
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++)
        if (canPlace(p.shape, r, c)) return true;
    return false;
  });
}

// ─── Score ───────────────────────────────────────────────────
function addScore(pts) {
  score += pts;
  scoreEl.textContent = score;
  if (score > best) {
    best = score;
    localStorage.setItem('eb_best', best);
    bestEl.textContent = best;
  }
  const rect = boardEl.getBoundingClientRect();
  const el   = document.createElement('div');
  el.className  = 'float-score';
  el.textContent = '+' + pts;
  el.style.left  = (rect.left + rect.width / 2 - 24) + 'px';
  el.style.top   = (rect.top + 16) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// ─── Combo ───────────────────────────────────────────────────
function showCombo() {
  comboEl.textContent = comboCount > 1 ? `🔥 COMBO ×${comboCount}` : '✨ Temizlendi!';
  comboEl.classList.add('show');
  clearTimeout(comboTimer);
  comboTimer = setTimeout(hideCombo, 1800);
}
function hideCombo() { comboEl.classList.remove('show'); }

// ─── Game over ───────────────────────────────────────────────
function showGameOver() {
  finalScoreEl.textContent = score;
  overlayEl.classList.add('show');
}

function restartGame() {
  drag.active = false;
  ghostEl.classList.remove('active');
  clearHighlights();
  init();
}

// ─── Klavye ──────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'r' || e.key === 'R') restartGame();
});

// ─── Başlat ──────────────────────────────────────────────────
init();
