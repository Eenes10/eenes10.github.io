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
    const giscusTheme = theme === 'light' ? 'light' : 'dark_dimmed'; 
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;

    iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme } } },
        'https://giscus.app'
    );
}

// Disko topu elementini oluşturan yardımcı fonksiyon
const createDiscoBall = () => {
    const existingDiscoBall = document.getElementById('dynamic-disco-ball');
    if (existingDiscoBall) return existingDiscoBall;

    const discoBall = document.createElement('div');
    discoBall.id = 'dynamic-disco-ball';
    discoBall.classList.add('disco-ball');
    // Disko topuna tıklama olayını ekle (kapatmak için)
    discoBall.addEventListener('click', () => {
        // Disko topuna tıklanınca, profil resmine tıklanmış gibi simüle et
        const profilePic = document.querySelector('.profile-pic');
        if (profilePic) {
            profilePic.click();
        }
    });
    return discoBall;
};


// --- GÜNCEL: DISCO THEME HİLE KODU (Disko Topu ve Müzik) ---
const discoHandler = () => {
    const profilePic = document.querySelector('.profile-pic');
    const aboutContainer = document.querySelector('.about-container');
    const body = document.body;
    let clickCount = 0;
    let discoTimeout;
    
    const discoMusic = document.getElementById('disco-music');

    if (!profilePic || !aboutContainer) return;

    profilePic.addEventListener('click', () => {
        clickCount++;
        clearTimeout(discoTimeout);

        if (clickCount === 3) {
            body.classList.toggle('disco-theme');
            
            if (body.classList.contains('disco-theme')) {
                // Disco modu AÇILDI
                body.classList.remove('light-theme');
                localStorage.setItem('theme', 'disco');
                setGiscusTheme('dark_dimmed');
                
                // MÜZİĞİ BAŞLAT
                if (discoMusic) {
                    discoMusic.play().catch(error => {
                        console.error("Müzik otomatik oynatılırken hata oluştu. Kullanıcı etkileşimi gerekebilir:", error);
                    });
                }

                // Profil resmini gizle ve disko topunu ekle
                profilePic.style.display = 'none';
                const discoBall = createDiscoBall();
                aboutContainer.prepend(discoBall);
                
            } else {
                // Disco modu KAPANDI
                localStorage.setItem('theme', 'dark');
                setGiscusTheme('dark_dimmed');
                
                // MÜZİĞİ DURDUR
                if (discoMusic) {
                    discoMusic.pause();
                    discoMusic.currentTime = 0; // Başa sar
                }

                // Disko topunu kaldır ve profil resmini göster
                profilePic.style.display = 'block';
                const existingDiscoBall = document.getElementById('dynamic-disco-ball');
                if (existingDiscoBall) {
                    existingDiscoBall.remove();
                }
            }

            clickCount = 0; // 3. tıklamadan sonra sayacı sıfırla

        } else {
            discoTimeout = setTimeout(() => {
                clickCount = 0; // Süre dolarsa sayacı sıfırla
            }, 1000); // 1 saniye içinde 3 kez tıklanmalı
        }
    });

    // Sayfa yüklendiğinde disko temasını kontrol et ve disko topunu göster/gizle
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'disco') {
        body.classList.add('disco-theme');
        profilePic.style.display = 'none';
        const discoBall = createDiscoBall();
        aboutContainer.prepend(discoBall);
    }
};

// Tema değiştirme fonksiyonu
const themeHandler = () => {
    const toggleButton = document.getElementById('theme-toggle');
    const body = document.body;
    const profilePic = document.querySelector('.profile-pic');
    const aboutContainer = document.querySelector('.about-container');

    // 1. Kayıtlı temayı yükle
    const savedTheme = localStorage.getItem('theme');
    let currentTheme = 'dark';
    
    if (savedTheme === 'light' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        body.classList.add('light-theme');
        currentTheme = 'light';
    } else if (savedTheme === 'disco') {
        body.classList.add('disco-theme');
        currentTheme = 'dark_dimmed'; 
        // Disko teması açıldığında profil resmini gizle ve disko topunu ekle
        if (profilePic && aboutContainer) {
            profilePic.style.display = 'none';
            // Sayfa yüklendiğinde disko topunu oluştur. createDiscoBall fonksiyonu zaten var olanı geri döndürecektir.
            const discoBall = createDiscoBall(); 
            aboutContainer.prepend(discoBall);
        }
    } else {
        body.classList.remove('light-theme');
        // Varsayılan tema (dark) veya disco modu yoksa profil resmini göster
        if (profilePic) profilePic.style.display = 'block';
        const existingDiscoBall = document.getElementById('dynamic-disco-ball');
        if (existingDiscoBall) existingDiscoBall.remove();
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
            const body = document.body;
            const discoMusic = document.getElementById('disco-music');
            const profilePic = document.querySelector('.profile-pic');

            // Eğer disco modu açıksa, tema butonu onu kapatıp Dark moda döner
            if (body.classList.contains('disco-theme')) {
                body.classList.remove('disco-theme');
                localStorage.setItem('theme', 'dark');
                setGiscusTheme('dark_dimmed');
                
                // MÜZİĞİ DURDUR
                if (discoMusic) {
                    discoMusic.pause();
                    discoMusic.currentTime = 0;
                }
                // Disko topunu kaldır ve profil resmini göster
                if (profilePic) profilePic.style.display = 'block';
                const existingDiscoBall = document.getElementById('dynamic-disco-ball');
                if (existingDiscoBall) existingDiscoBall.remove();
                
                return;
            }

            // Diğer tema değişimleri (Dark/Light)
            body.classList.toggle('light-theme');
            
            const newTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            
            // Tema değiştiğinde Giscus'a bildir
            setGiscusTheme(newTheme);

            // Light/Dark moda geçildiğinde profil resmini tekrar görünür yap
            if (profilePic) profilePic.style.display = 'block';
            const existingDiscoBall = document.getElementById('dynamic-disco-ball');
            if (existingDiscoBall) existingDiscoBall.remove();
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
