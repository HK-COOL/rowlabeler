import assert from 'node:assert/strict';

import {
  calculateExcelSequence,
  EXCEL_SEQUENCE_PREVIEW_LIMIT,
  generateExcelSequenceCsv,
  generateExcelSequenceText,
} from '../src/shared/lib/excel-sequence-generator';

const basic = calculateExcelSequence({
  prefix: 'Account',
  start: 1,
  count: 5,
  step: 1,
  separator: '',
  padding: 0,
});

assert.equal(basic.ok, true);
assert.deepEqual(basic.values, [
  'Account1',
  'Account2',
  'Account3',
  'Account4',
  'Account5',
]);
assert.equal(basic.formula365, '="Account"&SEQUENCE(5,1,1,1)');
assert.equal(basic.legacyFormula, '="Account"&(1+(ROW(A1)-1)*1)');
assert.equal(basic.csvPreview, 'Account1\nAccount2\nAccount3\nAccount4\nAccount5');
assert.equal(basic.previewLimitHit, false);

const padded = calculateExcelSequence({
  prefix: 'Item',
  start: 7,
  count: 3,
  step: 2,
  separator: '-',
  padding: 3,
});

assert.equal(padded.ok, true);
assert.deepEqual(padded.values, ['Item-007', 'Item-009', 'Item-011']);
assert.equal(padded.formula365, '="Item-"&TEXT(SEQUENCE(3,1,7,2),"000")');
assert.equal(
  padded.legacyFormula,
  '="Item-"&TEXT(7+(ROW(A1)-1)*2,"000")'
);

const multiColumn = calculateExcelSequence({
  prefix: 'Account',
  start: 1,
  count: 5,
  step: 1,
  separator: '',
  padding: 0,
  outputColumns: 3,
});

assert.equal(multiColumn.ok, true);
assert.deepEqual(multiColumn.values, [
  'Account1',
  'Account2',
  'Account3',
  'Account4',
  'Account5',
]);
assert.equal(
  multiColumn.csvPreview,
  'Account1,Account2,Account3\nAccount4,Account5'
);

const fullCsv = generateExcelSequenceCsv({
  prefix: 'SKU',
  start: 1,
  count: EXCEL_SEQUENCE_PREVIEW_LIMIT + 2,
  step: 1,
  separator: '-',
  padding: 3,
  outputColumns: 2,
});

assert.ok(fullCsv.includes('SKU-001,SKU-002'));
assert.ok(fullCsv.endsWith('SKU-101,SKU-102'));
assert.equal(fullCsv.split('\n').length, 51);

const fullText = generateExcelSequenceText({
  prefix: 'SKU',
  start: 1,
  count: 3,
  step: 1,
  separator: '-',
  padding: 3,
});

assert.equal(fullText, 'SKU-001\nSKU-002\nSKU-003');

const large = calculateExcelSequence({
  prefix: 'Account',
  start: 1,
  count: 400000,
  step: 1,
  separator: '',
  padding: 0,
});

assert.equal(large.ok, true);
assert.equal(large.values.length, EXCEL_SEQUENCE_PREVIEW_LIMIT);
assert.equal(large.previewLimitHit, true);
assert.equal(large.formula365, '="Account"&SEQUENCE(400000,1,1,1)');

const invalid = calculateExcelSequence({
  prefix: '',
  start: 1,
  count: 0,
  step: 0,
  separator: '\n',
  padding: 20,
  outputColumns: 0,
});

assert.equal(invalid.ok, false);
assert.deepEqual(invalid.values, []);
assert.ok(invalid.errors.some((error) => error.code === 'prefix-required'));
assert.ok(invalid.errors.some((error) => error.code === 'count-invalid'));
assert.ok(invalid.errors.some((error) => error.code === 'step-invalid'));
assert.ok(invalid.errors.some((error) => error.code === 'separator-invalid'));
assert.ok(invalid.errors.some((error) => error.code === 'padding-invalid'));
assert.ok(
  invalid.errors.some((error) => error.code === 'output-columns-invalid')
);

console.log('verify-excel-sequence-generator passed');
