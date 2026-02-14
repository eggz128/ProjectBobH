import { CELL_STATE, ALPHABETS } from './constants.js';
import { BoardState } from './BoardState.js';

export class BlockbustersGame {
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
        if (blueElem) blueElem.innerText = String(this.blueScore).padStart(3, '0');
        if (whiteElem) whiteElem.innerText = String(this.whiteScore).padStart(3, '0');
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

        if (oldState === CELL_STATE.BLUE) this.blueScore -= 5;
        else if (oldState === CELL_STATE.WHITE) this.whiteScore -= 5;

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

    captureActiveCell(state) {
        if (!this.activeCell || this.isResetting) return;
        const row = this.activeCell.parentNode.rowIndex - 1;
        const col = this.activeCell.cellIndex - 1;
        this.captureCell(row, col, state);
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
        // No cells should be selected during showtime
        this.activeCell = null;
        document.querySelectorAll(".active").forEach(c => c.classList.remove("active"));

        if (this.randomInterval) return; // Don't start multiple intervals
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
