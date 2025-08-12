// utils.js
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { app } from './firebase.js'; // Importa a instância do app Firebase

const db = getDatabase(app);

// Função para registrar acessos no Firebase Realtime Database
// Aceita um único objeto 'logData'
export function logAccess(logData) {
    // Extrai os campos do objeto 'logData', fornecendo fallbacks do localStorage
    const userCode = logData.userCode || localStorage.getItem('userCode') || 'N/A_code';
    const userName = logData.userName || localStorage.getItem('userName') || 'Não Identificado';
    const apartment = logData.apartment || localStorage.getItem('apartmentId') || 'N/A_apt';
    const accessedDocument = logData.accessedDocument || 'N/A_doc';
    const details = logData.details || {}; // Detalhes adicionais

    const now = new Date();
    now.setHours(now.getHours() - 3); // Ajusta o horário para UTC-3

    const formattedDate = now.toISOString().replace('T', '_').split('.')[0];
    // Cria um nome de arquivo seguro, permitindo pontos para extensões
    let fileName = `${userName}_Acesso_apartamento_${apartment}_${accessedDocument}_${userCode}_${formattedDate}`;
    fileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_'); 

    const accessLog = {
        userCode: userCode,
        userName: userName,
        apartment: `Acesso ao apartamento ${apartment}`,
        accessedDocument: accessedDocument,
        accessDate: now.toISOString(),
        ...details // Adiciona quaisquer detalhes extras do objeto 'details'
    };

    const logRef = ref(db, `logs/${fileName}`);
    set(logRef, accessLog)
        .then(() => console.log("Log registrado com sucesso:", fileName))
        .catch(error => console.error("Erro ao registrar log:", error));
}
