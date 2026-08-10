/* =======================================================
   05-sudoku-events.js : 数字入力・フリック入力・クリア判定・アクション
   ======================================================= */

function isValidMove(targetCell, num) {
    const row = parseInt(targetCell.dataset.row);
    const col = parseInt(targetCell.dataset.col);
    const index = parseInt(targetCell.dataset.index);
    const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    const numStr = String(num);
    const inGroup = (indices) => indices.some(i => i !== index && getCellValue(cellsArray[i]) === numStr);
    return !inGroup(rowIndices[row]) && !inGroup(colIndices[col]) && !inGroup(boxIndices[boxIdx]);
}

function calculateComboAddScore() {
    const config = difficultyConfig[currentDifficulty] || difficultyConfig['normal'];
    let base = config.base;
    
    let multiplier = 1.0;
    if (comboCount >= 15) multiplier = 2.0;
    else if (comboCount >= 10) multiplier = 1.5;
    else if (comboCount >= 5) multiplier = 1.2;
    
    let scored = Math.floor(base * multiplier);
    
    if (judgeMode === 'blind') {
        scored = Math.floor(scored * 1.3);
    }
    
    return scored;
}

function autoClearMemos(confirmedIndex, num) {
    const targetCell = cellsArray[confirmedIndex];
    const row = parseInt(targetCell.dataset.row);
    const col = parseInt(targetCell.dataset.col);
    const boxIdx = Math.floor(row / 3) * 3 + Math.floor(col / 3);

    const relatedIndices = new Set([
        ...rowIndices[row],
        ...colIndices[col],
        ...boxIndices[boxIdx]
    ]);

    relatedIndices.forEach(idx => {
        if (idx !== confirmedIndex) {
            const cell = cellsArray[idx];
            if (getCellValue(cell) === "" && cell.memoValues[num] === true) {
                cell.memoValues[num] = false;
                renderMemo(cell); 
            }
        }
    });
}

function triggerHint() {
    if (!isPlayMode || isPaused) return;
    errorText.innerText = "";

    let targetCell = selectedCell;

    if (!targetCell || targetCell.classList.contains('fixed')) {
        const candidates = cellsArray.filter(cell => {
            if (cell.classList.contains('fixed')) return false;
            const val = getCellValue(cell);
            const idx = parseInt(cell.dataset.index);
            return val === "" || parseInt(val) !== solvedBoard[idx];
        });

        if (candidates.length === 0) return; 
        targetCell = candidates[Math.floor(Math.random() * candidates.length)];
    }

    const index = parseInt(targetCell.dataset.index);
    const correctNum = solvedBoard[index];

    if (selectedCell) selectedCell.classList.remove('selected');
    selectedCell = targetCell;
    targetCell.classList.add('selected');

    targetCell.memoValues = Array(10).fill(false);
    renderMemo(targetCell);
    setCellValue(targetCell, correctNum);
    targetCell.classList.add('user-input');

    autoClearMemos(index, correctNum);

    comboCount = 0;
    errorText.innerText = "💡 ヒントでマスを1つ埋めました！";
    
    updateStatusBar();
    updateCounts();
    getHighlightTargetAndTrigger(targetCell);

    if (checkGameClear()) {
        if (judgeMode === 'blind') {
            if (checkFinalAnswer()) {
                triggerClearSuccess();
            } else {
                errorText.innerText = "⚠️ 盤面が埋まりましたが、どこかに間違いがあります！";
                isFirstTimePerfect = false;
                updateStatusBar();
            }
        } else {
            triggerClearSuccess();
        }
    }
}

function pressMainNumber(num) {
    if (isPaused) return;
    if (justFlicked) return; // フリック消去直後は通常の数字入力をキャンセルする
    if (!selectedCell || selectedCell.classList.contains('fixed')) return;
    errorText.innerText = "";

    const index = parseInt(selectedCell.dataset.index);
    const currentVal = getCellValue(selectedCell);

    if (String(num) === currentVal) {
        setCellValue(selectedCell, "");
        selectedCell.classList.remove('user-input');
        selectedCell.memoValues = Array(10).fill(false);
        renderMemo(selectedCell);
        
        comboCount = 0;
        updateStatusBar();
        updateCounts();
        getHighlightTargetAndTrigger(selectedCell);
        return;
    }

    const isNewFill = (currentVal === ""); 

    if (judgeMode === 'assist') {
        const correctNum = solvedBoard[index];
        if (num !== correctNum) {
            errorText.innerText = "❌ 正解ではありません！";
            missCount++;
            comboCount = 0; 
            updateStatusBar();
            
            selectedCell.classList.add('invalid-flash');
            setTimeout(() => { selectedCell.classList.remove('invalid-flash'); }, 400);
            return;
        }
        
        comboCount++;
        maxComboCount = Math.max(maxComboCount, comboCount);
        gameScore += calculateComboAddScore();
        
    } else {
        if (!isValidMove(selectedCell, num)) {
            errorText.innerText = "!! 数字が重複しています";
            missCount++;
            comboCount = 0; 
            updateStatusBar();

            selectedCell.classList.add('invalid-flash');
            setTimeout(() => { selectedCell.classList.remove('invalid-flash'); }, 400);
            return;
        }
        
        if (isNewFill) {
            comboCount++;
            maxComboCount = Math.max(maxComboCount, comboCount);
            gameScore += calculateComboAddScore();
        } else {
            comboCount = 0;
        }
    }

    selectedCell.memoValues = Array(10).fill(false);
    renderMemo(selectedCell);
    setCellValue(selectedCell, num);
    selectedCell.classList.add('user-input');

    autoClearMemos(index, num);

    updateStatusBar();
        
    if (checkGameClear()) {
        if (judgeMode === 'blind') {
            if (checkFinalAnswer()) {
                triggerClearSuccess();
            } else {
                errorText.innerText = "⚠️ 盤面が埋まりましたが、どこかに間違いがあります！";
                comboCount = 0; 
                isFirstTimePerfect = false; 
                updateStatusBar();
            }
        } else {
            triggerClearSuccess();
        }
    }
    updateCounts();
    if (selectedCell) getHighlightTargetAndTrigger(selectedCell); 
}

function checkFinalAnswer() {
    for (let i = 0; i < 81; i++) {
        if (parseInt(getCellValue(cellsArray[i])) !== solvedBoard[i]) {
            return false;
        }
    }
    return true;
}

function checkGameClear() {
    for (let i = 0; i < 81; i++) {
        if (getCellValue(cellsArray[i]) === "") return false;
    }
    return true;
}

function triggerClearSuccess() {
    stopTimer(); 
    if (selectedCell) selectedCell.classList.remove('selected');
    selectedCell = null;
    clearAllHighlights();

    const config = difficultyConfig[currentDifficulty] || difficultyConfig['normal'];
    const targetTime = config.targetTime;
    const rate = (judgeMode === 'blind') ? config.rateClassic : config.rateInstant;
    
    let timeBonus = 0;
    if (elapsedTime < targetTime) {
        timeBonus = (targetTime - elapsedTime) * rate;
    }

    let perfectBonus = 0;
    if (judgeMode === 'blind' && isFirstTimePerfect) {
        perfectBonus = 1000;
    }

    const finalTotalScore = gameScore + timeBonus + perfectBonus;

    setTimeout(() => { 
        document.querySelector('.clear-msg').innerHTML = `
            素晴らしいロジックでした！スコアの内訳です。<br><br>
            <table class="result-table">
                <tr><td>モード</td><td class="val">${judgeMode === 'blind' ? 'ブラインド' : 'アシスト'}</td></tr>
                <tr><td>クリアタイム</td><td class="val">${Math.floor(elapsedTime / 60)}分 ${elapsedTime % 60}秒</td></tr>
                <tr><td>最高コンボ数</td><td class="val">${maxComboCount} 連続</td></tr>
                <tr><td>ミス回数</td><td class="val">${missCount} 回</td></tr>
                <tr><td>① プレイ中獲得点</td><td class="val">+ ${gameScore} pts</td></tr>
                <tr><td>② タイムボーナス</td><td class="val">+ ${timeBonus} pts</td></tr>
                <tr><td>③ 一発正解ボーナス</td><td class="val">+ ${perfectBonus} pts</td></tr>
                <tr class="total-row"><td>TOTAL SCORE</td><td class="val">${finalTotalScore} pts</td></tr>
            </table>
        `;
        clearScreen.style.display = 'flex'; 
        launchConfetti();
    }, 300);
}

let lastMemoPress = { index: null, num: null, time: 0 };
function pressMemoNumber(num) {
    if (isPaused) return;
    if (!selectedCell || selectedCell.classList.contains('fixed')) return;
    if (getCellValue(selectedCell) !== "") return; 
    
    const cellIndex = selectedCell.dataset.index;
    const now = Date.now();
    if (lastMemoPress.index === cellIndex && lastMemoPress.num === num && (now - lastMemoPress.time) < 250) return;
    lastMemoPress = { index: cellIndex, num, time: now };

    errorText.innerText = "";
    selectedCell.memoValues[num] = !selectedCell.memoValues[num];
    renderMemo(selectedCell);
    getHighlightTargetAndTrigger(selectedCell);
}

function closeClearScreen() { clearScreen.style.display = 'none'; }

// =========================================================================
// 💡 フリック入力（スワイプ消去）機能のセットアップ
// =========================================================================
function setupFlickToDelete() {
    const numBtns = document.querySelectorAll('.num-btn');
    
    numBtns.forEach(btn => {
        btn.style.position = 'relative'; // アイコン表示のための基準位置
        let startY = 0;
        let isFlicking = false;
        let indicator = null;

        // タッチ開始（指を置いた瞬間）
        btn.addEventListener('touchstart', (e) => {
            if (isPaused) return;
            startY = e.touches[0].clientY;
            isFlicking = false;
            showIndicator(btn);
        }, {passive: true});

        // タッチ移動（指を滑らせている最中）
        btn.addEventListener('touchmove', (e) => {
            if (!startY || isPaused) return;
            let currentY = e.touches[0].clientY;
            
            // 15px以上 上にフリックしたら「消去モード」と判定
            if (startY - currentY > 15) { 
                isFlicking = true;
                activateIndicator();
                if (e.cancelable) e.preventDefault(); // フリック中の画面スクロールを防ぐ
            } else {
                isFlicking = false;
                resetIndicator();
            }
        }, {passive: false});

        // タッチ終了（指を離した瞬間）
        btn.addEventListener('touchend', (e) => {
            if (isPaused) return;
            removeIndicator();
            
            if (isFlicking) {
                if (e.cancelable) e.preventDefault(); // 通常のクリック判定をブロック
                executeDeleteCell();
            }
            startY = 0;
        });

        // 【PC・マウス操作用の予備ロジック】
        let isMouseDown = false;
        btn.addEventListener('mousedown', (e) => {
            if (isPaused) return;
            isMouseDown = true;
            startY = e.clientY;
            isFlicking = false;
            showIndicator(btn);
        });

        btn.addEventListener('mousemove', (e) => {
            if (!isMouseDown || !startY || isPaused) return;
            let currentY = e.clientY;
            if (startY - currentY > 15) {
                isFlicking = true;
                activateIndicator();
            } else {
                isFlicking = false;
                resetIndicator();
            }
        });

        btn.addEventListener('mouseup', () => {
            if (isPaused) return;
            isMouseDown = false;
            removeIndicator();
            if (isFlicking) {
                executeDeleteCell();
            }
            startY = 0;
        });
        
        btn.addEventListener('mouseleave', () => {
            isMouseDown = false;
            removeIndicator();
        });

        // --- フリック時の演出UI関数 ---
        function showIndicator(parent) {
            if(indicator) indicator.remove();
            indicator = document.createElement('div');
            indicator.innerText = "↑";
            indicator.style.position = 'absolute';
            indicator.style.top = '-25px';
            indicator.style.left = '50%';
            indicator.style.transform = 'translateX(-50%)';
            indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            indicator.style.color = 'white';
            indicator.style.padding = '2px 8px';
            indicator.style.borderRadius = '10px';
            indicator.style.fontSize = '10px';
            indicator.style.opacity = '0';
            indicator.style.transition = 'all 0.15s ease';
            indicator.style.pointerEvents = 'none';
            indicator.style.zIndex = '100';
            parent.appendChild(indicator);
            
            setTimeout(() => {
                if(indicator) indicator.style.opacity = '0.8';
            }, 50);
        }

        function activateIndicator() {
            if (indicator && indicator.innerText !== "✖ 消去") {
                indicator.innerText = "✖ 消去";
                indicator.style.top = '-40px';
                indicator.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
                indicator.style.transform = 'translateX(-50%) scale(1.1)';
            }
        }

        function resetIndicator() {
            if (indicator && indicator.innerText !== "↑") {
                indicator.innerText = "↑";
                indicator.style.top = '-25px';
                indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                indicator.style.transform = 'translateX(-50%) scale(1)';
            }
        }

        function removeIndicator() {
            if (indicator) {
                indicator.remove();
                indicator = null;
            }
        }
    });
}

// 実際に消去を実行する関数
function executeDeleteCell() {
    justFlicked = true; // クリック誤爆防止フラグをON
    setTimeout(() => justFlicked = false, 100); // すぐに解除

    if (!selectedCell || selectedCell.classList.contains('fixed')) return;
    
    const currentVal = getCellValue(selectedCell);
    if (currentVal !== "") {
        setCellValue(selectedCell, "");
        selectedCell.classList.remove('user-input');
        comboCount = 0;
        updateStatusBar();
        updateCounts();
        getHighlightTargetAndTrigger(selectedCell);
        errorText.innerText = "🧹 マスの数字を消去しました";
    }
}
