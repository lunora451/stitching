CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT '{"primary":"#ff6a3e","secondary":"#ffba43","headerFont":"Oswald","bodyFont":"Source Sans 3"}',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (project_id, slug)
);

CREATE INDEX idx_pages_project ON pages(project_id, "order");

CREATE TABLE sections (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  layout_id TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  content TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_sections_page ON sections(page_id, "order");
