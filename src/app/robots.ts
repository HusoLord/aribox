import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aribox.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/marketplace', '/forum', '/news'],
        disallow: ['/app/', '/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
