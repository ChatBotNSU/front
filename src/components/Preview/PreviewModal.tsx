import React, { useEffect, useRef, useState, useMemo } from "react";
import { getPreviewExecutionId, processPreview } from "../../utils/chatbotApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

type Message = {
    id: string;
    sender: "user" | "bot"; // `content` can be plain string or structured object from preview
    content: any;
};

const PreviewModal: React.FC<{
    chatbotId: string;
    onClose: () => void;
}> = ({ chatbotId, onClose }) => {
    const token = useSelector((s: RootState) => s.auth.access_token);
    const [executionId, setExecutionId] = useState<string | number | null>(
        null,
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const listRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getPreviewExecutionId(token);
                if (!mounted) return;
                // Accept property name variants
                const id =
                    res?.execution_id ?? res?.executionId ?? res?.id ?? res;
                setExecutionId(id ?? null);
            } catch (err: any) {
                alert(
                    "Не удалось получить execution id: " +
                        (err?.message ?? String(err)),
                );
                onClose();
            }
        })();
        return () => {
            mounted = false;
        };
    }, [token, onClose]);

    useEffect(() => {
        listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    const pushBotMessage = (payload: any) => {
        const content =
            payload && typeof payload === "object"
                ? payload
                : String(payload ?? "");
        setMessages((cur) => [
            ...cur,
            { id: `${Date.now()}-${Math.random()}`, sender: "bot", content },
        ]);
    };

    // send a user message text and process preview (used by input send and quick buttons)
    const sendText = async (userMsg: string) => {
        if (!userMsg || !executionId) return;
        setMessages((cur) => [
            ...cur,
            { id: `u-${Date.now()}`, sender: "user", content: userMsg },
        ]);
        setLoading(true);
        try {
            const body = {
                text: userMsg,
                images: [],
                audios: [],
                files: [],
                restart_command: true,
            };
            const res = await processPreview(
                chatbotId,
                executionId,
                body,
                token,
            );
            if (Array.isArray(res?.messages)) {
                res.messages.forEach((m: any) => pushBotMessage(m));
            } else if (Array.isArray(res)) {
                res.forEach((m: any) => pushBotMessage(m));
            } else if (res) {
                pushBotMessage(res);
            } else {
                pushBotMessage(JSON.stringify(res));
            }
        } catch (err: any) {
            alert(
                "Ошибка во время предпросмотра: " +
                    (err?.message ?? String(err)),
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!text.trim() || !executionId) return;
        const userMsg = text.trim();
        setText("");
        await sendText(userMsg);
    };

    // helper: extract buttons array from a message content (bodies or choise_options)
    const getButtonsFromContent = (c: any): any[] => {
        if (!c) return [];
        // top-level choice fields (backend uses choise_options typo)
        const top = c.choise_options ?? c.choice_options ?? c.choice_options;
        if (Array.isArray(top) && top.length) return top;

        // bodies with buttons
        const bodies = Array.isArray(c.bodies) ? c.bodies : [];
        for (const b of bodies) {
            if (!b) continue;
            if (
                b.type === "buttons" ||
                b.type === "button" ||
                b.type === "choices" ||
                b.type === "choice"
            ) {
                const list =
                    b.bodyData?.buttons ??
                    b.buttons ??
                    b.options ??
                    b.choice_options ??
                    [];
                if (Array.isArray(list) && list.length) return list;
            }
        }

        return [];
    };

    // derive latest buttons from last bot message containing buttons or choice options
    const currentButtons: any[] = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            const m = messages[i];
            if (m.sender !== "bot") continue;
            const c = m.content;
            const list = getButtonsFromContent(c);
            if (list && list.length) return list;
        }
        return [];
    }, [messages]);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.4)",
                zIndex: 2000,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 520,
                    maxWidth: "calc(100% - 24px)",
                    background: "white",
                    borderRadius: 8,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        padding: 12,
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div style={{ fontWeight: 600 }}>
                        Preview — Chat with bot
                    </div>
                    <div>
                        <button
                            onClick={onClose}
                            style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div
                    ref={listRef}
                    style={{
                        padding: 12,
                        height: 360,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                    }}
                >
                    {messages.length === 0 && (
                        <div style={{ color: "#666", fontSize: 13 }}>
                            Send a message to start the preview...
                        </div>
                    )}
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            style={{
                                alignSelf:
                                    m.sender === "user"
                                        ? "flex-end"
                                        : "flex-start",
                                maxWidth: "85%",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#888",
                                    marginBottom: 4,
                                }}
                            >
                                {m.sender === "user" ? "You" : "Bot"}
                            </div>
                            <div
                                style={{
                                    background:
                                        m.sender === "user"
                                            ? "#eef2ff"
                                            : "#f1f5f9",
                                    padding: 10,
                                    borderRadius: 8,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                }}
                            >
                                {/* Render structured content if present */}
                                {m.content &&
                                typeof m.content === "object" &&
                                Array.isArray(m.content.bodies)
                                    ? m.content.bodies.map(
                                          (b: any, i: number) => {
                                              if (!b) return null;
                                              if (b.type === "text") {
                                                  const t =
                                                      b.bodyData?.text ??
                                                      b.text ??
                                                      "";
                                                  return (
                                                      <div
                                                          key={i}
                                                          style={{
                                                              whiteSpace:
                                                                  "pre-wrap",
                                                          }}
                                                      >
                                                          {t}
                                                      </div>
                                                  );
                                              }
                                              if (b.type === "image") {
                                                  const images =
                                                      b.bodyData || [];
                                                  if (
                                                      Array.isArray(images) &&
                                                      images.length > 0
                                                  ) {
                                                      return (
                                                          <div
                                                              key={i}
                                                              style={{
                                                                  display:
                                                                      "flex",
                                                                  flexDirection:
                                                                      "column",
                                                                  gap: 8,
                                                              }}
                                                          >
                                                              {images.map(
                                                                  (
                                                                      img: any,
                                                                      imgIndex: number,
                                                                  ) => (
                                                                      <img
                                                                          key={
                                                                              imgIndex
                                                                          }
                                                                          src={
                                                                              img.url ??
                                                                              img
                                                                          }
                                                                          alt={`image-${imgIndex}`}
                                                                          style={{
                                                                              maxWidth: 300,
                                                                              borderRadius: 6,
                                                                          }}
                                                                      />
                                                                  ),
                                                              )}
                                                          </div>
                                                      );
                                                  }
                                                  return null;
                                              }
                                              if (
                                                  b.type === "buttons" ||
                                                  b.type === "button"
                                              ) {
                                                  const list =
                                                      b.bodyData?.buttons ??
                                                      b.buttons ??
                                                      b.options ??
                                                      b.choice_options ??
                                                      [];
                                                  return (
                                                      <div
                                                          key={i}
                                                          style={{
                                                              display: "flex",
                                                              gap: 8,
                                                              flexWrap: "wrap",
                                                          }}
                                                      >
                                                          {list.map(
                                                              (
                                                                  btn: any,
                                                                  idx: number,
                                                              ) => (
                                                                  <button
                                                                      key={idx}
                                                                      style={{
                                                                          padding:
                                                                              "8px 12px",
                                                                          borderRadius: 8,
                                                                          border: "1px solid #e5e7eb",
                                                                          background:
                                                                              "white",
                                                                          cursor: "pointer",
                                                                      }}
                                                                      onClick={() => {
                                                                          // clicking a preview button inserts its label into input
                                                                          const label =
                                                                              typeof btn ===
                                                                              "string"
                                                                                  ? btn
                                                                                  : (btn.label ??
                                                                                    btn.value ??
                                                                                    String(
                                                                                        btn,
                                                                                    ));
                                                                          setText(
                                                                              String(
                                                                                  label,
                                                                              ),
                                                                          );
                                                                      }}
                                                                  >
                                                                      {typeof btn ===
                                                                      "string"
                                                                          ? btn
                                                                          : (btn.label ??
                                                                            btn.value ??
                                                                            String(
                                                                                btn,
                                                                            ))}
                                                                  </button>
                                                              ),
                                                          )}
                                                      </div>
                                                  );
                                              }
                                              // fallback: render JSON
                                              return (
                                                  <div
                                                      key={i}
                                                      style={{
                                                          fontSize: 12,
                                                          color: "#333",
                                                      }}
                                                  >
                                                      {JSON.stringify(b)}
                                                  </div>
                                              );
                                          },
                                      )
                                    : // Render other structured shapes gracefully (avoid [object Object])
                                      (() => {
                                          const c = m.content;
                                          if (typeof c === "string") {
                                              return (
                                                  <div
                                                      style={{
                                                          whiteSpace:
                                                              "pre-wrap",
                                                      }}
                                                  >
                                                      {c}
                                                  </div>
                                              );
                                          }
                                          if (c == null) return <div />;
                                          if (typeof c === "object") {
                                              if (
                                                  Array.isArray(c.images) &&
                                                  c.images.length
                                              ) {
                                                  return (
                                                      <div
                                                          style={{
                                                              display: "flex",
                                                              flexDirection:
                                                                  "column",
                                                              gap: 8,
                                                          }}
                                                      >
                                                          {typeof c.text ===
                                                              "string" && (
                                                              <div
                                                                  style={{
                                                                      whiteSpace:
                                                                          "pre-wrap",
                                                                  }}
                                                              >
                                                                  {c.text}
                                                              </div>
                                                          )}
                                                          {c.images.map(
                                                              (
                                                                  src: string,
                                                                  idx: number,
                                                              ) => (
                                                                  <img
                                                                      key={idx}
                                                                      src={src}
                                                                      alt={`preview-${idx}`}
                                                                      style={{
                                                                          maxWidth: 300,
                                                                          borderRadius: 6,
                                                                      }}
                                                                  />
                                                              ),
                                                          )}
                                                      </div>
                                                  );
                                              }
                                              if (
                                                  Array.isArray(c.files) &&
                                                  c.files.length
                                              ) {
                                                  return (
                                                      <div
                                                          style={{
                                                              display: "flex",
                                                              flexDirection:
                                                                  "column",
                                                              gap: 8,
                                                          }}
                                                      >
                                                          {typeof c.text ===
                                                              "string" && (
                                                              <div
                                                                  style={{
                                                                      whiteSpace:
                                                                          "pre-wrap",
                                                                  }}
                                                              >
                                                                  {c.text}
                                                              </div>
                                                          )}
                                                          {c.files.map(
                                                              (
                                                                  file: string,
                                                                  idx: number,
                                                              ) => (
                                                                  <a
                                                                      key={idx}
                                                                      href={
                                                                          file
                                                                      }
                                                                      target="_blank"
                                                                      rel="noreferrer"
                                                                      style={{
                                                                          color: "#2563eb",
                                                                      }}
                                                                  >
                                                                      {file}
                                                                  </a>
                                                              ),
                                                          )}
                                                      </div>
                                                  );
                                              }
                                              if (typeof c.text === "string") {
                                                  return (
                                                      <div
                                                          style={{
                                                              whiteSpace:
                                                                  "pre-wrap",
                                                          }}
                                                      >
                                                          {c.text}
                                                      </div>
                                                  );
                                              }
                                              if (typeof c.reply === "string") {
                                                  return (
                                                      <div
                                                          style={{
                                                              whiteSpace:
                                                                  "pre-wrap",
                                                          }}
                                                      >
                                                          {c.reply}
                                                      </div>
                                                  );
                                              }
                                              if (
                                                  typeof c.message === "string"
                                              ) {
                                                  return (
                                                      <div
                                                          style={{
                                                              whiteSpace:
                                                                  "pre-wrap",
                                                          }}
                                                      >
                                                          {c.message}
                                                      </div>
                                                  );
                                              }
                                              if (Array.isArray(c.messages)) {
                                                  return (
                                                      <div
                                                          style={{
                                                              display: "flex",
                                                              flexDirection:
                                                                  "column",
                                                              gap: 6,
                                                          }}
                                                      >
                                                          {c.messages.map(
                                                              (
                                                                  mm: any,
                                                                  idx: number,
                                                              ) => (
                                                                  <div
                                                                      key={idx}
                                                                      style={{
                                                                          whiteSpace:
                                                                              "pre-wrap",
                                                                      }}
                                                                  >
                                                                      {mm?.text ??
                                                                          String(
                                                                              mm,
                                                                          )}
                                                                  </div>
                                                              ),
                                                          )}
                                                      </div>
                                                  );
                                              }
                                              // fallback: pretty-print JSON
                                              return (
                                                  <pre
                                                      style={{
                                                          whiteSpace:
                                                              "pre-wrap",
                                                          fontSize: 12,
                                                          margin: 0,
                                                      }}
                                                  >
                                                      {JSON.stringify(
                                                          c,
                                                          null,
                                                          2,
                                                      )}
                                                  </pre>
                                              );
                                          }
                                          return (
                                              <div
                                                  style={{
                                                      whiteSpace: "pre-wrap",
                                                  }}
                                              >
                                                  {String(c)}
                                              </div>
                                          );
                                      })()}
                            </div>
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        padding: 8,
                        borderTop: "1px solid #eee",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                    }}
                >
                    {/* Render quick-reply buttons above input if any */}
                    {currentButtons && currentButtons.length > 0 && (
                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                            }}
                        >
                            {currentButtons.map((btn: any, idx: number) => {
                                const label =
                                    typeof btn === "string"
                                        ? btn
                                        : (btn.label ??
                                          btn.value ??
                                          String(btn));
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => sendText(String(label))}
                                        disabled={loading || !executionId}
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            border: "1px solid #e5e7eb",
                                            background: "white",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSend();
                            }}
                            placeholder={
                                executionId
                                    ? "Type a message..."
                                    : "Waiting for execution id..."
                            }
                            style={{
                                flex: 1,
                                padding: 8,
                                borderRadius: 6,
                                border: "1px solid #e5e7eb",
                            }}
                        />
                        <button
                            disabled={!text.trim() || loading || !executionId}
                            onClick={handleSend}
                            style={{
                                padding: "8px 12px",
                                borderRadius: 6,
                                background: "#667eea",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            {loading ? "..." : "Send"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;
