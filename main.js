let questionCell; //Holds(/will hold) current question cell
let boardState; //Holds(/will hold) the current game state

function init() {
    reset(); //Clear the board

    boardState = new BoardState(4, 5); // Create 4x5 game board

    let cells = document.querySelectorAll("td");  //Doing this a lot... should probably do it just and store it in a const in scope to all functions
    //Assigns a click listener to all cells.
    cells.forEach(ref => {
        ref.addEventListener("click", event => {
            setLetter(event);
        })
    })

    assignStartLetter();
}

function initEn() {
    letters = en_letters
    init();
}
function initCy() {
    letters = cy_letters
    init();
}

function reset() {
    //If board is being randomised - stop it
    if(randomIntervalHandler) {
        clearInterval(randomIntervalHandler)
    }

    let cells = document.querySelectorAll("td");
    //Recet cell styles
    cells.forEach(ref => {
        ref.classList.remove("active", "bl", "wh", "yl")
    })

    let shuffledLetters = letters //letters currently at bottom of file
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

    //Swap hardcoded cell content for suffled letters
    let cellLetters = document.querySelectorAll("td > span");
    for (let cellLetter = 0; cellLetter < cellLetters.length; cellLetter++) {
        cellLetters[cellLetter].innerText = shuffledLetters[cellLetter];
    }
}

function assignStartLetter() {
    let cells = document.querySelectorAll("td");
    let rndcell = Math.floor(Math.random() * cells.length + 1);
    //cells[rndcell].classList.add("active")
    questionCell = cells[rndcell]

    setLetter(questionCell)
}


function setLetter(event) {
    if (event.currentTarget === undefined) { //if currentTarget is undefined it's because this function wasnt called by the event handler but instead intial setup
        questionCell.classList.add("active")
        questionCell.setAttribute("tabindex", "-1")
    } else {
        document.querySelectorAll("td.active").forEach(ref => {ref.classList.remove("active")}) //remove active from all question cells
        questionCell.removeAttribute("tabindex")
        event.currentTarget.classList.add("active") //set active on current question
        questionCell = event.currentTarget //set questionCell to current target
        questionCell.setAttribute("tabindex", "-1")
    }


    questionCell.focus()
    questionCell.addEventListener("keydown", setColour)


}

function setColour(e) {
    let key = e.key.toLowerCase();

    const rowIndex = questionCell.parentNode.rowIndex;
    const colIndex = questionCell.cellIndex;
    const { row, col } = BoardState.domToGamePosition(rowIndex, colIndex);

    switch (key) {
        case "b":
            questionCell.classList.add("bl");
            questionCell.classList.remove("wh");
            boardState.setCellState(row, col, CELL_STATE.BLUE);
            break;
        case "w":
            questionCell.classList.add("wh");
            questionCell.classList.remove("bl");
            boardState.setCellState(row, col, CELL_STATE.WHITE);
            break;
        default:
            console.log(e);
            break;
    }

    questionCell.classList.remove("active");

    // Check for current wins
    if (boardState.hasBlueWon()) {
        console.log("Blue team has won!");
        //Flash blue plus border, then after 3s call randomise board colour
        let cells = document.querySelectorAll(".bl");
        cells.forEach(ref => {
            ref.classList.add("active")
            ref.getAnimations()[0].currentTime = 0; //Ensure animation is synchronised across all active cells.
            setTimeout(() => {
                document.querySelectorAll(".active").forEach(ref => {ref.classList.remove("active")});
            }, 3000);
        })
    }
    if (boardState.hasWhiteWon()) {
        console.log("White team has won!");
        //Flash blue plus border, then after 3s call randomise board colour
        let cells = document.querySelectorAll(".wh");
        cells.forEach(ref => {
            ref.classList.add("active")
            ref.getAnimations()[0].currentTime = 0; //Ensure animation is synchronised across all active cells.
            setTimeout(() => {
                document.querySelectorAll(".active").forEach(ref => {ref.classList.remove("active")});
            }, 3000);
        })
    }

    // Check for potential winning moves
    const blueWinningMoves = boardState.findWinningMove(true);
    const whiteWinningMoves = boardState.findWinningMove(false);

    if (blueWinningMoves.length > 0) {
        console.log("Blue can win by taking:", blueWinningMoves.map(([row, col]) =>
            boardState.getLetterForPosition(row, col)).join(" or "));
        //find blue cells, set them to flash with active class
        let cells = document.querySelectorAll("td.bl");
        cells.forEach(ref => {
            ref.classList.add("active")
            ref.getAnimations()[0].currentTime = 0; //Ensure animation is synchronised across all active cells.
        })
    }
    if (whiteWinningMoves.length > 0) {
        console.log("White can win by taking:", whiteWinningMoves.map(([row, col]) =>
            boardState.getLetterForPosition(row, col)).join(" or "));
            //find white cells, set them to flash with active class
            let cells = document.querySelectorAll("td.wh");
            cells.forEach(ref => {
                ref.classList.add("active")
                ref.getAnimations()[0].currentTime = 0; //Ensure animation is synchronised across all active cells.
            })
    }

}

/* Random flash stuff */

var randomIntervalHandler;

function randomBoard() {
    //reset();

    randomIntervalHandler = setInterval(function () {
        let cells = document.querySelectorAll("td");
        cells.forEach(ref => {
            let rnd = Math.floor(Math.random() * 3);
            ref.classList.remove("active", "bl", "wh", "yl")
            switch (rnd) {
                case 0:
                    ref.classList.add("bl")
                    break;
                case 1:
                    ref.classList.add("wh")
                    break;
                case 2:
                    ref.classList.add("yl")
                    break;

                default:
                    break;
            }

        })
    }, 500)
}

function stopRandom() {
    clearInterval(randomIntervalHandler)
}

/* Letters and Qs */
//ToDo: move this to external JSON

var en_letters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
]

var cy_letters = [
    "A", "B", "C", "Ch", "D", "Dd", "E", "F", "Ff", "G", "Ng", "H", "I", "J", "L", "Ll", "M", "N", "O", "P", "Ph", "R", "Rh", "S", "T", "Th", "U", "W", "Y"
]

var letters = cy_letters

// Game state constants
const CELL_STATE = {
    EMPTY: 0,
    BLUE: 1,
    WHITE: 2
};

class BoardState {
    constructor(rows = 4, cols = 5) {
        this.rows = rows;
        this.cols = cols;
        this.board = Array(rows).fill().map(() => Array(cols).fill(CELL_STATE.EMPTY));
    }

    // Update cell state
    setCellState(row, col, state) {
        if (this.isValidPosition(row, col)) {
            this.board[row][col] = state;
        }
    }

    // Get cell state
    getCellState(row, col) {
        if (this.isValidPosition(row, col)) {
            return this.board[row][col];
        }
        return null;
    }

    // Check if position is within bounds
    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    // Convert DOM table position to board position
    static domToGamePosition(rowIndex, colIndex) {
        // Subtract 1 from each to account for the border
        return {
            row: rowIndex - 1,
            col: colIndex - 1
        };
    }

    // Get all valid neighboring positions for a given cell
    getNeighbors(row, col) {
        const neighbors = [];
        const isEvenColumn = col % 2 === 0;

        // Neighbor positions relative to current cell
        // For even columns (0-based index):
        const evenColNeighbors = [
            [-1, 0],  // Above
            [-1, 1],  // Above-right
            [0, 1],   // Right
            [1, 0],   // Below
            [0, -1],  // Left
            [-1, -1]  // Above-left
        ];

        // For odd columns:
        const oddColNeighbors = [
            [-1, 0],  // Above
            [0, 1],   // Right
            [1, 1],   // Below-right
            [1, 0],   // Below
            [1, -1],  // Below-left
            [0, -1]   // Left
        ];

        const neighborPositions = isEvenColumn ? evenColNeighbors : oddColNeighbors;

        // Check each potential neighbor
        for (const [rowOffset, colOffset] of neighborPositions) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;

            if (this.isValidPosition(newRow, newCol)) {
                neighbors.push([newRow, newCol]);
            }
        }

        return neighbors;
    }

    // Check if Blue team has won (left to right path)
    hasBlueWon() {
        // Check each starting position in leftmost column
        for (let row = 0; row < this.rows; row++) {
            if (this.getCellState(row, 0) === CELL_STATE.BLUE) {
                const visited = new Set();
                if (this.dfsBlue(row, 0, visited)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Check if White team has won (top to bottom path)
    hasWhiteWon() {
        // Check each starting position in top row
        for (let col = 0; col < this.cols; col++) {
            if (this.getCellState(0, col) === CELL_STATE.WHITE) {
                const visited = new Set();
                if (this.dfsWhite(0, col, visited)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Depth-first search for Blue team (looking for path to right edge)
    dfsBlue(row, col, visited) {
        // Mark current cell as visited
        visited.add(`${row},${col}`);

        // Check if we've reached the right edge
        if (col === this.cols - 1) {
            return true;
        }

        // Check all neighbors
        for (const [newRow, newCol] of this.getNeighbors(row, col)) {
            // If neighbor is blue and unvisited, explore it
            if (!visited.has(`${newRow},${newCol}`) &&
                this.getCellState(newRow, newCol) === CELL_STATE.BLUE) {
                if (this.dfsBlue(newRow, newCol, visited)) {
                    return true;
                }
            }
        }

        return false;
    }

    // Depth-first search for White team (looking for path to bottom edge)
    dfsWhite(row, col, visited) {
        // Mark current cell as visited
        visited.add(`${row},${col}`);

        // Check if we've reached the bottom edge
        if (row === this.rows - 1) {
            return true;
        }

        // Check all neighbors
        for (const [newRow, newCol] of this.getNeighbors(row, col)) {
            // If neighbor is white and unvisited, explore it
            if (!visited.has(`${newRow},${newCol}`) &&
                this.getCellState(newRow, newCol) === CELL_STATE.WHITE) {
                if (this.dfsWhite(newRow, newCol, visited)) {
                    return true;
                }
            }
        }

        return false;
    }

    findWinningMove(isBlue) {
        const winningMoves = [];
        const state = isBlue ? CELL_STATE.BLUE : CELL_STATE.WHITE;

        // Try each empty cell
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.getCellState(row, col) === CELL_STATE.EMPTY) {
                    // Try placing the piece
                    this.setCellState(row, col, state);

                    // Check if this creates a win
                    const isWinning = isBlue ? this.hasBlueWon() : this.hasWhiteWon();

                    // Reset the cell
                    this.setCellState(row, col, CELL_STATE.EMPTY);

                    if (isWinning) {
                        winningMoves.push([row, col]);
                    }
                }
            }
        }

        return winningMoves;
    }

    // Helper method to convert board position to letter
    getLetterForPosition(row, col) {
        const domRow = row + 1;
        const domCol = col + 1;
        const cell = document.querySelector(`tbody tr:nth-child(${domRow}) td:nth-of-type(${domCol}) span`); //first cell in row is <th>  so can't use nth-child 
        return cell ? cell.textContent : null;
    }

}
