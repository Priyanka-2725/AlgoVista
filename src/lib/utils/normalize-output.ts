/**
 * Standardizes output strings for fair comparison in the Unified Judge System.
 * Lenient normalization: trims edges and collapses all internal whitespace (including newlines) 
 * into single spaces to ensure logical correctness isn't failed by formatting.
 */
export function normalizeOutput(output: string): string {
  if (!output) return "";
  return output
    .trim()
    .replace(/\r/g, "") // Remove carriage returns (Windows)
    .replace(/\s+/g, " "); // Collapse all whitespace into single spaces
}

/**
 * Collapses all whitespace into single spaces for non-strict comparison.
 * In the unified judge, this is our primary comparison method.
 */
export function collapseWhitespace(output: string): string {
  return normalizeOutput(output);
}
