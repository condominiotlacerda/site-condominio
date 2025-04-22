exports.handler = async (event) => {
  try {
    console.log("Função log-access foi chamada!");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Log registrado com sucesso (simulado)" }),
    };
  } catch (error) {
    console.error("Erro na função log-access:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao registrar o log" }),
    };
  }
};
