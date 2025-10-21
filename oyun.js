// --- OYUN.JS (Neon Racer: Engellerden Kaçış) ---

document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('game-area');
    const player = document.getElementById('player');
    const startButton = document.getElementById('start-btn');
    const scoreDisplay = document.getElementById('current-score');
    const highScoreDisplay = document.getElementById('high-score');
    const messageDisplay = document.getElementById('game-message');
    const scoresList = document.getElementById('scores-list');

    // Oyun Alanı Boyutları
    const gameAreaWidth = 300;
    const gameAreaHeight = 450;
    const playerWidth = 30;
    const playerHeight = 50;

    // Oyun Değişkenleri
    let gameInterval;
    let obstacleInterval;
    let score = 0;
    let isGameRunning = false;
    let playerX = (gameAreaWidth - playerWidth) / 2;
    let obstacleSpeed = 2; // Başlangıç engellerin düşme hızı
    let obstacleFrequency = 1500; // Engel oluşturma sıklığı (ms)

    // Yerel Depolamadan skorları yükleme
    const loadScores = () => {
        const scores = JSON.parse(localStorage.getItem('neonRacerHighScores')) || [];
        // En yüksek skoru ana ekranda göster
        const maxScore = scores.length > 0 ? scores[0].score : 0;
        highScoreDisplay.textContent = maxScore;
        
        // Skor listesini doldur
        scoresList.innerHTML = scores.map((s, index) => 
            `<li><span>#${index + 1}</span> <strong>${s.score}</strong> (${s.name})</li>`
        ).join('');
    };

    // Yüksek skoru kaydetme
    const saveScore = (newScore) => {
        let scores = JSON.parse(localStorage.getItem('neonRacerHighScores')) || [];
        
        const playerName = prompt(`Yeni Yüksek Skor: ${newScore}! Adınızı girin:`) || 'Anonim';

        scores.push({ score: newScore, name: playerName });
        scores.sort((a, b) => b.score - a.score); // Puanlara göre sırala
        scores = scores.slice(0, 5); // İlk 5 skoru tut
        
        localStorage.setItem('neonRacerHighScores', JSON.stringify(scores));
        loadScores();
    };

    // Aracı hareket ettirme
    const movePlayer = (direction) => {
        const moveStep = 20; // 20 piksel hareket et
        if (direction === 'left') {
            playerX = Math.max(0, playerX - moveStep);
        } else if (direction === 'right') {
            playerX = Math.min(gameAreaWidth - playerWidth, playerX + moveStep);
        }
        player.style.left = `${playerX}px`;
    };

    // Engelleri oluşturma
    const createObstacle = () => {
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        
        const obstacleWidth = 40 + Math.random() * 40; // Genişlik rastgele
        const obstacleLeft = Math.random() * (gameAreaWidth - obstacleWidth); // Rastgele yatay konum
        
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

    // Oyun döngüsü (Engelleri hareket ettirme ve kontrol)
    const gameLoop = () => {
        score++;
        scoreDisplay.textContent = score;

        // Her 250 puanda bir hızı artır
        if (score % 250 === 0) {
            obstacleSpeed += 0.5;
            obstacleFrequency = Math.max(500, obstacleFrequency - 50); // Maksimum hızı sınırla
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
        
        // gameOver çağrılmışsa döngüyü durdur
        if (!isGameRunning) return;

        // Oyun hızına göre döngüyü tekrarla
        gameInterval = requestAnimationFrame(gameLoop);
    };

    // Oyunu başlatma
    const startGame = () => {
        if (isGameRunning) return;

        isGameRunning = true;
        score = 0;
        obstacleSpeed = 2; // Hızı sıfırla
        obstacleFrequency = 1500; // Sıklığı sıfırla
        scoreDisplay.textContent = score;
        messageDisplay.textContent = 'İyi şanslar! Engellere dikkat et.';
        messageDisplay.style.color = '';
        startButton.textContent = 'OYNANIYOR...';
        startButton.disabled = true;

        // Tüm eski engelleri temizle
        document.querySelectorAll('.obstacle').forEach(o => o.remove());

        // Oyuncu pozisyonunu sıfırla
        playerX = (gameAreaWidth - playerWidth) / 2;
        player.style.left = `${playerX}px`;
        player.style.boxShadow = '0 0 10px var(--neon-main-color), 0 0 20px var(--neon-glow-color)';


        // Yeni engelleri başlat
        obstacleInterval = setInterval(createObstacle, obstacleFrequency);

        // Ana oyun döngüsünü başlat
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

        // Yeni bir yüksek skor yapıldıysa kaydet
        const maxScore = parseFloat(highScoreDisplay.textContent) || 0;
        if (score > maxScore) {
            saveScore(score);
        }
        
        // Hata görseli (Araba yanıp söner)
        player.style.boxShadow = '0 0 30px 10px red';
        setTimeout(() => {
             player.style.boxShadow = '0 0 10px var(--neon-main-color), 0 0 20px var(--neon-glow-color)';
        }, 500);
    };

    // Klavye dinleyicileri
    document.addEventListener('keydown', (e) => {
        if (!isGameRunning) return;
        
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            movePlayer('left');
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            movePlayer('right');
        }
    });

    // Başlangıçta skorları yükle ve butona olay dinleyicisini ekle
    loadScores();
    startButton.addEventListener('click', startGame);
});
