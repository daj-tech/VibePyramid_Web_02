export default function About() {
  const steps = ["CREATE", "PUBLISH", "DISCOVER", "EVALUATE", "UPDATE / REPORT", "EXPIRE / RESOLVE"];
  return (
    <div className="page section">
      <div className="page-header">
        <span className="eyebrow">ABOUT LOCALLINK</span>
        <h1>Turning scattered local information into a shared community resource.</h1>
        <p>LocalLink is designed around discoverability, relevance and information validity.</p>
      </div>

      <div className="about-grid">
        <div className="about-panel">
          <span className="eyebrow">THE PROBLEM</span>
          <h2>Important information gets lost.</h2>
          <p>Internships, lost items, emergencies, local issues, events, scholarships and announcements may be shared across different groups and personal networks.</p>
        </div>
        <div className="about-panel accent">
          <span className="eyebrow">THE SOLUTION</span>
          <h2>One local information layer.</h2>
          <p>LocalLink centralizes relevant information so users can discover it, check its context and act on it.</p>
        </div>
      </div>

      <section className="lifecycle">
        <span className="eyebrow">INFORMATION LIFECYCLE</span>
        <h2>From creation to resolution.</h2>
        <div className="lifecycle-flow">
          {steps.map((step, i) => <div className="lifecycle-step" key={step}><strong>{step}</strong>{i < steps.length - 1 && <span>→</span>}</div>)}
        </div>
      </section>

      <div className="feature-list">
        <div><span>01</span><div><h3>Discoverability</h3><p>Information is organized into six clear local categories.</p></div></div>
        <div><span>02</span><div><h3>Relevance & validity</h3><p>Status, dates, deadlines and source information help users understand context.</p></div></div>
        <div><span>03</span><div><h3>Calendar & reminders</h3><p>Relevant events can be saved to a personal calendar in the prototype.</p></div></div>
        <div><span>04</span><div><h3>PWA notifications</h3><p>The architecture includes a service worker foundation for future notification features.</p></div></div>
      </div>
    </div>
  );
}
