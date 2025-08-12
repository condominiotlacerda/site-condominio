// utils.js
import { ref, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";
import { db } from './firebase.js'; // Importe a instância do database

// Função para registrar logs de acesso de forma mais flexível
export function logAccess(logData) {
    if (!db) {
        console.error("Firebase Database não foi inicializado.");
        return;
    }

    const now = new Date();
    now.setHours(now.getHours() - 3); // Ajuste para fuso horário de Brasília
    const formattedDate = now.toISOString().replace('T', '_').split('.')[0];

    // Recupere as informações do usuário do localStorage
    const userCode = localStorage.getItem('userCode') || 'N/A';
    const userName = localStorage.getItem('userName') || 'N/A';
    const apartmentId = localStorage.getItem('apartmentId') || 'N/A';

    // Construa o nome do arquivo de log baseado nos dados
    // Adapte este formato para ser consistente com o que você deseja
    let fileName = `${userCode}_${userName}_${formattedDate}`;

    // Adiciona informações específicas com base no tipo de logData
    if (logData.accessedDocument) {
        fileName += `_Visualizado_${logData.accessedDocument.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }
    if (logData.details && logData.details.selectedSheet) {
        fileName += `_Planilha_${logData.details.selectedSheet.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }
    if (logData.details && logData.details.actionType) {
        fileName += `_Acao_${logData.details.actionType.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }
    if (logData.apartment) { // Para compatibilidade com chamadas antigas do area_condominio
        fileName += `_apto_${logData.apartment}`;
    } else {
        fileName += `_apto_${apartmentId}`; // Garante que o apartamento esteja sempre no log
    }

    // Limpa caracteres inválidos para o nome do nó do Firebase
    fileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Cria o objeto de log completo
    const accessLog = {
        userCode: userCode,
        userName: userName,
        apartment: apartmentId,
        accessDate: now.toISOString(),
        ...logData // Adiciona todos os dados passados para a função
    };

    const logRef = ref(db, `logs/${fileName}`);
    set(logRef, accessLog)
        .then(() => console.log("Log registrado com sucesso:", fileName))
        .catch(error => console.error("Erro ao registrar log:", error));
}
