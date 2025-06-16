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
      const aptoNumber = logData.apartment.replace('apto', '');
      const safeFileName = logData.downloadedFile.replace(/[^a-zA-Z0-9_-\p{L}]/gu, '_');
      const userName = logData.userName ? logData.userName.replace(/[^a-zA-Z0-9_-\p{L}]/gu, '_') : 'SemNome'; // Sanitize userName
      const logKey = `${aptoNumber}_${userName}_${formattedDateTime}_${safeFileName}`;

      logData.accessDateTime = now.toISOString();
      // Se você quiser o userName como um campo separado (além da chave), deixe a próxima linha descomentada
      logData.userName = userName;

      await logsRef.child(logKey).set(logData);
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
