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
  
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: "Função de registro de usuários executada com sucesso (simulado)" }),
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