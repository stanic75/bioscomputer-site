const Parser = require('rss-parser');
const parser = new Parser({ timeout: 15000 });

// lang: 'IT' | 'EN'
const SOURCES = [
  // 🇮🇹 Italiane
  { tag: 'Advisory', label: 'CSIRT Italia', lang: 'IT', url: 'https://www.csirt.gov.it/it/news/feed' },
  { tag: 'News',     label: 'Securityinfo.it', lang: 'IT', url: 'https://www.securityinfo.it/feed/' },
  { tag: 'News',     label: 'Leonardo Cybersecurity', lang: 'IT', url: 'https://cybersecurity.leonardo.com/it/rss' },

  // 🇬🇧 Internazionali
  { tag: 'Patch',    label: 'MSRC', lang: 'EN', url: 'https://msrc.microsoft.com/update-guide/rss' },
  { tag: 'Advisory', label: 'CISA Alerts', lang: 'EN', url: 'https://www.cisa.gov/news-events/alerts.xml' },
  { tag: 'Ricerca',  label: 'NVD CVE', lang: 'EN', url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml' },
  { tag: 'Advisory', label: 'Bitdefender Labs', lang: 'EN', url: 'https://www.bitdefender.com/blog/api/rss/labs/' },
  { tag: 'Advisory', label: 'Zyxel', lang: 'EN', url: 'https://www.zyxel.com/global/en/support/security-advisories' },
];

function normalizeItem(s, it) {
  const id = (it.guid || it.id || it.link || it.title || Math.random().toString(36).slice(2)).slice(0, 160);
  const date = it.isoDate || it.pubDate || it.published || new Date().toISOString();
  const title = (it.title || '').trim();
  const summary = (it.contentSnippet || it.summary || it.content || it['content:encoded'] || '').toString().replace(/<[^>]+>/g, '').slice(0, 500);
  const href = it.link || (it.enclosure && it.enclosure.url) || s.url;
  return { id, date, title, tag: s.tag, summary, lang: s.lang, cta: null, source: { label: s.label, href } };
}

exports.handler = async function () {
  const out = [];
  for (const s of SOURCES) {
    try {
      if (s.label === 'Zyxel' && !/\.xml$|feed|rss/i.test(s.url)) {
        out.push({
          id: 'zyxel-advisories',
          date: new Date().toISOString(),
          title: 'Zyxel Security Advisories – consulta l\'elenco aggiornato',
          tag: s.tag,
          summary: 'Zyxel pubblica periodicamente comunicazioni di sicurezza per gateway, firewall e altri prodotti. Verifica gli aggiornamenti critici. (EN)',
          lang: s.lang,
          cta: null,
          source: { label: s.label, href: s.url }
        });
        continue;
      }
      const feed = await parser.parseURL(s.url);
      (feed.items || []).slice(0, 6).forEach(it => out.push(normalizeItem(s, it)));
    } catch (e) {
      // ignora singola fonte in errore
    }
  }
  out.sort((a,b)=> new Date(b.date) - new Date(a.date));
  return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=900' }, body: JSON.stringify({ posts: out.slice(0, 15) }) };
};
