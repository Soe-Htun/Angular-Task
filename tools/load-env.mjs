import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');
const exampleEnvPath = path.join(rootDir, '.env.example');
const environmentsDir = path.join(rootDir, 'src/environments');

if (!fs.existsSync(envPath)) {
  const defaultEnv = 'API_URL=https://apidemo.globalhr.com.mm/api/publicrequest\n';
  fs.writeFileSync(envPath, defaultEnv, 'utf8');
  if (!fs.existsSync(exampleEnvPath)) {
    fs.writeFileSync(exampleEnvPath, defaultEnv, 'utf8');
  }
  console.log('Created .env with default API_URL.');
} else if (!fs.existsSync(exampleEnvPath)) {
  fs.copyFileSync(envPath, exampleEnvPath);
  console.log('Created .env.example based on existing .env.');
}

const parsed = dotenv.config({ path: envPath }).parsed ?? {};
const apiUrl = parsed.API_URL || 'https://apidemo.globalhr.com.mm/api/publicrequest';

const environmentFile = `export const environment = {\n  apiUrl: '${apiUrl}'\n} as const;\n`;

fs.mkdirSync(environmentsDir, { recursive: true });
fs.writeFileSync(path.join(environmentsDir, 'environment.generated.ts'), environmentFile, 'utf8');
console.log(`Generated environment at src/environments/environment.generated.ts using API_URL=${apiUrl}`);
