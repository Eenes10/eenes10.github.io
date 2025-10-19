// --- YENİ VE TAMAMEN GÜNCELLENMİŞ SCRIPT.JS (Giscus Tema Desteği Eklendi) ---

// Mobil menü fonksiyonu
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    if (!burger || !nav) return;
    const navLinks = nav.querySelectorAll('li');

    // Menü açma/kapama ve animasyonlar
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
        
        // Link animasyonlarını uygula
        navLinks.forEach((link, index) => {
            if (nav.classList.contains('nav-active')) {
                // Menü açılırken
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            } else {
                // Menü kapanırken
                link.style.animation = '';
            }
        });
    });

    // Mobil Menü Linkine Tıklayınca Kapatma
    navLinks.forEach(li => {
        li.querySelector('a').addEventListener('click', () => {
            if (nav.classList.contains('nav-active')) {
                // Menüyü kapat
                nav.classList.remove('nav-active');
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

    // Sayfa yüklendiğinde fade-out sınıfını kaldır
    body.classList.remove('fade-out');
    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const url = link.href;
            
            // Eğer link sayfa içi, yeni sekme veya Ctrl/Cmd ile açılıyorsa atla
            if (url.includes('#') || link.target === '_blank' || e.ctrlKey || e.metaKey) return;
            
            // Eğer link aynı etki alanındaysa (internal link)
            if (url.startsWith(window.location.origin) && url !== window.location.href) {
                e.preventDefault();

                // --- ANİMASYONU BAŞLAT ---
                if (navLoader) {
                    navLoader.classList.add('loading'); // Yüklenme çubuğu animasyonunu başlat
                }
                body.classList.add('fade-out'); // Sayfayı karart
                
                // Animasyonlar bittikten sonra yeni sayfaya git (0.3s CSS geçiş süresi)
                setTimeout(() => {
                    window.location.href = url;
                }, 300);
            }
        });
    });
};

// YENİ FONKSİYON: Giscus'a Tema Değişikliğini Bildirme
const setGiscusTheme = (theme) => {
    // Giscus için temaları Dark temada 'dark', Light temada 'light' olarak kullanacağız.
    const giscusTheme = theme === 'light' ? 'light' : 'dark';
    
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;

    // iframe'e tema değişikliğini bildir
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
    setGiscusTheme(currentTheme);


    // 2. Buton tıklama olayını dinle
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            
            // Temayı localStorage'a kaydet
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
