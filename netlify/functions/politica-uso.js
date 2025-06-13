const { google } = require('googleapis');

exports.handler = async (event) => {
  const fileId = process.env.GOOGLE_DRIVE_POLITICA_USO_ID; // Usando variável de ambiente
  const apiKey = 'AIzaSyCk4u_vtgsXFvw1BHjeeLQrNDXwHce77Kg'; // Substitua pela chave de API que você criou

  try {
    const drive = google.drive({ version: 'v3', auth: apiKey });
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media', // Para obter o conteúdo do arquivo
    });

    if (response.status === 200) {
      // Como é um PDF, podemos tentar retornar um link direto de visualização.
      // Uma maneira mais simples para este primeiro passo é usar um link público de visualização do Drive.
      const publicUrl = `https://drive.google.com/viewerng/viewer?url=https://drive.google.com/uc?id=${fileId}&export=download`;

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