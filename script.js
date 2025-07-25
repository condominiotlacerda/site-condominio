let nomesTaxas = {};

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

import { app } from './firebase.js';

const firestore = getFirestore(app);
  
// Obtém referências aos elementos do painel de aviso
const painelAviso = document.getElementById('painel-aviso');
const avisoTexto = document.getElementById('aviso-texto');
const botaoEntendi = document.getElementById('entendi-aviso');
// final de obtém referências aos elementos do painel de avisos

let activeApartmentButtonId = null;

function enableApartment() {
  const code = document.getElementById('accessCode').value.trim();
  alert('Esta funcionalidade foi substituída pelo cadastro.');
}

// início de showFiles ======================================================================================================================================================================
export async function showFiles(apartment) {
  const fileContainer = document.getElementById('file-container');
  const fileList = document.getElementById('file-list');
  const tempListItem = document.createElement('li');
  tempListItem.textContent = 'Teste de lista';
  fileList.appendChild(tempListItem);
  const viewerContainer = document.getElementById('viewer-container');
  const contasContainer = document.getElementById('contas-container');
  const notificationsContainer = document.getElementById('notifications-container'); // Pega a referência para a caixa de notificações
  const documentosContainer = document.getElementById('documentos-container');

  const apartamentoIdStorage = localStorage.getItem('apartmentId'); // Mova a declaração para aqui

  fileContainer.style.display = 'none';
  contasContainer.style.display = 'none';
  notificationsContainer.style.display = 'block'; // Garante que a caixa de notificações também esteja inicialmente visível
  documentosContainer.style.display = 'none';
  fileList.innerHTML = '';

  document.getElementById('apartment-number').textContent = apartment.replace('apto', 'Apto ').replace(/(\D+)(\d)/, '$1 $2');
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

  // *** INSERÇÃO DA CHAMADA PARA loadBoletos ***
  console.log("showFiles foi chamada com o apartamento:", apartment);
  loadBoletos(apartment);
  // *** FIM DA INSERÇÃO ***

  // Início da parte que carrega as notificações na area_condominio.html =============================================================================================================================
  const notificationsList = document.getElementById('notifications-list');
    notificationsList.innerHTML = '';

    const loadingNotificacoesDiv = document.createElement('div');
    loadingNotificacoesDiv.id = 'loading-inicial-notificacoes';
    loadingNotificacoesDiv.style.textAlign = 'center';
    loadingNotificacoesDiv.style.padding = '20px';
    loadingNotificacoesDiv.innerHTML = '<img src="images/aguarde.gif" alt="Aguarde..." style="width: 102px; height: 68px;"><p>Carregando notificações...</p>';
    notificationsList.appendChild(loadingNotificacoesDiv);

    if (apartamentoIdStorage) {
      try {
        const responseConfigNotificacoes = await fetch('dados/configuracoes.json');
        const configDataNotificacoes = await responseConfigNotificacoes.json();
        const aptoIdWithUnderScore = `apto_${apartamentoIdStorage}`;
        const notificacoesApartamento = configDataNotificacoes.notificacoes_id[aptoIdWithUnderScore];

        if (notificacoesApartamento) {
          const apartmentNumber = apartamentoIdStorage.replace('apto_', '');
          let index = 0;
          for (const notificacaoName in notificacoesApartamento) {
            if (notificacoesApartamento.hasOwnProperty(notificacaoName)) {
              const fileName = `notificacao_${index + 1}_apto_${apartmentNumber}.pdf`;
              const fileURL = `notificacoes/${fileName}`;

              const listItem = document.createElement('li');
              const link = document.createElement('a');
              link.href = '#';
              link.textContent = notificacaoName.trim();
              link.onclick = function(event) {
                event.preventDefault();
                openFileViewer(fileURL);
                logAccess({ apartment: apartamentoIdStorage, downloadedFile: `Visualizada ${notificacaoName.trim().replace(/\./g, '_').replace(/\//g, '-')}` });
              };
              listItem.appendChild(link);
              notificationsList.appendChild(listItem);
              index++;
            }
          }
        } else {
          const listItem = document.createElement('li');
          listItem.textContent = 'Nenhuma notificação encontrada para este apartamento.';
          notificationsList.appendChild(listItem);
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        const listItem = document.createElement('li');
        listItem.textContent = 'Erro ao carregar notificações.';
        notificationsList.appendChild(listItem);
      } finally {
        const loadingIndicator = document.getElementById('loading-inicial-notificacoes');
        if (loadingIndicator) {
          loadingIndicator.remove();
        }
      }
    } else {
      const listItem = document.createElement('li');
      listItem.textContent = 'ID do apartamento não encontrado.';
      notificationsList.appendChild(listItem);
    }
  // Final da parte que carrega as notificações na area_condominio.html =============================================================================================================================

  // O código para carregar documentos aqui (mantido como estava)
  const documentosList = document.getElementById('documentos-list');
  if (documentosList && apartment) {
    const previsaoLink = document.createElement('a');
    previsaoLink.textContent = 'Previsão de despesas';
    previsaoLink.style.color = 'blue';
    previsaoLink.href = '#';
    previsaoLink.addEventListener('click', function (event) {
      event.preventDefault();
      const filePath = 'previsao_despesas/previsao_despesas.pdf';
      const apartmentId = localStorage.getItem('apartmentId');

      logAccess({ apartment: apartmentId, downloadedFile: 'Visualizada Previsão de despesas' });

      openFileViewer(filePath);
    });

    const listItem = document.createElement('li');
    listItem.appendChild(previsaoLink);
    listItem.appendChild(document.createElement('br'));

    documentosList.appendChild(listItem);
  }

  documentosList.appendChild(document.createElement('br')); // Para dar um espaço entre os links

  const seuDinheiroLink = document.createElement('a');
  seuDinheiroLink.textContent = 'Seu Dinheiro Nr 1';
  seuDinheiroLink.style.color = 'blue';
  seuDinheiroLink.href = '#';
  seuDinheiroLink.addEventListener('click', function (event) {
    event.preventDefault();
    const filePath = 'https://brilliant-gumption-dac373.netlify.app/seu_dinheiro/seu_dinheiro_1.pdf';
    const apartmentId = localStorage.getItem('apartmentId');
    logAccess({ apartment: apartmentId, downloadedFile: 'Visualizada Seu Dinheiro Nr 1' });
    openFileViewer(filePath);
  }); // <--- Aqui fecha a função do evento de clique

  const listItem2 = document.createElement('li');
  listItem2.appendChild(seuDinheiroLink);
  listItem2.appendChild(document.createElement('br'));

  documentosList.appendChild(listItem2);


  documentosList.appendChild(document.createElement('br')); // Para dar um espaço entre os links

  const seuDinheiroLink2 = document.createElement('a'); // Use um nome de variável diferente ou let
  seuDinheiroLink2.textContent = 'Seu Dinheiro Nr 2';
  seuDinheiroLink2.style.color = 'blue';
  seuDinheiroLink2.href = '#';
  seuDinheiroLink2.addEventListener('click', function (event) {
    event.preventDefault();
    const filePath = 'https://brilliant-gumption-dac373.netlify.app/seu_dinheiro/seu_dinheiro_2.pdf';
    const apartmentId = localStorage.getItem('apartmentId');
    logAccess({ apartment: apartmentId, downloadedFile: 'Visualizada Seu Dinheiro Nr 2' });
    openFileViewer(filePath);
  }); // <--- Aqui fecha a função do evento de clique

  const listItem3 = document.createElement('li'); // Use um nome de variável diferente
  listItem3.appendChild(seuDinheiroLink2);
  listItem3.appendChild(document.createElement('br'));

  documentosList.appendChild(listItem3);
}
// fim da função showfiles ===============================================================================================================================================================

// Início da função loadBoletos para carregar os boletos do G Drive ========================================================================================================================
async function loadBoletos(apartmentId) {
  console.log("loadBoletos foi chamada com o ID:", apartmentId);
  const boletosList = document.getElementById('file-list');
  boletosList.innerHTML = '';

  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-inicial-boletos';
  loadingDiv.style.textAlign = 'center';
  loadingDiv.padding = '20px';
  loadingDiv.innerHTML = '<img src="images/aguarde.gif" alt="Aguarde..." style="width: 102px; height: 68px;"><p>Carregando boletos...</p>';
  boletosList.appendChild(loadingDiv);

  try {
    const responseConfig = await fetch('dados/configuracoes.json');
    const configData = await responseConfig.json();
    const aptoIdWithUnderScore = `apto_${apartmentId.replace('apto', '')}`;
    const boletosApartamento = configData.boletos[aptoIdWithUnderScore];

    if (boletosApartamento) {
      const apartmentNumber = apartmentId.replace('apto', '');
      let index = 0;
      for (const boletoName in boletosApartamento) {
        if (boletosApartamento.hasOwnProperty(boletoName)) {
          let identifier = '';
          if (boletoName.toLowerCase().includes('condominial')) {
            identifier = 'condominio';
          } else if (index === 1) {
            identifier = '1';
          } else if (index === 2) {
            identifier = '2';
          } else if (index === 3) {
            identifier = '3';
          }
          const fileName = `boleto_tx_${identifier}_apto_${apartmentNumber}.pdf`;
          const fileURL = `pdfs/boletos/${fileName}`;

          const listItem = document.createElement('li');
          const link = document.createElement('a');
          link.href = '#';
          link.textContent = boletoName.trim();
          link.onclick = function(event) {
            event.preventDefault();
            openFileViewer(fileURL);
            logAccess({ apartment: apartmentId, downloadedFile: `Visualizada ${boletoName.trim().replace(/\./g, '_').replace(/\//g, '-')}` });
          };
          listItem.appendChild(link);
          boletosList.appendChild(listItem);
          index++;
        }
      }
    } else {
      const listItem = document.createElement('li');
      listItem.textContent = 'Nenhum boleto encontrado para este apartamento.';
      boletosList.appendChild(listItem);
    }

  } catch (error) {
    console.error('Erro ao carregar boletos:', error);
    boletosList.innerHTML = '<li style="color: red;">Erro ao carregar boletos.</li>';
  } finally {
    const loadingIndicator = document.getElementById('loading-inicial-boletos');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }
}
// Final da função loadBoletos para carregar os boletos do G Drive =========================================================================================================================

// Início da Função que contém a lógica do painel de avisos ================================================================================================================================
async function exibirAvisoSeNecessario() {
  try {
    // Passo 1: Buscar o número do aviso atual do configuracoes.json
    const responseConfig = await fetch('dados/configuracoes.json');
    if (!responseConfig.ok) {
      console.error('Erro ao carregar configuracoes.json:', responseConfig.status);
      return;
    }
    const configData = await responseConfig.json();
    const avisoAtualNr = configData.avisosNr;

    const apartamentoId = localStorage.getItem('apartmentId');
    if (!apartamentoId) {
      console.error('apartmentId não encontrado no localStorage.');
      return;
    }

    // Passo 3: Verificar o Realtime Database
    const db = getDatabase();
    const avisoRef = ref(db, `avisos/seen/${apartamentoId}/${avisoAtualNr}`);
    const snapshot = await get(avisoRef);

    if (snapshot.exists()) {
      localStorage.setItem(`avisoVisto_${apartamentoId}_${avisoAtualNr}`, 'true'); // Atualiza o localStorage
      return; // Se já registrado no banco, não precisa exibir
    }

    // Passo 4: Buscar o conteúdo do aviso do configuracoes.json
    const avisosData = configData.avisos;
    const textoAviso = avisosData[avisoAtualNr];

    if (textoAviso) {
      // Passo 5: Exibir o painel de aviso
      avisoTexto.textContent = textoAviso;
      painelAviso.style.display = 'flex'; // Usamos 'flex' pois definimos assim no estilo inline

      // Passo 6: Adicionar um event listener para o botão "Entendi"
      botaoEntendi.addEventListener('click', function() {
        // Passo 6a: Registrar a ação no Realtime Database (vamos implementar isso depois)
        const apartamentoId = localStorage.getItem('apartmentId');
        
        logAccess({ apartment: apartamentoId, avisoNr: avisoAtualNr, Texto: textoAviso });
        
        marcarAvisoComoEntendido(apartamentoId, avisoAtualNr, textoAviso); // Função para escrever no Realtime Database
        // Passo 6b: Marcar no localStorage que o aviso foi visto
        //localStorage.setItem(`avisoVisto_${apartamentoId}_${avisoAtualNr}`, 'true');

        // Passo 6c: Esconder o painel
        painelAviso.style.display = 'none';
      });
    } else {
      console.log(`Aviso ${avisoAtualNr} não encontrado no configuracoes.json.`);
    }

  } catch (error) {
    console.error('Erro ao processar aviso:', error);
  }
}
// Final da Função que contém a lógica do painel de avisos =================================================================================================================================

// Início da Função que Marca se o aviso já foi lido =======================================================================================================================================
function marcarAvisoComoEntendido(apartamentoId, avisoNr, texto) {
  const db = getDatabase();
  const now = new Date();
  const dataLocal = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
  const horaLocal = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '-');
  const formattedDate = `${dataLocal}_${horaLocal}`;
  const logNome = `${apartamentoId}_${localStorage.getItem('userName')}_${formattedDate}_aviso_${avisoNr}`;

  // Escreve o log completo no nó avisos
  set(ref(db, `avisos/${logNome}`), {
    apartamentoId: apartamentoId,
    avisoNr: avisoNr,
    Texto: texto,
    entendidoEm: now.toLocaleString()
  })
  .then(() => console.log(`Log do aviso ${avisoNr} registrado como entendido para o apartamento ${apartamentoId} no banco de dados.`))
  .catch((error) => console.error("Erro ao registrar log do aviso como entendido:", error));

  // Escreve um sinalizador no nó avisos/seen para a verificação de leitura
  set(ref(db, `avisos/seen/${apartamentoId}/${avisoNr}`), true)
  .then(() => console.log(`Sinalizador de aviso ${avisoNr} visualizado gravado para o apartamento ${apartamentoId}.`))
  .catch((error) => console.error("Erro ao gravar sinalizador de aviso visualizado:", error));
}
// Final da Função que Marca se o aviso já foi lido ========================================================================================================================================

function openFileViewer(filePath) {
  const viewerContainer = document.getElementById('viewer-container');
  const fileViewer = document.getElementById('file-viewer');
  const downloadButton = document.getElementById('download-button');

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = filePath; // Abre o PDF na mesma janela no mobile
  } else {
    fileViewer.src = filePath;
    downloadButton.href = filePath;
    viewerContainer.style.display = ''; // Exibe o painel no desktop
  }

  viewerContainer.classList.add('active');
}

document.addEventListener("DOMContentLoaded", function () {
  exibirAvisoSeNecessario(); // Chama a função exibirAvisoSeNecessario assim que a página carrega
  
  const anoConta = document.getElementById('ano-conta');
  const mesConta = document.getElementById('mes-conta');

  if (anoConta) {
    anoConta.addEventListener('change', function() {
        
      const listaContas = document.getElementById('contas-list');
    
      const anoSelecionado = this.value;
      const mesSelecionado = mesConta.value;

      // Construindo o caminho do arquivo
      const caminhoPrestacaoContas = `pdfs/contas/${anoSelecionado}/${mesSelecionado}.` + obterAbreviacaoMes(parseInt(mesSelecionado)) + `/prestacao_contas.pdf`;

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
    const anoSelecionado = anoConta.value;
    const mesSelecionado = mesConta.value;
    const mesAbreviado = obterAbreviacaoMes(parseInt(mesSelecionado));
    const documento = `Prestacao_de_Contas_${mesAbreviado}_${anoSelecionado}.pdf`;
    try {
      logAccess({ apartment: localStorage.getItem('apartmentId'), downloadedFile: documento });
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

      // Construindo o caminho do arquivo
      const caminhoPrestacaoContas = `pdfs/contas/${anoSelecionado}/${mesSelecionado}.` + obterAbreviacaoMes(parseInt(mesSelecionado)) + `/prestacao_contas.pdf`;

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
        const anoSelecionado = anoConta.value;
        const mesSelecionado = mesConta.value;
        const mesAbreviado = obterAbreviacaoMes(parseInt(mesSelecionado));
        const documento = `Prestacao_de_Contas_${mesAbreviado}_${anoSelecionado}.pdf`;
        try {
          logAccess({ apartment: localStorage.getItem('apartmentId'), downloadedFile: documento });
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

// Início da Função logAccess que envia dados para função Netlify logger.js ===================================================================================================================
window.logAccess = function (logData) {
  const userName = localStorage.getItem('userName');
  logData.userName = userName; // Adiciona o userName ao objeto logData
  fetch('https://brilliant-gumption-dac373.netlify.app/.netlify/functions/logger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(logData), // Envia o objeto logData completo
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erro na requisição para função de log: ${response.status}`);
    }
    return response.json();
  })
};
// Final da Função logAccess que envia dados para função Netlify logger.js ===================================================================================================================
window.openFileViewer = openFileViewer;
