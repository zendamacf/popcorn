import Popcorn from './popcorn';
import { seats } from './seats';

declare const __POPCORN_VERSION__: string;
declare const __POPCORN_RELEASE_TAG_URL__: string;

const versionBadge = document.querySelector<HTMLSpanElement>('#version-badge');
if (versionBadge) {
  versionBadge.textContent = `v${__POPCORN_VERSION__}`;
}

const releaseLink = document.querySelector<HTMLAnchorElement>('#release-link');
if (releaseLink) {
  releaseLink.href = __POPCORN_RELEASE_TAG_URL__;
}

const selectedSeatsEl = document.querySelector<HTMLSpanElement>('#selected-seats');
const eventLogEl = document.querySelector<HTMLUListElement>('#event-log');

function getNumber(id: string): number {
  const el = document.querySelector<HTMLInputElement>(`#${id}`);
  return Number(el?.value ?? 0);
}

function getText(id: string): string {
  return document.querySelector<HTMLInputElement>(`#${id}`)?.value.trim() ?? '';
}

function getSeatSvg(): string | undefined {
  const value = document.querySelector<HTMLTextAreaElement>('#seat-svg')?.value.trim();
  return value || undefined;
}

function readOptions(): PopcornInitOptions {
  return {
    elem: '#seats',
    width: getNumber('width'),
    height: getNumber('height'),
    rowWidth: getNumber('row-width'),
    maxSeats: getNumber('max-seats'),
    seatWidth: getNumber('seat-width'),
    seatMargin: getNumber('seat-margin'),
    rowLabelWidth: getNumber('row-label-width'),
    backgroundColor: getText('background-color'),
    seatColor: getText('seat-color'),
    bookedColor: getText('booked-color'),
    selectedColor: getText('selected-color'),
    unavailableColor: getText('unavailable-color'),
    textColor: getText('text-color'),
    seatList: seats,
    seatSvg: getSeatSvg(),
  };
}

function updateSelectedDisplay(selected: string[]) {
  if (!selectedSeatsEl) return;
  selectedSeatsEl.textContent = selected.length > 0 ? selected.join(', ') : 'none';
}

function logEvent(message: string, className: string) {
  if (!eventLogEl) return;
  const item = document.createElement('li');
  item.className = className;
  item.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  eventLogEl.prepend(item);
  while (eventLogEl.children.length > 50) {
    eventLogEl.lastElementChild?.remove();
  }
}

function bindColorPair(pickerId: string, textId: string) {
  const picker = document.querySelector<HTMLInputElement>(`#${pickerId}`);
  const text = document.querySelector<HTMLInputElement>(`#${textId}`);
  if (!picker || !text) return;

  picker.addEventListener('input', () => {
    text.value = picker.value;
  });

  text.addEventListener('input', () => {
    const value = text.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(value)) {
      picker.value = value;
    }
  });
}

function createPopcorn() {
  const instance = new Popcorn(readOptions());

  instance.on('popcorn.selectseat', (e: Event) => {
    const detail = (e as CustomEvent).detail as { id: string; total: number };
    logEvent(`Selected ${detail.id} (${detail.total} total)`, 'event-select');
    updateSelectedDisplay(instance.selected);
  });

  instance.on('popcorn.deselectseat', (e: Event) => {
    const detail = (e as CustomEvent).detail as { id: string; total: number };
    logEvent(`Deselected ${detail.id} (${detail.total} total)`, 'event-deselect');
    updateSelectedDisplay(instance.selected);
  });

  instance.on('popcorn.maxseats', (e: Event) => {
    const detail = (e as CustomEvent).detail as { total: number };
    logEvent(`Max seats reached (${detail.total})`, 'event-max');
  });

  updateSelectedDisplay(instance.selected);
  return instance;
}

let popcorn = createPopcorn();

function recreatePopcorn() {
  popcorn.destroy();
  popcorn = createPopcorn();
}

function randomAvailableSeat() {
  const available = seats.filter((seat) => !seat.unavailable && seat.id);
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

for (const [pickerId, textId] of [
  ['background-color-picker', 'background-color'],
  ['seat-color-picker', 'seat-color'],
  ['booked-color-picker', 'booked-color'],
  ['selected-color-picker', 'selected-color'],
  ['unavailable-color-picker', 'unavailable-color'],
  ['text-color-picker', 'text-color'],
] as const) {
  bindColorPair(pickerId, textId);
}

document.getElementById('apply')?.addEventListener('click', recreatePopcorn);

document.getElementById('refresh')?.addEventListener('click', () => {
  popcorn.redraw();
});

document.getElementById('randomise')?.addEventListener('click', () => {
  const maxSeats = getNumber('max-seats');
  const selected: string[] = [];
  while (selected.length < maxSeats) {
    const id = randomAvailableSeat().id;
    if (id && !selected.includes(id)) selected.push(id);
  }
  popcorn.selected = selected;
  updateSelectedDisplay(popcorn.selected);
});

document.getElementById('destroy')?.addEventListener('click', () => {
  popcorn.destroy();
  logEvent('Instance destroyed', 'event-max');
});

document.getElementById('clear-log')?.addEventListener('click', () => {
  eventLogEl?.replaceChildren();
});
