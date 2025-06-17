import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const data = JSON.parse(event.body);
  const { type, apartmentId, userName, texto, notificationId } = data; // Extrai os dados do corpo da requisição
  const timestamp = new Date();
  const formattedDateTime = timestamp.toISOString().replace(/[-:T.]/g, '_').slice(0, -5) + 'Z';
  const dateParts = formattedDateTime.split('_');
  const formattedDateForAviso = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}_${dateParts[3].slice(0, 2)}-${dateParts[3].slice(2, 4)}-${dateParts[3].slice(4, 6)}`;

  let logKey = '';
  let logData = {};

  if (type === 'aviso') {
    logKey = `${apartmentId}_${userName}_${formattedDateForAviso}_aviso_${data.avisoNr}`;
    logData = {
      Texto: texto,
      apartamentoId: apartmentId,
      avisoNr: data.avisoNr,
      entendidoEm: new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' }),
    };
  } else if (type === 'notificacao') {
    logKey = `${apartmentId}_${userName}_${formattedDateForAviso}_notificacao_${notificationId}`;
    logData = {
      Texto: texto,
      apartamentoId: apartmentId,
      notificacaoId: notificationId,
      accessDateTime: timestamp.toISOString()
    };
  } else { // Para outros tipos de log (como visualização de boletos)
    logKey = `${apartmentId}_${userName}_${formattedDateTime}_${data.documentName.replace(/ /g, '_').replace(/\./g, '_')}`;
    logData = {
      accessDateTime: timestamp.toISOString(),
      apartment: apartmentId,
      downloadedFile: data.documentName
    };
  }

  const logRef = ref(db, `logs/${logKey}`);

  try {
    await set(logRef, logData);
    console.log('Log registrado com sucesso no Realtime Database com chave:', logKey);
    return { statusCode: 200, body: 'Log registrado com sucesso' };
  } catch (error) {
    console.error('Erro ao registrar o log no Realtime Database:', error);
    return { statusCode: 500, body: 'Erro ao registrar o log' };
  }
};
