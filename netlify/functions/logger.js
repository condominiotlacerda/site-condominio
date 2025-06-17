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
      const db = admin.database();
      const logsRef = db.ref('logs');

      const now = new Date();
      now.setHours(now.getHours() - 3);
      const formattedDateTime = now.toISOString().replace('T', '_').replace(/:/g, '-').split('.')[0];
      const dateParts = formattedDateTime.split('_')[0].split('-'); // Dividindo a parte da data por '-'
      const formattedDateForAviso = `${dateParts[2]}-${dateParts[1]}-${dateParts[0].slice(-2)}`; // Formato DD-MM-YY (Aviso)
      const formattedTimeForAviso = `${formattedDateTime.split('_')[1]}`; // Formato HH-MM-SS (Aviso)
      const aptoNumber = logData.apartment.replace('apto', '');
      const userName = logData.userName ? logData.userName : 'SemNome';
      const downloadedFile = logData.downloadedFile ? logData.downloadedFile : 'ArquivoSemNome';

      let logKey = '';
      let logEntryData = {};

      if (logData.type === 'notificacao') {
        const notificationId = logData.notificationId ? logData.notificationId : 'SemId';
        const formattedDateNotificacao = `${dateParts[2]}-${dateParts[1]}-${dateParts[0].slice(-2)}`; // Acessando corretamente as partes da data
        const formattedTimeNotificacao = `${formattedDateTime.split('_')[1]}`;
        logKey = `${aptoNumber}_${userName}_${formattedDateNotificacao}_${formattedTimeNotificacao}_notificacao_${notificationId}`;
        logEntryData = {
          Texto: logData.downloadedFile, // Usamos downloadedFile para o conteúdo da notificação
          apartamentoId: logData.apartment,
          notificacaoId: notificationId,
          accessDateTime: now.toISOString()
        };
      } else {
        logKey = `${aptoNumber}_${userName}_${formattedDateTime}_${downloadedFile.replace(/\.pdf$/i, '')}`;
        logEntryData = {
          accessDateTime: now.toISOString(),
          apartment: logData.apartment,
          downloadedFile: downloadedFile,
          userName: userName
        };
      }

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
