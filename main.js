/**
 * Blockbusters - Modernized JavaScript Core (v2)
 */

const CELL_STATE = {
    EMPTY: 0,
    BLUE: 1,
    WHITE: 2,
    YELLOW: 3
};

const ALPHABETS = {
    EN: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    CY: ["A", "B", "C", "Ch", "D", "Dd", "E", "F", "Ff", "G", "Ng", "H", "I", "J", "L", "Ll", "M", "N", "O", "P", "Ph", "R", "Rh", "S", "T", "Th", "U", "W", "Y"]
};

class BoardState {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = Array(rows).fill().map(() => Array(cols).fill(CELL_STATE.EMPTY));
    }

    setCell(row, col, state) {
        if (this.isValid(row, col)) this.grid[row][col] = state;
    }

    isValid(row, col) { return row >= 0 && row < this.rows && col >= 0 && col < this.cols; }

    getNeighbors(row, col) {
        const neighbors = [];
        const isHigh = col % 2 === 0; // Even indices 0, 2, 4 are 'high' in the table layout

        const offsets = isHigh ?
            [[-1, 0], [-1, 1], [0, 1], [1, 0], [0, -1], [-1, -1]] :
            [[-1, 0], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];

        for (const [dr, dc] of offsets) {
            const nr = row + dr;
            const nc = col + dc;
            if (this.isValid(nr, nc)) neighbors.push([nr, nc]);
        }
        return neighbors;
    }

    checkWin(state) {
        if (state === CELL_STATE.BLUE) {
            for (let r = 0; r < this.rows; r++) {
                if (this.grid[r][0] === CELL_STATE.BLUE && this.dfs(r, 0, state, new Set(), true)) return true;
            }
        } else if (state === CELL_STATE.WHITE) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[0][c] === CELL_STATE.WHITE && this.dfs(0, c, state, new Set(), false)) return true;
            }
        }
        return false;
    }

    dfs(r, c, state, visited, isBlue) {
        const key = `${r},${c}`;
        if (visited.has(key)) return false;
        visited.add(key);

        if (isBlue && c === this.cols - 1) return true;
        if (!isBlue && r === this.rows - 1) return true;

        for (const [nr, nc] of this.getNeighbors(r, c)) {
            if (this.grid[nr][nc] === state && this.dfs(nr, nc, state, visited, isBlue)) return true;
        }
        return false;
    }

    findWinningMoves(isBlue) {
        const state = isBlue ? CELL_STATE.BLUE : CELL_STATE.WHITE;
        const moves = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === CELL_STATE.EMPTY) {
                    this.grid[r][c] = state;
                    if (this.checkWin(state)) moves.push([r, c]);
                    this.grid[r][c] = CELL_STATE.EMPTY;
                }
            }
        }
        return moves;
    }
}

class BlockbustersGame {
    constructor() {
        this.rows = 4;
        this.cols = 5;
        this.state = new BoardState(this.rows, this.cols);
        this.activeCell = null;
        this.alphabet = ALPHABETS.CY;
        this.randomInterval = null;
        this.isResetting = false;
        this.blueScore = 0;
        this.whiteScore = 0;

        // Use a window listener for keys to be more robust
        window.addEventListener("keydown", (e) => this.handleKeyPress(e));
    }

    init() {
        this.reset();
        this.bindClickEvents();
        this.updateScoreDisplay();
        setTimeout(() => this.assignRandomStart(), 500);
    }

    updateScoreDisplay() {
        const blueElem = document.getElementById("blue-score");
        const whiteElem = document.getElementById("white-score");
        if (blueElem) blueElem.innerText = this.blueScore;
        if (whiteElem) whiteElem.innerText = this.whiteScore;
    }

    resetScore(team) {
        if (team === 'blue') this.blueScore = 0;
        else if (team === 'white') this.whiteScore = 0;
        this.updateScoreDisplay();
    }

    reset() {
        this.stopRandom();
        this.state = new BoardState(this.rows, this.cols);
        this.activeCell = null;
        this.isResetting = true;

        document.querySelectorAll("td").forEach(cell => {
            cell.classList.remove("active", "bl", "wh", "yl");
            cell.removeAttribute("tabindex");
        });

        const shuffled = [...this.alphabet].sort(() => Math.random() - 0.5);
        const spans = document.querySelectorAll("td > span");
        spans.forEach((span, i) => { if (shuffled[i]) span.innerText = shuffled[i]; });
        this.isResetting = false;
    }

    bindClickEvents() {
        document.querySelectorAll("td").forEach(cell => {
            cell.onclick = (e) => this.selectCell(e.currentTarget);
        });
    }

    selectCell(cell) {
        if (this.isResetting) return;
        // Clear ALL active/pulsing elements (board and headers)
        document.querySelectorAll(".active").forEach(c => c.classList.remove("active"));
        this.activeCell = cell;
        cell.classList.add("active");
        cell.setAttribute("tabindex", "-1");
        cell.focus();
    }

    handleKeyPress(e) {
        if (!this.activeCell || this.isResetting) return;

        const key = e.key.toLowerCase();
        const row = this.activeCell.parentNode.rowIndex - 1;
        const col = this.activeCell.cellIndex - 1;

        if (key === 'b') this.captureCell(row, col, CELL_STATE.BLUE);
        else if (key === 'w') this.captureCell(row, col, CELL_STATE.WHITE);
        else if (key === 'y') this.captureCell(row, col, CELL_STATE.EMPTY);
    }

    captureCell(row, col, state) {
        const oldState = this.state.grid[row][col];
        if (oldState === state) return;

        // Subtract points from old owner
        if (oldState === CELL_STATE.BLUE) this.blueScore -= 5;
        else if (oldState === CELL_STATE.WHITE) this.whiteScore -= 5;

        // Add points to new owner
        if (state === CELL_STATE.BLUE) this.blueScore += 5;
        else if (state === CELL_STATE.WHITE) this.whiteScore += 5;

        this.updateScoreDisplay();

        const cell = this.activeCell;
        this.state.setCell(row, col, state);

        cell.classList.remove("bl", "wh", "yl", "active");
        if (state === CELL_STATE.BLUE) cell.classList.add("bl");
        else if (state === CELL_STATE.WHITE) cell.classList.add("wh");
        else if (state === CELL_STATE.YELLOW) cell.classList.add("yl");

        if (!this.checkActualWins()) {
            this.checkPotentialWins();
        }
        this.activeCell = null;
    }

    checkActualWins() {
        if (this.state.checkWin(CELL_STATE.BLUE)) { this.handleWin("Blue"); return true; }
        if (this.state.checkWin(CELL_STATE.WHITE)) { this.handleWin("White"); return true; }
        return false;
    }

    checkPotentialWins() {
        const blueMoves = this.state.findWinningMoves(true);
        const whiteMoves = this.state.findWinningMoves(false);

        console.log(`[Blockbusters] Potential Win Check: Blue=${blueMoves.length} moves, White=${whiteMoves.length} moves`);

        // Pass 'true' for shouldPersistent to avoid the 3s timeout
        if (blueMoves.length > 0) this.flashTeam('bl', false, true);
        if (whiteMoves.length > 0) this.flashTeam('wh', false, true);
    }

    flashTeam(className, includeHeaders = false, shouldPersistent = false) {
        console.log(`[Blockbusters] Flashing team: ${className} (headers: ${includeHeaders}, persistent: ${shouldPersistent})`);
        const selector = includeHeaders ? `td.${className}, th.${className}` : `td.${className}`;
        const cells = document.querySelectorAll(selector);
        cells.forEach(cell => {
            cell.classList.add("active");
            const anims = cell.getAnimations();
            if (anims.length > 0) anims[0].currentTime = 0;
        });

        if (!shouldPersistent) {
            setTimeout(() => {
                cells.forEach(cell => {
                    if (cell !== this.activeCell) cell.classList.remove("active");
                });
            }, 3000);
        }
    }

    handleWin(team) {
        console.log(`[Blockbusters] ${team} team HAS WON!`);
        this.flashTeam(team === 'Blue' ? 'bl' : 'wh', true);
        setTimeout(() => {
            this.startShowtime();
            setTimeout(() => this.stopRandom(), 3000);
        }, 3000);
    }

    assignRandomStart() {
        const cells = document.querySelectorAll("td");
        if (cells.length > 0) this.selectCell(cells[Math.floor(Math.random() * cells.length)]);
    }

    startShowtime() {
        if (this.randomInterval) return;
        this.randomInterval = setInterval(() => {
            document.querySelectorAll("td").forEach(cell => {
                const rnd = Math.floor(Math.random() * 3);
                cell.classList.remove("bl", "wh", "yl");
                if (rnd === 0) cell.classList.add("bl");
                else if (rnd === 1) cell.classList.add("wh");
                else cell.classList.add("yl");
            });
        }, 500);
    }

    stopRandom() {
        if (this.randomInterval) {
            clearInterval(this.randomInterval);
            this.randomInterval = null;
            this.reset();
        }
    }
}

let game = new BlockbustersGame();
function init() { game.init(); }
function initEn() { game.alphabet = ALPHABETS.EN; game.init(); }
function initCy() { game.alphabet = ALPHABETS.CY; game.init(); }
function randomBoard() { game.startShowtime(); }
function stopRandom() { game.stopRandom(); }
function resetBlueScore() { game.resetScore('blue'); }
function resetWhiteScore() { game.resetScore('white'); }
