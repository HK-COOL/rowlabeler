import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

process.env.NEXT_PUBLIC_APP_URL = 'https://rowlabeler.com';

const longTailPageSlugs = [
  'excel-account-generator',
  'excel-sequence-formula-generator',
  'excel-autofill-without-dragging',
  'bulk-row-label-generator',
  'sku-sequence-generator',
  'invoice-number-generator',
];

type HomepageExample = {
  title: string;
  prefix: string;
  outputColumns: number;
};

async function main() {
  const { buildLocalizedAlternates, getPublicPathFromUrl } = await import(
    '../src/shared/lib/seo'
  );
  const { buildBreadcrumbJsonLd, buildWebApplicationJsonLd } = await import(
    '../src/shared/lib/structured-data'
  );
  const { generateExcelSequenceText } = await import(
    '../src/shared/lib/excel-sequence-generator'
  );

  const homeAlternates = buildLocalizedAlternates('/', 'zh');
  assert.equal(homeAlternates.canonical, 'https://rowlabeler.com/zh');
  assert.deepEqual(homeAlternates.languages, {
    en: 'https://rowlabeler.com/',
    zh: 'https://rowlabeler.com/zh',
    'x-default': 'https://rowlabeler.com/',
  });

  const longTailAlternates = buildLocalizedAlternates(
    '/excel-sequence-formula-generator',
    'en'
  );
  assert.equal(
    longTailAlternates.canonical,
    'https://rowlabeler.com/excel-sequence-formula-generator'
  );
  assert.deepEqual(longTailAlternates.languages, {
    en: 'https://rowlabeler.com/excel-sequence-formula-generator',
    zh: 'https://rowlabeler.com/zh/excel-sequence-formula-generator',
    'x-default': 'https://rowlabeler.com/excel-sequence-formula-generator',
  });

  assert.equal(
    getPublicPathFromUrl('https://rowlabeler.com/zh/blog/example'),
    '/blog/example'
  );

  const text = generateExcelSequenceText({
    prefix: 'Ticket',
    start: 98,
    count: 4,
    step: 1,
    separator: '-',
    padding: 3,
  });

  assert.equal(text, 'Ticket-098\nTicket-099\nTicket-100\nTicket-101');

  assert.deepEqual(
    buildBreadcrumbJsonLd('/zh/excel-account-generator', [
      { name: '首页', url: 'https://rowlabeler.com/zh' },
      {
        name: 'Excel 账号编号生成器',
        url: 'https://rowlabeler.com/zh/excel-account-generator',
      },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '首页',
          item: 'https://rowlabeler.com/zh',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Excel 账号编号生成器',
          item: 'https://rowlabeler.com/zh/excel-account-generator',
        },
      ],
    }
  );

  const appJsonLd = buildWebApplicationJsonLd({
    name: 'Rowlabeler',
    url: 'https://rowlabeler.com/',
    description: 'Generate Excel sequence labels and formulas.',
  });
  assert.equal(appJsonLd['@type'], 'WebApplication');
  assert.equal(appJsonLd.applicationCategory, 'BusinessApplication');
  assert.equal(appJsonLd.offers.price, '0');

  const localeIndex = readFileSync(
    join(process.cwd(), 'src/config/locale/index.ts'),
    'utf8'
  );
  const sitemap = readFileSync(
    join(process.cwd(), 'public/sitemap.xml'),
    'utf8'
  );
  const indexPages = {
    en: JSON.parse(
      readFileSync(
        join(process.cwd(), 'src/config/locale/messages/en/pages/index.json'),
        'utf8'
      )
    ),
    zh: JSON.parse(
      readFileSync(
        join(process.cwd(), 'src/config/locale/messages/zh/pages/index.json'),
        'utf8'
      )
    ),
  };

  for (const [locale, indexPage] of Object.entries(indexPages)) {
    const examples: HomepageExample[] =
      indexPage.page?.sections?.generator?.examples?.map(
        (example: {
          title?: string;
          prefix?: string;
          outputColumns?: number;
        }) => ({
          title: example.title || '',
          prefix: example.prefix || '',
          outputColumns: example.outputColumns || 1,
        })
      ) || [];
    const searchableExamples = examples
      .map((example) => `${example.title} ${example.prefix}`.toLowerCase())
      .join(' | ');

    assert.ok(
      searchableExamples.includes('invoice') ||
        searchableExamples.includes('发票'),
      `${locale} homepage generator needs an invoice preset`
    );
    assert.ok(
      searchableExamples.includes('po') ||
        searchableExamples.includes('purchase') ||
        searchableExamples.includes('采购'),
      `${locale} homepage generator needs a purchase order preset`
    );
    assert.ok(
      examples.some(
        (example) =>
          example.outputColumns >= 3 &&
          `${example.title} ${example.prefix}`.toLowerCase().includes('sku')
      ),
      `${locale} homepage generator needs a multi-column SKU CSV preset`
    );
  }

  for (const slug of longTailPageSlugs) {
    assert.ok(
      localeIndex.includes(`pages/${slug}`),
      `${slug} must be registered in localeMessagesPaths`
    );
    assert.ok(
      sitemap.includes(`https://rowlabeler.com/${slug}`),
      `${slug} English URL must be in sitemap`
    );
    assert.ok(
      sitemap.includes(`https://rowlabeler.com/zh/${slug}`),
      `${slug} Chinese URL must be in sitemap`
    );

    for (const locale of ['en', 'zh']) {
      const pagePath = join(
        process.cwd(),
        `src/config/locale/messages/${locale}/pages/${slug}.json`
      );
      assert.ok(existsSync(pagePath), `${locale}/${slug}.json must exist`);
      const pageConfig = JSON.parse(readFileSync(pagePath, 'utf8'));
      assert.ok(pageConfig.metadata?.title, `${locale}/${slug} needs a title`);
      assert.ok(
        pageConfig.metadata?.description,
        `${locale}/${slug} needs a description`
      );
      assert.ok(
        pageConfig.page?.sections?.hero,
        `${locale}/${slug} needs hero`
      );
      assert.ok(pageConfig.page?.sections?.faq, `${locale}/${slug} needs FAQ`);
    }
  }

  console.log('verify-site-quality passed');
}

void main();
