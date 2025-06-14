const { google } = require('googleapis');

exports.handler = async (event) => {
  const fileId = process.env.GOOGLE_DRIVE_POLITICA_USO_ID; // Usando variável de ambiente
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY; // Usando variável de ambiente

  try {
    const drive = google.drive({ version: 'v3', auth: apiKey });
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media', // Solicita o conteúdo real do arquivo
    });

    if (response.status === 200) {
      const buffer = Buffer.from(await response.data.arrayBuffer());

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/pdf', // Define o tipo de conteúdo como PDF
          'Content-Disposition': 'inline; filename="politica_de_uso.pdf"' // Sugere um nome de arquivo (opcional)
        },
        body: buffer.toString('base64'), // Retorna o conteúdo do PDF como uma string base64
        isBase64Encoded: true, // Indica que o corpo da resposta está codificado em base64
      };
    } else {
      console.error('Erro ao obter o arquivo do Google Drive:', response);
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
