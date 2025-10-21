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
let isGameRunning = false; // OYUNUN AKTİF ÇALIŞMA DURUMU
let isGameOver = false; // OYUNUN KAYBEDİLME DURUMU
let animationFrameId;

// MOBİL PERFORMANS AYARI
const isMobile = /Mobi|Android/i.test(navigator.userAgent);
const speedMultiplier = isMobile ? 1.5 : 1.0;
const mobileShadowReduction = isMobile ? 0.5 : 1.0;

// Oyuncu Ayarları (Araba - Neon Blok)
const carWidth = 40;
const carHeight = 70;
let carX;
let carY;
const carSpeed = 4 * speedMultiplier; 

// Oyun Nesneleri (Engeller - Bariyerler)
let obstacles = [];
let baseObstacleSpeed = 2 * speedMultiplier; 
let currentObstacleSpeed;
const obstacleSpawnRate = 120; 
let frameCounter = 0;
let difficultyIncreaseRate = 0.001; 

// Görsel Geri Bildirim Ayarları
let scoreAnimations = []; // Puan animasyonları için
let shakeDuration = 0; // Çarpışma Sarsıntısı süresi

// Kontrol Durumu
let leftPressed = false;
let rightPressed = false;
let score = 0;

// Oyunun teması için renkleri al
function getThemeColors() {
    const isLight = document.body.classList.contains('light-theme');
    
    return {
        carColor: isLight ? '#ff9900' : '#fffc7f', 
        carGlow: isLight ? '#ffcc00' : '#ffffff', 
        barrierOrange: isLight ? '#e67e22' : '#f39c12', 
        barrierRed: isLight ? '#c0392b' : '#e74c3c', 
        barrierMetal: isLight ? '#95a5a6' : '#bdc3c7', 
        barrierGlow: isLight ? '#ffcc00' : '#ffffff',
    };
}

// ------------------- ÇİZİM FONKSİYONLARI -------------------

function drawRoad() {
    ctx.fillStyle = '#34495e'; 
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const colors = getThemeColors();
    
    // Sarsıntı Efekti Uygula
    let shakeX = 0;
    let shakeY = 0;
    if (shakeDuration > 0) {
        shakeX = (Math.random() - 0.5) * 8; 
        shakeY = (Math.random() - 0.5) * 8;
        shakeDuration--;
    }
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Yol Şeritleri (Neon Animasyonlu)
    ctx.strokeStyle = colors.carGlow; 
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10 * mobileShadowReduction; 
    ctx.shadowColor = colors.carGlow; 

    const dashLength = 20;
    const gapLength = 20;
    let offset = frameCounter * 1.5 * speedMultiplier % (dashLength + gapLength); 

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
    
    ctx.restore(); // Sarsıntıyı sonlandır
}

function drawCar() {
    const colors = getThemeColors();
    
    // Araba gövdesi (Neon Parlaklığı)
    ctx.fillStyle = colors.carColor;
    ctx.shadowBlur = 15 * mobileShadowReduction; 
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
        const barrierTotalWidth = obs.width;
        const barrierTotalHeight = obs.height;
        const boardHeight = barrierTotalHeight * 0.35; 
        const boardGap = barrierTotalHeight * 0.15; 
        const boardY1 = obs.y;
        const boardY2 = obs.y + boardHeight + boardGap;
        const supportWidth = 5; 
        const lampRadius = 4; 

        // Gölge efekti (tüm bariyer için)
        ctx.shadowBlur = 8 * mobileShadowReduction; 
        ctx.shadowColor = colors.barrierGlow;

        // 1. Metal Destekler
        ctx.fillStyle = colors.barrierMetal;
        ctx.fillRect(obs.x + 3, obs.y + boardHeight * 0.8, supportWidth, barrierTotalHeight * 0.5);
        ctx.fillRect(obs.x + barrierTotalWidth - 3 - supportWidth, obs.y + boardHeight * 0.8, supportWidth, barrierTotalHeight * 0.5);
        
        // 2. Tahtalar ve Lambalar
        const stripeWidth = boardHeight / 2;
        [boardY1, boardY2].forEach(y => {
            for (let i = 0; i < barrierTotalWidth; i += stripeWidth) {
                ctx.fillStyle = (Math.floor(i / stripeWidth) % 2 === 0) ? colors.barrierOrange : 'white';
                ctx.fillRect(obs.x + i, y, stripeWidth, boardHeight);
            }
        });

        // 4. Kırmızı Lambalar
        ctx.shadowBlur = 12 * mobileShadowReduction; 
        ctx.shadowColor = colors.barrierRed;
        ctx.fillStyle = colors.barrierRed;
        [0.25, 0.75].forEach(pos => {
            ctx.beginPath();
            ctx.arc(obs.x + barrierTotalWidth * pos, boardY1 + 3, lampRadius, 0, Math.PI * 2);
            ctx.fill();
        });
    });
    ctx.shadowBlur = 0;
}


// Puan Animasyonunu Çizme Fonksiyonu
function drawScoreAnimations() {
    scoreAnimations.forEach((anim, index) => {
        // Opaklık azaldıkça metin yukarı kayar ve kaybolur
        anim.y -= 1 * speedMultiplier; 
        anim.opacity -= 0.02 * speedMultiplier; 

        ctx.fillStyle = `rgba(255, 255, 255, ${anim.opacity})`;
        ctx.font = 'bold 20px Fira Code';
        ctx.textAlign = 'center';
        ctx.fillText(anim.text, anim.x, anim.y);

        // Animasyon tamamen görünmez olduğunda listeden kaldır
        if (anim.opacity <= 0) {
            scoreAnimations.splice(index, 1);
        }
    });
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
            // Puan animasyonu ekle
            scoreAnimations.push({ 
                x: carX + carWidth / 2, 
                y: carY, 
                text: '+10', 
                opacity: 1.0 
            });
            score += 10;
            updateScore();
            return false;
        }
    });

    // Yeni engel oluşturma
    const dynamicSpawnRate = Math.max(40, obstacleSpawnRate / (1 + (currentObstacleSpeed / speedMultiplier - baseObstacleSpeed / speedMultiplier) * 0.5));
    if (frameCounter % Math.floor(dynamicSpawnRate) === 0) {
        spawnObstacle();
    }

    // Güçlendirme oluşturma mantığı KALDIRILDI
}

function spawnObstacle() {
    const obsWidth = 60; 
    const obsHeight = 40; 
    
    const randomX = Math.random() * (GAME_WIDTH - obsWidth - 20) + 10; 
    
    obstacles.push({
        x: randomX,
        y: -obsHeight, 
        width: obsWidth,
        height: obsHeight
    });
}


function checkCollision() {
    // Engel Çarpışması
    obstacles.forEach(obs => {
        if (carX < obs.x + obs.width &&
            carX + carWidth > obs.x &&
            carY < obs.y + obs.height &&
            carY + carHeight > obs.y) {
            
            // Çarpışma Sarsıntısı Ekle
            shakeDuration = 10; 
            gameOver();
        }
    });

    // Güçlendirme Çarpışması kontrolü KALDIRILDI
}

// ------------------- OYUN DÖNGÜSÜ VE DURUM YÖNETİMİ -------------------

function initGame() {
    carX = GAME_WIDTH / 2 - carWidth / 2;
    carY = GAME_HEIGHT - carHeight - 30;

    score = 0;
    obstacles = [];
    scoreAnimations = []; 
    isGameOver = false;
    isGameRunning = false; 
    currentObstacleSpeed = baseObstacleSpeed;
    frameCounter = 0;
    shakeDuration = 0;

    updateScore();
    drawRoad(); 
    showMenu('start');
}

function startGame() {
    if (isGameRunning) return; 

    isGameRunning = true;
    isGameOver = false;
    hideMenu();

    leftPressed = false;
    rightPressed = false;

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
    // Eğer oyun çalışmıyorsa döngüyü hemen durdur.
    if (!isGameRunning) {
        cancelAnimationFrame(animationFrameId);
        return; 
    }

    // 1. Güncelleme
    updateCar();
    updateObstacles();
    checkCollision();

    // 2. Çizim
    drawRoad();
    drawObstacles();
    drawCar();
    drawScoreAnimations(); 

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
    initGame(); 
    startGame(); 
});


// Oyunun başlatılması
document.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('gameCanvas');
    if (canvasElement) {
        initGame(); 
    }
});
