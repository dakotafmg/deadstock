import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Nav, Footer } from './shared';
import Home from './home';
import Product from './product';
import { Pickups, PickupProduct } from './pickups';
import { FoundersLetter, Partners, DealersPage } from './pages';
import Shop from './shop';
import ListingDetail from './listing';
import Admin from './admin';
import { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle } from './tweaks-panel';

// ============================================================
// DEADSTOCK — App shell + router
// ============================================================

const VALID_ROUTES = ["home", "broadman", "wayfarer", "pickups", "tele52", "strat62", "paf", "letter", "partners", "dealers", "shop", "admin"];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#D28400",
  "displayFont": "instrument",
  "showGrain": true,
  "darkMode": false
}/*EDITMODE-END*/;

const FONT_OPTIONS = {
  instrument: { family: '"Instrument Serif", "EB Garamond", Georgia, serif', label: "Instrument" },
  bricolage:  { family: '"Bricolage Grotesque", "Helvetica Neue", sans-serif', label: "Bricolage" },
  newsreader: { family: '"Newsreader", Georgia, serif', label: "Newsreader" },
};

function parsePath() {
  const path = window.location.pathname;
  if (path.startsWith("/listing/")) return ["listing", path.slice(9)];
  const segment = path.slice(1) || "home";
  return [VALID_ROUTES.includes(segment) ? segment : "home", null];
}

export default function App() {
  const [[route, listingId], setNav] = useState(parsePath);
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const onNavigate = (id, param = null) => {
    if (id === "workshop") id = "home";
    if (id === "monarch") return;
    if (id === "listing") {
      setNav(["listing", param]);
      history.pushState({}, "", "/listing/" + param);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setNav([id, null]);
    history.pushState({}, "", id === "home" ? "/" : "/" + id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onPop = () => setNav(parsePath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Apply tweak vars
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--amber", tw.accent);
    const dark = tw.darkMode;
    root.style.setProperty("--cream", dark ? "#1a1a1a" : "#F2E6C9");
    root.style.setProperty("--cream-2", dark ? "#212121" : "#E8DBB8");
    root.style.setProperty("--black", dark ? "#F2E6C9" : "#121212");
    root.style.setProperty("--walnut", dark ? "#D8C9A6" : "#3B2A1E");
    root.style.setProperty("--tobacco", dark ? "#C49545" : "#7A4A20");
    root.style.setProperty("--rule", dark ? "rgba(242,230,201,0.18)" : "rgba(18,18,18,0.18)");
    root.style.setProperty("--rule-soft", dark ? "rgba(242,230,201,0.10)" : "rgba(18,18,18,0.10)");
    const ff = FONT_OPTIONS[tw.displayFont] || FONT_OPTIONS.instrument;
    root.style.setProperty("--serif", ff.family);
    document.body.style.setProperty("--grain", tw.showGrain ? "0.35" : "0");
    const grainEl = document.getElementById("grain-style");
    if (grainEl) grainEl.textContent = `body::before { opacity: ${tw.showGrain ? 0.35 : 0} !important; }`;
  }, [tw.accent, tw.displayFont, tw.showGrain, tw.darkMode]);

  if (route === "admin") {
    return <Admin onNavigate={onNavigate} />;
  }

  return (
    <>
      <Nav route={route} onNavigate={onNavigate} />
      {route === "home"     && <Home onNavigate={onNavigate} />}
      {route === "broadman" && <Product id="broadman" onNavigate={onNavigate} />}
      {route === "wayfarer" && <Product id="wayfarer" onNavigate={onNavigate} />}
      {route === "pickups"  && <Pickups onNavigate={onNavigate} />}
      {route === "tele52"   && <PickupProduct id="tele52"  onNavigate={onNavigate} />}
      {route === "strat62"  && <PickupProduct id="strat62" onNavigate={onNavigate} />}
      {route === "paf"      && <PickupProduct id="paf"     onNavigate={onNavigate} />}
      {route === "letter"   && <FoundersLetter onNavigate={onNavigate} />}
      {route === "partners" && <Partners onNavigate={onNavigate} />}
      {route === "dealers"  && <DealersPage onNavigate={onNavigate} />}
      {route === "shop"     && <Shop onNavigate={onNavigate} />}
      {route === "listing"  && <ListingDetail id={listingId} onNavigate={onNavigate} />}
      <Footer onNavigate={onNavigate} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand">
          <TweakColor
            label="Accent"
            value={tw.accent}
            onChange={(v) => setTweak("accent", v)}
            options={["#D28400", "#B33A1A", "#5B7A3E", "#3B5BAE"]}
          />
          <TweakRadio
            label="Display font"
            value={tw.displayFont}
            onChange={(v) => setTweak("displayFont", v)}
            options={Object.keys(FONT_OPTIONS)}
          />
        </TweakSection>
        <TweakSection label="Atmosphere">
          <TweakToggle
            label="Paper grain"
            value={tw.showGrain}
            onChange={(v) => setTweak("showGrain", v)}
          />
          <TweakToggle
            label="Workshop (dark)"
            value={tw.darkMode}
            onChange={(v) => setTweak("darkMode", v)}
          />
        </TweakSection>
        <TweakSection label="Jump to" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button className="btn btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }} onClick={() => onNavigate("home")}>↳ Homepage</button>
          <button className="btn btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }} onClick={() => onNavigate("broadman")}>↳ The Broadman</button>
          <button className="btn btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }} onClick={() => onNavigate("wayfarer")}>↳ The Wayfarer</button>
          <button className="btn btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }} onClick={() => onNavigate("pickups")}>↳ Pickups</button>
          <button className="btn btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }} onClick={() => onNavigate("tele52")}>↳ '52 Tele Set</button>
          <button className="btn btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }} onClick={() => onNavigate("paf")}>↳ PAF Set</button>
        </div>
      </TweaksPanel>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
