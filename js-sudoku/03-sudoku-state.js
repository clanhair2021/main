/* =======================================================
   03-sudoku-state.js : 画面・タイマー・状態変更・データの保存読込
   ======================================================= */

function showScreen(screenId) {
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById(screenId).style.display = 'flex';
}

function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
        if (!isPaused && isPlayMode) {
            elapsedTime++;
            updateTimerDisplay();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function setJudgeMode(mode) {
    judgeMode = mode;
    const btnBlind = document.getElementById('btn-mode-blind');
    const btnAssist = document.getElementById('btn-mode-assist');
    
    if (btnBlind && btnAssist) {
        btnBlind.classList.remove('active');
        btnAssist.classList.remove('active');
        
        if (mode === 'blind') {
            btnBlind.classList.add('active');
        } else {
            btnAssist.classList.add('active');
        }
    }
}

function handleMenuGenerate(difficulty) {
    currentDifficulty = difficulty;
    if (difficulty === 'easy') currentDifficultyText = "EASY";
    if (difficulty === 'normal') currentDifficultyText = "NORMAL";
    if (difficulty === 'hard') currentDifficultyText = "HARD";
    if (difficulty === 'expert') currentDifficultyText = "MASTER";

    gameScore = 0;
    comboCount = 0;
    maxComboCount = 0;
    missCount = 0;
    elapsedTime = 0;
    isFirstTimePerfect = true;
    
    updateTimerDisplay();
    updateStatusBar();

    generateSudoku(difficulty);
    isPlayMode = true;
    showScreen('game-screen');
    startTimer();
}

function openSettingsModal() {
    setJudgeMode(judgeMode); 

    const modeSettingItem = document.getElementById('setting-item-mode');

    if (isPlayMode) {
        if (modeSettingItem) modeSettingItem.style.display = 'none';
        gameActionsArea.style.display = 'flex';
        isPaused = true;
        numPadArea.style.opacity = "0.15";
    } else {
        if (modeSettingItem) modeSettingItem.style.display = 'flex';
        gameActionsArea.style.display = 'none';
    }
    settingsModal.style.display = 'flex';
}

function closeSettingsModal() {
    settingsModal.style.display = 'none';
    if (isPlayMode) {
        isPaused = false;
        numPadArea.style.opacity = "1";
    }
}

function resumeGame() { closeSettingsModal(); }
function triggerSave() { savePuzzleCustom(); }

function triggerReset() {
    if (confirm("現在の問題を最初から解き直しますか？\n（タイム・スコア・コンボもリセットされます）")) {
        cellsArray.forEach(cell => {
            if (!cell.classList.contains('fixed')) {
                setCellValue(cell, "");
                cell.classList.remove('user-input');
                cell.memoValues = Array(10).fill(false);
                renderMemo(cell);
            }
        });
        errorText.innerText = "";
        gameScore = 0;
        comboCount = 0;
        maxComboCount = 0;
        missCount = 0;
        elapsedTime = 0;
        isFirstTimePerfect = true;
        updateTimerDisplay();
        updateStatusBar();
        clearAllHighlights();
        updateCounts();
        closeSettingsModal();
    }
}

function triggerQuit() {
    if (confirm("本当にギブアップしてメニューに戻りますか？\n（スコアはすべて破棄されます）")) {
        closeSettingsModal();        // ← 最初に設定モーダルを閉じる
        showScreen('menu-screen');   // ← その後に画面を切り替え
        
        isPlayMode = false;
        isPaused = false;
        stopTimer();
        pauseScreen.style.display = "none";
        numPadArea.style.opacity = "1";
        clearAllHighlights();
    }
}

function savePuzzleCustom() {
    const saveName = prompt("この【問題】につける名前を入力してください：");
    if (saveName === null) return; 
    const trimmedName = saveName.trim();
    if (trimmedName === "") {
        alert("名前が空欄のため保存できませんでした。");
        return;
    }

    const puzzleData = cellsArray.map((cell, idx) => {
        const isFixed = cell.classList.contains('fixed');
        return {
            isFixed: isFixed,
            text: isFixed ? getCellValue(cell) : "",
            memos: Array(10).fill(false),
            correctNum: solvedBoard[idx]
        };
    });

    try {
        let customSaves = JSON.parse(localStorage.getItem('sudoku_studio_custom_saves') || '{}');
        customSaves[trimmedName] = puzzleData;
        localStorage.setItem('sudoku_studio_custom_saves', JSON.stringify(customSaves));
        alert(`問題 [${trimmedName}] をお気に入り保存しました！`);
    } catch (e) {
        alert("保存に失敗しました");
    }
}

function openLoadModal() {
    modalSaveList.innerHTML = "";
    let customSaves = JSON.parse(localStorage.getItem('sudoku_studio_custom_saves') || '{}');
    const saveNames = Object.keys(customSaves);

    if (saveNames.length === 0) {
        modalSaveList.innerHTML = "<div style='padding:15px; text-align:center; color:#a0aec0; font-size:0.85rem;'>保存されたデータがありません</div>";
    } else {
        saveNames.forEach(name => {
            const item = document.createElement('div');
            item.classList.add('save-item');

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('save-name');
            nameSpan.innerText = name;

            const btnGroup = document.createElement('div');
            btnGroup.classList.add('save-item-btns');

            const loadBtn = document.createElement('button');
            loadBtn.classList.add('btn-item-load');
            loadBtn.innerText = "読込";
            loadBtn.onclick = () => loadPuzzleCustom(name);

            const delBtn = document.createElement('button');
            delBtn.classList.add('btn-item-del');
            delBtn.innerText = "削除";
            delBtn.onclick = () => deletePuzzleCustom(name);

            btnGroup.appendChild(loadBtn);
            btnGroup.appendChild(delBtn);
            item.appendChild(nameSpan);
            item.appendChild(btnGroup);
            modalSaveList.appendChild(item);
        });
    }
    loadModal.style.display = "flex";
}

function closeLoadModal() { loadModal.style.display = "none"; }

function loadPuzzleCustom(name) {
    let customSaves = JSON.parse(localStorage.getItem('sudoku_studio_custom_saves') || '{}');
    const puzzleData = customSaves[name];
    if (!puzzleData) return;

    cellsArray.forEach((cell, index) => {
        const data = puzzleData[index];
        setCellValue(cell, data.text || "");
        cell.memoValues = data.memos || Array(10).fill(false);
        cell.classList.remove('fixed', 'user-input');
        if (data.isFixed && data.text !== "") {
            cell.classList.add('fixed');
        }
        solvedBoard[index] = data.correctNum || 0;
        renderMemo(cell);
    });

    errorText.innerText = "";
    clearAllHighlights();
    
    isPlayMode = true;
    isPaused = false;
    pauseScreen.style.display = "none";
    numPadArea.style.opacity = "1";
    
    currentDifficulty = "normal";
    currentDifficultyText = "保存データ";
    gameScore = 0;
    comboCount = 0;
    maxComboCount = 0;
    missCount = 0;
    elapsedTime = 0;
    isFirstTimePerfect = true;
    
    updateTimerDisplay();
    updateStatusBar();
    updateCounts();
    closeLoadModal();
    showScreen('game-screen');
    startTimer();
}

function deletePuzzleCustom(name) {
    if (confirm(`【${name}】のデータを完全に削除しますか？`)) {
        let customSaves = JSON.parse(localStorage.getItem('sudoku_studio_custom_saves') || '{}');
        delete customSaves[name];
        localStorage.setItem('sudoku_studio_custom_saves', JSON.stringify(customSaves));
        openLoadModal(); 
    }
}
