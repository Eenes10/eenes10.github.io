// game_script.js

// Canvas ve Çizim Bağlamını Al
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');


// Oyun Ayarları
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
let isGameOver = false;
let animationFrameId;

// Oyuncu Ayarları (Araba - Neon Blok)
const carWidth = 40;
const carHeight = 70;
let carX = GAME_WIDTH / 2 - carWidth / 2;
let carY = GAME_HEIGHT - carHeight - 30;
const carSpeed = 6; // Yana hareket hızı

// Oyun Nesneleri (Engeller - Levhalar)
let obstacles = [];
let baseObstacleSpeed = 3; // BAŞLANGIÇ HIZI AZALTILDI (4 -> 3)
let currentObstacleSpeed = baseObstacleSpeed;
const obstacleSpawnRate = 90; 
let frameCounter = 0;
let difficultyIncreaseRate = 0.005; 

// Kontrol Durumu
let leftPressed = false;
let rightPressed = false;
let score = 0;

// Oyunun teması için renkleri al
function getThemeColors() {
    const isLight = document.body.classList.contains('light-theme');
    
    // CSS değişkenlerini okuyarak temayı dinamik olarak uygula
    return {
        // Altın/Turuncu tema renkleri
        carColor: isLight ? '#ff9900' : '#fffc7f', 
        carGlow: isLight ? '#ffcc00' : '#ffffff', 
        // Kırmızı Levha Engeli
        obstacleColor: isLight ? '#c0392b' : '#e74c3c', 
        obstacleGlow: isLight ? '#e74c3c' : '#f06292' 
    };
}

// ------------------- ÇİZİM FONKSİYONLARI -------------------

function drawRoad() {
    ctx.fillStyle = '#34495e'; // Koyu Asfalt
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const colors = getThemeColors();
    
    // Yol Şeritleri (Neon Animasyonlu)
    ctx.strokeStyle = colors.carGlow; // Neon Parlama Rengi
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = colors.carGlow; 

    const dashLength = 20;
    const gapLength = 20;
    // Hız azaldığı için animasyon hızı da düşürülmeli
    let offset = frameCounter * 2 % (dashLength + gapLength); 

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
        // Engel (Levha) gövdesi
        ctx.fillStyle = colors.obstacleColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = colors.obstacleGlow;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        
        // Üzerindeki "STOP" yazısı
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Fira Code';
        ctx.textAlign = 'center';
        ctx.fillText('STOP', obs.x + obs.width / 2, obs.y + obs.height / 2 + 5);
    });
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
    // Hız arttıkça oluşturma süresi azalır, ancak minimum 25 frame'den az olamaz
    const dynamicSpawnRate = Math.max(25, obstacleSpawnRate / (1 + (currentObstacleSpeed - baseObstacleSpeed) * 0.5));
    if (frameCounter % Math.floor(dynamicSpawnRate) === 0) {
        spawnObstacle();
    }
}

function spawnObstacle() {
    const obsWidth = 60;
    const obsHeight = 60;
    
    // Rastgele X pozisyonu (yol ve levha sınırları içinde)
    const randomX = Math.random() * (GAME_WIDTH - obsWidth - 20) + 10; 
    
    obstacles.push({
        x: randomX,
        y: -obsHeight, // Ekranın tepesinden gelsin
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
            
            isGameOver = true;
        }
    });
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    const colors = getThemeColors();
    
    // Neon Başlık
    ctx.fillStyle = colors.carColor;
    ctx.shadowBlur = 20;
    ctx.shadowColor = colors.carGlow;
    ctx.font = 'bold 45px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText('OYUN BİTTİ!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);
    
    // Puan
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'white';
    ctx.font = '30px Fira Code';
    ctx.fillText('Puan: ' + score, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
    
    // Yeniden Başlatma Talimatı
    ctx.font = '18px Fira Code';
    ctx.fillStyle = colors.carGlow;
    ctx.fillText('Yeniden Oynamak İçin Sayfayı Yenile', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70);
    
    // Animasyonu durdur
    cancelAnimationFrame(animationFrameId);
}

// ------------------- OYUN DÖNGÜSÜ -------------------

function gameLoop() {
    if (isGameOver) {
        drawGameOver();
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

    frameCounter++;
    animationFrameId = requestAnimationFrame(gameLoop);
}

// ------------------- GİRİŞ İŞLEYİCİLERİ -------------------

// Klavye Kontrolleri
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        leftPressed = true;
    } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        rightPressed = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        leftPressed = false;
    } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        rightPressed = false;
    }
});

// Mobil Kontroller (Buton Dokunmaları)
if (leftBtn && rightBtn) {
    // Sol Buton Basıldığında
    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); leftPressed = true; });
    leftBtn.addEventListener('touchend', () => { leftPressed = false; });
    
    // Sağ Buton Basıldığında
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); rightPressed = true; });
    rightBtn.addEventListener('touchend', () => { rightPressed = false; });
    
    // Tarayıcı sürüklemeyi engellemek için mouse olaylarını da ekleyelim (desktop/mobile test için)
    leftBtn.addEventListener('mousedown', () => { leftPressed = true; });
    leftBtn.addEventListener('mouseup', () => { leftPressed = false; });
    rightBtn.addEventListener('mousedown', () => { rightPressed = true; });
    rightBtn.addEventListener('mouseup', () => { rightPressed = false; });
}


// Oyunun başlatılması
document.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('gameCanvas');
    if (canvasElement) {
        updateScore(); 
        gameLoop(); 
    }
});
