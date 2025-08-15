// 1. ตั้งค่า Canvas และ Element
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startMenuElement = document.getElementById('startMenu');
const startButton = document.getElementById('startButton');
const gameInfoElement = document.querySelector('.game-info');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const leaderboardElement = document.getElementById('leaderboard');
const finalScoreElement = document.getElementById('finalScore');
const highScoresListElement = document.getElementById('highScoresList');
const restartButton = document.getElementById('restartButton');
// --- เพิ่ม: อ้างอิงปุ่มควบคุม ---
const touchControls = document.getElementById('touch-controls');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

// โหลดรูปภาพ
const playerImg = new Image(); playerImg.src = 'player.png';
const bananaImg = new Image(); bananaImg.src = 'banana.png';
const appleImg = new Image(); appleImg.src = 'apple.png';
const bombImg = new Image(); bombImg.src = 'bomb.png';

// กำหนดค่าเริ่มต้นของเกม
let score = 0; let gameOver = false; let items = []; let itemSpawnTimer = 0;
const GAME_DURATION = 60; let timeRemaining = GAME_DURATION; let gameInterval;
const player = { width: 80, height: 100, x: 0, y: 0, speed: 10, dx: 0 };

// --- ฟังก์ชันสำหรับปรับขนาด Canvas ---
function resizeCanvas() {
    const aspectRatio = 800 / 600;
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;
    const windowRatio = newWidth / newHeight;

    if (windowRatio > aspectRatio) {
        newWidth = newHeight * aspectRatio;
    } else {
        newHeight = newWidth / aspectRatio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    player.width = canvas.width * 0.1;
    player.height = player.width * 1.25;
    player.x = (canvas.width / 2) - (player.width / 2);
    player.y = canvas.height - player.height - 10;
    player.speed = canvas.width * 0.012;
}

// 3. ฟังก์ชันวาดภาพ
function drawPlayer() { ctx.drawImage(playerImg, player.x, player.y, player.width, player.height); }
function drawItems() { items.forEach(item => { ctx.drawImage(item.image, item.x - item.size / 2, item.y - item.size / 2, item.size, item.size); }); }
function drawUI() { scoreElement.textContent = score; timerElement.textContent = Math.ceil(timeRemaining); }

// 4. สร้างและจัดการไอเท็ม
function spawnItem() {
    const random = Math.random();
    let newItem;
    const baseSize = canvas.width * 0.07;
    const baseSpeed = canvas.height * 0.005;

    if (random < 0.15) newItem = { type: 'apple', image: appleImg, score: 5, size: baseSize * 0.8, speed: baseSpeed * 1.2 };
    else if (random < 0.40) newItem = { type: 'bomb', image: bombImg, score: -10, size: baseSize, speed: baseSpeed * 1.4 };
    else newItem = { type: 'banana', image: bananaImg, score: 2, size: baseSize, speed: baseSpeed };

    newItem.x = Math.random() * (canvas.width - newItem.size) + newItem.size / 2;
    newItem.y = -newItem.size;
    items.push(newItem);
}
function updateItems() {
    itemSpawnTimer++; if (itemSpawnTimer > 60) { spawnItem(); itemSpawnTimer = 0; }
    for (let i = items.length - 1; i >= 0; i--) { const item = items[i]; item.y += item.speed; if (item.y > canvas.height + item.size) items.splice(i, 1); }
}

// 5. การควบคุมและการชน
function movePlayer() {
    player.x += player.dx; if (player.x < 0) player.x = 0; if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}
function detectCollisions() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (player.x < item.x + item.size / 2 && player.x + player.width > item.x - item.size / 2 &&
            player.y < item.y + item.size / 2 && player.y + player.height > item.y - item.size / 2) {
            score = Math.max(0, score + item.score);
            items.splice(i, 1);
        }
    }
}

// 6. ระบบเกมและ Leaderboard
function startGame() {
    score = 0; timeRemaining = GAME_DURATION; items = []; gameOver = false;
    player.dx = 0;
    resizeCanvas();

    leaderboardElement.style.display = 'none';
    startMenuElement.style.display = 'none';
    gameInfoElement.style.display = 'flex';
    canvas.style.display = 'block';
    touchControls.style.display = 'flex'; // --- เพิ่ม: แสดงปุ่มควบคุม ---

    const startTime = Date.now();
    gameInterval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        timeRemaining = GAME_DURATION - elapsedTime;
        if (timeRemaining <= 0) {
            timeRemaining = 0;
            endGame();
        }
    }, 100);
    update();
}
function endGame() {
    gameOver = true;
    clearInterval(gameInterval);
    player.dx = 0;
    finalScoreElement.textContent = score;
    gameInfoElement.style.display = 'none';
    canvas.style.display = 'none';
    touchControls.style.display = 'none'; // --- เพิ่ม: ซ่อนปุ่มควบคุม ---
    saveHighScore(score);
    showLeaderboard();
}
function saveHighScore(newScore) {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || []; highScores.push(newScore); highScores.sort((a, b) => b - a); const topScores = highScores.slice(0, 5); localStorage.setItem('highScores', JSON.stringify(topScores));
}
function showLeaderboard() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || []; highScoresListElement.innerHTML = highScores.map(s => `<li>${s}</li>`).join(''); leaderboardElement.style.display = 'flex';
}

// 7. Game Loop
function update() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    updateItems();
    drawItems();
    movePlayer();
    detectCollisions();
    drawUI();
    requestAnimationFrame(update);
}

// 8. Event Listeners
document.addEventListener('keydown', e => { if (!gameOver && (e.key === 'ArrowRight' || e.key === 'd')) player.dx = player.speed; if (!gameOver && (e.key === 'ArrowLeft' || e.key === 'a')) player.dx = -player.speed; });
document.addEventListener('keyup', e => { if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') player.dx = 0; });

// --- เพิ่ม: Event Listener สำหรับปุ่มควบคุม (รองรับทั้งกดค้างและคลิก) ---
function handlePointerDown(direction) {
    if (gameOver) return;
    player.dx = direction === 'left' ? -player.speed : player.speed;
}
function handlePointerUp() {
    player.dx = 0;
}

leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handlePointerDown('left'); });
leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); handlePointerUp(); });
leftBtn.addEventListener('mousedown', () => handlePointerDown('left'));
leftBtn.addEventListener('mouseup', () => handlePointerUp());

rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handlePointerDown('right'); });
rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); handlePointerUp(); });
rightBtn.addEventListener('mousedown', () => handlePointerDown('right'));
rightBtn.addEventListener('mouseup', () => handlePointerUp());

restartButton.addEventListener('click', startGame);
startButton.addEventListener('click', startGame);

// --- ตั้งค่าสถานะเริ่มต้นของ UI ---
function initializeUI() {
    gameInfoElement.style.display = 'none';
    canvas.style.display = 'none';
    leaderboardElement.style.display = 'none';
    startMenuElement.style.display = 'flex';
    touchControls.style.display = 'none'; // --- เพิ่ม: ซ่อนปุ่มตอนแรก ---
}

// --- เรียกใช้ฟังก์ชันเมื่อโหลดหน้าและมีการปรับขนาด ---
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
    initializeUI();
    resizeCanvas();
});
