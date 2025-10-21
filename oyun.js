// --- OYUN.JS (Taş-Kağıt-Makas) ---

document.addEventListener('DOMContentLoaded', () => {
    const choices = document.querySelectorAll('.choice-btn');
    const resultDisplay = document.getElementById('result');
    const computerChoiceDisplay = document.getElementById('computer-choice');
    const scoresDisplay = document.getElementById('scores');
    const resetButton = document.getElementById('reset-btn');

    let playerScore = 0;
    let computerScore = 0;

    // Skoru yerel depolamadan yükle
    const loadScores = () => {
        const savedPlayerScore = localStorage.getItem('playerScore');
        const savedComputerScore = localStorage.getItem('computerScore');
        playerScore = savedPlayerScore ? parseInt(savedPlayerScore) : 0;
        computerScore = savedComputerScore ? parseInt(savedComputerScore) : 0;
        updateScoresDisplay();
    };

    // Skoru yerel depolamaya kaydet
    const saveScores = () => {
        localStorage.setItem('playerScore', playerScore);
        localStorage.setItem('computerScore', computerScore);
    };

    // Skoru ekranda göster
    const updateScoresDisplay = () => {
        scoresDisplay.querySelector('p').textContent = `Skor: Sen - ${playerScore} | Bilgisayar - ${computerScore}`;
    };

    // Bilgisayarın rastgele seçimini yap
    const getComputerChoice = () => {
        const options = ['tas', 'kagit', 'makas'];
        const randomIndex = Math.floor(Math.random() * options.length);
        return options[randomIndex];
    };

    // Kazananı belirle
    const determineWinner = (player, computer) => {
        if (player === computer) {
            return "Berabere! Tekrar dene.";
        }
        
        if (
            (player === 'tas' && computer === 'makas') ||
            (player === 'kagit' && computer === 'tas') ||
            (player === 'makas' && computer === 'kagit')
        ) {
            playerScore++;
            return "Tebrikler! Sen kazandın!";
        } else {
            computerScore++;
            return "Kaybettin. Bilgisayar kazandı.";
        }
    };

    // Oyunu oynat
    const playGame = (playerChoice) => {
        const computerChoice = getComputerChoice();
        
        // Sonucu belirle ve skorları güncelle
        const result = determineWinner(playerChoice, computerChoice);
        
        // Ekranı güncelle
        resultDisplay.querySelector('p').textContent = `Senin seçimin: ${playerChoice.toUpperCase()}. ${result}`;
        computerChoiceDisplay.textContent = `Bilgisayarın seçimi: ${computerChoice.toUpperCase()}`;
        updateScoresDisplay();
        saveScores(); // Skoru kaydet
    };

    // Butonlara tıklama olaylarını ekle
    choices.forEach(button => {
        button.addEventListener('click', (e) => {
            const playerChoice = e.target.dataset.choice;
            playGame(playerChoice);
        });
    });

    // Sıfırlama butonu
    resetButton.addEventListener('click', () => {
        playerScore = 0;
        computerScore = 0;
        saveScores();
        updateScoresDisplay();
        resultDisplay.querySelector('p').textContent = "Skor sıfırlandı. Başlamak için bir seçim yapın.";
        computerChoiceDisplay.textContent = "";
    });

    // Sayfa yüklendiğinde skorları yükle
    loadScores();
});
