<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css?v=1.1">
    <title>Condomínio T Lacerda - Boletos e Contas</title>
    <script src="script.js" defer></script>
    <script type="module">
        // ==================== 🔥 INÍCIO FIREBASE 🔥 ====================
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
        import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
        import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

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

        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        const db = getDatabase();

        // Registra o evento de visualização da página
        logEvent(analytics, 'page_view');

        // Função para registrar acessos no Firebase com horário correto (UTC-3)
        function logAccess(userCode, userName, apartment, accessedDocument) {
            // Captura a data atual
            const now = new Date();
            
            // Ajusta para o horário de Brasília (UTC-3)
            now.setHours(now.getHours() - 3);

            // Converte a data para um formato seguro
            const formattedDate = now.toISOString().replace('T', '_').split('.')[0];

            // Define o nome do arquivo de log
            let fileName = `${userName}_Acesso_apartamento_${apartment}_${accessedDocument}_${userCode}_${formattedDate}`;
            fileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_'); // Remove caracteres inválidos

            // Criação do objeto de log
            const accessLog = {
                userCode: userCode,
                userName: userName,
                apartment: `Acesso ao apartamento ${apartment}`,
                accessedDocument: accessedDocument,
                accessDate: now.toISOString() // Salvo já no fuso horário de Brasília
            };

            // Grava o log no Firebase com o nome formatado corretamente
            const logRef = ref(db, `logs/${fileName}`);
            set(logRef, accessLog)
                .then(() => console.log("Log registrado com horário correto:", now.toISOString()))
                .catch(error => console.error("Erro ao registrar log:", error));
        }

        // Disponibiliza a função para uso no script.js
        window.logAccess = logAccess;

        // ==================== 🔥 FIM FIREBASE 🔥 ====================
    </script>
</head>
<body>
    <header>
        <img src="images/logo_cond.jpg" alt="Logo do Condomínio" class="logo">
    </header>

    <h1>Condomínio T Lacerda</h1>
    <p id="welcome-message">Olá! Eu sou a Lacerda, assistente virtual do Condomínio T Lacerda.<br>Por favor, digite seu código de acesso.</p>
    <input type="password" id="accessCode" placeholder="Digite seu código">
    <button onclick="enableApartment()">Acessar</button>

    <div class="apartment-section">
        <button class="apartment-button" id="apto1" disabled onclick="showFiles('1')">Apartamento 1</button>
        <button class="apartment-button" id="apto101" disabled onclick="showFiles('101')">Apartamento 101</button>
        <button class="apartment-button" id="apto102" disabled onclick="showFiles('102')">Apartamento 102</button>
        <button class="apartment-button" id="apto201" disabled onclick="showFiles('201')">Apartamento 201</button>
        <button class="apartment-button" id="apto202" disabled onclick="showFiles('202')">Apartamento 202</button>
        <button class="apartment-button" id="apto301" disabled onclick="showFiles('301')">Apartamento 301</button>
        <button class="apartment-button" id="apto302" disabled onclick="showFiles('302')">Apartamento 302</button>
        <button class="apartment-button" id="apto401" disabled onclick="showFiles('401')">Apartamento 401</button>
    </div>

    <div id="file-container" class="file-box" style="display: none;">
        <h2>Arquivos do Apartamento <span id="apartment-number"></span></h2>
        <ul class="file-list" id="file-list"></ul>
    </div>

    <div id="viewer-container" class="viewer-box" style="display: none;">
        <h2>Visualizador de Arquivos</h2>
        <iframe id="file-viewer" src="" frameborder="0"></iframe>
        <a id="download-button" href="#" download class="download-btn">Baixar Arquivo</a>
    </div>
</body>
</html>
