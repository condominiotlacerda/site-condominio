const accessCodes = {
    'aB9x-Yz!2W': { id: 'apto1', name: 'João Paulo' },
    'cDe5_Fg#H7': { id: 'apto101', name: 'Lizandro' },
    'iJk1$Lm%N3': { id: 'apto102', name: 'Felipe Granja' },
    'oPq8^Rs&T4': { id: 'apto201', name: 'Jorge' },
    'xY7z!aB-cD': { id: 'apto201', name: 'Ângela' },
    'FgH7+iJk=1': { id: 'apto302', name: 'Suzane' },
    'LmN3[oPq]8': { id: 'apto401', name: 'Célia' }
};

let activeApartmentButtonId = null;

function enableApartment() {
    const code = document.getElementById('accessCode').value;
    const userData = accessCodes[code];

    if (userData) {
        const { id, name } = userData;

        // Desativa todos os botões
        document.querySelectorAll('.apartment-button').forEach(btn => btn.disabled = true);

        // Reseta as caixas de arquivos e o visualizador
        resetFileContainers();

        // Habilita o botão correspondente
        document.getElementById(id).disabled = false;
        activeApartmentButtonId = id;

        // Exibe a mensagem de boas-vindas
        document.getElementById('welcome-message').innerHTML = `Seja bem-vindo(a), ${name}. Clique no botão do seu apartamento para acessar seus boletos.`;

        // Limpa o campo do código
        document.getElementById('accessCode').value = '';
    } else {
        alert('Código de acesso inválido.');
    }
}

function showFiles(apartment) {
    const fileContainer = document.getElementById('file-container');
    const fileList = document.getElementById('file-list');

    // Garante que o container esteja visível
    fileContainer.style.display = 'block';
    fileList.innerHTML = '';

    document.getElementById('apartment-number').textContent = apartment;

    let files = getFilesForApartment(apartment);

    // Adiciona arquivos extras para o apartamento 1
    if (apartment === '1') {
        files = files.concat([
            { name: 'Boleto Condomínio (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_condominio_apto_1a.pdf' },
            { name: 'Boleto Acordo M2D (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1a.pdf' },
            { name: 'Boleto Hidro/Eletr (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1a.pdf' },
            { name: 'Boleto Condomínio (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_condominio_apto_1b.pdf' },
            { name: 'Boleto Acordo M2D (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1b.pdf' },
            { name: 'Boleto Hidro/Eletr (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1b.pdf' }
        ]);
    }

    // Remove duplicatas antes de adicionar "Prestação de Contas"
    files = files.filter((file, index, self) =>
        index === self.findIndex(f => f.name === file.name)
    );

    // Adiciona "Prestação de Contas" apenas uma vez no final
    if (!files.some(file => file.name === 'Prestação de Contas')) {
        files.push({ name: 'Prestação de Contas', path: 'pdfs/contas/2025/2.fev/prestacao_contas.pdf' });
    }

    // Exibe os arquivos na tela
    files.forEach(file => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = file.path;
        link.textContent = file.name;
        link.target = '_blank';

        link.addEventListener('click', function (event) {
            event.preventDefault();
            openFileViewer(file.path);
        });

        listItem.appendChild(link);
        fileList.appendChild(listItem);
    });
}

function getFilesForApartment(apartment) {
    const baseUrl = 'pdfs/';
    return [
        { name: 'Boleto Condomínio', path: baseUrl + `boletos/2025/3.mar/boleto_tx_condominio_apto_${apartment}.pdf` },
        { name: 'Boleto Acordo M2D', path: baseUrl + `boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_${apartment}.pdf` },
        { name: 'Boleto Hidro/Eletr', path: baseUrl + `boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_${apartment}.pdf` }
    ];
}

function openFileViewer(filePath) {
    const viewerContainer = document.getElementById('file-viewer');
    const viewerFrame = document.getElementById('viewer-frame');
    const downloadButton = document.getElementById('download-button');

    viewerFrame.src = filePath;
    downloadButton.href = filePath;

    viewerContainer.style.display = 'block';
}

function resetFileContainers() {
    document.getElementById('file-container').style.display = 'none';
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('file-viewer').style.display = 'none';
}

// Garante que os botões chamem `showFiles()`
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.apartment-button').forEach(button => {
        button.addEventListener('click', function () {
            if (!this.disabled) {
                const apartment = this.id.replace('apto', '');
                showFiles(apartment);
            }
        });
    });
});
