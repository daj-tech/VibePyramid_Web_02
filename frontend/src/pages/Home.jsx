import { Link } from "react-router-dom";

const categories = [
  ["🎓", "Educational", "Admissions, scholarships and exam information."],
  ["🤝", "Community", "Announcements and area-specific community updates."],
  ["💼", "Internships & Skills", "Internships, training and career opportunities."],
  ["📍", "Local", "Lost & found and local service issues."],
  ["📅", "Events", "Workshops, drives, seminars and local events."],
  ["🚨", "Emergencies", "Emergency contacts and reference information."]
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero section">
        <div className="hero-copy">
          <span className="eyebrow">LOCAL INFORMATION SHARING PLATFORM</span>
          <h1>Useful information.<br /><span>Closer to you.</span></h1>
          <p>
            LocalLink brings scattered community information into one simple,
            searchable place so people can discover what matters in their local area.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="button button-primary button-large">Get Started</Link>
            <Link to="/about" className="button button-outline button-large">How it works</Link>
          </div>
          <div className="hero-note">Prototype region: <strong>Thane</strong> · Synthetic demonstration dataset</div>
        </div>
        <div className="hero-visual">
          <div className="orbit-card main">
            <span>LOCAL LINK</span>
            <strong>One place for<br />local information.</strong>
            <div className="mini-flow"><b>Discover</b><i>→</i><b>Check</b><i>→</i><b>Act</b></div>
          </div>
          <div className="floating-card one">📍 Thane</div>
          <div className="floating-card two">🔔 Important update</div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div><span className="eyebrow">THE PROBLEM</span><h2>Local knowledge is everywhere. Finding it isn't.</h2></div>
          <p>Useful internships, events, local issues and announcements can get buried inside scattered conversations.</p>
        </div>
      </section>

      <section className="section category-section">
        <div className="section-heading centered">
          <span className="eyebrow">SIX INFORMATION AREAS</span>
          <h2>Everything organized by what you need.</h2>
        </div>
        <div className="category-grid">
          {categories.map(([icon, title, text]) => (
            <div className="category-card" key={title}>
              <div className="category-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta section">
        <div>
          <span className="eyebrow">BUILT FOR THE COMMUNITY</span>
          <h2>Start exploring Thane's local information.</h2>
          <p>Sign in to access the prototype dashboard and predefined information dataset.</p>
        </div>
        <Link to="/login" className="button button-white">Open Dashboard →</Link>
      </section>
    </div>
  );
}
