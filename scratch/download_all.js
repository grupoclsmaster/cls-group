/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const https = require('https');

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error('Set GOOGLE_API_KEY environment variable (do not commit secrets)');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'X-Goog-Api-Key': apiKey
      }
    };
    https.get(url, options, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  let raw = fs.readFileSync('stitch_screens.json', 'utf8').trim();
  if (raw.charCodeAt(0) === 0xFEFF) {
    raw = raw.slice(1);
  }
  const d = JSON.parse(raw);
  const inner = JSON.parse(d.result.content[0].text);
  const screens = inner.screens;

  console.log(`Found ${screens.length} screens. Checking download URLs...`);

  // We want to download a representative set of screens. Let's find one screen per distinct title or key screen type.
  const seenTitles = new Set();
  for (const s of screens) {
    const title = s.title;
    if (seenTitles.has(title)) continue;
    seenTitles.add(title);

    if (s.htmlCode && s.htmlCode.downloadUrl) {
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dest = path.join(__dirname, '..', `stitch_${sanitizedTitle}.html`);
      console.log(`Downloading: "${title}" -> ${dest}`);
      try {
        await downloadFile(s.htmlCode.downloadUrl, dest);
        console.log(`Successfully downloaded "${title}"`);
      } catch (err) {
        console.error(`Failed to download "${title}":`, err.message);
      }
    } else {
      console.log(`No htmlCode for "${title}"`);
    }
  }
}

main().catch(console.error);
