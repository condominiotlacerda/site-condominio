const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
    }),
    databaseURL: "https://logsite-d81dd-default-rtdb.firebaseio.com"
  });
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const logData = JSON.parse(event.body);

    const { userCode, downloadedFile, apartment, accessDateTime } = logData;

    const logRef = admin.database().ref('logs');

    const aptoNumber = apartment.replace('apto', '');
    const formattedDateTime = accessDateTime.replace('T', '_').replace(/:/g, '-').split('.')[0];
    const safeFileName = downloadedFile ? downloadedFile.replace(/[^a-zA-Z0-9_-]/g, '_') : 'undefined'; // Adicionado tratamento para downloadedFile ser null ou undefined
    const logKey = `${aptoNumber}_${formattedDateTime}_${safeFileName}`;

    await logRef.child(logKey).set({
      userCode: userCode,
      downloadedFile: downloadedFile,
      apartment: apartment,
      accessDateTime: accessDateTime
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Erro ao registrar log na função:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao registrar log' }),
    };
  }
};
