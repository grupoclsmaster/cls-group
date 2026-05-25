"use client";
import { useState, useEffect } from "react";

interface CalendarEvent {
  id: string;
  year: number;
  month: number; // 0-indexed (4 = Maio, 5 = Junho, 6 = Julho)
  day: number;
  title: string;
  type: "mentoria" | "atualizacao";
  time: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  mentor: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
  };
  topic: string;
  zoomLink: string;
}

const initialEventsList: CalendarEvent[] = [
  {
    id: "e1",
    year: 2026,
    month: 4, // Maio
    day: 4,
    title: "Mentoria de Engenharia & Valuation",
    type: "mentoria",
    time: "14:00 - 15:30 BRT",
    startTime: "14:00",
    endTime: "15:30",
    mentor: {
      name: "Eng. Magno Santos",
      role: "Mentor Sênior",
      avatar: "/magno.jpg",
      bio: "Engenheiro Sênior e especialista em Private Equity com mais de 20 anos de experiência em incorporações imobiliárias e valuation técnico de landbanks."
    },
    topic: "Valuation técnico de ativos físicos de grande porte e mitigação de riscos na compra de terrenos e landbanks corporativos.",
    zoomLink: "https://zoom.us/j/magno-santos-pe"
  },
  {
    id: "e2",
    year: 2026,
    month: 4, // Maio
    day: 13,
    title: "Mentoria de Arquitetura & Design Premium",
    type: "mentoria",
    time: "16:00 - 17:30 BRT",
    startTime: "16:00",
    endTime: "17:30",
    mentor: {
      name: "Arq. Mayara Santos",
      role: "Mentor Sênior",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      bio: "Arquiteta especialista em design conceitual de luxo e formatação de projetos imobiliários sob medida para clientes Ultra-High-Net-Worth."
    },
    topic: "Posicionamento estético como alavanca de valorização e o desenvolvimento conceitual de projetos residenciais e corporativos premium.",
    zoomLink: "https://zoom.us/j/mayara-santos-design"
  },
  {
    id: "e3",
    year: 2026,
    month: 4, // Maio
    day: 24,
    title: "Reunião de Alinhamento: Portfólio Q3",
    type: "atualizacao",
    time: "11:00 - 12:00 BRT",
    startTime: "11:00",
    endTime: "12:00",
    mentor: {
      name: "Alexandre de Morais",
      role: "CEO & Fundador CLS",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      bio: "Managing Director da Holding executiva, focado na expansão de fundos de liquidez e alinhamento estratégico."
    },
    topic: "Atualização de desempenho das oportunidades vigentes de co-investimento e cronograma de saídas planejadas.",
    zoomLink: "https://zoom.us/j/cls-portfolio-q3"
  },
  {
    id: "e4",
    year: 2026,
    month: 4, // Maio
    day: 28,
    title: "Mentoria: Viabilidade de Landbanks",
    type: "mentoria",
    time: "14:00 - 15:30 BRT",
    startTime: "14:00",
    endTime: "15:30",
    mentor: {
      name: "Eng. Magno Santos",
      role: "Mentor Sênior",
      avatar: "/magno.jpg",
      bio: "Engenheiro Sênior e especialista em Private Equity com mais de 20 anos de experiência em incorporações imobiliárias e valuation técnico de landbanks."
    },
    topic: "Análise aprofundada de estudos de viabilidade técnica e legal (EVTL) para novos landbanks.",
    zoomLink: "https://zoom.us/j/magno-santos-pe"
  },
  {
    id: "e5",
    year: 2026,
    month: 5, // Junho
    day: 5,
    title: "Mastermind: Soluções BIM & ConTech",
    type: "mentoria",
    time: "10:00 - 11:30 BRT",
    startTime: "10:00",
    endTime: "11:30",
    mentor: {
      name: "Eng. Magno Santos",
      role: "Mentor Sênior",
      avatar: "/magno.jpg",
      bio: "Engenheiro Sênior e especialista em Private Equity com mais de 20 anos de experiência em incorporações imobiliárias e valuation técnico de landbanks."
    },
    topic: "Discussão em mesa redonda sobre a adoção prática de ferramentas BIM e ConTechs na gestão de suprimentos e obras.",
    zoomLink: "https://zoom.us/j/magno-santos-pe"
  },
  {
    id: "e6",
    year: 2026,
    month: 5, // Junho
    day: 12,
    title: "Networking: Visita à Grande Obra SP",
    type: "atualizacao",
    time: "09:00 - 18:00 BRT",
    startTime: "09:00",
    endTime: "18:00",
    mentor: {
      name: "Arq. Mayara Santos",
      role: "Mentor Sênior",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      bio: "Arquiteta especialista em design conceitual de luxo e formatação de projetos imobiliários sob medida para clientes Ultra-High-Net-Worth."
    },
    topic: "Visita técnica presencial a um grande empreendimento corporativo de alto padrão em São Paulo com foco em compatibilização BIM e acabamentos.",
    zoomLink: "https://zoom.us/j/mayara-santos-design"
  },
  {
    id: "e7",
    year: 2026,
    month: 6, // Julho
    day: 10,
    title: "Mentoria: Estruturação de SPE e SCP",
    type: "mentoria",
    time: "14:00 - 15:30 BRT",
    startTime: "14:00",
    endTime: "15:30",
    mentor: {
      name: "Eng. Magno Santos",
      role: "Mentor Sênior",
      avatar: "/magno.jpg",
      bio: "Engenheiro Sênior e especialista em Private Equity com mais de 20 anos de experiência em incorporações imobiliárias e valuation técnico de landbanks."
    },
    topic: "Estruturação societária e financeira de Sociedades de Propósito Específico (SPE) e Sociedades em Conta de Participação (SCP) para captação de recursos.",
    zoomLink: "https://zoom.us/j/magno-santos-pe"
  },
  {
    id: "e8",
    year: 2026,
    month: 6, // Julho
    day: 22,
    title: "Workshop: Planejamento Lean Construction",
    type: "mentoria",
    time: "16:00 - 17:30 BRT",
    startTime: "16:00",
    endTime: "17:30",
    mentor: {
      name: "Arq. Mayara Santos",
      role: "Mentor Sênior",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      bio: "Arquiteta especialista em design conceitual de luxo e formatação de projetos imobiliários sob medida para clientes Ultra-High-Net-Worth."
    },
    topic: "Implementação da metodologia Lean nos fluxos de projeto arquitetônico e interface direta com o planejamento executivo da obra.",
    zoomLink: "https://zoom.us/j/mayara-santos-design"
  }
];

const monthsList = [
  { name: "Maio 2026", month: 4, year: 2026 },
  { name: "Junho 2026", month: 5, year: 2026 },
  { name: "Julho 2026", month: 6, year: 2026 },
];

export type EventFormData = {
  title: string;
  type: "mentoria" | "atualizacao";
  startTime: string;
  endTime: string;
  mentorName: string;
  topic?: string;
  zoomLink?: string;
};

export default function CalendarioPage() {
  const [activeMonth, setActiveMonth] = useState(monthsList[0]);
  const [selectedDay, setSelectedDay] = useState<number>(4);
  const [activeFilter, setActiveFilter] = useState<"todos" | "mentoria" | "atualizacao">("todos");
  const [viewMode, setViewMode] = useState<"grade" | "lista">("grade");

  // Dynamic state list for events (loaded from localstorage)
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Google Calendar Integration states
  const [isSynced, setIsSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleUser, setGoogleUser] = useState<{ email: string; name: string } | null>(null);
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);
  const [isSyncingEvent, setIsSyncingEvent] = useState(false);

  // New Event form modal states
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartTime, setEventStartTime] = useState("14:00");
  const [eventEndTime, setEventEndTime] = useState("15:30");
  const [eventType, setEventType] = useState<"mentoria" | "atualizacao">("mentoria");
  const [eventMentorName, setEventMentorName] = useState("Eng. Magno Santos");
  const [eventTopic, setEventTopic] = useState("");
  const [eventZoomLink, setEventZoomLink] = useState("https://zoom.us/j/magno-santos-pe");
  const [pendingEventToSync, setPendingEventToSync] = useState<EventFormData | null>(null);

  // Custom toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const year = activeMonth.year;
  const month = activeMonth.month;

  // Calculate days count and starting weekday offset (Sunday = 0, Monday = 1...)
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Load events and google login from localStorage
  useEffect(() => {
    const loadFromStorage = async () => {
      const savedEvents = localStorage.getItem("cls_calendar_events");
      if (savedEvents) {
        try {
          setEvents(JSON.parse(savedEvents));
        } catch (e) {
          setEvents(initialEventsList);
        }
      } else {
        setEvents(initialEventsList);
        localStorage.setItem("cls_calendar_events", JSON.stringify(initialEventsList));
      }

      const savedUser = localStorage.getItem("cls_google_user");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setGoogleUser(user);
          setIsSynced(true);
        } catch (e) {
          // Safe clear
        }
      }
    };

    void loadFromStorage();
  }, []);

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem("cls_calendar_events", JSON.stringify(newEvents));
  };

  // Selected event based on the selected day and active month
  const selectedEvent = events.find(
    e => e.year === year && e.month === month && e.day === selectedDay
  );

  // Month change logic with self-selecting appropriate event or first day
  const handleMonthChange = (direction: "prev" | "next") => {
    const currentIdx = monthsList.findIndex(m => m.month === month);
    let nextIdx = currentIdx;
    if (direction === "prev" && currentIdx > 0) {
      nextIdx = currentIdx - 1;
    } else if (direction === "next" && currentIdx < monthsList.length - 1) {
      nextIdx = currentIdx + 1;
    }

    if (nextIdx !== currentIdx) {
      const newMonth = monthsList[nextIdx];
      setActiveMonth(newMonth);

      // Select first day of new month with an event, otherwise default to day 1
      const firstEvent = events.find(e => e.month === newMonth.month && e.year === newMonth.year);
      if (firstEvent) {
        setSelectedDay(firstEvent.day);
      } else {
        setSelectedDay(1);
      }
    }
  };

  // Google Sync OAuth Trigger simulation
  const handleGoogleSync = () => {
    if (isSynced) {
      // Disconnect
      setGoogleUser(null);
      setIsSynced(false);
      localStorage.removeItem("cls_google_user");
      showToast("Agenda Google desconectada.", "success");
    } else {
      setShowGoogleLogin(true);
    }
  };

  const handleGoogleLogin = (email: string, name: string) => {
    setIsSyncing(true);
    setShowGoogleLogin(false);
    setTimeout(() => {
      const user = { email, name };
      setGoogleUser(user);
      setIsSynced(true);
      localStorage.setItem("cls_google_user", JSON.stringify(user));
      setIsSyncing(false);
      showToast(`Conectado com sucesso como ${email}!`, "success");

      // Check if there was an event creation pending this login
      if (pendingEventToSync) {
        triggerEventCreation(pendingEventToSync, user);
      }
    }, 1200);
  };

  // Generates dynamic Google Calendar Add Link
  const getGoogleCalendarUrl = (event: CalendarEvent) => {
    const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const pad = (num: number) => String(num).padStart(2, "0");

    const monthStr = pad(event.month + 1);
    const dayStr = pad(event.day);
    const startHrs = event.startTime.split(":")[0];
    const startMins = event.startTime.split(":")[1];
    const endHrs = event.endTime.split(":")[0];
    const endMins = event.endTime.split(":")[1];

    const startStr = `${event.year}${monthStr}${dayStr}T${startHrs}${startMins}00`;
    const endStr = `${event.year}${monthStr}${dayStr}T${endHrs}${endMins}00`;

    const text = encodeURIComponent(event.title);
    const dates = `${startStr}/${endStr}`;
    const details = encodeURIComponent(
      `Tópico: ${event.topic}\n\nMentor: ${event.mentor.name} (${event.mentor.role})\n\nLink do Zoom: ${event.zoomLink}`
    );
    const location = encodeURIComponent(event.zoomLink);
    const ctz = "America/Sao_Paulo";

    return `${base}&text=${text}&dates=${dates}&details=${details}&location=${location}&ctz=${ctz}`;
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenCreateModal = (day: number) => {
    setSelectedDay(day);
    setEventTitle("");
    setEventTopic("");
    setEventZoomLink("https://zoom.us/j/magno-santos-pe");
    setEventStartTime("14:00");
    setEventEndTime("15:30");
    setEventType("mentoria");
    setEventMentorName("Eng. Magno Santos");
    setShowCreateEventModal(true);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      showToast("Por favor, preencha o título do evento.", "error");
      return;
    }

    const eventData = {
      title: eventTitle,
      type: eventType,
      startTime: eventStartTime,
      endTime: eventEndTime,
      mentorName: eventMentorName,
      topic: eventTopic,
      zoomLink: eventZoomLink,
    };

    // If Google Calendar is not synced yet, prompt login first
    if (!isSynced) {
      setPendingEventToSync(eventData);
      showToast("Por favor, integre sua conta do Google para sincronizar o evento.", "error");
      setShowGoogleLogin(true);
      return;
    }

    triggerEventCreation(eventData, googleUser!);
  };



  const triggerEventCreation = (eventData: EventFormData, user: { email: string; name: string }) => {
    setIsSyncingEvent(true);

    setTimeout(() => {
      const newEvent: CalendarEvent = {
        id: `e-${Date.now()}`,
        year: year,
        month: month,
        day: selectedDay,
        title: eventData.title,
        type: eventData.type,
        time: `${eventData.startTime} - ${eventData.endTime} BRT`,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        mentor: {
          name: eventData.mentorName,
          role: eventData.mentorName === "Alexandre de Morais" ? "CEO & Fundador CLS" : "Mentor Sênior",
          avatar: eventData.mentorName === "Eng. Magno Santos"
            ? "/magno.jpg"
            : eventData.mentorName === "Arq. Mayara Santos"
              ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
              : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
          bio: eventData.mentorName === "Eng. Magno Santos"
            ? "Engenheiro Sênior e especialista em Private Equity com mais de 20 anos de experiência em incorporações imobiliárias e valuation técnico de landbanks."
            : eventData.mentorName === "Arq. Mayara Santos"
              ? "Arquiteta especialista em design conceitual de luxo e formatação de projetos imobiliários sob medida para clientes Ultra-High-Net-Worth."
              : "Managing Director da Holding executiva, focado na expansão de fundos de liquidez e alinhamento estratégico.",
        },
        topic: eventData.topic || "Nenhum tópico fornecido.",
        zoomLink: eventData.zoomLink || "https://zoom.us/j/default",
      };

      const updated = [...events, newEvent];
      saveEvents(updated);

      // Save notification to cls_notifications
      try {
        const savedNotifs = localStorage.getItem("cls_notifications");
        let notificationsList = [];
        if (savedNotifs) {
          notificationsList = JSON.parse(savedNotifs);
        } else {
          notificationsList = [
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
        }

        const newNotification = {
          id: `notif-${Date.now()}`,
          title: newEvent.type === "mentoria" ? "Nova Mentoria Criada" : "Nova Atualização Criada",
          description: `${newEvent.title} com ${newEvent.mentor.name} em ${newEvent.day}/${newEvent.month + 1} às ${newEvent.startTime}.`,
          type: newEvent.type === "atualizacao" ? "mentoria" : newEvent.type,
          time: "Agora mesmo",
          read: false,
          link: "/calendario",
        };

        const updatedNotifs = [newNotification, ...notificationsList];
        localStorage.setItem("cls_notifications", JSON.stringify(updatedNotifs));
        window.dispatchEvent(new Event("cls_notifications_changed"));
      } catch (err) {
        console.error("Erro ao salvar notificação:", err);
      }

      setIsSyncingEvent(false);
      setShowCreateEventModal(false);
      setPendingEventToSync(null);

      showToast("Evento criado e sincronizado com o Google Calendar!", "success");

      // Auto-open Google Calendar Template in new tab to add it to the user's real Google Calendar
      const googleCalUrl = getGoogleCalendarUrl(newEvent);
      window.open(googleCalUrl, "_blank");
    }, 1500);
  };

  const renderDays = () => {
    const cells = [];

    // 1. Calculate previous month details
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthLastDate = new Date(prevYear, prevMonth + 1, 0).getDate();

    // Trailing days from previous month (styled as inactive)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevDay = prevMonthLastDate - i;
      cells.push(
        <div
          key={`prev-${prevDay}`}
          style={{
            minHeight: "120px",
            padding: "12px",
            backgroundColor: "var(--color-surface-dim)",
            border: "1px solid rgba(255, 255, 255, 0.02)",
            opacity: 0.3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            cursor: "not-allowed",
          }}
        >
          <span style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", fontWeight: 500 }}>
            {prevDay}
          </span>
        </div>
      );
    }

    // 2. Active days of current month
    for (let day = 1; day <= totalDays; day++) {
      const dayEvents = events.filter(
        e => e.year === year && e.month === month && e.day === day
      );

      const filteredDayEvents = dayEvents.filter(
        e => activeFilter === "todos" || e.type === activeFilter
      );

      const hasEvents = filteredDayEvents.length > 0;
      const isSelected = selectedDay === day;

      cells.push(
        <div
          key={`day-${day}`}
          onClick={() => setSelectedDay(day)}
          className={`card-hover`}
          style={{
            minHeight: "120px",
            padding: "12px",
            backgroundColor: isSelected ? "rgba(237, 192, 102, 0.06)" : "var(--color-surface)",
            border: isSelected
              ? "1px solid var(--color-secondary)"
              : "1px solid rgba(255, 255, 255, 0.05)",
            cursor: "pointer",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            transition: "all 0.2s ease",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? "var(--color-secondary)" : "var(--color-on-surface)",
              fontSize: "14px",
              alignSelf: "flex-start",
              marginBottom: "8px",
            }}
          >
            {day}
          </span>

          {hasEvents && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
              {filteredDayEvents.map((e, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "3px 6px",
                    borderRadius: "2px",
                    fontSize: "9px",
                    fontWeight: 600,
                    backgroundColor: e.type === "mentoria" ? "rgba(237, 192, 102, 0.15)" : "rgba(194, 194, 245, 0.15)",
                    color: e.type === "mentoria" ? "var(--color-secondary)" : "var(--color-primary)",
                    border: e.type === "mentoria" ? "1px solid rgba(237, 192, 102, 0.25)" : "1px solid rgba(194, 194, 245, 0.25)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                  }}
                  title={e.title}
                >
                  {e.title}
                </div>
              ))}
            </div>
          )}

          {isSelected && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "1.5px solid var(--color-secondary)",
                pointerEvents: "none",
                borderRadius: "2px",
              }}
            />
          )}
        </div>
      );
    }

    // 3. Leading days from next month to complete the last row
    const totalRendered = firstDayOfWeek + totalDays;
    const remainingToSeven = 7 - (totalRendered % 7);
    const padCount = remainingToSeven === 7 ? 0 : remainingToSeven;

    for (let day = 1; day <= padCount; day++) {
      cells.push(
        <div
          key={`next-${day}`}
          style={{
            minHeight: "120px",
            padding: "12px",
            backgroundColor: "var(--color-surface-dim)",
            border: "1px solid rgba(255, 255, 255, 0.02)",
            opacity: 0.3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            cursor: "not-allowed",
          }}
        >
          <span style={{ fontSize: "14px", color: "var(--color-on-surface-variant)", fontWeight: 500 }}>
            {day}
          </span>
        </div>
      );
    }

    return cells;
  };

  const renderListView = () => {
    const monthEvents = events.filter(
      e => e.year === year && e.month === month && (activeFilter === "todos" || e.type === activeFilter)
    ).sort((a, b) => a.day - b.day);

    if (monthEvents.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--color-on-surface-variant)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>calendar_today</span>
          <p className="font-body-lg">Nenhum evento agendado para este mês com o filtro ativo.</p>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {monthEvents.map((e) => {
          const isSelected = selectedDay === e.day;
          return (
            <div
              key={e.id}
              onClick={() => setSelectedDay(e.day)}
              className="glass-panel card-hover"
              style={{
                borderRadius: "4px",
                padding: "16px",
                cursor: "pointer",
                border: isSelected ? "1px solid var(--color-secondary)" : "1px solid rgba(255,255,255,0.05)",
                backgroundColor: isSelected ? "rgba(237, 192, 102, 0.04)" : "var(--color-surface)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    backgroundColor: "var(--color-surface-container)",
                    borderRadius: "2px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    flexShrink: 0,
                  }}
                >
                  <span className="font-label-caps" style={{ fontSize: "8px", color: "var(--color-on-surface-variant)" }}>
                    {activeMonth.name.split(" ")[0].slice(0, 3)}
                  </span>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-secondary)" }}>
                    {e.day}
                  </span>
                </div>
                <div>
                  <span
                    className="font-label-caps"
                    style={{
                      fontSize: "8px",
                      padding: "2px 6px",
                      borderRadius: "2px",
                      backgroundColor: e.type === "mentoria" ? "rgba(237, 192, 102, 0.1)" : "rgba(194, 194, 245, 0.1)",
                      color: e.type === "mentoria" ? "var(--color-secondary)" : "var(--color-primary)",
                      border: e.type === "mentoria" ? "1px solid rgba(237, 192, 102, 0.15)" : "1px solid rgba(194, 194, 245, 0.15)",
                      marginBottom: "4px",
                      display: "inline-block",
                    }}
                  >
                    {e.type === "mentoria" ? "Mentoria" : "Atualização"}
                  </span>
                  <h4 className="font-title-lg" style={{ color: "var(--color-on-surface)", margin: 0, fontSize: "16px" }}>
                    {e.title}
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", margin: "2px 0 0" }}>
                    {e.time} • com {e.mentor.name}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined" style={{ color: "var(--color-on-surface-variant)", fontSize: "20px" }}>chevron_right</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
      {/* Dynamic Header & Google Calendar Integration Status */}
      <section style={{ marginBottom: "28px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
        <div>
          <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "4px" }}>
            Calendário de Mentorias
          </h2>
          <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
            Fuso Horário: Brasília (GMT-3). Agende suas mentorias e adicione-as ao seu dia a dia.
          </p>
        </div>

        {/* Integration Sync Control panel */}
        <div
          className="glass-panel metallic-edge"
          style={{
            padding: "12px 20px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            backgroundColor: "rgba(7, 7, 50, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ color: isSynced ? "#a3e635" : "var(--color-on-surface-variant)", fontSize: "24px" }}>
              {isSynced ? "sync" : "calendar_month"}
            </span>
            <div>
              <p className="font-label-caps" style={{ fontSize: "9px", color: "var(--color-on-surface-variant)", margin: 0 }}>Google Calendar</p>
              <p style={{ fontSize: "11px", color: isSynced ? "#a3e635" : "var(--color-outline)", fontWeight: 600, margin: 0 }}>
                {isSynced ? `Conectado: ${googleUser?.email || "Sim"}` : "Não integrado"}
              </p>
            </div>
          </div>

          <button
            onClick={handleGoogleSync}
            disabled={isSyncing}
            className="btn-primary"
            style={{
              padding: "8px 16px",
              fontSize: "10px",
              backgroundColor: isSynced ? "rgba(237, 192, 102, 0.1)" : "var(--color-secondary)",
              color: isSynced ? "var(--color-secondary)" : "var(--color-on-secondary)",
              border: isSynced ? "1px solid rgba(237, 192, 102, 0.2)" : "none",
              cursor: "pointer",
            }}
          >
            {isSyncing ? (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: "14px" }}>autorenew</span>
                Conectando...
              </div>
            ) : isSynced ? (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>power_settings_new</span>
                Desconectar
              </div>
            ) : (
              "Sincronizar Agenda"
            )}
          </button>
        </div>
      </section>

      {/* Filters, View Toggle and Month Switchers */}
      <section style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        {/* Type filters */}
        <div className="glass-panel" style={{ padding: "4px", borderRadius: "4px", display: "flex", gap: "4px" }}>
          {[
            { id: "todos", label: "Todos os eventos" },
            { id: "mentoria", label: "Mentorias" },
            { id: "atualizacao", label: "Atualizações" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id as "todos" | "mentoria" | "atualizacao")}
              className="font-label-caps"
              style={{
                padding: "8px 16px",
                borderRadius: "2px",
                border: "none",
                backgroundColor: activeFilter === item.id ? "rgba(255, 255, 255, 0.08)" : "transparent",
                color: activeFilter === item.id ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                fontSize: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* View mode toggle & Month switches */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Grade/Lista toggle */}
          <div className="glass-panel" style={{ padding: "4px", borderRadius: "4px", display: "flex", gap: "4px" }}>
            <button
              onClick={() => setViewMode("grade")}
              className="topbar-btn"
              style={{
                borderRadius: "2px",
                backgroundColor: viewMode === "grade" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                color: viewMode === "grade" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                padding: "6px 12px",
              }}
              title="Visualizar em Grade"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>grid_on</span>
            </button>
            <button
              onClick={() => setViewMode("lista")}
              className="topbar-btn"
              style={{
                borderRadius: "2px",
                backgroundColor: viewMode === "lista" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                color: viewMode === "lista" ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                padding: "6px 12px",
              }}
              title="Visualizar em Lista"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>format_list_bulleted</span>
            </button>
          </div>

          {/* Month switch buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              onClick={() => handleMonthChange("prev")}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "transparent",
                color: "var(--color-on-surface-variant)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              className="hover-gold-text"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_left</span>
            </button>
            <span className="font-title-lg" style={{ minWidth: "110px", textAlign: "center", color: "var(--color-on-surface)" }}>
              {activeMonth.name}
            </span>
            <button
              onClick={() => handleMonthChange("next")}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "transparent",
                color: "var(--color-on-surface-variant)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              className="hover-gold-text"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid and Details Panel layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 1.3fr", gap: "24px" }} className="hide-sidebar-at-900">
          
          {/* Main display (Calendar Grid or List View) */}
          <div>
            {viewMode === "grade" ? (
              <div className="glass-panel" style={{ borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                {/* Weekdays names */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.01)" }}>
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                    <div key={d} style={{ padding: "12px", textAlign: "center", color: "var(--color-on-surface-variant)", fontSize: "11px", fontWeight: 700 }} className="font-label-caps">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days Grid cells */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                  {renderDays()}
                </div>
              </div>
            ) : (
              renderListView()
            )}
          </div>

          {/* Right sidebar for event details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Event selected detailed card */}
            <div className="glass-panel" style={{ borderRadius: "4px", padding: "24px", border: "1px solid rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", backgroundColor: "rgba(237,192,102,0.03)", borderRadius: "50%", filter: "blur(20px)" }} />

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: selectedEvent ? (selectedEvent.type === "mentoria" ? "var(--color-secondary)" : "var(--color-primary)") : "var(--color-outline)" }} />
                <span className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", fontSize: "9px" }}>
                  Dia {selectedDay} de {activeMonth.name.split(" ")[0]}
                </span>
              </div>

              {selectedEvent ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <span
                      className="font-label-caps"
                      style={{
                        fontSize: "8px",
                        padding: "2px 6px",
                        borderRadius: "2px",
                        backgroundColor: selectedEvent.type === "mentoria" ? "rgba(237, 192, 102, 0.1)" : "rgba(194, 194, 245, 0.1)",
                        color: selectedEvent.type === "mentoria" ? "var(--color-secondary)" : "var(--color-primary)",
                        border: selectedEvent.type === "mentoria" ? "1px solid rgba(237, 192, 102, 0.15)" : "1px solid rgba(194, 194, 245, 0.15)",
                        marginBottom: "8px",
                        display: "inline-block",
                      }}
                    >
                      {selectedEvent.type === "mentoria" ? "Mentoria" : "Atualização"}
                    </span>
                    <h4 className="font-headline-sm" style={{ fontSize: "20px", color: "var(--color-on-surface)", marginBottom: "4px" }}>
                      {selectedEvent.title}
                    </h4>
                    <span style={{ fontSize: "12px", color: "var(--color-secondary)", fontWeight: 600 }}>
                      {selectedEvent.time}
                    </span>
                  </div>

                  {/* Mentor profile section */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
                    <p style={{ color: "var(--color-outline)", fontSize: "9px", marginBottom: "8px" }} className="font-label-caps">Mentor Responsável</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(237,192,102,0.3)", flexShrink: 0 }}>
                        <img src={selectedEvent.mentor.avatar} alt={selectedEvent.mentor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div>
                        <h5 style={{ fontWeight: 600, color: "var(--color-on-surface)", fontSize: "13px" }}>{selectedEvent.mentor.name}</h5>
                        <p style={{ fontSize: "10px", color: "var(--color-on-surface-variant)" }}>{selectedEvent.mentor.role}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", lineHeight: "1.5" }}>
                      {selectedEvent.mentor.bio}
                    </p>
                  </div>

                  {/* Topic description */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
                    <p style={{ color: "var(--color-outline)", fontSize: "9px", marginBottom: "4px" }} className="font-label-caps">Tópico da Reunião</p>
                    <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", lineHeight: "1.5" }}>
                      {selectedEvent.topic}
                    </p>
                  </div>

                  {/* Action buttons (Zoom Link and Google Calendar Export link) */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <a
                      href={selectedEvent.zoomLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ textDecoration: "none", width: "100%", fontSize: "10px", padding: "12px" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>videocam</span>
                      ENTRAR NO ZOOM
                    </a>

                    <a
                      href={getGoogleCalendarUrl(selectedEvent)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                      style={{
                        textDecoration: "none",
                        width: "100%",
                        fontSize: "10px",
                        padding: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>event</span>
                      EXPORTAR PARA GOOGLE AGENDA
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-on-surface-variant)", fontSize: "13px" }}>
                  <p style={{ marginBottom: "16px", lineHeight: "1.5" }}>Nenhum evento agendado para este dia.</p>
                  <button
                    onClick={() => handleOpenCreateModal(selectedDay)}
                    className="btn-primary"
                    style={{ margin: "0 auto", fontSize: "10px", padding: "10px 16px" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add_circle</span>
                    CRIAR EVENTO
                  </button>
                </div>
              )}
            </div>

            {/* Quick Rules */}
            <div className="glass-panel" style={{ borderRadius: "4px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <h4 className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", marginBottom: "12px", fontSize: "10px" }}>
                REQUISITOS
              </h4>
              <ul style={{ color: "var(--color-on-surface-variant)", fontSize: "11px", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "8px", lineHeight: "1.5" }}>
                <li>Mantenha sua câmera ligada durante as discussões de mentoria.</li>
                <li>As gravações estarão na biblioteca de Masterclasses em até 24 horas.</li>
                <li>Dúvidas específicas podem ser enviadas por e-mail antes do início da sessão.</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Google Login popup Modal */}
      {showGoogleLogin && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            width: "440px",
            backgroundColor: "#ffffff",
            color: "#202124",
            borderRadius: "8px",
            padding: "36px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}>
            {/* Google Logo */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <svg width="74" height="24" viewBox="0 0 74 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.904 0-8.907-4.003-8.907-8.907s4.003-8.907 8.907-8.907c2.203 0 4.256.819 5.845 2.408l3.056-3.056C18.17 1.83 15.347.8 12.24.8 5.67.8.3 6.17.3 12.74s5.37 11.94 11.94 11.94c6.858 0 11.398-4.819 11.398-11.59 0-.78-.07-1.53-.2-2.26H12.24z" fill="#4285F4"/>
                <path d="M35.632 12.74c0 3.759-2.908 6.47-6.52 6.47s-6.52-2.711-6.52-6.47c0-3.79 2.908-6.47 6.52-6.47s6.52 2.68 6.52 6.47zm-4.32 0c0-2.31-1.636-3.88-2.2-3.88s-2.2 1.57-2.2 3.88c0 2.278 1.636 3.88 2.2 3.88s2.2-1.602 2.2-3.88z" fill="#EA4335"/>
                <path d="M49.632 12.74c0 3.759-2.908 6.47-6.52 6.47s-6.52-2.711-6.52-6.47c0-3.79 2.908-6.47 6.52-6.47s6.52 2.68 6.52 6.47zm-4.32 0c0-2.31-1.636-3.88-2.2-3.88s-2.2 1.57-2.2 3.88c0 2.278 1.636 3.88 2.2 3.88s2.2-1.602 2.2-3.88z" fill="#FBBC05"/>
                <path d="M63.13 6.84v16.03c0 6.583-4.225 9.278-8.91 9.278-4.52 0-7.25-3.023-8.29-5.553l3.778-1.57c.677 1.616 2.342 3.523 4.512 3.523 2.94 0 4.772-1.822 4.772-5.234v-1.282h-.15c-.9 1.106-2.632 2.062-4.819 2.062-4.524 0-8.62-3.938-8.62-8.835 0-4.94 4.096-8.907 8.62-8.907 2.187 0 3.919.957 4.819 2.034h.15V6.84h4.13zm-3.957 5.96c0-2.278-1.602-3.88-2.188-3.88s-2.221 1.602-2.221 3.88c0 2.247 1.635 3.847 2.221 3.847s2.188-1.6 2.188-3.847z" fill="#4285F4"/>
                <path d="M67.33.8v22.74H64V.8h3.33z" fill="#34A853"/>
                <path d="M72.33 14.88l1.378.92c-.93 1.383-3.153 3.799-6.9 3.799-4.636 0-8.13-3.623-8.13-8.865 0-5.52 3.524-8.907 7.72-8.907 4.256 0 6.33 3.483 7.02 5.56l.462 1.157-11.455 4.743c.877 1.733 2.242 2.61 4.201 2.61 1.959 0 3.292-.967 4.704-3.017zm-6.242-2.348l6.815-2.82c-.37-.923-1.464-1.579-2.695-1.579-1.58 0-2.89 1.4-3.12 4.4z" fill="#EA4335"/>
              </svg>
            </div>

            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <h3 style={{ fontSize: "22px", fontWeight: 500, color: "#202124", margin: "0 0 8px" }}>Escolha uma conta</h3>
              <p style={{ fontSize: "14px", color: "#5f6368", margin: 0 }}>para continuar no app CLUB PRO CLS</p>
            </div>

            {/* List of Simulated Google Accounts */}
            <div style={{ display: "flex", flexDirection: "column", border: "1px solid #dadce0", borderRadius: "8px", overflow: "hidden", marginBottom: "28px" }}>
              <button
                onClick={() => handleGoogleLogin("magno.santos.pe@gmail.com", "Eng. Magno Santos")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  backgroundColor: "#ffffff",
                  border: "none",
                  borderBottom: "1px solid #dadce0",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  outline: "none",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
              >
                <img src="/magno.jpg" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} alt="Avatar" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#3c4043" }}>Eng. Magno Santos</div>
                  <div style={{ fontSize: "12px", color: "#5f6368" }}>magno.santos.pe@gmail.com</div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#5f6368" }}>chevron_right</span>
              </button>

              <button
                onClick={() => handleGoogleLogin("membro.pro@gmail.com", "Membro Executivo")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 16px",
                  backgroundColor: "#ffffff",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  outline: "none",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ffffff"}
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-on-secondary)",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}>
                  M
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#3c4043" }}>Membro Executivo</div>
                  <div style={{ fontSize: "12px", color: "#5f6368" }}>membro.pro@gmail.com</div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#5f6368" }}>chevron_right</span>
              </button>
            </div>

            {/* Permission Consent text */}
            <p style={{ fontSize: "11px", color: "#5f6368", lineHeight: "1.5", marginBottom: "24px", textAlign: "center" }}>
              Para prosseguir, o Google compartilhará seu nome, endereço de e-mail e foto do perfil com o **CLUB PRO CLS**. O app terá permissão para ler, adicionar e alterar eventos na sua agenda do **Google Calendar**.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowGoogleLogin(false);
                  setPendingEventToSync(null);
                }}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  color: "#1a73e8",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(26, 115, 232, 0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Creation Modal */}
      {showCreateEventModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9990,
        }}>
          <form
            onSubmit={handleCreateEvent}
            className="glass-panel"
            style={{
              width: "480px",
              padding: "32px",
              borderRadius: "4px",
              border: "1px solid rgba(237, 192, 102, 0.2)",
              backgroundColor: "rgba(19, 19, 22, 0.95)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "20px" }}>event_available</span>
                <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "10px" }}>Criar Novo Evento</span>
              </div>
              <h3 className="font-title-lg" style={{ color: "#ffffff", margin: 0 }}>
                Dia {selectedDay} de {activeMonth.name}
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Título do Evento</label>
              <input
                type="text"
                required
                className="input-dark"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Ex: Mentoria de Orçamentação e BDI Lean"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Tipo</label>
                <select
                  className="input-dark"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as "mentoria" | "atualizacao")}
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  <option value="mentoria" style={{ backgroundColor: "#131316" }}>Mentoria</option>
                  <option value="atualizacao" style={{ backgroundColor: "#131316" }}>Atualização</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Mentor</label>
                <select
                  className="input-dark"
                  value={eventMentorName}
                  onChange={(e) => setEventMentorName(e.target.value)}
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  <option value="Eng. Magno Santos" style={{ backgroundColor: "#131316" }}>Eng. Magno Santos</option>
                  <option value="Arq. Mayara Santos" style={{ backgroundColor: "#131316" }}>Arq. Mayara Santos</option>
                  <option value="Alexandre de Morais" style={{ backgroundColor: "#131316" }}>Alexandre de Morais</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Hora de Início</label>
                <input
                  type="time"
                  required
                  className="input-dark"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Hora de Término</label>
                <input
                  type="time"
                  required
                  className="input-dark"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Link do Zoom</label>
              <input
                type="url"
                required
                className="input-dark"
                value={eventZoomLink}
                onChange={(e) => setEventZoomLink(e.target.value)}
                placeholder="https://zoom.us/j/..."
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Tópico / Descrição</label>
              <textarea
                className="input-dark"
                rows={3}
                value={eventTopic}
                onChange={(e) => setEventTopic(e.target.value)}
                placeholder="Pauta ou resumo das principais discussões da sessão..."
                style={{ resize: "none" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => setShowCreateEventModal(false)}
                className="btn-outline"
                style={{ flex: 1, padding: "12px", fontSize: "10px" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1.5, padding: "12px", fontSize: "10px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>sync</span>
                Criar e Sincronizar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sync loader Overlay */}
      {isSyncingEvent && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(4px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          gap: "16px",
        }}>
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: "48px", color: "var(--color-secondary)" }}>
            sync
          </span>
          <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600 }} className="font-label-caps">
            Sincronizando evento com Google Calendar...
          </p>
        </div>
      )}

      {/* Toast alert */}
      {toast && (
        <div
          className="glass-panel"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "16px 24px",
            borderRadius: "4px",
            border: toast.type === "success" ? "1px solid #a3e635" : "1px solid var(--color-error)",
            backgroundColor: "rgba(19, 19, 22, 0.95)",
            color: toast.type === "success" ? "#a3e635" : "var(--color-error)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 600,
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
        </div>
      )}

      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
