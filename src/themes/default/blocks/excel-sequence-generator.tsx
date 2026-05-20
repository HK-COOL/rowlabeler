'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  Gauge,
  ListOrdered,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

import {
  calculateExcelSequence,
  ExcelSequenceInput,
  ExcelSequenceError,
  ExcelSequenceErrorCode,
  EXCEL_SEQUENCE_PREVIEW_LIMIT,
  generateExcelSequenceCsv,
} from '@/shared/lib/excel-sequence-generator';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

type ExampleInput = ExcelSequenceInput & {
  title: string;
};

type CopyKey = 'formula365' | 'legacyFormula' | 'plainText' | 'csvPreview';

const defaultLabels = {
  prefix: 'Prefix',
  start: 'Start',
  count: 'Rows',
  step: 'Step',
  separator: 'Separator',
  padding: 'Zero padding',
  outputColumns: 'CSV columns',
  examples: 'Quick examples',
  reset: 'Reset',
  result: 'Result',
  formula365: 'Excel 365 formula',
  legacyFormula: 'Legacy Excel formula',
  plainText: 'Plain text preview',
  csvPreview: 'CSV preview',
  copy: 'Copy',
  copied: 'Copied',
  previewNote: 'Showing the first {limit} rows only to keep the browser fast.',
  emptyState: 'Fix the inputs to generate formulas and previews.',
  totalRows: '{count} total rows',
  previewRows: '{count} preview rows',
  totalRowsLabel: 'Total rows',
  previewRowsLabel: 'Preview rows',
  setupTitle: 'Pattern setup',
  localNote: 'No file upload',
  guideCta: 'Need the 400k Account walkthrough?',
  guideUrl: '/blog/generate-400000-account-labels-without-dragging',
  guideLink: 'Read the guide',
  outputReady: 'Ready to copy',
  outputBlocked: 'Waiting for valid inputs',
  downloadCsv: 'Download CSV',
  downloadedCsv: 'Downloaded',
};

const defaultExamples: ExampleInput[] = [
  {
    title: 'Account1...',
    prefix: 'Account',
    start: 1,
    count: 400000,
    step: 1,
    separator: '',
    padding: 0,
  },
  {
    title: 'SKU-0001...',
    prefix: 'SKU',
    start: 1,
    count: 250,
    step: 1,
    separator: '-',
    padding: 4,
  },
  {
    title: 'Batch 100...',
    prefix: 'Batch',
    start: 100,
    count: 20,
    step: 5,
    separator: ' ',
    padding: 0,
  },
];

const initialInput: ExcelSequenceInput = {
  prefix: 'Account',
  start: 1,
  count: 400000,
  step: 1,
  separator: '',
  padding: 0,
  outputColumns: 1,
};

const defaultErrorMessages: Record<ExcelSequenceErrorCode, string> = {
  'prefix-required': 'Enter a prefix such as Account, Item, SKU, or Row.',
  'start-invalid': 'Start number must be an integer.',
  'count-invalid': 'Row count must be between 1 and 1,000,000.',
  'step-invalid': 'Step must be a non-zero integer.',
  'separator-invalid':
    'Separator must be 10 characters or fewer and cannot contain line breaks.',
  'padding-invalid': 'Padding must be between 0 and 12.',
  'output-columns-invalid': 'CSV columns must be between 1 and 26.',
};

function fieldValue(value: number | string): string {
  return String(value);
}

function applyTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template
  );
}

export function ExcelSequenceGenerator({ section }: { section: Section }) {
  const labels = { ...defaultLabels, ...(section.labels || {}) };
  const errorMessages = {
    ...defaultErrorMessages,
    ...(section.errorMessages || {}),
  } as Record<ExcelSequenceErrorCode, string>;
  const examples = (section.examples || defaultExamples) as ExampleInput[];
  const [input, setInput] = useState<ExcelSequenceInput>(initialInput);
  const [copiedKey, setCopiedKey] = useState<CopyKey | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const result = useMemo(() => calculateExcelSequence(input), [input]);
  const previewRowCount = result.ok ? result.previewCount : 0;
  const outputStatusLabel = result.ok ? labels.outputReady : labels.outputBlocked;

  const getFieldError = (
    codes: ExcelSequenceErrorCode[]
  ): ExcelSequenceError | undefined =>
    result.errors.find((error) => codes.includes(error.code));

  const renderFieldError = (
    error: ExcelSequenceError | undefined,
    id: string
  ) =>
    error ? (
      <p id={id} className="text-destructive text-xs leading-snug">
        {errorMessages[error.code] || error.message}
      </p>
    ) : null;

  const updateInput = (key: keyof ExcelSequenceInput, value: string) => {
    setInput((current) => ({ ...current, [key]: value }));
    setCopiedKey(null);
    setDownloaded(false);
  };

  const applyExample = (example: ExampleInput) => {
    setInput(example);
    setCopiedKey(null);
    setDownloaded(false);
  };

  const copyValue = async (key: CopyKey, value: string) => {
    if (!value) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        fallbackCopy(value);
      }
    } catch {
      fallbackCopy(value);
    }

    setCopiedKey(key);
  };

  const downloadCsv = () => {
    if (!result.ok) {
      return;
    }

    const csv = generateExcelSequenceCsv(input);
    if (!csv) {
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safePrefix = input.prefix.trim().replace(/[^a-z0-9-]+/gi, '-');

    link.href = url;
    link.download = `${safePrefix || 'excel-sequence'}-${fieldValue(
      input.count
    )}-rows.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const renderCopyButton = (key: CopyKey, value: string) => (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={() => void copyValue(key, value)}
      disabled={!value}
      aria-label={`${copiedKey === key ? labels.copied : labels.copy} ${
        labels[key]
      }`}
      className="min-w-24 justify-center"
    >
      {copiedKey === key ? (
        <CheckCircle2 className="size-4" />
      ) : (
        <Copy className="size-4" />
      )}
      <span>{copiedKey === key ? labels.copied : labels.copy}</span>
    </Button>
  );

  return (
    <section
      id={section.id}
      className={cn(
        'bg-muted/55 overflow-x-hidden border-y py-14 md:py-20',
        section.className
      )}
    >
      <div className="container min-w-0 space-y-7">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            {section.label && <Badge variant="secondary">{section.label}</Badge>}
            <Badge variant="outline" className="bg-background/70">
              <ShieldCheck className="size-3" />
              {labels.localNote}
            </Badge>
          </div>
          <h2 className="text-foreground max-w-3xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            {section.title}
          </h2>
          {section.description && (
            <p className="text-muted-foreground mt-4 max-w-2xl text-base text-balance">
              {section.description}
            </p>
          )}
        </div>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(300px,390px)_minmax(0,1fr)]">
          <div className="border-border bg-background min-w-0 self-start rounded-lg border p-4 shadow-sm md:p-5 lg:sticky lg:top-24">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <ListOrdered className="text-primary size-5 shrink-0" />
                  <h3 className="font-semibold">{labels.setupTitle}</h3>
                </div>
                <p className="text-muted-foreground text-xs">
                  {labels.examples}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setInput(initialInput)}
                className="shrink-0"
              >
                <RotateCcw className="size-4" />
                <span>{labels.reset}</span>
              </Button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {examples.map((example) => (
                <Button
                  key={example.title}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyExample(example)}
                  className="min-w-0 justify-start truncate"
                  title={example.title}
                >
                  <span className="truncate">{example.title}</span>
                </Button>
              ))}
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2">
              <MetricTile
                label={labels.count}
                value={fieldValue(input.count)}
              />
              <MetricTile
                label={labels.step}
                value={fieldValue(input.step)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="excel-prefix">{labels.prefix}</Label>
                <Input
                  id="excel-prefix"
                  value={fieldValue(input.prefix)}
                  onChange={(event) => updateInput('prefix', event.target.value)}
                  aria-invalid={result.errors.some(
                    (error) => error.code === 'prefix-required'
                  )}
                  aria-describedby="excel-prefix-error"
                />
                {renderFieldError(
                  getFieldError(['prefix-required']),
                  'excel-prefix-error'
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excel-start">{labels.start}</Label>
                <Input
                  id="excel-start"
                  type="number"
                  inputMode="numeric"
                  value={fieldValue(input.start)}
                  onChange={(event) => updateInput('start', event.target.value)}
                  aria-invalid={result.errors.some(
                    (error) => error.code === 'start-invalid'
                  )}
                  aria-describedby="excel-start-error"
                />
                {renderFieldError(
                  getFieldError(['start-invalid']),
                  'excel-start-error'
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excel-count">{labels.count}</Label>
                <Input
                  id="excel-count"
                  type="number"
                  inputMode="numeric"
                  value={fieldValue(input.count)}
                  onChange={(event) => updateInput('count', event.target.value)}
                  aria-invalid={result.errors.some(
                    (error) => error.code === 'count-invalid'
                  )}
                  aria-describedby="excel-count-error"
                />
                {renderFieldError(
                  getFieldError(['count-invalid']),
                  'excel-count-error'
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excel-step">{labels.step}</Label>
                <Input
                  id="excel-step"
                  type="number"
                  inputMode="numeric"
                  value={fieldValue(input.step)}
                  onChange={(event) => updateInput('step', event.target.value)}
                  aria-invalid={result.errors.some(
                    (error) => error.code === 'step-invalid'
                  )}
                  aria-describedby="excel-step-error"
                />
                {renderFieldError(
                  getFieldError(['step-invalid']),
                  'excel-step-error'
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excel-padding">{labels.padding}</Label>
                <Input
                  id="excel-padding"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={12}
                  value={fieldValue(input.padding)}
                  onChange={(event) =>
                    updateInput('padding', event.target.value)
                  }
                  aria-invalid={result.errors.some(
                    (error) => error.code === 'padding-invalid'
                  )}
                  aria-describedby="excel-padding-error"
                />
                {renderFieldError(
                  getFieldError(['padding-invalid']),
                  'excel-padding-error'
                )}
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="excel-separator">{labels.separator}</Label>
                <Input
                  id="excel-separator"
                  value={fieldValue(input.separator)}
                  onChange={(event) =>
                    updateInput('separator', event.target.value)
                  }
                  aria-invalid={result.errors.some(
                    (error) => error.code === 'separator-invalid'
                  )}
                  aria-describedby="excel-separator-error"
                />
                {renderFieldError(
                  getFieldError(['separator-invalid']),
                  'excel-separator-error'
                )}
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="excel-output-columns">
                  {labels.outputColumns}
                </Label>
                <Input
                  id="excel-output-columns"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={26}
                  value={fieldValue(input.outputColumns ?? 1)}
                  onChange={(event) =>
                    updateInput('outputColumns', event.target.value)
                  }
                  aria-invalid={result.errors.some(
                    (error) => error.code === 'output-columns-invalid'
                  )}
                  aria-describedby="excel-output-columns-error"
                />
                {renderFieldError(
                  getFieldError(['output-columns-invalid']),
                  'excel-output-columns-error'
                )}
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="border-destructive/25 bg-destructive/5 mt-5 rounded-md border p-3">
                <div className="text-destructive flex items-start gap-2 text-sm font-medium">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{labels.emptyState}</span>
                </div>
              </div>
            )}

            <div className="bg-muted/50 mt-5 rounded-md border p-3 text-sm">
              <p className="text-muted-foreground">{labels.guideCta}</p>
              <a
                href={labels.guideUrl}
                className="text-primary mt-1 inline-flex font-medium underline-offset-4 hover:underline"
              >
                {labels.guideLink}
              </a>
            </div>
          </div>

          <div className="border-border bg-background min-w-0 rounded-lg border p-4 shadow-sm md:p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <FileSpreadsheet className="text-primary size-5 shrink-0" />
                  <h3 className="font-semibold">{labels.result}</h3>
                </div>
                <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                  <Gauge className="size-3.5" />
                  <span>{outputStatusLabel}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MetricTile
                  label={labels.totalRowsLabel}
                  value={result.ok ? result.totalCount.toLocaleString() : '0'}
                />
                <MetricTile
                  label={labels.previewRowsLabel}
                  value={previewRowCount.toLocaleString()}
                />
              </div>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={downloadCsv}
                disabled={!result.ok}
                className="w-full sm:w-auto"
              >
                {downloaded ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Download className="size-4" />
                )}
                <span>
                  {downloaded ? labels.downloadedCsv : labels.downloadCsv}
                </span>
              </Button>
            </div>

            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              <OutputPanel
                title={labels.formula365}
                value={result.formula365}
                copyButton={renderCopyButton('formula365', result.formula365)}
              />
              <OutputPanel
                title={labels.legacyFormula}
                value={result.legacyFormula}
                copyButton={renderCopyButton(
                  'legacyFormula',
                  result.legacyFormula
                )}
              />
              <OutputPanel
                title={labels.plainText}
                value={result.plainText}
                copyButton={renderCopyButton('plainText', result.plainText)}
                tall
              />
              <OutputPanel
                title={labels.csvPreview}
                value={result.csvPreview}
                copyButton={renderCopyButton('csvPreview', result.csvPreview)}
                tall
              />
            </div>

            {result.previewLimitHit && (
              <p className="text-muted-foreground mt-4 text-sm">
                {applyTemplate(labels.previewNote, {
                  limit: EXCEL_SEQUENCE_PREVIEW_LIMIT.toString(),
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/45 min-w-0 rounded-md border px-3 py-2">
      <div className="text-muted-foreground truncate text-[11px] font-medium">
        {label}
      </div>
      <div className="truncate font-mono text-sm font-semibold">{value}</div>
    </div>
  );
}

function fallbackCopy(value: string) {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function OutputPanel({
  title,
  value,
  copyButton,
  tall = false,
}: {
  title: string;
  value: string;
  copyButton: ReactNode;
  tall?: boolean;
}) {
  return (
    <div className="border-border min-w-0 overflow-hidden rounded-md border">
      <div className="border-border flex min-h-12 min-w-0 items-center justify-between gap-3 border-b px-3 py-2">
        <h4 className="min-w-0 truncate text-sm font-medium">{title}</h4>
        <div className="shrink-0">{copyButton}</div>
      </div>
      <Textarea
        value={value}
        readOnly
        className={cn(
          'bg-muted/20 min-h-24 resize-none rounded-none border-0 font-mono text-sm leading-relaxed shadow-none focus-visible:ring-0',
          tall && 'min-h-48 md:min-h-56'
        )}
      />
    </div>
  );
}
