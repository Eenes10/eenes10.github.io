// --- SCRIPT.JS (SON VE TAM HALİ) ---

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
        li.querySelector('a').addEventListener('click', () => {
            if (nav.classList.contains('nav-active')) {
                // Menüyü kapat
                nav.classList.remove('nav-active');
                // Burger ikonunu düzelt
                burger.classList.remove('toggle');
                // Animasyonları sıfırla
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
            
            // # (sayfa içi link) veya _blank (yeni sekme) veya Ctrl/Meta tuşlarıyla açılmasını engelleme
            if (url.includes('#') || link.target === '_blank' || e.ctrlKey || e.metaKey) return;
            
            // Aynı domain içindeki farklı bir sayfaya yönlendirme kontrolü
            if (url.startsWith(window.location.origin) && url !== window.location.href) {
                e.preventDefault();

                if (navLoader) {
                    navLoader.classList.add('loading');
                }
                body.classList.add('fade-out');
                
                setTimeout(() => {
                    window.location.href = url;
                }, 600); // <-- Süre 600ms (0.6s) olarak güncellendi
            }
        });
    });
};

// Giscus'a Tema Değişikliğin Bildirme
const setGiscusTheme = (theme) => {
    // Soft temaya uygun olarak Giscus temaları güncellendi
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


// Tüm fonksiyonları DOM yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    themeHandler(); // En başta tema ayarını yükle
    navSlide();
    pageTransition();
});
