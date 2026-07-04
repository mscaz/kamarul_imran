const fs = require('fs');
const path = require('path');

const TMP_DIR = path.join(__dirname, '.tmp');
const OUT_FILE = path.join(__dirname, '..', '..', 'data', 'publications.json');

function readTmp(name) {
  const filePath = path.join(TMP_DIR, name);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  return content ? JSON.parse(content) : null;
}

function main() {
  const orcid = readTmp('orcid.json') || { id: '', publication_count: 0, recent_works: [] };
  const scopus = readTmp('scopus.json');

  const combined = {
    generated_at: new Date().toISOString(),
    orcid,
    scopus,
    google_scholar: { note: 'link-out only, no automated fetch' }
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(combined, null, 2) + '\n');
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  console.log(`Wrote ${OUT_FILE}`);
}

main();
