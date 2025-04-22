const admin = require('firebase-admin');

// Inicialize o Firebase Admin SDK fora do handler para reutilização
let isFirebaseInitialized = false;
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://logsite-d81dd-default-rtdb.firebaseio.com' // Substitua pela sua URL do Realtime Database
  });
  isFirebaseInitialized = true;
  console.log('Firebase Admin SDK foi inicializado.');
} else {
  console.log('Firebase Admin SDK já estava inicializado.');
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
      console.log('Corpo da requisição:', event.body);
      const logData = JSON.parse(event.body);
      const db = admin.database();
      const logsRef = db.ref('logs');
      console.log('Referência ao nó de logs obtida:', logsRef.toString());

      // Adiciona um timestamp do servidor aos dados do log
      logData.serverTimestamp = admin.database.ServerValue.TIMESTAMP;
      console.log('Dados do log antes de gravar:', logData);

      const newLogRef = await logsRef.push(logData);
      console.log('Log registrado com sucesso no Realtime Database com ID:', newLogRef.key);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: "Log registrado com sucesso no Realtime Database!" }),
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
