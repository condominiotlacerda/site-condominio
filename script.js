let nomesTaxas = {};

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
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
  const contasContainer = document.getElementById('contas-container');
  const notificationsContainer = document.getElementById('notifications-container'); // Pega a referência para a caixa de notificações

  console.log('Elemento fileContainer:', fileContainer);
  console.log('Elemento fileList:', fileList);
  console.log('Elemento contasContainer:', contasContainer);
  console.log('Elemento notificationsContainer:', notificationsContainer); // Log para verificar a referência

  fileContainer.style.display = 'none';
  contasContainer.style.display = 'none';
  notificationsContainer.style.display = 'none'; // Garante que a caixa de notificações também esteja inicialmente escondida
  fileList.innerHTML = '';

  document.getElementById('apartment-number').textContent = apartment;
  fileContainer.style.display = 'block';
  contasContainer.style.display = 'block';
  notificationsContainer.style.display = 'block'; // Mostra a caixa de notificações

  fileContainer.classList.remove('active');
  contasContainer.classList.remove('active');
  notificationsContainer.classList.remove('active'); // Remove a classe active da caixa de notificações
  setTimeout(() => {
    fileContainer.classList.add('active');
    contasContainer.classList.add('active');
    notificationsContainer.classList.add('active'); // Adiciona a classe active para a transição na caixa de notificações
  }, 50);

  let files = getFilesForApartment(apartment);

  console.log('Arquivos obtidos:', files);

  files.forEach(file => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = "#";
    link.textContent = file.name;

    const isMobile = window.innerWidth <= 768;

    link.onclick = function (event) {
      event.preventDefault();
      const apartmentId = localStorage.getItem('apartmentId');
      const documentName = file.name;
      const now = new Date();

      logAccess(null, documentName, apartmentId);

      if (isMobile) {
        window.open(file.path, "_blank");
      } else {
        openFileViewer(file.path);
      }
    };

    listItem.appendChild(link);
    fileList.appendChild(listItem);
  });

  // Carrega as notificações aqui (o código que já criamos para o fetch)
  fetch('dados/notificacoes.json')
    .then(response => response.json())
    .then(notificacoesData => {
      const apartmentId = localStorage.getItem('apartmentId');
      const notificationsList = document.getElementById('notifications-list');

      if (apartmentId && notificacoesData[apartmentId]) {
        notificationsList.textContent = notificacoesData[apartmentId];
      } else {
        notificationsList.textContent = 'Nenhuma notificação para este apartamento.';
      }
    })
    .catch(error => {
      console.error('Erro ao carregar notificações:', error);
      const notificationsList = document.getElementById('notifications-list');
      if (notificationsList) {
        notificationsList.textContent = 'Erro ao carregar notificações.';
      }
    });
}

function openFileViewer(filePath) {
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
}

function getFilesForApartment(apartment) {
  const baseUrl = 'pdfs/boletos/';
  const aptoNumber = apartment.replace('apto', '');
  let files = [
    { name: nomesTaxas.taxaCondominio, path: `${baseUrl}boleto_tx_condominio_apto_${aptoNumber}.pdf` },
    { name: nomesTaxas.taxa1Name, path: `${baseUrl}boleto_tx_1_apto_${aptoNumber}.pdf` },
    { name: nomesTaxas.taxa2Name, path: `${baseUrl}boleto_tx_2_apto_${aptoNumber}.pdf` },
    { name: nomesTaxas.taxa3Name, path: `${baseUrl}boleto_tx_3_apto_${aptoNumber}.pdf` } // 👈 Adicionamos esta linha
  ];

  return files;
}

document.addEventListener("DOMContentLoaded", function () {

  // Código para buscar o arquivo name_taxas.json
  fetch('dados/name_taxas.json')
    .then(response => response.json())
    .then(data => {
      nomesTaxas = data;
      console.log('Nomes das taxas carregados:', nomesTaxas);
      // Qualquer código que dependa de nomesTaxas pode ser colocado aqui ou em funções chamadas aqui
    })
    .catch(error => {
      console.error('Erro ao carregar nomes das taxas:', error);
      // Defina nomes padrão aqui se necessário
    });

  const anoConta = document.getElementById('ano-conta');
  const mesConta = document.getElementById('mes-conta');

  if (anoConta) {
    anoConta.addEventListener('change', function() {
        
      const listaContas = document.getElementById('contas-list');
    
      const anoSelecionado = this.value;
      const mesSelecionado = mesConta.value;
      console.log('Ano selecionado:', anoSelecionado);
      console.log('Mês selecionado (após mudança de ano):', mesSelecionado);

      // Construindo o caminho do arquivo
      const caminhoPrestacaoContas = `pdfs/contas/${anoSelecionado}/${mesSelecionado}.` + obterAbreviacaoMes(parseInt(mesSelecionado)) + `/prestacao_contas.pdf`;
      console.log('Caminho da Prestação de Contas (após mudança de ano):', caminhoPrestacaoContas);

      // Limpa a lista de contas
  listaContas.innerHTML = '';

  // Cria um novo item de lista
  const listItem = document.createElement('li');

  // Cria um link para o arquivo
  const link = document.createElement('a');
  link.href = "#"; // Alteramos o href para "#"
  const mesAbreviado = obterAbreviacaoMes(parseInt(mesSelecionado));
  link.textContent = `Prestação de Contas - ${mesAbreviado}/${anoSelecionado}`; // Define o texto do link

  // Adiciona um evento de clique para chamar a função openFileViewer
  link.addEventListener('click', function(event) {
    event.preventDefault();
    console.log('Link da Prestação de Contas clicado!');
    const anoSelecionado = anoConta.value;
    const mesSelecionado = mesConta.value;
    const mesAbreviado = obterAbreviacaoMes(parseInt(mesSelecionado));
    const documento = `Prestacao_de_Contas_${mesAbreviado}_${anoSelecionado}.pdf`;
    try {
      logAccess(null, documento, localStorage.getItem('apartmentId'));
    } catch (error) {
      console.error('Erro ao executar logAccess:', error);
    }
    openFileViewer(caminhoPrestacaoContas);
  });

  // Adiciona o link ao item de lista
  listItem.appendChild(link);

  // Adiciona o item de lista à lista de contas
  listaContas.appendChild(listItem);
      // Próximos passos virão aqui...
    });
  }

  if (mesConta) {
    mesConta.addEventListener('change', function() {
      const listaContas = document.getElementById('contas-list');
      const mesSelecionado = this.value;
      const anoSelecionado = anoConta.value;
      console.log('Mês selecionado:', mesSelecionado);
      console.log('Ano selecionado (após mudança de mês):', anoSelecionado);

      // Construindo o caminho do arquivo
      const caminhoPrestacaoContas = `pdfs/contas/${anoSelecionado}/${mesSelecionado}.` + obterAbreviacaoMes(parseInt(mesSelecionado)) + `/prestacao_contas.pdf`;
      console.log('Caminho da Prestação de Contas (após mudança de mês):', caminhoPrestacaoContas);

      // Limpa a lista de contas
      listaContas.innerHTML = '';

      // Cria um novo item de lista
      const listItem = document.createElement('li');

      // Cria um link para o arquivo
      const link = document.createElement('a'); // 👈 DECLARAÇÃO DA VARIÁVEL LINK
      link.href = "#"; // Alteramos o href para "#"
      const mesAbreviado = obterAbreviacaoMes(parseInt(mesSelecionado));
      link.textContent = `Prestação de Contas - ${mesAbreviado}/${anoSelecionado}`; // Define o texto do link

      // Adiciona um evento de clique para chamar a função openFileViewer
      link.addEventListener('click', function(event) {
        event.preventDefault();
        console.log('Link da Prestação de Contas clicado!');
        const anoSelecionado = anoConta.value;
        const mesSelecionado = mesConta.value;
        const mesAbreviado = obterAbreviacaoMes(parseInt(mesSelecionado));
        const documento = `Prestacao_de_Contas_${mesAbreviado}_${anoSelecionado}.pdf`;
        try {
          logAccess(null, documento, localStorage.getItem('apartmentId'));
        } catch (error) {
          console.error('Erro ao executar logAccess:', error);
        }
        openFileViewer(caminhoPrestacaoContas);
      });

      // Adiciona o link ao item de lista
      listItem.appendChild(link);

      // Adiciona o item de lista à lista de contas
      listaContas.appendChild(listItem);

      // Próximos passos virão aqui...
    });
  }

  function obterAbreviacaoMes(numeroMes) {
  const meses = ["", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return meses[numeroMes] || ""; // Retorna a abreviação ou vazio se o número do mês for inválido
}
  
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
window.logAccess = function (userCode, downloadedFile, apartment) {
  const db = getDatabase();
  let now = new Date();
  now.setHours(now.getHours() - 3);
  const accessLog = {
    apartment: apartment, // Invertido (como solicitado)
    downloadedFile: downloadedFile,  // Invertido (como solicitado)
    userCode: userCode,
    accessDateTime: now.toISOString()
  };

  const aptoNumber = apartment.replace('apto', '');
  const formattedDateTime = now.toISOString().replace('T', '_').replace(/:/g, '-').split('.')[0];
  const safeFileName = downloadedFile.replace(/[^a-zA-Z0-9_-]/g, '_');
  const logKey = `${aptoNumber}_${formattedDateTime}_${safeFileName}`;
  console.log('Log Key gerada:', logKey);
  const logRef = ref(db, `logs/${logKey}`);
  set(logRef, accessLog)
    .then(() => console.log('Log registrado com sucesso:', accessLog))
    .catch(error => console.error('Erro ao registrar o log:', error));
};
