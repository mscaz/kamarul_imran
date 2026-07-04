const fs = require('fs');
const path = require('path');
const { readProfile } = require('./lib/read-profile');

const TMP_DIR = path.join(__dirname, '.tmp');
const OUT_FILE = path.join(TMP_DIR, 'orcid.json');

async function main() {
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const profile = readProfile();
  const orcidId = (profile.orcid_id || '').trim();

  if (!orcidId) {
    fs.writeFileSync(OUT_FILE, JSON.stringify(null));
    console.log('No orcid_id set in profile.yaml, skipping ORCID fetch.');
    return;
  }

  try {
    const worksRes = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/works`, {
      headers: { Accept: 'application/json' }
    });
    if (!worksRes.ok) throw new Error(`ORCID works request failed: HTTP ${worksRes.status}`);
    const worksData = await worksRes.json();

    const summaries = (worksData.group || [])
      .map((group) => group['work-summary'] && group['work-summary'][0])
      .filter(Boolean);

    const publicationCount = summaries.length;

    const recentWorks = summaries
      .map((summary) => {
        const title = summary.title && summary.title.title && summary.title.title.value;
        const year = summary['publication-date'] && summary['publication-date'].year && summary['publication-date'].year.value;
        const venue = summary['journal-title'] && summary['journal-title'].value;
        const externalIds = (summary['external-ids'] && summary['external-ids']['external-id']) || [];
        const doiEntry = externalIds.find((id) => id['external-id-type'] === 'doi');
        const url = doiEntry ? `https://doi.org/${doiEntry['external-id-value']}` : (summary.url && summary.url.value);
        return {
          title: title || 'Untitled work',
          year: year ? Number(year) : null,
          venue: venue || '',
          url: url || ''
        };
      })
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(0, 10);

    fs.writeFileSync(OUT_FILE, JSON.stringify({
      id: orcidId,
      publication_count: publicationCount,
      recent_works: recentWorks
    }));
    console.log(`Fetched ${publicationCount} ORCID works, kept ${recentWorks.length} most recent.`);
  } catch (err) {
    console.warn(`ORCID fetch failed, leaving publication data unset: ${err.message}`);
    fs.writeFileSync(OUT_FILE, JSON.stringify(null));
  }
}

main();
