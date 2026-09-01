import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/v1/internal/'],
    },
    sitemap: 'https://defyra.ai/sitemap.xml',
  };
}
