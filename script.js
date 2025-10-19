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

// --- YENİ: DISCO THEME HİLE KODU ---
const discoHandler = () => {
    const profilePic = document.querySelector('.profile-pic');
    const body = document.body;
    let clickCount = 0;
    let discoTimeout;

    if (!profilePic) return;

    profilePic.addEventListener('click', () => {
        // Tıklama sayısını artır
        clickCount++;

        // Her tıklamada zamanlayıcıyı sıfırla
        clearTimeout(discoTimeout);

        // 3 tıklama kontrolü
        if (clickCount === 3) {
            body.classList.toggle('disco-theme');
            
            // Eğer light-theme açıksa kapat ve disko temasına geç
            if (body.classList.contains('light-theme') && body.classList.contains('disco-theme')) {
                body.classList.remove('light-theme');
                localStorage.setItem('theme', 'disco'); // Yerel depolamaya kaydet
                setGiscusTheme('dark_dimmed'); // Giscus'u uyumlu bir moda ayarla
            } else if (!body.classList.contains('disco-theme')) {
                // Disco modu kapandığında, varsayılan temaya geri dön (dark)
                localStorage.setItem('theme', 'dark');
                setGiscusTheme('dark_dimmed');
            } else {
                localStorage.setItem('theme', 'disco');
                setGiscusTheme('dark_dimmed');
            }

            // 3. tıklamadan sonra sayacı sıfırla
            clickCount = 0;

        } else {
            // Bir sonraki tıklamayı beklemek için zamanlayıcı başlat (1 saniye içinde 3 kez tıklanmalı)
            discoTimeout = setTimeout(() => {
                clickCount = 0; // Süre dolarsa sayacı sıfırla
            }, 1000);
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
    
    if (savedTheme === 'light' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        body.classList.add('light-theme');
        currentTheme = 'light';
    } else if (savedTheme === 'disco') {
        // Disko teması zaten discoHandler tarafından kontrol edilecek
        body.classList.add('disco-theme');
        currentTheme = 'dark_dimmed'; // Giscus için
    } else {
        body.classList.remove('light-theme');
    }

    // İlk yüklemede Giscus temasını ayarla
    setTimeout(() => {
        if (body.classList.contains('disco-theme')) {
            setGiscusTheme('dark_dimmed');
        } else {
            setGiscusTheme(currentTheme);
        }
    }, 500); 


    // 2. Buton tıklama olayını dinle
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            // Disco modundaysa, tema değiştirme butonu sadece onu kapatıp Dark'a döner.
            if (body.classList.contains('disco-theme')) {
                body.classList.remove('disco-theme');
                localStorage.setItem('theme', 'dark');
                setGiscusTheme('dark_dimmed');
                return;
            }

            body.classList.toggle('light-theme');
            
            const newTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            
            // Tema değiştiğinde Giscus'a bildir
            setGiscusTheme(newTheme);
        });
    }
};

// Tüm fonksiyonları DOM yüklendiğinde çalıştır (discoHandler'ı ekle)
document.addEventListener('DOMContentLoaded', () => {
    themeHandler(); 
    discoHandler(); // Yeni fonksiyonu ekledik
    navSlide();
    pageTransition();
});
