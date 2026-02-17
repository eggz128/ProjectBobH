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

        const triviaHtml = questionData.trivia ?
            `<div class="trivia-text">Trivia: ${questionData.trivia}</div>` : '';

        const countsHtml = counts ?
            `<div class="question-counts">Questions for this letter: ${counts.total} (${counts.unused} available)</div>` : '';

        this.container.innerHTML = `
            <div class="question-card">
                <div class="question-header">Q: ${questionData.question}</div>
                <div class="answer-text">A: ${questionData.answer}</div>
                ${triviaHtml}
                ${countsHtml}
            </div>
            <div class="question-controls">
                <button id="next-question-btn" class="btn btn-secondary">Next Question</button>
            </div>
        `;
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
