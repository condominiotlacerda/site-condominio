exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(event, null, 2), // Retorna o objeto event formatado
  };
};
