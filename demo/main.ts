import Popcorn from './popcorn';
import { seats } from './seats';

declare const __DEMO_VERSION__: string;
declare const __DEMO_RELEASE_TAG_URL__: string;
declare const __DEMO_USE_RELEASE__: boolean;

type PopcornInstance = InstanceType<typeof Popcorn>;
type DemoState = 'active' | 'destroyed' | 'error';

const versionBadge = document.querySelector<HTMLSpanElement>('#version-badge');
if (versionBadge) {
  versionBadge.textContent = `v${__DEMO_VERSION__}`;
}

const releaseLink = document.querySelector<HTMLAnchorElement>('#release-link');
if (releaseLink) {
  releaseLink.href = __DEMO_RELEASE_TAG_URL__;
}

const selectedSeatsEl = document.querySelector<HTMLSpanElement>('#selected-seats');
const eventLogEl = document.querySelector<HTMLUListElement>('#event-log');
const errorBanner = document.querySelector<HTMLDivElement>('#error-banner');
const applyBtn = document.getElementById('apply') as HTMLButtonElement | null;
const refreshBtn = document.getElementById('refresh') as HTMLButtonElement | null;
const randomiseBtn = document.getElementById('randomise') as HTMLButtonElement | null;
const destroyBtn = document.getElementById('destroy') as HTMLButtonElement | null;

let popcorn: PopcornInstance | null = null;
let demoState: DemoState = 'error';

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

function validateOptions(opts: PopcornInitOptions): string | null {
  if (!document.querySelector(opts.elem)) {
    return `Seat container not found (${opts.elem})`;
  }
  if (opts.width <= 0) {
    return 'Canvas width must be greater than 0';
  }
  if (opts.height <= 0) {
    return 'Canvas height must be greater than 0';
  }
  if (opts.rowWidth < 1) {
    return 'Seats per row must be at least 1';
  }
  if (opts.maxSeats < 1) {
    return 'Max selection must be at least 1';
  }
  if ((opts.seatWidth ?? 0) <= 0) {
    return 'Seat size must be greater than 0';
  }
  if ((opts.seatMargin ?? 0) < 0) {
    return 'Seat margin cannot be negative';
  }
  if ((opts.rowLabelWidth ?? 0) < 0) {
    return 'Row label width cannot be negative';
  }
  if (!opts.backgroundColor) {
    return 'Background color is required';
  }
  if (!opts.seatColor) {
    return 'Available seat color is required';
  }
  if (!opts.bookedColor) {
    return 'Booked seat color is required';
  }
  if (!opts.selectedColor) {
    return 'Selected seat color is required';
  }
  if (!opts.unavailableColor) {
    return 'Unavailable seat color is required';
  }
  if (!opts.textColor) {
    return 'Text color is required';
  }
  return null;
}

function showError(message: string) {
  if (!errorBanner) return;
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}

function hideError() {
  if (!errorBanner) return;
  errorBanner.hidden = true;
  errorBanner.textContent = '';
}

function setDemoState(state: DemoState) {
  demoState = state;
  const active = state === 'active';

  if (refreshBtn) refreshBtn.disabled = !active;
  if (randomiseBtn) randomiseBtn.disabled = !active;
  if (destroyBtn) destroyBtn.disabled = !active;
  if (applyBtn) applyBtn.disabled = false;
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

function attachEventHandlers(instance: PopcornInstance) {
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
}

function createPopcorn(): { ok: true; instance: PopcornInstance } | { ok: false; message: string } {
  if (__DEMO_USE_RELEASE__ && typeof window.Popcorn === 'undefined') {
    return {
      ok: false,
      message: 'Popcorn failed to load from the release CDN. Check your connection and try Apply again.',
    };
  }

  const options = readOptions();
  const validationError = validateOptions(options);
  if (validationError) {
    return { ok: false, message: validationError };
  }

  try {
    const instance = new Popcorn(options);
    attachEventHandlers(instance);
    updateSelectedDisplay(instance.selected);
    return { ok: true, instance };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create seat map';
    return { ok: false, message };
  }
}

function destroyPopcorn() {
  if (popcorn) {
    popcorn.destroy();
    popcorn = null;
  }
}

function recreatePopcorn() {
  destroyPopcorn();
  const result = createPopcorn();
  if (result.ok) {
    popcorn = result.instance;
    hideError();
    setDemoState('active');
    return;
  }

  showError(result.message);
  updateSelectedDisplay([]);
  setDemoState('error');
  logEvent(result.message, 'event-max');
}

function requireActiveInstance(): PopcornInstance | null {
  if (demoState !== 'active' || !popcorn) {
    logEvent('Seat map is not active. Use Apply changes to recreate it.', 'event-max');
    return null;
  }
  return popcorn;
}

function getAvailableSeatIds(): string[] {
  return seats.flatMap((seat) => (seat.id && !seat.unavailable ? [seat.id] : []));
}

function pickRandomSeats(count: number): string[] {
  const available = getAvailableSeatIds();
  if (available.length === 0) {
    return [];
  }

  const target = Math.min(count, available.length);
  const pool = [...available];

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, target);
}

async function waitForReleasePopcorn(timeoutMs = 10_000): Promise<boolean> {
  if (!__DEMO_USE_RELEASE__) {
    return true;
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (typeof window.Popcorn !== 'undefined') {
      return true;
    }
    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });
  }

  return typeof window.Popcorn !== 'undefined';
}

async function bootstrap() {
  setDemoState('error');

  if (__DEMO_USE_RELEASE__) {
    const loaded = await waitForReleasePopcorn();
    if (!loaded) {
      showError(
        'Timed out waiting for Popcorn to load from the release CDN. Check your connection and try Apply again.',
      );
      logEvent('Release CDN load timed out', 'event-max');
      return;
    }
  }

  recreatePopcorn();
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

applyBtn?.addEventListener('click', recreatePopcorn);

refreshBtn?.addEventListener('click', () => {
  const instance = requireActiveInstance();
  if (!instance) return;
  instance.redraw();
});

randomiseBtn?.addEventListener('click', () => {
  const instance = requireActiveInstance();
  if (!instance) return;

  const selected = pickRandomSeats(getNumber('max-seats'));
  if (selected.length === 0) {
    logEvent('No available seats to randomise', 'event-max');
    return;
  }

  try {
    instance.selected = selected;
    updateSelectedDisplay(instance.selected);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to randomise seats';
    showError(message);
    logEvent(message, 'event-max');
  }
});

destroyBtn?.addEventListener('click', () => {
  if (demoState !== 'active' || !popcorn) {
    logEvent('Seat map is already destroyed. Use Apply changes to recreate it.', 'event-max');
    return;
  }

  destroyPopcorn();
  updateSelectedDisplay([]);
  setDemoState('destroyed');
  logEvent('Instance destroyed', 'event-max');
});

document.getElementById('clear-log')?.addEventListener('click', () => {
  eventLogEl?.replaceChildren();
});

void bootstrap();
