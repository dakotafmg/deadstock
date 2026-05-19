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
          <div className="eyebrow">Deadstock Guitar Co. — Future Vintage</div>
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
            <div className="corner-br">Face / 01 of 12</div>
            <div className="ph-label">Hero product photography — two-guitar layout, black sweep</div>
          </div>
        </Reveal>

        <div className="hero-meta">
          <Reveal delay={150}>
            <div className="hero-philo">
              The antidote to corporate guitar. Built by hand, honest in every
              joint, made with locally sourced wood and <em>pickups wound a
              quarter‑turn hotter</em> than spec because that's where the magic
              lives.
              <span className="quote-tag">— The Deadstock Manifesto</span>
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
                Two production models, each built by a single maker and signed
                by hand.
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
                <div className="lbl">Billet<br/>to bench tag</div>
              </div>
              <div>
                <div className="num">100<span style={{ fontSize: 22, color: 'rgba(242,230,201,0.5)' }}>%</span></div>
                <div className="lbl">Handwound<br/>pickups</div>
              </div>
              <div>
                <div className="num">1</div>
                <div className="lbl">Maker<br/>per guitar</div>
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
    { k: "Body",        v: "Locally sourced ash & alder",   vs: "Plantation laminate" },
    { k: "Finish",      v: "Nitrocellulose, hand-rubbed",    vs: "Sealed polyurethane" },
    { k: "Electronics", v: "Handwound, one person",          vs: "Machine wound in batches" },
    { k: "Hardware",    v: "Aged in-house at the bench",     vs: "Off-the-shelf chrome" },
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
                Deadstock is two makers, three benches, and a shared belief
                that a real instrument should outlive its first owner. We will
                never chase the trend cycle, and we will never offshore the
                soul of the guitar to a press release.
              </p>
              <p>
                Nitro finish. Bone nut. Handwound pickups. Locally sourced
                wood. Aged hardware. Not as a marketing list — as the minimum
                we'd let leave the bench. Every Deadstock is signed by the
                person who built it.
              </p>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="manifesto-pillars">
              {pillars.map((p, i) => (
                <div key={i} className="pillar">
                  <div className="k">{p.k}</div>
                  <div className="v">{p.v}</div>
                  <div className="vs">{p.vs}</div>
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
        const variant = m.status === "IN-WORKSHOP"
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
                    ? "Bench 01 — Monarch prototype II"
                    : `${m.name} — ${m.id === "broadman" ? "Butterscotch" : "Sea Foam Worn"}`
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
                  {m.status === "IN-WORKSHOP" ? "In the workshop" : "Available now"}
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

                    {m.status === "IN-WORKSHOP" ? (
                      <div className="workshop-progress">
                        <div className="track"><div className="bar"></div></div>
                        <div className="labels">
                          <span>Prototype II · 38%</span>
                          <span>Est. Q4 2026</span>
                        </div>
                      </div>
                    ) : (
                      <div className="chapter-meta">
                        <div>
                          <div className="k">Weight</div>
                          <div className="v">{m.id === "broadman" ? "7.4 lb" : "7.6 lb"}</div>
                        </div>
                        <div>
                          <div className="k">Finish</div>
                          <div className="v"><em>{m.id === "broadman" ? "Butterscotch" : "Sea Foam"}</em></div>
                        </div>
                        <div>
                          <div className="k">Pickups</div>
                          <div className="v">Handwound</div>
                        </div>
                      </div>
                    )}

                    <span
                      className="chapter-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen();
                      }}
                    >
                      {m.status === "IN-WORKSHOP" ? "Join the waitlist" : `View the ${m.name}`}
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
  const reasons = [
    {
      k: "Margin",
      v: "Honest wholesale",
      body: "50/50 on every guitar. We don't undercut our dealers — direct retail and wholesale are priced the same.",
    },
    {
      k: "Exclusivity",
      v: "One shop, one city",
      body: "We protect territory. One authorized dealer per market until you tell us otherwise.",
    },
    {
      k: "Velocity",
      v: "11–13 week build",
      body: "Order it Monday, ship from Indiana on a calendar you can plan around. No backorder math.",
    },
    {
      k: "Story",
      v: "A guitar that sells itself",
      body: "Nitro, bone, handwound, signed by the maker. The customer asks one question; the guitar answers the rest.",
    },
  ];
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

        <div className="dealers-grid">
          {reasons.map((r, i) => (
            <Reveal key={r.k} delay={i * 80}>
              <div className="dealer-cell">
                <div className="k">{r.k}</div>
                <div className="v">{r.v}</div>
                <p>{r.body}</p>
              </div>
            </Reveal>
          ))}
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
function Transparency() {
  return (
    <section className="transparency" data-screen-label="home-transparency">
      <div className="wrap">
        <div className="section-head">
          <div className="index">Sourcing &amp; Transparency</div>
          <h2>No mystery wood.<br/>No mystery <i>hands.</i></h2>
        </div>

        <div className="tp-grid" style={{ marginTop: 60 }}>
          <Reveal className="tp-intro">
            <p>
              We publish our sourcing because we have nothing to hide. Every
              billet, coil and steel saddle on a Deadstock comes from a person
              we can name — <em>often, one we drove to.</em>
            </p>
            <p className="body-m">
              Where possible, we work within a two-hundred-mile radius of the
              Pittsburgh shop. When we can't — because the tree didn't grow
              here, or the winder is the best at what they do — we tell you
              that too.
            </p>
            <button className="btn" style={{ marginTop: 12 }}>
              Read the sourcing report
              <span className="arrow">↓</span>
            </button>
          </Reveal>

          <Reveal delay={200}>
            <div className="tp-sources">
              <div className="tp-headers">
                <span>№</span>
                <span>Material</span>
                <span>Sourced from</span>
                <span>Location</span>
                <span>Distance</span>
              </div>
              {SOURCES.map((s, i) => (
                <div key={i} className="tp-row">
                  <div className="idx">{String(i + 1).padStart(2, "0")}</div>
                  <div className="what">{s.what}</div>
                  <div className="who">{s.who}</div>
                  <div className="where">{s.where}</div>
                  <div className="miles">{s.miles} →</div>
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
        "Plain enamel and formvar, wound in Pittsburgh by M. Halloran. Quarter‑turn hotter than spec. The magic is real.",
      glyph: (
        <svg width="36" height="32" viewBox="0 0 36 32"><rect x="6" y="4" width="24" height="24" rx="2" fill="none" stroke="currentColor"/><circle cx="14" cy="16" r="2" fill="currentColor"/><circle cx="22" cy="16" r="2" fill="currentColor"/></svg>
      ),
    },
    {
      n: "04 — Hardware",
      title: "Aged.",
      em: "In-house.",
      body:
        "Steel saddles, brass plates, tuner shells — aged at the bench in saltwater and vinegar. No two are alike.",
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

// ------------------------------------------------------------
// WORKSHOP STRIP
// ------------------------------------------------------------
function WorkshopStrip() {
  return (
    <section data-screen-label="home-workshop">
      <div className="wrap workshop-strip">
        <Reveal>
          <PH label="BENCH 02 / A. REYES" corner="WORKSHOP №07" style={{ aspectRatio: "4/3" }} />
        </Reveal>
        <Reveal delay={150}>
          <PH label="HAND‑WINDING / M. HALLORAN" corner="PICKUPS" style={{ aspectRatio: "3/4" }} />
        </Reveal>
        <Reveal delay={300}>
          <PH label="ASH BILLETS / PAVLIK CO." corner="WOOD" style={{ aspectRatio: "3/4" }} />
        </Reveal>
      </div>
    </section>
  );
}

window.Home = Home;
