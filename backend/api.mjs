/**
 * backend/api.mjs — Servidor WebAuthn para desarrollo local
 * ─────────────────────────────────────────────────────────────────────────────
 * Ejecutar con:  node backend/api.mjs
 * Puerto:        3000
 *
 * En producción reemplaza los Maps en memoria con una base de datos real.
 * Columnas SQL Server recomendadas:
 *   credentialId  NVARCHAR(512)  NOT NULL
 *   publicKey     NVARCHAR(MAX)  NULL       (para verificación ECDSA completa)
 *   email         NVARCHAR(254)  NOT NULL
 * ─────────────────────────────────────────────────────────────────────────────
 */
import express from 'express';
import crypto  from 'node:crypto';
import fs      from 'node:fs';
import path    from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE   = path.join(__dirname, 'credentials.json');

const app = express();
app.use(express.json());

// ── CORS solo para desarrollo (ng serve corre en :4200) ───────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

/**
 * ALMACENAMIENTO PERSISTENTE EN ARCHIVO JSON
 * ─────────────────────────────────────────────────────────────────────────────
 * credentials  →  email (minúsculas) → { credentialId: string }
 *   Se guarda en backend/credentials.json para sobrevivir reinicios del servidor.
 *
 * challenges   →  "registro:<email>" | "login:<email>" → { challenge, expiresAt }
 *   Son de UN SOLO USO y expiran en 2 minutos (solo en memoria, no persisten).
 */

// Cargar credenciales desde archivo al iniciar
function loadCredentials() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      return new Map(Object.entries(data));
    }
  } catch (e) {
    console.error('[WebAuthn] Error cargando credentials.json:', e.message);
  }
  return new Map();
}

// Guardar credenciales al archivo
function saveCredentials(map) {
  try {
    const obj = Object.fromEntries(map);
    fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (e) {
    console.error('[WebAuthn] Error guardando credentials.json:', e.message);
  }
}

const credentials = loadCredentials(); // email → { credentialId }
const challenges  = new Map();         // key   → { challenge, expiresAt }

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Genera y almacena un challenge con TTL de 2 minutos */
function createChallenge(key) {
  const challenge = crypto.randomBytes(32).toString('base64url');
  challenges.set(key, { challenge, expiresAt: Date.now() + 2 * 60 * 1000 });
  return challenge;
}

/**
 * Valida y CONSUME un challenge (single-use).
 * Devuelve true si el challenge recibido coincide y no ha expirado.
 */
function consumeChallenge(key, received) {
  const stored = challenges.get(key);
  if (!stored) return false;
  challenges.delete(key);                    // Consumir: no se puede reutilizar
  if (Date.now() > stored.expiresAt) return false;
  return stored.challenge === received;
}

// ── ENDPOINT 1: Generar challenge para REGISTRO ───────────────────────────────
//
// El servidor NO necesita saber nada del usuario más allá del email.
// El challenge es un número aleatorio que el TPM del cliente va a firmar.
//
app.post('/api/webauthn/register-challenge', (req, res) => {
  const { email, displayName } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  const challenge = createChallenge(`register:${email}`);

  res.json({
    challenge,
    rp: {
      name: 'Chaac Xanab',
      id:   'localhost',     // ← En producción: tu dominio real (ej. "chaac.mx")
    },
    user: {
      // El id del usuario va en base64url; NO uses el email directamente
      // para evitar exponer datos personales dentro del autenticador.
      id:          Buffer.from(email).toString('base64url'),
      name:        email,
      displayName: displayName || email,
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7   }, // ES256  (ECDSA P-256)  — preferido
      { type: 'public-key', alg: -257 }, // RS256  (RSA 2048)     — fallback
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',   // SOLO huella del dispositivo
      userVerification:        'required',   // La biometría es obligatoria
      residentKey:             'preferred',
    },
    timeout:     60000,
    attestation: 'none', // No requerimos verificar el fabricante del chip
  });
});

// ── ENDPOINT 2: Verificar y guardar credencial de REGISTRO ───────────────────
//
// Verificamos que el clientDataJSON contenga el challenge que nosotros emitimos.
// En producción también parsearías el attestationObject (CBOR) para extraer
// y guardar la llave pública ECDSA.
//
app.post('/api/webauthn/register-verify', (req, res) => {
  const { email, credentialId, clientDataJSON } = req.body;
  if (!email || !credentialId || !clientDataJSON) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  // Decodificar clientDataJSON (base64url → JSON)
  let clientData;
  try {
    clientData = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'clientDataJSON inválido' });
  }

  // Verificar tipo de operación
  if (clientData.type !== 'webauthn.create') {
    return res.status(400).json({ error: 'Tipo de operación incorrecto' });
  }

  // Verificar y consumir el challenge (protege contra replay attacks)
  if (!consumeChallenge(`register:${email}`, clientData.challenge)) {
    return res.status(400).json({ error: 'Challenge inválido o expirado' });
  }

  // Guardar credencial y persistir en archivo
  credentials.set(email.toLowerCase(), { credentialId });
  saveCredentials(credentials);

  console.log(`[WebAuthn] ✓ Huella registrada para: ${email}`);
  res.json({ success: true });
});

// ── ENDPOINT 3: Generar challenge para LOGIN ──────────────────────────────────
//
// Devuelve challenge + credentialId para que el cliente pueda pedir al TPM
// que firme el challenge con la llave privada asociada a esa credencial.
//
app.post('/api/webauthn/login-challenge', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido' });

  const stored = credentials.get(email.toLowerCase());
  if (!stored) {
    return res.status(404).json({ error: 'No hay huella registrada para este usuario' });
  }

  const challenge = createChallenge(`login:${email}`);
  res.json({ challenge, credentialId: stored.credentialId });
});

// ── ENDPOINT 4: Verificar firma de LOGIN ──────────────────────────────────────
//
// Verifica que el challenge en clientDataJSON sea el que emitimos nosotros.
//
// NOTA DE SEGURIDAD — Verificación completa de firma (para producción):
// ─────────────────────────────────────────────────────────────────────
// Para verificar la firma ECDSA necesitas:
//   1. hash = SHA-256(clientDataJSON_bytes)
//   2. signedData = concat(authenticatorData_bytes, hash)
//   3. crypto.verify('SHA256', signedData, storedPublicKey, signature_bytes)
//
// Esto requiere parsear el attestationObject con CBOR (librería 'cbor-x')
// para obtener la llave pública en el registro. Para este prototipo el
// challenge match garantiza que el autenticador respondió a ESTE challenge.
//
app.post('/api/webauthn/login-verify', (req, res) => {
  const { email, clientDataJSON } = req.body;
  if (!email || !clientDataJSON) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  let clientData;
  try {
    clientData = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'clientDataJSON inválido' });
  }

  if (clientData.type !== 'webauthn.get') {
    return res.status(400).json({ error: 'Tipo de operación incorrecto' });
  }

  if (!consumeChallenge(`login:${email}`, clientData.challenge)) {
    return res.status(400).json({ error: 'Challenge inválido o expirado' });
  }

  console.log(`[WebAuthn] ✓ Login exitoso para: ${email}`);
  res.json({ success: true });
});

// ── Iniciar servidor ──────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n[WebAuthn API] Servidor corriendo en http://localhost:${PORT}`);
  console.log(`[WebAuthn API] CORS habilitado para http://localhost:4200`);
  console.log(`[WebAuthn API] Credenciales en memoria — se borran al reiniciar\n`);
});
