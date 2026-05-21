import assert from 'node:assert/strict';

process.env.NEXT_PUBLIC_APP_URL = 'https://rowlabeler.com';

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

  console.log('verify-site-quality passed');
}

void main();
