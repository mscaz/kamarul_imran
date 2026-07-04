const fs = require('fs');
const path = require('path');
const { readProfile } = require('./lib/read-profile');

const TMP_DIR = path.join(__dirname, '.tmp');
const OUT_FILE = path.join(TMP_DIR, 'scopus.json');

async function main() {
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const profile = readProfile();
  const authorId = (profile.scopus_author_id || '').trim();
  const apiKey = process.env.SCOPUS_API_KEY;

  if (!authorId) {
    fs.writeFileSync(OUT_FILE, JSON.stringify(null));
    console.log('No scopus_author_id set in profile.yaml, skipping Scopus fetch.');
    return;
  }

  if (!apiKey) {
    fs.writeFileSync(OUT_FILE, JSON.stringify(null));
    console.warn('scopus_author_id is set but SCOPUS_API_KEY secret is missing. Skipping Scopus fetch (site will hide Scopus metrics).');
    return;
  }

  try {
    const res = await fetch(`https://api.elsevier.com/content/author/author_id/${authorId}`, {
      headers: {
        Accept: 'application/json',
        'X-ELS-APIKey': apiKey
      }
    });
    if (!res.ok) throw new Error(`Scopus API request failed: HTTP ${res.status}`);
    const data = await res.json();

    const authorProfile = data['author-retrieval-response'] && data['author-retrieval-response'][0];
    const coredata = authorProfile && authorProfile.coredata;
    const hIndex = authorProfile && authorProfile['h-index'];
    const documentCount = coredata && coredata['document-count'];

    fs.writeFileSync(OUT_FILE, JSON.stringify({
      h_index: hIndex ? Number(hIndex) : null,
      document_count: documentCount ? Number(documentCount) : null,
      author_url: `https://www.scopus.com/authid/detail.uri?authorId=${authorId}`
    }));
    console.log('Fetched Scopus metrics.');
  } catch (err) {
    console.warn(`Scopus fetch failed, leaving Scopus metrics unset: ${err.message}`);
    fs.writeFileSync(OUT_FILE, JSON.stringify(null));
  }
}

main();
