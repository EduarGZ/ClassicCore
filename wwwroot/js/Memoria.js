// ================================================
// 🧩 Juego de Memoria - Adaptado para Blazor Hybrid
// ================================================

const totalCards = 16;
const availableCards = [
    'imagenes/carta1.jpg', 'imagenes/carta2.jpg', 'imagenes/carta3.jpg', 'imagenes/carta4.jpg',
    'imagenes/carta5.jpg', 'imagenes/carta6.jpg', 'imagenes/carta7.jpg', 'imagenes/carta8.jpg'
];

let cards = [];
let selectedCards = [];
let valuesUsed = [];
let currentMove = 0;
let currentAttempts = 0;
let matches = 0;

let gameContainer;
let stats;
let mensajeGanador;
let reiniciarBtn;
let volverBtn;

let cardTemplate = `
    <div class="card">
        <div class="back"></div>
        <div class="face"></div>
    </div>
`;

// ====================
// 🎮 Función principal
// ====================
function initGame() {
    // 🔹 Obtener referencias después de que Blazor renderice el DOM
    gameContainer = document.querySelector('#game');
    stats = document.querySelector('#stats');
    mensajeGanador = document.querySelector('#mensajeGanador');
    reiniciarBtn = document.querySelector('#reiniciar');
    volverBtn = document.querySelector('#volver');

    // 🔹 Si los elementos no están listos aún (por render), esperar un poco
    if (!gameContainer || !reiniciarBtn || !volverBtn) {
        setTimeout(initGame, 100);
        return;
    }

    // 🔹 Reinicia variables
    gameContainer.style.display = 'grid';
    gameContainer.innerHTML = '';
    mensajeGanador.style.display = 'none';
    cards = [];
    selectedCards = [];
    valuesUsed = [];
    currentMove = 0;
    currentAttempts = 0;
    matches = 0;
    stats.innerHTML = '0 intentos';

    // 🔹 Crea las cartas dinámicamente
    for (let i = 0; i < totalCards; i++) {
        let div = document.createElement('div');
        div.innerHTML = cardTemplate;
        cards.push(div);
        gameContainer.append(cards[i]);
        randomValue();

        const imgPath = getFaceValue(valuesUsed[i]);
        cards[i].querySelector('.face').innerHTML = `<img src="${imgPath}" alt="carta" />`;

        // Agrega evento de clic para voltear
        cards[i].querySelector('.card').addEventListener('click', activate);
    }

    // 🔹 Eventos globales
    reiniciarBtn.onclick = initGame;
    volverBtn.onclick = () => window.history.back();
}

// ====================
// 🔄 Función de activar carta
// ====================
function activate(e) {
    if (currentMove < 2) {
        const target = e.currentTarget;
        if ((!selectedCards[0] || selectedCards[0] !== target) && !target.classList.contains('active')) {
            target.classList.add('active');
            selectedCards.push(target);

            if (++currentMove === 2) {
                currentAttempts++;
                stats.innerHTML = currentAttempts + ' intentos';

                const val1 = selectedCards[0].querySelector('.face img').src;
                const val2 = selectedCards[1].querySelector('.face img').src;

                if (val1 === val2) {
                    matches++;
                    selectedCards = [];
                    currentMove = 0;

                    // ✅ Verificar si ganó
                    if (matches === totalCards / 2) {
                        setTimeout(() => mostrarGanador(), 500);
                    }
                } else {
                    setTimeout(() => {
                        selectedCards[0].classList.remove('active');
                        selectedCards[1].classList.remove('active');
                        selectedCards = [];
                        currentMove = 0;
                    }, 600);
                }
            }
        }
    }
}

// ====================
// 🎲 Funciones auxiliares
// ====================
function randomValue() {
    let rnd = Math.floor(Math.random() * totalCards * 0.5);
    let values = valuesUsed.filter(value => value === rnd);
    if (values.length < 2) {
        valuesUsed.push(rnd);
    } else {
        randomValue();
    }
}

function getFaceValue(value) {
    return availableCards[value] || value;
}

// ====================
// 🏆 Mostrar mensaje de ganador
// ====================
function mostrarGanador() {
    gameContainer.style.display = 'none';
    mensajeGanador.style.display = 'flex';
    stats.innerHTML = `🎯 Lo lograste en ${currentAttempts} intentos`;
}

// ====================
// 🌐 Exponer la función principal al global
// ====================
window.initGame = initGame;
