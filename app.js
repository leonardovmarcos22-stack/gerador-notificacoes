const $ = id => document.getElementById(id);

const status = msg => $("status").textContent = msg;

function updatePreview() {
  $("pTitle").textContent = $("title").value || "Nova venda";
  $("pText").textContent = $("message").value || "";
  $("pSender").textContent = $("sender").value || "Hotmart";
}

["sender", "title", "message"].forEach(id =>
  $(id).addEventListener("input", updatePreview)
);

function base64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = atob(base64);

  return Uint8Array.from(
    [...raw].map(c => c.charCodeAt(0))
  );
}

async function getPushSubscription() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker não disponível.");
  }

  if (!("PushManager" in window)) {
    throw new Error("Push Web não disponível neste iPhone.");
  }

  const reg = await navigator.serviceWorker.register("/sw.js");

  await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Permissão de notificações não concedida.");
  }

  const keyRes = await fetch("/api/vapid-public-key");

  if (!keyRes.ok) {
    throw new Error("Não foi possível obter a chave Push.");
  }

  const { publicKey } = await keyRes.json();

  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ToUint8Array(publicKey)
    });
  }

  return sub;
}

$("installPush").addEventListener("click", async () => {
  try {
    status("Ativando notificações...");

    const sub = await getPushSubscription();

    if (!sub) {
      throw new Error("Não foi possível criar a inscrição Push.");
    }

    status("Notificações ativadas neste iPhone. Agora toque em “Testar notificação”.");
  } catch (e) {
    console.error(e);
    status("Erro: " + e.message);
  }
});

$("send").addEventListener("click", async () => {
  try {
    status("Preparando Push...");

    const sub = await getPushSubscription();

    status("Enviando Push...");

    const res = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        subscription: sub,
        sender: $("sender").value,
        title: $("title").value,
        message: $("message").value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Falha no envio.");
    }

    status("Push enviado! Bloqueie o iPhone para testar a notificação.");
  } catch (e) {
    console.error(e);
    status("Erro: " + e.message);
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(console.error);
}

updatePreview();
