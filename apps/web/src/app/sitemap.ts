import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://defyra.ai';
  const routes = [
    '',
    '/security-validation',
    '/ai-red-teaming',
    '/agent-security',
    '/research',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/security',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
