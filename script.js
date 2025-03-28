import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyBzgHcrZNvCQEunq-d3LeDm0u4LDhwjDgM",
  authDomain: "logsite-d81dd.firebaseapp.com",
  databaseURL: "https://logsite-d81dd-default-rtdb.firebaseio.com",
  projectId: "logsite-d81dd",
  storageBucket: "logsite-d81dd.firebasestorage.app",
  messagingSenderId: "285508603780",
  appId: "1:285508603780:web:dba70ace036ee8a37297d1",
  measurementId: "G-B0JHRHTNKF"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

let activeApartmentButtonId = null;

function enableApartment() {
  const code = document.getElementById('accessCode').value.trim();
  alert('Esta funcionalidade foi substituída pelo cadastro.');
}

export function showFiles(apartment) {
  console.log('Função showFiles chamada para o apartamento:', apartment);

  const fileContainer = document.getElementById('file-container');
  const fileList = document.getElementById('file-list');
  const viewerContainer = document.getElementById('viewer-container');

  console.log('Elemento fileContainer:', fileContainer); // Movido para cá
  console.log('Elemento fileList:', fileList);       // Movido para cá

  fileContainer.style.display = 'none';
  fileList.innerHTML = '';

  document.getElementById('apartment-number').textContent = apartment;
  fileContainer.style.display = 'block';

  fileContainer.classList.remove('active');
  setTimeout(() => fileContainer.classList.add('active'), 50);

  let files = getFilesForApartment(apartment);

  console.log('Arquivos obtidos:', files);


  files.forEach(file => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = "#";
    link.textContent = file.name;

    console.log('Criado link:', link); // Adicione esta linha
    console.log('Texto do link:', file.name); // Adicione esta linha

    const isMobile = window.innerWidth <= 768;

    link.onclick = function (event) {
      event.preventDefault();
      if (isMobile) {
        window.open(file.path, "_blank");
      } else {
        openFileViewer(file.path);
      }
    };

    listItem.appendChild(link);
    console.log('Criado listItem:', listItem); // Adicione esta linha
    fileList.appendChild(listItem);
  });

}

function openFileViewer(filePath) {
  console.log('Função openFileViewer chamada com:', filePath); // Adicione esta linha
  const viewerContainer = document.getElementById('viewer-container');
  const fileViewer = document.getElementById('file-viewer');
  const downloadButton = document.getElementById('download-button');

  fileViewer.src = filePath;
  downloadButton.href = filePath;

  // Remove o display none do estilo inline
  viewerContainer.style.display = '';

  // Adiciona a classe 'active' ao viewerContainer
  viewerContainer.classList.add('active');

  // Não precisamos remover a classe 'active' aqui, pois ela será adicionada agora
  // viewerContainer.classList.remove('active');
  // setTimeout(() => viewerContainer.classList.add('active'), 50);
  window.logAccess('CODIGO_DE_TESTE', 'NOME_DE_TESTE', file.name, document.getElementById('apartment-number').textContent);
}

function getFilesForApartment(apartment) {
  const baseUrl = 'pdfs/';
  // Remove o prefixo 'apto' para obter apenas o número
  const aptoNumber = apartment.replace('apto', '');
  let files = [
    { name: 'Boleto Condomínio', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_condominio_apto_${aptoNumber}.pdf` },
    { name: 'Boleto Acordo M2D', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_acordo_m2d_apto_${aptoNumber}.pdf` },
    { name: 'Boleto Hidro/Eletr', path: `${baseUrl}boletos/2025/3.mar/boleto_tx_hidro_eletr_apto_${aptoNumber}.pdf` }
  ];

  files.push({ name: 'Prestação de Contas', path: `${baseUrl}contas/2025/2.fev/prestacao_contas.pdf` });

  return files;
}

document.addEventListener("DOMContentLoaded", function () {
  const formularioCadastro = document.getElementById('formularioCadastro');
  if (formularioCadastro) {
    formularioCadastro.addEventListener('submit', async function(event) {
      event.preventDefault();
      const emailCadastro = document.getElementById('emailCadastro').value;
      const senhaCadastro = document.getElementById('senhaCadastro').value;
      const codigoAcessoInput = document.getElementById('codigoAcesso');
      const codigoAcesso = codigoAcessoInput.value;
      const mensagemCadastro = document.getElementById('mensagemCadastro');

      const auth = getAuth();
      const db = getDatabase();
      const invitesCollection = collection(firestore, 'invites');
      const inviteDocRef = doc(firestore, 'invites', codigoAcesso); // Obtém a referência ao documento pelo ID

      try {
        const docSnap = await getDoc(inviteDocRef); // Busca o documento pelo ID

        if (docSnap.exists()) {
          const inviteData = docSnap.data();
          if (inviteData.isUsed === false) {
            const apartmentId = inviteData.apartment;

            if (apartmentId) {
              try {
                const userCredential = await createUserWithEmailAndPassword(auth, emailCadastro, senhaCadastro);
                const user = userCredential.user;
                console.log("Usuário cadastrado com sucesso:", user.uid);
                mensagemCadastro.textContent = 'Cadastro realizado com sucesso! Aguarde a aprovação do seu acesso.';

                // Salvar informações em pendingApprovals
                const pendingRef = ref(db, 'pendingApprovals/' + user.uid);
                await set(pendingRef, {
                  email: emailCadastro,
                  accessCode: codigoAcesso,
                  apartmentId: apartmentId
                });

                // Salvar informações em userApartments
                const userApartmentRef = ref(db, 'userApartments/' + user.uid);
                await set(userApartmentRef, {
                  apartmentId: apartmentId
                });

                // Marcar o código como usado no Firestore
                await updateDoc(inviteDocRef, { isUsed: true });

                console.log("Dados salvos com sucesso no Realtime Database");
                formularioCadastro.reset();

              } catch (error) {
                console.error("Erro ao criar usuário:", error);
                mensagemCadastro.textContent = 'Erro ao cadastrar: ' + error.message;
              }
            } else {
              mensagemCadastro.textContent = 'Erro ao obter o apartamento associado ao código.';
            }
          } else {
            mensagemCadastro.textContent = 'Código de acesso já utilizado.';
          }
        } else {
          mensagemCadastro.textContent = 'Código de acesso inválido.';
        }

      } catch (error) {
        console.error("Erro ao consultar o Firestore:", error);
        mensagemCadastro.textContent = 'Erro ao verificar o código de acesso. Tente novamente mais tarde.';
      }
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
    formularioLogin.addEventListener('submit', async function(event) {
      event.preventDefault();
      const emailLogin = document.getElementById('emailLogin').value;
      const senhaLogin = document.getElementById('senhaLogin').value;
      const mensagemLogin = document.getElementById('mensagemLogin');

      const auth = getAuth();
      const db = getDatabase();

      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailLogin, senhaLogin);
        const user = userCredential.user;
        console.log("Usuário logado com sucesso:", user.uid);
        const pendingRef = ref(db, 'pendingApprovals/' + user.uid);
        const snapshot = await get(pendingRef);

        if (snapshot.exists()) {
          mensagemLogin.textContent = 'Seu acesso ainda está pendente de aprovação. Por favor, aguarde.';
        } else {
          mensagemLogin.textContent = 'Login realizado com sucesso!';
          const userDetailsRef = ref(db, 'userApartments/' + user.uid);
          const userSnapshot = await get(userDetailsRef);

          if (userSnapshot.exists() && userSnapshot.val().apartmentId) {
            const apartmentId = userSnapshot.val().apartmentId;
            localStorage.setItem('apartmentId', apartmentId);
            window.location.href = 'area_condominio.html';
          } else {
            console.error("apartmentId não encontrado para o usuário:", user.uid);
            mensagemLogin.textContent = 'Erro ao carregar informações do seu apartamento. Tente novamente mais tarde.';
          }
        }
      } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Código de erro:", errorCode);

        if (errorCode === 'auth/invalid-email') {
          mensagemLogin.textContent = 'O email digitado é inválido.';
        } else if (errorCode === 'auth/invalid-credential') {
          mensagemLogin.innerHTML = 'E-mail e/ou senha incorretos.<br>Verifique se você digitou corretamente suas credenciais.<br>Se você esqueceu sua senha, use o link "Esqueci minha senha".';
        } else {
          mensagemLogin.textContent = 'Erro ao fazer login: ' + errorMessage;
        }

        console.error("Erro ao fazer login:", errorCode, errorMessage);
      }
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
