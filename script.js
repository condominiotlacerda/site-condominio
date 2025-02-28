// Importação das funções do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, push, get } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBzgHcrZNvCQEunq-d3LeDm0u4LDhwjDgM",
    authDomain: "logsite-d81dd.firebaseapp.com",
    databaseURL: "https://logsite-d81dd-default-rtdb.firebaseio.com",
    projectId: "logsite-d81dd",
    storageBucket: "logsite-d81dd.firebasestorage.app",
    messagingSenderId: "285508603780",
    appId: "1:285508603780:web:dba70ace036ee8a37297d1",
    measurementId: "G-B0JHRHTNKF"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

// Função para registrar logs no Firebase
function logAccess(userCode, userName, apartment, accessedDocument) {
    const now = new Date();

    // Ajustando para o fuso horário de Brasília (UTC-3)
    now.setHours(now.getHours() - 3);

    // Formatação correta da data e hora
    const formattedDate = now.toISOString().replace("T", "_").replace(/:/g, "_").split(".")[0];

    // Nome do arquivo de log
    const fileName = `${userName}_Acesso_ao_apartamento_${apartment}_${userCode}_${formattedDate}`;

    // Objeto do log
    const accessLog = {
        userCode: userCode,
        userName: userName,
        apartment: `Acesso ao apartamento ${apartment}`,
        accessDate: now.toISOString(),
        accessedDocument: accessedDocument,
        fileName: fileName
    };

    // Envia para o Firebase
    const logsRef = ref(db, 'logs/');
    push(logsRef, accessLog)
        .then(() => console.log('Log registrado com sucesso:', fileName))
        .catch(error => console.error('Erro ao registrar o log:', error));
}

// Disponibiliza a função para ser usada no HTML
window.logAccess = logAccess;

// Função para habilitar o acesso aos apartamentos após digitar o código correto
function enableApartment() {
    const accessCode = document.getElementById("accessCode").value.trim();
    const userName = "Usuário"; // Pode ser personalizado com um banco de usuários

    if (accessCode) {
        document.querySelectorAll(".apartment-button").forEach(btn => btn.disabled = false);
        alert("Acesso liberado! Escolha um apartamento.");
    } else {
        alert("Código de acesso inválido!");
    }
}

// Função para exibir os arquivos de um apartamento específico
function showFiles(apartment) {
    const fileContainer = document.getElementById("file-container");
    const fileList = document.getElementById("file-list");
    const apartmentNumber = document.getElementById("apartment-number");

    // Define o número do apartamento no título
    apartmentNumber.innerText = apartment;

    // Limpa a lista antes de adicionar novos arquivos
    fileList.innerHTML = "";

    // Referências no Firebase para os boletos
    let apartmentFiles = [apartment];

    // Se for o apartamento "1", adiciona também os arquivos de "1A" e "1B"
    if (apartment === "1") {
        apartmentFiles.push("1A", "1B");
    }

    // Busca os arquivos no Firebase para os apartamentos definidos
    apartmentFiles.forEach((apt) => {
        const filesRef = ref(db, `arquivos/apartamento_${apt}`);

        get(filesRef).then((snapshot) => {
            if (snapshot.exists()) {
                const files = snapshot.val();
                Object.keys(files).forEach((fileName) => {
                    const fileUrl = files[fileName];

                    // Cria um item na lista
                    const listItem = document.createElement("li");
                    const link = document.createElement("a");
                    link.href = fileUrl;
                    link.textContent = fileName;
                    link.target = "_blank";
                    listItem.appendChild(link);

                    fileList.appendChild(listItem);
                });
            }
        }).catch((error) => {
            console.error("Erro ao buscar arquivos:", error);
        });
    });

    // Exibe o container de arquivos
    fileContainer.style.display = "block";
}

// Disponibiliza funções globalmente para o HTML
window.enableApartment = enableApartment;
window.showFiles = showFiles;
