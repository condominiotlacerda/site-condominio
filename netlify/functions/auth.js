require('dotenv').config();
const admin = require('firebase-admin');

let firebaseApp;

// Inicialize o Firebase Admin SDK
function initializeFirebaseApp() {
  if (!firebaseApp) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          projectId: process.env.FIREBASE_PROJECT_ID,
          // Adicione outros campos conforme necessário
        }),
        databaseURL: "https://logsite-d81dd-default-rtdb.firebaseio.com" // Substitua pela sua URL do Realtime Database se usar
      });
      console.log('Firebase Admin SDK inicializado!');
    } catch (error) {
      console.error('Erro ao inicializar o Firebase Admin SDK:', error);
    }
  }
  return firebaseApp;
}

exports.handler = async (event, context) => {
  initializeFirebaseApp();

  try {
    // Sua lógica para verificar o token de autenticação virá aqui
    const token = event.headers.authorization;

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Não autorizado' }),
      };
    }

    // Exemplo: Verificar o token JWT do Firebase
    const decodedToken = await admin.auth().verifyIdToken(token.replace('Bearer ', '')); // Remove o "Bearer " se estiver presente
    const uid = decodedToken.uid;

    return {
      statusCode: 200,
      body: JSON.stringify({ uid: uid, message: 'Token é válido' }),
    };
  } catch (error) {
    console.error('Erro ao verificar o token:', error);
    return {
      statusCode: 401, // Ou 500 dependendo do erro
      body: JSON.stringify({ error: 'Token inválido ou expirado' }),
    };
  }
};