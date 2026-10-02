import { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";

export default function Calendar() {
  const [items, setItems] = useState([]);

  function load() {
    setItems(JSON.parse(localStorage.getItem("locallink_calendar") || "[]"));
  }
  useEffect(() => {
    load();
    window.addEventListener("calendar-updated", load);
    return () => window.removeEventListener("calendar-updated", load);
  }, []);

  function remove(id) {
    const next = items.filter(x => x.id !== id);
    setItems(next);
    localStorage.setItem("locallink_calendar", JSON.stringify(next));
  }

  return (
    <div className="page section">
      <div className="page-header">
        <span className="eyebrow">PERSONAL CALENDAR</span>
        <h1>Saved information</h1>
        <p>Keep useful events and time-sensitive information in one place.</p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state"><span>📅</span><h2>Your calendar is empty</h2><p>Open an event or information card and choose “Save” to add it here.</p></div>
      ) : (
        <div className="calendar-list">
          {items.map(item => (
            <article className="calendar-item" key={item.id}>
              <div className="calendar-date"><strong>{item.date?.split(" ")[0] || "—"}</strong><small>{item.date?.split(" ").slice(1).join(" ") || "DATE"}</small></div>
              <div className="calendar-info"><span className="eyebrow">{item.category}</span><h3>{item.title}</h3><p>{item.area} {item.time ? `· ${item.time}` : ""}</p></div>
              <StatusBadge status={item.status || "UPCOMING"} />
              <button className="button button-light" onClick={() => remove(item.id)}>Remove</button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
