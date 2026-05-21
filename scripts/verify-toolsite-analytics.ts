import assert from 'node:assert/strict';

async function main() {
  process.env.VERCEL = '1';

  const analytics = await import('../src/shared/lib/toolsite-analytics');
  const { envConfigs } = await import('../src/config');

  assert.equal(envConfigs.vercel_analytics_enabled, 'true');

  assert.deepEqual(analytics.toolsiteEventNames, [
    'tool_copy_formula',
    'tool_download_csv',
    'tool_download_txt',
    'tool_apply_preset',
    'tool_scroll_to_generator',
    'longtail_cta_click',
  ]);

  const payload = analytics.buildToolsiteEventPayload({
    locale: 'zh',
    route: '/zh/sku-sequence-generator',
    outputType: 'csvPreview',
    prefix: 'SKU-0001',
    rowCount: 400000,
    columns: 3,
    rawGeneratedValue: 'SKU-0001\nSKU-0002',
  });

  assert.deepEqual(payload, {
    locale: 'zh',
    route: '/zh/sku-sequence-generator',
    outputType: 'csvPreview',
    prefixType: 'sku',
    rowCountRange: '100k-1m',
    columns: 3,
  });

  assert.equal('rawGeneratedValue' in payload, false);
  assert.equal('prefix' in payload, false);

  assert.equal(analytics.getRowCountRange(1), '1-99');
  assert.equal(analytics.getRowCountRange(100), '100-999');
  assert.equal(analytics.getRowCountRange(1000), '1k-9k');
  assert.equal(analytics.getRowCountRange(10000), '10k-99k');
  assert.equal(analytics.getRowCountRange(100000), '100k-1m');
  assert.equal(analytics.getRowCountRange(1000001), '1m+');

  console.log('verify-toolsite-analytics passed');
}

void main();
