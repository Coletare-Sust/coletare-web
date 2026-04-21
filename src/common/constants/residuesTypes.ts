export const residuesTypes = [
  "Resíduo Comum",
  "Recicláveis",
  "Eletroeletrônicos",
  "Resíduos Mistos (Mix)",
  "Resíduos de Construção",
  "Resíduos de Podas",
  "Grandes Volumes",
] as const;

export type ResidueType = (typeof residuesTypes)[number];

export const residuesTypesEn: Record<string, ResidueType> = {
  common: "Resíduo Comum",
  recycled: "Recicláveis",
  electronics: "Eletroeletrônicos",
  mixed: "Resíduos Mistos (Mix)",
  construction: "Resíduos de Construção",
  pruning: "Resíduos de Podas",
  "high-volumes": "Grandes Volumes",
};
