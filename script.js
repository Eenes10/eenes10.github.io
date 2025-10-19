// --- SCRIPT.JS (SON VE TAM HALİ - Projeler Kaldırıldı, Ampul Fixlendi) ---

// Mobil menü fonksiyonu
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    if (!burger || !nav) return;
    const navLinks = nav.querySelectorAll('li');
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        navLinks.forEach((link, index) => {
            if (nav.classList.contains('nav-active')) {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            } else {
                link.style.animation = '';
            }
        });
        burger.classList.toggle('toggle');
    });

    // Mobil Menü Linkine Tıklayınca Kapatma 
    navLinks.forEach(li => {
        li.querySelector('a').addEventListener('click', () => {
            if (nav.classList.contains('nav-active')) {
                nav.classList.remove('nav-active');
                burger.classList.remove('toggle');
                navLinks.forEach(link => link.style.animation = '');
            }
        });
    });
};

// Sayfa geçiş animasyonu
const pageTransition = () => {
    const body = document.querySelector('body');
    const navLoader = document.querySelector('.nav-loader');
    body.classList.remove('fade-out');
    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const url = link.href;
            if (url.includes('#') || link.target === '_blank' || e.ctrlKey || e.metaKey) return;
            
            if (url.startsWith(window.location.origin) && url !== window.location.href) {
                e.preventDefault();
                if (navLoader) {
                    navLoader.classList.add('loading');
                }
                body.classList.add('fade-out');
                
                setTimeout(() => {
                    window.location.href = url;
                }, 400); 
            }
        });
    });
};

// Tema değiştirme fonksiyonu (SON GÜVENİLİRLİK İYİLEŞTİRMESİ)
const themeHandler = () => {
    const lightSwitch = document.getElementById('light-pull-switch'); 
    const lightBulb = document.getElementById('light-bulb');
    const body = document.body;
    if (!lightSwitch || !lightBulb) return;

    // 1. Başlangıç temasını yükle ve ampul durumunu ayarla
    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        // Sistem tercihini sadece LocalStorage'da tema yoksa kullan
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // isLightTheme = LocalStorage 'light' VEYA (LocalStorage yoksa VE sistem tercihi dark DEĞİLSE)
        let isLightTheme = savedTheme === 'light' || (savedTheme === null && !prefersDark);

        if (isLightTheme) {
            body.classList.add('light-theme');
            lightBulb.classList.add('on'); 
        } else {
            body.classList.remove('light-theme');
            lightBulb.classList.remove('on'); 
        }
    };
    
    // Sayfa yüklenince temayı ayarla
    initializeTheme();

    lightSwitch.addEventListener('click', () => {
        // Hızlı tıklamaları engellemek için kontrol
        if (body.classList.contains('theme-transitioning')) return; 

        // 1. İp çekme animasyonunu tetikle (CSS ile 200ms)
        lightSwitch.classList.add('pulled');
        setTimeout(() => {
            lightSwitch.classList.remove('pulled');
        }, 200); 

        // 2. Flaş animasyonunu başlat ve engellemeyi etkinleştir
        body.classList.add('theme-transitioning');
        
        // Tema değişimini flaşın tam ortasında (100ms) yap
        const flashPoint = 100; 
        
        setTimeout(() => {
            // Temayı değiştir
            const isCurrentlyLight = body.classList.toggle('light-theme');
            localStorage.setItem('theme', isCurrentlyLight ? 'light' : 'dark');
            
            // Ampulün görünümünü güncelle
            lightBulb.classList.toggle('on', isCurrentlyLight); 
        }, flashPoint);
        
        // Engellemeyi kaldır
        const blockDuration = 400; 
        setTimeout(() => {
            body.classList.remove('theme-transitioning');
        }, blockDuration); 
    });
};

// Tüm fonksiyonları DOM yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    navSlide();
    pageTransition();
    themeHandler(); 
    // Proje çekme fonksiyonu kaldırıldı
});
