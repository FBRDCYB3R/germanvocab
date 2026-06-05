let words = [];
let currentIndex = 0;

const flashcard = document.getElementById('flashcard');
const germanWordEl = document.getElementById('german-word');
const englishMeaningEl = document.getElementById('english-meaning');
const pronunciationEl = document.getElementById('pronunciation');
const progressText = document.getElementById('progress-text');
const wordCountText = document.getElementById('word-count');

// Fetch words from the JSON file
async function loadWords() {
    try {
        const response = await fetch('words.json');
        words = await response.json();
        wordCountText.innerText = words.length;
        updateCard();
    } catch (error) {
        germanWordEl.innerText = "Error loading words.json";
        console.error("Failed to load vocabulary:", error);
    }
}

function updateCard() {
    if (words.length === 0) return;
    
    // Ensure card is showing the front before updating text
    flashcard.classList.remove('flipped');
    
    // Small timeout to allow the flip animation to finish before swapping text
    setTimeout(() => {
        const currentWord = words[currentIndex];
        germanWordEl.innerText = currentWord.german;
        englishMeaningEl.innerText = currentWord.english;
        pronunciationEl.innerText = `[ ${currentWord.pronunciation} ]`;
        
        progressText.innerText = `${currentIndex + 1} / ${words.length}`;
    }, 150);
}

// Event Listeners
flashcard.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        updateCard();
    }
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCard();
    }
});

document.getElementById('shuffle-btn').addEventListener('click', () => {
    // Fisher-Yates shuffle algorithm
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }
    currentIndex = 0;
    updateCard();
});

// Initialize
loadWords();
