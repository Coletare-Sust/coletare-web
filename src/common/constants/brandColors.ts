/**
 * Cores da marca para código que não passa pelo Tailwind
 * (Chart.js, Google Maps, atributos de SVG).
 * Mantenha em sincronia com `brand.*` em tailwind.config.js.
 */
export const brandColors = {
  aqua: "#00ADB4",
  aquaSoft: "#31BBC1",
  deep: "#004A55",
  ink: "#4D534C",
  strong: "#232B22",
  paper: "#FAF7FA",
  mint: "#C4E7E8",
  mintSoft: "#B6DFDF"
} as const;

export type BrandColor = keyof typeof brandColors;
