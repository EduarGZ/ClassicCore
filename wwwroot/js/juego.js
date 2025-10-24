//original
//board
let cherryImage;
let scaredGhostImage;
let board;
let rowCount = 21;
let columnCount = 19;
let tileSize = 34;
let boardWidth = columnCount * tileSize;
let boardHeight = rowCount * tileSize;
let context;

let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
let pacmanUpImage;
let pacmanDownImage;
let pacmanLeftImage;
let pacmanRightImage;
let wallImage;

//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX"
];

const walls = new Set();
const foods = new Set();
const ghosts = new Set();
let pacman;

const directions = ['U', 'D', 'L', 'R']; //up down left right
let score = 0;
let lives = 3;
let gameOver = false;
let cherry = null; // Definición movida aquí para consistencia

// Ajustar tamaño global según ancho de pantalla
function ajustarTamañoPantalla() {
    const ancho = window.innerWidth;

    if (ancho <= 360) {          // teléfonos pequeños (tu caso)
        tileSize = 20;
        boardWidth = columnCount * tileSize;
        boardHeight = rowCount * tileSize;// ajusta este número si aún se corta un poco
    } else {
        tileSize = 34; // Restaura a valor original si la pantalla es grande
        boardWidth = columnCount * tileSize;
        boardHeight = rowCount * tileSize;
    }
}


function startPacman() {
    // 1) Ajustar tamaño antes de cargar mapa
    ajustarTamañoPantalla();

    // 2) Obtener canvas
    board = document.getElementById("board");
    if (!board) {
        console.error("El elemento 'board' no se encontró. Blazor no lo ha renderizado aún.");
        return;
    }

    // 3) Ajustar tamaño del canvas según tileSize
    board.width = columnCount * tileSize;
    board.height = rowCount * tileSize;
    context = board.getContext("2d");

    // 4) Cargar imágenes y mapa
    loadImages();
    loadMap();
    placeCherry();
    resetPositions();

    // 5) Iniciar loop del juego una sola vez
    if (!startPacman._started) {
        startPacman._started = true;
        for (let ghost of ghosts.values()) {
            const newDirection = directions[Math.floor(Math.random() * 4)];
            ghost.updateDirection(newDirection);
        }
        update();
        document.addEventListener("keydown", movePacman);

        // AÑADIDO: Inicializar los listeners de los botones táctiles aquí
        setupMobileControls();
    }
}


function loadImages() {
    wallImage = new Image();
    wallImage.src = "imagenes/wall.png";

    cherryImage = new Image();
    cherryImage.src = "imagenes/cherry.png";

    scaredGhostImage = new Image();
    scaredGhostImage.src = "imagenes/scaredGhost.png";

    blueGhostImage = new Image();
    blueGhostImage.src = "imagenes/blueGhost.png";
    orangeGhostImage = new Image();
    orangeGhostImage.src = "imagenes/orangeGhost.png"
    pinkGhostImage = new Image()
    pinkGhostImage.src = "imagenes/pinkGhost.png";
    redGhostImage = new Image()
    redGhostImage.src = "imagenes/redGhost.png";

    pacmanUpImage = new Image();
    pacmanUpImage.src = "imagenes/pacmanUp.png";
    pacmanDownImage = new Image();
    pacmanDownImage.src = "imagenes/pacmanDown.png";
    pacmanLeftImage = new Image();
    pacmanLeftImage.src = "imagenes/pacmanLeft.png";
    pacmanRightImage = new Image();
    pacmanRightImage.src = "imagenes/pacmanRight.png";
}

function loadMap() {
    walls.clear();
    foods.clear();
    ghosts.clear();

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
            const row = tileMap[r];
            const tileMapChar = row[c];

            const x = c * tileSize;
            const y = r * tileSize;

            if (tileMapChar == 'X') { // bloque pared
                const wall = new Block(wallImage, x, y, tileSize, tileSize);
                walls.add(wall);
            }
            else if (tileMapChar == 'b') { // fantasma azul
                const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
                ghost.originalImage = blueGhostImage;
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'o') { // fantasma naranja
                const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
                ghost.originalImage = orangeGhostImage;
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'p') { // fantasma rosa
                const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
                ghost.originalImage = pinkGhostImage;
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'r') { // fantasma rojo
                const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
                ghost.originalImage = redGhostImage;
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'P') { // Pac-Man
                pacman = new Block(pacmanRightImage, x, y, tileSize, tileSize);
            }
            else if (tileMapChar.trim() === '') { // comida
                const foodSize = Math.floor(tileSize / 8);
                const offset = Math.floor((tileSize - foodSize) / 2);
                const food = new Block(null, x + offset, y + offset, foodSize, foodSize);
                foods.add(food);
            }
        }
    }

    // Colocar la cereza al inicio del mapa
    placeCherry();
}


function update() {
    if (gameOver) {
        return;
    }
    move();
    draw();
    setTimeout(update, 50); //1000/50 = 20 FPS
}


function draw() {
    context.clearRect(0, 0, board.width, board.height);

    // Pac-Man
    context.drawImage(pacman.image, pacman.x, pacman.y, tileSize, tileSize);

    // Fantasmas
    for (let ghost of ghosts.values()) {
        context.drawImage(ghost.image, ghost.x, ghost.y, tileSize, tileSize);
    }

    // Paredes
    for (let wall of walls.values()) {
        context.drawImage(wall.image, wall.x, wall.y, tileSize, tileSize);
    }

    // Comida
    context.fillStyle = "white";
    for (let food of foods.values()) {
        // CORRECCIÓN: Usar food.width y food.height (calculados en loadMap)
        context.fillRect(food.x, food.y, food.width, food.height);
    }

    // Cereza
    if (cherry) {
        context.drawImage(cherry.image, cherry.x, cherry.y, tileSize, tileSize);
    }

    // Score y vidas
    context.fillStyle = "white";
    context.font = "14px sans-serif";
    if (gameOver) {
        context.fillText("Game Over: " + String(score), tileSize / 2, tileSize / 2);
    } else {
        context.fillText("x" + String(lives) + " " + String(score), tileSize / 2, tileSize / 2);
    }
}


function move() {
    // Mover Pac-Man
    pacman.x += pacman.velocityX;
    pacman.y += pacman.velocityY;

    // Colisión con paredes
    for (let wall of walls.values()) {
        if (collision(pacman, wall)) {
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break;
        }
    }

    // Colisión con fantasmas
    for (let ghost of ghosts.values()) {
        if (collision(ghost, pacman)) {
            if (ghost.isScared) {
                // Comer fantasma vulnerable
                score += 200;
                ghost.reset();
                ghost.image = ghost.originalImage; // vuelve a su color normal
                ghost.isScared = false;
            } else {
                // Fantasma normal
                lives -= 1;
                if (lives == 0) {
                    gameOver = true;
                    return;
                }
                resetPositions();
            }
        }

        // Lógica de movimiento de fantasmas
        if (ghost.y == tileSize * 9 && ghost.direction != 'U' && ghost.direction != 'D') {
            ghost.updateDirection('U');
        }

        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;

        // Colisión de fantasmas con paredes y bordes
        for (let wall of walls.values()) {
            if (collision(ghost, wall) || ghost.x <= 0 || ghost.x + ghost.width >= boardWidth) {
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                const newDirection = directions[Math.floor(Math.random() * 4)];
                ghost.updateDirection(newDirection);
            }
        }
    }

    // Colisión con comida
    let foodEaten = null;
    for (let food of foods.values()) {
        // Usamos un margen de tolerancia para la colisión de Pac-Man con la comida
        const tolerance = tileSize / 4;
        if (collision(pacman, food, tolerance)) {
            foodEaten = food;
            score += 10;
            break;
        }
    }
    foods.delete(foodEaten);

    // Colisión con cereza
    if (cherry && collision(pacman, cherry)) {
        score += 50; // puntos por cereza
        cherry = null; // desaparece la cereza

        // Fantasmas vulnerables
        for (let ghost of ghosts.values()) {
            ghost.image = scaredGhostImage;
            ghost.isScared = true;
        }

        // Volver a normal después de 7 segundos
        setTimeout(() => {
            for (let ghost of ghosts.values()) {
                if (ghost.originalImage) ghost.image = ghost.originalImage;
                ghost.isScared = false;
            }
        }, 7000);
    }

    // Siguiente nivel
    if (foods.size == 0) {
        loadMap();
        resetPositions();
        placeCherry(); // vuelve a colocar la cereza en el mapa
    }
}


function movePacman(e) {

    // Si el juego ha terminado y se presiona una tecla (o botón simulado)
    if (gameOver) {
        loadMap();
        resetPositions();
        lives = 3;
        score = 0;
        gameOver = false;
        update(); //restart game loop
        return;
    }

    // El evento 'e' viene de la pulsación de tecla o de la simulación del botón.
    let direction = null;

    if (e.code == "ArrowUp" || e.code == "KeyW") {
        direction = 'U';
    }
    else if (e.code == "ArrowDown" || e.code == "KeyS") {
        direction = 'D';
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") {
        direction = 'L';
    }
    else if (e.code == "ArrowRight" || e.code == "KeyD") {
        direction = 'R';
    }

    // Si se encontró una dirección válida, actualiza Pac-Man
    if (direction) {
        pacman.updateDirection(direction);
    }

    //update pacman images
    if (pacman.direction == 'U') {
        pacman.image = pacmanUpImage;
    }
    else if (pacman.direction == 'D') {
        pacman.image = pacmanDownImage;
    }
    else if (pacman.direction == 'L') {
        pacman.image = pacmanLeftImage;
    }
    else if (pacman.direction == 'R') {
        pacman.image = pacmanRightImage;
    }
}

function collision(a, b, tolerance = 0) {
    // Añadida tolerancia para colisiones (útil para comida)
    return a.x < b.x + b.width - tolerance &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x + tolerance &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height - tolerance &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y + tolerance;    //a's bottom left corner passes b's top left corner
}

function resetPositions() {
    pacman.reset();
    pacman.velocityX = 0;
    pacman.velocityY = 0;
    // Asegura que Pacman esté mirando a la derecha al reiniciar
    pacman.direction = 'R';
    pacman.image = pacmanRightImage;

    for (let ghost of ghosts.values()) {
        ghost.reset();
        const newDirection = directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(newDirection);
    }
}

class Block {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.startX = x;
        this.startY = y;

        this.direction = 'R';
        this.velocityX = 0;
        this.velocityY = 0;
    }

    updateDirection(direction) {
        const prevDirection = this.direction;
        this.direction = direction;
        this.updateVelocity();
        this.x += this.velocityX;
        this.y += this.velocityY;

        for (let wall of walls.values()) {
            if (collision(this, wall)) {
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection;
                this.updateVelocity();
                return;
            }
        }
    }

    updateVelocity() {
        const speed = tileSize / 4;

        if (this.direction == 'U') {
            this.velocityX = 0;
            this.velocityY = -speed;
        }
        else if (this.direction == 'D') {
            this.velocityX = 0;
            this.velocityY = speed;
        }
        else if (this.direction == 'L') {
            this.velocityX = -speed;
            this.velocityY = 0;
        }
        else if (this.direction == 'R') {
            this.velocityX = speed;
            this.velocityY = 0;
        }
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
};


function placeCherry() {
    let x, y;
    let safe = false;

    while (!safe) {
        const row = Math.floor(Math.random() * rowCount);
        const col = Math.floor(Math.random() * columnCount);

        const tile = tileMap[row][col];

        // Usamos el mismo tamaño y posición que una celda normal
        x = col * tileSize;
        y = row * tileSize;

        // La posición es segura si no es pared ni Pac-Man ni fantasma
        if (tile !== 'X' && tile !== 'P' && tile !== 'b' && tile !== 'o' && tile !== 'p' && tile !== 'r') {
            safe = true;
            // También aseguramos que no haya fantasma exactamente ahí
            for (let ghost of ghosts.values()) {
                if (ghost.x === x && ghost.y === y) {
                    safe = false;
                    break;
                }
            }
        }
    }

    // Usamos tileSize para el tamaño del bloque para facilitar la colisión, aunque la imagen sea más pequeña.
    cherry = new Block(cherryImage, x, y, tileSize, tileSize);
}


// Colocar cereza cada 45 segundos si no hay ninguna
setInterval(() => {
    if (!cherry) {
        placeCherry();
    }
}, 45000);


window.addEventListener('resize', () => {
    ajustarTamañoPantalla(); // vuelve a calcular el tileSize

    // si el tablero ya existe, ajusta el tamaño visual
    if (board) {
        board.height = rowCount * tileSize;
        board.width = columnCount * tileSize;
    }
});


// FUNCIÓN CORREGIDA: Configuración de los controles móviles
function setupMobileControls() {
    // 1. Elimina cualquier listener duplicado que hayas tenido anteriormente
    // El objetivo es usar SOLO esta lógica unificada.

    // 2. Agrega los listeners que simulan el evento de teclado
    const upButton = document.getElementById("up");
    const downButton = document.getElementById("down");
    const leftButton = document.getElementById("left");
    const rightButton = document.getElementById("right");

    if (upButton) {
        upButton.addEventListener("click", () => {
            // Usamos 'code' para que movePacman(e) reconozca la dirección
            document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" }));
        });
    }

    if (downButton) {
        downButton.addEventListener("click", () => {
            document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown" }));
        });
    }

    if (leftButton) {
        leftButton.addEventListener("click", () => {
            document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
        });
    }

    if (rightButton) {
        rightButton.addEventListener("click", () => {
            document.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight" }));
        });
    }
}

// NOTA: La función 'window.moverPacman' que tenías ya no es necesaria y ha sido eliminada. 



