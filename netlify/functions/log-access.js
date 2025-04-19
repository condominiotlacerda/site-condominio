const admin = require('firebase-admin');

// Inicialize o Firebase Admin SDK fora do handler para reutilizar a conexão
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://logsite-d81dd-default-rtdb.firebaseio.com"
  });
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: {
        "Access-Control-Allow-Origin": "https://condominiotlacerda.github.io/site-condominio/",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }, body: 'Method Not Allowed' };
    }

    const logData = JSON.parse(event.body);
    const { userCode, downloadedFile, apartment, accessDateTime } = logData;
    const logRef = admin.database().ref('logs');
    const aptoNumber = apartment.replace('apto', '');
    const formattedDateTime = accessDateTime.replace('T', '_').replace(/:/g, '-').split('.')[0];
    const safeFileName = downloadedFile ? downloadedFile.replace(/[^a-zA-Z0-9_-]/g, '_') : 'undefined';
    const logKey = `${aptoNumber}_${formattedDateTime}_${safeFileName}`;

    await logRef.child(logKey).set({
      userCode: userCode,
      downloadedFile: downloadedFile,
      apartment: apartment,
      accessDateTime: accessDateTime
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://condominiotlacerda.github.io/site-condominio", // NÃO ESQUEÇA DE SUBSTITUIR PELO SEU DOMÍNIO!
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Erro ao registrar log na função:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://condominiotlacerda.github.io/site-condominio", // E AQUI TAMBÉM!
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: 'Erro ao registrar log' }),
    };
  }
};
