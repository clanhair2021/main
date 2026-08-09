/* =======================================================
   02-sudoku-generator.js : 数独の生成・バックトラック計算
   ======================================================= */
function checkValid(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) return false;
    }
    let startRow = row - row % 3, startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }
    return true;
}
function solveSudokuRandomly(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
                for (let num of numbers) {
                    if (checkValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudokuRandomly(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function countSolutions(board, limit = 2) {
    let count = 0;
    function backtrack() {
        if (count >= limit) return;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (checkValid(board, row, col, num)) {
                            board[row][col] = num;
                            backtrack();
                            board[row][col] = 0;
                            if (count >= limit) return;
                        }
                    }
                    return;
                }
            }
        }
        count++;
    }
    backtrack();
    return count;
}

function generateSudoku(difficulty) {
    cellsArray.forEach(cell => {
        setCellValue(cell, "");
        cell.classList.remove('fixed', 'user-input');
        cell.memoValues = Array(10).fill(false);
        renderMemo(cell);
    });

    let solved = Array.from({ length: 9 }, () => Array(9).fill(0));
    solveSudokuRandomly(solved);

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            solvedBoard[r * 9 + c] = solved[r][c];
        }
    }

    let minHints = 40;
    if (difficulty === 'normal') minHints = 32;
    if (difficulty === 'hard') minHints = 25;
    if (difficulty === 'expert') minHints = 20;

    let puzzle = solved.map(r => r.slice());
    let indices = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
    let hints = 81;

    for (const idx of indices) {
        if (hints <= minHints) break;
        const r = Math.floor(idx / 9), c = idx % 9;
        if (puzzle[r][c] === 0) continue;

        const backup = puzzle[r][c];
        puzzle[r][c] = 0;

        const testBoard = puzzle.map(row => row.slice());
        if (countSolutions(testBoard, 2) === 1) {
            hints--;
        } else {
            puzzle[r][c] = backup;
        }
    }

    cellsArray.forEach((cell, idx) => {
        const r = Math.floor(idx / 9), c = idx % 9;
        if (puzzle[r][c] !== 0) {
            setCellValue(cell, puzzle[r][c]);
            cell.classList.add('fixed');
        }
    });

    errorText.innerText = "";
    clearAllHighlights();
    updateCounts();
}
