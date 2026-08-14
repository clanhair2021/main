/* =======================================================
   04-sudoku-render.js : UI描画・セル更新・演出・ハイライト
   ======================================================= */

function updateTimerDisplay() {
    const m = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const s = (elapsedTime % 60).toString().padStart(2, '0');
    document.getElementById('status-timer').innerText = `⏱ ${m}:${s}`;
}

function updateStatusBar() {
    document.getElementById('status-difficulty').innerText = currentDifficultyText;
    document.getElementById('status-miss').innerText = `MISS: ${missCount}`;
    document.getElementById('status-combo').innerText = `${comboCount} COMBO`;
    document.getElementById('status-score').innerText = `SCORE: ${gameScore}`;
}
function getCellValue(cell) {
    const valSpan = cell.querySelector('.cell-value');
    return valSpan ? valSpan.innerText : "";
}

function setCellValue(cell, val) {
    let valSpan = cell.querySelector('.cell-value');
    
    if (val === "" || val === null || val === undefined) {
        // --- 消去する場合 ---
        if (valSpan && valSpan.innerText !== "") {
            valSpan.classList.remove('pop-in');
            valSpan.classList.add('pop-out');
            
            // アニメーション(0.5秒)が終わる直前に要素を削除
            setTimeout(() => {
                if (valSpan && valSpan.parentNode) {
                    valSpan.remove();
                }
            }, 450);
        } else if (valSpan) {
            valSpan.remove();
        }
    } else {
        // --- 入力する場合 ---
        if (!valSpan) {
            valSpan = document.createElement('span');
            valSpan.classList.add('cell-value');
            cell.appendChild(valSpan);
        }
        
        // 値が変わった時だけアニメーションを実行
        if (valSpan.innerText !== String(val)) {
            valSpan.innerText = val;
            
            valSpan.classList.remove('pop-in', 'pop-out');
            void valSpan.offsetWidth; // アニメーション再再生（リフロー）
            valSpan.classList.add('pop-in');
            
            // アニメーション終了後にクラスを削除して状態をクリア
            setTimeout(() => {
                if (valSpan) {
                    valSpan.classList.remove('pop-in');
                }
            }, 600);
        } else {
            valSpan.innerText = val;
        }
    }
}

function renderMemo(cell) {
    if (getCellValue(cell) !== "") {
        const existing = cell.querySelector('.memo-grid');
        if(existing) existing.remove();
        return;
    }

    let memoGrid = cell.querySelector('.memo-grid');
    if (!memoGrid) {
        memoGrid = document.createElement('div');
        memoGrid.classList.add('memo-grid');
        cell.appendChild(memoGrid);
    }

    memoGrid.innerHTML = "";
    for (let n = 1; n <= 9; n++) {
        const digitDiv = document.createElement('div');
        digitDiv.classList.add('memo-digit');
        digitDiv.id = `memo-${cell.dataset.index}-${n}`;
        digitDiv.innerText = cell.memoValues[n] ? n : "";
        memoGrid.appendChild(digitDiv);
    }
}

function highlightSameNumbers(targetNum) {
   // 選択中セルの位置を取得（距離計算用）
   const selRow = selectedCell ? parseInt(selectedCell.dataset.row) : null;
   const selCol = selectedCell ? parseInt(selectedCell.dataset.col) : null;
 
   cellsArray.forEach(cell => {
        cell.classList.remove('same-number');
        const memoContainer = cell.querySelector('.memo-grid');
        if(memoContainer) {
            memoContainer.querySelectorAll('.memo-digit').forEach(d => d.classList.remove('highlight-memo'));
        }
    });

    if (!targetNum || targetNum === "") return;

    cellsArray.forEach(cell => {
        if (getCellValue(cell) === targetNum) {
            // 🟢 選択マスからの距離に応じた遅延時間（--delay）を設定
            if (selRow !== null && selCol !== null) {
                const r = parseInt(cell.dataset.row);
                const c = parseInt(cell.dataset.col);
                const dist = Math.abs(r - selRow) + Math.abs(c - selCol);
                
                // 1マス離れるごとに 35ms 遅らせる（波紋の速度調整はここ）
                cell.style.setProperty('--delay', `${dist * 35}ms`);
            }
            cell.classList.add('same-number');
        }
        if (cell.memoValues && cell.memoValues[targetNum] === true && getCellValue(cell) === "") {
            const memoDigitEl = cell.querySelector(`#memo-${cell.dataset.index}-${targetNum}`);
            if(memoDigitEl) {
                memoDigitEl.classList.add('highlight-memo');
            }
        }
    });
}

function getHighlightTargetAndTrigger(cell) {
    const selectedRow = parseInt(cell.dataset.row);
    const selectedCol = parseInt(cell.dataset.col);
    
    // 先に全てのハイライトを削除
    cellsArray.forEach(c => {
        c.classList.remove('highlight-cross');
    });
    // 強制的にリフローを発生させる（ここに追加）
    void cell.offsetWidth;
        
    cellsArray.forEach(c => {
        const r = parseInt(c.dataset.row);
        const col = parseInt(c.dataset.col);

        // 選択セルからの距離（マンハッタン距離）を計算
        const dist = Math.abs(r - selectedRow) + Math.abs(col - selectedCol);
        
        // 1マス離れるごとに25ミリ秒遅延させる（お好みで 20ms〜35ms に調整可能）
        c.style.setProperty('--delay', `${dist * 25}ms`);

        if (r === selectedRow || col === selectedCol) {
            c.classList.add('highlight-cross');
        }
    });

    if (getCellValue(cell) !== "") {
        highlightSameNumbers(getCellValue(cell));
    } else {
        let firstMemo = "";
        for(let n=1; n<=9; n++) {
            if(cell.memoValues[n]) { firstMemo = String(n); break; }
        }
        highlightSameNumbers(firstMemo);
    }
}

function clearAllHighlights() {
    if (selectedCell) selectedCell.classList.remove('selected');
    selectedCell = null;
    cellsArray.forEach(cell => {
        cell.classList.remove('same-number', 'highlight-cross');
        cell.style.removeProperty('--delay'); // 👈 この1行を追加！
        const mg = cell.querySelector('.memo-grid');
        if(mg) mg.querySelectorAll('.memo-digit').forEach(d => d.classList.remove('highlight-memo'));
    });
}

function updateCounts() {
    const counts = {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0};
    cellsArray.forEach(cell => {
        const val = getCellValue(cell);
        if (val >= 1 && val <= 9) counts[val]++;
    });

    for (let num = 1; num <= 9; num++) {
        const countEl = document.getElementById(`count-${num}`);
        const btnEl = document.getElementById(`btn-num-${num}`);
        if (counts[num] === 9) {
            if(countEl) countEl.innerText = `9/9`;
            if(btnEl) btnEl.classList.add('completed');
        } else {
            if(countEl) countEl.innerText = `${counts[num]}/9`;
            if(btnEl) btnEl.classList.remove('completed');
        }
    }
}

function launchConfetti() {
    const colors = ['#f6e05e', '#ed64a6', '#4299e1', '#48bb78', '#9f7aea', '#ffffff'];
    clearScreen.querySelectorAll('.confetti').forEach(e => e.remove());
    for(let i = 0; i < 80; i++) {
        let conf = document.createElement('div');
        conf.classList.add('confetti');
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 2.5 + 1.5;
        const delay = Math.random() * 1.5;
        conf.style.animation = `fall ${duration}s linear ${delay}s forwards`;
        clearScreen.appendChild(conf);
    }
}
