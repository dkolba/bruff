const DEFAULT_SEGMENT_LOCALE = undefined;

/** Splits user-entered text into Unicode grapheme clusters. */
export const segmentGraphemes = (text: string): ReadonlyArray<string> => {
  const segmenter = new Intl.Segmenter(DEFAULT_SEGMENT_LOCALE, {
    granularity: "grapheme",
  });

  return Array.from(segmenter.segment(text), (segment) => segment.segment);
};

/** Returns distinct grapheme clusters in first-seen order. */
export const distinctGraphemes = (text: string): ReadonlyArray<string> => [
  ...new Set(segmentGraphemes(text)),
];
