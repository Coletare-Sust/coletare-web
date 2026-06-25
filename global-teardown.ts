import MCR from 'monocart-coverage-reports';
import mcrConfig from './mcr.config';

export default async function globalTeardown() {
  await MCR(mcrConfig).generate();
}
