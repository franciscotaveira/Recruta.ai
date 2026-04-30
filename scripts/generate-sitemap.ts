import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const BLOG_DATA_PATH = path.join(PUBLIC_DIR, 'blog-data.json');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');
const BASE_URL = 'https://recrutaria.com.br';

async function generateSitemap() {
  console.log('🚀 Gerando sitemap dinâmico...');

  const staticRoutes = [
    { loc: '', changefreq: 'daily', priority: '1.0' },
    { loc: '/para-empresas', changefreq: 'weekly', priority: '0.9' },
    { loc: '/para-candidatos', changefreq: 'weekly', priority: '0.9' },
    { loc: '/blog', changefreq: 'daily', priority: '0.8' },
    { loc: '/sobre', changefreq: 'monthly', priority: '0.5' },
  ];

  let blogRoutes: any[] = [];
  if (fs.existsSync(BLOG_DATA_PATH)) {
    const blogData = JSON.parse(fs.readFileSync(BLOG_DATA_PATH, 'utf-8'));
    blogRoutes = blogData.map((post: any) => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.date,
      changefreq: 'monthly',
      priority: '0.7',
    }));
  }

  const allRoutes = [...staticRoutes, ...blogRoutes];
  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${BASE_URL}${route.loc}</loc>
    <lastmod>${route.lastmod || today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, xml);
  console.log(`✅ Sitemap gerado com ${allRoutes.length} rotas em: ${SITEMAP_PATH}`);
}

generateSitemap().catch(console.error);
