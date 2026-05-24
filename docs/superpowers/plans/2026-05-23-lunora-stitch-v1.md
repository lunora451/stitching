# Lunora Stitch V1 — Implementation Plan (revised after POC review)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a usable V1 of Lunora Stitch with persistent projects/pages on D1, a visual templateBuilder that matches the *existing* `src/pages/templateBuilder.astro` UX, an editor that ports the **five** edit modes from `src/pages/editor.astro` (text / image / color / font / button), an extended theme editor with custom color variables, and two exports (Markdown summary + offline-openable ZIP of HTML pages). Layouts stay hardcoded — schema refactor is explicitly deferred.

**Architecture pivot from previous plan:**
- **Throw away schema-driven approach.** The first POC tried to migrate one hero variant into a props-driven component with a schema panel. The result lost every feature of the old editor and forced one variant per layout. We pivot back to the *old editor model*: layouts stay as-is, every editable element is annotated with `data-editable` / `data-edit-id` / `data-btn-edit-id`, and edits are stored as DOM-keyed override JSON per section. The "schema" is implicit (the rendered DOM is the schema).
- **`section.content` is now an `OverridesPayload`**, not a typed field record. Shape: `{ textOverrides, imageOverrides, localColors, buttonOverrides }` — exactly the shape stored in `localStorage` today by `src/pages/editor.astro`.
- **`project.theme` is extended**: 10 root color vars (named, like `--primary`, `--secondary`, `--headerColor`, …) PLUS an array of user-added custom vars (`{ name, hex }`), PLUS root font vars (`--headerFont`, `--bodyFont`, `--navNeon`).
- **Whitelist for V1**: `heroSection`, `service`, `footer` only (same set the old editor already supported via `SUPPORTED_TYPES` at `src/pages/editor.astro:1521`). Variants restricted by category. Other 18 categories stay visible in the *old* `/templateBuilder` route (untouched) but are excluded from the new project-scoped builder.
- **Images** go to R2 via a new `/api/uploads` endpoint and are referenced by URL in `imageOverrides`. No base64 in D1.
- **ZIP export is client-side**: server returns project + pages + overrides JSON; the browser opens an in-memory DOM per page, runs the same replay logic the editor uses, serializes the result, fetches images as blobs, and packages everything via `jszip` in the browser. No DOM library needed on Workers.

**Tech Stack:** Astro 6.3 + `@astrojs/cloudflare` 13.5 (already configured), Cloudflare D1, Cloudflare R2, `jszip` (client-side only). Existing registries `src/components/editor/{hero,service,footer}Registry.ts` are reused — they already import every variant.

---

## Context

The first execution of this plan produced a minimal POC: working project CRUD, working page CRUD, working theme editor (but only `--primary`, `--secondary`, two fonts), a "templateBuilder" that's a single `+ Hero centered (1)` button, and an editor that only edits four text fields (Topper / Titre / Description / Texte du bouton) on one hardcoded hero variant. The user reviewed it and called it unusable: the layout picker must look like the existing `src/pages/templateBuilder.astro` (full visual catalog with optgrouped selects + live preview); the editor must restore the five edit modes (text / image / **all** colors with custom support / fonts / button presets); and we still owe the two exports (Markdown + ZIP HTML).

This revised plan deletes the schema scaffolding and re-implements the editor on top of the *existing* old editor's mechanism, persisted to D1 instead of `localStorage`.

---

## Decisions locked from clarification

| Topic | Choice |
|---|---|
| Image storage | R2 from day one (upload → URL stored in overrides) |
| Layout whitelist | `heroSection`, `service`, `footer` only |
| Old schema/library/SectionPanel files | **Deleted entirely** |
| ZIP HTML export | Included in this plan |

---

## File Structure

**Deleted (cleanup of failed POC):**
- `src/schemas/` (entire dir: `types.ts`, `hero-1.ts`, `registry.ts`)
- `src/components/library/` (entire dir: `Hero1.astro`, `registry.ts`)
- `src/components/editor/SectionPanel.astro`
- `tests/` (the POC test scaffolding is no longer relevant — to be re-added as needed)

**Created:**
- `migrations/0002_extend_theme_defaults.sql` — update default theme JSON to the extended shape (no DDL change needed; column stays TEXT)
- `src/lib/r2.ts` — typed helper around `env.IMAGES.put` / public URL building
- `src/lib/overrides.ts` — pure functions: `extractOverridesFromDOM(rootEl)`, `applyOverridesToDOM(rootEl, overrides, theme)`, shared by editor + export
- `src/lib/types.ts` — shared types: `OverridesPayload`, `ProjectTheme`, `RootColorKey`
- `src/pages/api/uploads.ts` — `POST` multipart → R2 → `{ url }`
- `src/pages/api/projects/[id]/export-md.ts` — Markdown dump (synchronous)
- `src/pages/projects/[projectId]/pages/[pageId]/render.astro` — *no-chrome* renderer: just `<Layout theme>` + sections in order. Used by the client-side ZIP export and previewable directly.
- `src/components/editor/EditMode.ts` — extracted edit-mode handlers (text/image/color/font/button) shared by the editor; ported from the inline JS in `src/pages/editor.astro`

**Heavily modified:**
- `src/lib/db.ts` — replace `Section.content: Record<string, unknown>` with `OverridesPayload`; extend `ProjectTheme` (root colors map + custom vars + fonts map). See Task 2 for full code.
- `src/pages/projects/[projectId]/pages/new.astro` — full rewrite. Copy the visual UI from `src/pages/templateBuilder.astro` (selects + live preview wrappers + order inputs), restrict the *select options* to the whitelisted categories, and replace the "Open Editor" handler so it POSTs to `/api/projects/[id]/pages` and redirects to the editor.
- `src/pages/projects/[projectId]/pages/[pageId]/edit.astro` — full rewrite. Render sections from D1 via existing registries, wrap in `.editable-component` with the same data attributes the old editor uses, mount the five edit-mode toolbars, replay saved overrides on load, PATCH overrides on Save.
- `src/components/editor/ThemeEditor.astro` — extend: 10 root color pickers + dynamic list of custom vars (add/remove rows) + 3 root font selects.
- `src/components/editor/EditorPreview.astro` — keep as-is (already wraps with `.editable-component` and forwards `data-component-type`/`data-variant-value`). Verify and adapt to render a *D1-driven* section list rather than the URL-param list it currently consumes.
- `package.json` — add `jszip` to `dependencies`.

**Untouched:**
- `src/pages/templateBuilder.astro` (the original) — left alone, still reachable at `/templateBuilder` for reference.
- `src/pages/editor.astro` (the original) — same. Will eventually be removed once the new editor reaches parity, but stays during this plan as the source of truth for porting.
- Every file in `src/layouts/<category>/*` — no edits to layouts themselves.
- The three registry files `src/components/editor/{hero,service,footer}Registry.ts` — already imported all variants during the POC; verify completeness in Task 4.

---

## Data Model

**`project.theme` shape (stored as TEXT JSON in `projects.theme`):**

```ts
interface ProjectTheme {
  rootColors: {
    '--primary': string;
    '--secondary': string;
    '--headerColor': string;
    '--grey': string;
    '--bodyTextColor': string;
    '--backgroundColor': string;
    '--primaryLight': string;
    '--secondaryLight': string;
    '--bodyTextColorWhite': string;
    '--errorColor': string;
  };
  customVars: Array<{ name: string; hex: string }>; // names like "--accent", "--brand-2"
  rootFonts: {
    '--headerFont': string;
    '--bodyFont': string;
    '--navNeon': string;
  };
}
```

**`section.content` shape (stored as TEXT JSON in `sections.content`):**

```ts
interface OverridesPayload {
  textOverrides: Record<string, string>;       // editId → new text content
  imageOverrides: Record<string, string>;      // editId → R2 URL
  localColors: Record<string, { color?: string; backgroundColor?: string }>;
  buttonOverrides: Record<string, string>;     // btnEditId → preset class name (e.g. "cs-preset-3")
}
```

`section.layout_id` format: `"<componentType>-<variantValue>"`, e.g. `"heroSection-15"`, `"service-22"`, `"footer-11"`. This matches the format the old editor already uses to generate edit-ids.

---

## Tasks

### Task 1: Cleanup the failed POC

**Files:**
- Delete: `src/schemas/` (whole dir)
- Delete: `src/components/library/` (whole dir)
- Delete: `src/components/editor/SectionPanel.astro`
- Delete: `tests/lib/slugify.test.ts` and `tests/lib/db.test.ts` if they exist (the POC scaffolding)

- [ ] **Step 1: Remove dirs and files**

```bash
rm -rf src/schemas
rm -rf src/components/library
rm -f src/components/editor/SectionPanel.astro
rm -rf tests/lib
```

- [ ] **Step 2: Verify nothing imports the deleted files**

Run: `grep -rn "from.*schemas\|from.*components/library\|SectionPanel" src/ 2>&1 | grep -v '^Binary'`
Expected: empty output. If any hits remain, the executor must remove those imports/usages in the same task before proceeding.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove failed schema POC (schemas/, library/, SectionPanel)"
```

---

### Task 2: Extend `db.ts` types + migration for new theme defaults

**Files:**
- Modify: `src/lib/db.ts`
- Create: `src/lib/types.ts`
- Create: `migrations/0002_extend_theme_defaults.sql`

- [ ] **Step 1: Create `src/lib/types.ts`**

```ts
export type RootColorKey =
  | '--primary' | '--secondary' | '--headerColor' | '--grey' | '--bodyTextColor'
  | '--backgroundColor' | '--primaryLight' | '--secondaryLight' | '--bodyTextColorWhite' | '--errorColor';

export type RootFontKey = '--headerFont' | '--bodyFont' | '--navNeon';

export interface ProjectTheme {
  rootColors: Record<RootColorKey, string>;
  customVars: Array<{ name: string; hex: string }>;
  rootFonts: Record<RootFontKey, string>;
}

export interface OverridesPayload {
  textOverrides: Record<string, string>;
  imageOverrides: Record<string, string>;
  localColors: Record<string, { color?: string; backgroundColor?: string }>;
  buttonOverrides: Record<string, string>;
}

export const EMPTY_OVERRIDES: OverridesPayload = {
  textOverrides: {},
  imageOverrides: {},
  localColors: {},
  buttonOverrides: {},
};

export const DEFAULT_THEME: ProjectTheme = {
  rootColors: {
    '--primary': '#ff6a3e',
    '--secondary': '#ffba43',
    '--headerColor': '#1a1a1a',
    '--grey': '#cccccc',
    '--bodyTextColor': '#353535',
    '--backgroundColor': '#ffffff',
    '--primaryLight': '#ffd9cc',
    '--secondaryLight': '#ffeac7',
    '--bodyTextColorWhite': '#f5f5f5',
    '--errorColor': '#d62828',
  },
  customVars: [],
  rootFonts: {
    '--headerFont': "'Oswald', sans-serif",
    '--bodyFont': "'Source Sans 3', sans-serif",
    '--navNeon': "'Oswald', sans-serif",
  },
};
```

- [ ] **Step 2: Patch `src/lib/db.ts`**

Replace the existing `Project`/`ProjectTheme`/`Section` interfaces and the `DEFAULT_THEME` constant with imports from `./types`. Replace any `Record<string, unknown>` content typings on Section/createPage with `OverridesPayload` / `EMPTY_OVERRIDES`. Concretely:

- Remove the inline `ProjectTheme` interface and the local `DEFAULT_THEME` constant.
- Add `import { ProjectTheme, OverridesPayload, EMPTY_OVERRIDES, DEFAULT_THEME } from './types';` at the top.
- Change `Section.content` type to `OverridesPayload`.
- In `createPage`, change the `defaults` parameter to: `defaults: (layoutId: string) => OverridesPayload = () => EMPTY_OVERRIDES`. Remove the schema-based default content lookup.
- `replaceSectionsContent` updates already work — only the type narrows.

- [ ] **Step 3: Write migration `migrations/0002_extend_theme_defaults.sql`**

```sql
-- Migrate existing projects.theme rows from the POC shape ({primary,secondary,headerFont,bodyFont})
-- to the new shape (rootColors map + customVars + rootFonts map).
-- Existing rows are best-effort migrated; missing keys take DEFAULT_THEME values.

UPDATE projects
SET theme = json_object(
  'rootColors', json_object(
    '--primary', COALESCE(json_extract(theme, '$.primary'), '#ff6a3e'),
    '--secondary', COALESCE(json_extract(theme, '$.secondary'), '#ffba43'),
    '--headerColor', '#1a1a1a',
    '--grey', '#cccccc',
    '--bodyTextColor', '#353535',
    '--backgroundColor', '#ffffff',
    '--primaryLight', '#ffd9cc',
    '--secondaryLight', '#ffeac7',
    '--bodyTextColorWhite', '#f5f5f5',
    '--errorColor', '#d62828'
  ),
  'customVars', json_array(),
  'rootFonts', json_object(
    '--headerFont', COALESCE(json_extract(theme, '$.headerFont'), '''Oswald'', sans-serif'),
    '--bodyFont', COALESCE(json_extract(theme, '$.bodyFont'), '''Source Sans 3'', sans-serif'),
    '--navNeon', '''Oswald'', sans-serif'
  )
)
WHERE json_extract(theme, '$.rootColors') IS NULL;

-- Also reset any sections that had the schema-style content (POC field-name maps) to empty overrides,
-- since those keys ("title", "subtitle", etc.) won't match any edit-id in the new layouts.
UPDATE sections
SET content = json_object(
  'textOverrides', json_object(),
  'imageOverrides', json_object(),
  'localColors', json_object(),
  'buttonOverrides', json_object()
)
WHERE json_extract(content, '$.textOverrides') IS NULL;
```

- [ ] **Step 4: Apply migration locally**

Run: `npm run db:migrate:local`
Expected: `✅ ... 2 commands executed`.

- [ ] **Step 5: Verify with a SELECT**

Run: `npx wrangler d1 execute lunora-stitch-dev --local --command="SELECT id, json_extract(theme, '$.rootColors.--primary') AS primary FROM projects;"`
Expected: lists existing projects with non-null `primary` column.

- [ ] **Step 6: Commit**

```bash
git add src/lib/db.ts src/lib/types.ts migrations/0002_extend_theme_defaults.sql
git commit -m "feat: extended ProjectTheme + OverridesPayload types + migration"
```

---

### Task 3: R2 image upload endpoint

**Files:**
- Create: `src/lib/r2.ts`
- Create: `src/pages/api/uploads.ts`
- Modify: `wrangler.jsonc` (verify R2 binding already present from previous plan; if not, add it)

- [ ] **Step 1: Verify R2 bucket exists locally**

Run: `npx wrangler r2 bucket create lunora-stitch-images --local 2>&1 || true`
Expected: bucket created, or "already exists" — both fine.

- [ ] **Step 2: Implement `src/lib/r2.ts`**

```ts
import { uuid } from './ids';

const PUBLIC_BASE = '/r2'; // served by Cloudflare R2 public bucket binding; for local dev we proxy via /r2/<key>

export async function putImage(bucket: R2Bucket, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `images/${uuid()}.${ext}`;
  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  });
  return `${PUBLIC_BASE}/${key}`;
}
```

- [ ] **Step 3: Implement `src/pages/api/uploads.ts`**

```ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { putImage } from '../../lib/r2';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: 'file required (multipart field "file")' }), { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return new Response(JSON.stringify({ error: 'only image/* accepted' }), { status: 400 });
  }
  const url = await putImage(env.IMAGES, file);
  return new Response(JSON.stringify({ url }), { headers: { 'content-type': 'application/json' } });
};
```

- [ ] **Step 4: Add a `/r2/[...key]` passthrough route for local dev**

Create `src/pages/r2/[...key].ts`:

```ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const key = (params.key as string) ?? '';
  const obj = await env.IMAGES.get(key);
  if (!obj) return new Response('not found', { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
};
```

Note for production: in Cloudflare you'd front R2 with a public bucket or custom domain and skip this proxy. The `PUBLIC_BASE` constant in `r2.ts` keeps it swap-able.

- [ ] **Step 5: Smoke test**

Start `npm run dev`, then:

```bash
curl -F "file=@README.md" http://localhost:4321/api/uploads
# Expected: {"error":"only image/* accepted"}
curl -F "file=@<some-jpg-on-disk>" http://localhost:4321/api/uploads
# Expected: {"url":"/r2/images/<uuid>.jpg"}
# Then: curl -I http://localhost:4321/r2/images/<uuid>.jpg → 200 with content-type image/jpeg
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/r2.ts src/pages/api/uploads.ts src/pages/r2/
git commit -m "feat: R2 image upload endpoint + local passthrough proxy"
```

---

### Task 4: TemplateBuilder rewrite — visual catalog, project-scoped

**Files:**
- Modify (full rewrite): `src/pages/projects/[projectId]/pages/new.astro`
- Reference: `src/pages/templateBuilder.astro` (source UI), `src/components/editor/{hero,service,footer}Registry.ts` (variant maps)

- [ ] **Step 1: Verify the three registries are complete**

Run: `head -5 src/components/editor/heroRegistry.ts && tail -5 src/components/editor/heroRegistry.ts && wc -l src/components/editor/*Registry.ts`
Expected: heroRegistry has imports from 1..123 and exports a `HERO_VARIANTS` map; serviceRegistry covers 1..170; footerRegistry covers 1..27. If any are stubs (less than full coverage), the executor must fill them in *before* continuing — copy the import block and the `as const` map from `src/pages/editor.astro` (the old editor already had them inline before the registries were extracted; if not present there either, generate them from `Get-ChildItem src/layouts/heroSection -Recurse -File *.astro` and mirror the imports).

- [ ] **Step 2: Write the new `new.astro`**

This is a *full file* — copy the visual structure from `src/pages/templateBuilder.astro` lines 26–1353 (the `<Layout>...</Layout>` body) and keep ONLY the three select groups for `heroSection`, `service`, `footer` (drop the 18 other groups). Replace the script block so it POSTs to the API on submit instead of redirecting to `/editor` with URL params.

```astro
---
import Layout from '../../../../layouts/Layout.astro';
import Hero from '../../../../layouts/show/Hero.astro';
import Services from '../../../../layouts/show/Services.astro';
import Footer from '../../../../layouts/show/Footer.astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../../lib/db';

export const prerender = false;

const { projectId } = Astro.params;
const db = new DB(env.DB);
const project = await db.getProject(projectId!);
if (!project) return Astro.redirect('/projects');
---

<Layout>
  <div class="c-dunno">
    <div class="c-menu">
      <div class="hider">&squf;</div>

      <p style="margin: 0 0 0.5rem 0; font-weight: bold;">
        <a href={`/projects/${projectId}`} style="color: inherit;">← {project.name}</a>
      </p>

      <input id="page-name-input" placeholder="Nom de la page" required
             style="padding: 0.4rem; margin-bottom: 0.5rem;" />

      <div class="select-group">
        <input type="number" class="order-input" data-target="hero-component" value="1" min="1" max="3" />
        <select name="heroSection" id="template-select-hero">
          <option value="none">Hero</option>
          <!-- copy ALL optgroup+option lines for heroSection from src/pages/templateBuilder.astro:125-258 -->
        </select>
      </div>

      <div class="select-group">
        <input type="number" class="order-input" data-target="service-component" value="2" min="1" max="3" />
        <select name="service" id="template-select-service">
          <option value="none">Service</option>
          <!-- copy ALL optgroup+option lines for service from src/pages/templateBuilder.astro:270-452 -->
        </select>
      </div>

      <div class="select-group">
        <input type="number" class="order-input" data-target="footer-component" value="3" min="1" max="3" />
        <select name="footer" id="template-select-footer">
          <option value="none">Footer</option>
          <!-- copy ALL option lines for footer from src/pages/templateBuilder.astro:1177-1206 -->
        </select>
      </div>

      <button id="generate-preview" class="preview-button">Ouvrir l'éditeur</button>
    </div>

    <div class="c-content">
      <div id="hero-component" class="component-wrapper" style="order: 1;"><Hero /></div>
      <div id="service-component" class="component-wrapper" style="order: 2;"><Services /></div>
      <div id="footer-component" class="component-wrapper" style="order: 3;"><Footer /></div>
    </div>
  </div>
</Layout>

<style lang="scss">
  /* Copy the entire <style lang="scss"> block from src/pages/templateBuilder.astro:1355-1436 verbatim. */
</style>

<script>
  // Copy the menu toggle + order-input handlers from src/pages/templateBuilder.astro:1438-1469 verbatim.
  const tickerMenu = document.querySelector('.hider')!;
  const menu = document.querySelector('.c-menu')!;
  tickerMenu.addEventListener('click', () => menu.classList.toggle('hide'));

  const orderInputs = document.querySelectorAll<HTMLInputElement>('.order-input');
  orderInputs.forEach((input) => {
    const apply = () => {
      const targetId = input.dataset.target!;
      const t = document.getElementById(targetId);
      if (t) t.style.order = input.value;
    };
    input.addEventListener('change', apply);
    input.addEventListener('input', apply);
  });

  // Submit handler: build sections payload, POST to API, redirect to editor.
  const submitBtn = document.getElementById('generate-preview')!;
  submitBtn.addEventListener('click', async () => {
    const pageNameEl = document.getElementById('page-name-input') as HTMLInputElement;
    const name = pageNameEl.value.trim();
    if (!name) { alert('Nom de la page requis.'); pageNameEl.focus(); return; }

    const TYPE_TO_PREFIX: Record<string, string> = {
      heroSection: 'heroSection',
      service: 'service',
      footer: 'footer',
    };

    const selected: Array<{ layoutId: string; order: number }> = [];
    document.querySelectorAll<HTMLDivElement>('.select-group').forEach((group) => {
      const select = group.querySelector('select')!;
      const orderInput = group.querySelector<HTMLInputElement>('.order-input')!;
      if (select.value !== 'none' && TYPE_TO_PREFIX[select.name]) {
        selected.push({
          layoutId: `${TYPE_TO_PREFIX[select.name]}-${select.value}`,
          order: parseInt(orderInput.value, 10),
        });
      }
    });
    if (selected.length === 0) { alert('Sélectionnez au moins une section.'); return; }
    selected.sort((a, b) => a.order - b.order);

    const projectId = location.pathname.split('/')[2];
    const res = await fetch(`/api/projects/${projectId}/pages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, layoutIds: selected.map((s) => s.layoutId) }),
    });
    if (!res.ok) { alert('Création de page échouée'); return; }
    const page = await res.json();
    location.href = `/projects/${projectId}/pages/${page.id}/edit`;
  });

  // Visual catalog wiring: when a select changes, toggle the active variant inside its preview wrapper.
  // Reuse the same data-value-* mechanism used by src/layouts/show/Hero.astro (and friends).
  document.querySelectorAll<HTMLSelectElement>('select[id^="template-select-"]').forEach((sel) => {
    sel.addEventListener('change', () => {
      // The show/ components listen via their own internal scripts for changeCollection() — we just
      // dispatch a change event on the select they already query (id="template-select-<type>").
      // No further wiring needed; events bubble through document already.
    });
  });
</script>
```

The executor must paste in the full select-option lists from `src/pages/templateBuilder.astro` for the three categories (do NOT abbreviate — these are static lists already in the codebase). The CSS block at the bottom is copied unchanged.

- [ ] **Step 3: Manually verify**

`npm run dev`, navigate to `/projects/<id>/pages/new`. Confirm:
- The fixed side menu shows three select groups (hero / service / footer).
- The right side shows the visual previews of `Hero`, `Services`, `Footer` show components stacked.
- Changing the hero select changes which variant is highlighted in the preview (same behavior as the old `/templateBuilder` route).
- Reordering via the number inputs reorders the preview columns.
- Clicking "Ouvrir l'éditeur" with a name and at least one non-`none` select creates a page in D1 and redirects to the editor.

Sanity check D1: `npx wrangler d1 execute lunora-stitch-dev --local --command="SELECT id, layout_id, \"order\" FROM sections ORDER BY page_id, \"order\";"`

- [ ] **Step 4: Commit**

```bash
git add src/pages/projects/
git commit -m "feat: templateBuilder rewrite — visual catalog scoped to hero/service/footer"
```

---

### Task 5: Extract edit-mode logic into a reusable module

**Files:**
- Create: `src/components/editor/EditMode.ts`
- Create: `src/lib/overrides.ts`
- Reference: `src/pages/editor.astro` lines ~800–1400 (inline JS for the five modes)

This task lifts the JS that today lives inline at the bottom of `src/pages/editor.astro` into a shared TypeScript module. No behavior change; just extraction so the new editor (and the export renderer) can import it.

- [ ] **Step 1: Create `src/lib/overrides.ts`**

```ts
import type { OverridesPayload, ProjectTheme } from './types';

/** Run after sections are mounted. Replays saved overrides onto the live DOM. */
export function applyOverridesToDOM(
  scope: ParentNode,
  overrides: OverridesPayload,
  theme: ProjectTheme,
): void {
  // 1. Theme — root CSS vars
  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(theme.rootColors)) root.setProperty(k, v);
  for (const cv of theme.customVars) root.setProperty(cv.name, cv.hex);
  for (const [k, v] of Object.entries(theme.rootFonts)) root.setProperty(k, v);

  // 2. Text overrides
  for (const [editId, text] of Object.entries(overrides.textOverrides)) {
    const el = scope.querySelector<HTMLElement>(`[data-edit-id="${editId}"]`);
    if (el) el.textContent = text;
  }

  // 3. Image overrides
  for (const [editId, src] of Object.entries(overrides.imageOverrides)) {
    const img = scope.querySelector<HTMLImageElement>(`img[data-edit-id="${editId}"]`);
    if (img) {
      img.src = src;
      img.removeAttribute('srcset');
      img.parentElement?.querySelectorAll('source').forEach((s) => s.remove());
    }
  }

  // 4. Local colors (per-element)
  for (const [colorOverrideId, styles] of Object.entries(overrides.localColors)) {
    const el = scope.querySelector<HTMLElement>(`[data-color-override-id="${colorOverrideId}"]`);
    if (!el) continue;
    if (styles.color !== undefined) el.style.color = styles.color;
    if (styles.backgroundColor !== undefined) el.style.backgroundColor = styles.backgroundColor;
  }

  // 5. Button overrides — apply preset class
  for (const [btnEditId, preset] of Object.entries(overrides.buttonOverrides)) {
    const el = scope.querySelector<HTMLElement>(`[data-btn-edit-id="${btnEditId}"]`);
    if (!el) continue;
    // Remove any cs-preset-N class, then add the new one.
    el.className = el.className.replace(/\bcs-preset-\d+\b/g, '').trim();
    el.classList.add(preset);
  }
}

/** Read current edits back out of the DOM into an OverridesPayload. */
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

/** Tag editable nodes inside a freshly rendered section. Called once per section after mount.
 *  Mirrors the logic in src/pages/editor.astro that walks each .editable-component and stamps
 *  data-edit-id / data-editable / data-btn-edit-id onto descendants. */
export function annotateSection(sectionEl: HTMLElement, componentType: string, variantValue: string): void {
  // TEXT: every leaf text-bearing element gets a stable id based on document order.
  let textIdx = 0;
  sectionEl.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6, p, span, a, li, button').forEach((el) => {
    if (el.children.length === 0 && (el.textContent || '').trim()) {
      el.setAttribute('data-editable', 'true');
      el.setAttribute('data-edit-id', `${componentType}-${variantValue}-text-${textIdx++}`);
    }
  });
  // IMAGE: every <img>.
  let imgIdx = 0;
  sectionEl.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    img.setAttribute('data-edit-id', `${componentType}-${variantValue}-img-${imgIdx++}`);
    img.setAttribute('data-original-src', img.src);
  });
  // BUTTON: <button> and <a> that look like CTAs (have a `cs-button` class or contain a single text node).
  let btnIdx = 0;
  sectionEl.querySelectorAll<HTMLElement>('a.cs-button, button.cs-button, a[class*="cs-preset"], button[class*="cs-preset"]').forEach((el) => {
    el.setAttribute('data-btn-edit-id', `${componentType}-${variantValue}-btn-${btnIdx++}`);
    el.setAttribute('data-original-class', el.className);
  });
}
```

- [ ] **Step 2: Create `src/components/editor/EditMode.ts`**

This module exports five `mount<Mode>EditMode(opts)` functions. The executor must port the body of each from the inline IIFEs in `src/pages/editor.astro`. The signatures and skeleton:

```ts
export interface EditModeContext {
  scope: HTMLElement;                 // root of editable content (#editor-preview)
  onChange: () => void;               // call when an edit happens (the editor sets dirty + live update)
}

export function mountTextEditMode(ctx: EditModeContext): () => void { /* port from editor.astro:821-852 */ throw new Error('TODO'); }
export function mountImageEditMode(ctx: EditModeContext): () => void { /* port from editor.astro:854-869, 1225-1243 */ throw new Error('TODO'); }
export function mountColorEditMode(ctx: EditModeContext & { theme: import('../../lib/types').ProjectTheme; onThemeChange: (theme: import('../../lib/types').ProjectTheme) => void }): () => void { /* port from editor.astro:1245-1383 */ throw new Error('TODO'); }
export function mountFontEditMode(ctx: EditModeContext & { theme: import('../../lib/types').ProjectTheme; onThemeChange: (theme: import('../../lib/types').ProjectTheme) => void }): () => void { /* port from editor.astro:1104-1117 */ throw new Error('TODO'); }
export function mountButtonEditMode(ctx: EditModeContext): () => void { /* port from editor.astro:1064-1102, 1277-1290 */ throw new Error('TODO'); }
```

Each function returns a *cleanup* function that detaches listeners and removes any floating UI (the image "📷 Change image" pills, the color popup, etc.) — the new editor calls cleanup when the user toggles the mode off.

**Concrete porting steps for the executor:** read the line ranges named above in `src/pages/editor.astro`, identify the variable closures and DOM lookups, replace `getCurrentTemplate()` / `setCurrentTemplate()` calls with `ctx.onChange()`, replace direct `localStorage.setItem` calls (none in the mode bodies — they happen in the save handler), and replace the `image-edit-pill` upload handler so instead of `FileReader.readAsDataURL` it `POST`s the file to `/api/uploads` and uses the returned URL.

The button preset HTML templates (the 10 of them) live in `src/components/styles/base/buttonPresets.css` and the inline preset HTML map in `editor.astro` — port the preset HTML map into a `BUTTON_PRESETS: Record<string, string>` const at the top of `EditMode.ts`.

- [ ] **Step 3: Smoke compile check**

Run: `npm run build`
Expected: compilation succeeds. The `throw new Error('TODO')` bodies are fine for now — they don't run unless the editor is loaded, and the editor doesn't exist yet. (If TS strict mode complains, mark these `as never`.)

- [ ] **Step 4: Commit**

```bash
git add src/components/editor/EditMode.ts src/lib/overrides.ts
git commit -m "feat: extract overrides helpers + EditMode scaffolding from old editor"
```

---

### Task 6: Replace the editor page with a real one

**Files:**
- Modify (full rewrite): `src/pages/projects/[projectId]/pages/[pageId]/edit.astro`
- Reference: `src/pages/editor.astro` (toolbar markup, mode-toggle wiring)

- [ ] **Step 1: Rewrite the editor page**

```astro
---
import Layout from '../../../../../layouts/Layout.astro';
import EditorPreview from '../../../../../components/editor/EditorPreview.astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../../../lib/db';

export const prerender = false;

const { projectId, pageId } = Astro.params;
const db = new DB(env.DB);
const project = await db.getProject(projectId!);
const page = await db.getPage(pageId!);
if (!project || !page) return Astro.redirect('/projects');
const sections = await db.listSections(page.id);

// Sections are passed to EditorPreview the same way the old editor was driven by URL params.
const previewSelection = sections.map((s) => {
  const [componentType, variantValue] = splitLayoutId(s.layoutId);
  return { componentType, variantValue, sectionId: s.id, content: s.content };
});

function splitLayoutId(id: string): [string, string] {
  const i = id.lastIndexOf('-');
  return [id.slice(0, i), id.slice(i + 1)];
}
---

<Layout>
  <div id="editor-root" data-project-id={project.id} data-page-id={page.id}>
    <header style="position:fixed; top:0; left:0; right:0; background:#222; color:#fff; padding:0.5rem 1rem; display:flex; gap:0.5rem; align-items:center; z-index:99999;">
      <a href={`/projects/${project.id}`} style="color:inherit;">← Retour au projet</a>
      <strong style="margin-right:auto;">{page.name}</strong>
      <button id="toggle-text-edit" data-mode="text">Texte</button>
      <button id="toggle-image-edit" data-mode="image">Image</button>
      <button id="toggle-color-edit" data-mode="color">Couleurs</button>
      <button id="toggle-font-edit" data-mode="font">Polices</button>
      <button id="toggle-button-edit" data-mode="button">Boutons</button>
      <button id="save-btn" style="background:#27ae60; color:#fff;">Sauvegarder</button>
      <span id="dirty-indicator" hidden style="color:#f1c40f;">● non sauvegardé</span>
    </header>

    <main id="editor-preview" style="padding-top: 3.5rem;">
      <EditorPreview selection={previewSelection} />
    </main>
  </div>

  <script define:vars={{ initialTheme: project.theme, initialSelection: previewSelection, projectIdStr: project.id, pageIdStr: page.id }}>
    // Astro's `define:vars` creates a non-module inline script. It can't share scope with the
    // module script below, so we bridge through `window.__editorBoot`.
    window.__editorBoot = { initialTheme, initialSelection, projectIdStr, pageIdStr };
  </script>
  <script>
    import { applyOverridesToDOM, extractOverridesFromDOM, annotateSection } from '../../../../../lib/overrides';
    import { mountTextEditMode, mountImageEditMode, mountColorEditMode, mountFontEditMode, mountButtonEditMode } from '../../../../../components/editor/EditMode';

    // Astro's bare `<script>` is processed: imports get bundled. Read bootstrap data from window.
    const { initialTheme, initialSelection, projectIdStr, pageIdStr } = window.__editorBoot;

    const root = document.getElementById('editor-preview');
    let theme = initialTheme;
    let dirty = false;
    const dirtyEl = document.getElementById('dirty-indicator');
    const setDirty = (v) => { dirty = v; dirtyEl.hidden = !v; };

    // 1. Annotate each .editable-component with edit-ids, then replay saved overrides.
    document.querySelectorAll('#editor-preview .editable-component').forEach((section) => {
      const type = section.dataset.componentType;
      const value = section.dataset.variantValue;
      annotateSection(section, type, value);
    });
    // Build a merged overrides map from all sections. Edit-ids are unique-per-section already.
    const merged = { textOverrides: {}, imageOverrides: {}, localColors: {}, buttonOverrides: {} };
    for (const s of initialSelection) {
      Object.assign(merged.textOverrides, s.content.textOverrides ?? {});
      Object.assign(merged.imageOverrides, s.content.imageOverrides ?? {});
      Object.assign(merged.localColors, s.content.localColors ?? {});
      Object.assign(merged.buttonOverrides, s.content.buttonOverrides ?? {});
    }
    applyOverridesToDOM(root, merged, theme);

    // 2. Wire mode toggles. Only one mode at a time.
    const cleanups = new Map(); // mode -> cleanup fn
    const onChange = () => setDirty(true);
    const onThemeChange = (next) => { theme = next; setDirty(true); };
    const MODES = {
      text:   () => mountTextEditMode({ scope: root, onChange }),
      image:  () => mountImageEditMode({ scope: root, onChange }),
      color:  () => mountColorEditMode({ scope: root, onChange, theme, onThemeChange }),
      font:   () => mountFontEditMode({ scope: root, onChange, theme, onThemeChange }),
      button: () => mountButtonEditMode({ scope: root, onChange }),
    };
    for (const mode of Object.keys(MODES)) {
      const btn = document.querySelector(`[data-mode="${mode}"]`);
      btn.addEventListener('click', () => {
        if (cleanups.has(mode)) { cleanups.get(mode)(); cleanups.delete(mode); btn.classList.remove('active'); return; }
        // turn off other modes first
        for (const [m, c] of cleanups.entries()) { c(); cleanups.delete(m); document.querySelector(`[data-mode="${m}"]`).classList.remove('active'); }
        cleanups.set(mode, MODES[mode]());
        btn.classList.add('active');
      });
    }

    // 3. Save. Collect overrides from DOM, split per-section by edit-id prefix, PATCH.
    document.getElementById('save-btn').addEventListener('click', async () => {
      // First flush any active edit modes so contentEditable values commit.
      for (const c of cleanups.values()) c();
      cleanups.clear();
      document.querySelectorAll('[data-mode]').forEach((b) => b.classList.remove('active'));

      const all = extractOverridesFromDOM(root);
      // Split by section: every edit-id starts with `${componentType}-${variantValue}-`.
      const perSection = new Map();
      for (const s of initialSelection) {
        const prefix = `${s.componentType}-${s.variantValue}-`;
        const payload = { textOverrides: {}, imageOverrides: {}, localColors: {}, buttonOverrides: {} };
        for (const [id, v] of Object.entries(all.textOverrides))    if (id.startsWith(prefix)) payload.textOverrides[id] = v;
        for (const [id, v] of Object.entries(all.imageOverrides))   if (id.startsWith(prefix)) payload.imageOverrides[id] = v;
        for (const [id, v] of Object.entries(all.localColors))      if (id.startsWith(prefix)) payload.localColors[id] = v;
        for (const [id, v] of Object.entries(all.buttonOverrides))  if (id.startsWith(prefix)) payload.buttonOverrides[id] = v;
        perSection.set(s.sectionId, payload);
      }
      const sectionsBody = [...perSection.entries()].map(([id, content]) => ({ id, content }));
      const themeRes = await fetch(`/api/projects/${projectIdStr}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ theme }) });
      const sectRes  = await fetch(`/api/projects/${projectIdStr}/pages/${pageIdStr}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sections: sectionsBody }) });
      if (themeRes.ok && sectRes.ok) setDirty(false); else alert('Erreur de sauvegarde');
    });

    window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  </script>

  <style>
    [data-mode].active { background: #f1c40f; color: #000; }
  </style>
</Layout>
```

- [ ] **Step 2: Update `EditorPreview.astro` to accept the D1-driven `selection` shape**

The existing component (created in the POC) probably consumes URL params. Make sure its `Props` interface accepts:

```ts
export interface PreviewSection { componentType: string; variantValue: string; sectionId: string; content: unknown }
interface Props { selection: PreviewSection[] }
```

Inside, for each `selection[i]`, look up `LAYOUT_COMPONENTS[componentType + '-' + variantValue]` (or whichever registry matches the type) and render it. Wrap each in:

```astro
<div class="editable-component"
     data-section-id={s.sectionId}
     data-component-type={s.componentType}
     data-variant-value={s.variantValue}>
  <Component />
</div>
```

If the existing component already wraps with `.editable-component` but uses different attribute names, align them to the names used by `annotateSection` and the registries.

- [ ] **Step 3: End-to-end manual verification**

`npm run dev`. Walk this flow:
1. `/projects` → create project "Demo".
2. `/projects/<id>` → set primary color to bright green; add a custom variable `--accent` = `#00f`; change header font.
3. Click "Nouvelle page", name "Home", pick `Hero 15`, `Service 22`, `Footer 11`, submit.
4. Editor opens, all three sections render with the theme applied.
5. Click "Texte" → click on hero title → edit it → click outside → dirty indicator lights up.
6. Click "Image" → on a hero image, click the upload pill → pick a JPG → image updates in-place.
7. Click "Couleurs" → change `--primary` from the toolbar → click any text element → set a custom color → close popup.
8. Click "Polices" → change `--headerFont`.
9. Click "Boutons" → click the hero CTA → pick `cs-preset-3`.
10. Click "Sauvegarder" → indicator clears.
11. Hard-reload the page → every edit persists. Theme persists. Custom var persists. Image still loads from `/r2/images/...`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/projects/ src/components/editor/EditorPreview.astro
git commit -m "feat: editor with 5 edit modes wired to D1 + R2"
```

---

### Task 7: Extend `ThemeEditor.astro` with custom vars + all root vars

**Files:**
- Modify (rewrite): `src/components/editor/ThemeEditor.astro`

- [ ] **Step 1: Rewrite the component**

```astro
---
import type { ProjectTheme } from '../../lib/types';
interface Props { project: { id: string; theme: ProjectTheme } }
const { project } = Astro.props;

const ROOT_COLOR_KEYS: Array<keyof ProjectTheme['rootColors']> = [
  '--primary', '--secondary', '--headerColor', '--grey', '--bodyTextColor',
  '--backgroundColor', '--primaryLight', '--secondaryLight', '--bodyTextColorWhite', '--errorColor',
];
const ROOT_FONT_KEYS: Array<keyof ProjectTheme['rootFonts']> = ['--headerFont', '--bodyFont', '--navNeon'];
const FONT_STACKS = [
  "'Oswald', sans-serif", "'Source Sans 3', sans-serif", "'Yellowtail', cursive",
  "'Charter', serif", "Georgia, serif", "'Times New Roman', serif",
  "Helvetica, Arial, sans-serif", "'Courier New', monospace", "system-ui, sans-serif",
];
---
<form id="theme-form" data-project-id={project.id} style="display:grid; gap:1rem; padding:1rem; border:1px solid #ddd; background:#fafafa;">
  <fieldset>
    <legend>Couleurs racine</legend>
    <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:0.5rem;">
      {ROOT_COLOR_KEYS.map((k) => (
        <label style="display:flex; flex-direction:column; font-size:0.85rem;">
          <span>{k}</span>
          <input type="color" data-key={k} value={project.theme.rootColors[k]} />
        </label>
      ))}
    </div>
  </fieldset>

  <fieldset>
    <legend>Variables personnalisées</legend>
    <ul id="custom-vars" style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.25rem;">
      {project.theme.customVars.map((cv) => (
        <li style="display:flex; gap:0.5rem; align-items:center;">
          <input class="custom-name" value={cv.name} placeholder="--mon-token" style="flex:1;" />
          <input class="custom-hex" type="color" value={cv.hex} />
          <button type="button" class="custom-remove">×</button>
        </li>
      ))}
    </ul>
    <button id="add-custom-var" type="button" style="margin-top:0.5rem;">+ Ajouter une variable</button>
  </fieldset>

  <fieldset>
    <legend>Polices racine</legend>
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:0.5rem;">
      {ROOT_FONT_KEYS.map((k) => (
        <label style="display:flex; flex-direction:column; font-size:0.85rem;">
          <span>{k}</span>
          <select data-key={k}>
            {FONT_STACKS.map((f) => <option value={f} selected={f === project.theme.rootFonts[k]}>{f}</option>)}
          </select>
        </label>
      ))}
    </div>
  </fieldset>
</form>

<script define:vars={{ initialTheme: project.theme, projectIdStr: project.id }}>
  const form = document.getElementById('theme-form');
  let theme = JSON.parse(JSON.stringify(initialTheme));
  let timer;

  function scheduleSave() {
    clearTimeout(timer);
    timer = window.setTimeout(async () => {
      await fetch(`/api/projects/${projectIdStr}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ theme }) });
    }, 300);
  }

  function syncCustomVars() {
    theme.customVars = [...form.querySelectorAll('#custom-vars li')].map((li) => ({
      name: li.querySelector('.custom-name').value.trim(),
      hex:  li.querySelector('.custom-hex').value,
    })).filter((cv) => cv.name.startsWith('--'));
  }

  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.key && t.type === 'color')   { theme.rootColors[t.dataset.key] = t.value; scheduleSave(); }
    else if (t.dataset.key && t.tagName === 'SELECT') { theme.rootFonts[t.dataset.key] = t.value; scheduleSave(); }
    else if (t.classList.contains('custom-name') || t.classList.contains('custom-hex')) { syncCustomVars(); scheduleSave(); }
  });

  document.getElementById('add-custom-var').addEventListener('click', () => {
    const ul = document.getElementById('custom-vars');
    const li = document.createElement('li');
    li.style.cssText = 'display:flex; gap:0.5rem; align-items:center;';
    li.innerHTML = `<input class="custom-name" placeholder="--mon-token" style="flex:1;" /><input class="custom-hex" type="color" value="#000000" /><button type="button" class="custom-remove">×</button>`;
    ul.appendChild(li);
  });

  form.addEventListener('click', (e) => {
    if (e.target.classList.contains('custom-remove')) { e.target.closest('li').remove(); syncCustomVars(); scheduleSave(); }
  });
</script>
```

- [ ] **Step 2: Manually verify**

On `/projects/<id>`, expand each color picker. Add a custom var `--brand`, set it to red. Reload. Confirm the row persists and the value matches.

- [ ] **Step 3: Commit**

```bash
git add src/components/editor/ThemeEditor.astro
git commit -m "feat: theme editor with 10 root colors + custom vars + 3 root fonts"
```

---

### Task 8: Markdown export

**Files:**
- Create: `src/pages/api/projects/[id]/export-md.ts`

- [ ] **Step 1: Implement the endpoint**

```ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const db = new DB(env.DB);
  const project = await db.getProject(params.id!);
  if (!project) return new Response('not found', { status: 404 });
  const pages = await db.listPages(project.id);
  const sectionsByPage = new Map<string, Awaited<ReturnType<typeof db.listSections>>>();
  for (const p of pages) sectionsByPage.set(p.id, await db.listSections(p.id));

  const lines: string[] = [];
  lines.push(`# Projet : ${project.name}`, '');
  lines.push('## Thème', '');
  lines.push('### Couleurs racine');
  for (const [k, v] of Object.entries(project.theme.rootColors)) lines.push(`- \`${k}\` : ${v}`);
  if (project.theme.customVars.length) {
    lines.push('', '### Variables personnalisées');
    for (const cv of project.theme.customVars) lines.push(`- \`${cv.name}\` : ${cv.hex}`);
  }
  lines.push('', '### Polices');
  for (const [k, v] of Object.entries(project.theme.rootFonts)) lines.push(`- \`${k}\` : ${v}`);

  lines.push('', '## Pages', '');
  for (const p of pages) {
    lines.push(`### ${p.name} (slug: \`${p.slug}\`)`);
    const sections = sectionsByPage.get(p.id)!;
    sections.forEach((s, i) => lines.push(`${i + 1}. \`${s.layoutId}\``));
    lines.push('');
  }

  lines.push('---', '', '## Annexe JSON', '', '```json');
  lines.push(JSON.stringify({ project, pages: pages.map((p) => ({ ...p, sections: sectionsByPage.get(p.id) })) }, null, 2));
  lines.push('```');

  const body = lines.join('\n');
  return new Response(body, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'content-disposition': `attachment; filename="${project.name.replace(/[^a-z0-9-]+/gi, '_')}.md"`,
    },
  });
};
```

- [ ] **Step 2: Wire a download button in the project view**

In `src/pages/projects/[projectId]/index.astro`, add near the theme editor:

```html
<a href={`/api/projects/${project.id}/export-md`}><button>Exporter (Markdown)</button></a>
```

- [ ] **Step 3: Manually verify**

Click the button, confirm the `.md` downloads, open it, confirm sections, theme, and JSON annex are all present.

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/projects/ src/pages/projects/[projectId]/index.astro
git commit -m "feat: markdown export of project structure + theme + JSON annex"
```

---

### Task 9: ZIP HTML export (client-side)

**Files:**
- Create: `src/pages/projects/[projectId]/pages/[pageId]/render.astro` — no-chrome render route
- Modify: `src/pages/projects/[projectId]/index.astro` — add "Exporter (ZIP)" button + handler
- Modify: `package.json` — add `jszip` dependency

- [ ] **Step 1: Install jszip**

Run: `npm install jszip@^3.10.1`

- [ ] **Step 2: Create the render route**

```astro
---
import Layout from '../../../../../layouts/Layout.astro';
import EditorPreview from '../../../../../components/editor/EditorPreview.astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../../../lib/db';

export const prerender = false;

const { projectId, pageId } = Astro.params;
const db = new DB(env.DB);
const project = await db.getProject(projectId!);
const page = await db.getPage(pageId!);
if (!project || !page) return new Response('not found', { status: 404 });
const sections = await db.listSections(page.id);

const previewSelection = sections.map((s) => {
  const i = s.layoutId.lastIndexOf('-');
  return { componentType: s.layoutId.slice(0, i), variantValue: s.layoutId.slice(i + 1), sectionId: s.id, content: s.content };
});
---
<Layout theme={project.theme}>
  <div id="export-root" data-project-id={project.id} data-page-id={page.id}>
    <EditorPreview selection={previewSelection} />
  </div>
  <script define:vars={{ theme: project.theme, sectionsJson: previewSelection }}>
    window.__renderBoot = { theme, sectionsJson };
  </script>
  <script>
    import { applyOverridesToDOM, annotateSection } from '../../../../../lib/overrides';
    const { theme, sectionsJson } = window.__renderBoot;
    const root = document.getElementById('export-root');
    root.querySelectorAll('.editable-component').forEach((el) => annotateSection(el, el.dataset.componentType, el.dataset.variantValue));
    const merged = { textOverrides: {}, imageOverrides: {}, localColors: {}, buttonOverrides: {} };
    for (const s of sectionsJson) {
      Object.assign(merged.textOverrides, s.content.textOverrides ?? {});
      Object.assign(merged.imageOverrides, s.content.imageOverrides ?? {});
      Object.assign(merged.localColors, s.content.localColors ?? {});
      Object.assign(merged.buttonOverrides, s.content.buttonOverrides ?? {});
    }
    applyOverridesToDOM(root, merged, theme);
    document.documentElement.dataset.ready = '1';
  </script>
</Layout>
```

This route can be opened directly in the browser for a no-chrome preview of any page (useful for clients).

- [ ] **Step 3: Add the "Exporter (ZIP)" button + handler in `src/pages/projects/[projectId]/index.astro`**

Add near the Markdown export button:

```html
<button id="export-zip-btn">Exporter (ZIP HTML)</button>
```

And a `<script>` block:

```html
<script type="module">
  import JSZip from 'jszip';
  document.getElementById('export-zip-btn').addEventListener('click', async () => {
    const projectId = location.pathname.split('/')[2];
    const projectRes = await fetch(`/api/projects/${projectId}`).then((r) => r.json());
    const pagesRes = await fetch(`/api/projects/${projectId}/pages`).then((r) => r.json());
    const zip = new JSZip();
    const slugIndex = new Map(pagesRes.map((p) => [p.id, p.slug]));

    // 1. Render each page in a hidden iframe, wait until data-ready=1, snapshot innerHTML.
    for (const p of pagesRes) {
      const html = await renderPageOffline(projectId, p.id);
      const filename = p.slug === pagesRes[0].slug ? 'index.html' : `${p.slug}.html`;
      // Rewrite intra-project links: <a href="/r2/images/..."> stays absolute; /projects/.../edit ones we replace by `${slug}.html`.
      const rewritten = html.replaceAll(/\/projects\/[a-f0-9-]+\/pages\/([a-f0-9-]+)\/edit/g, (_, id) => `${slugIndex.get(id) ?? id}.html`);
      zip.file(filename, rewritten);
    }

    // 2. Fetch every R2 image referenced anywhere in any page's overrides, save under assets/images/.
    const imageUrls = new Set();
    for (const p of pagesRes) {
      const fullPage = await fetch(`/api/projects/${projectId}/pages/${p.id}`).then((r) => r.json());
      for (const s of fullPage.sections) for (const url of Object.values(s.content.imageOverrides ?? {})) imageUrls.add(url);
    }
    for (const url of imageUrls) {
      const blob = await fetch(url).then((r) => r.blob());
      const localPath = `assets/images/${url.split('/').pop()}`;
      zip.file(localPath, blob);
      // also rewrite each HTML file to point at the local path
      for (const name of Object.keys(zip.files)) {
        if (!name.endsWith('.html')) continue;
        const f = await zip.file(name).async('string');
        zip.file(name, f.replaceAll(url, localPath));
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${projectRes.name.replace(/[^a-z0-9-]+/gi, '_')}.zip`;
    a.click();
  });

  async function renderPageOffline(projectId, pageId) {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed; left:-9999px; width:1280px; height:800px;';
      iframe.src = `/projects/${projectId}/pages/${pageId}/render`;
      iframe.addEventListener('load', () => {
        const wait = setInterval(() => {
          if (iframe.contentDocument?.documentElement?.dataset.ready === '1') {
            clearInterval(wait);
            // Serialize the full document. Inline the computed style of <html> so theme vars survive.
            const doc = iframe.contentDocument;
            const html = '<!doctype html>\n' + doc.documentElement.outerHTML;
            document.body.removeChild(iframe);
            resolve(html);
          }
        }, 100);
        setTimeout(() => reject(new Error('render timeout: ' + pageId)), 10000);
      });
      document.body.appendChild(iframe);
    });
  }
</script>
```

- [ ] **Step 4: Manually verify the export**

1. Create a project with two pages, edit each, save.
2. Click "Exporter (ZIP HTML)". A `.zip` downloads.
3. Unzip it on the desktop. Open `index.html` in a browser via `file://`.
4. Confirm the page renders with theme, edits, and images (images loaded from `assets/images/`).
5. Confirm an `<a>` linking to another page (if any) opens the local `.html`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/pages/projects/
git commit -m "feat: client-side ZIP HTML export with offline-ready assets"
```

---

## Verification (end-to-end)

After Task 9, walk this scenario:

1. **Reset local DB**: `npx wrangler d1 execute lunora-stitch-dev --local --command="DELETE FROM projects; DELETE FROM pages; DELETE FROM sections;"`
2. **`/projects`** → create project "Demo Client".
3. **`/projects/<id>`** → tweak the theme: change `--primary` to a brand color, add `--accent = #00aaff`, swap `--headerFont` to Yellowtail.
4. **Click "Nouvelle page"**, name "Accueil", pick `hero 15`, `service 22`, `footer 11`, submit.
5. **In the editor**: edit hero title, replace the hero image, change a section's background to use `var(--accent)`, swap a CTA to `cs-preset-5`. Save.
6. Reload. Every edit persists. Theme persists.
7. Back on project view, **"Exporter (Markdown)"** downloads a readable `.md` listing `heroSection-15`, `service-22`, `footer-11` plus the theme dump and JSON annex.
8. **"Exporter (ZIP HTML)"** downloads a ZIP. Unzip, open `index.html` locally — page renders exactly as saved, image loads from `assets/images/`.
9. Run `npm run build` → no TypeScript errors.

## What's still out of scope (explicit V1.1 list)

- Add/replace/remove sections inside an existing page (V1 is "create page → fixed section set forever; re-open to edit content only").
- Layout categories other than hero / service / footer.
- Schema-based prop migration of layouts (the original brief's V1 step) — explicitly deferred.
- Auto-save (manual Save button only).
- Undo/redo, page duplication, project duplication.
- Auth (Cloudflare Access handles it at the edge — out of code scope).
- Rich text (bold/italic) in text edits — plain text only, matching old editor.
