// --- SCRIPT.JS (SON VE TAM HALİ - Tüm Özellikler Dahil, AMPUL İLE TEMA GEÇİŞİ) ---

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

    // DÜZELTME: Mobil Menü Linkine Tıklayınca Kapatma 
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

// Tema değiştirme fonksiyonu (GÜVENİLİRLİK İYİLEŞTİRMESİ)
const themeHandler = () => {
    const lightSwitchContainer = document.getElementById('light-pull-switch'); 
    const lightBulb = document.getElementById('light-bulb');
    const body = document.body;
    if (!lightSwitchContainer || !lightBulb) return;

    // Başlangıç temasını yükle
    const savedTheme = localStorage.getItem('theme');
    let isLightTheme = false;

    if (savedTheme === 'light' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        body.classList.add('light-theme');
        lightBulb.classList.add('on'); 
        isLightTheme = true;
    } else {
        body.classList.remove('light-theme');
        lightBulb.classList.remove('on'); 
        isLightTheme = false;
    }
    
    lightSwitchContainer.addEventListener('click', () => {
        // Hızlı tıklamaları engellemek için kontrol
        if (body.classList.contains('theme-transitioning')) return; 

        // 1. İp çekme animasyonunu tetikle (CSS ile 200ms)
        lightSwitchContainer.classList.add('pulled');
        setTimeout(() => {
            lightSwitchContainer.classList.remove('pulled');
        }, 200); 

        // 2. Flaş animasyonunu başlat ve engellemeyi etkinleştir
        body.classList.add('theme-transitioning');
        
        // Tema değişimini flaşın tam ortasında (100ms) yap
        const flashPoint = 100; 
        
        setTimeout(() => {
            // Tema ve ampul değişimini yap
            body.classList.toggle('light-theme');
            isLightTheme = body.classList.contains('light-theme');
            localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
            
            lightBulb.classList.toggle('on');
        }, flashPoint);
        
        // Flaş animasyonu ve hızlı tıklama engelleme süresi (400ms)
        // Animasyon bittikten sonra bir süre daha engellemek, PC ve mobil güvenilirliğini artırır.
        const blockDuration = 400; 
        
        // Engellemeyi kaldır
        setTimeout(() => {
            body.classList.remove('theme-transitioning');
        }, blockDuration); 
    });
};

// Dinamik "Günün İpucu" fonksiyonu
const displayRandomTip = () => {
    const tips = [
        "⚽ Kod yazmak, futbol oynamak gibidir; ne kadar pratik yaparsan o kadar iyi olursun!",
        "💡 Git'te bir hata mı yaptın? `git reset --hard HEAD` ile geri alabilirsin (Dikkatli kullan!)",
        "💻 JavaScript'te `const` kullanmak, değişkeni yeniden atamanı engeller ve kodunu daha güvenli yapar.",
        "✨ Siteyi mobil görünümde test etmeyi unutma! Mobil entegrasyon önemlidir.",
        "🥅 Python'da listeleri ters çevirmenin en kısa yolu `list[::-1]` kullanmaktır.",
        "🌕 Tema değiştirme butonu için CSS'te :root değişkenlerini kullanmak hayat kurtarır.",
        "⚽ Favori takımın kim? Yorumlarda paylaşabilirsin!",
        "🚀 Bir sonraki projen, öğrendiğin yeni bir teknolojiyi içermeli."
    ];

    const tipElement = document.getElementById('tip-of-the-day');

    if (tipElement) {
        const randomIndex = Math.floor(Math.random() * tips.length);
        tipElement.textContent = tips[randomIndex];
    }
};

// GitHub projelerini çekme fonksiyonu
async function fetchGitHubProjects() {
    const projectGrid = document.querySelector('.project-grid');
    if (!projectGrid) return;

    const githubUsername = "Tentex1"; 
    const apiUrl = `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`;

    const languageColors = {
        "C#": "#178600", "Python": "#3572A5", "JavaScript": "#f1e05a", "HTML": "#e34c26",
        "CSS": "#563d7c", "TypeScript": "#2b7489", "Java": "#b07219", "Shell": "#89e051",
        "default": "#6e7681"
    };

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`GitHub API hatası: ${response.status}`);
        const repos = await response.json();

        const portfolioRepos = repos.filter(repo => repo.topics.includes('portfolio-project'));
        projectGrid.innerHTML = '';

        if (portfolioRepos.length === 0) {
            projectGrid.innerHTML = '<p>Gösterilecek proje bulunamadı. Projelerinize "portfolio-project" etiketini eklediğinizden emin olun.</p>';
            return;
        }

        portfolioRepos.forEach(repo => {
            const repoName = repo.name.replaceAll('-', ' ');
            const repoDescription = repo.description || "Açıklama eklenmemiş.";
            const repoUrl = repo.html_url;
            const liveSiteUrl = repo.homepage;
            const language = repo.language;

            let languageHTML = '';
            if (language) {
                const color = languageColors[language] || languageColors.default;
                languageHTML = `
                    <div class="project-language">
                        <span class="language-color-dot" style="background-color: ${color};"></span>
                        <span>${language}</span>
                    </div>
                `;
            }

            let projectCard = `
                <div class="project-card">
                    <div class="card-content">
                        <h3>${repoName}</h3>
                        <p>${repoDescription}</p>
                    </div>
                    <div class="card-footer">
                        ${languageHTML} 
                        <div class="project-links">
                            <a href="${repoUrl}" target="_blank"><i class="fab fa-github"></i> Kodlar</a>`;
            
            if (liveSiteUrl) {
                projectCard += `<a href="${liveSiteUrl}" target="_blank"><i class="fas fa-external-link-alt"></i> Siteyi Gör</a>`;
            }

            projectCard += `</div></div></div>`;
            projectGrid.innerHTML += projectCard;
        });

    } catch (error) {
        console.error("Projeler çekilirken bir hata oluştu:", error);
        projectGrid.innerHTML = `<p>Projeler yüklenirken bir hata oluştu. Lütfen Geliştirici Konsolu'nu (F12) kontrol edin.</p>`;
    }
}

// Tüm fonksiyonları DOM yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', () => {
    navSlide();
    pageTransition();
    themeHandler(); 
    displayRandomTip(); 

    if (window.location.pathname.includes('projeler.html')) {
        fetchGitHubProjects();
    }
});
