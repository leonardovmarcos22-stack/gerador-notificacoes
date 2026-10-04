exports.handler = async event => ({
  statusCode: 200,
  body: JSON.stringify({ok:true, note:"A primeira versão envia a assinatura diretamente com cada teste."})
});
