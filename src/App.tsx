import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { STUDIO, artists, faqs, openStatus, portfolio, pricing, type Artist } from "./content";
import { sendForm, type SendResult } from "./forms";

const PHOTOS = {
  // TODO: replace with your own photography. These are placeholders.
  hero: "https://images.unsplash.com/photo-1775135981378-4e7c1767436d?auto=format&fit=crop&w=1800&q=80",
  studio: "/neon-needle-studio-interior.webp",
  session: "https://images.unsplash.com/photo-1638458957842-d901372fed55?auto=format&fit=crop&w=1400&q=80",
};

const NAV: [string, string][] = [["Artists", "/artists"], ["Pricing", "/pricing"], ["Visit", "/visit"], ["FAQ", "/faq"], ["Contact", "/contact"]];

function navigate(to: string) {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

type ButtonProps = { children: ReactNode; onClick?: () => void; href?: string; variant?: "pink" | "dark" | "light" | "outline"; className?: string; type?: "button" | "submit"; disabled?: boolean };

function Button({ children, onClick, href, variant = "pink", className = "", type = "button", disabled }: ButtonProps) {
  const cls = `btn btn-${variant} ${className}`;
  if (href) return <a className={cls} href={href}>{children}</a>;
  return <button className={cls} onClick={onClick} type={type} disabled={disabled}>{children}</button>;
}

function Arrow() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-5 5 5-5 5" /></svg>;
}

function Logo({ light = false }: { light?: boolean }) {
  return <a className={`logo ${light ? "logo-light" : ""}`} href="/" aria-label="Neon Needle home">
    <svg viewBox="0 0 35 35" aria-hidden="true"><path d="M7 28 28 7M6 22l7 7M22 6l7 7" /><circle cx="17.5" cy="17.5" r="15" /></svg>
    <span>NEON<br />NEEDLE</span>
  </a>;
}

function Header({ openBooking }: { openBooking: () => void }) {
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState(true);
  return <>
    {notice && <div className="announcement"><span>Flash days every Tuesday and Wednesday. Tattoos from $40.</span><button onClick={() => setNotice(false)} aria-label="Dismiss announcement">×</button></div>}
    <header className="header">
      <Logo />
      <nav id="site-nav" className={menu ? "nav nav-open" : "nav"} aria-label="Main navigation">
        {NAV.map(([label, href]) => <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>)}
        {STUDIO.instagram && <a href={STUDIO.instagram} target="_blank" rel="noreferrer">Instagram ↗</a>}
      </nav>
      <div className="header-actions">
        <Button onClick={openBooking}>BOOK A TATTOO <Arrow /></Button>
        <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu} aria-controls="site-nav"><span /><span /></button>
      </div>
    </header>
  </>;
}

function Footer({ openBooking }: { openBooking: () => void }) {
  return <footer className="footer">
    <div className="footer-top">
      <div><Logo light /><p className="footer-tagline">Custom tattoos<br /><em>in Little Portugal.</em></p></div>
      <div><p className="eyebrow pink">VISIT</p><p>{STUDIO.address.map((l, i) => <span key={l}>{l}{i < STUDIO.address.length - 1 && <br />}</span>)}</p><p><a href={STUDIO.phoneHref}>{STUDIO.phone}</a><br /><a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a></p></div>
      <div><p className="eyebrow pink">HOURS</p><p>Tue–Sat · 12:00–19:00<br />Sun + Mon · By appointment</p><button className="text-link light" onClick={openBooking}>Start a booking <Arrow /></button></div>
      <div><p className="eyebrow pink">NEWSLETTER</p><p>New flash, guest artists and studio news.</p><Newsletter compact /></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} NEON NEEDLE STUDIO</span><div><a href="/aftercare">Aftercare</a><a href="/booking-policy">Booking policy</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/accessibility">Accessibility</a></div></div>
  </footer>;
}

function Honeypot() {
  return <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />;
}

function Newsletter({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | SendResult>("idle");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("website")) return setState("sent");
    setState("sending");
    const name = [f.get("first"), f.get("last")].filter(Boolean).join(" ");
    setState(await sendForm("Newsletter signup", { name, email: String(f.get("email") || "") }));
  };
  if (state === "sent") return <div className="success">Thanks, you're on the list.</div>;
  if (state === "mailto") return <div className="success">Your email app should have opened. Send the message to finish signing up.</div>;
  return <form className={compact ? "newsletter compact" : "newsletter"} onSubmit={submit}>
    {!compact && <><label>First name<input name="first" required autoComplete="given-name" /></label><label>Last name<input name="last" required autoComplete="family-name" /></label></>}
    <label>{compact ? <span className="sr-only">Email</span> : "Email"}<input name="email" required type="email" autoComplete="email" placeholder="you@email.com" /></label>
    <Honeypot />
    <Button type="submit" variant={compact ? "light" : "dark"} disabled={state === "sending"}>{compact ? "JOIN" : "SIGN ME UP"} <Arrow /></Button>
    {state === "failed" && <p className="form-note" role="alert">That didn't go through. Please try again or email us.</p>}
  </form>;
}

function SectionTitle({ kicker, title, intro, align = "left" }: { kicker: string; title: ReactNode; intro?: string; align?: "left" | "center" }) {
  return <div className={`section-title ${align}`}><p className="eyebrow">{kicker}</p><h2>{title}</h2>{intro && <p className="section-intro">{intro}</p>}</div>;
}

function ArtistCard({ artist, openBooking, simple = false }: { artist: Artist; openBooking: (artist?: string) => void; simple?: boolean }) {
  return <article className={`artist-card ${simple ? "simple" : ""}`}>
    <div className="artist-image" style={{ backgroundColor: artist.color }}>
      {artist.image ? <img src={artist.image} alt={`Portrait of ${artist.full}`} loading="lazy" /> : <span className="artist-initial" aria-hidden="true">{artist.name[0]}</span>}
      {artist.isNew && <span className="new-badge">NEW HERE</span>}
    </div>
    <div className="artist-info"><div><p className="artist-role">{artist.role} · {artist.level}</p><h3>{artist.full}</h3></div>{artist.instagram && <a href={artist.instagram} target="_blank" rel="noreferrer">Instagram ↗</a>}</div>
    {!simple && <>
      <p>{artist.bio}</p>
      <div className="tags">{artist.styles.map((s) => <span key={s}>{s}</span>)}</div>
      {artist.role === "Resident"
        ? <Button variant="outline" onClick={() => openBooking(artist.name)}>BOOK WITH {artist.name.toUpperCase()} <Arrow /></Button>
        : artist.instagram
          ? <Button variant="outline" href={artist.instagram}>MESSAGE ON INSTAGRAM <Arrow /></Button>
          : <Button variant="outline" href="/contact">ASK ABOUT BOOKING <Arrow /></Button>}
    </>}
    {simple && <p className="indie-bio">{artist.bio}</p>}
  </article>;
}

function Home({ openBooking }: { openBooking: (artist?: string) => void }) {
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [openFaq, setOpenFaq] = useState(0);
  const status = useMemo(openStatus, []);
  const categories = useMemo(() => ["All", ...Array.from(new Set(portfolio.map((w) => w.category)))], []);
  return <>
    <main id="main">
      <section className="hero">
        <img src={PHOTOS.hero} alt="Tattoo artist working on a client's arm" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow light">TATTOO STUDIO · LITTLE PORTUGAL, TORONTO</p>
          <h1>CUSTOM TATTOOS<br />DRAWN <em>WITH YOU.</em></h1>
          <p>Fine line, black and grey, colour, illustration and florals. Send us your idea, or drop in on a flash day.</p>
          <div className="button-row"><Button onClick={() => openBooking()}>BOOK A TATTOO <Arrow /></Button><Button href="/artists" variant="light">MEET THE ARTISTS <Arrow /></Button></div>
        </div>
        <div className="trust-strip">{["Step-free entrance", "Walk-ins when there's space", "First tattoos welcome", "Sterile equipment"].map((x) => <span key={x}>{x}</span>)}</div>
      </section>

      <section className="intro wrap">
        <div><p className="eyebrow">ABOUT THE STUDIO</p></div>
        <div className="intro-copy"><h2>A custom tattoo studio on Dundas West.</h2><p>Neon Needle is in Little Portugal, Toronto. Our artists do fine line, black and grey, colour, illustrative and floral work. Most of it is custom, and we keep room for flash and walk-ins.</p><p>The space is step-free, and plenty of our clients are getting their first tattoo. Ask as many questions as you like. Nobody will rush you.</p><p>Visiting from out of town? <a href="/visit">What to know before you book <Arrow /></a></p></div>
      </section>

      <section className="artists-section">
        <div className="wrap"><SectionTitle kicker="RESIDENT ARTISTS" title={<>Our <em>artists</em></>} intro="Four artists work here full time. Book with them through the studio." /></div>
        <div className="artist-scroll">{artists.filter((a) => a.role === "Resident").map((a) => <ArtistCard key={a.name} artist={a} openBooking={openBooking} />)}</div>
        <div className="wrap section-link"><a className="text-link" href="/artists">SEE EVERY ARTIST <Arrow /></a></div>
      </section>

      <section className="independent wrap"><SectionTitle kicker="INDEPENDENT ARTISTS" title={<>Also <em>here</em></>} intro="These artists rent space in the studio and take their own bookings." />
        <div className="indie-grid">{artists.filter((a) => a.role === "Independent").map((a) => <ArtistCard simple key={a.name} artist={a} openBooking={openBooking} />)}</div>
      </section>

      <section className="studio-band">
        <img src={PHOTOS.studio} alt="Inside the studio" loading="lazy" />
        <div className="walkin-board"><span>WALK-INS</span><strong>USUALLY<br />YES.</strong><p>Call first so we can<br />check the schedule.</p></div>
      </section>

      <section className="pricing-preview wrap"><SectionTitle kicker="PRICING" title={<>What it <em>costs</em></>} intro="Starting points so you can plan. Your artist confirms the final price before any work begins." />
        <div className="price-grid">{pricing.slice(0, 3).map((p, i) => <article className="price-card" key={p.name}><span className="price-number">0{i + 1}</span><h3>{p.name}</h3><strong>{p.price}</strong><p>{p.text}</p><span className="deposit">{p.deposit}</span></article>)}</div>
        <div className="center"><Button href="/pricing" variant="dark">SEE ALL PRICING <Arrow /></Button></div>
      </section>

      <section className="newsletter-section"><div><p className="eyebrow">NEWSLETTER</p><h2>NEW FLASH,<br />ONCE A <em>MONTH.</em></h2><p>Fresh flash sheets, guest artists and studio news. No more than one email a month.</p></div><Newsletter /></section>

      {portfolio.length > 0 && <section className="gallery-section wrap">
        <SectionTitle kicker="RECENT WORK" title={<>From <em>the studio</em></>} />
        <div className="filter-row">{categories.map((f) => <button className={galleryFilter === f ? "active" : ""} onClick={() => setGalleryFilter(f)} key={f}>{f}</button>)}</div>
        <div className="gallery-grid">{portfolio.filter((g) => galleryFilter === "All" || g.category === galleryFilter).map((g) => <figure className="gallery-photo" key={g.src}><img src={g.src} alt={g.alt} loading="lazy" /><figcaption>{g.artist}</figcaption></figure>)}</div>
      </section>}

      <section className="faq-section wrap"><SectionTitle kicker="FAQ" title={<>Common <em>questions</em></>} />
        <div className="faq-layout"><p>Something else?<br /><a href="/contact">Ask us directly →</a></p><div className="accordion">{faqs.slice(0, 6).map((f, i) => <article className={openFaq === i ? "faq-open" : ""} key={f[0]}><button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}><span>{String(i + 1).padStart(2, "0")}</span><strong>{f[0]}</strong><b aria-hidden="true">{openFaq === i ? "−" : "+"}</b></button>{openFaq === i && <p>{f[1]}</p>}</article>)}</div></div>
        <p className="faq-more"><a href="/faq">All questions →</a></p>
      </section>

      <section className="find-us">
        <div className="map-art"><iframe title="Map showing the studio location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(STUDIO.mapsQuery)}&output=embed`} /></div>
        <div className="find-copy"><p className="eyebrow pink">FIND US</p><h2>ON DUNDAS<br />STREET <em>WEST.</em></h2><p>{STUDIO.address.map((l, i) => <span key={l}>{l}{i < STUDIO.address.length - 1 && <br />}</span>)}</p><p>Step-free entrance and accessible washroom.</p><div className="open-pill"><i /> {status.toUpperCase()}</div><Button href="/visit" variant="light">VISITING TORONTO? <Arrow /></Button></div>
      </section>

      {STUDIO.communityPartner && <section className="community wrap"><div className="community-art">COMMUNITY<br /><em>SHELF</em></div><div><p className="eyebrow">COMMUNITY SHELF</p><h2>Bring a can.</h2><p>There's a shelf by the front door for unopened, non-perishable food. We pass it on to {STUDIO.communityPartner}. Drop something off whenever we're open, appointment or not.</p></div></section>}

      <section className="final-cta"><p className="eyebrow light">GOT AN IDEA?</p><h2>TELL US<br />ABOUT <em>IT.</em></h2><Button onClick={() => openBooking()}>START A BOOKING <Arrow /></Button></section>
    </main>
  </>;
}

function PageHero({ kicker, title, text }: { kicker: string; title: ReactNode; text: string }) {
  return <header className="page-hero"><p className="eyebrow">{kicker}</p><h1>{title}</h1><p>{text}</p></header>;
}

function ArtistsPage({ openBooking }: { openBooking: (artist?: string) => void }) {
  const [role, setRole] = useState("All");
  return <main id="main" className="page wrap"><PageHero kicker="ARTISTS" title={<>Our <em>artists</em></>} text="Four residents and six independents work from the studio. Residents book through us. Independents take their own bookings." />
    <div className="filter-row">{["All", "Resident", "Independent"].map((x) => <button key={x} className={role === x ? "active" : ""} onClick={() => setRole(x)}>{x}</button>)}</div>
    <div className="full-artist-grid">{artists.filter((a) => role === "All" || a.role === role).map((a) => <ArtistCard key={a.name} artist={a} openBooking={openBooking} />)}</div>
  </main>;
}

function PricingPage({ openBooking }: { openBooking: () => void }) {
  const [size, setSize] = useState(1);
  const estimate = [["$40–$70", "$20"], ["$80–$150", "$40"], ["$120–$270", "$60"], ["$350–$550", "$100"]][size];
  return <main id="main" className="page wrap"><PageHero kicker="PRICING" title={<>What it <em>costs</em></>} text="Starting points to help you plan. Your artist gives you a firm quote before any work starts." />
    <div className="price-grid full">{pricing.map((p, i) => <article className="price-card" key={p.name}><span className="price-number">{String(i + 1).padStart(2, "0")}</span><h3>{p.name}</h3><strong>{p.price}</strong><p>{p.text}</p><span className="deposit">{p.deposit}</span></article>)}</div>
    <section className="estimator"><div><p className="eyebrow pink">ROUGH ESTIMATE</p><h2>Work out a ballpark.</h2><p>This is only a guide. The final price depends on your design and your artist.</p></div><div className="estimate-form"><label>Approximate size<select value={size} onChange={(e) => setSize(Number(e.target.value))}><option value={0}>Coin-sized</option><option value={1}>Palm-sized</option><option value={2}>Forearm</option><option value={3}>Full day</option></select></label><div className="estimate-total"><span>ESTIMATE</span><strong>{estimate[0]}</strong><small>Deposit: {estimate[1]}</small></div><Button onClick={openBooking}>START A BOOKING <Arrow /></Button></div></section>
  </main>;
}

function VisitPage({ openBooking }: { openBooking: () => void }) {
  const items: [string, string][] = [
    ["Book ahead", "Send your idea through the booking form before you travel. We reply within a week, so ask early."],
    ["Step-free", "The entrance, studio floor and washroom are all step-free."],
    ["Walk-ins", "We take them when an artist has space. Call before you come, especially at weekends."],
    ["First tattoo", "We explain each step before it happens, and you can stop whenever you need to."],
    ["Payment", "We take card payments."],
    ["Getting here", "We're at 1171 Dundas Street West in Little Portugal. The 505 Dundas streetcar stops nearby."],
  ];
  return <main id="main"><section className="visit-hero"><img src={PHOTOS.session} alt="A client getting tattooed" /><div><p className="eyebrow light">VISITING TORONTO</p><h1>TATTOOED<br />IN <em>TORONTO.</em></h1><p>We're at 1171 Dundas Street West in Little Portugal. Book before you arrive and you'll have a design waiting when you get here.</p><Button onClick={openBooking}>START A BOOKING <Arrow /></Button></div></section><section className="wrap travel"><SectionTitle kicker="PLANNING A VISIT" title={<>What to <em>know</em></>} /><div className="benefit-grid">{items.map(([t, d], i) => <article key={t}><span>0{i + 1}</span><h3>{t}</h3><p>{d}</p></article>)}</div><div className="checklist"><div><p className="eyebrow pink">CHECKLIST</p><h2>Before you pack.</h2></div><ol>{["Book and arrange your deposit early", "Bring valid photo ID", "Eat a proper meal beforehand", "Avoid swimming while it heals", "Pack loose clothing and aftercare"].map((x) => <li key={x}>{x}</li>)}</ol></div></section></main>;
}

function FAQPage() {
  const [q, setQ] = useState("");
  const shown = faqs.filter((x) => x.join(" ").toLowerCase().includes(q.toLowerCase()));
  return <main id="main" className="page wrap"><PageHero kicker="FAQ" title={<>Common <em>questions</em></>} text="Booking, deposits, access and what to bring." /><label className="search">Search questions<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “deposit” or “walk-in”" /></label><div className="faq-cards">{shown.map((f) => <article key={f[0]}><h3>{f[0]}</h3><p>{f[1]}</p></article>)}{shown.length === 0 && <p>No match. <a href="/contact"><u>Ask us directly.</u></a></p>}</div></main>;
}

function ContactPage() {
  const [state, setState] = useState<"idle" | "sending" | SendResult>("idle");
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("website")) return setState("sent");
    setState("sending");
    setState(await sendForm("Contact message", { name: String(f.get("name") || ""), email: String(f.get("email") || ""), subject: String(f.get("subject") || ""), message: String(f.get("message") || "") }));
  };
  return <main id="main" className="page wrap contact-page"><PageHero kicker="CONTACT" title={<>Get in <em>touch.</em></>} text="For general questions and access needs. To request a tattoo, use the booking form." /><section className="contact-details" aria-label="Studio contact details"><article><p className="eyebrow pink">CALL</p><a href={STUDIO.phoneHref}>{STUDIO.phone}</a></article><article><p className="eyebrow pink">EMAIL</p><a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a></article><article><p className="eyebrow pink">VISIT</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STUDIO.mapsQuery)}`} target="_blank" rel="noreferrer">{STUDIO.address.map((l, i) => <span key={l}>{l}{i < STUDIO.address.length - 1 && <br />}</span>)}</a></article></section>
    {state === "sent" ? <div className="sent-card"><h2>Message sent.</h2><p>Thanks. We usually reply within two studio days.</p></div>
      : state === "mailto" ? <div className="sent-card"><h2>Check your email app.</h2><p>We've opened a message to {STUDIO.email} with your details. Send it to finish.</p></div>
      : <form className="contact-form" onSubmit={submit}><label>Name<input name="name" required autoComplete="name" /></label><label>Email<input name="email" required type="email" autoComplete="email" /></label><label>Subject<select name="subject"><option>General question</option><option>Accessibility</option><option>Press and partnerships</option></select></label><label className="wide">Message<textarea name="message" required rows={6} /></label><Honeypot /><Button type="submit" disabled={state === "sending"}>SEND MESSAGE <Arrow /></Button>{state === "failed" && <p className="form-note wide" role="alert">That didn't go through. Please try again or email {STUDIO.email}.</p>}</form>}</main>;
}

function AftercarePage() {
  const steps = [["FIRST FEW HOURS", "Leave the covering your artist applied on for as long as they tell you. Wash your hands before touching the area."], ["DAYS 1–3", "Wash gently with fragrance-free soap, pat dry, and use a very thin layer of the aftercare your artist recommended."], ["WEEKS 1–2", "Flaking and mild itching are normal. Don't pick, scratch or soak the tattoo, and wear loose, clean clothes over it."], ["WEEKS 3–4", "The surface can look healed while the skin underneath is still settling. Moisturise lightly and use high-SPF sunscreen."], ["WHEN TO GET IN TOUCH", "Contact us if redness, heat, swelling or pain gets worse instead of better. For severe or urgent symptoms, see a doctor."]];
  return <main id="main" className="page wrap"><PageHero kicker="AFTERCARE" title={<>Looking after <em>your tattoo.</em></>} text="Follow your artist's advice first. This is general information, not medical advice." /><div className="aftercare">{steps.map((s, i) => <article key={s[0]}><span>{String(i + 1).padStart(2, "0")}</span><div><p className="eyebrow pink">{s[0]}</p><p>{s[1]}</p></div></article>)}</div><Button variant="dark" onClick={() => window.print()}>PRINT THIS PAGE</Button></main>;
}

type Section = [string, string];
const LEGAL: Record<string, { title: string; intro: string; sections: Section[] }> = {
  privacy: {
    title: "Privacy policy",
    intro: "What we collect through this website, why, and who sees it.",
    sections: [
      ["What we collect", "When you send a booking request we collect your name, email, phone number, date of birth, details of your tattoo idea, any health or access information you choose to share, and an emergency contact. The contact form and newsletter collect your name and email."],
      ["Why we collect it", "To reply to you, plan and carry out your appointment safely, and send the newsletter if you signed up. We don't sell your information."],
      ["Who sees it", "The studio team, and the service that delivers website form submissions to our inbox. Booking drafts are kept in your own browser until you send them. Health details are never saved in the draft."],
      ["Cookies and analytics", "This website doesn't use advertising cookies or analytics. If that changes we'll update this page."],
      ["How long we keep it", "Only as long as we need it for your appointment, aftercare and our legal obligations."],
      ["Your rights", `You can ask to see, correct or delete your information, or unsubscribe from the newsletter at any time. Email ${STUDIO.email}.`],
    ],
  },
  terms: {
    title: "Website terms",
    intro: "The basics of using this website.",
    sections: [
      ["Using the site", "You can browse this site and send us booking requests, messages and newsletter signups. Please give accurate information and don't misuse the forms."],
      ["Booking requests", "Sending a request doesn't guarantee an appointment. A booking is confirmed only when an artist replies to accept it."],
      ["Prices", "Prices on this site are starting points. Your artist confirms the final price before work begins."],
      ["Artwork and images", "Artwork and photos on this site belong to the studio and its artists. Please don't reuse them without permission."],
      ["Contact", `Questions about these terms: ${STUDIO.email}.`],
    ],
  },
  accessibility: {
    title: "Accessibility",
    intro: "Access to the studio and to this website.",
    sections: [
      ["The studio", "Our entrance, studio floor and washroom are step-free. If you have other access needs, tell us when you book and we'll plan around them."],
      ["This website", "We're working to make the site usable with a keyboard and screen reader, with readable text and clear focus states."],
      ["Barriers", `If you find something hard to use, email ${STUDIO.email} or call ${STUDIO.phone}. We'll help you directly and fix the problem.`],
    ],
  },
  "booking-policy": {
    title: "Booking policy",
    intro: "Deposits, rescheduling and age requirements.",
    sections: [
      ["Deposits", "Once an artist accepts your request we'll email you to arrange a deposit. It comes off your final total. Deposits are non-refundable."],
      ["Rescheduling", "You can move your deposit to a new date up to three times within one year. Please give at least 48 hours' notice."],
      ["Age", "Clients 18 and over can book as normal. At 17 a parent or guardian must give consent and stay for the whole appointment. We can't tattoo anyone under 17."],
      ["ID", "Bring valid photo ID to your appointment."],
      ["Touch-ups", "Touch-ups are free within 60 days of a tattoo done here."],
    ],
  },
};

function LegalPage({ type }: { type: string }) {
  const doc = LEGAL[type];
  return <main id="main" className="page wrap legal"><PageHero kicker="NEON NEEDLE STUDIO" title={<em>{doc.title}</em>} text={doc.intro} />{doc.sections.map(([h, p]) => <section key={h}><h2>{h}</h2><p>{p}</p></section>)}<p className="legal-date">Last updated October 2026.</p></main>;
}

function NotFound() {
  return <main id="main" className="page wrap"><PageHero kicker="404" title={<>Page not <em>found.</em></>} text="That page doesn't exist or has moved." /><Button href="/" variant="dark">BACK TO HOME</Button></main>;
}

type BookingData = { service: string; artist: string; styles: string[]; placement: string; size: string; idea: string; budget: string; name: string; email: string; phone: string; dob: string; guardian: string; notes: string; emergencyName: string; emergencyPhone: string; policy: boolean };
const initialBooking: BookingData = { service: "Custom design", artist: "No preference", styles: [], placement: "", size: "Palm", idea: "", budget: "$80–$150", name: "", email: "", phone: "", dob: "", guardian: "", notes: "", emergencyName: "", emergencyPhone: "", policy: false };

// Only non-sensitive fields are kept as a draft in the browser.
function draftOf(d: BookingData) {
  const { dob, guardian, notes, emergencyName, emergencyPhone, policy, ...safe } = d;
  return safe;
}

function BookingWizard({ modal = false, close, initialArtist }: { modal?: boolean; close?: () => void; initialArtist?: string }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [data, setData] = useState<BookingData>(() => {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("nns-booking") || "{}"); } catch { /* ignore */ }
    return { ...initialBooking, ...saved, ...(initialArtist ? { artist: initialArtist } : {}) };
  });
  useEffect(() => { try { localStorage.setItem("nns-booking", JSON.stringify(draftOf(data))); } catch { /* ignore */ } }, [data]);
  useEffect(() => {
    if (!modal || !close) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, close]);
  const age = data.dob ? Math.floor((Date.now() - new Date(data.dob).getTime()) / 31557600000) : 99;
  const deposit = data.service === "Consultation only" ? "$0" : data.size === "Coin" ? "$20" : data.size === "Palm" ? "$40" : "$60";
  const update = <K extends keyof BookingData>(key: K, value: BookingData[K]) => setData((d) => ({ ...d, [key]: value }));
  const next = () => {
    if (step === 1 && (!data.placement || data.idea.trim().length < 20)) return setError("Choose a placement and describe your idea in a little more detail.");
    if (step === 2 && (!data.name.trim() || !data.email.trim() || !data.dob)) return setError("Please enter your name, email and date of birth.");
    if (step === 2 && !/^\S+@\S+\.\S+$/.test(data.email)) return setError("That email address doesn't look right.");
    if (step === 2 && age < 17) return setError("We can't tattoo anyone under 17. Thanks for understanding.");
    if (step === 2 && age === 17 && !data.guardian.trim()) return setError("We need the name of a parent or guardian for 17-year-old clients.");
    setError(""); setStep((s) => Math.min(3, s + 1));
  };
  const submit = async () => {
    if (!data.policy) return setError("Please accept the booking and deposit policy.");
    setSending(true); setError("");
    const id = `NNS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    const result = await sendForm(`Booking request ${id}`, {
      reference: id, service: data.service, artist: data.artist, styles: data.styles.join(", "), placement: data.placement, size: data.size, budget: data.budget,
      idea: data.idea, name: data.name, email: data.email, phone: data.phone, dateOfBirth: data.dob, guardian: data.guardian,
      healthAndAccessNotes: data.notes, emergencyContact: `${data.emergencyName} ${data.emergencyPhone}`.trim(), estimatedDeposit: deposit,
    });
    setSending(false);
    if (result === "failed") return setError(`We couldn't send your request. Please try again, or email ${STUDIO.email}.`);
    try {
      localStorage.setItem("nns-confirmation", JSON.stringify({ id, name: data.name, artist: data.artist, deposit, via: result }));
      localStorage.removeItem("nns-booking");
    } catch { /* ignore */ }
    close?.();
    navigate(`/book/confirmation/${id}`);
  };
  return <div className={modal ? "modal-shell" : "booking-page"}>{modal && <div className="modal-scrim" onClick={close} />}
    <main className="booking-wizard" {...(modal ? { role: "dialog", "aria-modal": true, "aria-label": "Booking request" } : {})}>
      <div className="booking-top"><Logo />{modal && <button onClick={close} className="close-btn" aria-label="Close">×</button>}</div>
      <div className="progress"><div><span style={{ width: `${(step / 3) * 100}%` }} /></div><p>STEP {step} OF 3</p></div>
      {step === 1 && <section><p className="eyebrow pink">YOUR TATTOO</p><h1>What are you<br /><em>after?</em></h1>
        <fieldset><legend>What can we help with?</legend><div className="radio-cards">{["Custom design", "Flash piece", "Cover-up", "Rework / Touch-up", "Walk-in request", "Consultation only"].map((x) => <label className={data.service === x ? "selected" : ""} key={x}><input type="radio" name="service" checked={data.service === x} onChange={() => update("service", x)} />{x}</label>)}</div></fieldset>
        <div className="form-grid"><label>Preferred artist<select value={data.artist} onChange={(e) => update("artist", e.target.value)}><option>No preference</option>{artists.filter((a) => a.role === "Resident").map((a) => <option key={a.name}>{a.name}</option>)}</select></label><label>Body placement<select value={data.placement} onChange={(e) => update("placement", e.target.value)}><option value="">Choose placement</option>{["Arm", "Leg", "Torso", "Back", "Neck", "Hand / foot", "Other"].map((x) => <option key={x}>{x}</option>)}</select></label><label>Approximate size<select value={data.size} onChange={(e) => update("size", e.target.value)}>{["Coin", "Palm", "Forearm", "Half sleeve", "Full sleeve", "Back piece"].map((x) => <option key={x}>{x}</option>)}</select></label><label>Budget<select value={data.budget} onChange={(e) => update("budget", e.target.value)}>{["$40–$70", "$80–$150", "$150–$300", "$350–$550", "Not sure"].map((x) => <option key={x}>{x}</option>)}</select></label></div>
        <fieldset><legend>Style (pick any that fit)</legend><div className="chips">{["Fine line", "Black & grey", "Colour", "Floral", "Illustrative", "Script", "Ornamental", "Realism"].map((x) => <button type="button" aria-pressed={data.styles.includes(x)} className={data.styles.includes(x) ? "active" : ""} key={x} onClick={() => update("styles", data.styles.includes(x) ? data.styles.filter((s) => s !== x) : [...data.styles, x])}>{x}</button>)}</div></fieldset>
        <label>Describe your idea<textarea rows={5} maxLength={1000} value={data.idea} onChange={(e) => update("idea", e.target.value)} placeholder="What it is, any references, colours, and any text to include." /></label>
      </section>}
      {step === 2 && <section><p className="eyebrow pink">ABOUT YOU</p><h1>Your<br /><em>details.</em></h1><div className="form-grid"><label>Full name<input autoComplete="name" value={data.name} onChange={(e) => update("name", e.target.value)} /></label><label>Email<input type="email" autoComplete="email" value={data.email} onChange={(e) => update("email", e.target.value)} /></label><label>Phone / WhatsApp<input type="tel" autoComplete="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} /></label><label>Date of birth<input type="date" value={data.dob} onChange={(e) => update("dob", e.target.value)} /></label></div>{age < 17 && <div className="warning">Sorry, we can't tattoo anyone under 17.</div>}{age === 17 && <div className="guardian"><p>A parent or guardian must consent and stay for the whole appointment.</p><label>Parent / guardian full name<input value={data.guardian} onChange={(e) => update("guardian", e.target.value)} /></label></div>}<fieldset><legend>Health and access</legend><p className="help">Tell your artist about allergies, skin conditions, medications, blood thinners, pregnancy or breastfeeding, fainting, needle anxiety and access needs. Some conditions may need a doctor's note.</p><label>Notes (write “None” if nothing applies)<textarea rows={5} value={data.notes} onChange={(e) => update("notes", e.target.value)} /></label></fieldset><div className="form-grid"><label>Emergency contact name<input value={data.emergencyName} onChange={(e) => update("emergencyName", e.target.value)} /></label><label>Emergency contact phone<input type="tel" value={data.emergencyPhone} onChange={(e) => update("emergencyPhone", e.target.value)} /></label></div></section>}
      {step === 3 && <section><p className="eyebrow pink">REVIEW</p><h1>Check and<br /><em>send.</em></h1><div className="review"><dl><div><dt>Service</dt><dd>{data.service}</dd></div><div><dt>Artist</dt><dd>{data.artist}</dd></div><div><dt>Placement / size</dt><dd>{data.placement} · {data.size}</dd></div><div><dt>Your idea</dt><dd>{data.idea}</dd></div><div><dt>Contact</dt><dd>{data.name}<br />{data.email}</dd></div></dl><button onClick={() => setStep(1)}>Edit details</button></div><div className="payment-summary"><div><span>BUDGET</span><strong>{data.budget}</strong></div><div><span>DEPOSIT (IF ACCEPTED)</span><strong>{deposit}</strong></div><p>You don't pay anything now. If an artist accepts your request we'll email you to arrange the deposit, which comes off the final total. Your artist confirms the final price.</p></div><div className="policy-box"><h3>Deposit policy</h3><p>Deposits are non-refundable, but can be moved to a new date up to three times within a year with at least 48 hours' notice. <a href="/booking-policy" target="_blank" rel="noreferrer"><u>Full booking policy</u></a>.</p></div><label className="check"><input type="checkbox" checked={data.policy} onChange={(e) => update("policy", e.target.checked)} /><span>I agree to the booking and deposit policy and confirm these details are accurate.</span></label></section>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="wizard-actions">{step > 1 && <Button variant="outline" onClick={() => { setError(""); setStep(step - 1); }}>BACK</Button>}<Button disabled={sending} onClick={step === 3 ? submit : next}>{step === 3 ? (sending ? "SENDING…" : "SEND REQUEST") : "CONTINUE"} <Arrow /></Button></div>
    </main>
  </div>;
}

function ConfirmationPage() {
  let info: { id?: string; name?: string; artist?: string; deposit?: string; via?: string } = {};
  try { info = JSON.parse(localStorage.getItem("nns-confirmation") || "{}"); } catch { /* ignore */ }
  const first = info.name?.split(" ")[0];
  const mailto = info.via === "mailto";
  return <main className="confirmation"><div className="conf-mark">{mailto ? "✉" : "✓"}</div><p className="eyebrow pink">{mailto ? "ONE MORE STEP" : "REQUEST SENT"}</p><h1>{first ? `Thanks, ${first}.` : "Thanks."}</h1><p className="lead">{mailto ? `Your email app should have opened with your request filled in. Send it to ${STUDIO.email}. We haven't received anything until you do.` : "We've got your request. An artist will read it and we'll email you within a week."}</p><div className="conf-card"><span>REFERENCE</span><strong>{info.id || "—"}</strong><div><p>Artist<br /><b>{info.artist || "No preference"}</b></p><p>Deposit<br /><b>{info.deposit === "$0" ? "None needed" : `${info.deposit || "TBC"}, requested if accepted`}</b></p></div></div><div className="next-steps"><h2>What happens next</h2><ol><li><b>An artist reviews your request.</b><span>They look at the idea, placement and timing.</span></li><li><b>We email you.</b><span>You'll get a date, or a few questions about the design.</span></li><li><b>You pay the deposit.</b><span>Your date is held once the deposit is in.</span></li></ol></div><Button href="/" variant="dark">BACK TO HOME</Button></main>;
}

const TITLES: Record<string, string> = {
  "/": "Neon Needle Studio | Custom tattoos in Toronto",
  "/artists": "Artists | Neon Needle Studio",
  "/pricing": "Pricing | Neon Needle Studio",
  "/visit": "Getting tattooed in Toronto | Neon Needle Studio",
  "/faq": "FAQ | Neon Needle Studio",
  "/contact": "Contact | Neon Needle Studio",
  "/aftercare": "Aftercare | Neon Needle Studio",
  "/book": "Book a tattoo | Neon Needle Studio",
  "/privacy": "Privacy policy | Neon Needle Studio",
  "/terms": "Website terms | Neon Needle Studio",
  "/accessibility": "Accessibility | Neon Needle Studio",
  "/booking-policy": "Booking policy | Neon Needle Studio",
};

function App() {
  const [path, setPath] = useState(window.location.pathname.replace(/(.)\/$/, "$1"));
  const [booking, setBooking] = useState<{ open: boolean; artist?: string }>({ open: false });
  useEffect(() => {
    const sync = () => { setPath(window.location.pathname.replace(/(.)\/$/, "$1")); window.scrollTo(0, 0); };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target || a.hasAttribute("download")) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#") || a.origin !== window.location.origin) return;
      e.preventDefault();
      window.history.pushState({}, "", a.pathname + a.search);
      sync();
    };
    window.addEventListener("popstate", sync);
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("popstate", sync); document.removeEventListener("click", onClick); };
  }, []);
  useEffect(() => { document.title = path.startsWith("/book/confirmation/") ? "Request sent | Neon Needle Studio" : TITLES[path] ?? "Page not found | Neon Needle Studio"; }, [path]);
  const openBooking = (artist?: string) => setBooking({ open: true, artist });
  const isBookingPage = path === "/book";
  let page: ReactNode;
  if (path.startsWith("/book/confirmation/")) page = <ConfirmationPage />;
  else if (isBookingPage) page = <BookingWizard />;
  else if (path === "/artists") page = <ArtistsPage openBooking={openBooking} />;
  else if (path === "/pricing") page = <PricingPage openBooking={() => openBooking()} />;
  else if (path === "/visit") page = <VisitPage openBooking={() => openBooking()} />;
  else if (path === "/faq") page = <FAQPage />;
  else if (path === "/contact") page = <ContactPage />;
  else if (path === "/aftercare") page = <AftercarePage />;
  else if (LEGAL[path.slice(1)]) page = <LegalPage type={path.slice(1)} />;
  else if (path === "/") page = <Home openBooking={openBooking} />;
  else page = <NotFound />;
  if (isBookingPage || path.startsWith("/book/confirmation/")) return <>{page}</>;
  return <><a href="#main" className="skip-link">Skip to content</a><Header openBooking={() => openBooking()} />{page}<Footer openBooking={() => openBooking()} />{booking.open && <BookingWizard modal close={() => setBooking({ open: false })} initialArtist={booking.artist} />}</>;
}

export default App;
