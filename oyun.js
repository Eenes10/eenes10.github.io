// --- OYUN.JS (Realistic Racer: Engellerden Kaçış) ---

document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    const player = document.getElementById('player');
    const startButton = document.getElementById('start-btn');
    const scoreDisplay = document.getElementById('current-score');
    const highScoreDisplay = document.getElementById('high-score');
    const messageDisplay = document.getElementById('game-message');
    const scoresList = document.getElementById('scores-list');

    // Mobil kontrol butonları
    const leftButton = document.getElementById('left-btn');
    const rightButton = document.getElementById('right-btn');
    
    // Yol şeridi elementi (Hızlanma için kullanılır)
    const roadLines = document.getElementById('road-lines');

    // Oyun Alanı Boyutları
    const gameAreaWidth = 300;
    const gameAreaHeight = 450;
    const playerWidth = 40; 
    
    // Oyun Değişkenleri
    let gameInterval;
    let obstacleInterval;
    let score = 0;
    let isGameRunning = false;
    let playerX = (gameAreaWidth - playerWidth) / 2;
    let obstacleSpeed = 3; // Başlangıç engellerin düşme hızı
    let obstacleFrequency = 1500; // Engel oluşturma sıklığı (ms)

    // Yerel Depolamadan skorları yükleme
    const loadScores = () => {
        const scores = JSON.parse(localStorage.getItem('neonRacerHighScores')) || [];
        const maxScore = scores.length > 0 ? scores[0].score : 0;
        highScoreDisplay.textContent = maxScore;
        
        scoresList.innerHTML = scores.map((s, index) => 
            `<li><span>#${index + 1}</span> <strong>${s.score}</strong> (${s.name})</li>`
        ).join('');
    };

    // Yüksek skoru kaydetme
    const saveScore = (newScore) => {
        let scores = JSON.parse(localStorage.getItem('neonRacerHighScores')) || [];
        
        const playerName = prompt(`Yeni Yüksek Skor: ${newScore}! Adınızı girin:`) || 'Anonim';

        scores.push({ score: newScore, name: playerName });
        scores.sort((a, b) => b.score - a.score); 
        scores = scores.slice(0, 5); 
        
        localStorage.setItem('neonRacerHighScores', JSON.stringify(scores));
        loadScores();
    };

    // Aracı hareket ettirme (Daha hızlı tepki için moveStep artırıldı)
    const movePlayer = (direction) => {
        const moveStep = 30; // 30 piksel hareket et (Hızlı tepki)
        // Kenar çizgilerini (5px) hesaba katarak hareket et
        if (direction === 'left') {
            playerX = Math.max(5, playerX - moveStep); 
        } else if (direction === 'right') {
            playerX = Math.min(gameAreaWidth - playerWidth - 5, playerX + moveStep); 
        }
        player.style.left = `${playerX}px`;
    };
    
    // Yol animasyon hızını oyun hızına göre ayarlama
    const updateRoadSpeed = (speed) => {
        // Hız arttıkça animasyon süresi kısalır (hızlanır).
        // 3 (başlangıç hızı) için 0.5s varsayıyoruz.
        const baseSpeed = 3; 
        const baseDuration = 0.5;
        const newDuration = (baseSpeed / speed) * baseDuration;
        
        if (roadLines) {
            // Animasyon süresini dinamik olarak ayarla (en az 0.1 saniye)
            roadLines.style.animationDuration = `${Math.max(0.1, newDuration)}s`; 
        }
    }


    // Engelleri oluşturma
    const createObstacle = () => {
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        
        const obstacleWidth = 40 + Math.random() * 40; 
        const minLeft = 5; 
        const maxLeft = gameAreaWidth - obstacleWidth - 5; 
        const obstacleLeft = minLeft + Math.random() * (maxLeft - minLeft);
        
        obstacle.style.width = `${obstacleWidth}px`;
        obstacle.style.left = `${obstacleLeft}px`;
        
        gameArea.appendChild(obstacle);
    };

    // Çarpışma kontrolü
    const checkCollision = (obstacle) => {
        const playerRect = player.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        return (
            playerRect.left < obstacleRect.right &&
            playerRect.right > obstacleRect.left &&
            playerRect.top < obstacleRect.bottom &&
            playerRect.bottom > obstacleRect.top
        );
    };

    // Oyun döngüsü
    const gameLoop = () => {
        score++;
        scoreDisplay.textContent = score;

        // Her 250 puanda bir hızı artır
        if (score % 250 === 0) {
            obstacleSpeed += 0.5;
            obstacleFrequency = Math.max(500, obstacleInterval - 50); 
            
            // Yol animasyon hızını da güncelle
            updateRoadSpeed(obstacleSpeed); 

            // Engel oluşma hızını da güncelle
            clearInterval(obstacleInterval);
            obstacleInterval = setInterval(createObstacle, obstacleFrequency);
        }

        const obstacles = document.querySelectorAll('.obstacle');
        obstacles.forEach(obstacle => {
            const currentTop = parseFloat(obstacle.style.top) || 0;
            const newTop = currentTop + obstacleSpeed;
            obstacle.style.top = `${newTop}px`;

            // Çarpışma kontrolü
            if (checkCollision(obstacle)) {
                gameOver();
                return;
            }

            // Ekran dışına çıkan engelleri kaldır
            if (newTop > gameAreaHeight) {
                obstacle.remove();
            }
        });
        
        if (!isGameRunning) return;

        gameInterval = requestAnimationFrame(gameLoop);
    };

    // Oyunu başlatma
    const startGame = () => {
        if (isGameRunning) return;

        isGameRunning = true;
        score = 0;
        obstacleSpeed = 3; 
        obstacleFrequency = 1500; 
        scoreDisplay.textContent = score;
        messageDisplay.textContent = 'İyi şanslar! Engellere dikkat et.';
        messageDisplay.style.color = '';
        startButton.textContent = 'OYNANIYOR...';
        startButton.disabled = true;

        // Yol hızını başlangıç değerine ayarla
        updateRoadSpeed(obstacleSpeed);

        document.querySelectorAll('.obstacle').forEach(o => o.remove());

        playerX = (gameAreaWidth - playerWidth) / 2;
        player.style.left = `${playerX}px`;
        player.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';


        obstacleInterval = setInterval(createObstacle, obstacleFrequency);

        gameLoop();
    };

    // Oyun bitti
    const gameOver = () => {
        isGameRunning = false;
        clearInterval(obstacleInterval);
        cancelAnimationFrame(gameInterval);
        
        messageDisplay.textContent = `OYUN BİTTİ! Skorun: ${score}. Tekrar dene.`;
        messageDisplay.style.color = 'red';
        startButton.textContent = 'YENİDEN BAŞLAT';
        startButton.disabled = false;

        const maxScore = parseFloat(highScoreDisplay.textContent) || 0;
        if (score > maxScore) {
            saveScore(score);
        }
        
        // Hata görseli (Kırmızı parlama)
        player.style.boxShadow = '0 0 15px 5px red';
        setTimeout(() => {
             player.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
        }, 500);
    };

    // Klavye dinleyicileri (Sağ ve sol tuşlar bu hareket adımıyla hızlı çalışmalı)
    document.addEventListener('keydown', (e) => {
        if (!isGameRunning) return;
        
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            movePlayer('left');
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            movePlayer('right');
        }
    });

    // Mobil buton dinleyicileri (Touch ve Mouse)
    if(leftButton && rightButton) {
        // Sol tuş
        leftButton.addEventListener('mousedown', (e) => { e.preventDefault(); if (isGameRunning) movePlayer('left'); });
        leftButton.addEventListener('touchstart', (e) => { e.preventDefault(); if (isGameRunning) movePlayer('left'); });

        // Sağ tuş
        rightButton.addEventListener('mousedown', (e) => { e.preventDefault(); if (isGameRunning) movePlayer('right'); });
        rightButton.addEventListener('touchstart', (e) => { e.preventDefault(); if (isGameRunning) movePlayer('right'); });
    }

    loadScores();
    startButton.addEventListener('click', startGame);
});
