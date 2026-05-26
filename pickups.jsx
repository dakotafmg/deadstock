/* global React, Reveal, PH, DrawLine, PICKUPS, PICKUP_LINEUP, PRODUCTS */
const { useState: useStatePickup } = React;

// ============================================================
// PICKUPS — Landing page + individual product pages
// ============================================================

function Pickups({ onNavigate }) {
  return (
    <main className="pickups-home">
      <PickupsHero />
      <PickupLineup onNavigate={onNavigate} />
    </main>
  );
}

function PickupsHero() {
  return (
    <section className="pu-hero">
      <div className="wrap">
        <div className="pu-hero-top">
          <div className="since">Fortville, Indiana · Est. 2026</div>
        </div>
        <Reveal className="display">
          <h1 style={{ margin: 0 }}>
            Wound by hand.<br/><em>Every one.</em>
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="pu-hero-lede">
            Three sets. A2 Tele, A5 Strat, A2 PAF — all wound at the bench in
            Fortville. No machines. No shortcuts. Voiced to push back.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function PickupLineup({ onNavigate }) {
  return (
    <section className="pu-lineup">
      <div className="wrap">
        <div className="section-head">
          <div className="index">The Pickup Lineup</div>
          <h2>Three sets.<br/><em>All handwound.</em></h2>
        </div>
        <div className="pu-grid">
          {PICKUP_LINEUP.map((pu, i) => (
            <Reveal
              key={pu.id}
              delay={i * 80}
              className="pu-card"
              onClick={() => onNavigate(pu.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="pu-card-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="pu-card-type">{pu.type}</div>
              <h3 className="pu-card-name">{pu.name}</h3>
              <p className="pu-card-blurb">{pu.blurb}</p>
              <div className="pu-card-fact">
                <span className="k">Magnet</span>
                <span className="v">{pu.magnet}</span>
              </div>
              <span className="pu-card-cta">
                View specs <span className="arrow">→</span>
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// INDIVIDUAL PICKUP PRODUCT PAGE
// ============================================================

function PickupProduct({ id, onNavigate }) {
  const p = PICKUPS[id];
  if (!p) return null;
  return (
    <main className="pickup-product" data-screen-label={`pickup-${id}`}>
      <PickupProductHero p={p} onNavigate={onNavigate} />
      <PickupStory p={p} />
      <PickupSpec p={p} />
      <PickupFoundIn p={p} onNavigate={onNavigate} />
      <PickupRelated p={p} onNavigate={onNavigate} />
    </main>
  );
}

// ------------------------------------------------------------
// HERO
// ------------------------------------------------------------
function PickupProductHero({ p, onNavigate }) {
  return (
    <section className="pu-p-hero">
      <div className="wrap">
        <div className="pu-p-hero-top">
          <div className="crumbs">
            <a onClick={() => onNavigate("pickups")} style={{ cursor: "pointer" }}>← Pickups</a>
            <span style={{ margin: "0 14px", color: "var(--steel)" }}>/</span>
            <span>{p.name}</span>
          </div>
          <span>{p.serial} · {p.year}</span>
        </div>

        <div className="pu-p-hero-grid">
          <Reveal>
            <div className="pu-p-image">
              <PH label={p.name} />
            </div>
          </Reveal>

          <div className="pu-p-side">
            <div>
              <Reveal>
                <div className="pu-archetype">{p.type} · {p.year}</div>
              </Reveal>
              <Reveal delay={100}>
                <h1><em>{p.name}</em></h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="pu-lede">{p.lede}</p>
              </Reveal>
              <Reveal delay={300}>
                <div className="p-hero-facts">
                  <div className="p-fact">
                    <div className="k">Price</div>
                    <div className="v">{p.price}</div>
                  </div>
                  <div className="p-fact">
                    <div className="k">Magnet</div>
                    <div className="v"><em>{p.magnet}</em></div>
                  </div>
                  <div className="p-fact">
                    <div className="k">Wind</div>
                    <div className="v">{p.wind}</div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// SONIC CHARACTER (reuses .p-story CSS)
// ------------------------------------------------------------
function PickupStory({ p }) {
  return (
    <section className="p-story">
      <div className="wrap">
        <div className="p-story-grid">
          <div>
            <div className="eyebrow">Sonic Character</div>
            <div style={{ marginTop: 18, fontFamily: "var(--display)", fontSize: 13, fontWeight: 400, color: "var(--walnut)", lineHeight: 1.55, maxWidth: 200 }}>
              For the player who wants the <span style={{ color: "var(--amber)" }}>real thing</span>.
            </div>
          </div>
          <div>
            <Reveal className="display">
              <h2 style={{ margin: 0 }}>{p.story.heading}</h2>
            </Reveal>
            <div className="cols">
              <Reveal delay={100}><p>{p.story.problem}</p></Reveal>
              <Reveal delay={200}><p>{p.story.solution}</p></Reveal>
            </div>
            <Reveal delay={300} className="pull">
              <p>{p.story.pull}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// WINDING SPECS (reuses .spec CSS)
// ------------------------------------------------------------
function PickupSpec({ p }) {
  const positions = Object.keys(p.specs);
  const [tab, setTab] = useStatePickup(positions[0]);
  const rows = p.specs[tab];
  return (
    <section className="spec">
      <div className="wrap">
        <div className="spec-head">
          <div className="index">Winding Specs</div>
          <h2>Every coil,<br/>every <em>winding.</em></h2>
          <div className="sig">In full disclosure</div>
        </div>
        <div className="spec-tabs">
          {positions.map((pos, i) => (
            <button
              key={pos}
              className={"spec-tab " + (tab === pos ? "active" : "")}
              onClick={() => setTab(pos)}
            >
              <span className="tn">{String(i + 1).padStart(2, "0")}</span>
              {pos.charAt(0).toUpperCase() + pos.slice(1)} Pickup
            </button>
          ))}
        </div>
        <div className="spec-body">
          <div className="spec-list" key={tab}>
            {rows.map((r, i) => (
              <Reveal key={i} delay={i * 40} className="spec-row">
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <span className="k">{r.k}</span>
                <span className="v">{r.v}</span>
              </Reveal>
            ))}
          </div>
          <aside className="spec-aside">
            <div className="image-wrap">
              <PH label={`${p.name} — ${tab} coil`} />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// FOUND IN (reuses .p-build CSS)
// ------------------------------------------------------------
function PickupFoundIn({ p, onNavigate }) {
  const guitar = p.foundIn && p.foundIn !== "monarch" ? PRODUCTS[p.foundIn] : null;
  const isMonarch = p.foundIn === "monarch";
  return (
    <section className="p-build">
      <div className="wrap">
        <Reveal>
          <div className="build-signature">
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: 12, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--amber)" }}>
                Wound for
              </div>
              <div style={{ marginTop: 12, fontFamily: "var(--display)", fontSize: 14, color: "var(--walnut)", lineHeight: 1.5 }}>
                {isMonarch ? "The guitar that's coming." : `Ships in every ${guitar?.name}.`}
              </div>
            </div>
            <div>
              <h3>
                {isMonarch
                  ? <>Built for the <em>Monarch.</em></>
                  : <>The pickups inside<br/><em>the {guitar?.name}.</em></>
                }
              </h3>
              <p>
                {isMonarch
                  ? "The Monarch is in development. These are the pickups that will go in it — available now for any standard humbucker-route instrument."
                  : `These are the same pickups wound for the ${guitar?.name}. Available as a standalone set for any compatible instrument.`
                }
              </p>
              {!isMonarch && guitar && (
                <>
                  <div className="specs" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <div>
                      <div className="k">Guitar</div>
                      <div className="v">The {guitar.name}</div>
                    </div>
                    <div>
                      <div className="k">Route</div>
                      <div className="v">{p.type === "SINGLE-COIL / TELE" ? "Standard Tele" : "Standard Strat"}</div>
                    </div>
                    <div>
                      <div className="k">Set ID</div>
                      <div className="v">{p.serial}</div>
                    </div>
                  </div>
                  <button className="btn btn-amber" style={{ marginTop: 32 }} onClick={() => onNavigate(guitar.id)}>
                    View the {guitar.name} <span className="arrow">→</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// RELATED PICKUPS (reuses .p-related CSS)
// ------------------------------------------------------------
function PickupRelated({ p, onNavigate }) {
  const others = PICKUP_LINEUP.filter(pu => pu.id !== p.id);
  return (
    <section className="p-related">
      <div className="wrap">
        <div className="index">More pickups</div>
        <h3>The <i>other</i> sets.</h3>
        <div className="pu-related-grid">
          {others.map((pu, i) => (
            <Reveal key={pu.id} delay={i * 80} className="pu-related-card" onClick={() => onNavigate(pu.id)}>
              <div className="pu-related-img">
                <PH label={pu.name} />
              </div>
              <div className="pu-card-type" style={{ color: "var(--amber)", marginBottom: 10 }}>{pu.type}</div>
              <h4><em>{pu.name}</em></h4>
              <p>{pu.blurb}</p>
              <span className="related-cta">
                View specs <span className="arrow">→</span>
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

window.Pickups = Pickups;
window.PickupProduct = PickupProduct;
