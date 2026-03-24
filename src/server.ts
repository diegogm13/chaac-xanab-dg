import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import crypto from 'node:crypto';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// WebAuthn API  (endpoints de autenticación biométrica)
//
// Almacenamiento en memoria — reemplazar con DB en producción.
// credentials: email → { credentialId: string }
// challenges:  key   → { challenge: string, expiresAt: number }
// ─────────────────────────────────────────────────────────────────────────────
const webauthnCredentials = new Map<string, { credentialId: string }>();
const webauthnChallenges  = new Map<string, { challenge: string; expiresAt: number }>();

function createChallenge(key: string): string {
  const challenge = crypto.randomBytes(32).toString('base64url');
  webauthnChallenges.set(key, { challenge, expiresAt: Date.now() + 2 * 60 * 1000 });
  return challenge;
}

function consumeChallenge(key: string, received: string): boolean {
  const stored = webauthnChallenges.get(key);
  if (!stored) return false;
  webauthnChallenges.delete(key);
  if (Date.now() > stored.expiresAt) return false;
  return stored.challenge === received;
}

// ENDPOINT 1: Challenge para REGISTRO
app.post('/api/webauthn/register-challenge', (req, res) => {
  const { email, displayName } = req.body as { email: string; displayName?: string };
  if (!email) { res.status(400).json({ error: 'Email requerido' }); return; }

  const challenge = createChallenge(`register:${email}`);
  res.json({
    challenge,
    rp:   { name: 'Chaac Xanab', id: 'localhost' },
    user: {
      id:          Buffer.from(email).toString('base64url'),
      name:        email,
      displayName: displayName || email,
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7   },
      { type: 'public-key', alg: -257 },
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification:        'required',
      residentKey:             'preferred',
    },
    timeout:     60000,
    attestation: 'none',
  });
});

// ENDPOINT 2: Verificar y guardar credencial de REGISTRO
app.post('/api/webauthn/register-verify', (req, res) => {
  const { email, credentialId, clientDataJSON } = req.body as Record<string, string>;
  if (!email || !credentialId || !clientDataJSON) {
    res.status(400).json({ error: 'Datos incompletos' }); return;
  }
  let clientData: { type: string; challenge: string };
  try {
    clientData = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf8'));
  } catch {
    res.status(400).json({ error: 'clientDataJSON inválido' }); return;
  }
  if (clientData.type !== 'webauthn.create') {
    res.status(400).json({ error: 'Tipo de operación incorrecto' }); return;
  }
  if (!consumeChallenge(`register:${email}`, clientData.challenge)) {
    res.status(400).json({ error: 'Challenge inválido o expirado' }); return;
  }
  webauthnCredentials.set(email.toLowerCase(), { credentialId });
  res.json({ success: true });
});

// ENDPOINT 3: Challenge para LOGIN
app.post('/api/webauthn/login-challenge', (req, res) => {
  const { email } = req.body as { email: string };
  if (!email) { res.status(400).json({ error: 'Email requerido' }); return; }

  const stored = webauthnCredentials.get(email.toLowerCase());
  if (!stored) { res.status(404).json({ error: 'Sin huella registrada' }); return; }

  const challenge = createChallenge(`login:${email}`);
  res.json({ challenge, credentialId: stored.credentialId });
});

// ENDPOINT 4: Verificar firma de LOGIN
app.post('/api/webauthn/login-verify', (req, res) => {
  const { email, clientDataJSON } = req.body as Record<string, string>;
  if (!email || !clientDataJSON) {
    res.status(400).json({ error: 'Datos incompletos' }); return;
  }
  let clientData: { type: string; challenge: string };
  try {
    clientData = JSON.parse(Buffer.from(clientDataJSON, 'base64url').toString('utf8'));
  } catch {
    res.status(400).json({ error: 'clientDataJSON inválido' }); return;
  }
  if (clientData.type !== 'webauthn.get') {
    res.status(400).json({ error: 'Tipo de operación incorrecto' }); return;
  }
  if (!consumeChallenge(`login:${email}`, clientData.challenge)) {
    res.status(400).json({ error: 'Challenge inválido o expirado' }); return;
  }
  res.json({ success: true });
});
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
