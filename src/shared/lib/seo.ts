import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

// get metadata for page component
export function getMetadata(
  options: {
    title?: string;
    description?: string;
    keywords?: string;
    metadataKey?: string;
    canonicalUrl?: string; // relative path or full url
    imageUrl?: string;
    appName?: string;
    noIndex?: boolean;
  } = {}
) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
    setRequestLocale(locale);

    // passed metadata
    const passedMetadata = {
      title: options.title,
      description: options.description,
      keywords: options.keywords,
    };

    // default metadata
    const defaultMetadata = await getTranslatedMetadata(
      defaultMetadataKey,
      locale
    );

    // translated metadata
    let translatedMetadata: any = {};
    if (options.metadataKey) {
      translatedMetadata = await getTranslatedMetadata(
        options.metadataKey,
        locale
      );
    }

    const alternates = buildLocalizedAlternates(
      options.canonicalUrl || '/',
      locale || defaultLocale
    );

    const title =
      passedMetadata.title || translatedMetadata.title || defaultMetadata.title;
    const description =
      passedMetadata.description ||
      translatedMetadata.description ||
      defaultMetadata.description;

    // image url
    let imageUrl = options.imageUrl || envConfigs.app_preview_image;
    if (imageUrl.startsWith('http')) {
      imageUrl = imageUrl;
    } else {
      imageUrl = `${envConfigs.app_url}${imageUrl}`;
    }

    // app name
    let appName = options.appName;
    if (!appName) {
      appName = envConfigs.app_name || '';
    }

    return {
      title:
        passedMetadata.title ||
        translatedMetadata.title ||
        defaultMetadata.title,
      description:
        passedMetadata.description ||
        translatedMetadata.description ||
        defaultMetadata.description,
      keywords:
        passedMetadata.keywords ||
        translatedMetadata.keywords ||
        defaultMetadata.keywords,
      alternates,

      openGraph: {
        type: 'website',
        locale: locale,
        url: alternates.canonical,
        title,
        description,
        siteName: appName,
        images: [imageUrl.toString()],
      },

      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl.toString()],
        site: envConfigs.app_url,
      },

      robots: {
        index: options.noIndex ? false : true,
        follow: options.noIndex ? false : true,
      },
    };
  };
}

const defaultMetadataKey = 'common.metadata';

async function getTranslatedMetadata(metadataKey: string, locale: string) {
  setRequestLocale(locale);
  const t = await getTranslations(metadataKey);

  return {
    title: t.has('title') ? t('title') : '',
    description: t.has('description') ? t('description') : '',
    keywords: t.has('keywords') ? t('keywords') : '',
  };
}

export function buildLocalizedAlternates(
  pathOrUrl: string,
  locale: string
): {
  canonical: string;
  languages: Record<string, string>;
} {
  const publicPath = getPublicPathFromUrl(pathOrUrl || '/');
  const languages = Object.fromEntries(
    locales.map((targetLocale) => [
      targetLocale,
      buildLocalizedUrl(publicPath, targetLocale),
    ])
  ) as Record<string, string>;

  languages['x-default'] = buildLocalizedUrl(publicPath, defaultLocale);

  return {
    canonical: buildLocalizedUrl(publicPath, locale || defaultLocale),
    languages,
  };
}

export function getPublicPathFromUrl(pathOrUrl: string): string {
  let path = pathOrUrl || '/';

  if (path.startsWith('http')) {
    try {
      path = new URL(path).pathname;
    } catch {
      path = '/';
    }
  }

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  const pathParts = path.split('/').filter(Boolean);
  const firstPart = pathParts[0];

  if (firstPart && locales.includes(firstPart)) {
    pathParts.shift();
    path = `/${pathParts.join('/')}`;
  }

  return normalizePath(path);
}

function buildLocalizedUrl(path: string, locale: string): string {
  const normalizedPath = normalizePath(path);
  const localizedPath =
    locale && locale !== defaultLocale
      ? normalizePath(`/${locale}${normalizedPath}`)
      : normalizedPath;
  const trimmedAppUrl = envConfigs.app_url.replace(/\/$/, '');

  if (localizedPath === '/') {
    return `${trimmedAppUrl}/`;
  }

  return `${trimmedAppUrl}${localizedPath}`;
}

function normalizePath(path: string): string {
  if (!path || path === '/') {
    return '/';
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return normalizedPath.replace(/\/$/, '');
}
