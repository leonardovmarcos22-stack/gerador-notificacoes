const { webpush, setup } = require("./_shared");

exports.handler = async event => {
  if(event.httpMethod !== "POST") return {statusCode:405, body:"Method Not Allowed"};

  if(process.env.ADMIN_TOKEN && event.headers.authorization !== `Bearer ${process.env.ADMIN_TOKEN}`){
    return {statusCode:401, body:JSON.stringify({error:"Não autorizado"})};
  }

  try {
    setup();
    const body = JSON.parse(event.body || "{}");
    if(!body.subscription) return {statusCode:400, body:JSON.stringify({error:"Assinatura Push ausente."})};

    await webpush.sendNotification(body.subscription, JSON.stringify({
      title: body.title || "Nova notificação",
      message: body.message || ""
    }));

    return {statusCode:200, body:JSON.stringify({ok:true})};
  } catch(e) {
    console.error(e);
    return {statusCode:500, body:JSON.stringify({error:"Falha ao enviar o Push."})};
  }
};
