-- Migrate existing projects.theme rows from the POC shape ({primary,secondary,headerFont,bodyFont})
-- to the new shape (rootColors map + customVars + rootFonts map).
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

-- Reset any sections that had the schema-style content to empty overrides
UPDATE sections
SET content = json_object(
  'textOverrides', json_object(),
  'imageOverrides', json_object(),
  'localColors', json_object(),
  'buttonOverrides', json_object()
)
WHERE json_extract(content, '$.textOverrides') IS NULL;
