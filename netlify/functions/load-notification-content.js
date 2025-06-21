const { google } = require('googleapis');

exports.handler = async (event) => {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const fileId = event.queryStringParameters?.fileId;

  if (!fileId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'File ID is required.' }),
    };
  }

  try {
    const drive = google.drive({ version: 'v3', auth: apiKey });

    const notificationResponse = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    if (notificationResponse.status === 200) {
      const buffer = Buffer.from(await notificationResponse.data.arrayBuffer());
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentBase64: buffer.toString('base64') }),
      };
    } else {
      console.error(`Error fetching notification (ID: ${fileId}):`, notificationResponse);
      return {
        statusCode: notificationResponse.status,
        body: JSON.stringify({ error: 'Failed to fetch notification content.' }),
      };
    }
  } catch (error) {
    console.error('Error in load-notification-content function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load notification content.' }),
    };
  }
};