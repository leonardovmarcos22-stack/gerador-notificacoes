exports.handler = async event => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método não permitido." })
    };
  }

  try {
    const subscription = JSON.parse(event.body || "{}");

    if (!subscription.endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Subscription inválida." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        subscription
      })
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "JSON inválido."
      })
    };
  }
};
