// --- OYUN.JS (Simon Diyor ki) ---

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-btn');
    const buttons = document.querySelectorAll('.simon-btn');
    const levelDisplay = document.getElementById('level');
    const messageDisplay = document.getElementById('message');
    const colors = ['red', 'green', 'blue', 'yellow'];

    let sequence = []; // Bilgisayarın göstereceği sıra
    let playerSequence = []; // Oyuncunun girdiği sıra
    let level = 0;
    let isGameRunning = false;
    let canClick = false;

    // Butonun yanıp sönme efekti
    const flashButton = (button) => {
        return new Promise(resolve => {
            button.classList.add('active');

            setTimeout(() => {
                button.classList.remove('active');
                setTimeout(() => resolve(), 200); // Kısa bir bekleme
            }, 500); // 0.5 saniye yanık kal
        });
    };

    // Bilgisayarın sırayı göstermesi
    const showSequence = async () => {
        canClick = false; // Kullanıcı tıklamalarını engelle
        messageDisplay.textContent = 'Beni izle...';
        
        // Sıradaki her butonu yanıp söndür
        for (let i = 0; i < sequence.length; i++) {
            const color = sequence[i];
            const button = document.querySelector(`[data-color="${color}"]`);
            await flashButton(button);
        }
        
        // Sıra bitti, şimdi sıra oyuncuda
        canClick = true;
        messageDisplay.textContent = 'Sırayı tekrarla!';
    };

    // Oyuna bir adım ekle
    const nextLevel = () => {
        level++;
        playerSequence = [];
        levelDisplay.textContent = `Seviye: ${level}`;
        
        // Rastgele bir renk seç ve sıraya ekle
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        sequence.push(randomColor);
        
        setTimeout(() => {
            showSequence();
        }, 1000); // 1 saniye sonra sırayı göstermeye başla
    };

    // Oyuncunun tıklamasını kontrol et
    const handlePlayerClick = (e) => {
        if (!isGameRunning || !canClick) return;

        const clickedColor = e.target.dataset.color;
        playerSequence.push(clickedColor);
        
        // Hata durumunda hemen oyunu bitir
        if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
            gameOver();
            return;
        }

        // Sıra tamamlandıysa bir sonraki seviyeye geç
        if (playerSequence.length === sequence.length) {
            canClick = false;
            messageDisplay.textContent = 'Harika! Hazırlan...';
            setTimeout(nextLevel, 1500);
        }
    };

    // Oyun bitti
    const gameOver = () => {
        isGameRunning = false;
        canClick = false;
        
        messageDisplay.textContent = `OYUN BİTTİ! Skorun: ${level - 1}. Tekrar dene.`;
        messageDisplay.style.color = 'red';
        levelDisplay.textContent = `Son Skor: ${level - 1}`; // Son skoru göster

        startButton.textContent = 'YENİDEN BAŞLAT';
        // Tüm butonları kısa bir süre kırmızı yakıp söndürerek hata bildirimi
        buttons.forEach(button => {
            button.classList.add('active', 'red');
            setTimeout(() => {
                button.classList.remove('active', 'red');
            }, 500);
        });
    };

    // Oyunu başlat/sıfırla
    const startGame = () => {
        if (isGameRunning) return;

        isGameRunning = true;
        sequence = [];
        playerSequence = [];
        level = 0;
        canClick = false;
        messageDisplay.style.color = 'var(--neon-glow-color)';
        startButton.textContent = 'OYNANIYOR...';

        nextLevel();
    };

    // Olay Dinleyicileri
    startButton.addEventListener('click', startGame);
    buttons.forEach(button => {
        button.addEventListener('click', handlePlayerClick);
        // Basıldığında anlık parlamayı sağlamak için
        button.addEventListener('mousedown', () => { if(canClick) button.classList.add('active'); });
        button.addEventListener('mouseup', () => { if(canClick) button.classList.remove('active'); });
        button.addEventListener('mouseleave', () => { if(canClick) button.classList.remove('active'); });
    });
});
