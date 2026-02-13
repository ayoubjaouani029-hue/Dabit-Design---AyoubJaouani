document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const gameTriggerBtn = document.getElementById('game-trigger-btn');
    const gameModal = document.getElementById('game-modal');
    const closeGameBtn = document.querySelector('.close-game');
    const gameContent = document.getElementById('game-content');
    
    // --- State ---
    let currentCategory = null;
    let currentQuestionsList = []; // Array of questions for the current session
    let currentQuestionIndex = 0;
    let scores = { creative: 0, structured: 0, analytical: 0, traditional: 0 }; // For personality
    let triviaScore = 0; // For trivia
    
    // --- Helper to get current language ---
    function getLang() {
        return document.body.classList.contains('lang-ar') ? 'ar' : 'en';
    }

    // --- Helper to get translation ---
    function t(key) {
        const lang = getLang();
        if (translations && translations[lang] && translations[lang][key]) {
            return translations[lang][key];
        }
        return key; // Fallback
    }

    // --- Event Listeners ---
    if (gameTriggerBtn) {
        gameTriggerBtn.addEventListener('click', openGame);
    }
    
    if (closeGameBtn) {
        closeGameBtn.addEventListener('click', closeGame);
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === gameModal) {
            closeGame();
        }
    });

    // --- Scroll Effect ---
    window.addEventListener('scroll', () => {
        const iconInfo = document.getElementById('game-trigger-icon');
        if (iconInfo) {
            if (window.scrollY > 100) {
                if (iconInfo.innerText !== '👾') {
                    iconInfo.style.transform = 'rotate(360deg) scale(0)';
                    setTimeout(() => {
                        iconInfo.innerText = '👾';
                        iconInfo.style.transform = 'rotate(0deg) scale(1)';
                    }, 200);
                }
            } else {
                if (iconInfo.innerText !== '🎮') {
                    iconInfo.style.transform = 'rotate(-360deg) scale(0)';
                    setTimeout(() => {
                        iconInfo.innerText = '🎮';
                        iconInfo.style.transform = 'rotate(0deg) scale(1)';
                    }, 200);
                }
            }
        }
    });

    // --- Functions ---
    function openGame() {
        gameModal.style.display = 'flex';
        setTimeout(() => {
            gameModal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
        
        renderCategorySelection();
    }

    function closeGame() {
        gameModal.classList.remove('active');
        setTimeout(() => {
            gameModal.style.display = 'none';
        }, 500);
        document.body.style.overflow = 'auto';
    }

    function resetGame() {
        currentQuestionIndex = 0;
        scores = { creative: 0, structured: 0, analytical: 0, traditional: 0 };
        triviaScore = 0;
        currentQuestionsList = prepareQuestions(currentCategory);
    }

    // --- Core Logic: Prepare Questions (Shuffle & Sort) ---
    function prepareQuestions(category) {
        const allQuestions = category.questions;
        
        // If personality mode, just return all questions (maybe minimal shuffle if desired, but default order is usually fine for personality)
        // Actually, user wants "random system" for the questions.
        if (category.mode === 'personality') {
            return shuffleArray([...allQuestions]); // Return random order but all of them
        }

        // Trivia Mode: Progression System (Easy -> Medium -> Hard)
        const easy = allQuestions.filter(q => q.difficulty === 'easy');
        const medium = allQuestions.filter(q => q.difficulty === 'medium');
        const hard = allQuestions.filter(q => q.difficulty === 'hard');

        // Shuffle each bucket
        const shuffledEasy = shuffleArray(easy);
        const shuffledMedium = shuffleArray(medium);
        const shuffledHard = shuffleArray(hard);

        // Concatenate in order
        const progression = [...shuffledEasy, ...shuffledMedium, ...shuffledHard];

        // Limit to 19 questions if we have more
        return progression.slice(0, 19);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function renderCategorySelection() {
        const lang = getLang();
        const categoriesHtml = gameData.map(cat => `
            <div class="category-card" data-id="${cat.id}">
                <div class="category-icon">${cat.icon}</div>
                <div class="category-title">${cat.title[lang]}</div>
            </div>
        `).join('');

        gameContent.innerHTML = `
            <div class="start-screen">
                <h2>${t('game_start_title')}</h2>
                <p>Select a topic to play:</p>
                <div class="category-grid">
                    ${categoriesHtml}
                </div>
            </div>
        `;
        
        // Add listeners
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const catId = card.getAttribute('data-id');
                currentCategory = gameData.find(c => c.id === catId);
                startGame();
            });
        });
    }

    function startGame() {
        resetGame();
        renderQuestion();
    }

    function renderQuestion() {
        if (currentQuestionIndex >= currentQuestionsList.length) {
            showResult();
            return;
        }

        const lang = getLang();
        const question = currentQuestionsList[currentQuestionIndex];
        const progress = ((currentQuestionIndex) / currentQuestionsList.length) * 100;

        // Get localized text
        const questionText = question.question[lang];
        const questionNumberText = t('game_question_progress');
        
        // Shuffle options for display
        // We create a shallow copy to shuffle so we don't mutate the original question reference permanently in a way that affects other logic if needed,
        // though for this game it wouldn't matter much.
        const shuffledOptions = shuffleArray([...question.options]);

        gameContent.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
            <div class="question-number">${questionNumberText} ${currentQuestionIndex + 1} / ${currentQuestionsList.length}</div>
            <h3 class="question-text">${questionText}</h3>
            <div class="options-grid">
                ${shuffledOptions.map((opt, index) => `
                    <button class="option-btn" 
                        data-is-correct="${opt.isCorrect || 'false'}" 
                        data-type="${opt.type || ''}" 
                        style="animation: fadeIn 0.5s ease ${index * 0.1}s backwards">
                        ${opt.text[lang]}
                    </button>
                `).join('')}
            </div>
        `;

        // Add Listeners to Options
        const options = document.querySelectorAll('.option-btn');
        options.forEach(btn => {
            btn.addEventListener('click', (e) => {
                handleAnswer(e.target); 
            });
        });
    }

    function handleAnswer(btnElement) {
        // Retrieve data from attributes
        const isCorrect = btnElement.getAttribute('data-is-correct') === 'true';
        const type = btnElement.getAttribute('data-type');

        if (currentCategory.mode === 'personality') {
            // Personality Mode
            if (scores[type] !== undefined) {
                scores[type]++;
            }
            nextQuestion();
        } else {
            // Trivia Mode
            if (isCorrect) {
                triviaScore++;
                btnElement.classList.add('correct');
            } else {
                btnElement.classList.add('wrong');
                // Highlight correct answer
                const allBtns = document.querySelectorAll('.option-btn');
                allBtns.forEach(btn => {
                    if (btn.getAttribute('data-is-correct') === 'true') {
                        btn.classList.add('correct');
                    }
                });
            }
            
            // Delay for feedback
            setTimeout(() => {
                nextQuestion();
            }, 1000);
        }
    }
    
    function nextQuestion() {
        currentQuestionIndex++;
        renderQuestion();
    }

    function showResult() {
        const lang = getLang();
        
        let resultTitle = "";
        let resultDesc = "";
        let resultColor = "#00ffff"; // Default
        let resultIcon = currentCategory.icon;

        if (currentCategory.mode === 'personality') {
             // Calculate max score
            let maxScore = 0;
            let resultType = 'creative'; 

            for (const [type, score] of Object.entries(scores)) {
                if (score > maxScore) {
                    maxScore = score;
                    resultType = type;
                }
            }
            const persona = personas[resultType];
            resultTitle = persona.title[lang];
            resultDesc = persona.description[lang];
            resultColor = persona.color;
            resultIcon = getIconForType(resultType);
        } else {
            // Trivia Result
            const total = currentQuestionsList.length;
            const percentage = (triviaScore / total) * 100;
            
            resultTitle = `${triviaScore} / ${total}`;
            if (percentage === 100) {
                resultDesc = lang === 'ar' ? "أنت عبقري! 🏆" : "You are a Genius! 🏆";
                resultColor = "#00ff00";
            } else if (percentage >= 50) {
                 resultDesc = lang === 'ar' ? "عمل جيد! 👍" : "Great job! 👍";
                 resultColor = "#00ffff";
            } else {
                 resultDesc = lang === 'ar' ? "حظاً أوفر في المرة القادمة! 😅" : "Better luck next time! 😅";
                 resultColor = "#ff0000";
            }
        }
        
        // Set result variable for glow
        const gameContainer = document.querySelector('.game-container');
        gameContainer.style.setProperty('--result-color', resultColor);

        const resultIntro = currentCategory.mode === 'personality' ? t('game_result_intro') : (lang === 'ar' ? "نتيجتك" : "Your Score");
        const restartBtnText = t('game_btn_restart');
        const closeBtnText = t('game_btn_close');

        gameContent.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar" style="width: 100%; background: ${resultColor}"></div>
            </div>
            <div class="result-screen">
                <div class="result-icon">${resultIcon}</div>
                <div class="question-number">${resultIntro}</div>
                <h3 class="result-title" style="color: ${resultColor}">${resultTitle}</h3>
                <p class="result-desc">${resultDesc}</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="game-btn" id="restart-game-btn" style="background: ${resultColor}">${restartBtnText}</button>
                    <button class="game-btn" onclick="document.querySelector('.close-game').click()" style="background: transparent; border: 1px solid ${resultColor}; color: #fff;">${closeBtnText}</button>
                </div>
            </div>
        `;

        document.getElementById('restart-game-btn').addEventListener('click', renderCategorySelection); // Go back to selection
    }

    function getIconForType(type) {
        switch(type) {
            case 'creative': return '🎨';
            case 'structured': return '📐';
            case 'analytical': return '🧠';
            case 'traditional': return '🖋️';
            default: return '✨';
        }
    }
});
