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
const mobileShadowReduction = isMobile ? 0.5 : 1.0; // Neon kaldırıldığı için artık kullanılmıyor, ancak diğer değerlerle tutarlılık için tutuldu

// Oyuncu Ayarları (Araba)
const carWidth = 40;
const carHeight = 70;
let carX;
let carY;
const carSpeed = 4 * speedMultiplier; 

// Oyun Nesneleri (Engeller - Bariyerler, Kamyonlar ve Trafik Arabaları)
let obstacles = [];
let baseObstacleSpeed = 2 * speedMultiplier; 
let currentObstacleSpeed;
const baseObstacleSpawnRate = 120; 

// MOBİL İÇİN SIKLIK ARTIŞI
const obstacleSpawnRate = isMobile ? Math.floor(baseObstacleSpawnRate * 0.7) : baseObstacleSpawnRate;

let frameCounter = 0;
let difficultyIncreaseRate = 0.001; 

// Yakın Geçiş Bonusu Ayarları
const nearMissDistance = 15; 
let nearMissCombo = 0;
let comboTimer = 0;
const comboTimeout = 60; 
const comboDisplay = document.getElementById('combo-display'); // DOM'dan alındı

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
        // SADELİK İÇİN DÜZ RENKLER
        carColor: isLight ? '#3498db' : '#2ecc71', // Oyuncu Rengi (Mavi/Yeşil)
        barrierColor: isLight ? '#e74c3c' : '#c0392b', // Bariyer Kırmızı
        truckColor: isLight ? '#95a5a6' : '#7f8c8d', // Kamyon Gri
        trafficCarColor: isLight ? '#f1c40f' : '#f39c12', // Trafik Araba Sarı
        roadColor: '#34495e', // Yol
        lineColor: '#ecf0f1', // Yol Çizgisi
        fillColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.4)' // Araba/Kamyon içi dolgu
    };
}

// ------------------- ÇİZİM FONKSİYONLARI -------------------

function drawRoad() {
    const colors = getThemeColors();
    
    // Yol Arka Planı
    ctx.fillStyle = colors.roadColor; 
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

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

    // Yol Şeritleri (Sade Çizgi)
    ctx.strokeStyle = colors.lineColor; 
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0; // GÖLGE KALDIRILDI

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
    
    ctx.restore(); 
}

// SADE VE ŞIK ARABA MODELLEMESİ
function drawCar() {
    const colors = getThemeColors();
    const x = carX;
    const y = carY;
    const w = carWidth;
    const h = carHeight;

    ctx.shadowBlur = 0; // GÖLGE KALDIRILDI
    ctx.fillStyle = colors.carColor; 
    ctx.strokeStyle = colors.carColor; 
    ctx.lineWidth = 1;

    // 1. Ana Gövde (Düz Doldurma)
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x + w / 2, y); // Ön burun
    ctx.lineTo(x + w, y + 10);
    ctx.lineTo(x + w, y + h - 10);
    ctx.lineTo(x + w / 2, y + h); // Arka
    ctx.lineTo(x, y + h - 10);
    ctx.closePath();
    ctx.fill();

    // 2. Kabin (Cam)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Koyu gri cam
    ctx.fillRect(x + w * 0.15, y + h * 0.25, w * 0.7, h * 0.25);
    
    // 3. Farlar ve Stoplar (Basit Düz Renkler)
    ctx.fillStyle = '#f1c40f'; // Sarı far
    ctx.fillRect(x + 5, y + 2, 5, 5); 
    ctx.fillRect(x + w - 10, y + 2, 5, 5);
    
    ctx.fillStyle = '#e74c3c'; // Kırmızı stop
    ctx.fillRect(x + 5, y + h - 7, 5, 5); 
    ctx.fillRect(x + w - 10, y + h - 7, 5, 5);

    ctx.shadowBlur = 0;
}

function drawObstacles() {
    const colors = getThemeColors();
    
    obstacles.forEach(obs => {
        ctx.shadowBlur = 0; // GÖLGELER KALDIRILDI
        
        if (obs.type === 'barrier') {
            // SADELİK: Düz Kutu Bariyer
            const barrierTotalWidth = obs.width;
            const barrierTotalHeight = obs.height;

            ctx.fillStyle = colors.barrierColor; 
            ctx.fillRect(obs.x, obs.y, barrierTotalWidth, barrierTotalHeight);
            
            // Üçgen destekler
            ctx.fillStyle = '#7f8c8d'; 
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + barrierTotalHeight);
            ctx.lineTo(obs.x + 10, obs.y + barrierTotalHeight);
            ctx.lineTo(obs.x, obs.y + barrierTotalHeight - 10);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(obs.x + barrierTotalWidth, obs.y + barrierTotalHeight);
            ctx.lineTo(obs.x + barrierTotalWidth - 10, obs.y + barrierTotalHeight);
            ctx.lineTo(obs.x + barrierTotalWidth, obs.y + barrierTotalHeight - 10);
            ctx.fill();

        } else if (obs.type === 'truck') {
            // SADELİK: Düz Kamyon
            const truckWidth = obs.width;
            const truckHeight = obs.height;
            const cabinHeight = truckHeight * 0.2;

            ctx.fillStyle = colors.truckColor; 
            ctx.fillRect(obs.x, obs.y, truckWidth, truckHeight);

            // Kabin ayrı bir renk
            ctx.fillStyle = '#34495e';
            ctx.fillRect(obs.x, obs.y, truckWidth, cabinHeight);

            // Işıklar
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(obs.x + 5, obs.y + 5, 5, 5);
            ctx.fillRect(obs.x + truckWidth - 10, obs.y + 5, 5, 5);
            
        } else if (obs.type === 'trafficCar') {
            // SADELİK: Mavi Trafik Arabası (Oyuncu modeline benzer)
            const x = obs.x;
            const y = obs.y;
            const w = obs.width;
            const h = obs.height;

            ctx.fillStyle = colors.trafficCarColor;
            
            // Ana Gövde
            ctx.beginPath();
            ctx.moveTo(x, y + 10);
            ctx.lineTo(x + w / 2, y); 
            ctx.lineTo(x + w, y + 10);
            ctx.lineTo(x + w, y + h - 10);
            ctx.lineTo(x + w / 2, y + h); 
            ctx.lineTo(x, y + h - 10);
            ctx.closePath();
            ctx.fill();

            // Kabin (Cam)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(x + w * 0.15, y + h * 0.25, w * 0.7, h * 0.25);
            
            // Işıklar
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(x + 5, y + 2, 5, 5); 
            ctx.fillRect(x + w - 10, y + 2, 5, 5);
        }
    });
    ctx.shadowBlur = 0;
}


function drawScoreAnimations() {
    scoreAnimations.forEach((anim, index) => {
        anim.y -= 1 * speedMultiplier; 
        anim.opacity -= 0.02 * speedMultiplier; 

        // SADE: Beyaz Puan Metni
        ctx.fillStyle = `rgba(255, 255, 255, ${anim.opacity})`;
        ctx.font = 'bold 20px Fira Code';
        ctx.textAlign = 'center';
        ctx.fillText(anim.text, anim.x, anim.y);

        if (anim.opacity <= 0) {
            scoreAnimations.splice(index, 1);
        }
    });
}

function updateComboDisplay() {
    if (!comboDisplay) return;

    if (nearMissCombo > 0) {
        comboTimer--;
        comboDisplay.textContent = `KOMBO x${nearMissCombo}`;
        // Sade: Düz Beyaz Kombo Metni
        comboDisplay.style.opacity = '1';
        comboDisplay.style.transform = 'translate(-50%, 0)';
        comboDisplay.style.color = '#fff';
        comboDisplay.style.textShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
        
        if (comboTimer <= 0) {
            nearMissCombo = 0;
            comboDisplay.style.opacity = '0';
            comboDisplay.style.transform = 'translate(-50%, -20px)';
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
        obs.y += obs.speed || currentObstacleSpeed;

        // Kamyonun Yana Hareketi
        if (obs.type === 'truck') {
            if (obs.x + obs.width + 10 >= GAME_WIDTH || obs.x <= 10) {
                obs.direction *= -1; 
            }
            obs.x += obs.direction * 1 * speedMultiplier; 
        }

        // Trafik Arabasının Yana Hareketi (Zikzak)
        if (obs.type === 'trafficCar') {
            const sineWave = Math.sin(frameCounter / 15) * 1; 
            obs.x += obs.direction * sineWave * speedMultiplier;

            if (obs.x + obs.width > GAME_WIDTH - 10 || obs.x < 10) {
                 obs.direction *= -1; 
            }
        }
    });


    // Ekran dışına çıkan engelleri sil ve puanı artır
    obstacles = obstacles.filter(obs => {
        if (obs.y < GAME_HEIGHT) {
            return true;
        } else {
            const baseScore = obs.type === 'trafficCar' ? 15 : 10;
            const totalScore = baseScore * Math.max(1, nearMissCombo); 

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
        const rand = Math.random();
        if (rand < 0.60) { 
            spawnObstacle('barrier');
        } else if (rand < 0.85) { 
            spawnObstacle('truck');
        } else { 
            spawnObstacle('trafficCar');
        }
    }

    // Kombo Sayacını Güncelle
    updateComboDisplay();
}

function spawnObstacle(type) {
    let obsWidth, obsHeight, initialX, customSpeed = null;

    if (type === 'barrier') {
        obsWidth = 60; 
        obsHeight = 40; 
    } else if (type === 'truck') {
        obsWidth = 80; 
        obsHeight = 150; 
    } else if (type === 'trafficCar') {
        obsWidth = carWidth - 5; 
        obsHeight = carHeight + 10; 
        customSpeed = currentObstacleSpeed * 0.8; 
    }

    initialX = Math.random() * (GAME_WIDTH - obsWidth - 20) + 10; 
        
    obstacles.push({
        x: initialX,
        y: -obsHeight, 
        width: obsWidth,
        height: obsHeight,
        type: type,
        direction: (initialX > GAME_WIDTH / 2) ? -1 : 1, 
        speed: customSpeed
    });
}


function checkCollision() {
    obstacles.forEach(obs => {
        
        // 1. Gerçek Çarpışma Tespiti (AABB)
        if (carX < obs.x + obs.width &&
            carX + carWidth > obs.x &&
            carY < obs.y + obs.height &&
            carY + carHeight > obs.y) {
            
            shakeDuration = 10; 
            nearMissCombo = 0; 
            gameOver();
        }

        // 2. Yakın Geçiş Bonusu Kontrolü
        const isMissed = obs.y + obs.height >= carY && obs.y + obs.height <= carY + currentObstacleSpeed;
        
        if (isMissed) {
            const missLeft = Math.abs(carX + carWidth - obs.x);
            const missRight = Math.abs(obs.x + obs.width - carX);
            const minMiss = Math.min(missLeft, missRight);
            
            if (minMiss <= nearMissDistance) {
                nearMissCombo++;
                comboTimer = comboTimeout;
                
                scoreAnimations.push({ 
                    x: carX + carWidth / 2, 
                    y: carY - 20, 
                    text: `+5 YAKIN GEÇİŞ!`, 
                    opacity: 1.0 
                });
                score += 5 * nearMissCombo; 
                updateScore();
            } else {
                comboTimer = Math.max(comboTimer, 1);
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
    nearMissCombo = 0; 
    comboTimer = 0; 
    if(comboDisplay) comboDisplay.style.opacity = '0';
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
        // Kontrol edin, kombo display elementini DOM'a ekleyin eğer yoksa
        if (!document.getElementById('combo-display')) {
            const newComboDisplay = document.createElement('div');
            newComboDisplay.id = 'combo-display';
            // Sade stil için gerekli minimum CSS
            newComboDisplay.style.cssText = `
                position: absolute; top: 50%; left: 50%; 
                transform: translate(-50%, -20px); font-size: 2.5rem; 
                font-weight: 900; color: #fff; opacity: 0; 
                transition: opacity 0.3s ease, transform 0.3s ease; 
                pointer-events: none; z-index: 100; text-shadow: 0 0 5px rgba(0,0,0,0.5);
            `;
            document.body.appendChild(newComboDisplay);
        }
        initGame(); 
    }
});
