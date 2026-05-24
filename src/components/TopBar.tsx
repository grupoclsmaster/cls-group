"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "mentoria" | "masterclass" | "oportunidade" | "recurso";
  time: string;
  read: boolean;
  link: string;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Nova Mentoria Agendada",
    description: "Valuation técnico com Eng. Magno Santos em 28 de Maio às 14:00.",
    type: "mentoria",
    time: "Há 10 min",
    read: false,
    link: "/calendario",
  },
  {
    id: "2",
    title: "Nova Masterclass Disponível",
    description: "Assista a 'Design Premium e Alavancagem de Valor' com Arq. Mayara Santos.",
    type: "masterclass",
    time: "Há 2 horas",
    read: false,
    link: "/masterclasses",
  },
  {
    id: "3",
    title: "Oportunidade Exclusiva",
    description: "Rodada de co-investimento aberta para o Residencial Studio Pinheiros.",
    type: "oportunidade",
    time: "Há 1 dia",
    read: true,
    link: "/oportunidades",
  },
  {
    id: "4",
    title: "Novo Material de Apoio",
    description: "Modelo de Estudo de Viabilidade (EVTL) já disponível para download.",
    type: "recurso",
    time: "Há 2 dias",
    read: true,
    link: "/recursos",
  },
];

export default function TopBar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const collapsed = localStorage.getItem("cls_sidebar_collapsed") === "true";
    setIsCollapsed(collapsed);

    const handleToggle = () => {
      setIsCollapsed(localStorage.getItem("cls_sidebar_collapsed") === "true");
    };

    window.addEventListener("cls_sidebar_toggle", handleToggle);
    return () => window.removeEventListener("cls_sidebar_toggle", handleToggle);
  }, []);

  const sidebarWidth = isCollapsed ? "80px" : "280px";

  useEffect(() => {
    const loadNotifications = () => {
      const saved = localStorage.getItem("cls_notifications");
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (e) {
          setNotifications(initialNotifications);
        }
      } else {
        setNotifications(initialNotifications);
        localStorage.setItem("cls_notifications", JSON.stringify(initialNotifications));
      }
    };

    loadNotifications();

    const handleUpdate = () => {
      const saved = localStorage.getItem("cls_notifications");
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (e) {
          // ignore parsing issues
        }
      }
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("cls_notifications_changed", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("cls_notifications_changed", handleUpdate);
    };
  }, []);

  const saveNotifications = (newItems: Notification[]) => {
    setNotifications(newItems);
    localStorage.setItem("cls_notifications", JSON.stringify(newItems));
    window.dispatchEvent(new Event("cls_notifications_changed"));
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const handleClearAll = () => {
    saveNotifications([]);
  };

  const handleNotificationClick = (item: Notification) => {
    const updated = notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n));
    saveNotifications(updated);
    setIsOpen(false);
    router.push(item.link);
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: `calc(100% - ${sidebarWidth})`,
        transition: "width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        height: "80px",
        padding: "0 40px",
        backgroundColor: "rgba(19, 19, 22, 0.7)",
        backdropFilter: "blur(20px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 40,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <button className="topbar-btn">
          <span className="material-symbols-outlined">search</span>
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="topbar-btn"
            style={{ position: "relative" }}
          >
            <span className="material-symbols-outlined">notifications</span>
            {hasUnread && (
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "var(--color-secondary)",
                  borderRadius: "50%",
                }}
              />
            )}
          </button>

          {isOpen && (
            <>
              {/* Backdrop to close on click outside */}
              <div
                onClick={() => setIsOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 45,
                  backgroundColor: "transparent",
                }}
              />

              {/* Dropdown Panel */}
              <div
                className="glass-panel"
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  width: "360px",
                  maxHeight: "450px",
                  borderRadius: "4px",
                  border: "1px solid rgba(237, 192, 102, 0.15)",
                  backgroundColor: "rgba(19, 19, 22, 0.98)",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
                  zIndex: 50,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                {/* Dropdown Header */}
                <div
                  style={{
                    padding: "16px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span className="font-label-caps" style={{ color: "var(--color-on-surface)", fontSize: "11px" }}>
                    Notificações
                  </span>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {notifications.length > 0 && (
                      <>
                        <button
                          onClick={handleMarkAllAsRead}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--color-secondary)",
                            fontSize: "10px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          className="hover-opacity"
                        >
                          Ler todas
                        </button>
                        <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>|</span>
                        <button
                          onClick={handleClearAll}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--color-outline)",
                            fontSize: "10px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                          className="hover-opacity"
                        >
                          Limpar
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Dropdown List */}
                <div
                  className="hide-scroll"
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {notifications.length === 0 ? (
                    <div
                      style={{
                        padding: "40px 24px",
                        textAlign: "center",
                        color: "var(--color-on-surface-variant)",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "36px", marginBottom: "12px", opacity: 0.3 }}
                      >
                        notifications_off
                      </span>
                      <p style={{ fontSize: "13px" }}>Você não tem novas notificações.</p>
                    </div>
                  ) : (
                    notifications.map((item) => {
                      let iconName = "notifications";
                      let iconColor = "var(--color-secondary)";
                      let iconBg = "rgba(237, 192, 102, 0.15)";

                      if (item.type === "mentoria") {
                        iconName = "calendar_month";
                        iconColor = "var(--color-secondary)";
                        iconBg = "rgba(237, 192, 102, 0.15)";
                      } else if (item.type === "masterclass") {
                        iconName = "play_lesson";
                        iconColor = "var(--color-primary)";
                        iconBg = "rgba(194, 194, 245, 0.15)";
                      } else if (item.type === "oportunidade") {
                        iconName = "shopping_bag";
                        iconColor = "#a3e635";
                        iconBg = "rgba(163, 230, 53, 0.15)";
                      } else if (item.type === "recurso") {
                        iconName = "folder_shared";
                        iconColor = "#3b82f6";
                        iconBg = "rgba(59, 130, 246, 0.15)";
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          style={{
                            padding: "16px",
                            borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                            display: "flex",
                            gap: "12px",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                            backgroundColor: item.read ? "transparent" : "rgba(255, 255, 255, 0.02)",
                            position: "relative",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = item.read
                              ? "transparent"
                              : "rgba(255, 255, 255, 0.02)";
                          }}
                        >
                          {!item.read && (
                            <div
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: "3px",
                                backgroundColor: "var(--color-secondary)",
                              }}
                            />
                          )}

                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: iconBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "18px", color: iconColor }}
                            >
                              {iconName}
                            </span>
                          </div>

                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                              <h5
                                style={{
                                  fontSize: "12px",
                                  fontWeight: item.read ? 600 : 700,
                                  color: item.read ? "var(--color-on-surface)" : "#ffffff",
                                  margin: 0,
                                }}
                              >
                                {item.title}
                              </h5>
                              <span style={{ fontSize: "9px", color: "var(--color-outline)", flexShrink: 0, marginLeft: "8px" }}>
                                {item.time}
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: "11px",
                                color: item.read ? "var(--color-on-surface-variant)" : "var(--color-on-surface)",
                                lineHeight: "1.4",
                                margin: 0,
                              }}
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button className="topbar-btn">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
