const topicInput = document.getElementById("topic");
const levelInput = document.getElementById("level");
const generateBtn = document.getElementById("generateBtn");
const generatedArea = document.getElementById("generatedArea");
const loading = document.getElementById("loading");


/* =========================
   GENERATE LESSON
========================= */

generateBtn.addEventListener("click", generateLesson);

topicInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        generateLesson();
    }
});


async function generateLesson() {

    const topic = topicInput.value.trim();
    const level = levelInput.value;

    if (!topic) {
        topicInput.focus();

        topicInput.parentElement.style.borderColor = "#ef4444";

        setTimeout(() => {
            topicInput.parentElement.style.borderColor = "";
        }, 1200);

        return;
    }

    generatedArea.innerHTML = "";

    loading.classList.remove("hidden");

    generateBtn.disabled = true;

    try {

        const response = await fetch("/generate-lesson", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                topic: topic,
                level: level
            })
        });


        const data = await response.json();


        if (!response.ok || !data.success) {
            throw new Error(data.error || "Unable to generate lesson.");
        }


        displayLesson(data.lesson);

    } catch (error) {

        generatedArea.innerHTML = `
            <div class="error-box">
                <strong>Something went wrong.</strong><br><br>
                ${escapeHTML(error.message)}
            </div>
        `;

        console.error(error);

    } finally {

        loading.classList.add("hidden");

        generateBtn.disabled = false;
    }
}


/* =========================
   DISPLAY LESSON
========================= */

function displayLesson(lesson) {

    const keyPoints = Array.isArray(lesson.key_points)
        ? lesson.key_points
        : [];

    const flashcards = Array.isArray(lesson.flashcards)
        ? lesson.flashcards
        : [];

    const quiz = Array.isArray(lesson.quiz)
        ? lesson.quiz
        : [];


    let keyPointsHTML = keyPoints.map(point => `
        <li>${escapeHTML(point)}</li>
    `).join("");


    let flashcardsHTML = flashcards.map((card, index) => `
        <div class="flashcard" onclick="flipCard(this)">

            <div class="flashcard-inner">

                <div class="flashcard-front">

                    <h4>
                        ${escapeHTML(card.question)}
                    </h4>

                    <div class="flip-hint">
                        Tap to reveal answer ↻
                    </div>

                </div>

                <div class="flashcard-back">

                    <span>ANSWER</span>

                    <p>
                        ${escapeHTML(card.answer)}
                    </p>

                </div>

            </div>

        </div>
    `).join("");


    let quizHTML = quiz.map((question, index) => {

        const options = Array.isArray(question.options)
            ? question.options
            : [];

        const optionsHTML = options.map(option => `
            <button
                class="quiz-option"
                onclick="checkAnswer(this, ${index}, '${escapeAttribute(question.answer)}')"
            >
                ${escapeHTML(option)}
            </button>
        `).join("");


        return `
            <div class="quiz-question">

                <h4>
                    ${index + 1}. ${escapeHTML(question.question)}
                </h4>

                <div class="quiz-options">
                    ${optionsHTML}
                </div>

            </div>
        `;
    }).join("");


    generatedArea.innerHTML = `

        <div class="lesson-container">


            <!-- LESSON HEADER -->

            <div class="lesson-header">

                <div class="section-label">
                    YOUR AI LESSON
                </div>

                <h2>
                    ${escapeHTML(lesson.topic || topicInput.value)}
                </h2>

                <span class="lesson-level">
                    ${escapeHTML(lesson.level || levelInput.value)}
                </span>

            </div>


            <!-- EXPLANATION -->

            <div class="lesson-card">

                <h3>📖 Simple Explanation</h3>

                <p>
                    ${escapeHTML(lesson.explanation || "No explanation available.")}
                </p>

            </div>


            <!-- EXAMPLE -->

            <div class="lesson-card">

                <h3>🌍 Real-World Example</h3>

                <div class="example-box">
                    ${escapeHTML(lesson.example || "No example available.")}
                </div>

            </div>


            <!-- KEY POINTS -->

            <div class="lesson-card">

                <h3>💡 Key Points</h3>

                <ul class="key-points">
                    ${keyPointsHTML}
                </ul>

            </div>


            <!-- FLASHCARDS -->

            <div class="lesson-card">

                <h3>🔄 Interactive Flashcards</h3>

                <p style="margin-bottom:20px;">
                    Click a card to flip it and reveal the answer.
                </p>

                <div class="flashcards-grid">
                    ${flashcardsHTML}
                </div>

            </div>


            <!-- QUIZ -->

            <div class="lesson-card">

                <h3>🧠 Test Your Knowledge</h3>

                <p style="margin-bottom:20px;">
                    Choose the answer you think is correct.
                </p>

                <div class="quiz-container">

                    ${quizHTML}

                    <div id="quizResult"></div>

                </div>

            </div>


            <!-- ASK AI -->

            <div class="ask-ai-section">

                <h3>💬 Ask Your AI Tutor</h3>

                <p>
                    Still confused? Ask a follow-up question about
                    ${escapeHTML(lesson.topic || topicInput.value)}.
                </p>

                <div class="ask-box">

                    <input
                        type="text"
                        id="askInput"
                        placeholder="Ask anything about this topic..."
                    >

                    <button onclick="askAI()">
                        Ask AI →
                    </button>

                </div>

                <div id="aiAnswer"></div>

            </div>


        </div>
    `;


    generatedArea.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    setupAskAI();
}


/* =========================
   FLASHCARD
========================= */

function flipCard(card) {
    card.classList.toggle("flipped");
}


/* =========================
   QUIZ
========================= */

let quizAnswers = {};


function checkAnswer(button, questionIndex, correctAnswer) {

    const questionBox = button.closest(".quiz-question");

    if (questionBox.dataset.answered === "true") {
        return;
    }

    questionBox.dataset.answered = "true";

    const selectedAnswer = button.textContent.trim();

    const options = questionBox.querySelectorAll(".quiz-option");

    options.forEach(option => {

        const optionText = option.textContent.trim();

        if (optionText === correctAnswer.trim()) {
            option.classList.add("correct");
        }

    });


    if (selectedAnswer === correctAnswer.trim()) {

        button.classList.add("correct");

        quizAnswers[questionIndex] = true;

    } else {

        button.classList.add("wrong");

        quizAnswers[questionIndex] = false;

    }


    updateQuizScore();
}


function updateQuizScore() {

    const totalQuestions =
        document.querySelectorAll(".quiz-question").length;

    const answeredQuestions =
        document.querySelectorAll(
            '.quiz-question[data-answered="true"]'
        ).length;


    if (answeredQuestions !== totalQuestions) {
        return;
    }


    const correctAnswers =
        Object.values(quizAnswers).filter(value => value === true).length;


    const result = document.getElementById("quizResult");

    result.innerHTML = `
        <div class="quiz-result">

            <strong>
                ${correctAnswers} / ${totalQuestions}
            </strong>

            <span>
                Quiz completed! Keep learning and improving.
            </span>

        </div>
    `;
}


/* =========================
   ASK AI
========================= */

function setupAskAI() {

    const input = document.getElementById("askInput");

    if (!input) {
        return;
    }

    input.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            askAI();
        }

    });
}


async function askAI() {

    const input = document.getElementById("askInput");
    const answerBox = document.getElementById("aiAnswer");

    if (!input || !answerBox) {
        return;
    }


    const question = input.value.trim();

    if (!question) {
        input.focus();
        return;
    }


    answerBox.innerHTML = `
        <div class="ai-answer">
            ✦ AI is thinking...
        </div>
    `;


    try {

        const response = await fetch("/ask-ai", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                question: question,
                topic: topicInput.value.trim()
            })

        });


        const data = await response.json();


        if (!response.ok || !data.success) {
            throw new Error(
                data.error || "Unable to get an answer."
            );
        }


        answerBox.innerHTML = `
            <div class="ai-answer">
                ${formatAnswer(data.answer)}
            </div>
        `;


        input.value = "";


    } catch (error) {

        answerBox.innerHTML = `
            <div class="error-box">
                ${escapeHTML(error.message)}
            </div>
        `;

        console.error(error);
    }
}


/* =========================
   HELPERS
========================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return String(value || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


function formatAnswer(text) {

    return escapeHTML(text)
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n/g, "<br>");
}