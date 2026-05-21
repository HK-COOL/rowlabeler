import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { Empty } from '@/shared/blocks/common';
import { buildLocalizedAlternates } from '@/shared/lib/seo';
import { buildBreadcrumbJsonLd } from '@/shared/lib/structured-data';
import { getPost } from '@/shared/models/post';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('pages.blog.metadata');

  const alternates = buildLocalizedAlternates(`/blog/${slug}`, locale);

  const post = await getPost({ slug, locale });
  if (!post) {
    return {
      title: `${slug} | ${t('title')}`,
      description: t('description'),
      alternates,
    };
  }

  return {
    title: `${post.title} | ${t('title')}`,
    description: post.description,
    alternates,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getPost({ slug, locale });

  if (!post) {
    return <Empty message={`Post not found`} />;
  }

  // build page sections
  const page: DynamicPage = {
    sections: {
      blogDetail: {
        block: 'blog-detail',
        data: {
          post,
        },
      },
    },
  };

  const Page = await getThemePage('dynamic-page');
  const jsonLd = buildBreadcrumbJsonLd(`/blog/${slug}`, [
    {
      name: locale === 'zh' ? '首页' : 'Home',
      url: buildLocalizedAlternates('/', locale).canonical,
    },
    {
      name: locale === 'zh' ? '博客' : 'Blog',
      url: buildLocalizedAlternates('/blog', locale).canonical,
    },
    {
      name: post.title || slug,
      url: buildLocalizedAlternates(`/blog/${slug}`, locale).canonical,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Page locale={locale} page={page} />
    </>
  );
}
