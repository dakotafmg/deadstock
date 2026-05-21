/* global React, Reveal, PH, DrawLine, LINEUP, SOURCES */
const { useState: useStateHome } = React;

// ============================================================
// HOMEPAGE
// ============================================================

function Home({ onNavigate }) {
  return (
    <main className="home">
      <Hero onNavigate={onNavigate} />
      <Manifesto />
      <Lineup onNavigate={onNavigate} />
      <Craftsmanship />
      <DealerPitch />
    </main>
  );
}

// ------------------------------------------------------------
// HERO
// ------------------------------------------------------------
function Hero({ onNavigate }) {
  return (
    <section className="hero" data-screen-label="home-hero">
      <div className="wrap">
        <div className="hero-top">
          <div className="eyebrow">Deadstock Guitar Co.</div>
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
            <div className="glow"></div>
            <div className="corner-tl">The Lineup · 2026</div>
            <div className="corner-tr">DS-BRD-001 / DS-WAY-001</div>
          </div>
        </Reveal>

        <div className="hero-meta">
          <Reveal delay={150}>
            <div className="hero-philo">
              Built by hand, honest in every joint. Locally sourced wood,
              nitrocellulose finish, handwound pickups — <em>made to last
              longer than the trend cycle.</em>
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
              <p
                style={{
                  marginTop: 22,
                  maxWidth: 320,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "rgba(242,230,201,0.55)",
                }}
              >
                Two production models. Made in Fortville, Indiana.
              </p>
            </div>
          </Reveal>

          <Reveal delay={450}>
            <div className="hero-stats">
              <div>
                <div className="num">2</div>
                <div className="lbl">Models<br/>made by hand</div>
              </div>
              <div>
                <div className="num">11–13<span style={{ fontSize: 22, color: 'rgba(242,230,201,0.5)', marginLeft: 4 }}>w</span></div>
                <div className="lbl">Average<br/>build time</div>
              </div>
              <div>
                <div className="num">100<span style={{ fontSize: 22, color: 'rgba(242,230,201,0.5)' }}>%</span></div>
                <div className="lbl">Handwound<br/>pickups</div>
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
    { k: "Body",        v: "Locally sourced alder" },
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
function Lineup({ onNavigate }) {
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
        const handleOpen = () => interactable && onNavigate(m.id);
        return (
          <Reveal key={m.id}>
            <article
              className={`chapter ${variant}`}
              onClick={handleOpen}
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
                            <div className="v">Carved top, bolt-on neck</div>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen();
                      }}
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
            <button className="btn btn-amber" style={{ marginTop: 4 }}>
              Request the dealer pack
              <span className="arrow">→</span>
            </button>
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
      glyph: (
        <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor"/><circle cx="16" cy="16" r="9" fill="none" stroke="currentColor"/><circle cx="16" cy="16" r="4" fill="currentColor"/></svg>
      ),
    },
    {
      n: "02 — Nut",
      title: "Bone.",
      em: "Never composite.",
      body:
        "Unbleached, cut and dressed by hand for every string set. Sustain you can feel in the headstock.",
      glyph: (
        <svg width="36" height="32" viewBox="0 0 36 32"><rect x="2" y="14" width="32" height="4" fill="currentColor"/><circle cx="6" cy="16" r="5" fill="none" stroke="currentColor"/><circle cx="30" cy="16" r="5" fill="none" stroke="currentColor"/></svg>
      ),
    },
    {
      n: "03 — Pickups",
      title: "Handwound.",
      em: "By a person.",
      body:
        "Plain enamel and formvar, wound by hand. Quarter‑turn hotter than spec for output and character.",
      glyph: (
        <svg width="36" height="32" viewBox="0 0 36 32"><rect x="6" y="4" width="24" height="24" rx="2" fill="none" stroke="currentColor"/><circle cx="14" cy="16" r="2" fill="currentColor"/><circle cx="22" cy="16" r="2" fill="currentColor"/></svg>
      ),
    },
    {
      n: "04 — Hardware",
      title: "Aged.",
      em: "In-house.",
      body:
        "Steel saddles, brass plates, tuner shells — aged in-house at the bench. Every set is unique.",
      glyph: (
        <svg width="32" height="32" viewBox="0 0 32 32"><polygon points="16,3 28,10 28,22 16,29 4,22 4,10" fill="none" stroke="currentColor"/><circle cx="16" cy="16" r="3" fill="currentColor"/></svg>
      ),
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
              <div className="glyph" style={{ color: "var(--tobacco)" }}>{c.glyph}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Home = Home;
