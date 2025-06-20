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
      alt: 'media'
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
    const hasNotifications = configData.notificacoes[apartmentId] !== '';
    const notificationsId = configData.notificacoes_id;
    console.log('Objeto notificationsId completo:', notificationsId); // Adicione esta linha
    const apartmentNotifications = [];

    if (hasNotifications) {
      // Filter notifications for the specific apartment based on keys in notificacoes_id
      const relevantNotifications = Object.entries(notificationsId)
        .filter(([key, value]) => key.includes(`_apto_${apartmentId}`));
        console.log('Notificações relevantes encontradas:', relevantNotifications); // Adicione esta linha

      // Fetch each relevant notification file
      for (const [name, fileId] of relevantNotifications) {
        try {
          const notificationResponse = await drive.files.get({
            fileId: fileId,
            alt: 'media',
          });

          if (notificationResponse.status === 200) {
            const buffer = Buffer.from(await notificationResponse.data.arrayBuffer());
            apartmentNotifications.push({
              name: name,
              contentBase64: buffer.toString('base64'),
            });
          } else {
            console.error(`Error fetching notification ${name} (ID: ${fileId}):`, notificationResponse);
          }
        } catch (error) {
          console.error(`Error processing notification ${name} (ID: ${fileId}):`, error);
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apartmentNotifications),
    };

  } catch (error) {
    console.error('Error in load-notificacoes function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load notifications.' }),
    };
  }
};
