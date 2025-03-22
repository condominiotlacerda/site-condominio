const accessCodes = {
    'aB9x-Yz!2W': { id: 'apto1', name: 'João Paulo' },
    'QrSt-Uv!W6': { id: 'apto1', name: 'José Rocha' },
    'cDe5_Fg#H7': { id: 'apto101', name: 'Lizandro' },
    'iJk1$Lm%N3': { id: 'apto102', name: 'Felipe Granja' },
    'oPq8^Rs&T4': { id: 'apto201', name: 'Jorge' },
    'xY7z!aB-cD': { id: 'apto201', name: 'Ângela' },
    'FgH7+iJk=1': { id: 'apto302', name: 'Suzane' },
    'LmN3[oPq]8': { id: 'apto401', name: 'Célia' },
    'uVw2*Xy(Z6': { id: 'apto202', name: 'Lígia' },
    '1aB3)cDe-5': { id: 'apto301', name: 'João Marcelo' }
};

let activeApartmentButtonId = null;

function enableApartment() {
    const code = document.getElementById('accessCode').value.trim();
    const userData = accessCodes[code];

    if (userData) {
        const { id, name } = userData;
        localStorage.setItem('accessCode', code);
        window.location.href = 'area_condominio.html';
        window.logAccess(code, name, `Acesso à área do condômino`, 'homepage'); // Alterei a descrição do log
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
    // REMOVIDO: Lógica específica para apartamento 1A e 1B

    // Adiciona a prestação de contas uma única vez
    files.push({ name: 'Prestação de Contas', path: `${baseUrl}contas/2025/2.fev/prestacao_contas.pdf` });

    return files;
}

document.addEventListener("DOMContentLoaded", function () {
    //document.getElementById("apto202").disabled = true;
    //document.getElementById("apto301").disabled = true;

    const formularioCadastro = document.getElementById('formularioCadastro');
    if (formularioCadastro) {
        formularioCadastro.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailCadastro = document.getElementById('emailCadastro').value;
            const senhaCadastro = document.getElementById('senhaCadastro').value;
            const codigoAcessoInput = document.getElementById('codigoAcesso');
            const codigoAcesso = codigoAcessoInput.value;
            const mensagemCadastro = document.getElementById('mensagemCadastro');

            const auth = firebase.auth();
                firebase.auth().createUserWithEmailAndPassword(auth, emailCadastro, senhaCadastro)
                .then((userCredential) => {
                    // Usuário criado com sucesso
                    const user = userCredential.user;
                    console.log("Usuário criado com sucesso:", user.uid);
                    mensagemCadastro.textContent = 'Cadastro realizado com sucesso! Aguarde a aprovação do seu acesso.';

                    // Vamos armazenar o código de acesso no Realtime Database
                    const db = getDatabase();
                    const userRef = ref(db, 'pendingApprovals/' + user.uid); // 'pendingApprovals' é o nó onde vamos guardar os dados

                    set(userRef, {
                        accessCode: codigoAcesso,
                        email: emailCadastro // Podemos armazenar o email também para referência
                    }).then(() => {
                        console.log("Código de acesso armazenado para o usuário:", user.uid);
                        // Opcional: limpar o formulário aqui
                        formularioCadastro.reset();
                    }).catch((error) => {
                        console.error("Erro ao armazenar o código de acesso:", error);
                        mensagemCadastro.textContent = 'Erro ao cadastrar. Tente novamente mais tarde.';
                    });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Erro ao criar usuário:", errorCode, errorMessage);
                    mensagemCadastro.textContent = 'Erro ao cadastrar: ' + errorMessage;
                    // Aqui você pode tratar os diferentes tipos de erros (email já em uso, senha fraca, etc.)
                });

            console.log("Código de Acesso (Cadastro):", codigoAcesso); // Para verificar no console
            // Por enquanto, vamos manter o console.log do código de acesso aqui
            // Depois de criar o usuário, o próximo passo será armazenar esse código no banco de dados
        });
    }

    const loginSection = document.getElementById('login');
    const cadastroSection = document.getElementById('cadastro');
    const mostrarCadastroLink = document.getElementById('mostrarCadastro');
    const mostrarLoginLink = document.getElementById('mostrarLogin');

    if (mostrarCadastroLink) {
        mostrarCadastroLink.addEventListener('click', function(event) {
            event.preventDefault();
            loginSection.style.display = 'none';
            cadastroSection.style.display = 'block';
        });
    }

    if (mostrarLoginLink) {
        mostrarLoginLink.addEventListener('click', function(event) {
            event.preventDefault();
            cadastroSection.style.display = 'none';
            loginSection.style.display = 'block';
        });
    }
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
