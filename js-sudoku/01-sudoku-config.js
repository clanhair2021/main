/* =======================================================
   01-sudoku-config.js : DOM要素の取得・定数・状態変数
   ======================================================= */

// --- DOM要素 ---
const grid = document.getElementById('sudoku-grid');
const errorText = document.getElementById('error-text');
const numPadArea = document.getElementById('num-pad-area');
const loadModal = document.getElementById('load-modal');
const modalSaveList = document.getElementById('modal-save-list');
const settingsModal = document.getElementById('settings-modal');
const gameActionsArea = document.getElementById('game-actions-area');
const pauseScreen = document.getElementById('pause-screen');
const clearScreen = document.getElementById('clear-screen');

// --- ゲーム状態変数 ---
let selectedCell = null;
let isPlayMode = false;
let isPaused = false;
const cellsArray = [];

let solvedBoard = Array(81).fill(0); 
let judgeMode = 'normal';             
let currentDifficulty = 'normal';   
let currentDifficultyText = "中級";

let gameScore = 0;                  
let comboCount = 0;                 
let maxComboCount = 0;              
let missCount = 0;                  
let isFirstTimePerfect = true;      

let timerInterval = null;           
let elapsedTime = 0;                

// フリック操作時のクリック誤爆を防ぐためのフラグ
let justFlicked = false;

// 難易度設定パラメータ
const difficultyConfig = {
    easy: { base: 10, targetTime: 300, rateInstant: 2, rateClassic: 4 },
    normal: { base: 20, targetTime: 600, rateInstant: 3, rateClassic: 5 },
    hard: { base: 30, targetTime: 900, rateInstant: 5, rateClassic: 7 },
    expert: { base: 50, targetTime: 1500, rateInstant: 8, rateClassic: 12 }
};

// 盤面チェック用のインデックス配列定義
const rowIndices = Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => r * 9 + c));
const colIndices = Array.from({ length: 9 }, (_, c) => Array.from({ length: 9 }, (_, r) => r * 9 + c));
const boxIndices = Array.from({ length: 9 }, (_, b) => {
    const boxRow = Math.floor(b / 3) * 3;
    const boxCol = (b % 3) * 3;
    const arr = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) arr.push((boxRow + i) * 9 + (boxCol + j));
    return arr;
});
