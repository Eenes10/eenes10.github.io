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
                }, 300); 
            }
        });
    });
};

// Giscus'a Tema Değişikliğini Bildirme
const setGiscusTheme = (theme) => {
    const giscusTheme = theme === 'light' ? 'light' : 'dark';
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


// Proje çekme fonksiyonu (Eğer kullanılıyorsa)
async function fetchGitHubProjects() {
    const projectGrid = document.querySelector('.project-grid');
    if (!projectGrid) return;

    const githubUsername = "Tentex1"; // Kendi kullanıcı adınız
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
    themeHandler(); // En başta tema ayarını yükle
    navSlide();
    pageTransition();
    // fetchGitHubProjects(); // Eğer projeler sayfanız yoksa bu yorumda kalabilir.
});
