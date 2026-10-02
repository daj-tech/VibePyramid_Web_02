import { useEffect, useState } from "react";
import { readCSV } from "../data/csvReader";
import InformationCard from "../components/InformationCard";

export default function Educational() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    readCSV("educational.csv")
      .then(rows => setItems(rows.map(r => ({...r, category: "Educational"}))))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const saved = (item) => {
    const existing = JSON.parse(localStorage.getItem("locallink_calendar") || "[]");
    const id = item.id || `${item.title}-${item.date}`;
    if (existing.some(x => (x.id || `${x.title}-${x.date}`) === id)) return;
    localStorage.setItem("locallink_calendar", JSON.stringify([...existing, {...item, id}]));
    window.dispatchEvent(new Event("calendar-updated"));
    alert("Saved to calendar.");
  };

  return (
    <div className="page section">
      <div className="page-header category-header">
        <div><span className="eyebrow">EDUCATIONAL</span><h1>Educational</h1><p>Admissions, scholarships, exam dates and academic announcements.</p></div>
        <div className="dataset-label">THANE<br/><small>Predefined dataset</small></div>
      </div>
      
      {loading && <div className="loading-box"><div className="spinner" />Loading information...</div>}
      {error && <div className="alert error">{error}</div>}
      {!loading && !error && <div className="card-grid">{items.map((item, i) => <InformationCard key={item.id || i} item={item} onSave={saved} />)}</div>}
    </div>
  );
}
