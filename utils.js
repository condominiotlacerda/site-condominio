// utils.js
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { app } from './firebase.js'; // Importa a instância do app Firebase

const db = getDatabase(app);

// Função para registrar acessos no Firebase Realtime Database
export function logAccess(userCode, userName, apartment, accessedDocument, details = {}) {
    const now = new Date();
    // Ajusta o horário para UTC-3 (Fortaleza/Ceará)
    // Atenção: Data.prototype.setHours() com ajuste de fuso horário pode ser complexo.
    // Uma abordagem mais robusta para fuso horário seria usar uma biblioteca como moment-timezone ou Luxon.
    // Por enquanto, mantemos sua lógica, mas esteja ciente das nuances de fuso horário.
    now.setHours(now.getHours() - 3); 
    
    const formattedDate = now.toISOString().replace('T', '_').split('.')[0];
    let fileName = `${userName}_Acesso_apartamento_${apartment}_${accessedDocument}_${userCode}_${formattedDate}`;
    fileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_'); // Limpa o nome do arquivo

    const accessLog = {
        userCode: userCode,
        userName: userName,
        apartment: `Acesso ao apartamento ${apartment}`,
        accessedDocument: accessedDocument,
        accessDate: now.toISOString(),
        ...details // Adiciona detalhes extras passados como argumento
    };

    const logRef = ref(db, `logs/${fileName}`);
    set(logRef, accessLog)
        .then(() => console.log("Log registrado com sucesso:", fileName))
        .catch(error => console.error("Erro ao registrar log:", error));
}
