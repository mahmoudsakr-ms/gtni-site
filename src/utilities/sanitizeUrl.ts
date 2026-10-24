/**
 * SEC-M4: CMS-editable link fields (rich text links, footer social links, the
 * student handbook link) are rendered directly as `<a href={...}>` with no
 * scheme validation. An editor-set `javascript:` (or `data:`, `vbscript:`, etc.)
 * URI would render as a normal, clickable link that executes script when
 * clicked -- a stored-XSS vector via the CMS rather than user input.
 *
 * Only a safe, known-benign set of absolute schemes is allowed (http, https,
 * mailto, tel); anything with no scheme at all is treated as a relative path
 * or in-page anchor and passed through untouched so existing internal links
 * keep working. Anything else falls back to '#' (an inert, same-page anchor)
 * rather than omitting the href entirely, so callers that always render an
 * <a> don't end up with a broken/undefined attribute.
 */

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

// Matches ASCII control characters (0x00-0x1F, 0x7F) and any whitespace.
const CONTROL_OR_WHITESPACE = new RegExp('[\\x00-\\x1F\\x7F\\s]', 'g')

export function sanitizeUrl(url: string | null | undefined): string {
  if (typeof url !== 'string') return '#'

  const trimmed = url.trim()
  if (!trimmed) return '#'

  // No scheme at all -- relative path, in-page anchor (#section), query-only
  // (?x=y), or protocol-relative (//host/path). None of these can execute
  // script via the scheme, so pass through unchanged.
  if (/^[#/?]/.test(trimmed)) return trimmed

  // Strip whitespace/control characters that some legacy renderers ignore
  // inside a scheme (e.g. "java\tscript:" or "java script:") before checking
  // it, so that evasion trick doesn't slip past the check below.
  const normalized = trimmed.replace(CONTROL_OR_WHITESPACE, '').toLowerCase()

  const schemeMatch = normalized.match(/^([a-z][a-z0-9+.-]*):/)
  // No recognizable "scheme:" prefix at all -- treat as a relative reference
  // (e.g. "about-gtni" or "example.com" typed without a protocol).
  if (!schemeMatch) return trimmed

  const scheme = `${schemeMatch[1]}:`
  if (SAFE_PROTOCOLS.has(scheme)) return trimmed

  return '#'
}
