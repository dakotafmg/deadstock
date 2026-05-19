/* global React */
const { useEffect, useRef, useState } = React;

// ============================================================
// SHARED COMPONENTS — Nav, Footer, Placeholder, Reveal
// ============================================================

function Nav({ route, onNavigate }) {
  const links = [
    { id: "broadman",  label: "Broadman" },
    { id: "wayfarer",  label: "Wayfarer" },
    { id: "monarch",   label: "Monarch", soon: true },
    { id: "dealers",   label: "Dealers", scroll: ".dealers" },
  ];
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <div className="nav-logo" onClick={() => onNavigate("home")} aria-label="Deadstock">
          <img src="assets/wordmark.svg" alt="Deadstock" />
        </div>
        <nav className="nav-links">
          {links.map((l) => (
            <a
              key={l.id}
              className={route === l.id ? "active" : ""}
              href="#"
              style={l.soon ? { opacity: 0.5 } : {}}
              onClick={(e) => {
                e.preventDefault();
                if (l.scroll) {
                  if (route !== "home") {
                    onNavigate("home");
                    setTimeout(() => {
                      document.querySelector(l.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 80);
                  } else {
                    document.querySelector(l.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                } else if (l.soon) {
                  // bring users to the Monarch chapter on home
                  const scrollToMonarch = () => {
                    const el = [...document.querySelectorAll(".chapter")].find((c) =>
                      c.querySelector(".chapter-headline")?.innerText.toLowerCase().includes(l.label.toLowerCase())
                    );
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  };
                  if (route !== "home") {
                    onNavigate("home");
                    setTimeout(scrollToMonarch, 120);
                  } else {
                    scrollToMonarch();
                  }
                } else {
                  onNavigate(l.id);
                }
              }}
            >
              {l.label}
              {l.soon ? <span style={{ marginLeft: 6, fontSize: 10, letterSpacing: "0.18em", opacity: 0.7 }}> · soon</span> : null}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="brand">
            <img src="assets/wordmark.svg" alt="Deadstock" style={{ width: 280, display: "block", filter: "brightness(0) invert(0.94) sepia(0.20) saturate(0.6)" }} />
          </div>
          <p className="mini" style={{ marginTop: 28 }}>
            Deadstock Guitars are made in small batches at our shop in
            Fortville, Indiana. Every instrument leaves with the maker's
            initials, a build sheet, and the bench it came from.
          </p>
        </div>
        <div>
          <h4>The Lineup</h4>
          <ul>
            <li><a onClick={() => onNavigate("broadman")}>The Broadman</a></li>
            <li><a onClick={() => onNavigate("wayfarer")}>The Wayfarer</a></li>
            <li><a onClick={() => onNavigate()} style={{ opacity: 0.6 }}>The Monarch · soon</a></li>
          </ul>
        </div>
        <div>
          <h4>Quiet</h4>
          <ul>
            <li><a>Dealers</a></li>
            <li><a>Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© Deadstock Guitar Co. · 2026</span>
        <span>Fortville, Indiana</span>
        <span>Built by hand. Built honest.</span>
      </div>
    </footer>
  );
}

// Striped placeholder. Pass label, optional corner, optional aspect override.
function PH({ label, corner, style, className = "", children }) {
  return (
    <div className={`ph ${className}`} data-label={label || "image"} style={style}>
      {corner ? <div className="ph-corner">{corner}</div> : null}
      {children}
    </div>
  );
}

// Reveal on scroll (IntersectionObserver-based)
function Reveal({ children, className = "", as = "div", delay = 0, ...rest }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setVis(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  const Tag = as;
  return (
    <Tag ref={ref} className={`reveal ${vis ? "in" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

function DrawLine({ delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setVis(true), delay);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <div ref={ref} className={`draw-line ${vis ? "in" : ""}`}></div>;
}

Object.assign(window, { Nav, Footer, PH, Reveal, DrawLine });
