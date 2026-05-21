'use client';

import { track } from '@vercel/analytics';

export const toolsiteEventNames = [
  'tool_copy_formula',
  'tool_download_csv',
  'tool_download_txt',
  'tool_apply_preset',
  'tool_scroll_to_generator',
  'longtail_cta_click',
] as const;

export type ToolsiteEventName = (typeof toolsiteEventNames)[number];

type ToolsiteEventInput = {
  locale?: string;
  route?: string;
  outputType?: string;
  prefix?: string;
  rowCount?: number | string;
  columns?: number | string;
  [key: string]: unknown;
};

type ToolsiteEventPayload = {
  locale: string;
  route: string;
  outputType: string;
  prefixType: string;
  rowCountRange: string;
  columns: number;
};

export function getRowCountRange(rowCount: number | string | undefined) {
  const parsed =
    typeof rowCount === 'number'
      ? rowCount
      : Number.parseInt(rowCount || '', 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 'unknown';
  }

  if (parsed < 100) {
    return '1-99';
  }

  if (parsed < 1000) {
    return '100-999';
  }

  if (parsed < 10000) {
    return '1k-9k';
  }

  if (parsed < 100000) {
    return '10k-99k';
  }

  if (parsed <= 1000000) {
    return '100k-1m';
  }

  return '1m+';
}

export function buildToolsiteEventPayload(
  input: ToolsiteEventInput
): ToolsiteEventPayload {
  return {
    locale: normalizeLocale(input.locale),
    route: normalizeRoute(input.route),
    outputType: normalizeText(input.outputType, 'unknown'),
    prefixType: classifyPrefix(input.prefix),
    rowCountRange: getRowCountRange(input.rowCount),
    columns: normalizeColumns(input.columns),
  };
}

export function trackToolsiteEvent(
  name: ToolsiteEventName,
  input: ToolsiteEventInput = {}
) {
  if (typeof window === 'undefined') {
    return;
  }

  track(name, buildToolsiteEventPayload(input));
}

function normalizeLocale(locale: string | undefined) {
  const value = normalizeText(locale, 'unknown').toLowerCase();

  if (value === 'zh' || value === 'en') {
    return value;
  }

  return 'unknown';
}

function normalizeRoute(route: string | undefined) {
  const value = normalizeText(route, '/');

  if (!value.startsWith('/')) {
    return '/';
  }

  return value.slice(0, 120);
}

function normalizeText(value: string | undefined, fallback: string) {
  const normalized = String(value || '').trim();
  return normalized ? normalized.slice(0, 64) : fallback;
}

function normalizeColumns(columns: number | string | undefined) {
  const parsed =
    typeof columns === 'number' ? columns : Number.parseInt(columns || '', 10);

  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(Math.max(parsed, 1), 26);
}

function classifyPrefix(prefix: string | undefined) {
  const value = normalizeText(prefix, '').toLowerCase();

  if (!value) {
    return 'empty';
  }

  if (value.includes('sku')) {
    return 'sku';
  }

  if (value.includes('invoice') || value.includes('inv')) {
    return 'invoice';
  }

  if (value.includes('account') || value.includes('acct')) {
    return 'account';
  }

  if (value.includes('batch')) {
    return 'batch';
  }

  if (value.includes('row')) {
    return 'row';
  }

  return 'custom';
}
