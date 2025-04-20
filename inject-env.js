const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'index.html');
let indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

console.log("process.env:", process.env);

indexHtmlContent = indexHtmlContent.replace(
  /"VITE_FIREBASE_API_KEY_PLACEHOLDER"/g,
  `"${process.env.FIREBASE_API_KEY}"`
);
indexHtmlContent = indexHtmlContent.replace(
  /"VITE_FIREBASE_AUTH_DOMAIN_PLACEHOLDER"/g,
  `"${process.env.FIREBASE_AUTH_DOMAIN}"`
);
indexHtmlContent = indexHtmlContent.replace(
  /"VITE_FIREBASE_DATABASE_URL_PLACEHOLDER"/g,
  `"${process.env.FIREBASE_DATABASE_URL}"`
);
indexHtmlContent = indexHtmlContent.replace(
  /"VITE_FIREBASE_PROJECT_ID_PLACEHOLDER"/g,
  `"${process.env.FIREBASE_PROJECT_ID}"`
);
indexHtmlContent = indexHtmlContent.replace(
  /"VITE_FIREBASE_STORAGE_BUCKET_PLACEHOLDER"/g,
  `"${process.env.FIREBASE_STORAGE_BUCKET}"`
);
indexHtmlContent = indexHtmlContent.replace(
  /"VITE_FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER"/g,
  `"${process.env.FIREBASE_MESSAGING_SENDER_ID}"`
);
indexHtmlContent = indexHtmlContent.replace(
  /"VITE_FIREBASE_APP_ID_PLACEHOLDER"/g,
  `"${process.env.FIREBASE_APP_ID}"`
);
indexHtmlContent = indexHtmlContent.replace(
  /"VITE_FIREBASE_MEASUREMENT_ID_PLACEHOLDER"/g,
  `"${process.env.FIREBASE_MEASUREMENT_ID}"`
);

fs.writeFileSync(indexHtmlPath, indexHtmlContent, 'utf8');

console.log('Variáveis de ambiente injetadas no index.html');
