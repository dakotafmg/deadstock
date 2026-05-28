/* global React, Reveal, PH, DrawLine, LINEUP, SOURCES */
const { useState: useStateHome, useEffect: useEffectHome, useRef: useRefHome } = React;

// Each slide has:
//   src  — image path
//   pos  — CSS object-position focal point, e.g. "50% 30%" pushes crop up,
//           "70% 50%" shifts right. Use percentages or keywords (top, bottom…)
//   scale — zoom multiplier (1 = no zoom, 1.15 = 15% in, 1.3 = 30% in etc.)
//           The zoom is anchored to the same focal point as `pos`.
const HERO_SLIDES = [
  { src: "assets/hero-1.jpg", pos: "center",   scale: 1    },
  { src: "assets/hero-2.jpg", pos: "center",   scale: 1    },
  { src: "assets/hero-3.jpg", pos: "center",   scale: 1    },
  { src: "assets/hero-4.jpg", pos: "center",   scale: 1    },
  { src: "assets/hero-5.jpg", pos: "center",   scale: 1    },
  { src: "assets/hero-6.jpg", pos: "center",   scale: 1    },
  { src: "assets/hero-7.jpg", pos: "center",   scale: 1    },
  { src: "assets/hero-8.jpg", pos: "center",   scale: 1    },
  { src: "assets/hero-9.jpg", pos: "center",   scale: 1    },
];

// Replace with your Formspree form ID after signing up at formspree.io
const NOTIFY_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

// ============================================================
// HOMEPAGE
// ============================================================

function Home({ onNavigate }) {
  const [notifyOpen, setNotifyOpen] = useStateHome(false);
  return (
    <main className="home">
      <Hero onNavigate={onNavigate} />
      <Manifesto />
      <Lineup onNavigate={onNavigate} onNotify={() => setNotifyOpen(true)} />
      <Craftsmanship />
      <DealerPitch />
      {notifyOpen && <NotifyModal onClose={() => setNotifyOpen(false)} />}
    </main>
  );
}

// ------------------------------------------------------------
// HERO SLIDESHOW
// ------------------------------------------------------------
function Hero({ onNavigate }) {
  const [current, setCurrent] = useStateHome(0);
  const [fading, setFading] = useStateHome(false);
  const timerRef = useRefHome(null);

  const advance = () => {
    setFading(true);
    setTimeout(() => {
      setCurrent(i => (i + 1) % HERO_SLIDES.length);
      setFading(false);
    }, 400);
  };

  useEffectHome(() => {
    timerRef.current = setInterval(advance, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setFading(true);
    setTimeout(() => {
      setCurrent(idx);
      setFading(false);
      timerRef.current = setInterval(advance, 5000);
    }, 400);
  };

  const slide = HERO_SLIDES[current];

  return (
    <section className="hero" data-screen-label="home-hero">
      <div className="wrap">
        <div className="hero-top">
          <div className="since">Fortville, Indiana · Est. 2026</div>
        </div>

        <Reveal className="display">
          <h1 style={{ margin: 0 }}>
            We build <em>premium</em> instruments —<br/>
            but music belongs to <em>everyone.</em>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <div className="hero-product">
            <div className={"hero-slideshow" + (fading ? " fading" : "")}>
              <img
                src={slide.src}
                alt="The Lineup"
                className="hero-product-img"
                style={{
                  objectPosition: slide.pos,
                  transform: `scale(${slide.scale || 1})`,
                  transformOrigin: slide.pos,
                }}
              />
            </div>
            {/* Dot indicators */}
            <div className="hero-dots">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={"hero-dot" + (i === current ? " active" : "")}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </Reveal>

        <div className="hero-meta">
          <Reveal delay={150}>
            <div className="hero-philo">
              Built by hand, honest in every joint. Ohio sourced wood,
              nitrocellulose finish, handwound pickups <em>Future Vintage
              Instruments, Inspired by you!</em>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 18, color: "var(--amber)" }}>
                Explore the lineup
              </div>
              <div className="hero-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="btn btn-amber" onClick={() => onNavigate("broadman")}>
                  The Broadman
                  <span className="arrow">→</span>
                </button>
                <button className="btn btn-light" onClick={() => onNavigate("wayfarer")}>
                  The Wayfarer
                  <span className="arrow">→</span>
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// MANIFESTO STRIP
// ------------------------------------------------------------
function Manifesto() {
  const pillars = [
    { k: "Body",        v: "Ohio: Ash, Alder" },
    { k: "Finish",      v: "Nitrocellulose, hand-rubbed" },
    { k: "Electronics", v: "Handwound single coils" },
    { k: "Hardware",    v: "Aged in-house at the bench" },
  ];
  return (
    <section className="manifesto" data-screen-label="home-manifesto">
      <div className="wrap manifesto-grid">
        <div className="tag">
          <div className="eyebrow">The Manifesto</div>
        </div>
        <div>
          <Reveal>
            <h2 className="manifesto-lede">
              We are the <em>antidote</em> to a guitar industry that chose
              margin over integrity.
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <div className="manifesto-body">
              <p>
                A real instrument should outlive its first owner. We build
                in small batches in Fortville, Indiana — nitro finish, bone
                nut, handwound pickups, locally sourced wood.
              </p>
              <p>
                These are not marketing points. They are the minimum spec we
                will ship.
              </p>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="manifesto-pillars">
              {pillars.map((p, i) => (
                <div key={i} className="pillar">
                  <div className="k">{p.k}</div>
                  <div className="v">{p.v}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// LINEUP — full-bleed editorial chapters, not bordered cards
// ------------------------------------------------------------
function Lineup({ onNavigate, onNotify }) {
  return (
    <section className="lineup" data-screen-label="home-lineup">
      <div className="wrap">
        <div className="section-head">
          <div className="index">The Lineup · 2026</div>
          <h2>Three instruments<br/>we'd put our name <i>on.</i></h2>
        </div>
      </div>

      {LINEUP.map((m, i) => {
        const variant =
          m.status === "COMING-SOON" || m.status === "IN-WORKSHOP"
            ? "workshop"
            : m.image
              ? "dark"
              : i % 2 === 0 ? "dark" : "cream";
        const labelArch = m.archetype.split(" / ")[0];
        const labelSub  = m.archetype.split(" / ")[1] || "";
        const interactable = m.status === "AVAILABLE";
        const handleCTA = () => {
          if (m.status === "AVAILABLE") onNavigate(m.id);
          else if (m.status === "COMING-SOON") onNotify();
        };
        return (
          <Reveal key={m.id}>
            <article
              className={`chapter ${variant}`}
              onClick={() => interactable && onNavigate(m.id)}
              style={interactable ? { cursor: "pointer" } : {}}
              data-screen-label={`chapter-${m.id}`}
            >
              <div
                className={"chapter-bg" + (m.image ? " has-image" : "")}
                data-label={
                  m.id === "monarch"
                    ? "Monarch — in development"
                    : `${m.name} — ${m.id === "broadman" ? "Shell Pink" : "Sunburst"}`
                }
                style={
                  m.image
                    ? {
                        backgroundImage: `url("${m.image}")`,
                        backgroundPosition: m.imagePos || "center",
                      }
                    : undefined
                }
              ></div>

              <div className="chapter-toprow">
                <span className="l">
                  {String(i + 1).padStart(2, "0")} —{" "}
                  {m.status === "AVAILABLE" ? "Available now" : "Coming soon"}
                </span>
                <span className="r">
                  <span>{labelArch}</span>
                  <span>{m.serial.split(" — ")[1] || m.serial}</span>
                  <span>{m.price}</span>
                </span>
              </div>

              <div className="wrap">
                <div className="chapter-content">
                  <div className="chapter-headline">
                    <h3>
                      {m.name === "Broadman" && <>The Broad<em>man.</em></>}
                      {m.name === "Wayfarer" && <>The Way<em>farer.</em></>}
                      {m.name === "Monarch"  && <>The <em>Monarch.</em></>}
                    </h3>
                    <div className="arch">{labelSub}</div>
                  </div>

                  <div className="chapter-side">
                    <p className="blurb">{m.blurb}</p>

                    <div className="chapter-meta">
                      {m.status === "COMING-SOON" ? (
                        <>
                          <div>
                            <div className="k">Status</div>
                            <div className="v"><em>Coming soon</em></div>
                          </div>
                          <div>
                            <div className="k">Pickups</div>
                            <div className="v">Handwound humbuckers</div>
                          </div>
                          <div>
                            <div className="k">Construction</div>
                            <div className="v">Carved top, back bolt-on neck</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="k">Finish</div>
                            <div className="v"><em>{m.id === "broadman" ? "Shell Pink" : "Sunburst"}</em></div>
                          </div>
                          <div>
                            <div className="k">Pickups</div>
                            <div className="v">Handwound</div>
                          </div>
                          <div>
                            <div className="k">Construction</div>
                            <div className="v">Bolt-on neck</div>
                          </div>
                        </>
                      )}
                    </div>

                    <span
                      className="chapter-cta"
                      onClick={(e) => { e.stopPropagation(); handleCTA(); }}
                    >
                      {m.status === "COMING-SOON" ? "Get notified" : `View the ${m.name}`}
                      <span className="arrow">→</span>
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        );
      })}
    </section>
  );
}

// ------------------------------------------------------------
// NOTIFY MODAL — email collection for coming-soon models
// ------------------------------------------------------------
function NotifyModal({ onClose }) {
  const [email, setEmail] = useStateHome("");
  const [status, setStatus] = useStateHome("idle"); // idle | sending | done | error

  // Close on Escape key
  useEffectHome(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(NOTIFY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, _subject: "Monarch — notify me" }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="notify-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="notify-modal" onClick={e => e.stopPropagation()}>
        <button className="notify-close" onClick={onClose} aria-label="Close">×</button>

        {status === "done" ? (
          <div className="notify-success">
            <div className="notify-check">✓</div>
            <h3>You're on the list.</h3>
            <p>We'll reach out the moment The Monarch is ready to order.</p>
            <button className="btn btn-amber" style={{ marginTop: 32 }} onClick={onClose}>
              Close <span className="arrow">→</span>
            </button>
          </div>
        ) : (
          <>
            <div className="notify-eyebrow">The Monarch · Coming 2026</div>
            <h3 className="notify-heading">Be first<br/>to <em>know.</em></h3>
            <p className="notify-body">
              Leave your email and we'll reach out the moment The Monarch
              is ready to order. No noise. Just the one email that matters.
            </p>
            <form className="notify-form" onSubmit={handleSubmit}>
              <input
                className="notify-input"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
              />
              <button
                className="btn btn-amber notify-submit"
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Notify me"}
                {status !== "sending" && <span className="arrow">→</span>}
              </button>
            </form>
            {status === "error" && (
              <p className="notify-error">
                Something went wrong — email us directly at{" "}
                <a href="mailto:hello@deadstockguitars.com">hello@deadstockguitars.com</a>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// DEALER PITCH — for retailers considering carrying Deadstock
// ------------------------------------------------------------
function DealerPitch() {
  return (
    <section className="dealers" data-screen-label="dealer-pitch">
      <div className="wrap">
        <div className="dealers-head">
          <div className="dealers-eyebrow">For dealers</div>
          <h2>
            Carry a guitar that gives<br/>your customer <i>a story.</i>
          </h2>
          <p className="dealers-lede">
            Deadstock is a small-batch Indiana shop building working
            instruments for players who can tell the difference. We're opening
            the dealer book for 2026.
          </p>
        </div>

        <div className="dealers-cta">
          <div>
            <div className="dealers-cta-k">Inquire</div>
            <a
              href="mailto:dealers@deadstockguitars.com"
              className="dealers-cta-email"
            >
              dealers@deadstockguitars.com
            </a>
          </div>
          <div>
            <a
              href="mailto:dealers@deadstockguitars.com?subject=Dealer%20Pack%20Request"
              className="btn btn-amber"
              style={{ marginTop: 4 }}
            >
              Request the dealer pack
              <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
// ------------------------------------------------------------
// CRAFTSMANSHIP
// ------------------------------------------------------------
function Craftsmanship() {
  const cells = [
    {
      n: "01 — Finish",
      title: "Nitro.",
      em: "Always.",
      body:
        "Eight thin coats, hand‑rubbed. Designed to breathe, check and earn its story over decades — not look new forever.",
    },
    {
      n: "02 — Nut",
      title: "Bone.",
      em: "Never composite.",
      body:
        "Unbleached, cut and dressed by hand for every string set. Sustain you can feel in the headstock.",
    },
    {
      n: "03 — Pickups",
      title: "Handwound.",
      em: "By a person.",
      body:
        "Plain enamel and formvar, wound by hand.",
    },
    {
      n: "04 — Hardware",
      title: "Aged.",
      em: "In-house.",
      body:
        "Steel saddles, brass plates, tuner shells — aged in-house at the bench. Every set is unique.",
    },
  ];
  return (
    <section className="craft" data-screen-label="home-craft">
      <div className="wrap">
        <div className="section-head">
          <div className="index">The Non-Negotiables</div>
          <h2>Four things we will<br/><i>never</i> change.</h2>
        </div>
        <div className="craft-grid">
          {cells.map((c, i) => (
            <Reveal key={i} delay={i * 80} className="craft-cell">
              <div className="num">{c.n}</div>
              <h3>{c.title} <em>{c.em}</em></h3>
              <p>{c.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Home = Home;
