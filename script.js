const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let paddle, ball, bricks;
const rowCount = 5;
const colCount = 8;
const brickPadding = 5;
const brickHeight = 20;

function resizeCanvas() {
    const containerHeight = window.innerHeight;
    gameContainer.style.height = containerHeight + 'px';

    let width = Math.min(Math.max(window.innerWidth, 360), 768);
    let height = width * 4 / 3;

    if (height > containerHeight) {
        height = containerHeight;
        width = height * 3 / 4;
    }

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    gameContainer.style.width = width + 'px';

    if (paddle) {
        paddle.width = canvas.width * 0.2;
        paddle.height = 10;
        paddle.x = (canvas.width - paddle.width) / 2;
        paddle.y = canvas.height - paddle.height - 10;
    }

    buildBricks();

    if (ball && ball.onPaddle) {
        ball.radius = 8;
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
    }
}

function buildBricks() {
    bricks = [];
    const brickWidth = (canvas.width - brickPadding * (colCount + 1)) / colCount;
    for (let c = 0; c < colCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < rowCount; r++) {
            const x = brickPadding + c * (brickWidth + brickPadding);
            const y = brickPadding + r * (brickHeight + brickPadding);
            bricks[c][r] = { x, y, status: 1, width: brickWidth };
        }
    }
}

function initGame() {
    paddle = { width: 0, height: 10, x: 0, y: 0 };
    ball = { x: 0, y: 0, radius: 8, dx: 0, dy: 0, speed: 7.5, onPaddle: true };

    resizeCanvas();

    document.addEventListener('mousemove', movePaddle);
    canvas.addEventListener('click', launchBall);

    requestAnimationFrame(loop);
}

function movePaddle(e) {
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    paddle.x = x - paddle.width / 2;

    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

    if (ball.onPaddle) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
    }
}

function launchBall() {
    if (ball.onPaddle) {
        ball.dx = ball.speed;
        ball.dy = -ball.speed;
        ball.onPaddle = false;
    }
}

function collisionDetection() {
    for (let c = 0; c < colCount; c++) {
        for (let r = 0; r < rowCount; r++) {
            const b = bricks[c][r];
            if (b.status) {
                if (ball.x > b.x && ball.x < b.x + b.width && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                }
            }
        }
    }
}

function drawBricks() {
    for (let c = 0; c < colCount; c++) {
        for (let r = 0; r < rowCount; r++) {
            const b = bricks[c][r];
            if (b.status) {
                ctx.fillStyle = '#0095DD';
                ctx.fillRect(b.x, b.y, b.width, brickHeight);
            }
        }
    }
}

function drawPaddle() {
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function update() {
    if (!ball.onPaddle) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
            ball.dx = -ball.dx;
        }

        if (ball.y + ball.dy < ball.radius) {
            ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ball.radius) {
            ball.onPaddle = true;
            ball.dx = 0;
            ball.dy = 0;
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - ball.radius;
        }

        if (ball.y + ball.radius > paddle.y &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
        }

        collisionDetection();
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall();
    update();
    requestAnimationFrame(loop);
}

startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameContainer.classList.remove('hidden');
    initGame();
});

window.addEventListener('resize', resizeCanvas);
