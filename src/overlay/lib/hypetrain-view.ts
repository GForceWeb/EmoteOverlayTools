/** The train is drawn in HTML/SVG so wheels, people, and lettering stay independent. */
export function part(tag: string, className: string, parent?: HTMLElement, text?: string): HTMLElement {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  parent?.appendChild(element);
  return element;
}

function wheel(parent: HTMLElement, className = ""): void {
  const wheel = part("div", `hype-wheel ${className}`.trim(), parent);
  part("span", "hype-wheel-spokes", wheel);
  part("span", "hype-wheel-hub", wheel);
}

export function createLocomotive(): HTMLElement {
  const engine = part("div", "train-head hype-engine");
  engine.setAttribute("aria-label", "Hype Express locomotive");
  const smoke = part("div", "hype-smoke", engine);
  for (let i = 0; i < 5; i++) {
    const puff = part("i", "hype-puff", smoke);
    puff.style.setProperty("--puff", String(i));
  }
  const body = part("div", "hype-engine-body", engine);
  // Static artwork only. Viewer-provided names are always inserted with textContent.
  body.innerHTML = `<svg viewBox="0 0 350 230" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hype-boiler" x2="0" y2="1"><stop stop-color="#ff886d"/><stop offset="1" stop-color="#db513f"/></linearGradient>
      <linearGradient id="hype-cab" x2="0" y2="1"><stop stop-color="#259b94"/><stop offset="1" stop-color="#12635f"/></linearGradient>
    </defs>
    <path d="M18 179H313L338 211H10Z" fill="#182e38" stroke="#f9dfa0" stroke-width="4"/>
    <path d="M270 191h43l24 20h-67z" fill="#e9b05c"/>
    <path d="M16 56Q16 48 25 48h99v136H16Z" fill="url(#hype-cab)" stroke="#f9dfa0" stroke-width="4"/>
    <path d="M6 42Q65 16 133 42v14H6Z" fill="#143f43" stroke="#f9dfa0" stroke-width="4"/>
    <path d="M35 68h66v66H35z" rx="9" fill="#142b38" stroke="#f9dfa0" stroke-width="5"/>
    <path d="M40 76h22v48H40z" fill="#91dbce" opacity=".45"/><path d="M69 71v60" stroke="#f9dfa0" stroke-width="4"/>
    <path d="M121 95h130q35 0 35 39t-35 42H121Z" fill="url(#hype-boiler)" stroke="#f9dfa0" stroke-width="4"/>
    <path d="M140 99v73m90-73v73" stroke="#f5b475" stroke-width="10"/>
    <path d="M247 100V57h32v47" fill="#213d44" stroke="#f9dfa0" stroke-width="4"/>
    <path d="M239 49h48v17h-48z" fill="#ebaf5b" stroke="#f9dfa0" stroke-width="3"/>
    <path d="M168 95V78q15-19 30 0v17" fill="#e9b05c" stroke="#f9dfa0" stroke-width="3"/>
    <ellipse cx="285" cy="134" rx="10" ry="24" fill="#173e42" stroke="#f9dfa0" stroke-width="4"/>
    <circle cx="298" cy="123" r="13" fill="#fff4c0" stroke="#e9b05c" stroke-width="5"/>
    <path d="M308 112l39-19v63l-39-22z" fill="#ffe7a0" opacity=".1"/>
    <path d="M15 157h108v26H15z" fill="#0e4a4d"/>
    <circle cx="28" cy="170" r="3" fill="#f9dfa0"/><circle cx="110" cy="170" r="3" fill="#f9dfa0"/>
    <path d="M20 191h270" stroke="#eeac57" stroke-width="6"/>
  </svg>`;
  part("span", "hype-engine-name", body, "HYPE EXPRESS");
  part("span", "hype-engine-number", body, "01");
  wheel(engine, "hype-drive-wheel hype-drive-wheel-a");
  wheel(engine, "hype-drive-wheel hype-drive-wheel-b");
  wheel(engine, "hype-pilot-wheel");
  part("span", "hype-coupling-rod", engine);
  return engine;
}

export interface CarriageView {
  element: HTMLElement;
  deck: HTMLElement;
  count: HTMLElement;
  progress: HTMLElement;
  percent: HTMLElement;
}

const CARRIAGE_TAGLINES = [
  "SMALL SPARKS • BIG HYPE",
  "POWERED BY CHAT",
  "FULL STEAM • NO BRAKES",
  "CERTIFIED HYPE CREW",
  "NEXT STOP • LEGENDARY",
  "GOOD VIBES • GREAT COMPANY",
  "BITS, SUBS & BIG ENERGY",
  "CHAT MADE THIS HAPPEN",
];

export function createCarriage(level: number, animateEntry = false): CarriageView {
  const element = part("section", `train-cart hype-carriage${animateEntry ? " hype-carriage-entering" : ""}`);
  element.dataset.level = String(level);
  element.setAttribute("aria-label", `Hype Train level ${level}`);
  element.style.setProperty("--car-accent", ["#70d6bd", "#ffc66f", "#ff8f91", "#a9afff", "#8ed7ef"][(level - 1) % 5]);
  const roof = part("div", "hype-car-roof", element);
  part("span", "hype-level", roof, `LEVEL ${String(level).padStart(2, "0")}`);
  const percent = part("span", "hype-progress-percent", roof);
  percent.hidden = true;
  const count = part("span", "hype-passenger-count", roof);
  const progress = part("div", "hype-car-progress", roof);
  progress.hidden = true;
  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-label", `Level ${level} progress`);
  progress.setAttribute("aria-valuemin", "0");
  progress.setAttribute("aria-valuemax", "100");
  part("span", "hype-car-progress-fill", progress);
  const deck = part("div", "hype-passenger-deck", element);
  const sill = part("div", "hype-car-sill", element);
  part("span", "hype-car-lettering", sill, CARRIAGE_TAGLINES[(level - 1) % CARRIAGE_TAGLINES.length]);
  part("span", "hype-car-rivets", sill);
  const chassis = part("div", "hype-car-chassis", element);
  wheel(chassis, "hype-car-wheel-a");
  wheel(chassis, "hype-car-wheel-b");
  part("span", "hype-coupler", element);
  const sparks = part("span", "hype-coupling-sparks", element);
  for (let index = 0; index < 5; index++) {
    const spark = part("i", "hype-coupling-spark", sparks);
    spark.style.setProperty("--spark", String(index));
  }
  return { element, deck, count, progress, percent };
}

export function setCarriageProgress(carriage: CarriageView, value: number): void {
  const progress = Math.min(100, Math.max(0, value));
  carriage.progress.hidden = false;
  carriage.percent.hidden = false;
  carriage.percent.textContent = `${Math.round(progress)}%`;
  carriage.progress.setAttribute("aria-valuenow", String(Math.round(progress)));
  carriage.progress.style.setProperty("--level-progress", `${progress}%`);
}

export interface PassengerView {
  element: HTMLElement;
  image: HTMLImageElement;
  nameViewport: HTMLElement;
}

/** One observer per train; only overflowing labels get a text animation. */
export function createUsernameCycler(): ResizeObserver | undefined {
  if (typeof ResizeObserver === "undefined") return;
  return new ResizeObserver(entries => {
    for (const { target } of entries) {
      const viewport = target as HTMLElement;
      const text = viewport.firstElementChild as HTMLElement;
      const distance = Math.max(0, text.scrollWidth - viewport.clientWidth);
      viewport.dataset.scrolling = distance > 1 ? "true" : "false";
      viewport.style.setProperty("--name-travel", `${-distance}px`);
      viewport.style.setProperty("--name-duration", `${Math.max(8, 4 + distance / 12)}s`);
    }
  });
}

export function createPassenger(name: string, index: number): PassengerView {
  const element = part("div", "hype-passenger");
  element.dataset.pose = ["wave", "flag", "cheer"][index % 3];
  element.style.setProperty("--person-color", ["#e97b66", "#2f9b91", "#e0a34d", "#8277bc", "#5b9fc3"][index % 5]);
  element.style.setProperty("--person-delay", `${-(index % 7) * .23}s`);
  element.title = name;
  const person = part("div", "hype-person", element);
  part("span", "hype-person-body", person);
  part("span", "hype-arm hype-arm-left", person);
  const rightArm = part("span", "hype-arm hype-arm-right", person);
  part("span", "hype-person-flag", rightArm);
  const face = part("div", "hype-face", person);
  part("span", "hype-avatar-fallback", face, name.slice(0, 2).toUpperCase());
  const image = part("img", "hype-avatar", face) as HTMLImageElement;
  image.alt = "";
  image.decoding = "async";
  image.addEventListener("error", () => { image.hidden = true; });
  const nameplate = part("span", "hype-username", element);
  nameplate.title = name;
  const nameViewport = part("span", "hype-username-viewport", nameplate);
  part("span", "hype-username-text", nameViewport, name);
  return { element, image, nameViewport };
}
