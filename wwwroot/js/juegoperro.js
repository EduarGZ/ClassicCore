window.inicializarJuegoPerro = () => {
    let ducks = [];
    let duckCount = 1;
    let duckImageNames = ["/imagenes/duck-left.gif", "/imagenes/duck-right.gif"];
    let duckWidth = 96;
    let duckHeight = 93;
    let duckVelocityX = 4;
    let duckVelocityY = 3;

    const contenedor = document.getElementById("juego-contenedor");
    const scoreElement = document.getElementById("score");
    const suelo = document.getElementById("suelo");
    let score = 0;
    let gameWidth = 0;
    let gameHeight = 0;

    function actualizarTamañoJuego() {
        // Detectar altura real del contenedor visible (WebView)
        const rect = contenedor.getBoundingClientRect();
        gameWidth = rect.width || window.innerWidth;
        // Restamos la altura del suelo para que los patos no bajen demasiado
        gameHeight = (rect.height || window.innerHeight) - suelo.offsetHeight;
    }

    function randomPosition(limit) {
        return Math.floor(Math.random() * limit);
    }

    function addDucks() {
        ducks = [];
        duckCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < duckCount; i++) {
            const duckImageName = duckImageNames[Math.floor(Math.random() * 2)];
            const duckImage = document.createElement("img");
            duckImage.src = duckImageName;
            duckImage.width = duckWidth;
            duckImage.height = duckHeight;
            duckImage.draggable = false;
            duckImage.classList.add("duck");

            // posición inicial dentro del área visible
            const posX = randomPosition(gameWidth - duckWidth);
            const posY = randomPosition(gameHeight - duckHeight - 50);
            duckImage.style.left = posX + "px";
            duckImage.style.top = posY + "px";

            // evento click
            duckImage.onclick = () => {
                const sonido = new Audio("/imagenes/duck-shot.mp3");
                sonido.play();
                score++;
                scoreElement.innerHTML = score;
                contenedor.removeChild(duckImage);
                ducks = ducks.filter(d => d.image !== duckImage);
                if (ducks.length === 0) addDog(duckCount);
            };

            contenedor.appendChild(duckImage);

            ducks.push({
                image: duckImage,
                x: posX,
                y: posY,
                velocityX: duckVelocityX * (Math.random() > 0.5 ? 1 : -1),
                velocityY: duckVelocityY * (Math.random() > 0.5 ? 1 : -1)
            });
        }
    }

    function moveDucks() {
        for (let duck of ducks) {
            duck.x += duck.velocityX;
            duck.y += duck.velocityY;

            // Rebote en bordes
            if (duck.x < 0 || duck.x + duckWidth > gameWidth) {
                duck.velocityX *= -1;
                duck.image.src = duck.velocityX < 0 ? duckImageNames[0] : duckImageNames[1];
            }
            if (duck.y < 0 || duck.y + duckHeight > gameHeight) {
                duck.velocityY *= -1;
            }

            duck.image.style.left = duck.x + "px";
            duck.image.style.top = duck.y + "px";
        }
    }

    function addDog(duckCount) {
        const dogImage = document.createElement("img");
        dogImage.src = duckCount === 1 ? "/imagenes/dog-duck1.png" : "/imagenes/dog-duck2.png";
        dogImage.width = duckCount === 1 ? 172 : 224;
        dogImage.height = 152;
        dogImage.draggable = false;
        dogImage.classList.add("dog");
        contenedor.appendChild(dogImage);

        const dogSound = new Audio("/imagenes/dog-score.mp3");
        dogSound.play();

        setTimeout(() => {
            contenedor.removeChild(dogImage);
            addDucks();
        }, 4000);
    }

    // Inicialización
    function startGame() {
        actualizarTamañoJuego();
        addDucks();
        setInterval(moveDucks, 1000 / 60);
    }

    window.addEventListener("resize", actualizarTamañoJuego);
    requestAnimationFrame(() => {
        actualizarTamañoJuego();
        setTimeout(startGame, 1000);
    });
};


