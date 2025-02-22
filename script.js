const accessCodes = {
    'aB9x-Yz!2W': 'apto1',
    'cDe5_Fg#H7': 'apto101',
    'iJk1$Lm%N3': 'apto102',
    'oPq8^Rs&T4': 'apto201',
    'xY7z!aB-cD': 'apto201',
    'FgH7+iJk=1': 'apto302',
    'LmN3[oPq]8': 'apto401'
};

const apartmentNames = {
    'apto1': 'João Paulo',
    'apto101': 'Lizandro',
    'apto102': 'Felipe Granja',
    'apto201': 'Jorge',
    'apto302': 'Suzane',
    'apto401': 'Célia'
};

let activeApartmentButtonId = null; // Armazena o ID do botão ativo

function enableApartment() {
    const code = document.getElementById('accessCode').value;
    const apartmentButtonId = accessCodes[code];

    if (apartmentButtonId) {
        // Desabilita o botão ativo anterior, se houver
        if (activeApartmentButtonId) {
            document.getElementById(activeApartmentButtonId).disabled = true;
        }

        // Limpa a lista de arquivos exibida anteriormente
        document.getElementById('file-list').innerHTML = '';
        document.getElementById('file-container').style.display = 'none';

        // Habilita o novo botão
        document.getElementById(apartmentButtonId).disabled = false;
        activeApartmentButtonId = apartmentButtonId; // Atualiza o botão ativo

        // Atualiza a mensagem de boas-vindas
        document.getElementById('welcome-message').innerHTML = `Seja bem-vindo, ${apartmentNames[apartmentButtonId]}. Abaixo estão os seus boletos. Clique sobre eles para baixá-los:`;

        // Limpa o campo de código e oculta o código inserido
        document.getElementById('accessCode').value = '';
    } else {
        alert('Código de acesso inválido.');
    }
}

function showFiles(apartment) {
    document.getElementById('apartment-number').textContent = apartment;
    document.getElementById('file-container').style.display = 'block';
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = ''; // Limpa a lista anterior

    const files = getFilesForApartment(apartment);
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

    if (apartment === '1') {
        return [
            { name: 'Boleto Condomínio', path: baseUrl + 'boletos/2025/3.mar/boleto_tx_condominio_apto_1.pdf' },
            { name: 'Boleto Acordo M2D', path: baseUrl + 'boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1.pdf' },
            { name: 'Boleto Hidro/Eletr', path: baseUrl + 'boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1.pdf' },
            { name: 'Boleto Condomínio (A)', path: baseUrl + 'boletos/2025/3.mar/boleto_tx_condominio_apto_1a.pdf' },
            { name: 'Boleto Acordo M2D (A)', path: baseUrl + 'boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1a.pdf' },
            { name: 'Boleto Hidro/Eletr (A)', path: baseUrl + 'boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1a.pdf' },
            { name: 'Boleto Condomínio (B)', path: baseUrl + 'boletos/2025/3.mar/boleto_tx_condominio_apto_1b.pdf' },
            { name: 'Boleto Acordo M2D (B)', path: baseUrl + 'boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1b.pdf' },
            { name: 'Boleto Hidro/Eletr (B)', path: baseUrl + 'boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1b.pdf' },
            { name: 'Prestação de Contas', path: baseUrl + 'contas/2025/2.fev/prestacao_contas.pdf' }
        ];
    } else {
        return [
            { name: 'Boleto Condomínio', path: baseUrl + `boletos/2025/3.mar/boleto_tx_condominio_apto_${apartment}.pdf` },
            { name: 'Boleto Acordo M2D', path: baseUrl + `boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_${apartment}.pdf` },
            { name: 'Boleto Hidro/Eletr', path: baseUrl + `boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_${apartment}.pdf` },
            { name: 'Prestação de Contas', path: baseUrl + 'contas/2025/2.fev/prestacao_contas.pdf' }
        ];
    }
}

