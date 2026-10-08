// Quote list ("cart") kept in the visitor's browser. Customers collect products,
// then send the whole list to the store on WhatsApp to get prices and delivery.

export interface QuoteItem {
  slug: string;
  name: string;
  qty: number;
}

const KEY = 'truedent-quote';

export function readQuote(): QuoteItem[] {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export function writeQuote(items: QuoteItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage blocked: the list just won't persist */
  }
  document.dispatchEvent(new CustomEvent('quote:change', { detail: items }));
}

export function addToQuote(slug: string, name: string, qty = 1) {
  const items = readQuote();
  const existing = items.find((i) => i.slug === slug);
  if (existing) existing.qty += qty;
  else items.push({ slug, name, qty });
  writeQuote(items);
}

export function whatsappLink(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function updateBadges() {
  const count = readQuote().reduce((n, i) => n + i.qty, 0);
  document.querySelectorAll<HTMLElement>('[data-quote-count]').forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });
}

document.addEventListener('quote:change', updateBadges);
updateBadges();

// Any button with data-add-quote="slug" data-name="Product" adds to the list
document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-add-quote]');
  if (!btn) return;
  e.preventDefault();
  const qtyInput = btn.dataset.qtyFrom ? document.querySelector<HTMLInputElement>(btn.dataset.qtyFrom) : null;
  const qty = Math.max(1, Number(qtyInput?.value) || 1);
  addToQuote(btn.dataset.addQuote!, btn.dataset.name!, qty);
  const label = btn.querySelector('[data-label]');
  if (label) {
    const original = label.textContent;
    btn.classList.add('added');
    label.textContent = 'Added to quote';
    setTimeout(() => {
      btn.classList.remove('added');
      label.textContent = original;
    }, 1600);
  }
});
