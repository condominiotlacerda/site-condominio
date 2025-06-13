const { google } = require('googleapis');

exports.handler = async (event) => {
  const fileId = process.env.GOOGLE_DRIVE_POLITICA_USO_ID; // Usando variável de ambiente
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY; // Usando variável de ambiente

  try {
    const drive = google.drive({ version: 'v3', auth: apiKey });
    const response = await drive.files.get({
      fileId: fileId,
    });

    if (response.status === 200) {
      const publicUrl = `https://drive.google.com/viewer?url=https://drive.google.com/uc?id=${fileId}&export=download`;

      return {
        statusCode: 200,
        body: JSON.stringify({ publicUrl }),
      };
    } else {
      console.error('Erro ao obter o arquivo:', response);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Erro ao obter o arquivo do Google Drive' }),
      };
    }
  } catch (error) {
    console.error('Erro na função:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
