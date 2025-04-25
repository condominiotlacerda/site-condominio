let nomesTaxas = {};

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

import { app } from './firebase.js';

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
  const documentosContainer = document.getElementById('documentos-container');

  console.log('Elemento fileContainer:', fileContainer);
  console.log('Elemento fileList:', fileList);
  console.log('Elemento contasContainer:', contasContainer);
  console.log('Elemento notificationsContainer:', notificationsContainer); // Log para verificar a referência

  fileContainer.style.display = 'none';
  contasContainer.style.display = 'none';
  notificationsContainer.style.display = 'none'; // Garante que a caixa de notificações também esteja inicialmente escondida
  documentosContainer.style.display = 'none';
  fileList.innerHTML = '';

  document.getElementById('apartment-number').textContent = apartment;
  fileContainer.style.display = 'block';
  contasContainer.style.display = 'block';
  notificationsContainer.style.display = 'block';
  documentosContainer.style.display = 'block';

  fileContainer.classList.remove('active');
  contasContainer.classList.remove('active');
  notificationsContainer.classList.remove('active');
  documentosContainer.classList.remove('active');
  setTimeout(() => {
    fileContainer.classList.add('active');
    contasContainer.classList.add('active');
    notificationsContainer.classList.add('active');
    documentosContainer.classList.add('active');
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
    listItem.appendChild(document.createElement('br'));
    fileList.appendChild(listItem);
  });

  // Carrega as notificações aqui
  fetch('dados/notificacoes.json')
    .then(response => response.json())
    .then(notificacoesData => {
      const apartmentIdFromStorage = localStorage.getItem('apartmentId');
      console.log('Valor de apartmentIdFromStorage:', apartmentIdFromStorage);
      let apartmentNumber = apartmentIdFromStorage ? apartmentIdFromStorage.match(/^(\d+)/)?.[1] : null;
      const apartmentId = apartmentNumber ? `apto_${apartmentNumber}` : null;
      const notificationsList = document.getElementById('notifications-list');
      console.log('Valor de apartmentId para buscar notificações:', apartmentId);
      notificationsList.innerHTML = '';

      if (apartmentId && notificacoesData[apartmentId]) {
        const notificationText = notificacoesData[apartmentId];
        const lines = notificationText.split('\n');
        let notificationCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith(String(notificationCount + 1) + '.')) {
            notificationCount++;
            const parts = line.split('.');
            if (parts.length > 1) {
              const notificationId = parts[0].trim();
              const notificationDescription = parts.slice(1).join('.').trim();
              const filename = `notificacoes/notificacao_${notificationId}_apto_${apartmentId.replace('apto_', '')}.pdf`;

              const listItem = document.createElement('li');
              const link = document.createElement('a');
              link.href = '#';
              link.textContent = line;

              link.addEventListener('click', function(event) {
                event.preventDefault();
                // *** É AQUI QUE VOCÊ PRECISA ADICIONAR O LOG ***
                const apartmentId = localStorage.getItem('apartmentId');
                const notificationText = this.textContent;
                logAccess(null, `Visualização da notificação: ${notificationText}`, apartmentId);
                openFileViewer(filename);
              });

              listItem.appendChild(link);
              notificationsList.appendChild(listItem);
            }
          }
        }

        if (notificationsList.innerHTML === '') {
          const listItem = document.createElement('li');
          listItem.textContent = 'Nenhuma notificação para este apartamento.';
          notificationsList.appendChild(listItem);
        }

      } else {
        const listItem = document.createElement('li');
        listItem.textContent = 'Nenhuma notificação para este apartamento.';
        notificationsList.appendChild(listItem);
      }
    })
    .catch(error => {
      console.error('Erro ao carregar notificações:', error);
      const notificationsList = document.getElementById('notifications-list');
      if (notificationsList) {
        notificationsList.textContent = 'Erro ao carregar notificações.';
      }
    });

    const documentosList = document.getElementById('documentos-list');
      if (documentosList && apartment) {
        const previsaoLink = document.createElement('a');
        previsaoLink.textContent = 'Previsão de despesas';
        previsaoLink.style.color = 'blue';
        previsaoLink.href = '#';
        previsaoLink.addEventListener('click', function(event) {
        event.preventDefault();
        const filePath = 'previsao_despesas/previsao_despesas.pdf';
        const apartmentId = localStorage.getItem('apartmentId');
        logAccess(null, 'Visualização de Previsão de despesas', apartmentId);
        openFileViewer(filePath);
      });

        const listItem = document.createElement('li');
        listItem.appendChild(previsaoLink);
        listItem.appendChild(document.createElement('br'));

        documentosList.appendChild(listItem);
      }

      const seuDinheiroLink = document.createElement('a');
        seuDinheiroLink.textContent = 'Seu Dinheiro';
        seuDinheiroLink.style.color = 'blue';
        seuDinheiroLink.href = '#';
        seuDinheiroLink.addEventListener('click', function(event) {
          event.preventDefault();
      const filePath = 'https://brilliant-gumption-dac373.netlify.app/seu_dinheiro/seu_dinheiro_1.pdf';
      const apartmentId = localStorage.getItem('apartmentId');
      logAccess(null, 'Visualização de Seu Dinheiro', apartmentId);
      openFileViewer(filePath);
    }); // <--- Aqui fecha a função do evento de clique

    const listItem2 = document.createElement('li');
    listItem2.appendChild(seuDinheiroLink);
    listItem2.appendChild(document.createElement('br'));

    documentosList.appendChild(listItem2);
  
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
}

function getFilesForApartment(apartment) {
  const baseUrl = 'pdfs/boletos/';
  const aptoNumber = apartment.replace('apto', '');
  let files = [
    { name: nomesTaxas.taxaCondominio, path: `${baseUrl}boleto_tx_condominio_apto_${aptoNumber}.pdf` },
    { name: nomesTaxas.taxa1Name, path: `${baseUrl}boleto_tx_1_apto_${aptoNumber}.pdf` },
    { name: nomesTaxas.taxa2Name, path: `${baseUrl}boleto_tx_2_apto_${aptoNumber}.pdf` },
    { name: nomesTaxas.taxa3Name, path: `${baseUrl}boleto_tx_3_apto_${aptoNumber}.pdf` }
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

    })
    .catch(error => {
      console.error('Erro ao carregar nomes das taxas:', error);
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
  link.textContent = `Prestação de Contas - ${mesAbreviado}/${anoSelecionado}`;

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
      const link = document.createElement('a');
      link.href = "#";
      const mesAbreviado = obterAbreviacaoMes(parseInt(mesSelecionado));
      link.textContent = `Prestação de Contas - ${mesAbreviado}/${anoSelecionado}`;

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
    });
  }

  function obterAbreviacaoMes(numeroMes) {
  const meses = ["", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return meses[numeroMes] || "";
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

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailCadastro, senhaCadastro);
        const user = userCredential.user;
        console.log("Usuário cadastrado com sucesso:", user.uid);
        mensagemCadastro.textContent = 'Cadastro realizado com sucesso! Aguarde a aprovação do seu acesso.';

        const response = await fetch('https://brilliant-gumption-dac373.netlify.app/.netlify/functions/register-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            emailCadastro: emailCadastro,
            codigoAcesso: codigoAcesso
            // Você pode adicionar mais dados aqui se precisar
          }),
        });

        const data = await response.json();

        if (response.ok && data.message === 'Usuário registrado e dados salvos com sucesso!') {
          console.log('Resposta da função register-user:', data);
          mensagemCadastro.textContent = 'Cadastro realizado com sucesso! Aguarde a aprovação do seu acesso.';
          formularioCadastro.reset();
        } else {
          console.error('Erro ao registrar usuário via função:', data.error || 'Erro desconhecido');
          mensagemCadastro.textContent = 'Erro ao registrar: ' + (data.error || 'Erro desconhecido');
        }

      } catch (error) {
        console.error("Erro ao criar usuário:", error);
        mensagemCadastro.textContent = 'Erro ao cadastrar: ' + error.message;
      }
    });

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
  }});    

// Ajuste para horário de Brasília (UTC-3)
window.logAccess = function (userCode, downloadedFile, apartment) {
  const userName = localStorage.getItem('userName'); // Recupera o nome do usuário do localStorage
  fetch('https://brilliant-gumption-dac373.netlify.app/.netlify/functions/logger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apartment: apartment,
      downloadedFile: downloadedFile,
      userCode: userCode,
      userName: userName // Envia o nome do usuário no corpo da requisição
    }),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erro na requisição para função de log: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Resposta da função de log do Netlify:', data);
  })
  .catch(error => {
    console.error('Erro ao chamar a função de log do Netlify:', error);
  });
};
