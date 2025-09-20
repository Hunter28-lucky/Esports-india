// Centralized error utilities for better logging and user-facing messages
// Handles Supabase errors, generic JS errors, and unknown values

import type { PostgrestError } from '@supabase/supabase-js'

export interface NormalizedError {
  code?: string
  message: string
  details?: string
  hint?: string
  context?: Record<string, any>
  raw?: unknown
}

export function normalizeError(err: unknown, context?: Record<string, any>): NormalizedError {
  try {
    if (!err) return { message: 'Unknown error', context, raw: err }

    // Supabase PostgrestError check first (it is usually a plain object, not Error instance)
    const pg = err as PostgrestError
    if (pg && typeof pg === 'object' && 'message' in pg && ('code' in pg || 'details' in pg)) {
      return {
        message: (pg.message as string) || 'Postgrest error',
        code: pg.code,
        details: pg.details,
        hint: pg.hint,
        raw: pg,
        context,
      }
    }

    if (typeof err === 'string') return { message: err, context }

    if (err instanceof Error) {
      // Collect non-enumerable props (like message, stack) and any custom fields
      const anyErr = err as any
      const extra: Record<string, any> = {}
      for (const k of Object.getOwnPropertyNames(anyErr)) {
        if (!['message', 'stack'].includes(k)) extra[k] = (anyErr as any)[k]
      }
      return {
        message: err.message || 'Error',
        code: anyErr.code,
        raw: {
          message: err.message,
          stack: err.stack,
          ...extra,
        },
        context,
      }
    }

    // Generic object case: try to JSON serialize including symbol keys
    if (typeof err === 'object') {
      let serialized: any = {}
      try {
        serialized = JSON.parse(JSON.stringify(err, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)))
      } catch {
        serialized = { toString: Object.prototype.toString.call(err) }
      }
      return { message: serialized.message || 'Unknown object error', raw: serialized, context }
    }

    return { message: 'Unhandled error type', raw: err, context }
  } catch (fatal) {
    return { message: 'Failed to normalize error', raw: { original: err, fatal }, context }
  }
}

export function createUnhandledError(err: unknown, context?: Record<string, any>): NormalizedError {
  const normalized = normalizeError(err, context)
  // Rich console output for debugging
  // Using groupCollapsed to avoid noisy logs unless expanded
  try {
    if (typeof window !== 'undefined' && 'console' in window) {
      console.groupCollapsed('%c[UnhandledError] ' + normalized.message, 'color:#ff5555;font-weight:bold;')
      console.log('Code:', normalized.code)
      if (normalized.details) console.log('Details:', normalized.details)
      if (normalized.hint) console.log('Hint:', normalized.hint)
      if (normalized.context) console.log('Context:', normalized.context)
      console.log('Raw (json):', safeStringify(normalized.raw))
      console.log('Raw (value):', normalized.raw)
      console.groupEnd()
    } else {
      // eslint-disable-next-line no-console
      console.error('[UnhandledError]', safeStringify(normalized))
    }
  } catch (logErr) {
    // eslint-disable-next-line no-console
    console.error('[UnhandledError][LoggingFailed]', logErr)
  }
  return normalized
}

export function handleClientError(err: unknown, userMessageFallback = 'Something went wrong', context?: Record<string, any>) {
  const normalized = createUnhandledError(err, context)
  return {
    normalized,
    userMessage: normalized.message || userMessageFallback,
  }
}

// Safe JSON stringify capturing circular refs
function safeStringify(value: unknown) {
  const seen = new WeakSet()
  return JSON.stringify(value, function (_key, val) {
    if (typeof val === 'object' && val !== null) {
      if (seen.has(val)) return '[Circular]'
      seen.add(val)
    }
    if (typeof val === 'bigint') return val.toString()
    return val
  }, 2)
}
