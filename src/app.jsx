import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Nav, Footer } from './components/shared';
import Home from './site/home/home';
import Product from './site/models/product';
import { FoundersLetter, Partners } from './site/pages/pages';
import Shop from './site/shop/shop';
import ListingDetail from './site/shop/listing';
import CartDrawer from './site/shop/cart';
import Repairs from './site/repairs/repairs';
import RepairStatus from './site/repairs/repair-status';
import { useContent, isModelPage } from './content/use-content';
import { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakToggle } from './components/tweaks-panel';

// The admin (and the Supabase sign-in library it uses) only loads on /admin.
const Admin = lazy(() => import('./admin/admin'));

// ============================================================
// DEADSTOCK — App shell + router
// ============================================================

// Fixed pages. Any other single path segment (/broadman) is looked up as a
// model page once site content has loaded.
const VALID_ROUTES = ["home", "letter", "partners", "shop", "repairs", "admin"];
const SLUG = /^[a-z0-9-]+$/;

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
  if (path.startsWith("/repair/")) return ["repair-status", path.slice(8)];
  const segment = path.slice(1).replace(/\/$/, "") || "home";
  if (VALID_ROUTES.includes(segment)) return [segment, null];
  return SLUG.test(segment) ? ["model", segment] : ["home", null];
}

export default function App() {
  const [[route, listingId], setNav] = useState(parsePath);
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const { content, ready } = useContent();
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (listing) => {
    setCart(prev => prev.find(i => i.id === listing.id) ? prev : [...prev, listing]);
    setCartOpen(true);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const onNavigate = (id, param = null) => {
    if (id === "workshop") id = "home";
    if (!VALID_ROUTES.includes(id) && id !== "listing" && id !== "repair-status") {
      // A model page, e.g. onNavigate("broadman").
      setNav(["model", id]);
      history.pushState({}, "", "/" + id);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (id === "listing" || id === "repair-status") {
      setNav([id, param]);
      history.pushState({}, "", (id === "listing" ? "/listing/" : "/repair/") + param);
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

  // Unknown model slugs wait for content, then fall back to the homepage.
  const modelId = route === "model" && isModelPage(content, listingId) ? listingId : null;
  const page = route === "model" ? (modelId ? "model" : ready ? "home" : "loading") : route;

  if (route === "admin") {
    return (
      <Suspense fallback={null}>
        <Admin onNavigate={onNavigate} />
      </Suspense>
    );
  }

  return (
    <>
      <Nav route={page === "model" ? modelId : page} onNavigate={onNavigate} cartCount={cart.length} onCartOpen={() => setCartOpen(true)} />
      {page === "home"     && <Home onNavigate={onNavigate} />}
      {page === "loading"  && <main style={{ minHeight: "100vh" }} />}
      {page === "model"    && <Product id={modelId} onNavigate={onNavigate} />}
      {route === "letter"   && <FoundersLetter onNavigate={onNavigate} />}
      {route === "partners" && <Partners onNavigate={onNavigate} />}
      {route === "shop"     && <Shop onNavigate={onNavigate} />}
      {route === "repairs"  && <Repairs onNavigate={onNavigate} />}
      {route === "repair-status" && <RepairStatus token={listingId} onNavigate={onNavigate} />}
      {route === "listing"  && <ListingDetail id={listingId} onNavigate={onNavigate} cart={cart} addToCart={addToCart} />}
      <Footer onNavigate={onNavigate} />
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onRemove={removeFromCart}
          onClose={() => setCartOpen(false)}
          onNavigate={onNavigate}
        />
      )}

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
          {content.lineup.filter(m => isModelPage(content, m.id)).map(m => (
            <button key={m.id} className="btn btn-ghost" style={{ fontSize: 10, padding: "8px 12px" }} onClick={() => onNavigate(m.id)}>↳ The {m.name}</button>
          ))}
        </div>
      </TweaksPanel>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
