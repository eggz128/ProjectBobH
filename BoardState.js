import { CELL_STATE } from './constants.js';

export class BoardState {
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
        const isHigh = col % 2 === 0;

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
