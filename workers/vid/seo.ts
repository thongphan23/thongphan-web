import type { PublicVideo } from '../../lib/vid/contracts'

const VID_ORIGIN = 'https://vid.thongphan.com'

type RewriterElement = {
  setInnerContent(content: string): void
  setAttribute(name: string, value: string): void
  append(content: string, options?: { html?: boolean }): void
}

type Rewriter = {
  on(selector: string, handlers: { element(element: RewriterElement): void }): Rewriter
  transform(response: Response): Response
}

function isoDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${remainder || (!hours && !minutes) ? `${remainder}S` : ''}`
}

export function buildWatchSeo(video: PublicVideo) {
  const canonical = `${VID_ORIGIN}/watch?v=${encodeURIComponent(video.slug)}`
  return {
    canonical,
    title: `${video.title} · VID Thông Phan`,
    description: video.description.slice(0, 180),
    image: video.thumbnailUrl,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      uploadDate: video.publishedAt,
      duration: isoDuration(video.durationSeconds),
      embedUrl: video.playerUrl,
      url: canonical,
      isBasedOn: video.sourceVideoUrl,
      creator: { '@type': 'Person', name: video.sourceCreator, url: video.sourceCreatorUrl },
      publisher: { '@type': 'Person', name: 'Thông Phan', url: 'https://thongphan.com/about' },
      inLanguage: 'vi-VN',
    },
  }
}

function xml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

export function buildVidSitemap(videos: Array<{ slug: string; updatedAt: string }>) {
  const urls = [
    `<url><loc>${VID_ORIGIN}</loc></url>`,
    ...videos.map(({ slug, updatedAt }) => `<url><loc>${xml(`${VID_ORIGIN}/watch?v=${encodeURIComponent(slug)}`)}</loc><lastmod>${xml(updatedAt)}</lastmod></url>`),
  ]
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`
}

export function rewriteWatchResponse(response: Response, video: PublicVideo): Response {
  if (!response.headers.get('content-type')?.includes('text/html')) return response
  const seo = buildWatchSeo(video)
  const structuredData = JSON.stringify(seo.structuredData).replaceAll('<', '\\u003c')
  const HTMLRewriterConstructor = (globalThis as typeof globalThis & { HTMLRewriter: new () => Rewriter }).HTMLRewriter
  return new HTMLRewriterConstructor()
    .on('title', { element(element) { element.setInnerContent(seo.title) } })
    .on('meta[name="description"]', { element(element) { element.setAttribute('content', seo.description) } })
    .on('link[rel="canonical"]', { element(element) { element.setAttribute('href', seo.canonical) } })
    .on('meta[property="og:title"]', { element(element) { element.setAttribute('content', seo.title) } })
    .on('meta[property="og:description"]', { element(element) { element.setAttribute('content', seo.description) } })
    .on('meta[property="og:url"]', { element(element) { element.setAttribute('content', seo.canonical) } })
    .on('head', { element(element) {
      element.append(`<meta property="og:image" content="${xml(seo.image)}"><meta property="og:type" content="video.other"><script type="application/ld+json">${structuredData}</script>`, { html: true })
    } })
    .transform(response)
}
