const soruMetni = document.getElementById('soru-metni');
const resimInput = document.getElementById('soru-resmi-input');
const resimSecBtn = document.getElementById('resim-sec-btn');
const yuklenenResimGosterim = document.getElementById('yuklenen-resim-gosterim');
const cozBtn = document.getElementById('coz-btn');
const cozumIcerigi = document.getElementById('cozum-icerigi');
const motivasyonAlani = document.getElementById('motivasyon-alani');

let yukluResim = false; // Görsel yüklenip yüklenmediğini tutan değişken

// --- 1. GÖRSEL YÜKLEME İŞLEMLERİ ---

resimSecBtn.addEventListener('click', () => {
    resimInput.click(); // Gizli input'u tetikle
});

resimInput.addEventListener('change', (event) => {
    const dosya = event.target.files[0];
    if (dosya) {
        yukluResim = true;
        // Görsel yüklendiğinde metin girişini temizle ve devre dışı bırak
        soruMetni.value = ''; 
        soruMetni.disabled = true;

        // Görsel onay ekranını göster
        resimSecBtn.style.display = 'none';
        yuklenenResimGosterim.style.display = 'flex';
    }
});

// Metin alanına yazılmaya başlandığında görsel seçimi sıfırla
soruMetni.addEventListener('input', () => {
    if (soruMetni.value.length > 0) {
        // Resim varsa sıfırla
        if (yukluResim) {
            resimInput.value = '';
            yukluResim = false;
            resimSecBtn.style.display = 'flex';
            yuklenenResimGosterim.style.display = 'none';
        }
    }
    soruMetni.disabled = false;
});


// --- 2. ÇÖZÜMLEME SİMÜLASYONU VE VERİLER ---

const ornekCozumler = {
    "matematik": {
        soru_parcasi: ["denkleminin kökleri", "parabol", "üçgenin alanı"],
        cozum_basligi: "İkinci Dereceden Denklemler Çözümü 📐",
        adımlar: [
            "**Adım 1: Analiz (Görsel veya Metin)**",
            "Soru, $ax^2 + bx + c = 0$ formatında bir denklemin çözümü veya görsel bir parabol grafiği istemektedir.",
            "**Adım 2: Çarpanlara Ayırma / Diskriminant**",
            "Diskriminant ($\Delta$) kullanılarak köklerin varlığı belirlenir. (Gizli formül: $\\Delta = b^2 - 4ac$)",
            "**Adım 3: Kökleri Bul**",
            "Kökler $x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$ formülüyle bulunur. Örneğin: $x_1=2$ ve $x_2=3$.",
            "**Tebrikler!** Bu denklemin kökleri başarıyla çözüldü."
        ]
    },
    "edebiyat": {
        soru_parcasi: ["servet-i fünun", "roman", "şiir"],
        cozum_basligi: "Servet-i Fünun Dönemi Özeti 📜",
        adımlar: [
            "**Adım 1: Dönem Tespiti**",
            "Sorudaki anahtar kelimeler (Tevfik Fikret, Cenap Şahabettin, Mai ve Siyah) dönemi işaret etmektedir.",
            "**Adım 2: Önemli Temsilciler**",
            "Batı edebiyatını esas alan topluluğun temel sanatçıları analiz edilir.",
            "**Adım 3: Temel Özellikler**",
            "Sanat için sanat anlayışı, ağır ve süslü dil kullanılmıştır.",
            "**Unutma!** Edebiyat bilgin çok yerinde! Eser adlarını tekrar et."
        ]
    },
    "fen": {
        soru_parcasi: ["fizik", "hız", "ivme", "kimyasal bağ"],
        cozum_basligi: "Fizik/Kimya Problemi Çözümü 🚀",
        adımlar: [
            "**Adım 1: Kavramın Tanımlanması**",
            "Soruda ivme hesaplaması veya iyonik/kovalent bağ gibi temel bir kavram sorgulanmaktadır.",
            "**Adım 2: Formül/Kural Uygulaması**",
            "Fizik için $v = v_0 + a \\cdot t$, Kimya için bağ kuralları uygulanır.",
            "**Adım 3: Hesaplama ve Sonuç**",
            "Veriler yerine konur ve kesin sonuç bulunur.",
            "**Aferin!** Fen zor görünebilir ama formülleri doğru uyguladığında her şey çözülür."
        ]
    }
};

const motivasyonlar = [
    "İnanılmazsın! Baykuş bile bu kadar hızlı çözemezdi. 🦉",
    "Mola verme zamanı gelmiş olabilir. Beynine biraz pasta ikram et. 🍰",
    "Günde 1 soru çözmek, bir sonraki seviyeye geçmek demektir! Devam et! ⭐",
    "Senin beynin, Bilge Baykuş'un tüm kütüphanesinden daha değerli! 💪",
    "Bu soruyu çözdün, sırada Everest'e tırmanmak var! ⛰️"
];

// Ana Çözümleme Fonksiyonu
cozBtn.addEventListener('click', () => {
    
    // Görsel veya metin girişi kontrolü
    const soru = soruMetni.value.trim().toLowerCase();
    
    if (!yukluResim && soru.length < 10) {
        alert("Lütfen çözmek istediğin sorunun tamamını yaz veya resmini yükle.");
        return;
    }

    cozBtn.disabled = true;
    cozBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Görüntü İşleniyor...';
    cozumIcerigi.innerHTML = '<p class="baslangic-mesaj">Baykuş tüm bilgeliğini topluyor, biraz bekle...</p>';
    motivasyonAlani.style.display = 'none';

    // 2 saniyelik Simülasyon bekleme süresi
    setTimeout(() => {
        
        let eslesenCozum = null;
        let cozumKaynagi = yukluResim ? "GÖRSEL ANALİZ EDİLDİ (Simülasyon)" : "METİN ANALİZ EDİLDİ";

        // Eğer resim yüklendiyse, rastgele bir konuyu çözülmüş gibi göster
        if (yukluResim) {
            const konular = Object.keys(ornekCozumler);
            const rastgeleKonu = konular[Math.floor(Math.random() * konular.length)];
            eslesenCozum = ornekCozumler[rastgeleKonu];
        } 
        // Eğer metin girildiyse, metin eşleştirmesi yap
        else {
            for (const key in ornekCozumler) {
                const cozum = ornekCozumler[key];
                if (cozum.soru_parcasi.some(parca => soru.includes(parca))) {
                    eslesenCozum = cozum;
                    break;
                }
            }
        }

        // --- Çözüm Sonuçlarını Ekrana Basma ---
        
        if (eslesenCozum) {
            let htmlCozum = `<p style="font-size: 0.9em; color: gray;">*Kaynak: ${cozumKaynagi}</p>`;
            htmlCozum += `<h3>${eslesenCozum.cozum_basligi}</h3>`;
            eslesenCozum.adımlar.forEach(adim => {
                htmlCozum += `<div class="cozum-adimi">${adim}</div>`;
            });
            
            cozumIcerigi.innerHTML = htmlCozum;
            
            // Eğlenceli Motivasyon Mesajını Göster
            const rastgeleMotivasyon = motivasyonlar[Math.floor(Math.random() * motivasyonlar.length)];
            motivasyonAlani.textContent = rastgeleMotivasyon;
            motivasyonAlani.style.display = 'block';
            
        } else {
            cozumIcerigi.innerHTML = `
                <p class="baslangic-mesaj" style="color: red;">
                    Üzgünüm, sorunun kaynağını bulamadım. 😔
                    Lütfen resmi daha net çekmeyi veya soruyu daha açık yazmayı dene.
                </p>
            `;
            motivasyonAlani.style.display = 'none';
        }

        // Butonu sıfırla
        cozBtn.disabled = false;
        cozBtn.innerHTML = 'Çözümü Getir <i class="fas fa-brain"></i>';
        
    }, 2500); // 2.5 Saniye bekletme (Resim işleme simülasyonu)
});
