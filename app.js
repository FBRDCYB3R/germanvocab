let words = [];
let flashcardIndex = 0;

// Quiz Variables
let quizQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
const QUIZ_LENGTH = 10;

// Elements - Global
const wordCountText = document.getElementById('word-count');
const tabStudy = document.getElementById('tab-study');
const tabQuiz = document.getElementById('tab-quiz');
const tabList = document.getElementById('tab-list');
const studySection = document.getElementById('study-section');
const quizSection = document.getElementById('quiz-section');
const listSection = document.getElementById('list-section');

// Elements - Flashcards
const flashcard = document.getElementById('flashcard');
const germanWordEl = document.getElementById('german-word');
const englishMeaningEl = document.getElementById('english-meaning');
const pronunciationEl = document.getElementById('pronunciation');
const progressText = document.getElementById('progress-text');

// Elements - Quiz
const quizSetup = document.getElementById('quiz-setup');
const quizActive = document.getElementById('quiz-active');
const quizResults = document.getElementById('quiz-results');
const quizQuestionEl = document.getElementById('quiz-question');
const quizOptionsEl = document.getElementById('quiz-options');
const quizProgressText = document.getElementById('quiz-progress-text');
const quizScoreEl = document.getElementById('quiz-score');
const quizTotalEl = document.getElementById('quiz-total');

// Elements - List
const searchInput = document.getElementById('search-input');
const wordListContainer = document.getElementById('word-list');

// --- INITIALIZATION ---
async function loadWords() {
    try {
        const response = await fetch('words.json');
        words = await response.json();
        wordCountText.innerText = words.length;
        updateCard();
        renderList(); // Render dictionary list
    } catch (error) {
        germanWordEl.innerText = "Error loading words.json";
        console.error("Failed to load vocabulary:", error);
    }
}

// --- TAB SWITCHING ---
function hideAllSections() {
    studySection.style.display = 'none';
    quizSection.style.display = 'none';
    listSection.style.display = 'none';
    tabStudy.classList.remove('active');
    tabQuiz.classList.remove('active');
    tabList.classList.remove('active');
}

tabStudy.addEventListener('click', () => {
    hideAllSections();
    tabStudy.classList.add('active');
    studySection.style.display = 'flex';
});

tabQuiz.addEventListener('click', () => {
    hideAllSections();
    tabQuiz.classList.add('active');
    quizSection.style.display = 'flex';
    quizSetup.style.display = 'flex';
    quizActive.style.display = 'none';
    quizResults.style.display = 'none';
});

tabList.addEventListener('click', () => {
    hideAllSections();
    tabList.classList.add('active');
    listSection.style.display = 'flex';
    searchInput.focus(); // Auto-focus the search bar when opening list
});

// --- FLASHCARD LOGIC ---
function updateCard() {
    if (words.length === 0) return;
    flashcard.classList.remove('flipped');
    setTimeout(() => {
        const currentWord = words[flashcardIndex];
        germanWordEl.innerText = currentWord.german;
        englishMeaningEl.innerText = currentWord.english;
        pronunciationEl.innerText = `[ ${currentWord.pronunciation} ]`;
        progressText.innerText = `${flashcardIndex + 1} / ${words.length}`;
    }, 150);
}

flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));
document.getElementById('next-btn').addEventListener('click', () => {
    if (flashcardIndex < words.length - 1) { flashcardIndex++; updateCard(); }
});
document.getElementById('prev-btn').addEventListener('click', () => {
    if (flashcardIndex > 0) { flashcardIndex--; updateCard(); }
});
document.getElementById('shuffle-btn').addEventListener('click', () => {
    words = shuffleArray([...words]);
    flashcardIndex = 0;
    updateCard();
});

// --- QUIZ LOGIC ---
document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
document.getElementById('restart-quiz-btn').addEventListener('click', startQuiz);

function startQuiz() {
    if (words.length < 4) {
        alert("You need at least 4 words in your vocabulary list to generate a quiz!");
        return;
    }
    score = 0;
    currentQuestionIndex = 0;
    let shuffledWords = shuffleArray([...words]);
    let maxQuestions = Math.min(QUIZ_LENGTH, words.length);
    quizQuestions = shuffledWords.slice(0, maxQuestions);
    
    quizTotalEl.innerText = maxQuestions;
    quizSetup.style.display = 'none';
    quizResults.style.display = 'none';
    quizActive.style.display = 'flex';

    loadQuizQuestion();
}

function loadQuizQuestion() {
    quizOptionsEl.innerHTML = ''; 
    const currentWord = quizQuestions[currentQuestionIndex];
    quizProgressText.innerText = `Question ${currentQuestionIndex + 1} / ${quizQuestions.length}`;
    quizQuestionEl.innerText = currentWord.german;

    let options = [currentWord.english];
    let distractors = words.filter(w => w.english !== currentWord.english);
    distractors = shuffleArray(distractors);
    
    for (let i = 0; i < 3 && i < distractors.length; i++) {
        options.push(distractors[i].english);
    }

    options = shuffleArray(options);

    options.forEach(optionText => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = optionText;
        btn.addEventListener('click', () => handleAnswer(btn, optionText, currentWord.english));
        quizOptionsEl.appendChild(btn);
    });
}

function handleAnswer(selectedBtn, selectedText, correctText) {
    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(btn => btn.disabled = true);

    if (selectedText === correctText) {
        selectedBtn.classList.add('correct');
        score++;
    } else {
        selectedBtn.classList.add('wrong');
        allBtns.forEach(btn => {
            if (btn.innerText === correctText) btn.classList.add('correct');
        });
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizQuestions.length) {
            loadQuizQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

function endQuiz() {
    quizActive.style.display = 'none';
    quizResults.style.display = 'flex';
    quizScoreEl.innerText = score;
}

// --- LIST & SEARCH LOGIC ---
function renderList(filterText = '') {
    wordListContainer.innerHTML = ''; // Clear current list
    
    // Convert filter text to lowercase for case-insensitive matching
    const query = filterText.toLowerCase();

    // Filter the original array
    const filteredWords = words.filter(word => {
        return word.german.toLowerCase().includes(query) || 
               word.english.toLowerCase().includes(query);
    });

    // Generate HTML for each matching word
    filteredWords.forEach(word => {
        const row = document.createElement('div');
        row.classList.add('list-item');
        
        row.innerHTML = `
            <span class="de">${word.german}</span>
            <span class="en">${word.english}</span>
            <span class="pron">[ ${word.pronunciation} ]</span>
        `;
        
        wordListContainer.appendChild(row);
    });
}

// Listen for typing in the search bar
searchInput.addEventListener('input', (e) => {
    renderList(e.target.value);
});

// --- UTILITIES ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Start
loadWords();
