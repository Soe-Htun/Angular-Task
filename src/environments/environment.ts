// This file reads from the generated environment output by tools/load-env.mjs
// to make local configuration controllable via .env.
import { environment as generatedEnvironment } from './environment.generated';

export const environment = generatedEnvironment;
