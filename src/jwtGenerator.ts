import { KJUR } from 'jsrsasign';


// Hardcoded Zoom SDK Key and Secret
const SDK_KEY = 'WFjIRpCwjZAsbwAHXIjUJfb2CCrXbQzyWuAf';
const SDK_SECRET = 'gE0kjwH0dWxxJfXbFdpymcTFAJmN5QKvpNjy';

export const generateJWT = (
  sessionName: string,
  role: number,
  sessionKey: string,
  userIdentity: string
): string => {
  const iat = Math.round(new Date().getTime() / 1000) - 30; // Issued 30 seconds ago
  const exp = iat + 60 * 60 * 2; // Expires in 2 hours

  const payload = {
    app_key: SDK_KEY,
    tpc: sessionName,
    role_type: role,
    session_key: sessionKey,
    user_identity: userIdentity,
    version: 1,
    iat,
    exp,
  };

  const header = { alg: 'HS256', typ: 'JWT' };

  return KJUR.jws.JWS.sign('HS256', JSON.stringify(header), JSON.stringify(payload), SDK_SECRET);
};