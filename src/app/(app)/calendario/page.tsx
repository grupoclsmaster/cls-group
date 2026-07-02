"use client";
import { useState, useEffect } from "react";
import { SkeletonCalendario } from "@/components/SkeletonLoading";
import { createClient } from "@/utils/supabase/client";

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

const initialEventsList: CalendarEvent[] = [];

const monthsList = [
  { name: "Janeiro 2026", month: 0, year: 2026 },
  { name: "Fevereiro 2026", month: 1, year: 2026 },
  { name: "Março 2026", month: 2, year: 2026 },
  { name: "Abril 2026", month: 3, year: 2026 },
  { name: "Maio 2026", month: 4, year: 2026 },
  { name: "Junho 2026", month: 5, year: 2026 },
  { name: "Julho 2026", month: 6, year: 2026 },
  { name: "Agosto 2026", month: 7, year: 2026 },
  { name: "Setembro 2026", month: 8, year: 2026 },
  { name: "Outubro 2026", month: 9, year: 2026 },
  { name: "Novembro 2026", month: 10, year: 2026 },
  { name: "Dezembro 2026", month: 11, year: 2026 },
  { name: "Janeiro 2027", month: 0, year: 2027 },
  { name: "Fevereiro 2027", month: 1, year: 2027 },
  { name: "Março 2027", month: 2, year: 2027 },
  { name: "Abril 2027", month: 3, year: 2027 },
  { name: "Maio 2027", month: 4, year: 2027 },
  { name: "Junho 2027", month: 5, year: 2027 },
  { name: "Julho 2027", month: 6, year: 2027 },
  { name: "Agosto 2027", month: 7, year: 2027 },
  { name: "Setembro 2027", month: 8, year: 2027 },
  { name: "Outubro 2027", month: 9, year: 2027 },
  { name: "Novembro 2027", month: 10, year: 2027 },
  { name: "Dezembro 2027", month: 11, year: 2027 },
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
  const [activeMonth, setActiveMonth] = useState(monthsList[5]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<"todos" | "mentoria" | "atualizacao">("todos");
  const [viewMode, setViewMode] = useState<"grade" | "lista">("grade");
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string>("master"); // default to master

  // Detect mobile device
  const [isMobile, setIsMobile] = useState(false);
  // Bottom sheet control for mobile view event detail
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const [eventZoomLink, setEventZoomLink] = useState("https://teams.microsoft.com/");
  const [eventLinkType, setEventLinkType] = useState<"teams" | "presencial" | "zoom" | "meet" | "other">("teams");
  const [pendingEventToSync, setPendingEventToSync] = useState<EventFormData | null>(null);

  // Bulk Import CSV states
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedEvents, setParsedEvents] = useState<any[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importError, setImportError] = useState("");

  const downloadCSVTemplate = () => {
    const headers = [
      "title",
      "type",
      "date",
      "start_time",
      "end_time",
      "mentor_name",
      "mentor_role",
      "topic",
      "zoom_link"
    ];
    const rows = [
      [
        "Mentoria de Planejamento Estrategico",
        "mentoria",
        "2026-06-20",
        "19:00",
        "20:30",
        "Eng. Magno Santos",
        "Mentor Senior",
        "Discussao sobre cronograma e fluxo de caixa de obras de grande porte.",
        "https://zoom.us/j/magno-santos-pe"
      ],
      [
        "Novidades do CLS Community v2",
        "atualizacao",
        "2026-06-25",
        "15:00",
        "16:00",
        "Eng. Magno Santos",
        "Mentor Senior",
        "Apresentacao das novas funcionalidades e do ecossistema atualizado.",
        "https://meet.google.com/abc-defg-hij"
      ]
    ];
    
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_eventos_calendario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportError("");
    setParsedEvents([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("O arquivo esta vazio.");

        const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length <= 1) {
          throw new Error("O arquivo nao contem linhas de dados alem do cabecalho.");
        }

        const headers = lines[0].split(",").map(h => h.replace(/^["']|["']$/g, "").trim().toLowerCase());
        const requiredHeaders = ["title", "type", "date", "start_time", "end_time", "mentor_name"];
        const missing = requiredHeaders.filter(req => !headers.includes(req));
        
        if (missing.length > 0) {
          throw new Error(`Colunas obrigatorias ausentes no cabecalho: ${missing.join(", ")}`);
        }

        const eventsList: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          
          // Basic CSV parsing for double quotes/comma separated values
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
          const values = matches.map(val => val.replace(/^["']|["']$/g, "").replace(/""/g, '"').trim());

          if (values.length < headers.length) continue;

          const rowData: any = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index] || "";
          });

          // Validate fields
          if (!rowData.title) throw new Error(`Linha ${i}: O titulo e obrigatorio.`);
          if (rowData.type !== "mentoria" && rowData.type !== "atualizacao") {
            throw new Error(`Linha ${i}: O tipo deve ser 'mentoria' ou 'atualizacao'.`);
          }
          if (!/^\d{4}-\d{2}-\d{2}$/.test(rowData.date)) {
            throw new Error(`Linha ${i}: A data deve estar no formato AAAA-MM-DD.`);
          }
          if (!/^\d{2}:\d{2}$/.test(rowData.start_time) || !/^\d{2}:\d{2}$/.test(rowData.end_time)) {
            throw new Error(`Linha ${i}: O horario de inicio e termino devem estar no formato HH:MM.`);
          }

          eventsList.push({
            title: rowData.title,
            event_type: rowData.type,
            event_date: rowData.date,
            start_time: rowData.start_time,
            end_time: rowData.end_time,
            mentor_name: rowData.mentor_name,
            mentor_role: rowData.mentor_role || "Mentor CLS",
            mentor_avatar: "/magno.jpg",
            mentor_bio: rowData.topic || "Sessao de mentoria/atualizacao.",
            topic: rowData.topic || "",
            zoom_link: rowData.zoom_link || "https://zoom.us"
          });
        }

        if (eventsList.length === 0) {
          throw new Error("Nenhum evento valido foi encontrado no arquivo.");
        }

        setParsedEvents(eventsList);
      } catch (err: any) {
        setImportError(err.message);
      }
    };
    reader.onerror = () => {
      setImportError("Erro ao ler o arquivo CSV.");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleBulkImportSubmit = async () => {
    if (parsedEvents.length === 0) return;
    setIsImporting(true);
    try {
      const supabase = createClient();
      const { data: insertedData, error } = await supabase
        .from("calendar_events")
        .insert(parsedEvents)
        .select("*");

      if (error) throw error;

      showToast(`${insertedData.length} eventos importados com sucesso!`, "success");
      
      // Map and update state list
      const mappedEvents: CalendarEvent[] = insertedData.map((e: any) => {
        const date = new Date(e.event_date);
        const offsetDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return {
          id: e.id,
          year: offsetDate.getFullYear(),
          month: offsetDate.getMonth(),
          day: offsetDate.getDate(),
          title: e.title,
          type: e.event_type,
          time: `${e.start_time.substring(0, 5)} - ${e.end_time.substring(0, 5)} BRT`,
          startTime: e.start_time.substring(0, 5),
          endTime: e.end_time.substring(0, 5),
          mentor: {
            name: e.mentor_name,
            role: e.mentor_role,
            avatar: e.mentor_avatar || "/magno.jpg",
            bio: e.mentor_bio || ""
          },
          topic: e.topic || "",
          zoomLink: e.zoom_link || ""
        };
      });

      setEvents(prev => [...prev, ...mappedEvents]);
      setShowImportModal(false);
      setParsedEvents([]);
      setImportFileName("");
    } catch (err: any) {
      showToast("Erro ao importar planilha: " + err.message, "error");
    } finally {
      setIsImporting(false);
    }
  };

  // Custom alert/confirm dialog state
  const [customDialog, setCustomDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm";
    onConfirm?: () => void;
  } | null>(null);

  const showConfirm = (message: string, onConfirm: () => void, title: string = "Confirmação") => {
    setCustomDialog({
      isOpen: true,
      title,
      message,
      type: "confirm",
      onConfirm
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    showConfirm(
      "Deseja realmente excluir este evento do calendário? Esta ação não pode ser desfeita.",
      async () => {
        try {
          const supabase = createClient();
          const { error } = await supabase.from('calendar_events').delete().eq('id', eventId);
          if (error) throw error;
          const updated = events.filter(e => e.id !== eventId);
          setEvents(updated);
          setShowBottomSheet(false);
          showToast("Evento excluído com sucesso!", "success");
        } catch (err: any) {
          showToast("Erro ao excluir evento: " + err.message, "error");
        }
      },
      "Excluir Evento"
    );
  };

  // Custom toast notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const year = activeMonth.year;
  const month = activeMonth.month;

  // Calculate days count and starting weekday offset (Sunday = 0, Monday = 1...)
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Load events and google login from localStorage/Supabase
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const supabase = createClient();
        const { data: dbEvents, error } = await supabase
          .from("calendar_events")
          .select("*");
          
        let activeEvents: CalendarEvent[] = initialEventsList;
        if (dbEvents && !error) {
          const mappedEvents: CalendarEvent[] = dbEvents.map((e: any) => {
            const date = new Date(e.event_date);
            // Adjust timezone offset since we get a UTC date string for a DATE column (e.g. "2026-05-04")
            const offsetDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
            
            return {
              id: e.id,
              year: offsetDate.getFullYear(),
              month: offsetDate.getMonth(),
              day: offsetDate.getDate(),
              title: e.title,
              type: e.event_type,
              time: `${e.start_time.substring(0, 5)} - ${e.end_time.substring(0, 5)} BRT`,
              startTime: e.start_time.substring(0, 5),
              endTime: e.end_time.substring(0, 5),
              mentor: {
                name: e.mentor_name,
                role: e.mentor_role,
                avatar: e.mentor_avatar || "/magno.jpg",
                bio: e.mentor_bio || ""
              },
              topic: e.topic || "",
              zoomLink: e.zoom_link || ""
            };
          });
          activeEvents = mappedEvents.length > 0 ? mappedEvents : initialEventsList;
          setEvents(activeEvents);
        } else {
          setEvents(initialEventsList);
        }

        // Direct select event from URL query parameter
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const paramEventId = params.get("event_id");
          if (paramEventId) {
            const targetEvent = activeEvents.find(e => e.id === paramEventId);
            if (targetEvent) {
              const matchedMonth = monthsList.find(item => item.month === targetEvent.month && item.year === targetEvent.year);
              if (matchedMonth) {
                setActiveMonth(matchedMonth);
                setSelectedDay(targetEvent.day);
                if (window.innerWidth < 768) {
                  setShowBottomSheet(true);
                }
              }
            }
          } else {
            const paramDay = params.get("day");
            const paramMonth = params.get("month");
            const paramYear = params.get("year");

            if (paramDay && paramMonth && paramYear) {
              const d = parseInt(paramDay);
              const m = parseInt(paramMonth);
              const y = parseInt(paramYear);

              const matchedMonth = monthsList.find(item => item.month === m && item.year === y);
              if (matchedMonth) {
                setActiveMonth(matchedMonth);
                setSelectedDay(d);
                if (window.innerWidth < 768) {
                  setShowBottomSheet(true);
                }
              }
            } else {
              // Default to current local month and day if no params are present
              const now = new Date();
              const currentMonth = now.getMonth();
              const currentYear = now.getFullYear();
              const matchedMonth = monthsList.find(item => item.month === currentMonth && item.year === currentYear);
              if (matchedMonth) {
                setActiveMonth(matchedMonth);
                setSelectedDay(now.getDate());
              }
            }
          }
        }

        const savedUser = localStorage.getItem("cls_google_user");
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            setGoogleUser(user);
            setIsSynced(true);
          } catch (e) {}
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: member } = await supabase.from("members").select("member_type").eq("id", user.id).single();
          if (member) {
            setUserType(member.member_type || "mentor");
          }
        }
      } catch (err) {
        setEvents(initialEventsList);
      } finally {
        setLoading(false);
      }
    };
    loadFromStorage();
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
    const currentIdx = monthsList.findIndex(m => m.month === month && m.year === year);
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
      `Tópico: ${event.topic}\n\nMentor: ${event.mentor.name} (${event.mentor.role})\n\nLink da Reunião: ${event.zoomLink}`
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
    setEventZoomLink("https://teams.microsoft.com/");
    setEventLinkType("teams");
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

    triggerEventCreation(eventData);
  };

  const triggerEventCreation = async (eventData: EventFormData) => {
    setIsSyncingEvent(true);
    
    try {
      const supabase = createClient();
      const eventDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
      
      const { data: insertedEvent, error } = await supabase.from('calendar_events').insert({
        title: eventData.title,
        event_type: eventData.type,
        event_date: eventDate,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        mentor_name: eventData.mentorName,
        mentor_role: "Mentor Sênior",
        mentor_avatar: "/magno.jpg",
        mentor_bio: "Membro da comunidade.",
        topic: eventData.topic || "",
        zoom_link: eventData.zoomLink || ""
      }).select().single();

      if (error) throw error;

      // Map back to UI
      const newEvent: CalendarEvent = {
        id: insertedEvent.id,
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
          role: "Mentor Sênior",
          avatar: "/magno.jpg",
          bio: ""
        },
        topic: eventData.topic || "",
        zoomLink: eventData.zoomLink || ""
      };

      const updated = [...events, newEvent];
      setEvents(updated);
      
      // Also emit a global notification for this new event
      await supabase.from('notifications').insert({
        title: `Novo Evento: ${eventData.title}`,
        description: `Um novo evento de ${eventData.type} foi agendado para o dia ${selectedDay}/${String(month + 1).padStart(2, '0')}.`,
        type: eventData.type,
        link: '/calendario'
        // user_id is left NULL to be a global notification
      });

      if (isSynced && eventLinkType === "meet") {
        setPendingEventToSync(eventData);
      } else {
        showToast("Evento adicionado com sucesso!", "success");
      }
    } catch (err: any) {
      showToast("Erro ao criar evento: " + err.message, "error");
    } finally {
      setIsSyncingEvent(false);
      setShowCreateEventModal(false);
    }
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
            minHeight: isMobile ? "50px" : "120px",
            padding: isMobile ? "6px" : "12px",
            backgroundColor: "var(--color-surface-dim)",
            border: "1px solid var(--border-color)",
            opacity: 0.3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            cursor: "not-allowed",
          }}
        >
          <span style={{ fontSize: isMobile ? "12px" : "14px", color: "var(--color-on-surface-variant)", fontWeight: 500 }}>
            {prevDay}
          </span>
        </div>
      );
    }

    // 2. Active days of current month
    const todayDate = new Date();
    const isTodayMonthYear = todayDate.getMonth() === month && todayDate.getFullYear() === year;
    const todayDay = todayDate.getDate();

    for (let day = 1; day <= totalDays; day++) {
      const dayEvents = events.filter(
        e => e.year === year && e.month === month && e.day === day
      );

      const filteredDayEvents = dayEvents.filter(
        e => activeFilter === "todos" || e.type === activeFilter
      );

      const hasEvents = filteredDayEvents.length > 0;
      const isSelected = selectedDay === day;
      const isToday = isTodayMonthYear && todayDay === day;

      cells.push(
        <div
          key={`day-${day}`}
          onClick={() => {
            setSelectedDay(day);
            if (isMobile) {
              setShowBottomSheet(true);
            }
          }}
          className={`card-hover`}
          style={{
            minHeight: isMobile ? "50px" : "120px",
            padding: isMobile ? "6px" : "12px",
            backgroundColor: isSelected 
              ? "rgba(145, 179, 225, 0.06)" 
              : isToday 
                ? "rgba(145, 179, 225, 0.03)" 
                : "var(--color-surface)",
            border: isSelected
              ? "1.5px solid var(--color-secondary)"
              : isToday
                ? "1px solid rgba(145, 179, 225, 0.5)"
                : "1px solid var(--border-color)",
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
              fontWeight: (isSelected || isToday) ? 700 : 500,
              color: isSelected 
                ? "var(--color-secondary)" 
                : isToday 
                  ? "#a3c2f0" 
                  : "var(--color-on-surface)",
              fontSize: isMobile ? "12px" : "14px",
              alignSelf: isMobile ? "center" : "flex-start",
              marginBottom: isMobile ? "0px" : "8px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: isToday ? "24px" : "auto",
              height: isToday ? "24px" : "auto",
              borderRadius: isToday ? "50%" : "0",
              border: isToday ? "1px solid rgba(145, 179, 225, 0.3)" : "none",
              backgroundColor: isToday ? "rgba(145, 179, 225, 0.1)" : "transparent",
            }}
          >
            {day}
          </span>

          {hasEvents && (
            isMobile ? (
              <div style={{
                display: "flex",
                gap: "3px",
                justifyContent: "center",
                marginTop: "auto",
                width: "100%"
              }}>
                {filteredDayEvents.slice(0, 3).map((e, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: e.type === "mentoria" ? "var(--color-secondary)" : "var(--color-primary)",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                {filteredDayEvents.map((e, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "3px 6px",
                      borderRadius: "2px",
                      fontSize: "9px",
                      fontWeight: 600,
                      backgroundColor: e.type === "mentoria" ? "rgba(145, 179, 225, 0.15)" : "rgba(194, 194, 245, 0.15)",
                      color: e.type === "mentoria" ? "var(--color-secondary)" : "var(--color-primary)",
                      border: e.type === "mentoria" ? "1px solid rgba(145, 179, 225, 0.25)" : "1px solid rgba(194, 194, 245, 0.25)",
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
            )
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
            minHeight: isMobile ? "50px" : "120px",
            padding: isMobile ? "6px" : "12px",
            backgroundColor: "var(--color-surface-dim)",
            border: "1px solid var(--border-color)",
            opacity: 0.3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            cursor: "not-allowed",
          }}
        >
          <span style={{ fontSize: isMobile ? "12px" : "14px", color: "var(--color-on-surface-variant)", fontWeight: 500 }}>
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
              onClick={() => {
                setSelectedDay(e.day);
                if (isMobile) {
                  setShowBottomSheet(true);
                }
              }}
              className="glass-panel card-hover"
              style={{
                borderRadius: "4px",
                padding: "16px",
                cursor: "pointer",
                border: isSelected ? "1px solid var(--color-secondary)" : "1px solid var(--border-color)",
                backgroundColor: isSelected ? "rgba(145, 179, 225, 0.04)" : "var(--color-surface)",
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
                    border: "1px solid var(--border-color)",
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
                      backgroundColor: e.type === "mentoria" ? "rgba(145, 179, 225, 0.1)" : "rgba(194, 194, 245, 0.1)",
                      color: e.type === "mentoria" ? "var(--color-secondary)" : "var(--color-primary)",
                      border: e.type === "mentoria" ? "1px solid rgba(145, 179, 225, 0.15)" : "1px solid rgba(194, 194, 245, 0.15)",
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

  const renderDetailsContent = () => {
    if (!selectedEvent) return null;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <span
            className="font-label-caps"
            style={{
              fontSize: "8px",
              padding: "2px 6px",
              borderRadius: "2px",
              backgroundColor: selectedEvent.type === "mentoria" ? "rgba(145, 179, 225, 0.1)" : "rgba(194, 194, 245, 0.1)",
              color: selectedEvent.type === "mentoria" ? "var(--color-secondary)" : "var(--color-primary)",
              border: selectedEvent.type === "mentoria" ? "1px solid rgba(145, 179, 225, 0.15)" : "1px solid rgba(194, 194, 245, 0.15)",
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
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
          <p style={{ color: "var(--color-outline)", fontSize: "9px", marginBottom: "8px" }} className="font-label-caps">Mentor Responsável</p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(145, 179, 225,0.3)", flexShrink: 0 }}>
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
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
          <p style={{ color: "var(--color-outline)", fontSize: "9px", marginBottom: "4px" }} className="font-label-caps">Tópico da Reunião</p>
          <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", lineHeight: "1.5" }}>
            {selectedEvent.topic}
          </p>
        </div>

        {/* Action buttons (Zoom/Meet Link & Delete) */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {(() => {
            const linkStr = selectedEvent.zoomLink || "";
            const lower = linkStr.toLowerCase();
            const isTeams = lower.includes("teams.microsoft.com") || lower.includes("teams.live.com");
            const isZoom = lower.includes("zoom.us");
            const isMeet = lower.includes("meet.google.com");
            const isOnline = lower.startsWith("http://") || lower.startsWith("https://");

            if (!isOnline && linkStr.trim().length > 0) {
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(linkStr)}`;
              return (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ textDecoration: "none", width: "100%", fontSize: "10px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    pin_drop
                  </span>
                  <span>VER LOCALIZAÇÃO NO MAPA</span>
                </a>
              );
            }

            return (
              <a
                href={linkStr}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ textDecoration: "none", width: "100%", fontSize: "10px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  {isTeams ? "groups" : isZoom ? "videocam" : isMeet ? "groups" : "link"}
                </span>
                {isTeams ? "ENTRAR NO TEAMS" : isZoom ? "ENTRAR NO ZOOM" : isMeet ? "ENTRAR NO GOOGLE MEET" : "ACESSAR REUNIÃO"}
              </a>
            );
          })()}

          {(userType === "admin" || userType === "mentor") && (
            <button
              onClick={() => handleDeleteEvent(selectedEvent.id)}
              className="btn-outline"
              style={{
                width: "100%",
                fontSize: "10px",
                padding: "12px",
                border: "1px solid var(--color-error)",
                color: "var(--color-error)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                backgroundColor: "transparent",
                cursor: "pointer",
                borderRadius: "4px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(179, 38, 30, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
              EXCLUIR EVENTO
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <SkeletonCalendario />;
  }

  return (
    <div className="animate-fadeIn" style={{ paddingTop: "12px", paddingBottom: isMobile ? "80px" : "24px" }}>
      {/* Dynamic Header */}
      <section style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <h2 className="font-display-mobile" style={{ color: "var(--color-on-surface)", marginBottom: "4px", fontSize: isMobile ? "22px" : "28px" }}>
            Calendário de Mentorias
          </h2>
          <p className="font-body-md" style={{ color: "var(--color-on-surface-variant)", fontSize: isMobile ? "12px" : "14px" }}>
            Fuso Horário: Brasília (GMT-3). Agende suas mentorias e adicione-as ao seu dia a dia.
          </p>
        </div>
        {userType === "admin" && (
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-outline"
            style={{
              padding: "10px 16px",
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              height: "fit-content",
              cursor: "pointer"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>publish</span>
            {isMobile ? "Importar" : "Importar Planilha"}
          </button>
        )}
      </section>

      {/* Filters, View Toggle and Month Switchers */}
      <section style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row", 
        justifyContent: "space-between", 
        alignItems: isMobile ? "stretch" : "center", 
        gap: "12px", 
        marginBottom: "20px" 
      }}>
        {/* Type filters */}
        <div className="glass-panel" style={{ 
          padding: "4px", 
          borderRadius: "4px", 
          display: "flex", 
          gap: "4px",
          overflowX: "auto",
          whiteSpace: "nowrap"
        }}>
          {[
            { id: "todos", label: isMobile ? "Todos" : "Todos os eventos" },
            { id: "mentoria", label: "Mentorias" },
            { id: "atualizacao", label: isMobile ? "Novidades" : "Atualizações" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id as "todos" | "mentoria" | "atualizacao")}
              className="font-label-caps"
              style={{
                padding: isMobile ? "8px 12px" : "8px 16px",
                borderRadius: "2px",
                border: "none",
                backgroundColor: activeFilter === item.id ? "var(--color-surface-container-highest)" : "transparent",
                color: activeFilter === item.id ? "var(--color-secondary)" : "var(--color-on-surface-variant)",
                fontSize: "10px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                flex: isMobile ? 1 : "initial",
                textAlign: "center"
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* View mode toggle & Month switches */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          gap: "16px" 
        }}>
          {/* Grade/Lista toggle */}
          <div className="glass-panel" style={{ padding: "4px", borderRadius: "4px", display: "flex", gap: "4px" }}>
            <button
              onClick={() => setViewMode("grade")}
              className="topbar-btn"
              style={{
                borderRadius: "2px",
                backgroundColor: viewMode === "grade" ? "var(--color-surface-container-highest)" : "transparent",
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
                backgroundColor: viewMode === "lista" ? "var(--color-surface-container-highest)" : "transparent",
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
                border: "1px solid var(--border-color)",
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
            <span className="font-title-lg" style={{ minWidth: isMobile ? "90px" : "110px", fontSize: isMobile ? "13px" : "16px", textAlign: "center", color: "var(--color-on-surface)", fontWeight: 600 }}>
              {activeMonth.name}
            </span>
            <button
              onClick={() => handleMonthChange("next")}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid var(--border-color)",
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
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "3fr 1.3fr", gap: "24px" }}>
          
          {/* Main display (Calendar Grid or List View) */}
          <div>
            {viewMode === "grade" ? (
              <div className="glass-panel" style={{ borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                {/* Weekdays names */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border-color)", backgroundColor: "rgba(255,255,255,0.01)" }}>
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                    <div key={d} style={{ padding: isMobile ? "8px 4px" : "12px", textAlign: "center", color: "var(--color-on-surface-variant)", fontSize: isMobile ? "10px" : "11px", fontWeight: 700 }} className="font-label-caps">
                      {isMobile ? d.slice(0, 1) : d}
                    </div>
                  ))}
                </div>

                {/* Days Grid cells */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", backgroundColor: "var(--border-color)" }}>
                  {renderDays()}
                </div>
              </div>
            ) : (
              renderListView()
            )}
          </div>

          {/* Right sidebar for event details - hidden on Mobile main layout */}
          {!isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Event selected detailed card */}
              <div className="glass-panel" style={{ borderRadius: "4px", padding: "24px", border: "1px solid var(--border-color)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", backgroundColor: "rgba(145, 179, 225,0.03)", borderRadius: "50%", filter: "blur(20px)" }} />

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: selectedEvent ? (selectedEvent.type === "mentoria" ? "var(--color-secondary)" : "var(--color-primary)") : "var(--color-outline)" }} />
                  <span className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", fontSize: "9px" }}>
                    Dia {selectedDay} de {activeMonth.name.split(" ")[0]}
                  </span>
                </div>

                {selectedEvent ? (
                  renderDetailsContent()
                ) : (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-on-surface-variant)", fontSize: "13px" }}>
                    <p style={{ marginBottom: "16px", lineHeight: "1.5" }}>Nenhum evento agendado para este dia.</p>
                    {(userType === "admin" || userType === "mentor") && (
                      <button
                        onClick={() => handleOpenCreateModal(selectedDay)}
                        className="btn-primary"
                        style={{ margin: "0 auto", fontSize: "10px", padding: "10px 16px" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add_circle</span>
                        CRIAR EVENTO
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Rules */}
              <div className="glass-panel" style={{ borderRadius: "4px", padding: "20px", border: "1px solid var(--border-color)" }}>
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
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet for Event Details */}
      {isMobile && showBottomSheet && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9900,
          display: "flex",
          alignItems: "flex-end"
        }}
        onClick={() => setShowBottomSheet(false)}
        >
          <div style={{
            width: "100%",
            backgroundColor: "var(--dropdown-bg)",
            borderTop: "1px solid var(--dropdown-border)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            padding: "24px 20px calc(80px + env(safe-area-inset-bottom, 0px)) 20px",
            maxHeight: "75vh",
            overflowY: "auto",
            animation: "slideUp 0.3s ease-out",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.3)"
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar for sliding visual */}
            <div style={{
              width: "40px",
              height: "4px",
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "2px",
              margin: "-12px auto 20px auto"
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: selectedEvent ? (selectedEvent.type === "mentoria" ? "var(--color-secondary)" : "var(--color-primary)") : "var(--color-outline)" }} />
                <span className="font-label-caps" style={{ color: "var(--color-on-surface-variant)", fontSize: "9px" }}>
                  Dia {selectedDay} de {activeMonth.name.split(" ")[0]}
                </span>
              </div>
              <button 
                onClick={() => setShowBottomSheet(false)}
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: "var(--color-on-surface-variant)", 
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>
            </div>

            {selectedEvent ? (
              renderDetailsContent()
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-on-surface-variant)", fontSize: "13px" }}>
                <p style={{ marginBottom: "16px", lineHeight: "1.5" }}>Nenhum evento agendado para este dia.</p>
                {(userType === "admin" || userType === "mentor") && (
                  <button
                    onClick={() => {
                      setShowBottomSheet(false);
                      handleOpenCreateModal(selectedDay);
                    }}
                    className="btn-primary"
                    style={{ margin: "0 auto", fontSize: "10px", padding: "10px 16px" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add_circle</span>
                    CRIAR EVENTO
                  </button>
                )}
              </div>
            )}
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
          padding: "16px"
        }}>
          <form
            onSubmit={handleCreateEvent}
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "480px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: isMobile ? "20px" : "32px",
              borderRadius: "4px",
              border: "1px solid var(--dropdown-border)",
              backgroundColor: "var(--dropdown-bg)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "20px" }}>event_available</span>
                <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "10px" }}>Criar Novo Evento</span>
              </div>
              <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", margin: 0, fontSize: isMobile ? "18px" : "22px" }}>
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

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
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
                  <option value="Arq. Mayara Costa" style={{ backgroundColor: "#131316" }}>Arq. Mayara Costa</option>
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

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 2fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Plataforma / Local</label>
                <div style={{ position: "relative" }}>
                  <select
                    className="input-dark"
                    value={eventLinkType}
                    onChange={(e) => {
                      const platform = e.target.value as "teams" | "presencial" | "zoom" | "meet" | "other";
                      setEventLinkType(platform);
                      if (platform === "teams") {
                        setEventZoomLink("https://teams.microsoft.com/");
                      } else if (platform === "zoom") {
                        setEventZoomLink("https://zoom.us/j/magno-santos-pe");
                      } else if (platform === "meet") {
                        setEventZoomLink("https://meet.google.com/abc-defg-hij");
                      } else {
                        setEventZoomLink("");
                      }
                    }}
                    style={{ appearance: "none", cursor: "pointer", width: "100%", paddingRight: "30px" }}
                  >
                    <option value="teams" style={{ backgroundColor: "#131316" }}>Microsoft Teams</option>
                    <option value="presencial" style={{ backgroundColor: "#131316" }}>Encontro Presencial</option>
                    <option value="zoom" style={{ backgroundColor: "#131316" }}>Zoom</option>
                    <option value="meet" style={{ backgroundColor: "#131316" }}>Google Meet</option>
                    <option value="other" style={{ backgroundColor: "#131316" }}>Outro</option>
                  </select>
                  <span className="material-symbols-outlined" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--color-outline)", fontSize: "18px", pointerEvents: "none" }}>
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">
                  {eventLinkType === "teams"
                    ? "Link do Microsoft Teams"
                    : eventLinkType === "zoom"
                    ? "Link do Zoom"
                    : eventLinkType === "meet"
                    ? "Link do Google Meet"
                    : eventLinkType === "presencial"
                    ? "Endereço do Local"
                    : "Link da Reunião"}
                </label>
                <input
                  type={eventLinkType === "presencial" ? "text" : "url"}
                  required
                  className="input-dark"
                  value={eventZoomLink}
                  onChange={(e) => setEventZoomLink(e.target.value)}
                  placeholder={
                    eventLinkType === "teams"
                      ? "https://teams.microsoft.com/..."
                      : eventLinkType === "zoom"
                      ? "https://zoom.us/j/..."
                      : eventLinkType === "meet"
                      ? "https://meet.google.com/..."
                      : eventLinkType === "presencial"
                      ? "Ex: Av. Paulista, 1000 - São Paulo, SP"
                      : "https://..."
                  }
                />
              </div>
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
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add_circle</span>
                Criar Evento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loader Overlay */}
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
            progress_activity
          </span>
          <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600 }} className="font-label-caps">
            Criando evento...
          </p>
        </div>
      )}

      {/* Toast alert */}
      {toast && (
        <div
          className="glass-panel"
          style={{
            position: "fixed",
            bottom: isMobile ? "calc(80px + env(safe-area-inset-bottom, 0px))" : "24px",
            right: isMobile ? "16px" : "24px",
            left: isMobile ? "16px" : "auto",
            padding: "16px 24px",
            borderRadius: "4px",
            border: toast.type === "success" ? "1px solid #a3e635" : "1px solid var(--color-error)",
            backgroundColor: "var(--dropdown-bg)",
            color: toast.type === "success" ? "#a3e635" : "var(--color-error)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
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

      {/* Bulk Import CSV Modal */}
      {showImportModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9990,
          padding: "16px"
        }}>
          <div
            className="glass-panel"
            style={{
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: isMobile ? "20px" : "32px",
              borderRadius: "4px",
              border: "1px solid var(--dropdown-border)",
              backgroundColor: "var(--dropdown-bg)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)", fontSize: "20px" }}>publish</span>
                <span className="font-label-caps" style={{ color: "var(--color-secondary)", fontSize: "10px" }}>Importação em Lote</span>
              </div>
              <h3 className="font-title-lg" style={{ color: "var(--color-on-surface)", margin: 0, fontSize: isMobile ? "18px" : "22px" }}>
                Importar Eventos por Planilha
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "4px", border: "1px solid var(--border-color)" }}>
              <h4 className="font-label-caps" style={{ color: "var(--color-on-surface)", fontSize: "10px", margin: 0 }}>Instruções do Arquivo CSV</h4>
              <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", lineHeight: "1.5", margin: 0 }}>
                O arquivo CSV deve conter um cabeçalho exatamente com as colunas: <strong>title, type, date, start_time, end_time, mentor_name, mentor_role, topic, zoom_link</strong>.
              </p>
              <ul style={{ fontSize: "11px", color: "var(--color-on-surface-variant)", margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <li><strong>type</strong>: deve ser "mentoria" ou "atualizacao"</li>
                <li><strong>date</strong>: deve usar o formato AAAA-MM-DD (ex: 2026-06-15)</li>
                <li><strong>start_time / end_time</strong>: devem usar o formato HH:MM (ex: 14:00)</li>
              </ul>
              <button
                type="button"
                onClick={downloadCSVTemplate}
                className="btn-outline"
                style={{
                  padding: "8px 12px",
                  fontSize: "10px",
                  marginTop: "8px",
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>download</span>
                Baixar Modelo CSV
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }} className="font-label-caps">Selecionar Arquivo CSV</label>
              <div style={{ position: "relative" }}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    zIndex: 2
                  }}
                />
                <div style={{
                  padding: "16px",
                  border: "1px dashed var(--border-color)",
                  borderRadius: "4px",
                  backgroundColor: "rgba(255,255,255,0.01)",
                  textAlign: "center",
                  color: "var(--color-on-surface-variant)",
                  fontSize: "13px"
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px", display: "block", marginBottom: "8px", color: "var(--color-secondary)" }}>
                    cloud_upload
                  </span>
                  {importFileName ? `Arquivo selecionado: ${importFileName}` : "Arraste ou clique para enviar o arquivo CSV"}
                </div>
              </div>
            </div>

            {importError && (
              <div style={{ padding: "12px", backgroundColor: "rgba(179, 38, 30, 0.1)", border: "1px solid var(--color-error)", borderRadius: "4px", color: "var(--color-error)", fontSize: "12px" }}>
                {importError}
              </div>
            )}

            {parsedEvents.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <h4 className="font-label-caps" style={{ color: "var(--color-on-surface)", fontSize: "10px", margin: 0 }}>
                  Pré-visualização ({parsedEvents.length} eventos encontrados)
                </h4>
                <div style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  backgroundColor: "rgba(0,0,0,0.2)"
                }}>
                  {parsedEvents.map((ev, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "8px 12px",
                        borderBottom: index < parsedEvents.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12px"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--color-on-surface)" }}>{ev.title}</div>
                        <div style={{ fontSize: "10px", color: "var(--color-on-surface-variant)" }}>
                          {ev.event_date} • {ev.start_time} às {ev.end_time} • {ev.mentor_name}
                        </div>
                      </div>
                      <span
                        className="font-label-caps"
                        style={{
                          fontSize: "8px",
                          padding: "2px 6px",
                          borderRadius: "2px",
                          backgroundColor: ev.event_type === "mentoria" ? "rgba(145, 179, 225, 0.1)" : "rgba(194, 194, 245, 0.1)",
                          color: ev.event_type === "mentoria" ? "var(--color-secondary)" : "var(--color-primary)"
                        }}
                      >
                        {ev.event_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setParsedEvents([]);
                  setImportFileName("");
                  setImportError("");
                }}
                className="btn-outline"
                style={{ flex: 1, padding: "12px", fontSize: "10px" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={parsedEvents.length === 0 || isImporting}
                onClick={handleBulkImportSubmit}
                className="btn-primary"
                style={{
                  flex: 1.5,
                  padding: "12px",
                  fontSize: "10px",
                  opacity: (parsedEvents.length === 0 || isImporting) ? 0.5 : 1,
                  cursor: (parsedEvents.length === 0 || isImporting) ? "not-allowed" : "pointer"
                }}
              >
                {isImporting ? "Importando..." : "Confirmar Importação"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Dialog Modal (Alert/Confirm) */}
      {customDialog && customDialog.isOpen && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(10, 10, 12, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10005,
            animation: "fadeIn 0.2s ease-out"
          }}
          onClick={() => {
            if (customDialog.type === "alert") {
              setCustomDialog(null);
            }
          }}
        >
          <div 
            style={{
              backgroundColor: "var(--dropdown-bg)",
              border: "1px solid var(--dropdown-border)",
              borderRadius: "8px",
              padding: "24px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--color-on-surface)" }}>
              {customDialog.title}
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--color-on-surface-variant)", lineHeight: "1.5" }}>
              {customDialog.message}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
              {customDialog.type === "confirm" && (
                <button
                  type="button"
                  onClick={() => setCustomDialog(null)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "4px",
                    color: "var(--color-on-surface-variant)",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "8px 16px",
                    cursor: "pointer"
                  }}
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (customDialog.onConfirm) {
                    customDialog.onConfirm();
                  }
                  setCustomDialog(null);
                }}
                style={{
                  backgroundColor: "var(--color-secondary)",
                  border: "none",
                  borderRadius: "4px",
                  color: "#000000",
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "8px 16px",
                  cursor: "pointer"
                }}
              >
                {customDialog.type === "confirm" ? "Confirmar" : "OK"}
              </button>
            </div>
          </div>
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
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
