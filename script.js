const translations = {
    "ru": {
        bombLabel: "Введите количество ловушек",
        signalButton: "Получить сигнал",
        newGameButton: "Новая игра",
        loadingText: "Получение информации..."
    },
    "en": {
        bombLabel: "Enter the number of traps",
        signalButton: "Get Signal",
        newGameButton: "New Game",
        loadingText: "Retrieving information..."
    }
};

function setLanguage() {
    let userLang = "en";
    if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initDataUnsafe && Telegram.WebApp.initDataUnsafe.user) {
        userLang = Telegram.WebApp.initDataUnsafe.user.language_code || "en";
    }
    const lang = translations[userLang] ? userLang : "en";
    const bombLabel = document.querySelector('.bomb-label');
    const signalButton = document.querySelector('.signal-button');
    if (bombLabel) bombLabel.textContent = translations[lang].bombLabel;
    if (signalButton) signalButton.textContent = translations[lang].signalButton;
    return translations[lang];
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        Telegram.WebApp.ready();
    }

    const currentLang = setLanguage();

    let bombCount = 1;
    let isNewGame = false;

    const minusButton = document.querySelector('.minus');
    const plusButton = document.querySelector('.plus');
    const signalButton = document.querySelector('.signal-button');

    if (minusButton) {
        minusButton.addEventListener('click', () => {
            if (bombCount > 1) {
                bombCount -= 2;
                updateBombDisplay();
            }
        });
    }

    if (plusButton) {
        plusButton.addEventListener('click', () => {
            if (bombCount < 7) {
                bombCount += 2;
                updateBombDisplay();
            }
        });
    }

    function updateBombDisplay() {
        const amount = document.querySelector('.amount');
        if (amount) amount.textContent = `${bombCount} `;
    }

    if (signalButton) {
        signalButton.addEventListener('click', () => {
            const buttonGrid = document.querySelector('.button-grid');
            if (!buttonGrid) return;

            if (isNewGame) {
                const buttons = Array.from(document.querySelectorAll('.button'));
                buttons.forEach(button => button.classList.remove('bomb', 'safe'));
                signalButton.textContent = currentLang.signalButton;
                buttonGrid.classList.remove('loading');
                isNewGame = false;
                return;
            }

            buttonGrid.classList.add('loading');
            signalButton.textContent = currentLang.loadingText;
            signalButton.disabled = true;

            const delay = Math.random() * 1900 + 100;
            setTimeout(() => {
                placeSafeCells(bombCount);
            }, delay);
        });
    }

    function placeSafeCells(count) {
        const buttons = Array.from(document.querySelectorAll('.button'));
        const buttonGrid = document.querySelector('.button-grid');
        if (!buttonGrid) return;

        buttonGrid.classList.remove('loading');

        buttons.forEach(button => button.classList.remove('bomb', 'safe'));

        const safeCellsToOpen = getSafeCellsToOpen(count);
        const safeIndices = buttons.map((_, index) => index);
        const safeCellsToShow = [];
        while (safeCellsToShow.length < safeCellsToOpen && safeIndices.length > 0) {
            const randomIndex = Math.floor(Math.random() * safeIndices.length);
            safeCellsToShow.push(safeIndices.splice(randomIndex, 1)[0]);
        }

        if (safeCellsToShow.length === 0) {
            const signalButton = document.querySelector('.signal-button');
            if (signalButton) {
                signalButton.textContent = currentLang.signalButton;
                signalButton.disabled = false;
                isNewGame = false;
            }
            return;
        }

        safeCellsToShow.forEach((index, i) => {
            setTimeout(() => {
                buttons[index].classList.add('safe');
                if (i === safeCellsToShow.length - 1) {
                    const signalButton = document.querySelector('.signal-button');
                    if (signalButton) {
                        signalButton.textContent = currentLang.newGameButton;
                        signalButton.disabled = false;
                        isNewGame = true;
                    }
                }
            }, i * 700); // 700ms на ячейку (0.3s уменьшение + 0.4s рост)
        });

        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            Telegram.WebApp.sendData(`Safe cells shown: ${safeCellsToShow.length}`);
        }
    }

    function getSafeCellsToOpen(bombCount) {
        switch (bombCount) {
            case 1: return 10;
            case 3: return 5;
            case 5: return 4;
            case 7: return 3;
            default: return 0;
        }
    }

    updateBombDisplay(); // Инициализация начального значения
});
