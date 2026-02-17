export class QuestionDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isVisible = false;
    }

    setQuizmasterMode(enabled) {
        this.isVisible = enabled;
        if (!enabled) {
            this.hide();
        } else {
            this.container.style.display = 'block';
        }
    }

    showQuestion(questionData, counts) {
        if (!questionData) {
            this.container.innerHTML = '<div class="no-question">No questions available</div>';
            return;
        }

        // Clear existing content before rendering a new question
        this.container.innerHTML = '';
        // Create question card
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        const questionHeader = document.createElement('div');
        questionHeader.className = 'question-header';
        questionHeader.textContent = 'Q: ' + (questionData.question || '');
        questionCard.appendChild(questionHeader);
        const answerText = document.createElement('div');
        answerText.className = 'answer-text';
        answerText.textContent = 'A: ' + (questionData.answer || '');
        questionCard.appendChild(answerText);
        if (questionData.trivia) {
            const triviaDiv = document.createElement('div');
            triviaDiv.className = 'trivia-text';
            triviaDiv.textContent = 'Trivia: ' + questionData.trivia;
            questionCard.appendChild(triviaDiv);
        }
        if (counts) {
            const countsDiv = document.createElement('div');
            countsDiv.className = 'question-counts';
            countsDiv.textContent = `Questions for this letter: ${counts.total} (${counts.unused} available)`;
            questionCard.appendChild(countsDiv);
        }
        this.container.appendChild(questionCard);
        // Create controls
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'question-controls';
        const nextButton = document.createElement('button');
        nextButton.id = 'next-question-btn';
        nextButton.className = 'btn btn-secondary';
        nextButton.textContent = 'Next Question';
        controlsDiv.appendChild(nextButton);
        this.container.appendChild(controlsDiv);
    }

    updateBankTotal(count) {
        const bankStatus = document.getElementById('bank-status');
        if (bankStatus) {
            bankStatus.innerText = `Questions loaded: ${count}`;
        }
    }

    hide() {
        if (this.container) {
            this.container.innerHTML = '';
            this.container.style.display = 'none';
        }
    }
}
