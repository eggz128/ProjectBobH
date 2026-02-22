import { BlockbustersGame } from './BlockbustersGame.js';
import { CELL_STATE } from './constants.js';
import { GoldrunBoardState } from './GoldrunBoardState.js';

export class GoldrunGame extends BlockbustersGame {
    constructor() {
        super();
        this.goldrunTimeRemaining = 60;
        this.timerInterval = null;
        this.timerStarted = false;
    }

    init() {
        this.reset();
        this.bindClickEvents();
        this.updateScoreDisplay();
        document.querySelector('table').classList.add('goldrun-active');
        document.getElementById('goldrun-timer').classList.add('goldrun-active');
        this.updateTimerDisplay();
        // Goldrun doesn't select a random start cell automatically
    }

    reset() {
        this.stopRandom();
        this.stopTimer();
        this.state = new GoldrunBoardState(this.rows, this.cols);
        this.activeCell = null;
        this.isResetting = true;

        this.goldrunTimeRemaining = 60;
        this.timerStarted = false;
        this.updateTimerDisplay();

        document.querySelectorAll("td").forEach(cell => {
            cell.classList.remove("active", "bl", "wh", "yl", "bk");
            cell.removeAttribute("tabindex");
        });

        const shuffled = [...this.alphabet].sort(() => Math.random() - 0.5);
        const spans = document.querySelectorAll("td > span");
        spans.forEach((span, i) => { if (shuffled[i]) span.innerText = shuffled[i]; });
        this.questionManager.resetCurrentSelection();
        this.isResetting = false;
    }

    selectQuestion(cell) {
        super.selectQuestion(cell);

        // Start timer on first question selection
        if (!this.timerStarted && this.questionManager.hasQuestions()) {
            this.startTimer();
        }
    }

    handleKeyPress(e) {
        if (!this.activeCell || this.isResetting) return;

        const key = e.key.toLowerCase();

        if (key === 'b') this.captureActiveCell(CELL_STATE.BLUE);
        else if (key === 'w') this.captureActiveCell(CELL_STATE.WHITE);
        else if (key === 'p') this.passActiveCell();
    }

    captureActiveCell(state) {
        if (!this.activeCell || this.isResetting) return;
        const row = this.activeCell.parentNode.rowIndex - 1;
        const col = this.activeCell.cellIndex - 1;
        this.captureCell(row, col, state);
    }

    passActiveCell() {
        if (!this.activeCell || this.isResetting) return;
        const row = this.activeCell.parentNode.rowIndex - 1;
        const col = this.activeCell.cellIndex - 1;
        this.captureCell(row, col, CELL_STATE.BLACK);
    }

    captureCell(row, col, state) {
        const oldState = this.state.grid[row][col];
        if (oldState === state) return;

        // Undo old score if needed
        if (oldState === CELL_STATE.BLUE) this.blueScore -= 5;
        else if (oldState === CELL_STATE.WHITE) this.whiteScore -= 5;

        // Apply new score if needed
        if (state === CELL_STATE.BLUE) this.blueScore += 5;
        else if (state === CELL_STATE.WHITE) this.whiteScore += 5;

        this.updateScoreDisplay();

        const cell = this.activeCell;
        const letter = cell.innerText;
        this.state.setCell(row, col, state);

        if (state === CELL_STATE.BLUE || state === CELL_STATE.WHITE || state === CELL_STATE.BLACK) {
            this.questionManager.markAsUsed(letter);
        }

        cell.classList.remove("bl", "wh", "yl", "bk", "active");
        if (state === CELL_STATE.BLUE) cell.classList.add("bl");
        else if (state === CELL_STATE.WHITE) cell.classList.add("wh");
        else if (state === CELL_STATE.YELLOW) cell.classList.add("yl");
        else if (state === CELL_STATE.BLACK) cell.classList.add("bk");

        if (!this.checkActualWins()) {
            this.checkPotentialWins(); // GoldrunBoardState returns [] so this does nothing to UI
        }
        this.activeCell = null;
    }

    checkActualWins() {
        if (this.state.checkWin()) {
            this.handleWin("Goldrun Winner");
            return true;
        }
        return false;
    }

    handleWin(team) {
        console.log(`[Goldrun] ${team} HAS WON!`);
        this.stopTimer();
        // Flash all captured cells (in goldrun they're orange via CSS when bl or wh)
        this.flashTeam('bl', true, false);
        this.flashTeam('wh', true, false);
        // Don't run any sort of random animation at the end of the game. Allows host to go back and read missed questions.
    }

    startTimer() {
        this.timerStarted = true;
        this.timerInterval = setInterval(() => {
            this.goldrunTimeRemaining--;
            this.updateTimerDisplay();

            if (this.goldrunTimeRemaining <= 0) {
                this.stopTimer();
                this.handleTimeout();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const minElem = document.getElementById('minutes');
        const secElem = document.getElementById('seconds');
        if (minElem && secElem) {
            const m = Math.floor(this.goldrunTimeRemaining / 60);
            const s = this.goldrunTimeRemaining % 60;
            minElem.innerText = m;
            secElem.innerText = String(s).padStart(2, '0');
        }
    }

    handleTimeout() {
        console.log("[Goldrun] Time is up!");
        alert("Time's up!");
    }

    assignRandomStart() {
        // Goldrun mode does not assign a random starting question.
    }

    cleanup() {
        this.stopTimer();
        document.querySelector('table').classList.remove('goldrun-active');
        document.getElementById('goldrun-timer').classList.remove('goldrun-active');
    }
}
