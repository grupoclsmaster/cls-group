"use client";
import React, { useState, useEffect, useRef } from "react";

interface DateTimePickerProps {
  value: string; // ISO String or empty
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function DateTimePicker({ value, onChange, placeholder = "Selecione data e hora...", required = false }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // States for calendar view
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  // Hours and minutes selection
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");

  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const mobileWidth = window.innerWidth <= 768;
      setIsMobile(mobileAgent || mobileWidth);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync internal states when value prop changes
  useEffect(() => {
    if (value) {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        setCurrentDate(parsedDate);
        setViewMonth(parsedDate.getMonth());
        setViewYear(parsedDate.getFullYear());
        setSelectedHour(String(parsedDate.getHours()).padStart(2, "0"));
        setSelectedMinute(String(parsedDate.getMinutes()).padStart(2, "0"));
      }
    }
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format value for display
  const getDisplayValue = () => {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Date picker math
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const nextDate = new Date(viewYear, viewMonth, day, parseInt(selectedHour), parseInt(selectedMinute));
    setCurrentDate(nextDate);
    onChange(nextDate.toISOString());
  };

  const handleTimeChange = (hour: string, minute: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    
    // Update main date value if a date is selected
    const activeDate = value ? new Date(value) : new Date();
    const nextDate = new Date(activeDate.getFullYear(), activeDate.getMonth(), activeDate.getDate(), parseInt(hour), parseInt(minute));
    setCurrentDate(nextDate);
    onChange(nextDate.toISOString());
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  // Convert input value format to local ISO without Z for standard input
  const toLocalISOString = (val: string) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      onChange(new Date(val).toISOString());
    } else {
      onChange("");
    }
  };

  // Render native picker on mobile
  if (isMobile) {
    return (
      <input
        type="datetime-local"
        className="input-dark"
        value={toLocalISOString(value)}
        onChange={handleNativeChange}
        placeholder={placeholder}
        required={required}
        style={{ width: "100%" }}
      />
    );
  }

  // Generate calendar days
  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const blankDays = Array(firstDay).fill(null);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allCalendarDays = [...blankDays, ...monthDays];

  // Hours / Minutes arrays
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0")); // every 5 minutes

  const isSelectedDay = (day: number) => {
    if (!value) return false;
    const date = new Date(value);
    return (
      date.getDate() === day &&
      date.getMonth() === viewMonth &&
      date.getFullYear() === viewYear
    );
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Display Input Field */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="input-dark"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        <span style={{ color: value ? "#ffffff" : "var(--color-outline)" }}>
          {getDisplayValue() || placeholder}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "var(--color-secondary)" }}>
          calendar_month
        </span>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: "8px",
          width: "320px",
          backgroundColor: "#131316",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "8px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
          zIndex: 9999,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          backdropFilter: "blur(12px)"
        }}>
          {/* Calendar Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button 
              type="button" 
              onClick={handlePrevMonth}
              style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer", display: "flex" }}
              className="hover-gold-text"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_left</span>
            </button>
            <span style={{ fontWeight: 600, color: "#ffffff", fontSize: "14px" }}>
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button 
              type="button" 
              onClick={handleNextMonth}
              style={{ background: "none", border: "none", color: "var(--color-outline)", cursor: "pointer", display: "flex" }}
              className="hover-gold-text"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_right</span>
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontSize: "10px", color: "var(--color-outline)", fontWeight: 700 }}>
            <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>
          </div>

          {/* Days Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
            {allCalendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }
              const selected = isSelectedDay(day);
              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  style={{
                    height: "30px",
                    width: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                    border: "none",
                    background: selected ? "var(--color-secondary)" : "transparent",
                    color: selected ? "var(--color-on-secondary)" : "#ffffff",
                    fontSize: "12px",
                    fontWeight: selected ? 700 : 400,
                    cursor: "pointer",
                    transition: "all 0.1s"
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time Selector */}
          <div style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px"
          }}>
            <span style={{ fontSize: "11px", color: "var(--color-outline)", fontWeight: 600 }}>HORÁRIO</span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {/* Hour Dropdown */}
              <select
                value={selectedHour}
                onChange={(e) => handleTimeChange(e.target.value, selectedMinute)}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "4px",
                  color: "#ffffff",
                  padding: "4px",
                  fontSize: "12px",
                  outline: "none"
                }}
              >
                {hours.map(h => (
                  <option key={`h-${h}`} value={h} style={{ backgroundColor: "#131316" }}>{h}</option>
                ))}
              </select>
              <span style={{ color: "#ffffff" }}>:</span>
              {/* Minute Dropdown */}
              <select
                value={selectedMinute}
                onChange={(e) => handleTimeChange(selectedHour, e.target.value)}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "4px",
                  color: "#ffffff",
                  padding: "4px",
                  fontSize: "12px",
                  outline: "none"
                }}
              >
                {minutes.map(m => (
                  <option key={`m-${m}`} value={m} style={{ backgroundColor: "#131316" }}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px", gap: "8px" }}>
            <button
              type="button"
              onClick={handleClear}
              className="btn-outline"
              style={{
                flex: 1,
                fontSize: "10px",
                padding: "6px 0",
                display: "inline-flex",
                justifyContent: "center",
                color: "#f87171",
                borderColor: "rgba(248, 113, 113, 0.2)"
              }}
            >
              LIMPAR
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-primary"
              style={{
                flex: 1,
                fontSize: "10px",
                padding: "6px 0",
                display: "inline-flex",
                justifyContent: "center"
              }}
            >
              FECHAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
