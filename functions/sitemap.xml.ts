import { getCollection } from './api/_middleware'

interface Env {
  ZOLTMOUNT_KV: KVNamespace
}

interface Product {
  id: string
  slug: string
  status?: string
  images: string[]
  name: string
}

interface Category {
  id: string
  slug: string
}

const SITE = 'https://zoltmount.com'

const staticPages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/b2b', changefreq: 'monthly', priority: '0.6' },
  { path: '/faq', changefreq: 'monthly', priority: '0.5' },
  { path: '/install', changefreq: 'monthly', priority: '0.5' },
  { path: '/vesa', changefreq: 'monthly', priority: '0.5' },
  { path: '/warranty', changefreq: 'yearly', priority: '0.4' },
  { path: '/returns', changefreq: 'yearly', priority: '0.4' },
  { path: '/track', changefreq: 'monthly', priority: '0.4' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
]

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const kv = context.env.ZOLTMOUNT_KV
  const [products, categories] = await Promise.all([
    getCollection<Product>(kv, 'products'),
    getCollection<Category>(kv, 'categories'),
  ])

  const activeProducts = products.filter((p) => !p.status || p.status === 'active')
  const today = new Date().toISOString().split('T')[0]

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`

  // Static pages
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${SITE}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
  }

  // Category pages
  for (const cat of categories) {
    xml += `  <url>
    <loc>${SITE}/products?category=${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
  }

  // Product pages with images
  for (const product of activeProducts) {
    xml += `  <url>
    <loc>${SITE}/products/${product.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`
    for (const img of product.images) {
      xml += `    <image:image>
      <image:loc>${escapeXml(img)}</image:loc>
      <image:title>${escapeXml(product.name)}</image:title>
    </image:image>
`
    }
    xml += `  </url>
`
  }

  xml += `</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
