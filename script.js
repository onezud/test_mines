// Словарь переводов
const translations = {
    "ru": {
        bombLabel: "Введите количество ловушек",
        signalButton: "Получить сигнал",
        loadingText: "Получение информации..."
    },
    "en": {
        bombLabel: "Enter the number of traps",
        signalButton: "Get Signal",
        loadingText: "Retrieving information..."
    }
};

// Функция для установки языка
function setLanguage() {
    const userLang = Telegram.WebApp.initDataUnsafe.user?.language_code || "en"; // По умолчанию английский
    const lang = translations[userLang] ? userLang : "en"; // Если язык не поддерживается, используем английский
    document.querySelector('.bomb-label').textContent = translations[lang].bombLabel;
    document.querySelector('.signal-button').textContent = translations[lang].signalButton;
    return translations[lang]; // Возвращаем текущий язык для использования в других местах
}

// Инициализация Telegram Web App и установка языка
Telegram.WebApp.ready();
const currentLang = setLanguage();

let bombCount = 1;

document.querySelector('.minus').addEventListener('click', () => {
    if (bombCount > 1) {
        bombCount -= 2;
        updateBombDisplay();
    }
});

document.querySelector('.plus').addEventListener('click', () => {
    if (bombCount < 7) {
        bombCount += 2;
        updateBombDisplay();
    }
});

function updateBombDisplay() {
    document.querySelector('.amount').textContent = `${bombCount} `;
}

document.querySelector('.signal-button').addEventListener('click', () => {
    const signalButton = document.querySelector('.signal-button');
    signalButton.textContent = currentLang.loadingText;
    signalButton.disabled = true;

    const delay = Math.random() * 1900 + 100;
    setTimeout(() => {
        placeSafeCells(bombCount);
    }, delay);
});

function placeSafeCells(count) {
    const buttons = Array.from(document.querySelectorAll('.button'));
    const totalButtons = buttons.length;

    buttons.forEach(button => {
        button.classList.remove('bomb', 'safe');
    });

    const safeCellsToOpen = getSafeCellsToOpen(count);
    const safeIndices = buttons.map((_, index) => index);
    const safeCellsToShow = [];
    while (safeCellsToShow.length < safeCellsToOpen && safeIndices.length > 0) {
        const randomIndex = Math.floor(Math.random() * safeIndices.length);
        safeCellsToShow.push(safeIndices.splice(randomIndex, 1)[0]);
    }

    safeCellsToShow.forEach((index, i) => {
        setTimeout(() => {
            buttons[index].classList.add('safe');
            if (i === safeCellsToShow.length - 1) {
                const signalButton = document.querySelector('.signal-button');
                signalButton.textContent = currentLang.signalButton;
                signalButton.disabled = false;
            }
        }, i * 200);
    });

    Telegram.WebApp.sendData(`Safe cells shown: ${safeCellsToShow.length}`);
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
