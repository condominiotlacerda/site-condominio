const admin = require('firebase-admin');

// Inicialize o Firebase Admin SDK fora do handler para reutilização
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL // Usando a variável de ambiente
  });
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: '',
      };
    }
  
    if (event.httpMethod === 'POST') {
      try {
        const formData = JSON.parse(event.body);
        const emailCadastro = formData.emailCadastro;
        const senhaCadastro = formData.senhaCadastro;
        const codigoAcesso = formData.codigoAcesso;

        console.log("Dados recebidos:", { emailCadastro, senhaCadastro, codigoAcesso });
        console.log("Função register-user foi chamada com POST!");

          const firestore = admin.firestore();
      const invitesCollection = firestore.collection('invites');
      const inviteDoc = await invitesCollection.doc(codigoAcesso).get();

      if (!inviteDoc.exists) {
        return {
          statusCode: 200, // Mudando para 200 OK com mensagem de erro para o frontend tratar
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: "Código de acesso inválido." }),
        };
      }

      const inviteData = inviteDoc.data();
      if (inviteData.isUsed) {
        return {
          statusCode: 200, // Mudando para 200 OK com mensagem de erro para o frontend tratar
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: "Código de acesso já utilizado." }),
        };
      }

      const apartmentId = inviteData.apartment;
      if (!apartmentId) {
        return {
          statusCode: 200, // Mudando para 200 OK com mensagem de erro para o frontend tratar
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: "Erro ao obter o apartamento associado ao código." }),
        };
      }

      // Se chegamos até aqui, o código é válido e não usado
      console.log("Código de acesso válido para o apartamento:", apartmentId);

          const db = admin.database();

      // Salvar informações em pendingApprovals
      const pendingRef = db.ref('pendingApprovals/' + formData.uid);
      await pendingRef.set({
        email: emailCadastro,
        accessCode: codigoAcesso,
        apartmentId: apartmentId
      });

      // Salvar informações em userApartments
      const userApartmentRef = db.ref('userApartments/' + formData.uid);
      await userApartmentRef.set({
        email: emailCadastro,
        accessCode: codigoAcesso,
        apartmentId: apartmentId,
        userName: 'Novo Usuário' // Você pode adicionar o nome do usuário aqui se tiver essa informação
      });

      console.log("Dados salvos com sucesso no Realtime Database");

          // Marcar o código como usado no Firestore
      const inviteDocRefFirestore = firestore.collection('invites').doc(codigoAcesso);
      await inviteDocRefFirestore.update({ isUsed: true });

      console.log("Código de acesso marcado como usado no Firestore.");

      // O restante da lógica de registro (gravação no Realtime Database e atualização do Firestore) virá aqui
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: "Usuário registrado e dados salvos com sucesso!" }),
      };
  
      } catch (error) {
        console.error("Erro na função register-user:", error);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: "Erro ao registrar o usuário" }),
        };
      }
    } else {
      return {
        statusCode: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: "Método não permitido" }),
      };
    }
  };
