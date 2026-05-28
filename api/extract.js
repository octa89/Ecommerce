// Vercel Serverless Function — robust URL extractor for the Pegá-URL feature.
// Acts as a same-origin proxy with a real browser User-Agent, bypassing the
// CORS proxies that public sites like SHEIN/Amazon increasingly block.
//
// Endpoint: GET /api/extract?url=<encoded-target-url>
// Returns: raw HTML of the target page with CORS headers so the browser parser
// can extract JSON-LD, Open Graph, and site-specific data.

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const REQUEST_HEADERS = {
  'User-Agent': USER_AGENT,
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

export default async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'URL must start with http:// or https://' });
  }

  // Block local addresses (SSRF guard)
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.16.') ||
      host.endsWith('.local')
    ) {
      return res.status(400).json({ error: 'Local URLs are not allowed' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: REQUEST_HEADERS,
      redirect: 'follow',
    });
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: `Upstream returned ${upstream.status} ${upstream.statusText}` });
    }

    const contentType = upstream.headers.get('content-type') || 'text/html';
    const html = await upstream.text();

    if (!html || html.length < 200) {
      return res
        .status(502)
        .json({ error: 'Upstream returned empty or too-short body', length: html.length });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Extractor-Source', 'vercel-function');

    return res.status(200).send(html);
  } catch (e) {
    clearTimeout(timeoutId);
    const message = e.name === 'AbortError' ? 'Upstream request timed out (15s)' : e.message;
    return res.status(500).json({ error: message });
  }
}
