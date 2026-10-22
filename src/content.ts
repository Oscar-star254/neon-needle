// Everything you are likely to edit lives in this file.
// Search for "TODO" to find the things that need real information before launch.

export const STUDIO = {
  name: "Neon Needle Studio",
  phone: "+1 203 895 0187", // TODO: confirm. 203 is a Connecticut area code; Toronto numbers are usually 416/647/437.
  phoneHref: "tel:+12038950187",
  email: "info.neonneedle@gmail.com",
  address: ["Lower Unit, 1171 Dundas Street West", "Little Portugal", "Toronto, Ontario"],
  mapsQuery: "1171 Dundas Street West, Toronto, Ontario",
  // TODO: full URL of the studio Instagram, e.g. "https://instagram.com/yourstudio". Leave empty to hide Instagram links.
  instagram: "",
  // TODO: name of the food bank / community fridge you donate to. Leave empty to hide the community shelf section.
  communityPartner: "",
  // Opening hours in Toronto time. Keys are weekdays (0 = Sunday). Values are [open hour, close hour].
  hours: { 2: [12, 19], 3: [12, 19], 4: [12, 19], 5: [12, 19], 6: [12, 19] } as Record<number, [number, number]>,
};

export type Artist = {
  name: string;
  full: string;
  role: "Resident" | "Independent";
  level: "Senior" | "Junior";
  styles: string[];
  color: string;
  bio: string;
  instagram?: string; // full URL, optional
  image?: string; // portrait, optional. Without one the card shows the artist's initial.
  isNew?: boolean;
};

// TODO: these ten artists are placeholders. Replace names, bios, styles, Instagram links and add real portraits.
export const artists: Artist[] = [
  { name: "Maya", full: "Maya Bell", role: "Resident", level: "Senior", styles: ["Fine line", "Floral", "Script"], color: "#e9ff70", bio: "Fine line florals and script. A good pick if this is your first tattoo and you want to talk it through." },
  { name: "Rio", full: "Rio Lane", role: "Resident", level: "Senior", styles: ["Black & grey", "Realism"], color: "#ff84bc", bio: "Black and grey realism with soft shading. Bring a photo or a memory and we'll work from there." },
  { name: "Nico", full: "Nico Hart", role: "Resident", level: "Junior", styles: ["Colour", "Illustrative"], color: "#ffb020", bio: "Bright, playful illustration. Newer to the studio and taking small colour pieces.", isNew: true },
  { name: "Sol", full: "Sol Reyes", role: "Resident", level: "Senior", styles: ["Ornamental", "Fine line"], color: "#9aa8ff", bio: "Ornamental work that follows the shape of the body, in fine line." },
  { name: "Inez", full: "Inez Park", role: "Independent", level: "Senior", styles: ["Black & grey", "Script"], color: "#d7c5ff", bio: "Bold lettering and dark blackwork." },
  { name: "Tavi", full: "Tavi Moss", role: "Independent", level: "Senior", styles: ["Floral", "Colour"], color: "#b9fbc0", bio: "Loose florals in garden colours." },
  { name: "Ari", full: "Ari June", role: "Independent", level: "Senior", styles: ["Realism", "Portraits"], color: "#ffd6a5", bio: "Pet portraits and small realism." },
  { name: "Bea", full: "Bea North", role: "Independent", level: "Senior", styles: ["Illustrative", "Colour"], color: "#ffc6ff", bio: "Storybook creatures in unusual palettes." },
  { name: "Kit", full: "Kit Monroe", role: "Independent", level: "Senior", styles: ["Ornamental", "Dotwork"], color: "#caffbf", bio: "Dotwork and geometric ornament." },
  { name: "Jo", full: "Jo Sato", role: "Independent", level: "Senior", styles: ["Fine line", "Micro"], color: "#a0c4ff", bio: "Very small fine line pieces." },
];

export const pricing = [
  { name: "Mini Flash", price: "$40–$70", deposit: "$20 deposit", text: "Flat-rate piece under 5 cm. Small symbols, script, simple linework." },
  { name: "Classic", price: "$80–$150", deposit: "$40 deposit", text: "A palm-sized custom piece, usually done in under two hours." },
  { name: "Detail Session", price: "$60–$90/hr", deposit: "$60 deposit", text: "Larger custom work with a two-hour minimum. Best for layered detail." },
  { name: "Full Day", price: "$350–$550", deposit: "$100 deposit", text: "Five to six hours in the chair. Better value for big projects." },
  { name: "Cover-up", price: "From $120", deposit: "$60 deposit", text: "Quoted after a one-on-one consultation about what can be done." },
  { name: "Touch-up", price: "$0–$40", deposit: "Usually no deposit", text: "Free within 60 days of a tattoo done here." },
];

export const faqs: [string, string][] = [
  ["How do I book?", "Fill in the booking form with as much detail as you can. An artist reads every request and we reply within a week."],
  ["How do deposits work?", "Once an artist accepts your request we email you to arrange the deposit. It comes off your final total. It is non-refundable, but you can move it to a new date up to three times in a year if you give us 48 hours' notice."],
  ["Do you take walk-ins?", "Yes, when an artist has space. Call before you come, especially at weekends."],
  ["It's my first tattoo. Is that okay?", "Yes. We explain each step before it happens and you can stop at any time."],
  ["Is the studio accessible?", "Yes. The entrance, studio floor and washroom are step-free. Tell us about anything else you need and we'll plan around it."],
  ["Do you have numbing cream?", "Yes, $10 a tube. Ask before your appointment and apply it at least an hour beforehand, following the instructions on the tube."],
  ["How old do I need to be?", "18 or over can book as normal. At 17 you need a parent or guardian with you for the whole appointment. We can't tattoo anyone under 17."],
  ["What should I bring?", "Valid photo ID, any reference images, and loose clothing that gives easy access to the area. Eat beforehand."],
];

// Portfolio images for the home page gallery. The gallery stays hidden until you add some.
// Put image files in /public/work and list them here, e.g.
// { src: "/work/maya-peony.jpg", alt: "Peony on a forearm, fine line", category: "Floral", artist: "Maya Bell" }
export type WorkItem = { src: string; alt: string; category: string; artist: string };
export const portfolio: WorkItem[] = [];

export function toronto(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  const hour = Number(get("hour")) % 24;
  return { day, minutes: hour * 60 + Number(get("minute")) };
}

export function openStatus(): string {
  const { day, minutes } = toronto();
  const h = STUDIO.hours[day];
  if (!h) return "Closed today · by appointment";
  const [open, close] = h;
  if (minutes < open * 60) return `Opens today at ${open > 12 ? open - 12 : open} ${open >= 12 ? "PM" : "AM"}`;
  if (minutes < close * 60) return `Open now · until ${close > 12 ? close - 12 : close} ${close >= 12 ? "PM" : "AM"}`;
  return "Closed for today";
}
