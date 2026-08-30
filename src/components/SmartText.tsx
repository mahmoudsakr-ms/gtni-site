import React from 'react'

/**
 * Historically this component patched specific known-bad Google Translate outputs
 * for short strings via a hand-maintained English->Arabic override dictionary,
 * keyed off a client-side `isArabic` toggle from the (now removed) GoogleTranslate
 * widget. Real per-locale content from the CMS (see Phase 2/3 of
 * PLAN_SECURITY_I18N.md) replaces that entirely: whatever string is passed in here
 * is already the correct text for the current locale, fetched directly from
 * Payload. Kept as a passthrough component (rather than removed) so none of its
 * call sites need to change.
 */
export const SmartText = ({ text }: { text: string }) => {
  return <span suppressHydrationWarning>{text}</span>
}
