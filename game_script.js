// game_script.js

// Canvas ve Menü Elementlerini Al
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const gameMenu = document.getElementById('game-menu');
const menuHeadline = document.getElementById('menu-headline');
const menuInstructionText = document.getElementById('menu-instruction-text');
const finalScoreDisplay = document.getElementById('final-score');
const startRestartBtn = document.getElementById('start-restart-btn');


// Oyun Ayarları
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
let isGameRunning = false; // Oyunun devam edip etmediği
let isGameOver = false;
let animationFrameId;

// Oyuncu Ayarları (Araba - Neon Blok)
const carWidth = 40;
const carHeight = 70;
let carX;
let carY;
const carSpeed = 4; // Yana hareket hızı

// Oyun Nesneleri (Engeller - Bariyerler)
let obstacles = [];
let baseObstacleSpeed = 2; 
let currentObstacleSpeed;
const obstacleSpawnRate = 120; // Daha seyrek çıkış
let frameCounter = 0;
let difficultyIncreaseRate = 0.003; 

// Kontrol Durumu
let leftPressed = false;
let rightPressed = false;
let score = 0;

// Oyunun teması için renkleri al
function getThemeColors() {
    const isLight = document.body.classList.contains('light-theme');
    
    return {
        // Altın/Turuncu tema renkleri
        carColor: isLight ? '#ff9900' : '#fffc7f', 
        carGlow: isLight ? '#ffcc00' : '#ffffff', 
        // Bariyer renkleri
        barrierOrange: isLight ? '#e67e22' : '#f39c12', 
        barrierRed: isLight ? '#c0392b' : '#e74c3c', 
        barrierMetal: isLight ? '#95a5a6' : '#bdc3c7', 
        barrierGlow: isLight ? '#ffcc00' : '#ffffff' 
    };
}

// ------------------- ÇİZİM FONKSİYONLARI -------------------

function drawRoad() {
    ctx.fillStyle = '#34495e'; 
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const colors = getThemeColors();
    
    // Yol Şeritleri (Neon Animasyonlu)
    ctx.strokeStyle = colors.carGlow; 
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = colors.carGlow; 

    const dashLength = 20;
    const gapLength = 20;
    let offset = frameCounter * 1.5 % (dashLength + gapLength); 

    for (let i = -dashLength; i < GAME_HEIGHT; i += (dashLength + gapLength)) {
        ctx.beginPath();
        ctx.setLineDash([dashLength, gapLength]);
        ctx.moveTo(GAME_WIDTH / 2, i + offset);
        ctx.lineTo(GAME_WIDTH / 2, i + offset + dashLength);
        ctx.stroke();
    }
    
    // Kenar çizgileri (Sabit)
    ctx.setLineDash([0, 0]); 
    ctx.lineWidth = 2;
    ctx.moveTo(10, 0); ctx.lineTo(10, GAME_HEIGHT); ctx.stroke();
    ctx.moveTo(GAME_WIDTH - 10, 0); ctx.lineTo(GAME_WIDTH - 10, GAME_HEIGHT); ctx.stroke();
    
    ctx.shadowBlur = 0;
}

function drawCar() {
    const colors = getThemeColors();
    
    // Araba gövdesi (Neon Parlaklığı)
    ctx.fillStyle = colors.carColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors.carGlow;
    ctx.fillRect(carX, carY, carWidth, carHeight);
    
    // Detaylar
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; 
    ctx.fillRect(carX + 5, carY + 5, carWidth - 10, 15);
    
    ctx.shadowBlur = 0;
}

function drawObstacles() {
    const colors = getThemeColors();
    
    obstacles.forEach(obs => {
        // Bariyerin toplam genişliği ve yüksekliği
        const barrierTotalWidth = obs.width;
        const barrierTotalHeight = obs.height;

        // Üst ve Alt Tahta Kalınlığı
        const boardHeight = barrierTotalHeight * 0.35; // %35'i tahta
        const boardGap = barrierTotalHeight * 0.15; // %15'i boşluk
        const boardY1 = obs.y;
        const boardY2 = obs.y + boardHeight + boardGap;

        // Metal Desteklerin Genişliği
        const supportWidth = 5; 
        // Lamba çapı
        const lampRadius = 4; // Lamba küçültüldü

        // Gölge efekti (tüm bariyer için)
        ctx.shadowBlur = 8; // Gölge azaltıldı
        ctx.shadowColor = colors.barrierGlow;

        // 1. Metal Destekler
        ctx.fillStyle = colors.barrierMetal;
        ctx.fillRect(obs.x + 3, obs.y + boardHeight * 0.8, supportWidth, barrierTotalHeight * 0.5);
        ctx.fillRect(obs.x + barrierTotalWidth - 3 - supportWidth, obs.y + boardHeight * 0.8, supportWidth, barrierTotalHeight * 0.5);
        
        // 2. Üst Tahta
        const stripeWidth = boardHeight / 2;
        for (let i = 0; i < barrierTotalWidth; i += stripeWidth) {
            ctx.fillStyle = (Math.floor(i / stripeWidth) % 2 === 0) ? colors.barrierOrange : 'white';
            ctx.fillRect(obs.x + i, boardY1, stripeWidth, boardHeight);
        }

        // 3. Alt Tahta
        for (let i = 0; i < barrierTotalWidth; i += stripeWidth) {
            ctx.fillStyle = (Math.floor(i / stripeWidth) % 2 === 0) ? colors.barrierOrange : 'white';
            ctx.fillRect(obs.x + i, boardY2, stripeWidth, boardHeight);
        }

        // 4. Kırmızı Lambalar (Üst Tahtanın Üzerinde)
        ctx.shadowBlur = 12; 
        ctx.shadowColor = colors.barrierRed;
        ctx.fillStyle = colors.barrierRed;
        ctx.beginPath();
        ctx.arc(obs.x + barrierTotalWidth * 0.25, boardY1 + 3, lampRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(obs.x + barrierTotalWidth * 0.75, boardY1 + 3, lampRadius, 0, Math.PI * 2);
        ctx.fill();
    });
    // Gölgeyi temizle
    ctx.shadowBlur = 0;
}

function updateScore() {
    scoreDisplay.textContent = `Puan: ${score}`;
}

// ------------------- GÜNCELLEME MANTIKLARI -------------------

function updateCar() {
    let newCarX = carX;
    if (rightPressed) {
        newCarX += carSpeed;
    } else if (leftPressed) {
        newCarX -= carSpeed;
    }
    
    // X pozisyonunu yol sınırları (10px kenar boşluğu) içinde tut
    carX = Math.max(10, Math.min(GAME_WIDTH - carWidth - 10, newCarX));
}

function updateObstacles() {
    // Zorluğu ve Hızı Artır
    currentObstacleSpeed += difficultyIncreaseRate;

    // Engelleri hareket ettir
    obstacles.forEach(obs => {
        obs.y += currentObstacleSpeed;
    });

    // Ekran dışına çıkan engelleri sil ve puanı artır
    obstacles = obstacles.filter(obs => {
        if (obs.y < GAME_HEIGHT) {
            return true;
        } else {
            // Engel başarıyla geçildi, puanı artır
            score += 10;
            updateScore();
            return false;
        }
    });

    // Yeni engel oluşturma
    const dynamicSpawnRate = Math.max(40, obstacleSpawnRate / (1 + (currentObstacleSpeed - baseObstacleSpeed) * 0.5));
    if (frameCounter % Math.floor(dynamicSpawnRate) === 0) {
        spawnObstacle();
    }
}

function spawnObstacle() {
    const obsWidth = 60; // Engel genişliği küçültüldü (80 -> 60)
    const obsHeight = 40; // Engel yüksekliği küçültüldü (60 -> 40)
    
    // Rastgele X pozisyonu (yol ve bariyer sınırları içinde)
    const randomX = Math.random() * (GAME_WIDTH - obsWidth - 20) + 10; 
    
    obstacles.push({
        x: randomX,
        y: -obsHeight, 
        width: obsWidth,
        height: obsHeight
    });
}

function checkCollision() {
    obstacles.forEach(obs => {
        // Çarpışma Tespiti (AABB)
        if (carX < obs.x + obs.width &&
            carX + carWidth > obs.x &&
            carY < obs.y + obs.height &&
            carY + carHeight > obs.y) {
            
            gameOver();
        }
    });
}

// ------------------- OYUN DÖNGÜSÜ VE DURUM YÖNETİMİ -------------------

function initGame() {
    // Oyuncu konumunu sıfırla
    carX = GAME_WIDTH / 2 - carWidth / 2;
    carY = GAME_HEIGHT - carHeight - 30;

    // Oyun değişkenlerini sıfırla
    score = 0;
    obstacles = [];
    isGameOver = false;
    isGameRunning = false;
    currentObstacleSpeed = baseObstacleSpeed;
    frameCounter = 0;

    // Skoru ve menüyü güncelle
    updateScore();
    showMenu('start');
}

function startGame() {
    if (isGameRunning) return; // Zaten çalışıyorsa tekrar başlatma

    isGameRunning = true;
    isGameOver = false;
    hideMenu();

    // Kontrol tuşlarını temizle
    leftPressed = false;
    rightPressed = false;

    // Oyun döngüsünü başlat
    gameLoop();
}

function gameOver() {
    isGameOver = true;
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);
    showMenu('end');
}

function showMenu(type) {
    gameMenu.style.display = 'flex'; 
    finalScoreDisplay.style.display = 'none';

    if (type === 'start') {
        menuHeadline.textContent = 'ARABA OYUNU';
        menuInstructionText.textContent = 'Engellerden kaçın, puan toplayın!';
        startRestartBtn.textContent = 'OYUNA BAŞLA';
    } else if (type === 'end') {
        menuHeadline.textContent = 'OYUN BİTTİ!';
        menuInstructionText.textContent = 'Çarpışma gerçekleşti.';
        finalScoreDisplay.textContent = `SON PUANIN: ${score}`;
        finalScoreDisplay.style.display = 'block';
        startRestartBtn.textContent = 'TEKRAR OYNA';
    }
}

function hideMenu() {
    gameMenu.style.display = 'none';
}

function gameLoop() {
    if (!isGameRunning || isGameOver) return;

    // 1. Güncelleme
    updateCar();
    updateObstacles();
    checkCollision();

    // 2. Çizim
    drawRoad();
    drawObstacles();
    drawCar();

    frameCounter++;
    animationFrameId = requestAnimationFrame(gameLoop);
}


// ------------------- GİRİŞ İŞLEYİCİLERİ -------------------

// Klavye Kontrolleri
document.addEventListener('keydown', (e) => {
    if (isGameRunning) {
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
            leftPressed = true;
        } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
            rightPressed = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (isGameRunning) {
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
            leftPressed = false;
        } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
            rightPressed = false;
        }
    }
});

// Mobil Kontroller (Buton Dokunmaları)
if (leftBtn && rightBtn) {
    const handleTouchStart = (e, isLeft) => { 
        e.preventDefault(); 
        if (isGameRunning) {
            if (isLeft) leftPressed = true;
            else rightPressed = true;
        }
    };
    const handleTouchEnd = (isLeft) => { 
        if (isLeft) leftPressed = false;
        else rightPressed = false;
    };

    leftBtn.addEventListener('touchstart', (e) => handleTouchStart(e, true));
    leftBtn.addEventListener('touchend', () => handleTouchEnd(true));
    rightBtn.addEventListener('touchstart', (e) => handleTouchStart(e, false));
    rightBtn.addEventListener('touchend', () => handleTouchEnd(false));
    
    // Mouse olayları
    leftBtn.addEventListener('mousedown', () => { if (isGameRunning) leftPressed = true; });
    leftBtn.addEventListener('mouseup', () => { leftPressed = false; });
    rightBtn.addEventListener('mousedown', () => { if (isGameRunning) rightPressed = true; });
    rightBtn.addEventListener('mouseup', () => { rightPressed = false; });
}

// Menü Butonu Olayı
startRestartBtn.addEventListener('click', () => {
    if (isGameOver || !isGameRunning) {
        // Eğer oyun bitmişse veya hiç başlamamışsa, oyunu yeniden başlat/başlat
        initGame(); // Tüm değişkenleri sıfırla
        startGame(); // Oyunu başlat
    }
});


// Oyunun başlatılması
document.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('gameCanvas');
    if (canvasElement) {
        initGame(); // Sayfa yüklendiğinde başlangıç menüsünü göster
    }
});
