import type { ProjectTheme } from '../../lib/types';

// ---------------------------------------------------------------------------
// Context interfaces
// ---------------------------------------------------------------------------

export interface EditModeContext {
  scope: HTMLElement;
  onChange: () => void;
}

export interface ColorEditModeContext extends EditModeContext {
  theme: ProjectTheme;
  onThemeChange: (theme: ProjectTheme) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ARROW_SVG_DARK = `<svg class="cs-icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z" fill="#1a1a1a"/></svg>`;

const ARROW_SVG_LIGHT = `<svg class="cs-icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.92 11.62C17.8724 11.4973 17.801 11.3851 17.71 11.29L12.71 6.29C12.6168 6.19676 12.5061 6.1228 12.3842 6.07234C12.2624 6.02188 12.1319 5.99591 12 5.99591C11.7337 5.99591 11.4783 6.1017 11.29 6.29C11.1968 6.38324 11.1228 6.49393 11.0723 6.61575C11.0219 6.73758 10.9959 6.86814 10.9959 7C10.9959 7.2663 11.1017 7.5217 11.29 7.71L14.59 11H7C6.73478 11 6.48043 11.1054 6.29289 11.2929C6.10536 11.4804 6 11.7348 6 12C6 12.2652 6.10536 12.5196 6.29289 12.7071C6.48043 12.8946 6.73478 13 7 13H14.59L11.29 16.29C11.1963 16.383 11.1219 16.4936 11.0711 16.6154C11.0203 16.7373 10.9942 16.868 10.9942 17C10.9942 17.132 11.0203 17.2627 11.0711 17.3846C11.1219 17.5064 11.1963 17.617 11.29 17.71C11.383 17.8037 11.4936 17.8781 11.6154 17.9289C11.7373 17.9797 11.868 18.0058 12 18.0058C12.132 18.0058 12.2627 17.9797 12.3846 17.9289C12.5064 17.8781 12.617 17.8037 12.71 17.71L17.71 12.71C17.801 12.6149 17.8724 12.5028 17.92 12.38C18.02 12.1365 18.02 11.8635 17.92 11.62Z" fill="#fff"/></svg>`;

const DOUBLE_ARROW_SVG = `<svg class="cs-icon" aria-hidden="true" width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.83 11.29L10.59 7.05001C10.497 6.95628 10.3864 6.88189 10.2646 6.83112C10.1427 6.78035 10.012 6.75421 9.88 6.75421C9.74799 6.75421 9.61729 6.78035 9.49543 6.83112C9.37357 6.88189 9.26297 6.95628 9.17 7.05001C8.98375 7.23737 8.87921 7.49082 8.87921 7.75501C8.87921 8.0192 8.98375 8.27265 9.17 8.46001L12.71 12L9.17 15.54C8.98375 15.7274 8.87921 15.9808 8.87921 16.245C8.87921 16.5092 8.98375 16.7626 9.17 16.95C9.26344 17.0427 9.37426 17.116 9.4961 17.1658C9.61794 17.2155 9.7484 17.2408 9.88 17.24C10.0116 17.2408 10.1421 17.2155 10.2639 17.1658C10.3857 17.116 10.4966 17.0427 10.59 16.95L14.83 12.71C14.9237 12.617 14.9981 12.5064 15.0489 12.3846C15.0997 12.2627 15.1258 12.132 15.1258 12C15.1258 11.868 15.0997 11.7373 15.0489 11.6154C14.9981 11.4936 14.9237 11.383 14.83 11.29Z" fill="white"/><path d="M20.83 11.29L16.59 7.05001C16.497 6.95628 16.3864 6.88189 16.2646 6.83112C16.1427 6.78035 16.012 6.75421 15.88 6.75421C15.748 6.75421 15.6173 6.78035 15.4954 6.83112C15.3736 6.88189 15.263 6.95628 15.17 7.05001C14.9838 7.23737 14.8792 7.49082 14.8792 7.75501C14.8792 8.0192 14.9838 8.27265 15.17 8.46001L18.71 12L15.17 15.54C14.9838 15.7274 14.8792 15.9808 14.8792 16.245C14.8792 16.5092 14.9838 16.7626 15.17 16.95C15.2634 17.0427 15.3743 17.116 15.4961 17.1658C15.6179 17.2155 15.7484 17.2408 15.88 17.24C16.0116 17.2408 16.1421 17.2155 16.2639 17.1658C16.3857 17.116 16.4966 17.0427 16.59 16.95L20.83 12.71C20.9237 12.617 20.9981 12.5064 21.0489 12.3846C21.0997 12.2627 21.1258 12.132 21.1258 12C21.1258 11.868 21.0997 11.7373 21.0489 11.6154C20.9981 11.4936 20.9237 11.383 20.83 11.29Z" fill="white"/></svg>`;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const BUTTON_PRESET_TEMPLATES: Record<string, (text: string) => string> = {
  'cs-preset-1': (t) => `<span class="cs-button-text">${escapeHtml(t)}</span>`,
  'cs-preset-2': (t) => `${escapeHtml(t)}<div class="cs-wrapper">${ARROW_SVG_DARK}</div>`,
  'cs-preset-3': (t) => `${escapeHtml(t)}${DOUBLE_ARROW_SVG}`,
  'cs-preset-4': (t) => `${escapeHtml(t)}<div class="cs-wrapper">${ARROW_SVG_DARK}</div>`,
  'cs-preset-5': (t) => `${escapeHtml(t)}<div class="cs-wrapper">${ARROW_SVG_LIGHT}</div>`,
  'cs-preset-6': (t) => escapeHtml(t),
  'cs-preset-7': (t) => `${escapeHtml(t)}${ARROW_SVG_DARK}`,
  'cs-preset-8': (t) => escapeHtml(t),
  'cs-preset-9': (t) => escapeHtml(t),
  'cs-preset-10': (t) => escapeHtml(t),
};

const BUTTON_PRESETS = Array.from({ length: 10 }, (_, i) => ({
  key: `cs-preset-${i + 1}`,
  label: `Style ${i + 1}`,
}));

const FONT_OPTIONS: { label: string; stack: string }[] = [
  { label: 'Oswald', stack: 'Oswald, Arial, sans-serif' },
  { label: 'Source Sans 3', stack: '"Source Sans 3", Arial, sans-serif' },
  { label: 'Yellowtail (decorative)', stack: 'Yellowtail, cursive' },
  { label: 'Charter', stack: 'Charter, Georgia, serif' },
  { label: 'Georgia', stack: 'Georgia, serif' },
  { label: 'Times New Roman', stack: '"Times New Roman", Times, serif' },
  { label: 'Helvetica / Arial', stack: 'Helvetica, Arial, sans-serif' },
  { label: 'Courier (mono)', stack: '"Courier New", Courier, monospace' },
  { label: 'System UI', stack: 'system-ui, sans-serif' },
];

const ROOT_COLOR_VARS: { name: string; defaultHex: string }[] = [
  { name: '--primary', defaultHex: '#ff6a3e' },
  { name: '--primaryLight', defaultHex: '#ffd9cc' },
  { name: '--secondary', defaultHex: '#ffba43' },
  { name: '--secondaryLight', defaultHex: '#ffeac7' },
  { name: '--headerColor', defaultHex: '#1a1a1a' },
  { name: '--grey', defaultHex: '#cccccc' },
  { name: '--bodyTextColor', defaultHex: '#353535' },
  { name: '--bodyTextColorWhite', defaultHex: '#f5f5f5' },
  { name: '--backgroundColor', defaultHex: '#ffffff' },
  { name: '--errorColor', defaultHex: '#d62828' },
];

const CHECKERBOARD = 'repeating-linear-gradient(45deg,#ddd 0,#ddd 4px,#fff 4px,#fff 8px)';

function rgbToHex(rgb: string): string {
  if (!rgb) return '#000000';
  if (rgb.startsWith('#')) return rgb;
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return '#000000';
  const toHex = (n: string) => parseInt(n, 10).toString(16).padStart(2, '0');
  return `#${toHex(m[0])}${toHex(m[1])}${toHex(m[2])}`;
}

// ---------------------------------------------------------------------------
// mountTextEditMode
// ---------------------------------------------------------------------------

export function mountTextEditMode(ctx: EditModeContext): () => void {
  const { scope, onChange } = ctx;

  const editables = Array.from(scope.querySelectorAll<HTMLElement>('[data-editable="true"]'));
  const links = Array.from(scope.querySelectorAll<HTMLAnchorElement>('a'));

  // Enable contentEditable
  editables.forEach((el) => {
    el.contentEditable = 'true';
  });

  // Disable links
  links.forEach((a) => {
    if (a.dataset.origHref === undefined) {
      a.dataset.origHref = a.getAttribute('href') ?? '';
    }
    a.removeAttribute('href');
  });

  // Input listeners
  const inputHandlers = new Map<HTMLElement, () => void>();
  editables.forEach((el) => {
    const handler = () => onChange();
    el.addEventListener('input', handler);
    inputHandlers.set(el, handler);
  });

  return () => {
    editables.forEach((el) => {
      el.contentEditable = 'false';
      const handler = inputHandlers.get(el);
      if (handler) el.removeEventListener('input', handler);
    });
    links.forEach((a) => {
      if (a.dataset.origHref !== undefined) {
        const orig = a.dataset.origHref;
        if (orig) a.setAttribute('href', orig);
        delete a.dataset.origHref;
      }
    });
  };
}

// ---------------------------------------------------------------------------
// mountImageEditMode
// ---------------------------------------------------------------------------

export function mountImageEditMode(ctx: EditModeContext): () => void {
  const { scope, onChange } = ctx;

  function repositionPills() {
    document.querySelectorAll<HTMLElement>('.image-edit-pill').forEach((pill) => {
      const editId = pill.dataset.forImg;
      if (!editId) return;
      const img = document.querySelector<HTMLImageElement>(`img[data-edit-id="${editId}"]`);
      if (!img) { pill.remove(); return; }
      const r = img.getBoundingClientRect();
      pill.style.left = `${r.left + r.width / 2}px`;
      pill.style.top = `${r.top + r.height / 2}px`;
    });
  }

  const pillScrollHandler = () => repositionPills();
  const pillResizeHandler = () => repositionPills();

  function openFilePickerFor(img: HTMLImageElement) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/uploads', { method: 'POST', body: form });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          console.error('Upload failed:', err);
          return;
        }
        const { url } = await res.json() as { url: string };
        img.src = url;
        img.removeAttribute('srcset');
        img.closest('picture')?.querySelectorAll('source').forEach((s) => s.remove());
        repositionPills();
        onChange();
      } catch (e) {
        console.error('Upload error:', e);
      }
    };
    input.click();
  }

  // Mount pills
  scope.querySelectorAll<HTMLImageElement>('img[data-edit-id]').forEach((img) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'image-edit-pill';
    pill.dataset.forImg = img.dataset.editId!;
    pill.textContent = 'Change image';
    pill.style.cssText = [
      'position:fixed',
      'z-index:2147483647',
      'display:inline-flex',
      'align-items:center',
      'gap:0.3rem',
      'padding:0.45rem 0.85rem',
      'background:#1d11b9',
      'color:#fff',
      'font-family:Arial,sans-serif',
      'font-size:0.8rem',
      'font-weight:700',
      'border:2px solid #fff',
      'border-radius:999px',
      'cursor:pointer',
      'box-shadow:0 4px 14px rgba(0,0,0,0.5)',
      'pointer-events:auto',
      'transform:translate(-50%,-50%)',
      'white-space:nowrap',
      'line-height:1',
    ].join(';');
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openFilePickerFor(img);
    });
    document.body.appendChild(pill);
  });

  repositionPills();
  window.addEventListener('scroll', pillScrollHandler, true);
  window.addEventListener('resize', pillResizeHandler);

  return () => {
    document.querySelectorAll<HTMLElement>('.image-edit-pill').forEach((p) => p.remove());
    window.removeEventListener('scroll', pillScrollHandler, true);
    window.removeEventListener('resize', pillResizeHandler);
  };
}

// ---------------------------------------------------------------------------
// mountColorEditMode
// ---------------------------------------------------------------------------

export function mountColorEditMode(ctx: ColorEditModeContext): () => void {
  const { scope, onChange, theme, onThemeChange } = ctx;

  let localColorTarget: HTMLElement | null = null;

  // Build popup DOM
  const popup = document.createElement('div');
  popup.style.cssText = [
    'position:fixed',
    'z-index:99999',
    'background:#fff',
    'border:2px solid var(--primary,#ff6a3e)',
    'border-radius:8px',
    'padding:0.8rem',
    'box-shadow:0 4px 20px rgba(0,0,0,0.2)',
    'display:none',
    'flex-direction:column',
    'gap:0.6rem',
    'min-width:260px',
  ].join(';');
  popup.id = 'em-local-color-popup';

  function makeDropdown(axis: 'color' | 'backgroundColor', labelText: string) {
    const section = document.createElement('div');
    section.style.cssText = 'display:flex;flex-direction:column;gap:0.3rem;';

    const strong = document.createElement('strong');
    strong.textContent = labelText;
    strong.style.cssText = 'font-size:0.75rem;color:#4e4b66;text-transform:uppercase;letter-spacing:0.04em;';
    section.appendChild(strong);

    // Trigger button
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.style.cssText = 'width:100%;display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0.55rem;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;font-size:0.8rem;color:#1a1a1a;text-align:left;font-family:inherit;';

    const triggerSwatch = document.createElement('span');
    triggerSwatch.style.cssText = `width:22px;height:22px;border-radius:3px;border:1px solid rgba(0,0,0,0.25);flex-shrink:0;background:${CHECKERBOARD};`;
    const triggerLabel = document.createElement('span');
    triggerLabel.style.cssText = 'flex:1;';
    triggerLabel.textContent = '— inherit —';
    const triggerArrow = document.createElement('span');
    triggerArrow.style.cssText = 'font-size:0.65rem;color:#999;flex-shrink:0;';
    triggerArrow.textContent = '▾';
    trigger.appendChild(triggerSwatch);
    trigger.appendChild(triggerLabel);
    trigger.appendChild(triggerArrow);

    // Dropdown list
    const list = document.createElement('div');
    list.style.cssText = 'position:absolute;top:calc(100% + 2px);left:0;right:0;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 6px 18px rgba(0,0,0,0.22);z-index:200;max-height:220px;overflow-y:auto;padding:0;margin:0;display:none;';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;';
    wrapper.appendChild(trigger);
    wrapper.appendChild(list);
    section.appendChild(wrapper);

    // Custom color picker
    const customPicker = document.createElement('input');
    customPicker.type = 'color';
    customPicker.value = '#000000';
    customPicker.style.cssText = 'width:100%;height:30px;padding:0;border:1px solid #ccc;cursor:pointer;margin-top:0.2rem;display:none;';
    section.appendChild(customPicker);

    function updateTrigger(value: string, pickerColor?: string) {
      if (!value) {
        triggerSwatch.style.background = CHECKERBOARD;
        triggerLabel.textContent = '— inherit —';
      } else if (value === 'custom') {
        triggerSwatch.style.background = pickerColor ?? CHECKERBOARD;
        triggerLabel.textContent = 'Custom…';
      } else {
        triggerSwatch.style.background = value;
        // Find label from options
        const opt = optionBtns.find((b) => b.dataset.value === value);
        triggerLabel.textContent = opt?.querySelector<HTMLElement>('.cd-label')?.textContent ?? value;
      }
    }

    const optionBtns: HTMLButtonElement[] = [];

    const options: Array<{ value: string; label: string; bg: string }> = [
      { value: '', label: '— inherit —', bg: CHECKERBOARD },
      ...ROOT_COLOR_VARS.map((cv) => ({
        value: `var(${cv.name})`,
        label: `${cv.name}  ${cv.defaultHex}`,
        bg: `var(${cv.name})`,
      })),
      { value: 'custom', label: 'Custom…', bg: CHECKERBOARD },
    ];

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.value = opt.value;
      btn.style.cssText = 'width:100%;display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0.55rem;border:none;background:transparent;cursor:pointer;font-size:0.78rem;color:#1a1a1a;text-align:left;font-family:inherit;';

      const lbl = document.createElement('span');
      lbl.className = 'cd-label';
      lbl.textContent = opt.label;
      lbl.style.flex = '1';

      const sw = document.createElement('span');
      sw.style.cssText = `width:22px;height:22px;border-radius:3px;border:1px solid rgba(0,0,0,0.25);flex-shrink:0;background:${opt.bg};`;

      btn.appendChild(lbl);
      btn.appendChild(sw);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectOption(opt.value);
        list.style.display = 'none';
      });
      list.appendChild(btn);
      optionBtns.push(btn);
    });

    function selectOption(value: string, pickerColor?: string) {
      // Mark selected
      optionBtns.forEach((b) => {
        b.style.background = b.dataset.value === value ? '#eef' : 'transparent';
        b.style.fontWeight = b.dataset.value === value ? '600' : 'normal';
      });
      customPicker.style.display = value === 'custom' ? '' : 'none';
      if (value === 'custom' && pickerColor) customPicker.value = pickerColor;
      updateTrigger(value, pickerColor ?? customPicker.value);
      if (value === 'custom') return;
      if (!localColorTarget) return;
      (localColorTarget.style as Record<string, string>)[axis] = value;
      onChange();
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = list.style.display !== 'none';
      // Close other open lists in popup
      popup.querySelectorAll<HTMLElement>('[data-cd-list]').forEach((l) => { l.style.display = 'none'; });
      list.style.display = isOpen ? 'none' : 'block';
    });
    list.dataset.cdList = axis;

    customPicker.addEventListener('input', () => {
      if (localColorTarget) (localColorTarget.style as Record<string, string>)[axis] = customPicker.value;
      updateTrigger('custom', customPicker.value);
      onChange();
    });

    function syncFromTarget(target: HTMLElement) {
      const val = (target.style as Record<string, string>)[axis];
      let matchValue = '';
      let pickerColor: string | undefined;
      if (!val) {
        matchValue = '';
      } else if (val.startsWith('var(')) {
        const found = optionBtns.find((b) => b.dataset.value === val);
        matchValue = found ? val : 'custom';
        if (!found) pickerColor = rgbToHex(getComputedStyle(target)[axis as keyof CSSStyleDeclaration] as string);
      } else {
        matchValue = 'custom';
        pickerColor = rgbToHex(val);
      }
      selectOption(matchValue, pickerColor);
    }

    return { section, syncFromTarget, selectOption };
  }

  const textDrop = makeDropdown('color', 'Text color');
  const bgDrop = makeDropdown('backgroundColor', 'Background');

  popup.appendChild(textDrop.section);
  popup.appendChild(bgDrop.section);

  // Actions row
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;justify-content:space-between;gap:0.4rem;';

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.textContent = 'Clear';
  clearBtn.style.cssText = 'flex:1;padding:0.3rem 0.5rem;font-size:0.75rem;border:1px solid #4e4b66;background:#fff;border-radius:4px;cursor:pointer;';
  clearBtn.addEventListener('click', () => {
    if (!localColorTarget) return;
    localColorTarget.style.color = '';
    localColorTarget.style.backgroundColor = '';
    delete localColorTarget.dataset.colorOverrideId;
    closePopup();
    onChange();
  });

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = 'flex:1;padding:0.3rem 0.5rem;font-size:0.75rem;border:1px solid #4e4b66;background:#fff;border-radius:4px;cursor:pointer;';
  closeBtn.addEventListener('click', () => closePopup());

  actions.appendChild(clearBtn);
  actions.appendChild(closeBtn);
  popup.appendChild(actions);
  document.body.appendChild(popup);

  // Root color panel
  const rootPanel = document.createElement('div');
  rootPanel.style.cssText = [
    'position:fixed',
    'top:70px',
    'right:1rem',
    'z-index:99999',
    'background:#fff',
    'border:2px solid var(--primary,#ff6a3e)',
    'border-radius:8px',
    'padding:1rem',
    'box-shadow:0 4px 20px rgba(0,0,0,0.15)',
    'width:300px',
  ].join(';');

  const panelTitle = document.createElement('h4');
  panelTitle.textContent = 'Global colors (:root)';
  panelTitle.style.cssText = 'margin:0 0 0.6rem;font-size:1rem;color:#1a1a1a;';
  rootPanel.appendChild(panelTitle);

  const colorGrid = document.createElement('div');
  colorGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;';

  ROOT_COLOR_VARS.forEach((cv) => {
    const label = document.createElement('label');
    label.style.cssText = 'display:flex;flex-direction:column;font-size:0.75rem;color:#4e4b66;gap:0.2rem;';

    const span = document.createElement('span');
    span.textContent = cv.name;

    const input = document.createElement('input');
    input.type = 'color';
    input.value = getComputedStyle(document.documentElement).getPropertyValue(cv.name).trim() || cv.defaultHex;
    input.style.cssText = 'width:100%;height:30px;cursor:pointer;border:1px solid #ccc;border-radius:4px;padding:0;';
    input.addEventListener('input', () => {
      document.documentElement.style.setProperty(cv.name, input.value);
      onThemeChange({
        ...theme,
        rootColors: { ...theme.rootColors, [cv.name]: input.value },
      });
      onChange();
    });

    label.appendChild(span);
    label.appendChild(input);
    colorGrid.appendChild(label);
  });

  rootPanel.appendChild(colorGrid);
  document.body.appendChild(rootPanel);

  function closePopup() {
    popup.style.display = 'none';
    localColorTarget = null;
  }

  function handleClick(e: MouseEvent) {
    const t = e.target as HTMLElement;
    if (!t) return;
    if (t.closest('#em-local-color-popup') || t.closest('#em-root-color-panel')) return;
    // Close dropdowns on outside click
    popup.querySelectorAll<HTMLElement>('[data-cd-list]').forEach((l) => { l.style.display = 'none'; });

    if (!scope.contains(t)) return;
    e.preventDefault();
    e.stopPropagation();

    localColorTarget = t;
    if (!t.dataset.colorOverrideId) {
      const wrapper = t.closest<HTMLElement>('[data-component-type]');
      const type = wrapper?.dataset.componentType || 'x';
      const variant = wrapper?.dataset.variantValue || 'x';
      t.dataset.colorOverrideId = `${type}-${variant}-color-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }

    textDrop.syncFromTarget(t);
    bgDrop.syncFromTarget(t);

    popup.style.display = 'flex';
    const pw = popup.offsetWidth || 260;
    const ph = popup.offsetHeight || 200;
    popup.style.left = `${Math.min(e.clientX + 8, window.innerWidth - pw - 10)}px`;
    popup.style.top = `${Math.min(e.clientY + 8, window.innerHeight - ph - 10)}px`;
  }

  document.addEventListener('click', handleClick, true);

  return () => {
    document.removeEventListener('click', handleClick, true);
    popup.remove();
    rootPanel.remove();
  };
}

// ---------------------------------------------------------------------------
// mountFontEditMode
// ---------------------------------------------------------------------------

export function mountFontEditMode(ctx: ColorEditModeContext): () => void {
  const { theme, onThemeChange, onChange } = ctx;

  const FONT_VARS: { varName: string; label: string }[] = [
    { varName: '--headerFont', label: '--headerFont' },
    { varName: '--bodyFont', label: '--bodyFont' },
    { varName: '--navNeon', label: '--navNeon' },
  ];

  const panel = document.createElement('div');
  panel.style.cssText = [
    'position:fixed',
    'top:70px',
    'right:1rem',
    'z-index:99999',
    'background:#fff',
    'border:2px solid var(--secondary,#ffba43)',
    'border-radius:8px',
    'padding:1rem',
    'box-shadow:0 4px 20px rgba(0,0,0,0.15)',
    'width:320px',
  ].join(';');

  const title = document.createElement('h4');
  title.textContent = 'Global fonts (:root)';
  title.style.cssText = 'margin:0 0 0.6rem;font-size:1rem;color:#1a1a1a;';
  panel.appendChild(title);

  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;flex-direction:column;gap:0.6rem;';

  FONT_VARS.forEach(({ varName, label }) => {
    const lbl = document.createElement('label');
    lbl.style.cssText = 'display:flex;flex-direction:column;font-size:0.75rem;color:#4e4b66;gap:0.2rem;';

    const span = document.createElement('span');
    span.textContent = label;

    const select = document.createElement('select');
    select.style.cssText = 'padding:0.4rem;font-size:0.85rem;border:1px solid #ccc;border-radius:4px;background:#fff;color:#1a1a1a;';
    FONT_OPTIONS.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f.stack;
      opt.textContent = f.label;
      select.appendChild(opt);
    });

    // Set current value
    const currentVal = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    const match = FONT_OPTIONS.find((f) => f.stack === currentVal);
    if (match) select.value = match.stack;

    select.addEventListener('change', () => {
      document.documentElement.style.setProperty(varName, select.value);
      onThemeChange({
        ...theme,
        rootFonts: { ...theme.rootFonts, [varName]: select.value },
      });
      onChange();
    });

    lbl.appendChild(span);
    lbl.appendChild(select);
    grid.appendChild(lbl);
  });

  panel.appendChild(grid);

  const hint = document.createElement('p');
  hint.style.cssText = 'margin:0.6rem 0 0;font-size:0.7rem;color:#4e4b66;';
  hint.textContent = 'All components use font-family: inherit so changing here propagates everywhere.';
  panel.appendChild(hint);

  document.body.appendChild(panel);

  return () => {
    panel.remove();
  };
}

// ---------------------------------------------------------------------------
// mountButtonEditMode
// ---------------------------------------------------------------------------

export function mountButtonEditMode(ctx: EditModeContext): () => void {
  const { scope, onChange } = ctx;

  let buttonPresetTarget: HTMLElement | null = null;

  // Build popup DOM
  const popup = document.createElement('div');
  popup.style.cssText = [
    'position:fixed',
    'z-index:99999',
    'background:#fff',
    'border:2px solid var(--secondary,#ffba43)',
    'border-radius:8px',
    'padding:0.8rem',
    'box-shadow:0 4px 24px rgba(0,0,0,0.25)',
    'display:none',
    'flex-direction:column',
    'gap:0.6rem',
    'width:480px',
    'max-width:90vw',
    'max-height:80vh',
    'overflow-y:auto',
  ].join(';');

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';

  const headerStrong = document.createElement('strong');
  headerStrong.textContent = 'Choose button style';
  headerStrong.style.cssText = 'font-size:0.95rem;color:#1a1a1a;';

  const closePopupBtn = document.createElement('button');
  closePopupBtn.type = 'button';
  closePopupBtn.textContent = '×';
  closePopupBtn.style.cssText = 'background:transparent;border:none;font-size:1.4rem;cursor:pointer;color:#4e4b66;line-height:1;padding:0 0.4rem;';
  closePopupBtn.addEventListener('click', () => hidePopup());

  header.appendChild(headerStrong);
  header.appendChild(closePopupBtn);
  popup.appendChild(header);

  // Preset grid
  const presetGrid = document.createElement('div');
  presetGrid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:0.6rem;';

  BUTTON_PRESETS.forEach((p) => {
    const card = document.createElement('div');
    card.style.cssText = 'padding:0.6rem;border:1px solid #ddd;border-radius:6px;background:#fafafa;cursor:pointer;text-align:center;font-size:0.7rem;color:#4e4b66;';
    card.innerHTML = `<a href="javascript:void(0)" class="${p.key}" style="pointer-events:none;">Sample</a><span style="display:block;margin-top:0.4rem;">${p.label}</span>`;
    card.addEventListener('mouseenter', () => { card.style.borderColor = 'var(--secondary,#ffba43)'; card.style.background = '#fff'; });
    card.addEventListener('mouseleave', () => { card.style.borderColor = '#ddd'; card.style.background = '#fafafa'; });
    card.addEventListener('click', () => {
      if (buttonPresetTarget) applyPreset(buttonPresetTarget, p.key);
      hidePopup();
    });
    presetGrid.appendChild(card);
  });

  popup.appendChild(presetGrid);

  // Actions
  const popupActions = document.createElement('div');
  popupActions.style.cssText = 'display:flex;gap:0.4rem;';

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.textContent = 'Reset to original';
  resetBtn.style.cssText = 'flex:1;padding:0.4rem;font-size:0.8rem;border:1px solid #4e4b66;background:#fff;border-radius:4px;cursor:pointer;';
  resetBtn.addEventListener('click', () => {
    if (buttonPresetTarget) {
      const origClass = buttonPresetTarget.dataset.originalClass;
      if (origClass !== undefined) {
        buttonPresetTarget.className = origClass;
      }
    }
    hidePopup();
    onChange();
  });

  popupActions.appendChild(resetBtn);
  popup.appendChild(popupActions);
  document.body.appendChild(popup);

  function showPopup(btn: HTMLElement, x: number, y: number) {
    buttonPresetTarget = btn;
    popup.style.display = 'flex';
    const pw = popup.offsetWidth || 480;
    const ph = popup.offsetHeight || 300;
    popup.style.left = `${Math.min(x, window.innerWidth - pw - 10)}px`;
    popup.style.top = `${Math.min(y, window.innerHeight - ph - 10)}px`;
  }

  function hidePopup() {
    popup.style.display = 'none';
    buttonPresetTarget = null;
  }

  function applyPreset(btn: HTMLElement, presetKey: string) {
    if (!BUTTON_PRESET_TEMPLATES[presetKey]) return;
    const editId = btn.dataset.btnEditId;
    const text = (btn.textContent || '').trim() || 'Button';
    const inner = BUTTON_PRESET_TEMPLATES[presetKey](text);

    // Replace className — strip old presets, add new
    btn.className = btn.className.replace(/\bcs-preset-\d+\b/g, '').trim();
    btn.classList.add(presetKey);
    btn.innerHTML = inner;

    if (editId) btn.dataset.btnEditId = editId;

    repositionPills();
    onChange();
  }

  // Pills
  function repositionPills() {
    document.querySelectorAll<HTMLElement>('.button-edit-pill').forEach((pill) => {
      const editId = pill.dataset.forBtn;
      if (!editId) return;
      const btn = document.querySelector<HTMLElement>(`[data-btn-edit-id="${editId}"]`);
      if (!btn) { pill.remove(); return; }
      const r = btn.getBoundingClientRect();
      pill.style.left = `${r.left + r.width / 2}px`;
      pill.style.top = `${r.top + r.height / 2}px`;
    });
  }

  scope.querySelectorAll<HTMLElement>('[data-btn-edit-id]').forEach((btn) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'button-edit-pill';
    pill.dataset.forBtn = btn.dataset.btnEditId!;
    pill.textContent = 'Style';
    pill.style.cssText = [
      'position:fixed',
      'z-index:2147483647',
      'display:inline-flex',
      'align-items:center',
      'gap:0.3rem',
      'padding:0.4rem 0.8rem',
      'background:#c10e0a',
      'color:#fff',
      'font-family:Arial,sans-serif',
      'font-size:0.75rem',
      'font-weight:700',
      'border:2px solid #fff',
      'border-radius:999px',
      'cursor:pointer',
      'box-shadow:0 4px 14px rgba(0,0,0,0.5)',
      'pointer-events:auto',
      'transform:translate(-50%,-50%)',
      'white-space:nowrap',
      'line-height:1',
    ].join(';');
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const live = document.querySelector<HTMLElement>(`[data-btn-edit-id="${pill.dataset.forBtn}"]`);
      if (!live) return;
      showPopup(live, e.clientX, e.clientY);
    });
    document.body.appendChild(pill);
  });

  repositionPills();

  const scrollHandler = () => repositionPills();
  const resizeHandler = () => repositionPills();
  window.addEventListener('scroll', scrollHandler, true);
  window.addEventListener('resize', resizeHandler);

  // Escape key
  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') hidePopup();
  };
  document.addEventListener('keydown', keyHandler);

  return () => {
    document.querySelectorAll<HTMLElement>('.button-edit-pill').forEach((p) => p.remove());
    window.removeEventListener('scroll', scrollHandler, true);
    window.removeEventListener('resize', resizeHandler);
    document.removeEventListener('keydown', keyHandler);
    popup.remove();
  };
}
