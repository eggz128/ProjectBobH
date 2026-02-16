import { BlockbustersGame } from './BlockbustersGame.js';
import { ALPHABETS, CELL_STATE } from './constants.js';
import { QuestionDisplay } from './QuestionDisplay.js';

const game = new BlockbustersGame();
const questionDisplay = new QuestionDisplay('question-display-panel');

function init() {
    game.init();

    // Wire up question selection callback
    game.onQuestionSelected = (questionData) => {
        questionDisplay.showQuestion(questionData);
    };
}

function initEn() {
    game.alphabet = ALPHABETS.EN;
    game.init();
}

function initCy() {
    game.alphabet = ALPHABETS.CY;
    game.init();
}

function randomBoard() {
    game.startShowtime();
}

function stopRandom() {
    game.stopRandom();
}

function resetBlueScore() {
    game.resetScore('blue');
}

function resetWhiteScore() {
    game.resetScore('white');
}

// Bind event listeners to DOM elements
document.addEventListener('DOMContentLoaded', () => {
    init();

    const resetEnBtn = document.getElementById('reset-en');
    if (resetEnBtn) resetEnBtn.addEventListener('click', initEn);

    const resetCyBtn = document.getElementById('reset-cy');
    if (resetCyBtn) resetCyBtn.addEventListener('click', initCy);

    const randomBtn = document.getElementById('random-board');
    if (randomBtn) randomBtn.addEventListener('click', randomBoard);

    const stopRandomBtn = document.getElementById('stop-random');
    if (stopRandomBtn) stopRandomBtn.addEventListener('click', stopRandom);

    const resetBlueBtn = document.getElementById('reset-blue-score');
    if (resetBlueBtn) resetBlueBtn.addEventListener('click', resetBlueScore);

    const resetWhiteBtn = document.getElementById('reset-white-score');
    if (resetWhiteBtn) resetWhiteBtn.addEventListener('click', resetWhiteScore);

    const whiteScoreBtn = document.getElementById('white-score-btn');
    if (whiteScoreBtn) whiteScoreBtn.addEventListener('click', () => {
        game.captureActiveCell(CELL_STATE.WHITE);
    });

    const blueScoreBtn = document.getElementById('blue-score-btn');
    if (blueScoreBtn) blueScoreBtn.addEventListener('click', () => {
        game.captureActiveCell(CELL_STATE.BLUE);
    });

    // Quizmaster Controls
    const csvUpload = document.getElementById('csv-upload');
    if (csvUpload) {
        csvUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader()
            reader.onload = (event) => {
                game.loadQuestions(event.target.result);
            };
            reader.readAsText(file);
            //Hide the questions panel on initial csv load to avoid spoiling questions
            questionDisplay.hide();
        });
    }

    const quizmasterToggle = document.getElementById('quizmaster-toggle');
    if (quizmasterToggle) {
        quizmasterToggle.addEventListener('change', (e) => {
            questionDisplay.setQuizmasterMode(e.target.checked);
        });
    }

    const resetBtn = document.getElementById('reset');
    if (resetBtn) resetBtn.addEventListener('click', init);

    // Delegate click for dynamically added buttons (like "Next Question")
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'next-question-btn') {
            const nextQ = game.nextQuestionForActive();
            questionDisplay.showQuestion(nextQ);
        }
    });
});
