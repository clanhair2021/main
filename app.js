/* =========================================================
   美容室CLanからの挑戦状 — ハブ動作スクリプト
   ========================================================= */

// ===== ゲーム一覧(新しいゲームができたらここに追加) =====
const GAMES = [
  { id:"sudoku",   name:"モダン・ナンプレ", icon:"🔢", tag:"PUZZLE",  url:"games/sudoku.html", locked:false },
  { id:"clanhair", name:"クランヘア2021",   icon:"💈", tag:"準備中",  url:"games/clanhair/index.html", locked:true },
  { id:"game3",    name:"？？？",           icon:"❔", tag:"COMING SOON", url:null, locked:true },
];

// ===== 画面切り替え =====
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
}

// ===== ゲーム一覧の描画 =====
function renderGameGrid(){
  const grid = document.getElementById('game-grid');
  grid.innerHTML = "";
  GAMES.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card pixel-box' + (g.locked ? ' locked' : '');
    card.innerHTML = `
      <div class="icon">${g.icon}</div>
      <div class="name">${g.name}</div>
      <div class="tag">${g.tag}</div>
    `;
    if(!g.locked){
      card.onclick = () => { location.href = g.url; };
    }
    grid.appendChild(card);
  });
}

// ===== 共通設定(全ゲームでlocalStorageを通じて共有) =====
const SETTINGS_KEY = "clanhair.settings";

function saveSettings(){
  const settings = {
    sound: document.getElementById('setting-sound').checked,
    volume: document.getElementById('setting-volume').value,
    theme: document.getElementById('setting-theme').value,
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadSettings(){
  const raw = localStorage.getItem(SETTINGS_KEY);
  if(!raw) return;
  try{
    const s = JSON.parse(raw);
    document.getElementById('setting-sound').checked = s.sound ?? true;
    document.getElementById('setting-volume').value = s.volume ?? 70;
    document.getElementById('setting-theme').value = s.theme ?? 'dark';
  }catch(e){ /* 破損データは無視 */ }
}

function resetAllData(){
  if(confirm("すべてのゲームのセーブデータと設定を削除します。よろしいですか？")){
    localStorage.clear();
    loadSettings();
    alert("削除しました。");
  }
}

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', () => {
  renderGameGrid();
  loadSettings();
});
