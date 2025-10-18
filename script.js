// --- YENİ VE TAMAMEN DOĞRU SCRIPT.JS ---

// Mobil menü fonksiyonu
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    if (!burger || !nav) return;
    const navLinks = nav.querySelectorAll('li');
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        navLinks.forEach((link, index) => {
            link.style.animation ? link.style.animation = '' : link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        });
        burger.classList.toggle('toggle');
    });
};

// script.js dosyasındaki bu fonksiyonu GÜNCELLE

const pageTransition = () => {
    const body = document.querySelector('body');
    const navLoader = document.querySelector('.nav-loader'); // Yüklenme çubuğunu seç

    body.classList.remove('fade-out');
    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const url = link.href;
            if (url.includes('#') || link.target === '_blank' || e.ctrlKey || e.metaKey) return;
            
            if (url.startsWith(window.location.origin) && url !== window.location.href) {
                e.preventDefault();

                // --- ANİMASYONU BAŞLAT ---
                if (navLoader) {
                    navLoader.classList.add('loading'); // Yüklenme çubuğu animasyonunu başlat
                }
                body.classList.add('fade-out'); // Sayfayı karart
                
                // Animasyonlar bittikten sonra yeni sayfaya git (400ms)
                setTimeout(() => {
                    window.location.href = url;
                }, 400);
            }
        });
    });
};

// Tema değiştirme fonksiyonu
const themeHandler = () => {
    const toggleButton = document.getElementById('theme-toggle');
    const body = document.body;
    if (!toggleButton) return;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') body.classList.add('light-theme');
    toggleButton.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        localStorage.setItem('theme', body.classList.contains('light-theme') ? 'light' : 'dark');
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
            projectGrid.innerHTML = '<p>Gösterilecek proje bulunamadı. Projelerinize "portfolio" etiketini eklediğinizden emin olun.</p>';
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

// --- EKSİK OLAN VE EKLENEN KISIM BURASI ---
document.addEventListener('DOMContentLoaded', () => {
    navSlide();
    pageTransition();
    themeHandler();
    fetchGitHubProjects();
});