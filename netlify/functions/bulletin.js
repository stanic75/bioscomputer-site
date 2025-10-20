// Netlify Function: bulletin.js
// Aggrega notizie di sicurezza da fonti affidabili (Zyxel rimosso).
const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'BiosComputer-Bulletin/1.0 (+https://bioscomputer.it)' }
});

// Fonti (IT/EN) affidabili
const FEEDS = [
  { label: "CSIRT Italia", href: "https://www.csirt.gov.it/feed" },
  { label: "Securityinfo.it", href: "https://www.securityinfo.it/feed/" },
  { label: "Leonardo CERT", href: "https://www.leonardocompany.com/en/newsroom/rss" },
  { label: "Microsoft MSRC", href: "https://msrc.microsoft.com/blog/feed/" },
  { label: "CISA Advisories", href: "https://www.cisa.gov/cybersecurity-advisories/all.xml" },
  { label: "NVD (recent CVEs)", href: "https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml" },
  { label: "Bitdefender (Business/Labs)", href: "https://www.bitdefender.com/blog/api/rss/?cat=business-insights,labs" }
];

// Helpers
const normalize = (str = "") => str.replace(/\s+/g, " ").trim();
const toISO = (d) => {
  const dd = d ? new Date(d) : new Date();
  return isNaN(dd.getTime()) ? new Date().toISOString() : dd.toISOString();
};

exports.handler = async () => {
  try {
    const all = await Promise.allSettled(FEEDS.map(async (f) => {
      const feed = await parser.parseURL(f.href);
      return (feed.items || []).slice(0, 12).map((it) => ({
        id: it.guid || it.id || it.link || normalize(it.title).slice(0, 80),
        title: normalize(it.title || ""),
        summary: normalize((it.contentSnippet || it.content || "").replace(/<[^>]+>/g, "")),
        date: toISO(it.isoDate || it.pubDate),
        tag: f.label,
        source: { label: f.label, href: it.link || f.href }
      }));
    }));

    // Flatten + clean
    const posts = all.flatMap((r) => r.status === "fulfilled" ? r.value : [])
      .filter(p => p && p.title)                 // solo item con titolo
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .slice(0, 36);                             // tetto massimo

    return {
      statusCode: 200,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" },
      body: JSON.stringify({ posts })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ posts: [], error: "bulletin_failed" })
    };
  }
};
