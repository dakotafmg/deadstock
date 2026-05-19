/* global React, Reveal, PH, DrawLine, PRODUCTS */
const { useState: useStateProd } = React;

// ============================================================
// PRODUCT PAGE TEMPLATE — applied to Broadman & Wayfarer
// ============================================================

function Product({ id, onNavigate }) {
  const p = PRODUCTS[id];
  if (!p) return null;

  return (
    <main className="product" data-screen-label={`product-${id}`}>
      <ProductHero p={p} onNavigate={onNavigate} />
      <SonicStory p={p} />
      <SpecSheet p={p} />
      <ProductCraft p={p} />
      <BuildTag p={p} />
      <RelatedNav p={p} onNavigate={onNavigate} />
    </main>
  );
}

// ------------------------------------------------------------
// HERO
// ------------------------------------------------------------
function ProductHero({ p, onNavigate }) {
  const [color, setColor] = useStateProd(p.swatches[0]);
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
              <PH
                label={`${p.name} — ${color.name}`}
              />
              <div className="corner-tl">{p.archetype.split(" / ")[0]}</div>
              <div className="corner-tr">Nitrocellulose finish</div>
              <div className="corner-br">Face — 01 / 06</div>
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
                    <div className="k">Weight</div>
                    <div className="v">{p.weight}</div>
                  </div>
                  <div className="p-fact">
                    <div className="k">Finish</div>
                    <div className="v"><em>{p.finish}</em></div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="p-hero-cta">
                  <button className="btn btn-amber">
                    Reserve a build slot
                    <span className="arrow">→</span>
                  </button>
                  <button className="btn btn-ghost">
                    Book a fitting
                    <span className="arrow">→</span>
                  </button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={500}>
              <div className="swatches">
                <span className="lbl">Available finishes</span>
                {p.swatches.map((s, i) => (
                  <button
                    key={i}
                    className={"swatch " + (color.hex === s.hex ? "active" : "")}
                    style={{ background: s.hex }}
                    title={s.name}
                    onClick={() => setColor(s)}
                  ></button>
                ))}
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
              </div>
            </Reveal>
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
// SPEC SHEET — the centerpiece
// ------------------------------------------------------------
function SpecSheet({ p }) {
  const tabs = [
    { id: "body",        label: "Body" },
    { id: "neck",        label: "Neck & Fingerboard" },
    { id: "electronics", label: "Electronics" },
    { id: "hardware",    label: "Hardware" },
  ];
  const [tab, setTab] = useStateProd("body");
  const rows = p.specs[tab];

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
                <span className="v">
                  {r.v}
                  {r.flag ? <em>· {r.flag}</em> : null}
                  {r.note ? <small>{r.note}</small> : null}
                </span>
              </Reveal>
            ))}
          </div>

          <aside className="spec-aside">
            <div className="image-wrap">
              <PH
                label={`${p.name} — ${tab} detail`}
              />
              <div className="corner-tl">{tab.charAt(0).toUpperCase() + tab.slice(1)}</div>
              <div className="corner-tr">04 / 18</div>
              <div className="corner-br">{p.serial}</div>
            </div>
            <div className="hover-stamp">
              <span><span className="hl">→</span> Hover any row for context</span>
              <span>Download PDF</span>
            </div>

            <div
              style={{
                marginTop: 48,
                paddingTop: 36,
                borderTop: "1px solid rgba(242,230,201,0.14)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--amber)",
                  marginBottom: 18,
                }}
              >
                Builder's note
              </div>
              <p
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 26,
                  fontWeight: 400,
                  lineHeight: 1.35,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  color: "var(--cream)",
                  textWrap: "balance",
                }}
              >
                "{p.id === 'broadman'
                  ? "Listed it under the radio — the way a Tele should sit. Played a chord. Knew immediately."
                  : "Set the trem at the bench, then took it home for the weekend. Came back to pitch every morning."}"
              </p>
              <div
                style={{
                  marginTop: 22,
                  fontFamily: "var(--display)",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: "0.18em",
                  color: "rgba(242,230,201,0.5)",
                  textTransform: "uppercase",
                }}
              >
                {p.id === 'broadman' ? "J. Halberd · Bench 03" : "A. Reyes · Bench 02"}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// CRAFTSMANSHIP FOCUS
// ------------------------------------------------------------
function ProductCraft({ p }) {
  return (
    <section className="p-craft">
      <div className="wrap">
        <div className="section-head">
          <div className="index">In the hand</div>
          <h2>What the photos<br/>can't <i>quite</i> show.</h2>
        </div>
        <div className="p-craft-grid" style={{ marginTop: 40 }}>
          <Reveal>
            <div className="col">
              <PH label="NITRO DETAIL · BELLY CONTOUR" corner="TACTILE" />
              <h3>{p.craft.titleA}</h3>
              <p>{p.craft.bodyA}</p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="col">
              <PH label="BONE NUT · HAND CUT" corner="TACTILE" />
              <h3>{p.craft.titleB}</h3>
              <p>{p.craft.bodyB}</p>
              <ul className="tactile-list">
                {p.craft.tactile.map((t, i) => (
                  <li key={i}>
                    <span className="k">{t.k}</span>
                    <span>{t.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// BUILD SIGNATURE — full-bleed section, no punch-hole tag
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
              <h3>This guitar was built by a person.<br/><em>Here's who.</em></h3>
              <p>
                Every Deadstock leaves the shop with a handwritten build tag —
                the bench it was built on, the maker who signed off, and the
                hours of human work. We keep our half on file. Forever.
              </p>

              <div className="specs">
                <div>
                  <div className="k">Bench &amp; Maker</div>
                  <div className="v"><em>{p.build.bench.split(" — ")[0]}</em></div>
                </div>
                <div>
                  <div className="k">Hands at bench</div>
                  <div className="v">{p.build.time.replace(" of human work", "")}</div>
                </div>
                <div>
                  <div className="k">Serial</div>
                  <div className="v">{p.serial}</div>
                </div>
                <div>
                  <div className="k">Built</div>
                  <div className="v">{p.build.run}</div>
                </div>
                <div>
                  <div className="k">Warranty</div>
                  <div className="v"><em>For life,</em> first owner.</div>
                </div>
                <div>
                  <div className="k">Setup</div>
                  <div className="v">By hand, every one.</div>
                </div>
                <div>
                  <div className="k">Final QA</div>
                  <div className="v">{p.id === "broadman" ? "J. Halberd" : "A. Reyes"}</div>
                </div>
                <div>
                  <div className="k">Returns</div>
                  <div className="v">30 days, no questions.</div>
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
              <PH label={`${other.name} — face / ${other.swatches[0].name}`} />
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

window.Product = Product;
