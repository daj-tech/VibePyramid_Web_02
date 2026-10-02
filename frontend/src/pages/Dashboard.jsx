import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { readCSV } from "../data/csvReader";
import InformationCard from "../components/InformationCard";

const categories = [
  {key:"educational", title:"Educational", icon:"🎓", file:"educational.csv", path:"/educational"},
  {key:"community", title:"Community", icon:"🤝", file:"community.csv", path:"/community"},
  {key:"internships_skills", title:"Internships & Skills", icon:"💼", file:"internships_skills.csv", path:"/internships-skills"},
  {key:"local", title:"Local", icon:"📍", file:"local.csv", path:"/local"},
  {key:"events", title:"Events", icon:"📅", file:"events.csv", path:"/events"},
  {key:"emergencies", title:"Emergencies", icon:"🚨", file:"emergencies.csv", path:"/emergencies"}
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [region, setRegion] = useState(localStorage.getItem("locallink_region") || "Thane");
  const [data, setData] = useState([]);
  const [saved, setSaved] = useState(JSON.parse(localStorage.getItem("locallink_calendar") || "[]"));

  useEffect(() => {
    fetch("/api/auth/me", {credentials:"include"}).then(r=>r.json()).then(d=>setUser(d.user));
  }, []);

  useEffect(() => {
    localStorage.setItem("locallink_region", region);
    Promise.all(categories.map(c => readCSV(c.file))).then(results => {
      const merged = results.flatMap((rows, i) => rows.map(r => ({...r, category: categories[i].title})));
      setData(merged);
    });
  }, [region]);

  function saveToCalendar(item) {
    const id = item.id || `${item.title}-${item.date}`;
    if (saved.some(x => (x.id || `${x.title}-${x.date}`) === id)) return;
    const next = [...saved, {...item, id}];
    setSaved(next);
    localStorage.setItem("locallink_calendar", JSON.stringify(next));
  }

  const upcoming = useMemo(() => data.filter(x => String(x.status).toUpperCase() !== "EXPIRED" && String(x.status).toUpperCase() !== "RESOLVED").slice(0, 3), [data]);

  return (
    <div className="dashboard section">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">YOUR LOCAL DASHBOARD</span>
          <h1>Hello{user?.name ? `, ${user.name}` : ""}. 👋</h1>
          <p>Discover useful information around your selected area.</p>
        </div>
        <label className="region-select">Region
          <select value={region} onChange={e=>setRegion(e.target.value)}>
            <option>Thane</option>
          </select>
        </label>
      </div>

      <div className="notice-banner">
        <span>ⓘ</span>
        <div><strong>Prototype dataset</strong><p>Information shown here is synthetic demonstration data for the Thane region.</p></div>
      </div>

      <section className="dashboard-section">
        <div className="section-heading compact"><div><span className="eyebrow">BROWSE</span><h2>Information categories</h2></div><Link to="/calendar" className="text-link">View calendar →</Link></div>
        <div className="dashboard-category-grid">
          {categories.map(c => <Link to={c.path} className="dashboard-category" key={c.key}>
            <span>{c.icon}</span><div><strong>{c.title}</strong><small>{data.filter(x=>x.category===c.title).length} items</small></div><b>→</b>
          </Link>)}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading compact"><div><span className="eyebrow">IMPORTANT / UPCOMING</span><h2>Things you may want to see</h2></div></div>
        <div className="card-grid">
          {upcoming.map((item, i) => <InformationCard key={item.id || i} item={item} onSave={saveToCalendar} />)}
        </div>
      </section>

      <section className="dashboard-bottom">
        <div className="quick-panel"><span className="quick-icon">📅</span><div><h3>Your calendar</h3><p>{saved.length} saved item{saved.length !== 1 ? "s" : ""} ready for your reminders.</p></div><Link to="/calendar">Open →</Link></div>
        <div className="quick-panel"><span className="quick-icon">🔔</span><div><h3>Notifications</h3><p>Use the PWA foundation for future local alerts.</p></div></div>
        <div className="quick-panel"><span className="quick-icon">⚙️</span><div><h3>Settings</h3><p>Review your profile and selected area.</p></div><Link to="/settings">Open →</Link></div>
      </section>
    </div>
  );
}
