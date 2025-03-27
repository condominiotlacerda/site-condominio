import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

let accessCodes = {};

fetch('dados/codigos_acesso.json')
  .then(response => response.json())
  .then(data => {
    accessCodes = data;
    console.log('Códigos de acesso carregados:', accessCodes);
  })
  .catch(error => {
    console.error('Erro ao carregar códigos de acesso:', error);
  });

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
            console.log("Valor do emailCadastro:", emailCadastro);
            const senhaCadastro = document.getElementById('senhaCadastro').value;
            const codigoAcessoInput = document.getElementById('codigoAcesso');
            const codigoAcesso = codigoAcessoInput.value;
            const mensagemCadastro = document.getElementById('mensagemCadastro');

            console.log("Tipo de getAuth:", typeof getAuth);

            const auth = getAuth();

            if (accessCodes.hasOwnProperty(codigoAcesso)) {
                const userData = accessCodes[codigoAcesso];
                const apartmentId = userData.id;

                createUserWithEmailAndPassword(auth, document.getElementById('emailCadastro').value, senhaCadastro)
                    .then((userCredential) => {
                        // Usuário criado com sucesso
                        const user = userCredential.user;
                        console.log("Usuário criado com sucesso:", user.uid);
                        mensagemCadastro.textContent = 'Cadastro realizado com sucesso! Aguarde a aprovação do seu acesso.';

                        // Vamos armazenar o código de acesso e apartmentId no Realtime Database
                        const db = getDatabase();

                        // Salvar informações em pendingApprovals
                        const pendingRef = ref(db, 'pendingApprovals/' + user.uid);
                        set(pendingRef, {
                            email: emailCadastro,
                            accessCode: codigoAcesso,
                            apartmentId: apartmentId
                        });

                        // Salvar informações em userApartments
                        const userApartmentRef = ref(db, 'userApartments/' + user.uid);
                        set(userApartmentRef, {
                            apartmentId: apartmentId
                        });

                        console.log("Dados salvos com sucesso no Realtime Database");
                        formularioCadastro.reset();

                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.error("Erro ao criar usuário:", errorCode, errorMessage);
                        mensagemCadastro.textContent = 'Erro ao cadastrar: ' + errorMessage;
                    });
            } else {
                mensagemCadastro.textContent = 'Código de acesso inválido.';
            }

            console.log("Código de Acesso (Cadastro):", codigoAcesso); // Para verificar no console
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

    const formularioLogin = document.getElementById('formularioLogin');
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailLogin = document.getElementById('emailLogin').value;
            const senhaLogin = document.getElementById('senhaLogin').value;
            const mensagemLogin = document.getElementById('mensagemLogin');

            const auth = getAuth(); // Obtenha a instância do auth

            console.log("Tentando login com:", emailLogin, senhaLogin);

            signInWithEmailAndPassword(auth, emailLogin, senhaLogin)
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("Usuário logado com sucesso:", user.uid);
                    const db = getDatabase();
                    const pendingRef = ref(db, 'pendingApprovals/' + user.uid);

                    get(pendingRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            // Usuário ainda está em pendingApprovals, exibir mensagem
                            mensagemLogin.textContent = 'Seu acesso ainda está pendente de aprovação. Por favor, aguarde.';
                        } else {
                            // Usuário não está em pendingApprovals, prosseguir com o login
                            mensagemLogin.textContent = 'Login realizado com sucesso!';

                            // Buscar o apartmentId do Realtime Database
                            const userDetailsRef = ref(db, 'userApartments/' + user.uid);

                            get(userDetailsRef).then((userSnapshot) => {
                                if (userSnapshot.exists() && userSnapshot.val().apartmentId) {
                                    const apartmentId = userSnapshot.val().apartmentId;
                                    localStorage.setItem('apartmentId', apartmentId); // Armazena o ID no localStorage
                                    window.location.href = 'area_condominio.html';
                                } else {
                                    console.error("apartmentId não encontrado para o usuário:", user.uid);
                                    mensagemLogin.textContent = 'Erro ao carregar informações do seu apartamento. Tente novamente mais tarde.';
                                }
                            }).catch((error) => {
                                console.error("Erro ao buscar detalhes do usuário:", error);
                                mensagemLogin.textContent = 'Ocorreu um erro ao carregar informações do seu apartamento. Tente novamente mais tarde.';
                            });
                        }
                    }).catch((error) => {
                        console.error("Erro ao verificar aprovação:", error);
                        mensagemLogin.textContent = 'Ocorreu um erro ao verificar seu acesso. Tente novamente mais tarde.';
                    });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log("Código de erro:", errorCode); // Esta linha aqui

                    if (errorCode === 'auth/invalid-email') {
                        mensagemLogin.textContent = 'O email digitado é inválido.';
                    } else if (errorCode === 'auth/invalid-credential') {
                        mensagemLogin.innerHTML = 'E-mail e/ou senha incorretos.<br>Verifique se você digitou corretamente suas credenciais.<br>Se você esqueceu sua senha, use o link "Esqueci minha senha".';
                    } else {
                        mensagemLogin.textContent = 'Erro ao fazer login: ' + errorMessage; // Mensagem genérica para outros erros
                    }

                    console.error("Erro ao fazer login:", errorCode, errorMessage);
                });
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
