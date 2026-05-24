import type { OverridesPayload, ProjectTheme } from './types';

export function applyOverridesToDOM(
  scope: ParentNode,
  overrides: OverridesPayload,
  theme: ProjectTheme,
): void {
  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(theme.rootColors)) root.setProperty(k, v);
  for (const cv of theme.customVars) root.setProperty(cv.name, cv.hex);
  for (const [k, v] of Object.entries(theme.rootFonts)) root.setProperty(k, v);

  for (const [editId, text] of Object.entries(overrides.textOverrides)) {
    const el = scope.querySelector<HTMLElement>(`[data-edit-id="${editId}"]`);
    if (el) el.textContent = text;
  }

  for (const [editId, src] of Object.entries(overrides.imageOverrides)) {
    const img = scope.querySelector<HTMLImageElement>(`img[data-edit-id="${editId}"]`);
    if (img) {
      img.src = src;
      img.removeAttribute('srcset');
      img.parentElement?.querySelectorAll('source').forEach((s) => s.remove());
    }
  }

  for (const [colorOverrideId, styles] of Object.entries(overrides.localColors)) {
    const el = scope.querySelector<HTMLElement>(`[data-color-override-id="${colorOverrideId}"]`);
    if (!el) continue;
    if (styles.color !== undefined) el.style.color = styles.color;
    if (styles.backgroundColor !== undefined) el.style.backgroundColor = styles.backgroundColor;
  }

  for (const [btnEditId, preset] of Object.entries(overrides.buttonOverrides)) {
    const el = scope.querySelector<HTMLElement>(`[data-btn-edit-id="${btnEditId}"]`);
    if (!el) continue;
    el.className = el.className.replace(/\bcs-preset-\d+\b/g, '').trim();
    el.classList.add(preset);
  }
}

export function extractOverridesFromDOM(scope: ParentNode): OverridesPayload {
  const out: OverridesPayload = { textOverrides: {}, imageOverrides: {}, localColors: {}, buttonOverrides: {} };
  scope.querySelectorAll<HTMLElement>('[data-edit-id]').forEach((el) => {
    const id = el.dataset.editId!;
    if (el.tagName === 'IMG') out.imageOverrides[id] = (el as HTMLImageElement).src;
    else if (el.getAttribute('data-editable') === 'true') out.textOverrides[id] = el.textContent ?? '';
  });
  scope.querySelectorAll<HTMLElement>('[data-color-override-id]').forEach((el) => {
    const id = el.dataset.colorOverrideId!;
    const c = el.style.color;
    const bg = el.style.backgroundColor;
    if (c || bg) out.localColors[id] = { ...(c ? { color: c } : {}), ...(bg ? { backgroundColor: bg } : {}) };
  });
  scope.querySelectorAll<HTMLElement>('[data-btn-edit-id]').forEach((el) => {
    const id = el.dataset.btnEditId!;
    const preset = el.className.match(/\bcs-preset-\d+\b/);
    if (preset) out.buttonOverrides[id] = preset[0];
  });
  return out;
}

export function annotateSection(sectionEl: HTMLElement, componentType: string, variantValue: string): void {
  let textIdx = 0;
  sectionEl.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6, p, span, a, li, button').forEach((el) => {
    if (el.getAttribute('data-editable') === 'false') return;
    const hasElementChildren = Array.from(el.children).some(
      (c) => !['IMG', 'BR', 'SVG', 'I'].includes(c.tagName)
    );
    if (hasElementChildren) return;
    const hasDirectText = Array.from(el.childNodes).some(
      (n) => n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim() !== ''
    );
    if (!hasDirectText) return;
    el.setAttribute('data-editable', 'true');
    if (!el.dataset.editId) {
      el.dataset.editId = `${componentType}-${variantValue}-text-${textIdx}`;
      if (!el.dataset.originalText) el.dataset.originalText = el.textContent || '';
    }
    textIdx++;
  });

  let imgIdx = 0;
  sectionEl.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    if (!img.dataset.editId) {
      img.dataset.editId = `${componentType}-${variantValue}-img-${imgIdx}`;
      if (!img.dataset.originalSrc) img.dataset.originalSrc = img.src;
    }
    imgIdx++;
  });

  let btnIdx = 0;
  sectionEl.querySelectorAll<HTMLElement>('button, a').forEach((el) => {
    const cls = el.className || '';
    if (typeof cls !== 'string') return;
    if (!/\b(button|btn)\b/i.test(cls)) return;
    if (!el.dataset.btnEditId) {
      el.dataset.btnEditId = `${componentType}-${variantValue}-btn-${btnIdx}`;
      el.dataset.originalClass = cls;
    }
    btnIdx++;
  });
}
