/* =======================================================
   06-sudoku-app.js : アプリの初期化・ハブ連携・起動設定
   ======================================================= */

// 難易度選択画面からハブ（index.html）に戻る処理
function backToHubFromDifficulty() {
  window.location.href = 'index.html#select';
}

// ハブ（index.html）で設定されたテーマを読み込んで適用する処理
function applyHubTheme() {
  const SETTINGS_KEY = "clanhair.settings";
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw) {
    try {
      const s = JSON.parse(raw);
      if (s.theme) {
        // body要素に data-theme="light" などの属性を付与
        document.body.dataset.theme = s.theme;
      }
    } catch (e) {
      console.error("テーマ適用エラー:", e);
    }
  }
}

// 盤面初期化
for (let i = 0; i < 81; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.dataset.row = Math.floor(i / 9);
    cell.dataset.col = i % 9;
    cell.memoValues = Array(10).fill(false);

    cell.addEventListener('click', () => {
        if (isPaused) return;
        if (selectedCell) selectedCell.classList.remove('selected');
        selectedCell = cell;
        cell.classList.add('selected');
        getHighlightTargetAndTrigger(cell);
    });

    grid.appendChild(cell);
    cellsArray.push(cell);
}

// 初期化実行
updateStatusBar();
setupFlickToDelete(); // 👈 イベントリスナーの起動
// 画面読み込み時に実行
applyHubTheme();
