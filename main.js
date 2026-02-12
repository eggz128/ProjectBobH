import { BlockbustersGame } from './BlockbustersGame.js';
import { ALPHABETS } from './constants.js';

const game = new BlockbustersGame();

function init() {
    game.init();
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
});
