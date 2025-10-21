// game_script.js

// Canvas ve Çizim Bağlamını Al
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');

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
let baseObstacleSpeed = 4;
let currentObstacleSpeed = baseObstacleSpeed;
const obstacleSpawnRate = 90; // Frame cinsinden
let frameCounter = 0;
let difficultyIncreaseRate = 0.005; // Her frame'de hız artışı

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
    let offset = frameCounter * 3 % (dashLength + gapLength); 

    for (let i = -dashLength; i < GAME_HEIGHT; i += (dashLength + gapLength)) {
        ctx.beginPath();
        // Ortadaki şerit
        ctx.setLineDash([dashLength, gapLength]);
        ctx.moveTo(GAME_WIDTH / 2, i + offset);
        ctx.lineTo(GAME_WIDTH / 2, i + offset + dashLength);
        ctx.stroke();
    }
    
    // Kenar çizgileri (Sabit)
    ctx.setLineDash([0, 0]); // Kesikli çizgiyi sıfırla
    ctx.lineWidth = 2;
    ctx.moveTo(10, 0); ctx.lineTo(10, GAME_HEIGHT); ctx.stroke();
    ctx.moveTo(GAME_WIDTH - 10, 0); ctx.lineTo(GAME_WIDTH - 10, GAME_HEIGHT); ctx.stroke();
    
    // Gölgeyi temizle
    ctx.shadowBlur = 0;
}

function drawCar() {
    const colors = getThemeColors();
    
    // Araba gövdesi (Neon Parlaklığı)
    ctx.fillStyle = colors.carColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors.carGlow;
    ctx.fillRect(carX, carY, carWidth, carHeight);
    
    // Detaylar (Parlama olmadan)
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Cam
    ctx.fillRect(carX + 5, carY + 5, carWidth - 10, 15);
    
    // Tekrar parlaklığı aç
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
        // Yazıyı engelin ortasına konumla
        ctx.fillText('STOP', obs.x + obs.width / 2, obs.y + obs.height / 2 + 5);
    });
    // Gölgeyi temizle
    ctx.shadowBlur = 0;
}

function updateScore() {
    // HTML elementini güncelle
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

    // Yeni engel oluşturma (hız arttıkça daha sık)
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

// Oyunun başlatılması
document.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('gameCanvas');
    if (canvasElement) {
        updateScore(); 
        gameLoop(); 
    }
});
