const $ = id => document.getElementById(id);
const status = msg => $("status").textContent = msg;

function updatePreview(){
  $("pTitle").textContent = $("title").value || "Nova venda";
  $("pText").textContent = $("message").value || "";
  $("pSender").textContent = $("sender").value || "Hotmart";
}
["sender","title","message"].forEach(id => $(id).addEventListener("input", updatePreview));

function base64ToUint8Array(base64String){
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

async function subscribe(){
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Este navegador não oferece Push Web neste contexto.");
  }

  const reg = await navigator.serviceWorker.register("/sw.js");
  const permission = await Notification.requestPermission();
  if(permission !== "granted") throw new Error("Permissão de notificação não concedida.");

  const keyRes = await fetch("/api/vapid-public-key");
  if(!keyRes.ok) throw new Error("Não foi possível obter a chave Push.");
  const { publicKey } = await keyRes.json();

  let sub = await reg.pushManager.getSubscription();
  if(!sub){
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(publicKey)
    });
  }

  const save = await fetch("/api/subscribe", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(sub)
  });
  if(!save.ok) throw new Error("Não foi possível registrar este iPhone no servidor.");

  status("Notificações ativadas. Agora toque em “Testar notificação”.");
}

$("installPush").addEventListener("click", async () => {
  try {
    status("Solicitando permissão…");
    await subscribe();
  } catch(e) {
    status("Erro: " + e.message);
  }
});

$("send").addEventListener("click", async () => {
  try {
    status("Preparando Push…");
    const reg = await navigator.serviceWorker.register("/sw.js");
    const sub = await reg.pushManager.getSubscription();
    if(!sub) throw new Error("Ative as notificações neste iPhone primeiro.");

    status("Enviando Push…");
    const res = await fetch("/api/send", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        subscription: sub,
        sender:$("sender").value,
        title:$("title").value,
        message:$("message").value
      })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || "Falha no envio.");
    status("Push enviado. Se o iPhone estiver bloqueado, a notificação deverá aparecer na Tela Bloqueada.");
  } catch(e) {
    status("Erro: " + e.message);
  }
});

if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
updatePreview();
