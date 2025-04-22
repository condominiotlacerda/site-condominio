exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    try {
      console.log("Função log-access foi chamada com POST!");

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*', // Permite qualquer origem (para teste, pode ser mais específico em produção)
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: "Log registrado com sucesso (simulado)" }),
      };
    } catch (error) {
      console.error("Erro na função log-access:", error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: "Erro ao registrar o log" }),
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
