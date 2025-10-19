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
                }, 600); // Süre 600ms (0.6s)
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

// --- GÜNCEL: DISCO THEME HİLE KODU (Müzik ve Disko Topu Kaldırıldı) ---
const discoHandler = () => {
    const profilePic = document.querySelector('.profile-pic');
    const body = document.body;
    let clickCount = 0;
    let discoTimeout;
    
    if (!profilePic) return;

    profilePic.addEventListener('click', () => {
        clickCount++;
        clearTimeout(discoTimeout);

        if (clickCount === 3) {
            
            // Disko modu açılmadan önceki temayı kaydet
            const previousTheme = body.classList.contains('light-theme') ? 'light' : 'dark';

            body.classList.toggle('disco-theme');
            
            if (body.classList.contains('disco-theme')) {
                // Disco modu AÇILDI
                
                // Önceki temayı kaydet (Light/Dark)
                localStorage.setItem('disco-previous-theme', previousTheme); 
                
                body.classList.remove('light-theme'); // Disco tema siyah tabanlıdır
                localStorage.setItem('theme', 'disco');
                setGiscusTheme('dark_dimmed'); // Giscus'u Dark'a çek

            } else {
                // Disco modu KAPANDI
                
                // Kayıtlı önceki temayı al ve geri yükle
                const originalTheme = localStorage.getItem('disco-previous-theme') || 'dark';
                
                localStorage.setItem('theme', originalTheme);
                localStorage.removeItem('disco-previous-theme');
                
                // Light ise Light'a, Dark ise Dark'a geri dön
                if (originalTheme === 'light') {
                    body.classList.add('light-theme');
                    setGiscusTheme('light'); 
                } else {
                    body.classList.remove('light-theme');
                    setGiscusTheme('dark_dimmed');
                }
            }

            clickCount = 0; // Sayacı sıfırla

        } else {
            discoTimeout = setTimeout(() => {
                clickCount = 0; // Süre dolarsa sayacı sıfırla
            }, 1000); // 1 saniye içinde 3 kez tıklanmalı
        }
    });

    // Sayfa yüklendiğinde disko temasını kontrol et
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'disco') {
        body.classList.add('disco-theme');
    }
};

// Tema değiştirme fonksiyonu
const themeHandler = () => {
    const toggleButton = document.getElementById('theme-toggle');
    const body = document.body;

    // 1. Kayıtlı temayı yükle
    const savedTheme = localStorage.getItem('theme');
    let currentTheme = 'dark';
    
    // Disko teması kontrolü
    if (savedTheme === 'disco') {
        body.classList.add('disco-theme');
        currentTheme = 'dark_dimmed'; 
    } 
    // Light teması kontrolü
    else if (savedTheme === 'light' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        body.classList.add('light-theme');
        currentTheme = 'light';
    } 
    // Dark tema (varsayılan)
    else {
        body.classList.remove('light-theme');
        currentTheme = 'dark_dimmed';
    }

    // İlk yüklemede Giscus temasını ayarla
    setTimeout(() => {
        setGiscusTheme(body.classList.contains('light-theme') ? 'light' : 'dark_dimmed');
    }, 500); 


    // 2. Buton tıklama olayını dinle
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            const body = document.body;
            
            // EĞER DISCO MODU AÇIKSA: Tema butonu ona basınca önceki moda döner
            if (body.classList.contains('disco-theme')) {
                // Kayıtlı önceki temayı al
                const originalTheme = localStorage.getItem('disco-previous-theme') || 'dark';
                
                body.classList.remove('disco-theme');
                localStorage.setItem('theme', originalTheme);
                localStorage.removeItem('disco-previous-theme');
                
                // Önceki temaya geri dön (Light ise Light'a, Dark ise Dark'a)
                if (originalTheme === 'light') {
                    body.classList.add('light-theme');
                    setGiscusTheme('light');
                } else {
                    body.classList.remove('light-theme');
                    setGiscusTheme('dark_dimmed');
                }
                
                return; 
            }

            // Diğer tema değişimleri (Dark/Light)
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
    themeHandler(); 
    discoHandler(); 
    navSlide();
    pageTransition();
});
