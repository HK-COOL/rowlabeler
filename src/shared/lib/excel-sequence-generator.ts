export const EXCEL_SEQUENCE_PREVIEW_LIMIT = 100;
export const EXCEL_SEQUENCE_MAX_COUNT = 1_000_000;
export const EXCEL_SEQUENCE_MAX_PADDING = 12;
export const EXCEL_SEQUENCE_MAX_OUTPUT_COLUMNS = 26;

export type ExcelSequenceInput = {
  prefix: string;
  start: number | string;
  count: number | string;
  step: number | string;
  separator: string;
  padding: number | string;
  outputColumns?: number | string;
};

export type ExcelSequenceErrorCode =
  | 'prefix-required'
  | 'start-invalid'
  | 'count-invalid'
  | 'step-invalid'
  | 'separator-invalid'
  | 'padding-invalid'
  | 'output-columns-invalid';

export type ExcelSequenceError = {
  code: ExcelSequenceErrorCode;
  message: string;
};

export type ExcelSequenceResult = {
  ok: boolean;
  values: string[];
  plainText: string;
  csvPreview: string;
  formula365: string;
  legacyFormula: string;
  previewLimitHit: boolean;
  previewCount: number;
  totalCount: number;
  errors: ExcelSequenceError[];
};

type NormalizedInput = {
  prefix: string;
  start: number;
  count: number;
  step: number;
  separator: string;
  padding: number;
  outputColumns: number;
};

function parseInteger(value: number | string): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return Number.NaN;
  }

  return Number(value);
}

function isSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value);
}

function excelString(value: string): string {
  return value.replaceAll('"', '""');
}

function csvCell(value: string): string {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

function numberFormat(padding: number): string {
  return '0'.repeat(padding);
}

function formatNumber(value: number, padding: number): string {
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value).toString();

  if (padding <= 0) {
    return `${sign}${absolute}`;
  }

  return `${sign}${absolute.padStart(padding, '0')}`;
}

function buildValues(input: NormalizedInput, limit: number): string[] {
  const { prefix, start, step, separator, padding } = input;
  const labelPrefix = `${prefix}${separator}`;

  return Array.from({ length: limit }, (_, index) => {
    const numberValue = start + index * step;
    return `${labelPrefix}${formatNumber(numberValue, padding)}`;
  });
}

function formatCsvRows(values: string[], outputColumns: number): string {
  if (outputColumns <= 1) {
    return values.map(csvCell).join('\n');
  }

  const rows: string[] = [];

  for (let index = 0; index < values.length; index += outputColumns) {
    rows.push(values.slice(index, index + outputColumns).map(csvCell).join(','));
  }

  return rows.join('\n');
}

function validateInput(input: ExcelSequenceInput): {
  normalized: NormalizedInput;
  errors: ExcelSequenceError[];
} {
  const prefix = input.prefix.trim();
  const separator = input.separator;
  const start = parseInteger(input.start);
  const count = parseInteger(input.count);
  const step = parseInteger(input.step);
  const padding = parseInteger(input.padding);
  const outputColumns = parseInteger(input.outputColumns ?? 1);
  const errors: ExcelSequenceError[] = [];

  if (!prefix) {
    errors.push({
      code: 'prefix-required',
      message: 'Enter a prefix such as Account, Item, SKU, or Row.',
    });
  }

  if (!isSafeInteger(start)) {
    errors.push({
      code: 'start-invalid',
      message: 'Start number must be an integer.',
    });
  }

  if (!isSafeInteger(count) || count < 1 || count > EXCEL_SEQUENCE_MAX_COUNT) {
    errors.push({
      code: 'count-invalid',
      message: `Row count must be between 1 and ${EXCEL_SEQUENCE_MAX_COUNT}.`,
    });
  }

  if (!isSafeInteger(step) || step === 0) {
    errors.push({
      code: 'step-invalid',
      message: 'Step must be a non-zero integer.',
    });
  }

  if (separator.length > 10 || /[\r\n]/.test(separator)) {
    errors.push({
      code: 'separator-invalid',
      message: 'Separator must be 10 characters or fewer and cannot contain line breaks.',
    });
  }

  if (
    !isSafeInteger(padding) ||
    padding < 0 ||
    padding > EXCEL_SEQUENCE_MAX_PADDING
  ) {
    errors.push({
      code: 'padding-invalid',
      message: `Padding must be between 0 and ${EXCEL_SEQUENCE_MAX_PADDING}.`,
    });
  }

  if (
    !isSafeInteger(outputColumns) ||
    outputColumns < 1 ||
    outputColumns > EXCEL_SEQUENCE_MAX_OUTPUT_COLUMNS
  ) {
    errors.push({
      code: 'output-columns-invalid',
      message: `Output columns must be between 1 and ${EXCEL_SEQUENCE_MAX_OUTPUT_COLUMNS}.`,
    });
  }

  return {
    normalized: {
      prefix,
      start: Number.isFinite(start) ? start : 1,
      count: Number.isFinite(count) ? count : 1,
      step: Number.isFinite(step) ? step : 1,
      separator,
      padding: Number.isFinite(padding) ? padding : 0,
      outputColumns: Number.isFinite(outputColumns) ? outputColumns : 1,
    },
    errors,
  };
}

export function calculateExcelSequence(
  input: ExcelSequenceInput
): ExcelSequenceResult {
  const { normalized, errors } = validateInput(input);

  if (errors.length > 0) {
    return {
      ok: false,
      values: [],
      plainText: '',
      csvPreview: '',
      formula365: '',
      legacyFormula: '',
      previewLimitHit: false,
      previewCount: 0,
      totalCount: 0,
      errors,
    };
  }

  const { prefix, start, count, step, separator, padding } = normalized;
  const labelPrefix = `${prefix}${separator}`;
  const previewCount = Math.min(count, EXCEL_SEQUENCE_PREVIEW_LIMIT);
  const values = buildValues(normalized, previewCount);
  const plainText = values.join('\n');
  const csvPreview = formatCsvRows(values, normalized.outputColumns);
  const escapedPrefix = excelString(labelPrefix);
  const sequenceExpression = `SEQUENCE(${count},1,${start},${step})`;
  const legacyNumberExpression = `${start}+(ROW(A1)-1)*${step}`;
  const formula365 =
    padding > 0
      ? `="${escapedPrefix}"&TEXT(${sequenceExpression},"${numberFormat(padding)}")`
      : `="${escapedPrefix}"&${sequenceExpression}`;
  const legacyFormula =
    padding > 0
      ? `="${escapedPrefix}"&TEXT(${legacyNumberExpression},"${numberFormat(padding)}")`
      : `="${escapedPrefix}"&(${legacyNumberExpression})`;

  return {
    ok: true,
    values,
    plainText,
    csvPreview,
    formula365,
    legacyFormula,
    previewLimitHit: count > previewCount,
    previewCount,
    totalCount: count,
    errors: [],
  };
}

export function generateExcelSequenceCsv(input: ExcelSequenceInput): string {
  const { normalized, errors } = validateInput(input);

  if (errors.length > 0) {
    return '';
  }

  const values = buildValues(normalized, normalized.count);

  return formatCsvRows(values, normalized.outputColumns);
}

export function generateExcelSequenceText(input: ExcelSequenceInput): string {
  const { normalized, errors } = validateInput(input);

  if (errors.length > 0) {
    return '';
  }

  return buildValues(normalized, normalized.count).join('\n');
}
