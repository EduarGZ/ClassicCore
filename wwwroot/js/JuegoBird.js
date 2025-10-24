window.startFlappy = function () {
    // === FLAPPY BIRD ESCALADO RESPONSIVE ===
    let board, context;

    const baseWidth = 400;
    const baseHeight = 600;

    const isMobile = window.innerWidth <= 768;

    // Canvas ocupa toda la pantalla
    let boardWidth = isMobile ? window.innerWidth : window.innerWidth;
    let boardHeight = isMobile ? window.innerHeight : window.innerHeight;

    // Escala solo para tamaños (pájaro, tubos, fuente)
    let scale = Math.min(boardWidth / baseWidth, boardHeight / baseHeight);

    // === Bird ===
    let birdImg, topPipeImg, bottomPipeImg;

    let bird = {
        x: boardWidth / 8,
        y: boardHeight / 2,
        width: 34 * scale,
        height: 24 * scale
    };

    // === Tubos ===
    let pipeArray = [];
    let pipeWidth = 70 * scale;
    let pipeHeight = 400 * scale;
    let pipeX = boardWidth;
    let pipeY = 0;

    // === Física ===
    let velocityX = -3;         // velocidad lateral (igual en PC y móvil)
    let velocityY = 0;          // velocidad vertical
    let gravity = 0.4;          // gravedad un poco más fuerte para suavidad
    let jumpStrength = -5;      // salto más suave
    let maxFallSpeed = 8;       // límite de caída

    let gameOver = false;
    let score = 0;

    // === Inicialización ===
    function init() {
        board = document.getElementById("boardBird");
        board.width = boardWidth;
        board.height = boardHeight;
        context = board.getContext("2d");

        // Cargar imágenes
        birdImg = new Image();
        birdImg.src = "imagenes/flappybird.png";
        topPipeImg = new Image();
        topPipeImg.src = "imagenes/toppipe.png";
        bottomPipeImg = new Image();
        bottomPipeImg.src = "imagenes/bottompipe.png";

        birdImg.onload = function () {
            context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
        };

        requestAnimationFrame(update);
        setInterval(placePipes, 1600);

        // === Controles ===
        document.addEventListener("keydown", moveBird);   // PC: Space o flecha arriba
        document.addEventListener("touchstart", jumpBird); // Móvil: tocar pantalla
        document.addEventListener("mousedown", jumpBird);  // PC: click
    }

    // === Bucle principal ===
    function update() {
        requestAnimationFrame(update);
        if (gameOver) return;

        context.clearRect(0, 0, board.width, board.height);

        // Movimiento del pájaro
        velocityY += gravity;

        // Limitar caída máxima
        if (velocityY > maxFallSpeed) velocityY = maxFallSpeed;

        bird.y += velocityY;
        if (bird.y < 0) bird.y = 0;

        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

        if (bird.y > board.height) gameOver = true;

        // Movimiento de tubos
        for (let pipe of pipeArray) {
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5;
                pipe.passed = true;
            }

            if (detectCollision(bird, pipe)) gameOver = true;
        }

        // Eliminar tubos fuera de pantalla completamente
        while (pipeArray.length > 0 && pipeArray[0].x + pipeArray[0].width < 0) {
            pipeArray.shift();
        }

        // Mostrar puntaje
        context.fillStyle = "white";
        context.font = `${Math.floor(40 * scale)}px sans-serif`;
        context.fillText(score, 10, 50 * scale);

        if (gameOver) {
            context.fillText("GAME OVER", 10, 100 * scale);
        }
    }

    // === Crear tubos ===
    function placePipes() {
        if (gameOver) return;

        let gap = 150 * scale;
        let randomY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);

        let topPipe = {
            img: topPipeImg,
            x: board.width, // empieza fuera de pantalla derecha
            y: randomY,
            width: pipeWidth,
            height: pipeHeight,
            passed: false
        };
        let bottomPipe = {
            img: bottomPipeImg,
            x: board.width,
            y: randomY + pipeHeight + gap,
            width: pipeWidth,
            height: pipeHeight,
            passed: false
        };
        pipeArray.push(topPipe, bottomPipe);
    }

    // === Movimiento del pájaro ===
    function moveBird(e) {
        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") jump();
    }

    function jumpBird() {
        jump();
    }

    function jump() {
        velocityY = jumpStrength; // salto suave
        if (gameOver) restart();
    }

    function restart() {
        bird.y = boardHeight / 2;
        pipeArray = [];
        score = 0;
        gameOver = false;
        velocityY = 0;
    }

    // === Colisiones ===
    function detectCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    init();
};





