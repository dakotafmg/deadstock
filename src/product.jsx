import React, { useState } from 'react';
import { Reveal, PH } from './shared';
import { PRODUCTS } from './data';

// ============================================================
// PRODUCT PAGE TEMPLATE — applied to Broadman & Wayfarer
// ============================================================

export default function Product({ id, onNavigate }) {
  const p = PRODUCTS[id];
  if (!p) return null;

  return (
    <main className="product" data-screen-label={`product-${id}`}>
      <ProductHero p={p} onNavigate={onNavigate} />
      <SonicStory p={p} />
      <SpecSheet p={p} />
      <BuildTag p={p} />
      <RelatedNav p={p} onNavigate={onNavigate} />
    </main>
  );
}

// ------------------------------------------------------------
// HERO
// ------------------------------------------------------------
function ProductHero({ p, onNavigate }) {
  const [color, setColor] = useState(p.swatches[0] || null);
  const [imgIndex, setImgIndex] = useState(0);
  const images = p.images || [];
  const heroImage = images[imgIndex];
  const prev = () => setImgIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setImgIndex(i => (i + 1) % images.length);
  return (
    <section className="p-hero">
      <div className="wrap">
        <div className="p-hero-top">
          <div className="crumbs">
            <a onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>← Lineup</a>
            <span style={{ margin: "0 14px", color: "var(--steel)" }}>/</span>
            <span>The {p.name}</span>
          </div>
          <span>{p.serial} · {p.year}</span>
        </div>

        <div className="p-hero-grid">
          <Reveal>
            <div className="p-hero-image">
              {heroImage
                ? <img src={heroImage} alt={p.name} className="product-photo" />
                : <PH label={p.name} />
              }
              {images.length > 1 && (
                <>
                  <button className="photo-nav photo-prev" onClick={prev}>←</button>
                  <button className="photo-nav photo-next" onClick={next}>→</button>
                  <span className="photo-counter">{imgIndex + 1} / {images.length}</span>
                </>
              )}
            </div>
          </Reveal>

          <div className="p-hero-side">
            <div>
              <Reveal>
                <div className="archetype">{p.archetype} · {p.year}</div>
              </Reveal>
              <Reveal delay={100}>
                <h1>The<br/><em>{p.name}.</em></h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="lede">{p.lede}</p>
              </Reveal>

              <Reveal delay={300}>
                <div className="p-hero-facts">
                  <div className="p-fact">
                    <div className="k">Price</div>
                    <div className="v">{p.price}</div>
                  </div>
                  <div className="p-fact">
                    <div className="k">Finish</div>
                    <div className="v"><em>{p.finish}</em></div>
                  </div>
                  <div className="p-fact">
                    <div className="k">Pickups</div>
                    <div className="v">{p.pickups}</div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={420}>
                <div className="p-hero-dealer">
                  <button className="btn btn-amber" onClick={() => onNavigate("dealers")}>
                    Find a dealer <span className="arrow">→</span>
                  </button>
                  <span className="p-hero-dealer-note">Available through authorized dealers</span>
                </div>
              </Reveal>

            </div>

            {p.swatches.length > 0 && (
              <Reveal delay={500}>
                <div className="swatches">
                  <span className="lbl">Available finishes</span>
                  {p.swatches.map((s, i) => (
                    <button
                      key={i}
                      className={"swatch " + (color && color.hex === s.hex ? "active" : "")}
                      style={{ background: s.hex }}
                      title={s.name}
                      onClick={() => setColor(s)}
                    ></button>
                  ))}
                  {color && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontFamily: "var(--mono)",
                        fontSize: 10.5,
                        letterSpacing: "0.16em",
                        color: "var(--walnut)",
                        textTransform: "uppercase",
                      }}
                    >
                      ⏤ {color.name}
                    </span>
                  )}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// SONIC STORY
// ------------------------------------------------------------
function SonicStory({ p }) {
  return (
    <section className="p-story">
      <div className="wrap">
        <div className="p-story-grid">
          <div>
            <div className="eyebrow">Sonic Identity</div>
            <div
              style={{
                marginTop: 18,
                fontFamily: "var(--display)",
                fontSize: 13,
                fontWeight: 400,
                color: "var(--walnut)",
                lineHeight: 1.55,
                maxWidth: 200,
              }}
            >
              For the player who wants the <span style={{ color: "var(--amber)" }}>real thing</span>.
            </div>
          </div>
          <div>
            <Reveal className="display">
              <h2 style={{ margin: 0 }}>{p.story.heading}</h2>
            </Reveal>
            <div className="cols">
              <Reveal delay={100}>
                <p>{p.story.problem}</p>
              </Reveal>
              <Reveal delay={200}>
                <p>{p.story.solution}</p>
              </Reveal>
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
// SPEC SHEET
// ------------------------------------------------------------
function SpecSheet({ p }) {
  const tabs = [
    { id: "body",        label: "Body" },
    { id: "neck",        label: "Neck & Fingerboard" },
    { id: "electronics", label: "Electronics" },
    { id: "hardware",    label: "Hardware" },
  ];
  const tabImageIndex = { body: 1, neck: 2, electronics: 3, hardware: 4 };
  const [tab, setTab] = useState("body");
  const rows = p.specs[tab];
  const asideImage = p.images && p.images[tabImageIndex[tab]];

  return (
    <section className="spec">
      <div className="wrap">
        <div className="spec-head">
          <div className="index">The Spec Sheet</div>
          <h2>Every joint,<br/>every <em>winding,</em><br/>every screw.</h2>
          <div className="sig">In full disclosure</div>
        </div>

        <div className="spec-tabs">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              className={"spec-tab " + (tab === t.id ? "active" : "")}
              onClick={() => setTab(t.id)}
            >
              <span className="tn">{String(i + 1).padStart(2, "0")}</span>
              {t.label}
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
              {asideImage
                ? <img src={asideImage} alt={`${p.name} — ${tab}`} className="product-photo" />
                : <PH label={`${p.name} — ${tab} detail`} />
              }
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// BUILD SIGNATURE
// ------------------------------------------------------------
function BuildTag({ p }) {
  return (
    <section className="p-build">
      <div className="wrap">
        <Reveal>
          <div className="build-signature">
            <div>
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--amber)",
                }}
              >
                Bench tag
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: "var(--display)",
                  fontSize: 14,
                  color: "var(--walnut)",
                  lineHeight: 1.5,
                }}
              >
                Ships with every guitar.
              </div>
            </div>
            <div>
              <h3>Built, numbered,<br/><em>set up by hand.</em></h3>
              <p>
                Every Deadstock ships with its build tag — certified
                authenticity story card.
              </p>

              <div className="specs">
                <div>
                  <div className="k">Serial</div>
                  <div className="v">{p.serial}</div>
                </div>
                <div>
                  <div className="k">Built</div>
                  <div className="v">{p.build.run}</div>
                </div>
                <div>
                  <div className="k">Setup</div>
                  <div className="v">By hand, every one.</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// RELATED — single full-bleed spread to the other model
// ------------------------------------------------------------
function RelatedNav({ p, onNavigate }) {
  const otherId = p.id === "broadman" ? "wayfarer" : "broadman";
  const other = PRODUCTS[otherId];
  return (
    <section className="p-related">
      <div className="wrap">
        <div className="index">Continue the build</div>
        <h3>Or, the <i>other</i> one.</h3>

        <Reveal>
          <div className="p-related-row" onClick={() => onNavigate(otherId)}>
            <div className="related-image">
              {other.images && other.images[0]
                ? <img src={other.images[0]} alt={other.name} className="product-photo" />
                : <PH label={other.name} />
              }
            </div>
            <div className="related-copy">
              <h4>The <em>{other.name}.</em></h4>
              <div className="arch">{other.archetype}</div>
              <p>{other.lede}</p>
              <span className="related-cta">
                View the {other.name}
                <span className="arrow">→</span>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
