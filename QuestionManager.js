export class QuestionManager {
    constructor() {
        this.parsedData = {
            language: "",
            letters: [],
            questionbank: {}
        };
        this.selectedQuestions = {};
        this.usedQuestionIds = new Set();
        this.activeLetter = null;
    }

    loadFromCSV(csvText) {
        const rows = this.parseCSVInternal(csvText);

        if (rows.length < 2) {
            throw new Error("CSV file appears to be empty or invalid.");
        }

        // Reset data
        this.parsedData = {
            language: "",
            letters: [],
            questionbank: {}
        };
        this.selectedQuestions = {};
        this.usedQuestionIds = new Set();
        this.activeLetter = null;

        // Row 1 contains metadata
        if (rows[1] && rows[1].length >= 2) {
            this.parsedData.language = rows[1][0];
            const lettersStr = rows[1][1];
            this.parsedData.letters = lettersStr.split(',').map(l => l.trim()).filter(l => l);
        }

        // Process rows
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 5) continue;

            const id = row[2];
            const letter = row[3];
            const question = row[4];
            const answer = row.length > 5 ? row[5] : ""; // Answer is optional
            const trivia = row.length > 6 ? row[6] : ""; // Trivia is optional

            if (id && letter && question) { // Skip rows without ID, letter, and question. Answer and Trivia are optional.
                if (!this.parsedData.questionbank[letter]) {
                    this.parsedData.questionbank[letter] = [];
                }

                this.parsedData.questionbank[letter].push({
                    id,
                    question,
                    answer,
                    trivia
                });
            }
        }

        // Use keys if no letters defined
        if (this.parsedData.letters.length === 0) {
            this.parsedData.letters = Object.keys(this.parsedData.questionbank).sort();
        }

        return this.parsedData.letters;
    }

    parseCSVInternal(text) {
        const result = [];
        let currentRow = [];
        let currentField = '';
        let inQuotes = false;

        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                currentRow.push(currentField);
                currentField = '';
            } else if (char === '\n' && !inQuotes) {
                currentRow.push(currentField);
                result.push(currentRow);
                currentRow = [];
                currentField = '';
            } else {
                currentField += char;
            }
        }

        if (currentField || currentRow.length > 0) {
            currentRow.push(currentField);
            result.push(currentRow);
        }

        return result;
    }

    getQuestionForLetter(letter) {
        // Return existing selected question if available
        if (this.selectedQuestions[letter]) {
            return this.selectedQuestions[letter];
        }

        // Otherwise pick a new one
        const question = this.pickRandomQuestion(letter);
        if (question) {
            this.selectedQuestions[letter] = question;
            // No longer marking as used here automatically
            return question;
        }

        return null;
    }

    pickRandomQuestion(letter) {
        const pool = this.parsedData.questionbank[letter] || [];
        const unused = pool.filter(q => !this.usedQuestionIds.has(q.id));

        if (unused.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * unused.length);
        return unused[randomIndex];
    }

    nextQuestion(letter) {
        // Force pick a new question for this letter
        const question = this.pickRandomQuestion(letter);
        if (question) {
            this.selectedQuestions[letter] = question;
            // No longer marking as used here automatically
            return question;
        }
        return null;
    }

    markAsUsed(letter) {
        const question = this.selectedQuestions[letter];
        if (question) {
            this.usedQuestionIds.add(question.id);
        }
    }

    resetCurrentSelection() {
        this.selectedQuestions = {};
    }

    resetUsed() {
        this.usedQuestionIds = new Set();
        this.selectedQuestions = {};
    }

    hasQuestions() {
        return Object.keys(this.parsedData.questionbank).length > 0;
    }

    getTotalQuestionCount() {
        return Object.values(this.parsedData.questionbank).reduce((acc, current) => acc + current.length, 0);
    }

    getCountsForLetter(letter) {
        const total = this.parsedData.questionbank[letter] ? this.parsedData.questionbank[letter].length : 0;
        const used = [...this.usedQuestionIds].filter(id => {
            return this.parsedData.questionbank[letter] && this.parsedData.questionbank[letter].some(q => q.id === id);
        }).length;
        return {
            total: total,
            unused: total - used
        };
    }
}
