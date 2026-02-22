import { BlockbustersGame } from './BlockbustersGame.js';
import { GoldrunGame } from './GoldrunGame.js';
import { ALPHABETS, CELL_STATE } from './constants.js';
import { QuestionDisplay } from './QuestionDisplay.js';

const baseGame = new BlockbustersGame();
const goldrunGame = new GoldrunGame();
let currentGame = baseGame;

const questionDisplay = new QuestionDisplay('question-display-panel');

function init() {
    currentGame.init();

    // Wire up question selection callback
    baseGame.onQuestionSelected = (questionData, counts) => {
        questionDisplay.showQuestion(questionData, counts);
    };
    goldrunGame.onQuestionSelected = (questionData, counts) => {
        questionDisplay.showQuestion(questionData, counts, true);
    };
}

function initEn() {
    currentGame.alphabet = ALPHABETS.EN;
    currentGame.init();
}

function initCy() {
    currentGame.alphabet = ALPHABETS.CY;
    currentGame.init();
}

function randomBoard() {
    currentGame.startShowtime();
}

function stopRandom() {
    currentGame.stopRandom();
}

function resetBlueScore() {
    currentGame.resetScore('blue');
}

function resetWhiteScore() {
    currentGame.resetScore('white');
}

function resetAllQuestions() {
    currentGame.resetAllQuestions();
}

function switchGame(toGame, showButtonId, hideButtonId) {
    const qManager = currentGame.questionManager;
    const alphabet = currentGame.alphabet;
    const blueScore = currentGame.blueScore;
    const whiteScore = currentGame.whiteScore;

    if (currentGame.cleanup) currentGame.cleanup();

    currentGame = toGame;
    currentGame.questionManager = qManager;
    currentGame.alphabet = alphabet;
    currentGame.blueScore = blueScore;
    currentGame.whiteScore = whiteScore;
    currentGame.init();

    const showButton = document.getElementById(showButtonId);
    if (showButton) {
        showButton.style.display = 'inline-block';
    }

    const hideButton = document.getElementById(hideButtonId);
    if (hideButton) {
        hideButton.style.display = 'none';
    }
}

function startGoldrun() {
    switchGame(goldrunGame, 'exit-goldrun', 'start-goldrun');
}

function exitGoldrun() {
    switchGame(baseGame, 'start-goldrun', 'exit-goldrun');
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

    const startGoldrunBtn = document.getElementById('start-goldrun');
    if (startGoldrunBtn) startGoldrunBtn.addEventListener('click', startGoldrun);

    const exitGoldrunBtn = document.getElementById('exit-goldrun');
    if (exitGoldrunBtn) exitGoldrunBtn.addEventListener('click', exitGoldrun);

    const resetBlueBtn = document.getElementById('reset-blue-score');
    if (resetBlueBtn) resetBlueBtn.addEventListener('click', resetBlueScore);

    const resetWhiteBtn = document.getElementById('reset-white-score');
    if (resetWhiteBtn) resetWhiteBtn.addEventListener('click', resetWhiteScore);

    const whiteScoreBtn = document.getElementById('white-score-btn');
    if (whiteScoreBtn) whiteScoreBtn.addEventListener('click', () => {
        currentGame.captureActiveCell(CELL_STATE.WHITE);
    });

    const blueScoreBtn = document.getElementById('blue-score-btn');
    if (blueScoreBtn) blueScoreBtn.addEventListener('click', () => {
        currentGame.captureActiveCell(CELL_STATE.BLUE);
    });

    // Quizmaster Controls
    const csvUpload = document.getElementById('csv-upload');
    if (csvUpload) {
        csvUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                currentGame.loadQuestions(event.target.result);
                // Also assign to the other instance so both game modes share the same questionManager (synchronized question state)
                const otherGame = currentGame === baseGame ? goldrunGame : baseGame;
                otherGame.questionManager = currentGame.questionManager;
                otherGame.alphabet = currentGame.alphabet;

                questionDisplay.updateBankTotal(currentGame.questionManager.getTotalQuestionCount());
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

    const resetBoardBtn = document.getElementById('reset-board');
    if (resetBoardBtn) resetBoardBtn.addEventListener('click', init);

    const resetQuestionsBtn = document.getElementById('reset-questions');
    if (resetQuestionsBtn) resetQuestionsBtn.addEventListener('click', resetAllQuestions);

    // Delegate click for dynamically added buttons (like "Next Question")
    document.body.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'next-question-btn') {
            const result = currentGame.nextQuestionForActive();
            if (result) {
                questionDisplay.showQuestion(result.question, result.counts);
            }
        }
        if (e.target && e.target.id === 'pass-question-btn') {
            if (currentGame instanceof GoldrunGame) {
                currentGame.passActiveCell();
            }
        }
    });

    window.addEventListener("keydown", (e) => {
        if (currentGame) {
            currentGame.handleKeyPress(e);
        }
    });

    // Theme switching logic
    const themeStylesheet = document.getElementById('theme-stylesheet');
    const themeSelector = document.getElementById('theme-selector');
    const customThemeUpload = document.getElementById('custom-theme-upload');
    let customThemeUrl = null;

    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'custom') {
                customThemeUpload.style.display = 'block';
                // Do not change href until a file is loaded
            } else {
                customThemeUpload.style.display = 'none';
                themeStylesheet.href = val;
            }
        });
    }

    if (customThemeUpload) {
        customThemeUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Revoke old URL to avoid memory leaks
            if (customThemeUrl) {
                URL.revokeObjectURL(customThemeUrl);
            }

            customThemeUrl = URL.createObjectURL(file);
            themeStylesheet.href = customThemeUrl;
        });
    }
});
