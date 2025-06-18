const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      console.log("Função logger foi chamada com POST!");
      const logData = JSON.parse(event.body);
      console.log("Valor de logData.type:", logData.userCode ? logData.userCode.type : 'outro');
      const db = admin.database();
      const logsRef = db.ref('logs');

      const now = new Date();
      now.setHours(now.getHours() - 3);
      const formattedDateTime = now.toISOString().replace('T', '_').replace(/:/g, '-').split('.')[0];
      const aptoNumber = logData.apartment ? logData.apartment.replace('apto', '') : (logData.userCode && logData.userCode.apartmentId ? logData.userCode.apartmentId.replace('apto', '') : '');
      const userName = logData.userName ? logData.userName : 'SemNome';

      let logKey = '';
      let logEntryData = true; // Vamos apenas escrever 'true' dentro do nó

      const visualizado = 'Visualizado_';
      const arquivo = 'arquivo';
      let tipoDocumento = '';

      if (logData.userCode && logData.userCode.type === 'notificacao') {
        const notificationId = logData.userCode.notificationId ? logData.userCode.notificationId : 'SemId';
        logKey = `${aptoNumber}_${userName}_${formattedDateTime}_${visualizado}${arquivo}_notificacao_${notificationId}_apto_${aptoNumber}_pdf`;
      } else if (logData.downloadedFile) {
      let nomeArquivo = logData.downloadedFile.replace(/\.pdf$/i, '').replace(/Visualizada /i, '').replace(/ /g, '_');
      if (nomeArquivo.startsWith('boleto_')) {
        tipoDocumento = 'boleto';
      } else if (nomeArquivo === 'previsao_despesas' || nomeArquivo === 'Previsão_de_despesas' || nomeArquivo === 'seu_dinheiro_1' || nomeArquivo === 'Seu_Dinheiro_Nr_1' || nomeArquivo === 'seu_dinheiro_2' || nomeArquivo === 'Seu_Dinheiro_Nr_2' || nomeArquivo === 'politica_uso' || nomeArquivo.startsWith('Prestacao_de_Contas')) {
        logKey = `${aptoNumber}_${userName}_${formattedDateTime}_${visualizadoArquivo}${tipoDocumento || ''}_${nomeArquivo}_pdf`;
      } else {
        logKey = `${aptoNumber}_${userName}_${formattedDateTime}_${visualizadoArquivo}${tipoDocumento || ''}_${nomeArquivo}_apto_${aptoNumber}_pdf`;
      }
    }

      if (logKey) {
        await logsRef.child(logKey).set(logEntryData);
        console.log('Log registrado com sucesso no Realtime Database com chave:', logKey);

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: "Log registrado com sucesso no Realtime Database com chave e nome de usuário!" }),
        };
      } else {
        console.error("Não foi possível determinar o tipo de log ou construir a chave.");
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: "Erro ao registrar o log no Realtime Database: Não foi possível determinar o tipo de log." }),
        };
      }
    } catch (error) {
      console.error("Erro ao processar a função logger:", error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: `Erro ao registrar o log no Realtime Database: ${error}` }),
      };
    }
  } else {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: "Método não permitido" }),
    };
  }
};
