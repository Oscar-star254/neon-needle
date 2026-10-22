import { FormEvent, ReactNode, useEffect, useState } from "react"
import { depositCents, formatMoney, type BookingRequest } from "../shared/booking"

const PHOTOS = {
  hero: "https://images.unsplash.com/photo-1775135981378-4e7c1767436d?auto=format&fit=crop&w=1800&q=85",
  studio: "/neon-needle-studio-interior.png",
  storefront: "/neon-needle-storefront.png",
  session:
    "https://images.unsplash.com/photo-1638458957842-d901372fed55?auto=format&fit=crop&w=1400&q=85",
}

const artists = [
  {
    name: "Maya",
    full: "Maya Bell",
    handle: "@mayamakesmarks",
    role: "Resident",
    level: "Senior",
    styles: ["Fine line", "Floral", "Script"],
    color: "#e9ff70",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    bio: "Maya makes delicate botanical work with a graphic edge. Her calm, collaborative appointments are especially loved by first-timers.",
  },
  {
    name: "Rio",
    full: "Rio Lane",
    handle: "@riolane.ink",
    role: "Resident",
    level: "Senior",
    styles: ["Black & grey", "Realism"],
    color: "#ff84bc",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    bio: "Rio’s thoughtful blackwork balances soft shading and crisp detail. Bring a memory, a photograph, or the start of a story.",
  },
  {
    name: "Nico",
    full: "Nico Hart",
    handle: "@nicoharttattoos",
    role: "Resident",
    level: "Junior",
    styles: ["Colour", "Illustrative"],
    color: "#ffb020",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    bio: "Nico turns curious creatures and bright ideas into playful keepsakes. A fresh voice in our studio, now taking small colour projects.",
    new: true,
  },
  {
    name: "Sol",
    full: "Sol Reyes",
    handle: "@sol.lines",
    role: "Resident",
    level: "Senior",
    styles: ["Ornamental", "Fine line"],
    color: "#9aa8ff",
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=800&q=80",
    bio: "Sol creates precise ornamental pieces that move naturally with the body. Their process is measured, warm, and always personal.",
  },
  {
    name: "Inez",
    full: "Inez Park",
    handle: "@inezafterdark",
    role: "Independent",
    level: "Senior",
    styles: ["Black & grey", "Script"],
    color: "#d7c5ff",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80",
    bio: "Bold lettering and shadowy, cinematic blackwork.",
  },
  {
    name: "Tavi",
    full: "Tavi Moss",
    handle: "@mossmarks",
    role: "Independent",
    level: "Senior",
    styles: ["Floral", "Colour"],
    color: "#b9fbc0",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    bio: "Loose florals, garden colour, and joyful oddities.",
  },
  {
    name: "Ari",
    full: "Ari June",
    handle: "@arijuneink",
    role: "Independent",
    level: "Senior",
    styles: ["Realism", "Portraits"],
    color: "#ffd6a5",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    bio: "Tender pet portraits and miniature realism.",
  },
  {
    name: "Bea",
    full: "Bea North",
    handle: "@beanorth",
    role: "Independent",
    level: "Senior",
    styles: ["Illustrative", "Colour"],
    color: "#ffc6ff",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    bio: "Storybook creatures in unexpected colour palettes.",
  },
  {
    name: "Kit",
    full: "Kit Monroe",
    handle: "@kitdoesdots",
    role: "Independent",
    level: "Senior",
    styles: ["Ornamental", "Dotwork"],
    color: "#caffbf",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    bio: "Meditative dotwork and architectural ornament.",
  },
  {
    name: "Jo",
    full: "Jo Sato",
    handle: "@josato.tattoo",
    role: "Independent",
    level: "Senior",
    styles: ["Fine line", "Micro"],
    color: "#a0c4ff",
    image:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=800&q=80",
    bio: "Tiny objects, gentle lines, and small moments.",
  },
]

const pricing = [
  {
    name: "Mini Flash",
    price: "$40–$70",
    deposit: "$20 deposit",
    text: "Small flat-rate piece under 5 cm. Tiny symbols, script, and minimalist linework.",
  },
  {
    name: "Classic",
    price: "$80–$150",
    deposit: "$40 deposit",
    text: "A palm-sized custom piece, usually completed in under two hours.",
  },
  {
    name: "Detail Session",
    price: "$60–$90/hr",
    deposit: "$60 deposit",
    text: "Larger custom work, with a two-hour minimum. Best for layered detail.",
  },
  {
    name: "Full Day",
    price: "$350–$550",
    deposit: "$100 deposit",
    text: "A five-to-six hour session and the best value for ambitious work.",
  },
  {
    name: "Cover-up",
    price: "From $120",
    deposit: "$60 deposit",
    text: "A considered rework plan, quoted after a one-to-one consultation.",
  },
  {
    name: "Touch-up",
    price: "$0–$40",
    deposit: "Usually no deposit",
    text: "Free within 60 days of your original Neon Needle tattoo.",
  },
]

const faqs = [
  [
    "How do I book?",
    "Share your idea through our booking form with as much detail as you can. We review every request personally and aim to reply within one week.",
  ],
  [
    "How do deposits work?",
    "Deposits secure your request and are deducted from your final total. They are non-refundable, but can move with your appointment up to three times in one year with 48 hours’ notice.",
  ],
  [
    "Do you take walk-ins?",
    "Yes, whenever an artist has space. Calling ahead is the best way to avoid a wait, especially at weekends.",
  ],
  [
    "I’m new to tattoos. Is that okay?",
    "Absolutely. We’ll explain every step, make room for questions, and never rush a decision. First tattoos are a studio favourite.",
  ],
  [
    "Is the studio accessible?",
    "Yes. Our entrance, studio floor, and washroom are wheelchair accessible. Tell us about any other access needs and we’ll plan with you.",
  ],
  [
    "Do you offer numbing cream?",
    "Yes, for $10 per tube. Ask before your appointment and apply it at least one hour before your session as directed.",
  ],
]

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: "pink" | "dark" | "light" | "outline"
  className?: string
  type?: "button" | "submit"
}

function Button({
  children,
  onClick,
  href,
  variant = "pink",
  className = "",
  type = "button",
}: ButtonProps) {
  const cls = `btn btn-${variant} ${className}`
  if (href)
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    )
  return (
    <button className={cls} onClick={onClick} type={type}>
      {children}
    </button>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13m-5-5 5 5-5 5" />
    </svg>
  )
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`logo ${light ? "logo-light" : ""}`}
      href="/"
      aria-label="Neon Needle home"
    >
      <svg viewBox="0 0 35 35" aria-hidden="true">
        <path d="M7 28 28 7M6 22l7 7M22 6l7 7" />
        <circle cx="17.5" cy="17.5" r="15" />
      </svg>
      <span>
        NEON
        <br />
        NEEDLE
      </span>
    </a>
  )
}

function Header({ openBooking }: { openBooking: () => void }) {
  const [menu, setMenu] = useState(false)
  const [notice, setNotice] = useState(true)
  return (
    <>
      {notice && (
        <div className="announcement">
          <span>FLASH DAYS EVERY TUESDAY + WEDNESDAY · TATTOOS FROM $40</span>
          <button
            onClick={() => setNotice(false)}
            aria-label="Dismiss announcement"
          >
            ×
          </button>
        </div>
      )}
      <header className="header">
        <Logo />
        <nav
          className={menu ? "nav nav-open" : "nav"}
          aria-label="Main navigation"
        >
          {["Artists", "Pricing", "Visit Toronto", "FAQ", "Contact"].map(
            (item) => (
              <a
                key={item}
                href={`/${item.split(" ")[0].toLowerCase()}`}
                onClick={() => setMenu(false)}
              >
                {item}
              </a>
            ),
          )}
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            Instagram ↗
          </a>
        </nav>
        <div className="header-actions">
          <Button onClick={openBooking}>
            BOOK A TATTOO <Arrow />
          </Button>
          <button
            className="menu-btn"
            onClick={() => setMenu(!menu)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
          </button>
        </div>
      </header>
    </>
  )
}

function Footer({ openBooking }: { openBooking: () => void }) {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Logo light />
          <p className="footer-tagline">
            Good tattoos.
            <br />
            <em>Kind people.</em>
          </p>
        </div>
        <div>
          <p className="eyebrow pink">COME SAY HELLO</p>
          <p>
            Lower Unit, 1171 Dundas Street West
            <br />
            Little Portugal
            <br />
            Toronto, Ontario, Canada
          </p>
          <p>
            <a href="tel:+12038950187">+1 203 895 0187</a>
            <br />
            <a href="mailto:info.neonneedle@gmail.com">
              info.neonneedle@gmail.com
            </a>
          </p>
        </div>
        <div>
          <p className="eyebrow pink">STUDIO HOURS</p>
          <p>
            Tue–Sat · 12:00–19:00
            <br />
            Sun + Mon · By appointment
          </p>
          <button className="text-link light" onClick={openBooking}>
            Start a booking <Arrow />
          </button>
        </div>
        <div>
          <p className="eyebrow pink">KEEP IN TOUCH</p>
          <p>
            Monthly flash, studio news,
            <br />
            and first dibs on guest spots.
          </p>
          <Newsletter compact />
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 NEON NEEDLE STUDIO</span>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/accessibility">Accessibility</a>
        </div>
        <span>Made with care in Toronto</span>
      </div>
    </footer>
  )
}

function Newsletter({ compact = false }: { compact?: boolean }) {
  const [done, setDone] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setDone(true)
  }
  if (done) return <div className="success">Thank you! You’re on the list.</div>
  return (
    <form
      className={compact ? "newsletter compact" : "newsletter"}
      onSubmit={submit}
    >
      {!compact && (
        <>
          <label>
            First name
            <input required placeholder="Your first name" />
          </label>
          <label>
            Last name
            <input required placeholder="Your last name" />
          </label>
        </>
      )}
      <label>
        {compact ? <span className="sr-only">Email</span> : "Email"}
        <input required type="email" placeholder="you@email.com" />
      </label>
      <Button type="submit" variant={compact ? "light" : "dark"}>
        {compact ? "JOIN" : "SIGN ME UP"} <Arrow />
      </Button>
    </form>
  )
}

function SectionTitle({
  kicker,
  title,
  intro,
  align = "left",
}: {
  kicker: string
  title: ReactNode
  intro?: string
  align?: "left" | "center"
}) {
  return (
    <div className={`section-title ${align}`}>
      <p className="eyebrow">{kicker}</p>
      <h2>{title}</h2>
      {intro && <p className="section-intro">{intro}</p>}
    </div>
  )
}

function ArtistCard({
  artist,
  openBooking,
  simple = false,
}: {
  artist: typeof artists[0]
  openBooking: (artist?: string) => void
  simple?: boolean
}) {
  return (
    <article className={`artist-card ${simple ? "simple" : ""}`}>
      <div className="artist-image" style={{ backgroundColor: artist.color }}>
        <img
          src={artist.image}
          alt={`${artist.full}, ${artist.role.toLowerCase()} tattoo artist`}
        />
        {artist.new && <span className="new-badge">NEW HERE</span>}
      </div>
      <div className="artist-info">
        <div>
          <p className="artist-role">
            {artist.role} · {artist.level}
          </p>
          <h3>{artist.full}</h3>
        </div>
        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          {artist.handle} ↗
        </a>
      </div>
      {!simple && (
        <>
          <p>{artist.bio}</p>
          <div className="tags">
            {artist.styles.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          {artist.role === "Resident" ? (
            <Button variant="outline" onClick={() => openBooking(artist.name)}>
              BOOK WITH {artist.name.toUpperCase()} <Arrow />
            </Button>
          ) : (
            <Button variant="outline" href="https://instagram.com">
              MESSAGE ON INSTAGRAM <Arrow />
            </Button>
          )}
        </>
      )}
    </article>
  )
}

function Home({ openBooking }: { openBooking: (artist?: string) => void }) {
  const [openFaq, setOpenFaq] = useState(0)
  return (
    <>
      <main id="main">
        <section className="hero">
          <img
            src={PHOTOS.hero}
            alt="Tattoo artist working carefully on a client’s arm"
          />
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow light">
              A KINDER KIND OF TATTOO STUDIO · TORONTO
            </p>
            <h1>
              CUSTOM TATTOOS
              <br />
              MADE <em>TOGETHER.</em>
            </h1>
            <p>
              Fine line, black & grey, expressive colour, illustration,
              florals—and plenty of time to make it feel right.
            </p>
            <div className="button-row">
              <Button onClick={() => openBooking()}>
                BOOK A TATTOO <Arrow />
              </Button>
              <Button href="/artists" variant="light">
                MEET THE ARTISTS <Arrow />
              </Button>
            </div>
          </div>
          <div className="trust-strip">
            {[
              "Fully accessible",
              "Walk-ins welcome",
              "First-timers welcome",
              "Sterile + safe",
            ].map((x) => (
              <span key={x}>
                <b>✦</b>
                {x}
              </span>
            ))}
          </div>
        </section>

        <section className="intro wrap">
          <div>
            <p className="eyebrow">THIS IS NEON NEEDLE</p>
            <div className="spark">✦</div>
          </div>
          <div className="intro-copy">
            <h2>
              Serious about the craft.
              <br />
              <em>Not serious about ourselves.</em>
            </h2>
            <p>
              We’re a custom tattoo studio in Toronto’s Little Portugal making
              fine line, black and grey, full-colour, illustrative, floral, and
              walk-in tattoos. Our process is one conversation at a time—no
              pressure, no posturing.
            </p>
            <p>
              Our fully accessible space welcomes first-timers, lifelong
              collectors, locals, and travellers alike. People choose us for
              considered design, rigorous hygiene, and appointments that feel
              comfortably human.
            </p>
            <p>
              Coming from out of town?{" "}
              <a href="/visit">
                Plan your tattoo trip to Toronto <Arrow />
              </a>
            </p>
          </div>
        </section>

        <section className="artists-section">
          <div className="wrap">
            <SectionTitle
              kicker="THE HOME TEAM"
              title={
                <>
                  Resident <em>artists</em>
                </>
              }
              intro="Different hands, shared standards. Meet the four artists who call Neon Needle home."
            />
          </div>
          <div className="artist-scroll">
            {artists.slice(0, 4).map((a) => (
              <ArtistCard key={a.name} artist={a} openBooking={openBooking} />
            ))}
          </div>
          <div className="wrap section-link">
            <a className="text-link" href="/artists">
              MEET EVERY ARTIST <Arrow />
            </a>
          </div>
        </section>

        <section className="independent wrap">
          <SectionTitle
            kicker="FRIENDS OF THE STUDIO"
            title={
              <>
                Independent <em>artists</em>
              </>
            }
            intro="Independent artists working from our space. Message them directly to book."
          />
          <div className="indie-grid">
            {artists.slice(4).map((a) => (
              <ArtistCard
                simple
                key={a.name}
                artist={a}
                openBooking={openBooking}
              />
            ))}
          </div>
        </section>

        <section className="studio-band">
          <img
            src={PHOTOS.studio}
            alt="Warm, welcoming studio lounge interior"
          />
          <div className="walkin-board">
            <span>WALK-INS</span>
            <strong>
              YES,
              <br />
              WHEN WE
              <br />
              CAN.
            </strong>
            <p>
              Call ahead.
              <br />
              We’ll save you a trip.
            </p>
          </div>
        </section>

        <section className="pricing-preview wrap">
          <SectionTitle
            kicker="CLEAR FROM THE START"
            title={
              <>
                Good work.
                <br />
                <em>Honest pricing.</em>
              </>
            }
            intro="Every tattoo is different. These starting points help you plan before your artist confirms the final price."
          />
          <div className="price-grid">
            {pricing.slice(0, 3).map((p, i) => (
              <article className="price-card" key={p.name}>
                <span className="price-number">0{i + 1}</span>
                <h3>{p.name}</h3>
                <strong>{p.price}</strong>
                <p>{p.text}</p>
                <span className="deposit">{p.deposit}</span>
              </article>
            ))}
          </div>
          <div className="center">
            <Button href="/pricing" variant="dark">
              SEE ALL PRICING <Arrow />
            </Button>
          </div>
        </section>

        <section className="newsletter-section">
          <div>
            <p className="eyebrow">LOW VOLUME, HIGH VALUE</p>
            <h2>
              NEWS, FLASH
              <br />& GOOD <em>STUFF.</em>
            </h2>
            <p>
              Giveaways, guest spots, fresh flash, and studio news. Once a
              month, maximum.
            </p>
          </div>
          <Newsletter />
        </section>

        <section className="faq-section wrap">
          <SectionTitle
            kicker="GOOD TO KNOW"
            title={
              <>
                Questions,
                <br />
                <em>meet answers.</em>
              </>
            }
          />
          <div className="faq-layout">
            <p>
              Can’t find what you need?
              <br />
              <a href="/contact">Ask us directly →</a>
            </p>
            <div className="accordion">
              {faqs.map((f, i) => (
                <article className={openFaq === i ? "faq-open" : ""} key={f[0]}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <strong>{f[0]}</strong>
                    <b>{openFaq === i ? "−" : "+"}</b>
                  </button>
                  {openFaq === i && <p>{f[1]}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="find-us">
          <div className="map-art">
            <img
              src={PHOTOS.storefront}
              alt="Street view of the Neon Needle studio storefront on Dundas Street West"
            />
            <span className="map-pin">
              ✦
              <small>
                NEON
                <br />
                NEEDLE
              </small>
            </span>
          </div>
          <div className="find-copy">
            <p className="eyebrow pink">FIND YOUR WAY</p>
            <h2>
              IN THE HEART
              <br />
              OF <em>TORONTO.</em>
            </h2>
            <p>
              Lower Unit, 1171 Dundas Street West
              <br />
              Little Portugal
              <br />
              Toronto, Ontario, Canada
            </p>
            <p>
              On Dundas Street West in Little Portugal.
              <br />
              Step-free entrance and accessible washroom.
            </p>
            <div className="open-pill">
              <i /> OPEN TODAY · UNTIL 7 PM
            </div>
            <Button href="/visit" variant="light">
              PLAN YOUR VISIT <Arrow />
            </Button>
          </div>
        </section>

        <section className="community wrap">
          <div className="community-art">
            GOOD
            <br />
            <em>INK.</em>
            <br />
            GOOD
            <br />
            <em>NEIGHBOURS.</em>
          </div>
          <div>
            <p className="eyebrow">COMMUNITY SHELF</p>
            <h2>
              Bring a can.
              <br />
              Leave some care.
            </h2>
            <p>
              Our community shelf collects unopened, non-perishable food for
              local mutual-aid partners. Donations are welcome whenever the
              studio is open—appointment or not.
            </p>
            <a className="text-link" href="/contact">
              ASK ABOUT DONATIONS <Arrow />
            </a>
          </div>
        </section>

        <section className="final-cta">
          <p className="eyebrow light">YOUR IDEA, OUR FULL ATTENTION</p>
          <h2>
            WE HOPE YOU’LL
            <br />
            <em>VISIT SOON.</em>
          </h2>
          <Button onClick={() => openBooking()}>
            START YOUR BOOKING <Arrow />
          </Button>
        </section>
      </main>
    </>
  )
}

function ArtistsPage({
  openBooking,
}: {
  openBooking: (artist?: string) => void
}) {
  const [role, setRole] = useState("All")
  return (
    <main className="page wrap">
      <PageHero
        kicker="MEET THE MAKERS"
        title={
          <>
            Ten artists.
            <br />
            <em>One lovely studio.</em>
          </>
        }
        text="Find a style that feels like you. Resident bookings come through the studio; independent artists book directly."
      />
      <div className="filter-row">
        {["All", "Resident", "Independent"].map((x) => (
          <button
            key={x}
            className={role === x ? "active" : ""}
            onClick={() => setRole(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="full-artist-grid">
        {artists
          .filter((a) => role === "All" || a.role === role)
          .map((a) => (
            <ArtistCard key={a.name} artist={a} openBooking={openBooking} />
          ))}
      </div>
    </main>
  )
}

function PricingPage({ openBooking }: { openBooking: () => void }) {
  const [size, setSize] = useState(1)
  const estimate = [
    ["$40–$70", "$20"],
    ["$80–$150", "$40"],
    ["$120–$270", "$60"],
    ["$350–$550", "$100"],
  ][size]
  return (
    <main className="page wrap">
      <PageHero
        kicker="NO MYSTERY MATH"
        title={
          <>
            Pricing with
            <br />
            <em>nothing hidden.</em>
          </>
        }
        text="Clear starting points, honest conversations, and a confirmed quote before the needle starts."
      />
      <div className="price-grid full">
        {pricing.map((p, i) => (
          <article className="price-card" key={p.name}>
            <span className="price-number">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{p.name}</h3>
            <strong>{p.price}</strong>
            <p>{p.text}</p>
            <span className="deposit">{p.deposit}</span>
          </article>
        ))}
      </div>
      <section className="estimator">
        <div>
          <p className="eyebrow pink">QUICK ESTIMATE</p>
          <h2>Build a ballpark.</h2>
          <p>
            Your artist always confirms the final quote after reviewing the
            idea.
          </p>
        </div>
        <div className="estimate-form">
          <label>
            Approximate size
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              <option value={0}>Coin-sized</option>
              <option value={1}>Palm-sized</option>
              <option value={2}>Forearm</option>
              <option value={3}>Full day</option>
            </select>
          </label>
          <label>
            Artist tier
            <select>
              <option>Senior artist</option>
              <option>Junior artist</option>
            </select>
          </label>
          <div className="estimate-total">
            <span>ESTIMATED TOTAL</span>
            <strong>{estimate[0]}</strong>
            <small>Deposit due: {estimate[1]}</small>
          </div>
          <Button onClick={openBooking}>
            BOOK YOUR IDEA <Arrow />
          </Button>
        </div>
      </section>
    </main>
  )
}

function PageHero({
  kicker,
  title,
  text,
}: {
  kicker: string
  title: ReactNode
  text: string
}) {
  return (
    <header className="page-hero">
      <p className="eyebrow">{kicker}</p>
      <h1>{title}</h1>
      <p>{text}</p>
    </header>
  )
}

function VisitPage({ openBooking }: { openBooking: () => void }) {
  return (
    <main>
      <section className="visit-hero">
        <img
          src={PHOTOS.session}
          alt="A client enjoying a calm tattoo appointment"
        />
        <div>
          <p className="eyebrow light">A SOUVENIR WITH A STORY</p>
          <h1>
            VISITING TORONTO?
            <br />
            <em>GET INKED.</em>
          </h1>
          <p>
            Find us in Little Portugal at 1171 Dundas Street West. Simple
            planning, a warm welcome, and art you’ll keep long after the trip
            home.
          </p>
          <Button onClick={openBooking}>
            PLAN YOUR TATTOO <Arrow />
          </Button>
        </div>
      </section>
      <section className="wrap travel">
        <SectionTitle
          kicker="TRAVEL LIGHT"
          title={
            <>
              We make it <em>easy.</em>
            </>
          }
        />
        <div className="benefit-grid">
          {[
            "Easy online booking",
            "Fully accessible",
            "Walk-ins most days",
            "First-timers welcome",
            "Card payments",
            "Little Portugal location",
          ].map((b, i) => (
            <article key={b}>
              <span>0{i + 1}</span>
              <h3>{b}</h3>
              <p>
                Clear details and thoughtful help from first message to final
                wrap.
              </p>
            </article>
          ))}
        </div>
        <div className="checklist">
          <div>
            <p className="eyebrow pink">YOUR TRIP CHECKLIST</p>
            <h2>Before you pack.</h2>
          </div>
          <ol>
            {[
              "Book and pay your deposit early",
              "Bring valid photo ID",
              "Eat a proper meal beforehand",
              "Plan swimming around healing",
              "Pack loose clothing and aftercare",
            ].map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  )
}

function FAQPage() {
  const [q, setQ] = useState("")
  return (
    <main className="page wrap">
      <PageHero
        kicker="ASK AWAY"
        title={
          <>
            Everything you
            <br />
            <em>need to know.</em>
          </>
        }
        text="Booking, pricing, safety, travel, and aftercare—plain answers, no studio jargon."
      />
      <label className="search">
        Search questions
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “deposit” or “walk-in”"
        />
      </label>
      <div className="faq-cards">
        {faqs
          .filter((x) => x.join(" ").toLowerCase().includes(q.toLowerCase()))
          .map((f) => (
            <article key={f[0]}>
              <p className="eyebrow">BOOKING + STUDIO</p>
              <h3>{f[0]}</h3>
              <p>{f[1]}</p>
            </article>
          ))}
      </div>
    </main>
  )
}

function ContactPage() {
  const [sent, setSent] = useState(false)
  return (
    <main className="page wrap contact-page">
      <PageHero
        kicker="WE’RE LISTENING"
        title={
          <>
            Tell us what’s
            <br />
            <em>on your mind.</em>
          </>
        }
        text="General question? Accessibility need? Say hello here. Tattoo requests belong in our booking form."
      />
      <section className="contact-details" aria-label="Studio contact details">
        <article>
          <p className="eyebrow pink">CALL</p>
          <a href="tel:+12038950187">+1 203 895 0187</a>
        </article>
        <article>
          <p className="eyebrow pink">EMAIL</p>
          <a href="mailto:info.neonneedle@gmail.com">
            info.neonneedle@gmail.com
          </a>
        </article>
        <article>
          <p className="eyebrow pink">VISIT</p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=1171+Dundas+Street+West+Toronto+Ontario"
            target="_blank"
            rel="noreferrer"
          >
            Lower Unit, 1171 Dundas Street West
            <br />
            Little Portugal, Toronto, Ontario
          </a>
        </article>
      </section>
      {sent ? (
        <div className="sent-card">
          <h2>Message received.</h2>
          <p>Thanks for reaching out. We’ll reply within two studio days.</p>
        </div>
      ) : (
        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <label>
            Name
            <input required />
          </label>
          <label>
            Email
            <input required type="email" />
          </label>
          <label>
            Subject
            <select>
              <option>General question</option>
              <option>Accessibility</option>
              <option>Press and partnerships</option>
            </select>
          </label>
          <label className="wide">
            Message
            <textarea required rows={6} />
          </label>
          <Button type="submit">
            SEND MESSAGE <Arrow />
          </Button>
        </form>
      )}
    </main>
  )
}

function AftercarePage() {
  const steps = [
    [
      "FIRST HOURS",
      "Keep the artist-applied covering in place for the time they recommend. Wash your hands before touching the area.",
    ],
    [
      "DAYS 1–3",
      "Gently clean with fragrance-free soap, pat dry, and apply only a very thin layer of recommended aftercare.",
    ],
    [
      "WEEK 1–2",
      "Flaking and mild itching are normal. Don’t pick, scratch, or soak the tattoo. Loose, clean clothing is your friend.",
    ],
    [
      "WEEKS 3–4",
      "The surface may look healed while deeper layers continue settling. Moisturise lightly and use high-SPF sun protection.",
    ],
    [
      "CONTACT US",
      "Get in touch if redness, heat, swelling, or discomfort increases. For urgent or severe symptoms, seek medical care.",
    ],
  ]
  return (
    <main className="page wrap">
      <PageHero
        kicker="HEAL BEAUTIFULLY"
        title={
          <>
            Your tattoo,
            <br />
            <em>day by day.</em>
          </>
        }
        text="Your artist’s personal advice always comes first. This guide is general information, not medical advice."
      />
      <div className="aftercare">
        {steps.map((s, i) => (
          <article key={s[0]}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="eyebrow pink">{s[0]}</p>
              <p>{s[1]}</p>
            </div>
          </article>
        ))}
      </div>
      <Button variant="dark" onClick={() => window.print()}>
        PRINT THIS GUIDE
      </Button>
    </main>
  )
}

type BookingData = BookingRequest
const initialBooking: BookingData = {
  service: "Custom design",
  artist: "No preference",
  styles: [],
  placement: "",
  size: "Palm",
  idea: "",
  budget: "$80–$150",
  first: "Yes",
  name: "",
  email: "",
  phone: "",
  dob: "",
  guardian: "",
  health: "",
  emergencyName: "",
  emergencyPhone: "",
  policy: false,
}

function BookingWizard({
  modal = false,
  close,
  initialArtist,
}: {
  modal?: boolean
  close?: () => void
  initialArtist?: string
}) {
  const cancelled =
    new URLSearchParams(window.location.search).get("cancelled") === "1"
  // Coming back from Stripe without paying: land on the review step with
  // everything still filled in.
  const [step, setStep] = useState(cancelled ? 3 : 1)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [data, setData] = useState<BookingData>(() => {
    try {
      return {
        ...initialBooking,
        ...JSON.parse(localStorage.getItem("nns-booking") || "{}"),
        ...(initialArtist ? { artist: initialArtist } : {}),
      }
    } catch {
      return initialBooking
    }
  })
  useEffect(() => {
    localStorage.setItem("nns-booking", JSON.stringify(data))
  }, [data])
  const age = data.dob
    ? Math.floor((Date.now() - new Date(data.dob).getTime()) / 31557600000)
    : 99
  const depositAmount = depositCents(data.service, data.size)
  const deposit = formatMoney(depositAmount)
  const update = <K extends keyof BookingData>(key: K, value: BookingData[K]) =>
    setData((d) => ({ ...d, [key]: value }))
  const next = () => {
    if (step === 1 && (!data.placement || data.idea.length < 20))
      return setError(
        "Add a placement and a little more detail about your idea.",
      )
    if (step === 2 && (!data.name || !data.email || !data.dob))
      return setError("Please complete your name, email, and date of birth.")
    if (step === 2 && age < 17)
      return setError(
        "We can’t accept tattoo bookings for clients under 17. Thank you for understanding.",
      )
    if (step === 2 && age === 17 && !data.guardian)
      return setError(
        "A parent or guardian name is required for 17-year-old clients.",
      )
    setError("")
    setStep((s) => Math.min(3, s + 1))
  }
  const submit = async () => {
    if (submitting) return
    if (!data.policy)
      return setError("Please accept the booking and deposit policy.")
    setError("")
    setSubmitting(true)
    try {
      // The server saves the booking, recalculates the deposit, and returns the
      // Stripe Checkout address (or the confirmation page for free consultations).
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || !result.url)
        throw new Error(
          result.error || "Something went wrong. Please try again.",
        )
      window.location.assign(result.url)
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "We couldn’t reach the booking service. Please check your connection and try again."
          : (e as Error).message,
      )
      setSubmitting(false)
    }
  }
  return (
    <div className={modal ? "modal-shell" : "booking-page"}>
      {modal && <div className="modal-scrim" onClick={close} />}
      <main className="booking-wizard">
        <div className="booking-top">
          <Logo />
          {modal && (
            <button onClick={close} className="close-btn" aria-label="Close">
              ×
            </button>
          )}
        </div>
        <div className="progress">
          <div>
            <span style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <p>STEP {step} OF 3</p>
        </div>
        {step === 1 && (
          <section>
            <p className="eyebrow pink">YOUR TATTOO</p>
            <h1>
              Let’s start with
              <br />
              <em>the idea.</em>
            </h1>
            <fieldset>
              <legend>What can we help with?</legend>
              <div className="radio-cards">
                {[
                  "Custom design",
                  "Flash piece",
                  "Cover-up",
                  "Rework / Touch-up",
                  "Walk-in request",
                  "Consultation only",
                ].map((x) => (
                  <label
                    className={data.service === x ? "selected" : ""}
                    key={x}
                  >
                    <input
                      type="radio"
                      name="service"
                      checked={data.service === x}
                      onChange={() => update("service", x)}
                    />
                    {x}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="form-grid">
              <label>
                Preferred artist
                <select
                  value={data.artist}
                  onChange={(e) => update("artist", e.target.value)}
                >
                  <option>No preference</option>
                  {artists.slice(0, 4).map((a) => (
                    <option key={a.name}>{a.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Body placement
                <select
                  value={data.placement}
                  onChange={(e) => update("placement", e.target.value)}
                >
                  <option value="">Choose placement</option>
                  {[
                    "Arm",
                    "Leg",
                    "Torso",
                    "Back",
                    "Neck",
                    "Hand / foot",
                    "Other",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Approximate size
                <select
                  value={data.size}
                  onChange={(e) => update("size", e.target.value)}
                >
                  {[
                    "Coin",
                    "Palm",
                    "Forearm",
                    "Half sleeve",
                    "Full sleeve",
                    "Back piece",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Budget
                <select
                  value={data.budget}
                  onChange={(e) => update("budget", e.target.value)}
                >
                  {[
                    "$40–$70",
                    "$80–$150",
                    "$150–$300",
                    "$350–$550",
                    "Not sure",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset>
              <legend>Style, select all that fit</legend>
              <div className="chips">
                {[
                  "Fine line",
                  "Black & grey",
                  "Colour",
                  "Floral",
                  "Illustrative",
                  "Script",
                  "Ornamental",
                  "Realism",
                ].map((x) => (
                  <button
                    type="button"
                    className={data.styles.includes(x) ? "active" : ""}
                    key={x}
                    onClick={() =>
                      update(
                        "styles",
                        data.styles.includes(x)
                          ? data.styles.filter((s) => s !== x)
                          : [...data.styles, x],
                      )
                    }
                  >
                    {x}
                  </button>
                ))}
              </div>
            </fieldset>
            <label>
              Describe your idea
              <textarea
                rows={5}
                maxLength={1000}
                value={data.idea}
                onChange={(e) => update("idea", e.target.value)}
                placeholder="Tell us about the meaning, references, colours, and any text to include…"
              />
            </label>
          </section>
        )}
        {step === 2 && (
          <section>
            <p className="eyebrow pink">ABOUT YOU</p>
            <h1>
              Now, a little
              <br />
              <em>about you.</em>
            </h1>
            <div className="form-grid">
              <label>
                Full name
                <input
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </label>
              <label>
                Phone / WhatsApp
                <input
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </label>
              <label>
                Date of birth
                <input
                  type="date"
                  value={data.dob}
                  onChange={(e) => update("dob", e.target.value)}
                />
              </label>
            </div>
            {age < 17 && (
              <div className="warning">
                We’re sorry, but studio policy does not allow us to tattoo
                clients under 17.
              </div>
            )}
            {age === 17 && (
              <div className="guardian">
                <p>
                  A parent or guardian must consent and stay for the full
                  appointment.
                </p>
                <label>
                  Parent / guardian full name
                  <input
                    value={data.guardian}
                    onChange={(e) => update("guardian", e.target.value)}
                  />
                </label>
              </div>
            )}
            <fieldset>
              <legend>Health + comfort</legend>
              <p className="help">
                Tell your artist about allergies, skin conditions, medications,
                blood thinners, pregnancy or breastfeeding, fainting, needle
                anxiety, and access needs. Some conditions may require medical
                clearance.
              </p>
              <label>
                Your notes (write “None” if none apply)
                <textarea
                  rows={5}
                  value={data.health}
                  onChange={(e) => update("health", e.target.value)}
                  placeholder="None, or share anything we should plan for…"
                />
              </label>
            </fieldset>
            <div className="form-grid">
              <label>
                Emergency contact name
                <input
                  value={data.emergencyName}
                  onChange={(e) => update("emergencyName", e.target.value)}
                />
              </label>
              <label>
                Emergency contact phone
                <input
                  value={data.emergencyPhone}
                  onChange={(e) => update("emergencyPhone", e.target.value)}
                />
              </label>
            </div>
          </section>
        )}
        {step === 3 && (
          <section>
            <p className="eyebrow pink">REVIEW + DEPOSIT</p>
            <h1>
              One last look.
              <br />
              <em>Then it’s ours.</em>
            </h1>
            <div className="review">
              <dl>
                <div>
                  <dt>Service</dt>
                  <dd>{data.service}</dd>
                </div>
                <div>
                  <dt>Artist</dt>
                  <dd>{data.artist}</dd>
                </div>
                <div>
                  <dt>Placement / size</dt>
                  <dd>
                    {data.placement} · {data.size}
                  </dd>
                </div>
                <div>
                  <dt>Your idea</dt>
                  <dd>{data.idea}</dd>
                </div>
                <div>
                  <dt>Client</dt>
                  <dd>
                    {data.name}
                    <br />
                    {data.email}
                  </dd>
                </div>
              </dl>
              <button onClick={() => setStep(1)}>Edit details</button>
            </div>
            <div className="payment-summary">
              <div>
                <span>ESTIMATED TOTAL</span>
                <strong>{data.budget}</strong>
              </div>
              <div>
                <span>DEPOSIT DUE NOW</span>
                <strong>
                  {deposit}
                  {depositAmount > 0 && " CAD"}
                </strong>
              </div>
              <p>
                Final pricing is confirmed by your artist. Your deposit comes
                off the final total.
              </p>
            </div>
            <div className="policy-box">
              <h3>Deposit policy</h3>
              <p>
                Deposits are non-refundable but transferable to a new date up to
                three times within one year. Give at least 48 hours’ notice to
                keep your deposit.
              </p>
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={data.policy}
                onChange={(e) => update("policy", e.target.checked)}
              />
              <span>
                I agree to the booking and deposit policy and confirm that the
                details above are accurate.
              </span>
            </label>
            <p className="secure">
              {depositAmount > 0
                ? "You’ll pay your deposit on Stripe’s secure checkout page. Cards, Apple Pay and Google Pay are accepted. We never see or store your card details."
                : "Consultation-only requests need no deposit. Nothing is charged."}
            </p>
          </section>
        )}
        {cancelled && step === 3 && !error && (
          <div className="warning" role="status">
            Payment wasn’t completed, so your request hasn’t been sent. Your
            details are saved below. Submit again when you’re ready.
          </div>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="wizard-actions">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                setError("")
                setStep(step - 1)
              }}
            >
              BACK
            </Button>
          )}
          <Button onClick={step === 3 ? submit : next}>
            {step === 3
              ? submitting
                ? "PLEASE WAIT…"
                : depositAmount > 0
                  ? "PAY DEPOSIT & REQUEST BOOKING"
                  : "SUBMIT BOOKING REQUEST"
              : "CONTINUE"}{" "}
            <Arrow />
          </Button>
        </div>
      </main>
    </div>
  )
}

type ConfirmationInfo = {
  reference: string
  status: string
  artist: string
  firstName: string
  depositCents: number
}

function ConfirmationPage() {
  const token = new URLSearchParams(window.location.search).get("t") || ""
  const [info, setInfo] = useState<ConfirmationInfo | null>(null)
  const [missing, setMissing] = useState(!token)
  const [tries, setTries] = useState(0)

  // Look the booking up. If Stripe's confirmation is still on its way, check
  // again every couple of seconds for up to ~20 seconds.
  useEffect(() => {
    if (!token) return
    let stop = false
    fetch(`/api/booking?t=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((b: ConfirmationInfo) => {
        if (stop) return
        setInfo(b)
        if (b.status === "pending_deposit" && tries < 10)
          setTimeout(() => !stop && setTries((n) => n + 1), 2000)
      })
      .catch(() => !stop && !info && setMissing(true))
    return () => {
      stop = true
    }
  }, [token, tries])

  // The request went through, so the saved draft is no longer needed.
  useEffect(() => {
    if (info && info.status !== "pending_deposit")
      localStorage.removeItem("nns-booking")
  }, [info])

  if (missing)
    return (
      <main className="confirmation">
        <p className="eyebrow pink">BOOKING NOT FOUND</p>
        <h1>We couldn’t find that booking.</h1>
        <p className="lead">
          If you just paid, you’ll receive a Stripe receipt by email and we’ll
          be in touch. Otherwise, you can start again or write to us.
        </p>
        <Button href="/book" variant="dark">
          START A BOOKING
        </Button>
      </main>
    )
  if (!info)
    return (
      <main className="confirmation">
        <p className="eyebrow pink">ONE MOMENT</p>
        <h1>Loading your booking…</h1>
      </main>
    )

  const paid = info.status !== "pending_deposit"
  const depositLabel =
    info.depositCents === 0
      ? "No deposit needed"
      : paid
        ? `${formatMoney(info.depositCents)} CAD received. Thank you!`
        : "Confirming your payment…"
  return (
    <main className="confirmation">
      <div className="conf-mark">{paid ? "✓" : "…"}</div>
      <p className="eyebrow pink">
        {paid ? "REQUEST RECEIVED" : "PAYMENT PROCESSING"}
      </p>
      <h1>Thanks, {info.firstName || "friend"}.</h1>
      <p className="lead">
        {paid
          ? "Your idea is officially in our hands. We’ll review the details and write back within one week."
          : "We’re waiting for Stripe to confirm your deposit. This usually takes a few seconds. If this message stays, don’t pay again: we’ll email you once it’s confirmed."}
      </p>
      <div className="conf-card">
        <span>BOOKING REFERENCE</span>
        <strong>{info.reference}</strong>
        <div>
          <p>
            Artist preference
            <br />
            <b>{info.artist || "No preference"}</b>
          </p>
          <p>
            Deposit status
            <br />
            <b>{depositLabel}</b>
          </p>
        </div>
      </div>
      <div className="next-steps">
        <h2>What happens next?</h2>
        <ol>
          <li>
            <b>We review your idea.</b>
            <span>An artist checks scope, placement, timing, and fit.</span>
          </li>
          <li>
            <b>We email you.</b>
            <span>Expect a reply with a date or a few helpful questions.</span>
          </li>
          <li>
            <b>We make something good.</b>
            <span>Eat well, arrive rested, and let’s create together.</span>
          </li>
        </ol>
      </div>
      <Button href="/" variant="dark">
        BACK TO HOME
      </Button>
    </main>
  )
}

function GenericPage({ type }: { type: string }) {
  const titles: Record<string, [string, string]> = {
    privacy: [
      "Privacy policy",
      "We collect only the information needed to manage enquiries, booking requests, and studio updates.",
    ],
    terms: [
      "Website terms",
      "These terms explain the responsible use of the Neon Needle website and studio services.",
    ],
    accessibility: [
      "Accessibility statement",
      "We want every part of our studio and website to feel usable, welcoming, and clear. Contact us if you encounter a barrier.",
    ],
    "booking-policy": [
      "Booking policy",
      "Deposits, rescheduling, age requirements, and studio expectations are outlined clearly here.",
    ],
  }
  const [title, text] = titles[type] || [
    "Fine tattoos, thoughtfully made.",
    `Explore ${type.replace(/-/g, " ")} at Neon Needle, then tell us what you’d love to make.`,
  ]
  return (
    <main className="page wrap legal">
      <PageHero
        kicker="NEON NEEDLE STUDIO"
        title={<em>{title}</em>}
        text={text}
      />
      <p>Last updated: March 2026</p>
      <h2>Our approach</h2>
      <p>
        {text} We use practical safeguards, respectful communication, and
        transparent policies.
      </p>
    </main>
  )
}

function Cookie() {
  const [show, setShow] = useState(
    () => localStorage.getItem("nns-cookie") !== "ok",
  )
  if (!show) return null
  return (
    <div className="cookie">
      <div>
        <strong>Your booking progress.</strong>
        <p>
          We use local browser storage only to save booking progress and site
          preferences.
        </p>
      </div>
      <button
        onClick={() => {
          localStorage.setItem("nns-cookie", "ok")
          setShow(false)
        }}
      >
        OKAY
      </button>
    </div>
  )
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [booking, setBooking] = useState<{ open: boolean; artist?: string }>({
    open: false,
  })
  useEffect(() => {
    const pop = () => {
      setPath(window.location.pathname)
      window.scrollTo(0, 0)
    }
    window.addEventListener("popstate", pop)
    document.addEventListener("click", (e) => {
      const a = (e.target as HTMLElement).closest("a")
      if (a && a.origin === location.origin && !a.target) {
        e.preventDefault()
        history.pushState({}, "", a.pathname)
        pop()
      }
    })
    return () => window.removeEventListener("popstate", pop)
  }, [])
  const openBooking = (artist?: string) => setBooking({ open: true, artist })
  const isBookingPage = path === "/book"
  let page: ReactNode
  if (path.startsWith("/book/confirmation/")) page = <ConfirmationPage />
  else if (isBookingPage) page = <BookingWizard />
  else if (path === "/artists") page = <ArtistsPage openBooking={openBooking} />
  else if (path === "/pricing")
    page = <PricingPage openBooking={() => openBooking()} />
  else if (path === "/visit")
    page = <VisitPage openBooking={() => openBooking()} />
  else if (path === "/faq") page = <FAQPage />
  else if (path === "/contact") page = <ContactPage />
  else if (path === "/aftercare") page = <AftercarePage />
  else if (
    ["/privacy", "/terms", "/accessibility", "/booking-policy"].includes(path)
  )
    page = <GenericPage type={path.slice(1)} />
  else if (path !== "/") page = <GenericPage type={path.slice(1)} />
  else page = <Home openBooking={openBooking} />
  if (isBookingPage || path.startsWith("/book/confirmation/"))
    return <>{page}</>
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header openBooking={() => openBooking()} />
      {page}
      <Footer openBooking={() => openBooking()} />
      {booking.open && (
        <BookingWizard
          modal
          close={() => setBooking({ open: false })}
          initialArtist={booking.artist}
        />
      )}
      <Cookie />
    </>
  )
}

export default App
