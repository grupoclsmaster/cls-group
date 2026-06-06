"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { SkeletonAvatar } from "./SkeletonLoading";
import MemberBadge from "./MemberBadge";

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
    description: "Assista a 'Design Premium e Alavancagem de Valor' com Arq. Mayara Costa.",
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
  const [member, setMember] = useState<{ name: string; initials?: string; img?: string; member_type?: 'admin' | 'master' | 'mentor' | null; theme?: string } | null>(null);
  const [loadingMember, setLoadingMember] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Search states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search for members
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("members")
          .select("*")
          .or(`name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,role.ilike.%${searchQuery}%`)
          .limit(5);

        if (data && !error) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Load theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("cls-theme") as "dark" | "light";
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
      document.documentElement.className = savedTheme;
    }
  }, []);

  // Sync theme when member profile is loaded
  useEffect(() => {
    if (member && member.theme) {
      const dbTheme = member.theme as "dark" | "light";
      setTheme(dbTheme);
      localStorage.setItem("cls-theme", dbTheme);
      document.documentElement.setAttribute("data-theme", dbTheme);
      document.documentElement.className = dbTheme;
    }
  }, [member]);

  const toggleTheme = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("cls-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.documentElement.className = nextTheme;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("members")
          .update({ theme: nextTheme })
          .eq("id", user.id);
      }
    } catch (err) {
      console.error("Error updating theme in database:", err);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("members")
            .select("name, initials, img, member_type, theme")
            .eq("id", user.id)
            .single();
          const emailLower = user.email?.toLowerCase();
          const isEmailAdmin = emailLower === "magnorjsantos@hotmail.com" || emailLower === "mayaracosta00@gmail.com";
          if (data && !error) {
            setMember(data);
            if (data.member_type === "admin" || isEmailAdmin) {
              setIsAdmin(true);
            }
          } else {
            if (isEmailAdmin) {
              setIsAdmin(true);
            }
          }

        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      } finally {
        setLoadingMember(false);
      }
    };
    void fetchCurrentUser();
  }, []);

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
    const loadNotifications = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Let's build the query to fetch user's notifications and global notifications (user_id is null)
        let query = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(10);
        if (user) {
          query = query.or(`user_id.eq.${user.id},user_id.is.null`);
        } else {
          query = query.is("user_id", null);
        }

        const { data, error } = await query;
        if (data && !error) {
          const mapped: Notification[] = data.map((n: any) => {
            const date = new Date(n.created_at);
            const now = new Date();
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
            
            let timeStr = "";
            if (diffInMinutes < 60) {
              timeStr = `Há ${diffInMinutes} min`;
            } else if (diffInMinutes < 1440) {
              timeStr = `Há ${Math.floor(diffInMinutes / 60)} horas`;
            } else {
              timeStr = `Há ${Math.floor(diffInMinutes / 1440)} dias`;
            }

            return {
              id: n.id,
              title: n.title,
              description: n.description,
              type: n.type,
              time: timeStr,
              read: n.is_read,
              link: n.link || "#"
            };
          });
          setNotifications(mapped);
        } else {
          setNotifications(initialNotifications);
        }
      } catch (err) {
        setNotifications(initialNotifications);
      }
    };

    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener("cls_notifications_changed", handleUpdate);
    return () => {
      window.removeEventListener("cls_notifications_changed", handleUpdate);
    };
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('notifications').update({ is_read: true }).or(`user_id.eq.${user.id},user_id.is.null`);
      }
      
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    // Actually deleting notifications might be dangerous for global ones, so we just clear them locally or let's not touch DB for clear all
    setNotifications([]);
  };

  const handleNotificationClick = async (item: Notification) => {
    try {
      const supabase = createClient();
      await supabase.from('notifications').update({ is_read: true }).eq('id', item.id);
      
      const updated = notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n));
      setNotifications(updated);
    } catch (err) {
      console.error(err);
    }
    
    setIsOpen(false);
    if (item.link && item.link !== "#") {
      router.push(item.link);
    }
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
        backgroundColor: "var(--topbar-bg)",
        backdropFilter: "blur(20px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 40,
        borderBottom: "1px solid var(--topbar-border)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        {isAdmin && (
          <Link
            href="/admin/painel"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(145, 179, 225, 0.15) 0%, rgba(107, 70, 193, 0.15) 100%)",
              border: "1px solid rgba(145, 179, 225, 0.3)",
              color: "var(--color-secondary)",
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(145, 179, 225, 0.25) 0%, rgba(107, 70, 193, 0.25) 100%)";
              e.currentTarget.style.borderColor = "var(--color-secondary-fixed)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(145, 179, 225, 0.15) 0%, rgba(107, 70, 193, 0.15) 100%)";
              e.currentTarget.style.borderColor = "rgba(145, 179, 225, 0.3)";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--color-secondary)" }}>
              admin_panel_settings
            </span>
            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Painel Adm
            </span>
          </Link>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", zIndex: searchOpen ? 48 : 1 }}>
          {searchOpen && (
            <>
              {/* Transparent backdrop for click-outside to close search */}
              <div
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 1,
                  backgroundColor: "transparent",
                }}
              />
              
              <input
                type="text"
                placeholder="Buscar membros, empresas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="input-dark font-body-sm"
                style={{
                  width: "240px",
                  padding: "8px 32px 8px 36px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  backgroundColor: "var(--search-input-bg)",
                  border: "1px solid var(--search-input-border)",
                  color: "var(--color-on-surface)",
                  transition: "all 0.3s ease",
                  marginRight: "8px",
                  position: "relative",
                  zIndex: 2
                }}
              />

              {/* Passive Search Icon inside input */}
              <span 
                className="material-symbols-outlined" 
                style={{ 
                  position: "absolute", 
                  left: "10px", 
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "18px", 
                  color: "var(--color-outline)",
                  pointerEvents: "none",
                  zIndex: 2
                }}
              >
                search
              </span>

              {/* Close Button inside input */}
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                style={{
                  position: "absolute",
                  right: "18px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                  color: "var(--color-outline)",
                  zIndex: 2,
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-on-surface)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-outline)"}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span>
              </button>
            </>
          )}

          {!searchOpen && (
            <button 
              className="topbar-btn"
              onClick={() => {
                setSearchOpen(true);
              }}
              style={{ 
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
                color: "var(--color-on-surface-variant)"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>search</span>
            </button>
          )}

          {/* Search Dropdown Results */}
          {searchOpen && searchQuery.trim() !== "" && (
            <div
              className="glass-panel"
              style={{
                position: "absolute",
                top: "45px",
                right: 0,
                width: "280px",
                backgroundColor: "var(--dropdown-bg)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--dropdown-border)",
                borderRadius: "8px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                zIndex: 2,
                padding: "8px 0",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              {isSearching ? (
                <div style={{ padding: "12px", textAlign: "center", fontSize: "11px", color: "var(--color-on-surface-variant)" }}>
                  Buscando...
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: "12px", textAlign: "center", fontSize: "11px", color: "var(--color-on-surface-variant)" }}>
                  Nenhum resultado encontrado.
                </div>
              ) : (
                searchResults.map((m: any) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      setSearchOpen(false);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--dropdown-item-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      backgroundColor: "transparent"
                    }}
                  >
                    <MemberBadge
                      name={m.name}
                      img={m.img}
                      initials={m.initials}
                      memberType={m.member_type}
                      size={30}
                    />
                    <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--dropdown-text)" }}>{m.name}</span>
                      <span style={{ fontSize: "10px", color: "var(--color-on-surface-variant)" }}>
                        {m.role} {m.company ? `na ${m.company}` : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

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
                  border: "1px solid var(--dropdown-border)",
                  backgroundColor: "var(--dropdown-bg)",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
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
                    borderBottom: "1px solid var(--border-color)",
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
                        <span style={{ color: "var(--border-color)", fontSize: "10px" }}>|</span>
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
                      let iconBg = "rgba(145, 179, 225, 0.15)";

                      if (item.type === "mentoria") {
                        iconName = "calendar_month";
                        iconColor = "var(--color-secondary)";
                        iconBg = "rgba(145, 179, 225, 0.15)";
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
                            borderBottom: "1px solid var(--border-color)",
                            display: "flex",
                            gap: "12px",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                            backgroundColor: item.read ? "transparent" : "var(--dropdown-item-unread)",
                            position: "relative",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--dropdown-item-hover)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = item.read
                              ? "transparent"
                              : "var(--dropdown-item-unread)";
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
                                  color: item.read ? "var(--color-on-surface-variant)" : "var(--color-on-surface)",
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

        <button
          onClick={toggleTheme}
          className="topbar-btn"
          title={theme === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
            color: "var(--color-on-surface-variant)"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>

        <Link href="/perfil" className="topbar-btn" style={{ padding: "4px", display: "flex", alignItems: "center", textDecoration: "none" }}>
          {loadingMember ? (
            <SkeletonAvatar size="32px" />
          ) : member ? (
            <MemberBadge
              name={member.name}
              img={member.img}
              initials={member.initials}
              memberType={member.member_type}
              size={32}
            />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
              account_circle
            </span>
          )}
        </Link>
      </div>

      {/* Selected Member Profile Card Modal */}
      {selectedMember && (
        <div
          onClick={() => setSelectedMember(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(10, 10, 12, 0.85)",
            backdropFilter: "blur(10px)",
            zIndex: 10002,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              position: "relative",
              width: "90%",
              maxWidth: "400px",
              backgroundColor: "rgba(20, 20, 25, 0.95)",
              border: "1px solid rgba(212, 175, 55, 0.25)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px"
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Profile Avatar */}
            <div style={{ width: "90px", height: "90px", borderRadius: "50%", overflow: "hidden", border: "2px solid var(--color-secondary)", boxShadow: "0 0 15px rgba(212, 175, 55, 0.2)" }}>
              <img src={selectedMember.img || "/magno.jpg"} alt={selectedMember.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* Profile Title */}
            <div>
              <h3 style={{ fontSize: "18px", color: "#ffffff", fontWeight: 700, margin: "0 0 4px 0" }}>{selectedMember.name}</h3>
              {selectedMember.username && (
                <span style={{ fontSize: "12px", color: "var(--color-secondary)", fontWeight: 500 }}>@{selectedMember.username}</span>
              )}
            </div>

            {/* Bio & Details */}
            <div style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 0", display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--color-outline)", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Cargo e Empresa</span>
                <span style={{ fontSize: "12px", color: "#ffffff" }}>{selectedMember.role || "Membro"} {selectedMember.company ? `na ${selectedMember.company}` : ""}</span>
              </div>
              
              {selectedMember.industry && (
                <div>
                  <span style={{ fontSize: "10px", color: "var(--color-outline)", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Indústria</span>
                  <span style={{ fontSize: "12px", color: "#ffffff" }}>{selectedMember.industry}</span>
                </div>
              )}

              {selectedMember.location && (
                <div>
                  <span style={{ fontSize: "10px", color: "var(--color-outline)", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Localização</span>
                  <span style={{ fontSize: "12px", color: "#ffffff" }}>{selectedMember.location}</span>
                </div>
              )}

              {selectedMember.bio && (
                <div>
                  <span style={{ fontSize: "10px", color: "var(--color-outline)", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Bio</span>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", margin: "4px 0 0 0", lineHeight: 1.4, fontStyle: "italic" }}>"{selectedMember.bio}"</p>
                </div>
              )}
            </div>

            {/* Social Icons / Actions */}
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", width: "100%" }}>
              {selectedMember.linkedin_url && (
                <a href={selectedMember.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: "#0077b5", textDecoration: "none" }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
              {selectedMember.instagram_url && (
                <a href={selectedMember.instagram_url} target="_blank" rel="noopener noreferrer" style={{ color: "#e1306c", textDecoration: "none" }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0 3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {selectedMember.email && (
                <a href={`mailto:${selectedMember.email}`} style={{ color: "var(--color-secondary)", textDecoration: "none" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>mail</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
