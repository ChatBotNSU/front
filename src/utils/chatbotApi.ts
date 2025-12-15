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

export default { deleteChatbot };
