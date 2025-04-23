// Importe a função initializeApp aqui
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzgHcrZNvCQEunq-d3LeDm0u4LDhwjDgM",
  authDomain: "logsite-d81dd.firebaseapp.com",
  databaseURL: "https://logsite-d81dd-default-rtdb.firebaseio.com",
  projectId: "logsite-d81dd",
  appId: "1:285508603780:web:dba70ace036ee8a37297d1"
};

// Inicialize o Firebase aqui
const app = initializeApp(firebaseConfig);

// Exporte a configuração e a instância do app (se precisar usar em outros arquivos)
export { firebaseConfig, app };
