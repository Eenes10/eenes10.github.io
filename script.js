// --- SCRIPT.JS (SON VE TAM HALİ - OYUN VE SİTE İŞLEVLERİ) ---

// Mobil menü fonksiyonu
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    if (!burger || !nav) return;
    const navLinks = nav.querySelectorAll('li');

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
        
        // Linklerin tek tek kayma animasyonu
        navLinks.forEach((link, index) => {
            if (nav.classList.contains('nav-active')) {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            } else {
                // Menü kapanırken animasyonu sıfırla
                link.style.animation = '';
            }
        });
    });

    // DÜZELTME: Mobil Menü Linkine Tıklayınca Kapatma
    navLinks.forEach(li => {
        const link = li.querySelector('a'); 
        if (link) { 
             link.addEventListener('click', (e) => {
                // Sadece normal link tıklamalarında menüyü kapat
                if (nav.classList.contains('nav-active') && link.href.includes('.html') && !(e.ctrlKey || e.metaKey || link.target === '_blank')) {
                    nav.classList.remove('nav-active');
                    burger.classList.remove('toggle');
                    navLinks.forEach(link => link.style.animation = '');
                }
            });
        }
    });
};

// Sayfa geçiş animasyonu
const pageTransition = () => {
    const body = document.querySelector('body');
    const navLoader = document.querySelector('.nav-loader'); 

    // Sayfa yüklendiğinde fade-out class'ını kaldır
    body.classList.remove('fade-out');
    if (navLoader) {
        navLoader.classList.remove('loading');
    }

    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const url = link.href;
            
            // # (sayfa içi link) veya _blank (yeni sekme) veya Ctrl/Meta tuşlarıyla açılmasını engelleme
            if (url.includes('#') || link.target === '_blank' || e.ctrlKey || e.metaKey) return;
            
            // Aynı domain içindeki farklı bir sayfaya yönlendirme kontrolü
            if (url.startsWith(window.location.origin) && url.includes('.html')) {
                e.preventDefault();

                if (navLoader) {
                    navLoader.classList.add('loading');
                }
                body.classList.add('fade-out');
                
                setTimeout(() => {
                    window.location.href = url;
                }, 600); // Süre 600ms (0.6s)
            }
        });
    });
};

// Giscus'a Tema Değişikliğin Bildirme
const setGiscusTheme = (theme) => {
    const giscusTheme = theme === 'light' ? 'light' : 'dark_dimmed'; 
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;

    iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme } } },
        'https://giscus.app'
    );
}

// Tema değiştirme fonksiyonu
const themeHandler = () => {
    const toggleButton = document.getElementById('theme-toggle');
    const body = document.body;
    
    // 1. Kayıtlı temayı yükle
    const savedTheme = localStorage.getItem('theme');
    let currentTheme = 'dark';
    
    if (savedTheme === 'light' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        body.classList.add('light-theme');
        currentTheme = 'light';
    } else {
        body.classList.remove('light-theme');
    }

    // İlk yüklemede Giscus temasını ayarla
    setTimeout(() => setGiscusTheme(currentTheme), 500); 


    // 2. Buton tıklama olayını dinle
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            
            const newTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            
            // Tema değiştiğinde Giscus'a bildir
            setGiscusTheme(newTheme);
        });
    }
};

// --- ARABA OYUNU MANTIĞI (SADECE INDEX.HTML İÇİN) ---

const setupCarGame = () => {
    const gameSection = document.getElementById('oyun');
    const heroSection = document.getElementById('hero-original');
    
    // Yalnızca index.html'de çalıştır
    if (!gameSection || !heroSection) return; 

    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const gameArea = document.getElementById('game-area');
    const scoreDisplay = document.getElementById('score');
    const endScreen = document.getElementById('end-screen');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    const navAnasayfa = document.getElementById('nav-anasayfa');
    const navOyun = document.getElementById('nav-oyun');


    let isGameRunning = false;
    let car;
    let score = 0;
    let speed = 5;
    let obstacleInterval;
    let scoreInterval;
    let gameLoopInterval;

    const carSize = 80;
    const roadWidth = 300;


    // Sayfa Yüklenince veya Navigasyon Tıklanınca Oyun/Anasayfa görünümünü ayarlar
    const toggleView = () => {
        const isGameView = window.location.hash === '#oyun';
        
        if (isGameView) {
            heroSection.style.display = 'none';
            gameSection.style.display = 'flex';
            // Navigasyon Aktifliği
            navAnasayfa.classList.remove('active');
            if (navOyun) navOyun.classList.add('active'); 
            // Oyun görünümü aktifse, hemen oyun ayarlarını kur (ama başlatma)
            gameArea.style.display = 'none';
            endScreen.style.display = 'none';
            startScreen.style.display = 'flex';
        } else {
            heroSection.style.display = 'flex'; 
            gameSection.style.display = 'none';
            // Navigasyon Aktifliği
            navAnasayfa.classList.add('active');
            if (navOyun) navOyun.classList.remove('active'); 
            
            // Oyun görünümünden çıkıldığında oyun döngülerini durdur
            if(isGameRunning) {
                gameOver(true); // Parametre true ise sadece durdurma işlemi yapılır
            }
        }
    };
    
    // Tarayıcı geri/ileri tuşlarını ve link tıklamalarını dinle
    window.addEventListener('hashchange', toggleView);
    
    // Oyun linkine tıklanma olayını da dinle
    if (navOyun) {
        navOyun.addEventListener('click', () => {
            if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
                // Eğer zaten index sayfasındaysak, hash değişimi yeterli
                toggleView(); 
            }
        });
    }

    // Oyunu başlat
    const startGame = () => {
        if (isGameRunning) return;

        // Ekranları ayarla
        startScreen.style.display = 'none';
        endScreen.style.display = 'none';
        gameArea.innerHTML = '';
        gameArea.style.display = 'block';

        score = 0;
        speed = 5;
        isGameRunning = true;
        scoreDisplay.textContent = score;

        // Oyuncu arabasını oluştur
        car = document.createElement('div');
        car.classList.add('car');
        car.style.width = carSize + 'px';
        car.style.height = carSize * 2 + 'px';
        car.style.backgroundImage = 'url(./car_blue.png)'; // Araba görseli (Mevcut olmalı)
        car.style.backgroundSize = 'contain';
        car.style.backgroundRepeat = 'no-repeat';
        car.style.bottom = '10px';
        car.style.left = (roadWidth / 2) - (carSize / 2) + 'px'; // Ortaya yerleştir
        gameArea.appendChild(car);

        // Klavye olayları
        document.addEventListener('keydown', handleKeydown);

        // Oyun döngülerini başlat
        obstacleInterval = setInterval(createObstacle, 1500 - (speed * 100)); // Engel yaratma sıklığı
        gameLoopInterval = setInterval(gameLoop, 20); // 50 FPS

        // Skor artışı için hızlı interval (Her saniye 1 puan)
        scoreInterval = setInterval(() => {
             if(isGameRunning) {
                score += 1;
                scoreDisplay.textContent = score;
                // Skora göre hızı artır
                if (score % 100 === 0 && speed < 15) {
                    speed += 1;
                    clearInterval(obstacleInterval);
                    // Hızlandıkça engel sıklığını artır
                    obstacleInterval = setInterval(createObstacle, 1500 - (speed * 100)); 
                }
             }
        }, 1000); 
    };

    // Engelleri oluştur
    const createObstacle = () => {
        if (!isGameRunning) return;

        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        obstacle.style.width = '60px'; // Engel genişliği
        obstacle.style.height = '60px'; // Engel yüksekliği
        obstacle.style.backgroundImage = 'url(./barrier.png)'; // Engel görseli (Mevcut olmalı)
        obstacle.style.backgroundSize = 'contain';
        obstacle.style.backgroundRepeat = 'no-repeat';
        
        // Rastgele yatay konum
        const randomLeft = Math.floor(Math.random() * (roadWidth - 60)); 
        obstacle.style.left = randomLeft + 'px';
        obstacle.style.top = -60 + 'px'; // Yolun hemen dışından başla
        
        gameArea.appendChild(obstacle);
    };

    // Klavye kontrolleri
    const handleKeydown = (e) => {
        if (!isGameRunning) return;

        const currentLeft = parseInt(car.style.left);
        const moveAmount = 25; 
        const roadLimit = roadWidth - carSize; // Sağ kenar limiti

        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            const newLeft = Math.max(0, currentLeft - moveAmount);
            car.style.left = newLeft + 'px';
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            const newLeft = Math.min(roadLimit, currentLeft + moveAmount);
            car.style.left = newLeft + 'px';
        }
    };

    // Oyun döngüsü (Engelleri hareket ettir ve çarpışmayı kontrol et)
    const gameLoop = () => {
        if (!isGameRunning) return;

        const obstacles = document.querySelectorAll('.obstacle');
        const carRect = car.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();

        obstacles.forEach(obstacle => {
            let currentTop = parseInt(obstacle.style.top);
            currentTop += speed;
            obstacle.style.top = currentTop + 'px';

            // Engelin alt sınırı oyun alanını geçtiyse kaldır
            if (currentTop > gameAreaRect.height) {
                obstacle.remove();
            }

            // Çarpışma kontrolü
            const obstacleRect = obstacle.getBoundingClientRect();
            // Basitleştirilmiş çarpışma kontrolü (daha sağlam)
            if (
                // Yatay çakışma
                obstacleRect.left < carRect.right &&
                obstacleRect.right > carRect.left &&
                // Dikey çakışma
                obstacleRect.top < carRect.bottom &&
                obstacleRect.bottom > carRect.top
            ) {
                gameOver();
            }
        });
    };

    // Oyun bitti
    const gameOver = (silent = false) => {
        isGameRunning = false;
        clearInterval(obstacleInterval);
        clearInterval(gameLoopInterval);
        clearInterval(scoreInterval);
        document.removeEventListener('keydown', handleKeydown);
        
        // Eğer sessiz durdurma değilse (yani çarpışma olduysa) bitiş ekranını göster
        if (!silent) {
            gameArea.style.display = 'none';
            finalScoreDisplay.textContent = score;
            endScreen.style.display = 'flex'; 
        }
        // Oyun alanını temizle (Sadece görsel olarak)
        gameArea.innerHTML = '';
    };

    // Olay dinleyicilerini kur
    if (startButton) startButton.addEventListener('click', startGame);
    if(restartButton) restartButton.addEventListener('click', startGame);

    // Başlangıçta görünümü ayarla
    toggleView();
};


// Tüm fonksiyonları DOM yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    themeHandler(); // En başta tema ayarını yükle
    navSlide();
    pageTransition();
    setupCarGame(); // Oyun mantığını kur (index.html'de çalışacak)
});
