import { useState } from "react";
import StatusBadge from "./StatusBadge";

function normaliseStatus(item) {
  const status = String(item.status || "").toUpperCase();
  if (status) return status;

  const deadline = item.deadline || item.date;
  if (deadline && new Date(deadline) < new Date()) return "EXPIRED";
  return "UPCOMING";
}

export default function InformationCard({ item, onSave }) {
  const [details, setDetails] = useState(false);
  const status = normaliseStatus(item);
  const disabled = status === "EXPIRED" || status === "RESOLVED";

  return (
    <>
      <article className={`info-card ${disabled ? "muted-card" : ""}`}>
        <div className="card-top">
          <span className="category-pill">{item.category}</span>
          <StatusBadge status={status} />
        </div>

        <h3>{item.title}</h3>
        <p className="card-description">{item.description}</p>

        <div className="card-meta">
          {item.area && <span>📍 {item.area}</span>}
          {item.date && <span>📅 {item.date}</span>}
          {item.time && <span>🕒 {item.time}</span>}
        </div>

        {item.deadline && (
          <p className="deadline"><strong>Deadline:</strong> {item.deadline}</p>
        )}

        <div className="card-footer">
          <small>Source: {item.source || item.source_type || "Demonstration dataset"}</small>
          <div className="card-actions">
            <button className="button button-light" onClick={() => setDetails(true)}>View</button>
            {onSave && !disabled && (
              <button className="button button-primary" onClick={() => onSave(item)}>Save</button>
            )}
          </div>
        </div>
      </article>

      {details && (
        <div className="modal-backdrop" onClick={() => setDetails(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDetails(false)}>×</button>
            <span className="eyebrow">{item.category} · {item.subcategory}</span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <div className="detail-grid">
              {Object.entries(item).filter(([key]) => key !== "title" && item[key]).map(([key, value]) => (
                <div key={key}>
                  <small>{key.replaceAll("_", " ")}</small>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <StatusBadge status={status} />
              {onSave && !disabled && <button className="button button-primary" onClick={() => { onSave(item); setDetails(false); }}>Save to Calendar</button>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
