let nomesTaxas = {};

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

import { app } from './firebase.js';

const firestore = getFirestore(app);
const auth = getAuth(app); // Garantir que auth seja uma instância
const db = getDatabase(app); // Garantir que db seja uma instância
  
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
export async function showFiles(apartment) { // EXPORTADO
  const fileContainer = document.getElementById('file-container');
  const fileList = document.getElementById('file-list');
  const tempListItem = document.createElement('li');
  tempListItem.textContent = 'Teste de lista';
  fileList.appendChild(tempListItem); // Isso é para teste, pode ser removido
  const viewerContainer = document.getElementById('viewer-container'); // Variável não usada, pode ser removida
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
  await loadBoletos(apartment); // Chamar e AGUARDAR loadBoletos
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
        // CORREÇÃO DO CAMINHO: Prefira o caminho absoluto da raiz para recursos fixos
        const responseConfigNotificacoes = await fetch('/dados/configuracoes.json');
        if (!responseConfigNotificacoes.ok) { // Verifica se a requisição foi bem-sucedida
            throw new Error(`HTTP error! status: ${responseConfigNotificacoes.status}`);
        }
        const configDataNotificacoes = await responseConfigNotificacoes.json();
        // O apartmentIdStorage já deve vir no formato 'apto101', então o `replace('apto', '')` já é feito.
        // O formato esperado em configuracoes.json é `apto_101`.
        const aptoIdWithUnderScore = `apto_${apartamentoIdStorage.replace('apto', '')}`;
        const notificacoesApartamento = configDataNotificacoes.notificacoes_id[aptoIdWithUnderScore];

        if (notificacoesApartamento) {
          const apartmentNumber = apartamentoIdStorage.replace('apto', '');
          let index = 0;
          for (const notificacaoName in notificacoesApartamento) {
            if (notificacoesApartamento.hasOwnProperty(notificacaoName)) {
              const fileName = `notificacao_${index + 1}_apto_${apartmentNumber}.pdf`;
              const fileURL = `notificacoes/${fileName}`;

              const listItem = document.createElement('li');
              const link = document.createElement('a');
              link.href = '#';
              link.textContent = notificacaoName.trim();
              link.addEventListener('click', function(event) { // USAR ADD EVENT LISTENER
                event.preventDefault();
                openFileViewer(fileURL);
                // Melhorar o texto do log para ficar mais claro nos logs
                logAccess({ apartment: apartamentoIdStorage, downloadedFile: `Visualizada Notificação: ${notificacaoName.trim()}` });
              });
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
    documentosList.innerHTML = ''; // Limpar para evitar duplicação

  if (documentosList && apartment) {
    // Helper function to create document links
    const createDocumentLink = (text, filePath, logText) => {
        const link = document.createElement('a');
        link.textContent = text;
        link.style.color = 'blue';
        link.href = '#';
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const apartmentId = localStorage.getItem('apartmentId');
            logAccess({ apartment: apartmentId, downloadedFile: logText });
            openFileViewer(filePath);
        });
        const listItem = document.createElement('li');
        listItem.appendChild(link);
        return listItem;
    };

    documentosList.appendChild(createDocumentLink('Previsão de despesas', 'previsao_despesas/previsao_despesas.pdf', 'Visualizada Previsão de despesas'));
    documentosList.appendChild(document.createElement('br')); // Para dar um espaço entre os links

    documentosList.appendChild(createDocumentLink('Seu Dinheiro Nr 1', 'https://brilliant-gumption-dac373.netlify.app/seu_dinheiro/seu_dinheiro_1.pdf', 'Visualizada Seu Dinheiro Nr 1'));
    documentosList.appendChild(document.createElement('br'));

    documentosList.appendChild(createDocumentLink('Seu Dinheiro Nr 2', 'https://brilliant-gumption-dac373.netlify.app/seu_dinheiro/seu_dinheiro_2.pdf', 'Visualizada Seu Dinheiro Nr 2'));
    documentosList.appendChild(document.createElement('br'));
  }
}
// fim da função showfiles ===============================================================================================================================================================

// Início da função loadBoletos para carregar os boletos do G Drive ========================================================================================================================
export async function loadBoletos(apartmentId) { // EXPORTADO
  console.log("loadBoletos foi chamada com o ID:", apartmentId);
  const boletosList = document.getElementById('file-list');
  boletosList.innerHTML = '';

  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-inicial-boletos';
  loadingDiv.style.textAlign = 'center';
  loadingDiv.style.padding = '20px'; // Corrigido .padding para .style.padding
  loadingDiv.innerHTML = '<img src="images/aguarde.gif" alt="Aguarde..." style="width: 102px; height: 68px;"><p>Carregando boletos...</p>';
  boletosList.appendChild(loadingDiv);

  try {
    // CORREÇÃO DO CAMINHO: Prefira o caminho absoluto da raiz para recursos fixos
    const responseConfig = await fetch('/dados/configuracoes.json');
    if (!responseConfig.ok) { // Verifica se a requisição foi bem-sucedida
        throw new Error(`HTTP error! status: ${responseConfig.status}`);
    }
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
          link.addEventListener('click', function(event) { // USAR ADD EVENT LISTENER
            event.preventDefault();
            openFileViewer(fileURL);
                // Melhorar o texto do log para ficar mais claro nos logs
            logAccess({ apartment: apartmentId, downloadedFile: `Visualizada Boleto: ${boletoName.trim()}` });
          });
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
export async function exibirAvisoSeNecessario() { // EXPORTADO
  try {
    // Passo 1: Buscar o número do aviso atual do configuracoes.json
    // CORREÇÃO DO CAMINHO: Prefira o caminho absoluto da raiz para recursos fixos
    const responseConfig = await fetch('/dados/configuracoes.json');
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
    // `db` já é importado e configurado no início do script
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
        // Remova listeners anteriores para evitar múltiplos disparos
        if (botaoEntendi) {
            const newBotaoEntendi = botaoEntendi.cloneNode(true);
            botaoEntendi.parentNode.replaceChild(newBotaoEntendi, botaoEntendi);
            newBotaoEntendi.addEventListener('click', async function() { // Marque como async
                await marcarAvisoComoEntendido(apartamentoId, avisoAtualNr, textoAviso); // Espera a marcação
                painelAviso.style.display = 'none';
            });
        }
    } else {
      console.log(`Aviso ${avisoAtualNr} não encontrado no configuracoes.json.`);
    }

  } catch (error) {
    console.error('Erro ao processar aviso:', error);
  }
}
// Final da Função que contém a lógica do painel de avisos =================================================================================================================================

// Início da Função que Marca se o aviso já foi lido =======================================================================================================================================
async function marcarAvisoComoEntendido(apartamentoId, avisoNr, texto) {
  // `db` já é importado e configurado no início do script
  const now = new Date();
  const dataLocal = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
  const horaLocal = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '-');
  const formattedDateTime = `${dataLocal}_${horaLocal}`;
  const userName = localStorage.getItem('userName') || 'N_A'; // Adicionado fallback

  const logNome = `${apartamentoId}_${userName}_${formattedDateTime}_aviso_${avisoNr}`;

    try {
        // Logar o acesso via a função logAccess (melhor para consistência)
        await logAccess({ 
            apartment: apartamentoId, 
            avisoNr: avisoNr, 
            downloadedFile: `Visualizado Aviso: ${avisoNr}`, 
            Texto: texto 
        });

        // Escreve um sinalizador no nó avisos/seen para a verificação de leitura
        await set(ref(db, `avisos/seen/${apartamentoId}/${avisoNr}`), true);
        console.log(`Sinalizador de aviso ${avisoNr} visualizado gravado para o apartamento ${apartamentoId}.`);
        localStorage.setItem(`avisoVisto_${apartamentoId}_${avisoNr}`, 'true'); // Marca no localStorage também
    } catch (error) {
        console.error("Erro ao registrar log do aviso ou sinalizador:", error);
    }
}
// Final da Função que Marca se o aviso já foi lido ========================================================================================================================================

export function openFileViewer(filePath) { // EXPORTADO
  const viewerContainer = document.getElementById('viewer-container');
  const fileViewer = document.getElementById('file-viewer');
  const downloadButton = document.getElementById('download-button');

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    // Para mobile, tente abrir em nova aba/janela para melhor compatibilidade.
    // Isso permite que o navegador móvel lide com o PDF nativamente.
    window.open(filePath, '_blank'); 
  } else {
    fileViewer.src = filePath;
    downloadButton.href = filePath;
    viewerContainer.style.display = 'flex'; // Usar 'flex' ou 'block' conforme seu CSS
  }

  viewerContainer.classList.add('active');
}

// REMOVIDO: `window.openFileViewer = openFileViewer;`

document.addEventListener("DOMContentLoaded", function () {
    // A chamada para exibirAvisoSeNecessario() e a lógica de autenticação
    // foram movidas para o script principal em area_condominio.html para melhor fluxo.
    // Manter apenas listeners específicos de elementos aqui.

  const anoConta = document.getElementById('ano-conta');
  const mesConta = document.getElementById('mes-conta');

  if (anoConta) {
    anoConta.addEventListener('change', function() {
        
      const listaContas = document.getElementById('contas-list');
    
      const anoSelecionado = this.value;
      const mesSelecionado = mesConta.value;

      // Construindo o caminho do arquivo
      const caminhoPrestacaoContas = `pdfs/contas/${anoSelecionado}/${mesSelecionado}.${obterAbreviacaoMes(parseInt(mesSelecionado))}/prestacao_contas.pdf`;

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
      const caminhoPrestacaoContas = `pdfs/contas/${anoSelecionado}/${mesSelecionado}.${obterAbreviacaoMes(parseInt(mesSelecionado))}/prestacao_contas.pdf`;

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

      // `auth` já é importado e configurado no início do script
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

      // `auth` e `db` já são importados e configurados no início do script
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
        } else if (errorCode === 'auth/invalid-credential') { // alterado de 'auth/wrong-password' para 'auth/invalid-credential'
          mensagemLogin.innerHTML = 'E-mail e/ou senha incorretos.<br>Verifique se você digitou corretamente suas credenciais.<br>Se você esqueceu sua senha, use o link "Esqueci minha senha".';
        } else {
          mensagemLogin.textContent = 'Erro ao fazer login: ' + errorMessage;
        }
        console.error("Erro ao fazer login:", errorCode, errorMessage);
      }
    });
}
});    

// Início da Função logAccess que envia dados para função Netlify logger.js ===================================================================================================================
export function logAccess(logData) { // EXPORTADO
  const userName = localStorage.getItem('userName') || 'N_A'; // Pega userName ou um valor padrão
  logData.userName = userName; // Adiciona o userName ao objeto logData

    // Adiciona o timestamp antes de enviar para garantir consistência no log da Netlify Function
    logData.timestamp = new Date().toISOString(); 

  return fetch('https://brilliant-gumption-dac373.netlify.app/.netlify/functions/logger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(logData), // Envia o objeto logData completo
  })
  .then(response => {
    if (!response.ok) {
      // Tenta ler a mensagem de erro do corpo da resposta para erros 5xx
      return response.json().then(errorBody => {
        throw new Error(`Erro na requisição para função de log (${response.status}): ${errorBody.error || response.statusText}`);
      }).catch(() => {
        // Se não conseguir ler o JSON do erro, use a mensagem padrão
        throw new Error(`Erro na requisição para função de log: ${response.status} - ${response.statusText}`);
      });
    }
    return response.json();
  })
  .catch(error => {
    console.error("Erro ao enviar log para Netlify Function:", error);
    throw error; // Re-lança o erro para que o chamador possa tratá-lo se necessário
  });
}
// Final da Função logAccess que envia dados para função Netlify logger.js ===================================================================================================================
// REMOVIDO: `window.openFileViewer = openFileViewer;`
