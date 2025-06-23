const { google } = require('googleapis');

exports.handler = async (event) => {
  const configDriveId = process.env.GOOGLE_DRIVE_CONFIGURACOES_ID;
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const apartmentId = event.queryStringParameters?.apartmentId;

  if (!apartmentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Apartment ID is required.' }),
    };
  }

  try {
    const drive = google.drive({ version: 'v3', auth: apiKey });

    // Fetch configuracoes.json
    const configResponse = await drive.files.get({
      fileId: configDriveId,
      alt: 'media',
    }, { responseType: 'stream' });

    if (configResponse.status !== 200) {
      console.error('Error fetching configuracoes.json:', configResponse);
      return {
        statusCode: configResponse.status,
        body: JSON.stringify({ error: 'Failed to fetch configuracoes.json from Google Drive.' }),
      };
    }

    let configString = '';
    configResponse.data.on('data', chunk => {
      configString += chunk;
    });

    await new Promise((resolve, reject) => {
      configResponse.data.on('end', resolve);
      configResponse.data.on('error', reject);
    });

    const configData = JSON.parse(configString);
    console.log("configData após parsing:", configData); // ADICIONE ESTA LINHA

    let fullApartmentId = apartmentId;
    if (!apartmentId.startsWith('apto_')) {
      fullApartmentId = apartmentId.replace('apto', 'apto_'); // Adiciona o underscore SE não começar com 'apto_'
    }

    console.log("fullApartmentId:", fullApartmentId); // ADICIONE ESTA LINHA
    const boletosData = configData.boletos && configData.boletos[fullApartmentId];
    console.log("boletosData:", boletosData); // ADICIONE ESTA LINHA

    const apartmentBoletos = [];

    if (boletosData) {
      console.log(`Boletos encontrados para o apartamento ${fullApartmentId}:`, Object.keys(boletosData)); // ADICIONE ESTA LINHA
      for (const boletoName in boletosData) {
        if (boletoName !== "") {
          const fileId = boletosData[boletoName];
          apartmentBoletos.push({
            name: boletoName.trim(),
            fileId: fileId,
          });
        }
      }
    } else {
      console.log(`Não foram encontrados boletos para o apartamento ${fullApartmentId}.`);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apartmentBoletos),
    };

  } catch (error) {
    console.error('Error in load-boletos function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load boletos.' }),
    };
  }
};
