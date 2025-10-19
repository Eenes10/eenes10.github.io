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

// Disko topu elementini oluşturan fonksiyon
const createDiscoBall = () => {
    const existingDiscoBall = document.getElementById('dynamic-disco-ball');
    if (existingDiscoBall) return existingDiscoBall; // Zaten varsa tekrar oluşturma

    const discoBall = document.createElement('div');
    discoBall.id = 'dynamic-disco-ball';
    discoBall.classList.add('disco-ball');
    return discoBall;
};

// --- GÜNCEL: DISCO THEME HİLE KODU (Tema Geri Dönüşü Düzeltildi) ---
const discoHandler = () => {
    const profilePic = document.querySelector('.profile-pic'); // Mevcut profil resmi
    const aboutContainer = document.querySelector('.about-container'); // Profil resminin parent'ı
    const body = document.body;
    let clickCount = 0;
    let discoTimeout;
    
    const discoMusic = document.getElementById('disco-music');

    if (!profilePic || !aboutContainer) return;

    // Disko topunun tıklama olayını burada tanımlıyoruz
    profilePic.addEventListener('click', (e) => {
        // 3 kez tıklama mantığı
        
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
                
                body.classList.remove('light-theme'); // Disco tema her zaman siyah tabanlıdır
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
                // Disko topuna 3 kez tıklayınca kapanma özelliğini ekle
                discoBall.addEventListener('click', profilePic.click);
                
            } else {
                // Disco modu KAPANDI
                
                // Kayıtlı önceki temayı al ve geri yükle
                const originalTheme = localStorage.getItem('disco-previous-theme') || 'dark';
                
                localStorage.setItem('theme', originalTheme);
                localStorage.removeItem('disco-previous-theme'); // Temizle
                
                // Eğer önceki tema light ise, light-theme sınıfını ekle
                if (originalTheme === 'light') {
                    body.classList.add('light-theme');
                    setGiscusTheme('light'); // Giscus'u Light'a çek
                } else {
                    body.classList.remove('light-theme');
                    setGiscusTheme('dark_dimmed'); // Giscus'u Dark'a çek
                }
                
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
        // Tıklama olayını buraya da eklemeyi unutma
        discoBall.addEventListener('click', profilePic.click);
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
    
    // Disko teması daha öncelikli
    if (savedTheme === 'disco') {
        body.classList.add('disco-theme');
        currentTheme = 'dark_dimmed'; // Giscus için dark
        // Disko teması açıldığında profil resmini gizle ve disko topunu ekle
        if (profilePic && aboutContainer) {
            profilePic.style.display = 'none';
            // createDiscoBall() fonksiyonunu çağırıp prepend yap
            const discoBall = document.getElementById('dynamic-disco-ball') || createDiscoBall();
            aboutContainer.prepend(discoBall);
        }
    } 
    // Light teması kontrolü
    else if (savedTheme === 'light' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        body.classList.add('light-theme');
        currentTheme = 'light';
        // Varsayılan tema (dark) veya disco modu yoksa profil resmini göster
        if (profilePic) profilePic.style.display = 'block';
        const existingDiscoBall = document.getElementById('dynamic-disco-ball');
        if (existingDiscoBall) existingDiscoBall.remove();
    } 
    // Dark tema (varsayılan)
    else {
        body.classList.remove('light-theme');
        currentTheme = 'dark_dimmed';
        // Varsayılan tema (dark) veya disco modu yoksa profil resmini göster
        if (profilePic) profilePic.style.display = 'block';
        const existingDiscoBall = document.getElementById('dynamic-disco-ball');
        if (existingDiscoBall) existingDiscoBall.remove();
    }

    // İlk yüklemede Giscus temasını ayarla
    setTimeout(() => {
        setGiscusTheme(body.classList.contains('light-theme') ? 'light' : 'dark_dimmed');
    }, 500); 


    // 2. Buton tıklama olayını dinle
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            const body = document.body;
            const discoMusic = document.getElementById('disco-music');
            const profilePic = document.querySelector('.profile-pic');
            
            // EĞER DISCO MODU AÇIKSA: Tema butonu ona basınca önceki moda döner
            if (body.classList.contains('disco-theme')) {
                // Kayıtlı önceki temayı al
                const originalTheme = localStorage.getItem('disco-previous-theme') || 'dark';
                
                body.classList.remove('disco-theme');
                localStorage.setItem('theme', originalTheme);
                localStorage.removeItem('disco-previous-theme'); // Temizle
                
                // Önceki temaya geri dön (Light ise Light'a, Dark ise Dark'a)
                if (originalTheme === 'light') {
                    body.classList.add('light-theme');
                    setGiscusTheme('light');
                } else {
                    body.classList.remove('light-theme');
                    setGiscusTheme('dark_dimmed');
                }
                
                // MÜZİĞİ DURDUR ve Topu Kaldır
                if (discoMusic) { discoMusic.pause(); discoMusic.currentTime = 0; }
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

            // Light/Dark moda geçildiğinde disko topunu kaldır, profil resmini görünür yap
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
