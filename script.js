const accessCodes = {
    'aB9x-Yz!2W': { id: 'apto1', name: 'João Paulo' },
    'cDe5_Fg#H7': { id: 'apto101', name: 'Lizandro' },
    'iJk1$Lm%N3': { id: 'apto102', name: 'Felipe Granja' },
    'oPq8^Rs&T4': { id: 'apto201', name: 'Jorge' },
    'xY7z!aB-cD': { id: 'apto201', name: 'Ângela' },
    'FgH7+iJk=1': { id: 'apto302', name: 'Suzane' },
    'LmN3[oPq]8': { id: 'apto401', name: 'Célia' }
};

let activeApartmentButtonId = null; // Armazena o ID do botão ativo

function enableApartment() {
    const code = document.getElementById('accessCode').value;
    const userData = accessCodes[code];

    if (userData) {
        const { id, name } = userData;

        // Desativa todos os botões antes de ativar o correto
        document.querySelectorAll('.apartment-button').forEach(btn => btn.disabled = true);

        // Limpa a lista de arquivos exibida anteriormente e esconde o container de arquivos
        document.getElementById('file-list').innerHTML = '';
        document.getElementById('file-container').style.display = 'none';

        // Habilita o botão do apartamento correspondente
        document.getElementById(id).disabled = false;
        activeApartmentButtonId = id; // Atualiza o botão ativo

        // Atualiza mensagem de boas-vindas com o nome correto do usuário
        document.getElementById('welcome-message').innerHTML = `Seja bem-vindo(a), ${name}. Clique no botão do seu apartamento para acessar seus boletos.`;

        // Limpa o campo de código
        document.getElementById('accessCode').value = '';
    } else {
        alert('Código de acesso inválido.');
    }
}

function showFiles(apartment) {
    // 🔹 Antes de exibir os novos arquivos, limpa completamente os anteriores
    const fileContainer = document.getElementById('file-container');
    const fileList = document.getElementById('file-list');

    fileContainer.style.display = 'none'; // Esconde a área de arquivos temporariamente
    fileList.innerHTML = ''; // 🔹 Remove arquivos anteriores

    document.getElementById('apartment-number').textContent = apartment;
    fileContainer.style.display = 'block'; // Exibe o container novamente

    let files = getFilesForApartment(apartment);

    // 🔹 Garantindo que os arquivos 1a e 1b apareçam quando for o apto 1
    if (apartment === '1') {
        files = [
            ...files,
            { name: 'Boleto Condomínio (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_condominio_apto_1a.pdf' },
            { name: 'Boleto Acordo M2D (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1a.pdf' },
            { name: 'Boleto Hidro/Eletr (A)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1a.pdf' },
            { name: 'Boleto Condomínio (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_condominio_apto_1b.pdf' },
            { name: 'Boleto Acordo M2D (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1b.pdf' },
            { name: 'Boleto Hidro/Eletr (B)', path: 'pdfs/boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1b.pdf' }
        ];
    }

    // 🔹 Move a Prestação de Contas para o final da lista
    const prestacaoDeContas = files.find(file => file.name === 'Prestação de Contas');
    files = files.filter(file => file.name !== 'Prestação de Contas');

    if (prestacaoDeContas) {
        files.push(prestacaoDeContas);
    }

    files.forEach(file => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = file.path;
        link.textContent = file.name;
        listItem.appendChild(link);
        fileList.appendChild(listItem);
    });
}

function getFilesForApartment(apartment) {
    const baseUrl = 'pdfs/'; // Caminho base para os arquivos

    let files = [
        { name: 'Boleto Condomínio', path: baseUrl + `boletos/2025/3.mar/boleto_tx_condominio_apto_${apartment}.pdf` },
        { name: 'Boleto Acordo M2D', path: baseUrl + `boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_${apartment}.pdf` },
        { name: 'Boleto Hidro/Eletr', path: baseUrl + `boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_${apartment}.pdf` },
        { name: 'Prestação de Contas', path: baseUrl + 'contas/2025/2.fev/prestacao_contas.pdf' } // 🔹 Arquivo agora será movido para o final
    ];

    return files;
}
