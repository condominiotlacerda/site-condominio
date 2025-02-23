const accessCodes = {
    'aB9x-Yz!2W': { id: 'apto1', name: 'João Paulo' },
    'cDe5_Fg#H7': { id: 'apto101', name: 'Lizandro' },
    'iJk1$Lm%N3': { id: 'apto102', name: 'Felipe Granja' },
    'oPq8^Rs&T4': { id: 'apto201', name: 'Jorge' },
    'xY7z!aB-cD': { id: 'apto201', name: 'Ângela' },
    'FgH7+iJk=1': { id: 'apto302', name: 'Suzane' },
    'LmN3[oPq]8': { id: 'apto401', name: 'Célia' }
};

let activeApartmentButtonId = null; // Armazena o botão do apartamento ativo

function enableApartment() {
    const code = document.getElementById('accessCode').value;
    const userData = accessCodes[code];

    if (userData) {
        const { id, name } = userData;

        // Desativa todos os botões antes de ativar o correto
        document.querySelectorAll('.apartment-button').forEach(btn => btn.disabled = true);

        // Limpa a lista de arquivos e esconde os containers
        document.getElementById('file-list').innerHTML = '';
        document.getElementById('file-container').style.display = 'none';
        document.getElementById('file-viewer').style.display = 'none'; // 🔹 Esconde a exibição do arquivo

        // Habilita o botão do apartamento correspondente
        document.getElementById(id).disabled = false;
        activeApartmentButtonId = id; // Atualiza o botão ativo

        // Atualiza mensagem de boas-vindas
        document.getElementById('welcome-message').innerHTML = `Seja bem-vindo(a), ${name}. Clique no botão do seu apartamento para acessar seus boletos.`;

        // Limpa o campo de código
        document.getElementById('accessCode').value = '';
    } else {
        alert('Código de acesso inválido.');
    }
}

function showFiles(apartment) {
    const fileContainer = document.getElementById('file-container');
    const fileList = document.getElementById('file-list');

    // 🔹 Garante que o container esteja visível
    fileContainer.style.display = 'block';
    fileList.innerHTML = ''; // Limpa a lista de arquivos anteriores

    document.getElementById('apartment-number').textContent = apartment;

    let files = getFilesForApartment(apartment);

    // 🔹 Se for o apartamento 1, adiciona os arquivos extras (A e B)
    if (apartment === '1') {
        files.push(
            { name: 'Boleto Condomínio (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_condominio_apto_1a.pdf' },
            { name: 'Boleto Acordo M2D (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1a.pdf' },
            { name: 'Boleto Hidro/Eletr (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1a.pdf' },
            { name: 'Boleto Condomínio (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_condominio_apto_1b.pdf' },
            { name: 'Boleto Acordo M2D (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1b.pdf' },
            { name: 'Boleto Hidro/Eletr (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1b.pdf' }
        );
    }

    // 🔹 Remove duplicatas e garante que a "Prestação de Contas" só apareça uma vez no final da lista
    const prestacaoDeContas = { name: 'Prestação de Contas', path: 'pdfs/contas/2025/2.fev/prestacao_contas.pdf' };
    files = files.filter(file => file.name !== 'Prestação de Contas'); // Remove duplicatas
    files.push(prestacaoDeContas); // Adiciona ao final

    // 🔹 Exibe os arquivos na tela
    files.forEach(file => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = file.path;
        link.textContent = file.name;
        link.target = '_blank'; // Abre em nova aba

        link.addEventListener('click', function (event) {
            event.preventDefault();
            openFileViewer(file.path);
        });

        listItem.appendChild(link);
        fileList.appendChild(listItem);
    });
}

function getFilesForApartment(apartment) {
    const baseUrl = 'pdfs/'; // Caminho base para os arquivos

    let files = [
        { name: 'Boleto Condomínio', path: baseUrl + `boletos/2025/3.mar/boleto_tx_condominio_apto_${apartment}.pdf` },
        { name: 'Boleto Acordo M2D', path: baseUrl + `boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_${apartment}.pdf` },
        { name: 'Boleto Hidro/Eletr', path: baseUrl + `boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_${apartment}.pdf` }
    ];

    return files;
}

function openFileViewer(filePath) {
    const viewerContainer = document.getElementById('file-viewer');
    const viewerFrame = document.getElementById('viewer-frame');
    const downloadButton = document.getElementById('download-button');

    viewerFrame.src = filePath;
    downloadButton.href = filePath;

    viewerContainer.style.display = 'block'; // 🔹 Exibe a visualização do arquivo
}

// 🔹 Garante que os botões dos apartamentos chamem `showFiles()`
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('.apartment-button').forEach(button => {
        button.addEventListener('click', function () {
            if (!this.disabled) {
                const apartment = this.id.replace('apto', ''); // Obtém o número do apartamento
                showFiles(apartment);
            }
        });
    });
});
