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
let isGameRunning = false;
let isGameOver = false;
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

// Oyun Nesneleri (Engeller - Bariyerler ve Kamyonlar)
let obstacles = []; // Tüm engeller (Bariyer + Kamyon)
let baseObstacleSpeed = 2 * speedMultiplier; 
let currentObstacleSpeed;
const baseObstacleSpawnRate = 120; 

// MOBİL İÇİN SIKLIK ARTIŞI: Mobil cihazlarda engel çıkışını %30 daha sık yap
const obstacleSpawnRate = isMobile ? Math.floor(baseObstacleSpawnRate * 0.7) : baseObstacleSpawnRate;

let frameCounter = 0;
let difficultyIncreaseRate = 0.001; 

// YENİ: Yakın Geçiş Bonusu Ayarları
const nearMissDistance = 15; // 15 pikselden daha yakın geçiş
let nearMissCombo = 0;
let comboTimer = 0;
const comboTimeout = 60; // 1 saniye (60 FPS varsayımıyla)
const comboDisplay = document.createElement('div'); // Kombo metni için DOM elementi
comboDisplay.id = 'combo-display';
document.body.appendChild(comboDisplay); 

// Görsel Geri Bildirim Ayarları
let scoreAnimations = []; 
let shakeDuration = 0; 

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
        // YENİ: Kamyon Renkleri
        truckBody: '#4682B4', 
        truckCabin: '#36454F',
        truckGlow: '#00BFFF'
    };
}

// ------------------- ÇİZİM FONKSİYONLARI -------------------

function drawRoad() {
    // [YOL ÇİZİM KODU AYNI]
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
    // [ARABA ÇİZİM KODU AYNI]
    const colors = getThemeColors();
    
    ctx.fillStyle = colors.carColor;
    ctx.shadowBlur = 15 * mobileShadowReduction; 
    ctx.shadowColor = colors.carGlow;
    ctx.fillRect(carX, carY, carWidth, carHeight);
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; 
    ctx.fillRect(carX + 5, carY + 5, carWidth - 10, 15);
    
    ctx.shadowBlur = 0;
}

function drawObstacles() {
    const colors = getThemeColors();
    
    obstacles.forEach(obs => {
        // Çizim tipine göre farklı çizim fonksiyonu çağır
        if (obs.type === 'barrier') {
            // Bariyer Çizimi
            const barrierTotalWidth = obs.width;
            const barrierTotalHeight = obs.height;
            const boardHeight = barrierTotalHeight * 0.35; 
            const boardGap = barrierTotalHeight * 0.15; 
            const boardY1 = obs.y;
            const boardY2 = obs.y + boardHeight + boardGap;
            const supportWidth = 5; 
            const lampRadius = 4; 

            ctx.shadowBlur = 8 * mobileShadowReduction; 
            ctx.shadowColor = colors.barrierGlow;

            ctx.fillStyle = colors.barrierMetal;
            ctx.fillRect(obs.x + 3, obs.y + boardHeight * 0.8, supportWidth, barrierTotalHeight * 0.5);
            ctx.fillRect(obs.x + barrierTotalWidth - 3 - supportWidth, obs.y + boardHeight * 0.8, supportWidth, barrierTotalHeight * 0.5);
            
            const stripeWidth = boardHeight / 2;
            [boardY1, boardY2].forEach(y => {
                for (let i = 0; i < barrierTotalWidth; i += stripeWidth) {
                    ctx.fillStyle = (Math.floor(i / stripeWidth) % 2 === 0) ? colors.barrierOrange : 'white';
                    ctx.fillRect(obs.x + i, y, stripeWidth, boardHeight);
                }
            });

            ctx.shadowBlur = 12 * mobileShadowReduction; 
            ctx.shadowColor = colors.barrierRed;
            ctx.fillStyle = colors.barrierRed;
            [0.25, 0.75].forEach(pos => {
                ctx.beginPath();
                ctx.arc(obs.x + barrierTotalWidth * pos, boardY1 + 3, lampRadius, 0, Math.PI * 2);
                ctx.fill();
            });

        } else if (obs.type === 'truck') {
            // YENİ: Kamyon Çizimi
            const truckWidth = obs.width;
            const truckHeight = obs.height;
            const cabinHeight = truckHeight * 0.2;

            ctx.shadowBlur = 10 * mobileShadowReduction; 
            ctx.shadowColor = colors.truckGlow;

            // Kasa (Neon Mavi)
            ctx.fillStyle = colors.truckBody;
            ctx.fillRect(obs.x, obs.y, truckWidth, truckHeight);

            // Kabin (Gri)
            ctx.fillStyle = colors.truckCabin;
            ctx.fillRect(obs.x, obs.y, truckWidth, cabinHeight);

            // Far/Stop Işıkları (Neon Sarı/Kırmızı)
            ctx.shadowBlur = 8 * mobileShadowReduction;
            // Ön Farlar (Üstte)
            ctx.fillStyle = colors.carGlow;
            ctx.fillRect(obs.x + 3, obs.y + 3, 5, 5);
            ctx.fillRect(obs.x + truckWidth - 8, obs.y + 3, 5, 5);
            // Stoplar (Altta)
            ctx.fillStyle = colors.barrierRed;
            ctx.fillRect(obs.x + 3, obs.y + truckHeight - 8, 5, 5);
            ctx.fillRect(obs.x + truckWidth - 8, obs.y + truckHeight - 8, 5, 5);
        }
    });
    ctx.shadowBlur = 0;
}


function drawScoreAnimations() {
    // [PUAN ANİMASYONU KODU AYNI]
    scoreAnimations.forEach((anim, index) => {
        anim.y -= 1 * speedMultiplier; 
        anim.opacity -= 0.02 * speedMultiplier; 

        ctx.fillStyle = `rgba(255, 255, 255, ${anim.opacity})`;
        ctx.font = 'bold 20px Fira Code';
        ctx.textAlign = 'center';
        ctx.fillText(anim.text, anim.x, anim.y);

        if (anim.opacity <= 0) {
            scoreAnimations.splice(index, 1);
        }
    });
}

// YENİ: Kombo Sayacını Güncelle
function updateComboDisplay() {
    if (nearMissCombo > 0) {
        comboTimer--;
        comboDisplay.textContent = `KOMBO x${nearMissCombo}`;
        comboDisplay.style.opacity = '1';
        comboDisplay.style.transform = 'translateY(0)';
        
        if (comboTimer <= 0) {
            nearMissCombo = 0;
            comboDisplay.style.opacity = '0';
            comboDisplay.style.transform = 'translateY(-20px)';
        }
    } else {
        comboDisplay.textContent = '';
        comboDisplay.style.opacity = '0';
    }
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
    currentObstacleSpeed += difficultyIncreaseRate;

    // Engelleri hareket ettir
    obstacles.forEach(obs => {
        obs.y += currentObstacleSpeed;

        // YENİ: Kamyonun Yana Hareketi
        if (obs.type === 'truck') {
            if (obs.x + obs.width + 10 >= GAME_WIDTH || obs.x <= 10) {
                obs.direction *= -1; // Yön değiştir
            }
            obs.x += obs.direction * 1 * speedMultiplier; 
        }
    });


    // Ekran dışına çıkan engelleri sil ve puanı artır
    obstacles = obstacles.filter(obs => {
        if (obs.y < GAME_HEIGHT) {
            return true;
        } else {
            // Normal puan kazanımı
            const baseScore = 10;
            const totalScore = baseScore * Math.max(1, nearMissCombo); // Kombo çarpanı

            scoreAnimations.push({ 
                x: carX + carWidth / 2, 
                y: carY, 
                text: `+${totalScore}`, 
                opacity: 1.0 
            });

            score += totalScore;
            updateScore();
            return false;
        }
    });

    // Yeni engel oluşturma
    const dynamicSpawnRate = Math.max(40, obstacleSpawnRate / (1 + (currentObstacleSpeed / speedMultiplier - baseObstacleSpeed / speedMultiplier) * 0.5));
    if (frameCounter % Math.floor(dynamicSpawnRate) === 0) {
        // Rastgele bariyer veya kamyon oluştur
        if (Math.random() < 0.75) { // %75 bariyer
            spawnObstacle('barrier');
        } else { // %25 kamyon
            spawnObstacle('truck');
        }
    }

    // Kombo Sayacını Güncelle
    updateComboDisplay();
}

function spawnObstacle(type) {
    let obsWidth, obsHeight, initialX;

    if (type === 'barrier') {
        obsWidth = 60; 
        obsHeight = 40; 
        initialX = Math.random() * (GAME_WIDTH - obsWidth - 20) + 10; 
        
        obstacles.push({
            x: initialX,
            y: -obsHeight, 
            width: obsWidth,
            height: obsHeight,
            type: 'barrier'
        });
    } else if (type === 'truck') {
        obsWidth = 80; 
        obsHeight = 150; // Çok daha büyük
        initialX = Math.random() > 0.5 ? 10 : GAME_WIDTH - obsWidth - 10; // Başlangıçta kenara yakın
        
        obstacles.push({
            x: initialX,
            y: -obsHeight, 
            width: obsWidth,
            height: obsHeight,
            type: 'truck',
            direction: (initialX === 10) ? 1 : -1 // Yana hareket yönü
        });
    }
}


function checkCollision() {
    // Çarpışma ve Yakın Geçiş kontrolü
    obstacles.forEach(obs => {
        
        // 1. Gerçek Çarpışma Tespiti (AABB)
        if (carX < obs.x + obs.width &&
            carX + carWidth > obs.x &&
            carY < obs.y + obs.height &&
            carY + carHeight > obs.y) {
            
            shakeDuration = 10; 
            nearMissCombo = 0; // Çarpışmada kombo sıfırlanır
            gameOver();
        }

        // 2. YENİ: Yakın Geçiş Bonusu Kontrolü
        const isMissed = obs.y + obs.height >= carY && obs.y + obs.height <= carY + currentObstacleSpeed; // Tamamlanan engel
        
        if (isMissed) {
             // Aracın sol/sağ kenarı ile engelin sol/sağ kenarı arasındaki minimum mesafe
            const missLeft = Math.abs(carX + carWidth - obs.x);
            const missRight = Math.abs(obs.x + obs.width - carX);
            const minMiss = Math.min(missLeft, missRight);
            
            if (minMiss <= nearMissDistance) {
                // Yakın Geçiş!
                nearMissCombo++;
                comboTimer = comboTimeout;
                
                scoreAnimations.push({ 
                    x: carX + carWidth / 2, 
                    y: carY - 20, 
                    text: `+5 YAKIN GEÇİŞ!`, // Ekstra bonus puan
                    opacity: 1.0 
                });
                score += 5 * nearMissCombo; // Kombo ile artan yakın geçiş bonusu
                updateScore();
            } else {
                // Engel geçildi ama yeterince yakın değildi, kombo zamanlayıcısını başlat/sıfırla
                comboTimer = Math.max(comboTimer, 1); // En az 1 frame daha kombo şansı ver
            }
        }
    });
}

// ------------------- OYUN DÖNGÜSÜ VE DURUM YÖNETİMİ -------------------

function initGame() {
    carX = GAME_WIDTH / 2 - carWidth / 2;
    carY = GAME_HEIGHT - carHeight - 30;

    score = 0;
    obstacles = [];
    scoreAnimations = []; 
    nearMissCombo = 0; // Kombo sıfırla
    comboTimer = 0; // Kombo zamanlayıcı sıfırla
    comboDisplay.style.opacity = '0'; // Kombo gösterimini gizle
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
