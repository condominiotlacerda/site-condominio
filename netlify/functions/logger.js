const admin = require('firebase-admin');

// Inicialize o Firebase Admin SDK fora do handler para reutilização
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://logsite-d81dd-default-rtdb.firebaseio.com' // Substitua pela sua URL do Realtime Database
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
      const formattedDateTime = now.toISOString().replace('T', '_').replace(/:/g, '-').split('.')[0];
      const aptoNumber = logData.apartment.replace('apto', '');
      const safeFileName = logData.downloadedFile.replace(/[^a-zA-Z0-9_-]/g, '_');
      const logKey = `${aptoNumber}_${formattedDateTime}_${safeFileName}`;

      // Adiciona um timestamp do servidor aos dados do log
      logData.serverTimestamp = admin.database.ServerValue.TIMESTAMP;

      await logsRef.child(logKey).set(logData);
      console.log('Log registrado com sucesso no Realtime Database com chave:', logKey);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: "Log registrado com sucesso no Realtime Database com chave personalizada!" }),
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
