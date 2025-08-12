// firebase.js
// Importe as funções de inicialização para cada serviço Firebase que você usa
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js"; // Se você usa Analytics

// Suas credenciais Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBzgHcrZNvCQEunq-d3LeDm0u4LDhwjDgM",
  authDomain: "logsite-d81dd.firebaseapp.com",
  databaseURL: "https://logsite-d81dd-default-rtdb.firebaseio.com",
  projectId: "logsite-d81dd",
  appId: "1:285508603780:web:dba70ace036ee8a37297d1"
  // measurementId: "G-XXXXXXXXXX" // Adicione se você usa Analytics e tem um Measurement ID
};

// Inicialize o app Firebase uma única vez
export const app = initializeApp(firebaseConfig);

// Inicialize e exporte as instâncias de cada serviço Firebase
// Isso garante que eles sejam configurados com 'app' no momento certo e estejam disponíveis
export const auth = getAuth(app);
export const db = getDatabase(app);
export const analytics = getAnalytics(app); // Se você usa Analytics

// Você não precisa mais exportar firebaseConfig se não a usa diretamente em outras páginas
// E 'app' já está sendo exportado diretamente acima.
// export { firebaseConfig, app };
