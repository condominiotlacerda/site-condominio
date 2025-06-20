const { google } = require('googleapis');

exports.handler = async (event) => {
  const configDriveId = process.env.GOOGLE_DRIVE_CONFIGURACOES_ID; // ID do configuracoes.json no Drive
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY; // Sua API Key do Google Drive

  try {
    const drive = google.drive({ version: 'v3', auth: apiKey });

    // Primeiro, vamos buscar o arquivo configuracoes.json do Google Drive
    const configResponse = await drive.files.get({
      fileId: configDriveId,
      alt: 'media'
    });

    if (configResponse.status !== 200) {
      console.error('Erro ao obter o arquivo configuracoes.json do Google Drive:', configResponse);
      return {
        statusCode: configResponse.status,
        body: JSON.stringify({ error: 'Erro ao obter o arquivo configuracoes.json do Google Drive' }),
      };
    }

    const configData = await configResponse.data.json();
    const fileId = configData.politicas.politica_uso; // Obtém o ID da Política de Uso do configuracoes.json

    // Agora, vamos buscar o arquivo da Política de Uso usando o ID obtido
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
      console.error('Erro ao obter o arquivo da Política de Uso do Google Drive:', response);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Erro ao obter o arquivo da Política de Uso do Google Drive' }),
      };
    }
  } catch (error) {
    console.error('Erro na função ao acessar o Google Drive:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
