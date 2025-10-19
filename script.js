// --- SCRIPT.JS (SON VE TAM HALİ - İpucu Kaldırıldı, Ampul Fixlendi) ---

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

// Tema değiştirme fonksiyonu (GÜVENİLİRLİK İYİLEŞTİRMESİ v2)
const themeHandler = () => {
    const lightSwitch = document.getElementById('light-pull-switch'); 
    const lightBulb = document.getElementById('light-bulb');
    const body = document.body;
    if (!lightSwitch || !lightBulb) return;

    // 1. Başlangıç temasını yükle ve ampul durumunu ayarla
    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Kayıtlı tema varsa onu kullan, yoksa sistem tercihini kullan
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

    // Projeler sayfası kontrolü
    if (window.location.pathname.includes('projeler.html')) {
        fetchGitHubProjects();
    }
});
