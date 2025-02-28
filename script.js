// Função para habilitar os botões dos apartamentos com base no código de acesso
function enableApartment() {
    const accessCode = document.getElementById("accessCode").value.trim();
    const apartments = {
        "FgH7+iJk=1": { name: "João Paulo", apt: "1" },
        "code101": { name: "Usuário 101", apt: "101" },
        "code102": { name: "Usuário 102", apt: "102" },
        "code201": { name: "Usuário 201", apt: "201" },
        "code202": { name: "Usuário 202", apt: "202" },
        "code301": { name: "Usuário 301", apt: "301" },
        "code302": { name: "Usuário 302", apt: "302" },
        "code401": { name: "Usuário 401", apt: "401" }
    };

    if (apartments[accessCode]) {
        const user = apartments[accessCode];
        document.getElementById("welcome-message").innerHTML = 
            `Seja bem-vindo(a), ${user.name}. Clique no botão do seu apartamento para acessar seus boletos.`;

        document.getElementById(`apto${user.apt}`).disabled = false;

        // Registra o acesso no Firebase
        logAccess(accessCode, user.name, `Acesso ao apartamento ${user.apt}`);
    } else {
        alert("Código de acesso inválido.");
    }
}

// Função para exibir os arquivos do apartamento selecionado
function showFiles(apartmentNumber) {
    const fileContainer = document.getElementById("file-container");
    const fileList = document.getElementById("file-list");
    const apartmentTitle = document.getElementById("apartment-number");

    fileList.innerHTML = "";
    apartmentTitle.textContent = apartmentNumber;
    fileContainer.style.display = "block";

    // Definição dos tipos de arquivos para cada apartamento
    const fileTypes = [
        { name: "Boleto Condomínio", suffix: "Boleto_Condominio_apto" },
        { name: "Boleto Acordo M2D", suffix: "Boleto_Acordo_M2D_apto" },
        { name: "Boleto Hidro/Eletr", suffix: "Boleto_Hidro_Eletr_apto" }
    ];

    // Se for o apartamento 1, incluir 1, 1a e 1b
    let aptNumbers = [apartmentNumber];
    if (apartmentNumber === "1") {
        aptNumbers = ["1", "1a", "1b"];
    }

    // Adicionar boletos para os apartamentos relevantes
    aptNumbers.forEach(aptNum => {
        fileTypes.forEach(file => {
            const fileName = `${file.suffix}_${aptNum}.pdf`;
            addFileLink(file.name, fileName);
        });
    });

    // Adicionar a prestação de contas (apenas uma vez para o apto 1)
    if (apartmentNumber === "1") {
        addFileLink("Prestação de Contas", "Prestacao_de_Contas_apto_1.pdf");
    }
}

// Função para adicionar um link de arquivo à lista
function addFileLink(displayName, fileName) {
    const fileList = document.getElementById("file-list");
    const filePath = `arquivos/${fileName}`;

    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = filePath;
    link.textContent = displayName;
    link.target = "_blank";

    listItem.appendChild(link);
    fileList.appendChild(listItem);
}

// Função para registrar acessos no Firebase
function logAccess(userCode, userName, accessedDocument) {
    const db = firebase.database();

    // Ajuste do horário para Brasília (UTC-3)
    const now = new Date();
    now.setUTCHours(now.getUTCHours() - 3); // Corrige o fuso horário

    const formattedDate = now.toISOString();

    const accessLog = {
        userCode: userCode,
        userName: userName,
        accessDate: formattedDate,
        accessedDocument: accessedDocument,
        apartment: accessedDocument,
        fileName: `${userName}_Acesso_ao_apartamento_${accessedDocument.replace(/\D/g, '')}_${userCode}_${formattedDate.replace(/[-T:.Z]/g, "_")}`
    };

    const logsRef = db.ref('logs/');
    logsRef.push(accessLog)
        .then(() => {
            console.log('Log registrado com sucesso.');
        })
        .catch(error => {
            console.error('Erro ao registrar o log:', error);
        });
}
