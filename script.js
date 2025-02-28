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
    const code = document.getElementById('accessCode').value.trim();
    const userData = accessCodes[code];

    if (userData) {
        const { id, name } = userData;

        document.querySelectorAll('.apartment-button').forEach(btn => btn.disabled = true);
        
        document.getElementById('file-list').innerHTML = '';
        document.getElementById('file-container').style.display = 'none';
        document.getElementById('viewer-container').style.display = 'none';

        const aptButton = document.getElementById(id);
        if (aptButton) {
            aptButton.disabled = false;
        } else {
            alert('Erro: botão do apartamento não encontrado.');
            return;
        }

        activeApartmentButtonId = id;

        document.getElementById('welcome-message').innerHTML = `Seja bem-vindo(a), ${name}. Clique no botão do seu apartamento para acessar seus boletos.`;

        document.getElementById('accessCode').value = '';

        // Ajuste correto no registro de logs
        window.logAccess(code, name, `Acesso ao apartamento ${id.replace('apto', '')}`, id);
    } else {
        alert('Código de acesso inválido.');
    }
}

function showFiles(apartment) {
    const fileContainer = document.getElementById('file-container');
    const fileList = document.getElementById('file-list');
    const viewerContainer = document.getElementById('viewer-container');

    fileContainer.style.display = 'none';
    fileList.innerHTML = '';

    document.getElementById('apartment-number').textContent = apartment;
    fileContainer.style.display = 'block';

    fileContainer.classList.remove('active');
    setTimeout(() => fileContainer.classList.add('active'), 50);

    let files = getFilesForApartment(apartment);

    files.forEach(file => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = "#";
        link.textContent = file.name;

        const isMobile = window.innerWidth <= 768;

        link.onclick = function (event) {
            event.preventDefault();
            if (isMobile) {
                window.open(file.path, "_blank");
            } else {
                openFileViewer(file.path);
            }

            const userData = Object.values(accessCodes).find(user => user.id === `apto${apartment}`);
            if (userData) {
                window.logAccess(userData.id, userData.name, file.name, apartment);
            }
        };

        listItem.appendChild(link);
        fileList.appendChild(listItem);
    });

    viewerContainer.style.display = 'none';
}

function openFileViewer(filePath) {
    const viewerContainer = document.getElementById('viewer-container');
    const fileViewer = document.getElementById('file-viewer');
    const downloadButton = document.getElementById('download-button');

    fileViewer.src = filePath;
    downloadButton.href = filePath;

    viewerContainer.style.display = 'block';
    viewerContainer.classList.remove('active');
    setTimeout(() => viewerContainer.classList.add('active'), 50);
}

function getFilesForApartment(apartment) {
    const baseUrl = 'pdfs/';
    let files = [
        { name: 'Boleto Condomínio', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_condominio_apto_${apartment}.pdf` },
        { name: 'Boleto Acordo M2D', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_${apartment}.pdf` },
        { name: 'Boleto Hidro/Eletr', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_${apartment}.pdf` }
    ];

    // Verifica se o apartamento é 1, e adiciona os arquivos de 1a e 1b
    if (apartment === "1") {
        files.push({ name: 'Boleto Condomínio 1A', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_condominio_apto_1a.pdf` });
        files.push({ name: 'Boleto Acordo M2D 1A', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1a.pdf` });
        files.push({ name: 'Boleto Hidro/Eletr 1A', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1a.pdf` });

        files.push({ name: 'Boleto Condomínio 1B', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_condominio_apto_1b.pdf` });
        files.push({ name: 'Boleto Acordo M2D 1B', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_1b.pdf` });
        files.push({ name: 'Boleto Hidro/Eletr 1B', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_1b.pdf` });
    }

    // Adiciona a prestação de contas uma única vez
    files.push({ name: 'Prestação de Contas', path: `${baseUrl}contas/2025/2.fev/prestacao_contas.pdf` });

    return files;
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("apto202").disabled = true;
    document.getElementById("apto301").disabled = true;
});

// Ajuste para horário de Brasília (UTC-3)
window.logAccess = function (userCode, userName, downloadedFile, apartment) {
    const db = getDatabase();
    
    let now = new Date();
    now.setHours(now.getHours() - 3); // Ajusta para UTC-3

    const accessLog = {
        userName: userName,
        apartment: apartment,
        downloadedFile: downloadedFile,
        userCode: userCode,
        accessDateTime: now.toISOString() 
    };

    const logsRef = ref(db, 'logs/');
    push(logsRef, accessLog)
        .then(() => console.log('Log registrado com sucesso:', accessLog))
        .catch(error => console.error('Erro ao registrar o log:', error));
};
