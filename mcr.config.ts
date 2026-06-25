import type { CoverageReportOptions } from 'monocart-coverage-reports';

const config: CoverageReportOptions = {
  name: 'Cobertura E2E - Coletare Web',
  outputDir: './coverage/e2e',
  logging: 'info',
  reports: ['v8', 'console-summary'],

  // No modo dev do Next.js, cada módulo da aplicação chega como uma entry
  // V8 própria com URL "webpack-internal:///(app-pages-browser)/./src/...".
  // Mantém só essas, descartando node_modules, chunks agregados e CSS.
  entryFilter: (entry) => entry.url.includes('/src/'),

  // Mantém no relatório somente os arquivos de "src/"
  sourceFilter: (sourcePath) => sourcePath.startsWith('src/'),

  // O sourcemap de cada módulo referencia "_N_E/./src/arquivo.tsx?hash".
  // Remove o prefixo virtual "_N_E/" e o sufixo de hash para apontar para
  // o arquivo real do projeto (ex: "src/app/page.tsx")
  sourcePath: (filePath) => filePath
    .replace(/^_N_E\//, '')
    .replace(/(\.[a-zA-Z0-9]+)-[0-9a-f]+$/, '$1'),
};

export default config;