/* global React, Reveal */

// ============================================================
// FOUNDERS LETTER
// ============================================================

function FoundersLetter({ onNavigate }) {
  return (
    <main className="letter-page">
      <div className="wrap">
        <div className="letter-nav">
          <a onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>← Home</a>
        </div>

        <div className="letter-header">
          <div className="letter-eyebrow">A Letter from the Founder</div>
          <h1 className="letter-title">To The Players,<br/>Builders,<br/><em>Dreamers.</em></h1>
        </div>

        <div className="letter-content">
          <p className="letter-salutation">
            To The Players, Builders, Dreamers, Collectors, Tinkerers, Working Musicians,
            Bedroom Riffers, Weekend Warriors and Future Vintage Keepers,
          </p>

          <p>Deadstock was never supposed to happen.</p>

          <p>At least not in the polished, boardroom, investor backed, market researched into existence kind of way.</p>

          <p>Deadstock was born out of obsession.</p>

          <p>The kind that keeps you awake at 2am staring at old guitars online. The kind that makes you notice the shape of a pickup ring, the way lacquer sinks into grain, or how a neck can somehow feel alive in your hands. The kind that makes you care where things come from, who made them and whether or not anybody still gives a damn.</p>

          <p>We do.</p>

          <p>And maybe that's why you're here too.</p>

          <p>Deadstock is built on the belief that the future of guitars should still feel human.</p>

          <p>Not mass produced. Not soulless. Not designed by committees who have never loaded amps into a trailer at midnight.</p>

          <p className="letter-pull">Human. Built by people with stories. For people with stories.</p>

          <p>Every guitar we build carries fingerprints from small American shops, tradesmen, artists, musicians, machinists, finishers, dreamers and believers who are all helping write this thing together.</p>

          <p>That matters to us.</p>

          <p>Our bodies begin in Ohio through our partnership with Woodtech Routing, a company built by tradesmen who spent years in sawmills, around lumber, machinery and hard work before stepping out to build something of their own. They hand select woods cut down right there in Ohio, kiln dry them locally and CNC every body in house to our specifications.</p>

          <p>That's not just supply chain. That's legacy. That's American skill. That's real people betting on themselves.</p>

          <p>Our necks are built alongside Musikraft, whose willingness to step into relationship with us has allowed Deadstock players to experience something deeply personal. Every carve, every spec and every detail matters. Their pursuit of excellence mirrors our own belief that instruments should feel like extensions of the player, not products off an assembly line.</p>

          <p>Our pickups and winding systems are supported by Mojotone, whose passion for tone and pursuit of great pickup design has helped us chase sounds that feel inspiring, alive and unmistakably ours.</p>

          <p>Our hardware, lacquer, screws, bolts, plates, bridges and countless tiny details come through Allparts USA, people who have supported us from the beginning and helped make the impossible start to feel possible.</p>

          <p>And then there's Crossrock Cases.</p>

          <p>From the beginning, we believed the experience should feel special before the guitar is ever played. The moment you open the case should feel like opening possibility itself. Crossrock partnered with us in that pursuit, helping us create an unboxing experience that feels intentional, inspiring and unlike the standard issue black box the industry settled for years ago.</p>

          <p>Then there's our people.</p>

          <p>Our Head Luthier, Jacob Huff, began building under Kevin Heffernan at Center Stage Vintage Guitar Shop at just 14 years old. For more than fifteen years he has dedicated himself to the craft of putting incredible instruments into the hands of players. Not because it was trendy. Not because boutique guitars were hot. Because he genuinely loves this work.</p>

          <p>That spirit lives in every instrument we make.</p>

          <p>And honestly, this is bigger than guitars to us.</p>

          <p>Deadstock is about creating things worth caring about again. It's about American manufacturing. It's about skilled trades. It's about creating jobs for our community. It's about teaching our kids that building something with your hands still matters. It's about keeping craftsmanship alive in a world increasingly obsessed with shortcuts.</p>

          <p>Every guitar sold matters. Every pickup. Every shirt. Every strap. Every social post. Every share. Every conversation. Every person telling a friend about us.</p>

          <p>It all counts.</p>

          <p>Because every ounce of support helps us keep building. Not just guitars, but opportunity.</p>

          <p className="letter-pull">And here's the beautiful part. This story requires no price point.</p>

          <p>You do not have to own one of our guitars to be part of Deadstock.</p>

          <p>You can be here because you believe in craftsmanship. Because you love guitar culture. Because you miss when things felt real. Because you want to see small builders survive. Because you want your kids to grow up in a world where creativity still matters.</p>

          <p>You are invited into this story simply because you care. That's enough for us.</p>

          <p>We are not trying to become the biggest guitar company in the world. We are trying to become one worth believing in. One that builds Future Vintage instruments with soul. One that treats players like family. One that remembers where it came from when things grow. One that creates alongside the community instead of talking at it.</p>

          <p>So welcome to Deadstock. We're grateful you're here.</p>

          <p>Now let's build something worth passing down.</p>

          <div className="letter-signature">
            <div className="letter-sig-name">Zack Schuyler</div>
            <div className="letter-sig-title">Founder, Deadstock Guitars</div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// PARTNERS
// ============================================================

const PARTNER_DATA = [
  {
    name: "Woodtech Routing",
    role: "Bodies",
    description: "Built by tradesmen who spent years in sawmills and around lumber before betting on themselves. They hand select Ohio-grown woods, kiln dry them locally, and CNC every body to our exact specifications. That's not supply chain — that's legacy.",
    url: "https://woodtechrouting.com",
  },
  {
    name: "Musikraft",
    role: "Necks",
    description: "Their pursuit of excellence mirrors our own belief that instruments should feel like extensions of the player, not products off an assembly line. Every carve, every spec, every detail matters. Built in relationship, not transaction.",
    url: "https://musikraft.com",
  },
  {
    name: "Mojotone",
    role: "Pickups & Winding",
    description: "Their passion for tone and pursuit of great pickup design has helped us chase sounds that feel inspiring, alive and unmistakably ours. Partners in the pursuit of the real thing.",
    url: "https://mojotone.com",
  },
  {
    name: "Allparts USA",
    role: "Hardware & Components",
    description: "Hardware, lacquer, screws, bolts, plates, bridges and countless tiny details. They've supported us from the beginning and helped make the impossible start to feel possible.",
    url: "https://allparts.com",
  },
  {
    name: "Crossrock Cases",
    role: "Cases",
    description: "From the beginning we believed the experience should feel special before the guitar is ever played. Crossrock partnered with us to create an unboxing experience that feels intentional — unlike the standard-issue black box the industry settled for years ago.",
    url: "https://crossrockcases.com",
  },
];

function Partners({ onNavigate }) {
  return (
    <main className="partners-page">
      <section className="partners-hero">
        <div className="wrap">
          <div className="letter-nav">
            <a onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>← Home</a>
          </div>
          <div className="letter-eyebrow">Built Together</div>
          <Reveal className="display">
            <h1 style={{ margin: "16px 0 0" }}>
              The people<br/>behind the <em>instruments.</em>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="partners-lede">
              Every Deadstock guitar is the product of intentional partnerships with
              American craftspeople who share our obsession with doing things right.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="partners-list">
        <div className="wrap">
          {PARTNER_DATA.map((p, i) => (
            <Reveal key={p.name} delay={i * 60} className="partner-row">
              <div className="partner-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="partner-logo-slot">
                {/* Logo goes here */}
                <div className="partner-logo-ph">{p.name.charAt(0)}</div>
              </div>
              <div className="partner-info">
                <div className="partner-role">{p.role}</div>
                <h2 className="partner-name">{p.name}</h2>
                <p className="partner-desc">{p.description}</p>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="partner-link"
                >
                  Visit {p.name} <span className="arrow">→</span>
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}

// ============================================================
// DEALERS PAGE
// ============================================================

const DEALER_LIST = [
  {
    name: "Tone Central Station",
    city: "Nashville",
    state: "TN",
    type: "Authorized Dealer",
  },
];

function DealersPage({ onNavigate }) {
  return (
    <main className="dealers-page">
      <section className="dealers-page-hero">
        <div className="wrap">
          <div className="letter-nav">
            <a onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>← Home</a>
          </div>
          <div className="letter-eyebrow">Authorized Dealers</div>
          <Reveal className="display">
            <h1 style={{ margin: "16px 0 0" }}>
              Find a Deadstock<br/>near <em>you.</em>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="partners-lede">
              Our dealer network is growing. Every dealer listed here carries our
              full lineup and shares our commitment to the player experience.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="dealers-list-section">
        <div className="wrap">
          <div className="dealers-list-head">
            <div className="eyebrow">Current Dealers</div>
          </div>
          <div className="dealers-list">
            {DEALER_LIST.map((d, i) => (
              <Reveal key={i} className="dealer-row">
                <div className="dealer-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="dealer-info">
                  <div className="dealer-name">{d.name}</div>
                  <div className="dealer-location">{d.city}, {d.state}</div>
                </div>
                <div className="dealer-type">{d.type}</div>
              </Reveal>
            ))}
          </div>

          <div className="dealers-become">
            <div className="dealers-become-inner">
              <div className="eyebrow" style={{ color: "var(--amber)", marginBottom: 16 }}>Carry Deadstock</div>
              <h3>Interested in becoming<br/>an authorized dealer?</h3>
              <p>We're opening the dealer book for 2026. Reach out to learn about margin, support, and what it means to carry a guitar your customers will talk about for years.</p>
              <div className="dealers-become-cta">
                <a
                  href="mailto:dealers@deadstockguitars.com?subject=Dealer%20Inquiry"
                  className="btn btn-amber"
                >
                  Email us <span className="arrow">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

window.FoundersLetter = FoundersLetter;
window.Partners = Partners;
window.DealersPage = DealersPage;
