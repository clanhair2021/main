const GAMES = [
  // ナンプレのアイコンを画像ファイル（sudoku-icon.png）に指定
  { id: "sudoku",  name: "高速ナンプレ",           icon: "sudoku-icon.png", isImage: true,  tag: "PUZZLE", url: "sudoku.html", locked: false },
  { id: "maze",    name: "イライラ迷路",           icon: "🌀",              isImage: false, tag: "ACTION", url: "maze.html",   locked: true },
  { id: "mines",   name: "マインダンジョンスイーパー", icon: "💣",          isImage: false, tag: "PUZZLE", url: "mines.html",  locked: true },
  { id: "next",    name: "今後追加予定",           icon: "❓",              isImage: false, tag: "COMING SOON", url: null, locked: true },
];

const SETTINGS_KEY = "clanhair.settings";

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + name);
  if (target) {
    target.classList.add('active');
  }
}

function toggleModal(show) {
  const modal = document.getElementById('settings-modal');
  if (show) {
    modal.classList.add('active');
  } else {
    modal.classList.remove('active');
  }
}

function handleOverlayClick(event) {
  if (event.target.id === 'settings-modal') {
    toggleModal(false);
  }
}

function renderGameGrid() {
  const grid = document.getElementById('game-grid');
  if (!grid) return;

  grid.innerHTML = "";
  GAMES.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card' + (g.locked ? ' locked' : '');

    // 画像か絵文字かを判定して出力
    const iconHtml = g.isImage 
      ? `<img src="${g.icon}" alt="${g.name}" class="game-card-img">`
      : `<div class="icon">${g.icon}</div>`;

        card.innerHTML = `
      ${iconHtml}
      <div class="card-text-group">
        <span class="name">${g.name}</span>
        <span class="tag">${g.tag}</span>
      </div>
    `;


    if (!g.locked) {
      card.onclick = () => { location.href = g.url; };
    }
    grid.appendChild(card);
  });
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
}

function saveSettings() {
  const theme = document.getElementById('setting-theme').value;
  applyTheme(theme);

  const settings = {
    theme: theme,
  };

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  const s = raw ? JSON.parse(raw) : {};

  try {
    document.getElementById('setting-theme').value = s.theme ?? 'light';
    applyTheme(s.theme ?? 'light');
  } catch (e) {
    console.error("設定読み込みエラー:", e);
  }
}

function resetAllData() {
  if (confirm("すべてのセーブデータを削除します。よろしいですか？")) {
    localStorage.clear();
    loadSettings();
    toggleModal(false);
    alert("削除しました。");
  }
}
// 🟢【ここに追加します！】
// 難易度選択画面からハブ（ゲーム選択画面）に戻る処理
function backToHubFromDifficulty() {
  // 1. もしモーダル形式で開いている場合は閉じる
  const diffModal = document.getElementById('difficulty-modal');
  if (diffModal) {
    diffModal.style.display = 'none';
  }

  // 2. セーブデータ読み込みモーダルなどが開いていれば閉じる（念のため）
  const loadModal = document.getElementById('load-modal');
  if (loadModal) {
    loadModal.style.display = 'none';
  }

  // 3. ゲーム選択画面（ハブ）へ切り替え
  showScreen('select');
}
// 初期化処理の実行
renderGameGrid();
loadSettings();

