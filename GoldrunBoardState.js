import { CELL_STATE } from './constants.js';
import { BoardState } from './BoardState.js';

export class GoldrunBoardState extends BoardState {
    constructor(rows, cols) {
        super(rows, cols);
    }

    // In Goldrun, we only care about left-to-right connections, regardless of whether Blue or White captured it.
    // For DFS, we'll treat both BLUE and WHITE as generic "captured" states, but effectively we only need to check left-to-right.
    checkWin() {
        for (let r = 0; r < this.rows; r++) {
            const startCell = this.grid[r][0];
            if ((startCell === CELL_STATE.BLUE || startCell === CELL_STATE.WHITE) && this.dfsGoldrun(r, 0, new Set())) {
                return true;
            }
        }
        return false;
    }

    dfsGoldrun(r, c, visited) {
        const key = `${r},${c}`;
        if (visited.has(key)) return false;
        visited.add(key);

        if (c === this.cols - 1) return true; // Reached the rightmost column

        for (const [nr, nc] of this.getNeighbors(r, c)) {
            const neighborState = this.grid[nr][nc];
            // Treat both BLUE and WHITE as connected
            if ((neighborState === CELL_STATE.BLUE || neighborState === CELL_STATE.WHITE) && this.dfsGoldrun(nr, nc, visited)) {
                return true;
            }
        }
        return false;
    }

    // We don't flash potential wins in Goldrun
    findWinningMoves() {
        return [];
    }
}
