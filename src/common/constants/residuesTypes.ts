// export const residuesTypes = [
//   "Resíduo comum",
//   "Grandes Volumes",
//   "Resíduos de Construção",
//   "Resíduos Mistos (Mix)",
//   "Resíduos de Podas",
//   "Recicláveis"
// ];

// export const residuesTypesEn = {
//   pruning: "Resíduos de Podas",
//   construction: "Resíduos de Construção",
//   recycled: "Recicláveis",
//   mixed: "Resíduos Mistos (Mix)",
//   "high-volumes": "Grandes Volumes",
//   common: "Resíduo comum"
// };


export const RESIDUE_TYPES = [
  "Resíduo Comum",
  "Recicláveis",
  "Eletroeletrônicos",
  "Resíduos Mistos (Mix)",
  "Resíduos de Construção",
  "Resíduos de Podas",
  "Grandes Volumes",
] as const;

export type ResidueType = (typeof RESIDUE_TYPES)[number];
