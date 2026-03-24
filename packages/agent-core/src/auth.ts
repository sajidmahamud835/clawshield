import * as os from 'node:os';
import * as crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

// Using a fallback hardware ID approach for the prototype
// In production, we'd use a native package like machine-uuid
export async function getMachineId(): Promise<string> {
  const interfaces = os.networkInterfaces();
  let mac = '00:00:00:00:00:00';
  
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name]?.find((i) => !i.internal && i.mac !== '00:00:00:00:00:00');
    if (iface) {
      mac = iface.mac;
      break;
    }
  }

  // Hash the MAC address with hostname to create a stable hardware-bound ID
  return crypto.createHash('sha256').update(`${mac}-${os.hostname()}`).digest('hex');
}

/**
 * Generates a 30-day JWT bound to the machine's hardware ID.
 */
export async function generateDeviceJwt(): Promise<string> {
  const machineId = await getMachineId();
  const secret = process.env.CLAWSHIELD_AGENT_SECRET || 'development_fallback_secret';
  
  return jwt.sign(
    { sub: machineId, role: 'owner' },
    secret,
    { expiresIn: '30d' }
  );
}

/**
 * Verifies a provided JWT matches the hardware ID and secret.
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.CLAWSHIELD_AGENT_SECRET || 'development_fallback_secret';
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    
    const currentMachineId = await getMachineId();
    return decoded.sub === currentMachineId;
  } catch (error) {
    return false;
  }
}
