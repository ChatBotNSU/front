export async function deleteChatbot(chatbotId: string | number, token?: string) {
  if (!chatbotId) throw new Error("No chatbot id provided");
  const res = await fetch(`/api/v1/chatbot/chatbot/${chatbotId}`, {
    method: "DELETE",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch (e) {
    // ignore json parse errors
  }

  if (!res.ok) {
    const errMsg = json?.detail || json?.message || `status ${res.status}`;
    throw new Error(String(errMsg));
  }

  return json ?? { success: true };
}

export async function createChatbot(body: any, token?: string) {
  const res = await fetch(`/api/v1/chatbot/chatbots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(body || {}),
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch (e) {
    // ignore json parse errors
  }

  if (!res.ok) {
    const errMsg = json?.detail || json?.message || `status ${res.status}`;
    throw new Error(String(errMsg));
  }

  return json;
}

// Preview execution helpers (note: preview backend may be on different port)
export async function getPreviewExecutionId(token?: string) {
  // Use relative path so dev server proxy can forward to preview backend and avoid CORS issues
  const res = await fetch(`/api/v1/preview/get_execution_id`, {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.detail || json?.message || `status ${res.status}`);
  return json;
}

export async function processPreview(chatbotId: string | number, executionId: string | number, body: any, token?: string) {
  const qs = new URLSearchParams({ chatbot_id: String(chatbotId), execution_id: String(executionId) });
  console.log(qs.toString());
  // Use relative path so dev server proxy can forward to preview backend and avoid CORS issues
  const res = await fetch(`/api/v1/preview/process?${qs.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(body || {}),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.detail || json?.message || `status ${res.status}`);
  return json;
}

export async function assignTelegram(tokenParam: string, chatbotId: string | number, authToken?: string) {
  const qs = new URLSearchParams({ token: String(tokenParam), chatbot_id: String(chatbotId) });
  const res = await fetch(`/api/v1/telegram/assigne?${qs.toString()}`, {
    method: "POST",
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : "",
      "Content-Type": "application/json",
    },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.detail || json?.message || `status ${res.status}`);
  return json;
}

export default { deleteChatbot };
