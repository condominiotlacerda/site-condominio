const { google } = require('googleapis');

exports.handler = async (event) => {
  const fileId = event.queryStringParameters?.fileId;
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  if (!fileId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'File ID is required.' }),
    };
  }

  try {
    const drive = google.drive({ version: 'v3', auth: apiKey });

    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    }, { responseType: 'stream' });

    if (response.status !== 200) {
      console.error('Error fetching file from Google Drive:', response);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to fetch file from Google Drive.' }),
      };
    }

    const buffer = await new Promise((resolve, reject) => {
      const chunks = [];
      response.data.on('data', chunk => {
        chunks.push(chunk);
      });
      response.data.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      response.data.on('error', reject);
    });

    const base64Content = buffer.toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contentBase64: base64Content }),
    };

  } catch (error) {
    console.error('Error in load-boletos-content function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load boleto content.' }),
    };
  }
};