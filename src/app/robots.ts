import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';

export default function robots(): MetadataRoute.Robots {
  const appUrl = envConfigs.app_url;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/*?*q=',
        '/privacy-policy',
        '/terms-of-service',
        '/*/privacy-policy',
        '/*/terms-of-service',
        '/sign-in',
        '/sign-up',
        '/verify-email',
        '/auth-callback',
        '/auth-popup',
        '/no-permission',
        '/*/sign-in',
        '/*/sign-up',
        '/*/verify-email',
        '/*/auth-callback',
        '/*/auth-popup',
        '/*/no-permission',
        '/settings/*',
        '/activity/*',
        '/admin/*',
        '/*/settings/*',
        '/*/activity/*',
        '/*/admin/*',
        '/api/*',
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
