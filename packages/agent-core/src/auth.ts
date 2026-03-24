import * as os from 'node:os';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import jwt from 'jsonwebtoken';

const CLAWID_PATH = path.join(process.cwd(), 'data', '.clawid');

// Get machine specific hardware ID
export async function getMachineId(): Promise<string> {
  const model = os.cpus()[0]?.model || 'unknown-model';
  const hostname = os.hostname();

  // Hash model + hostname to create a hardware-bound ID
  const rawId = `${model}-${hostname}`;
  return crypto.createHash('sha256').update(rawId).digest('hex');
}

/**
 * Ensures the device hardware ID is stored in data/.clawid
 */
export async function ensureClawId(): Promise<string> {
  const machineId = await getMachineId();
  const dir = path.dirname(CLAWID_PATH);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(CLAWID_PATH)) {
    fs.writeFileSync(CLAWID_PATH, machineId, 'utf8');
  }

  return fs.readFileSync(CLAWID_PATH, 'utf8');
}

/**
 * Generates a 30-day JWT bound to the machine's hardware ID.
 */
export async function generateDeviceJwt(): Promise<string> {
  const machineId = await ensureClawId();
  const secret = process.env.CLAWSHIELD_AGENT_SECRET || 'development_fallback_secret';

  return jwt.sign({ sub: machineId, role: 'owner' }, secret, { expiresIn: '30d' });
}

/**
 * Verifies a provided JWT matches the hardware ID and secret.
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.CLAWSHIELD_AGENT_SECRET || 'development_fallback_secret';
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    const currentMachineId = await ensureClawId();
    return decoded.sub === currentMachineId;
  } catch (error) {
    return false;
  }
}
