import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * WebAuthnService
 * ─────────────────────────────────────────────────────────────────────────────
 * SEGURIDAD — ¿Por qué la huella NUNCA llega al servidor?
 *
 *  1. El servidor genera un "challenge" aleatorio de 32 bytes.
 *  2. El navegador lo entrega al TPM / Secure Enclave del dispositivo.
 *  3. Windows Hello o Touch ID verifica la huella LOCALMENTE en el chip seguro.
 *  4. Si coincide, el TPM FIRMA el challenge con la LLAVE PRIVADA del usuario.
 *     Esa llave NUNCA puede exportarse ni salir del chip.
 *  5. El navegador devuelve únicamente la FIRMA + datos públicos.
 *  6. El servidor verifica la firma con la LLAVE PÚBLICA almacenada.
 *
 *  → Solo viajan bytes de firma por la red. La huella permanece en el dispositivo.
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Injectable({ providedIn: 'root' })
export class WebAuthnService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http       = inject(HttpClient);
  private readonly API        = '/api/webauthn';

  /**
   * Detecta si el navegador y el dispositivo soportan autenticación
   * biométrica de plataforma (Windows Hello, Touch ID, etc.)
   */
  async isSupported(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;
    if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  /**
   * REGISTRO BIOMÉTRICO
   *
   * Paso 1 → Solicita opciones + challenge al servidor.
   * Paso 2 → El navegador convierte el challenge a ArrayBuffer (formato WebAuthn).
   * Paso 3 → El SO muestra el diálogo de huella y el TPM genera el par de llaves.
   * Paso 4 → Enviamos el credentialId y la respuesta al servidor para guardarla.
   *
   * @throws Error si el usuario cancela o el dispositivo no tiene biometría.
   */
  async register(email: string, displayName: string): Promise<void> {
    // ── Paso 1: Obtener opciones del servidor ──────────────────────────────
    const options = await firstValueFrom(
      this.http.post<any>(`${this.API}/register-challenge`, { email, displayName })
    );

    // ── Paso 2: Convertir strings base64url → ArrayBuffer ─────────────────
    // La WebAuthn API requiere ArrayBuffer; el servidor devuelve base64url.
    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge: this.base64urlToBuffer(options.challenge),
      rp: options.rp,
      user: {
        id:          this.base64urlToBuffer(options.user.id),
        name:        options.user.name,
        displayName: options.user.displayName,
      },
      pubKeyCredParams:       options.pubKeyCredParams,
      authenticatorSelection: options.authenticatorSelection,
      timeout:                options.timeout,
      attestation:            options.attestation,
    };

    // ── Paso 3: El SO pide la huella; el TPM crea el par de llaves ─────────
    const credential = await navigator.credentials.create(
      { publicKey: publicKeyOptions }
    ) as PublicKeyCredential;

    const attestation = credential.response as AuthenticatorAttestationResponse;

    // ── Paso 4: Enviar respuesta al servidor para verificación y guardado ──
    await firstValueFrom(
      this.http.post(`${this.API}/register-verify`, {
        email,
        credentialId:      this.bufferToBase64url(credential.rawId),
        clientDataJSON:    this.bufferToBase64url(attestation.clientDataJSON),
        attestationObject: this.bufferToBase64url(attestation.attestationObject),
      })
    );
  }

  /**
   * LOGIN BIOMÉTRICO
   *
   * Paso 1 → Solicita challenge + credentialId al servidor (por email).
   * Paso 2 → El navegador pide la huella al SO.
   * Paso 3 → El TPM FIRMA el challenge con la llave privada del usuario.
   * Paso 4 → El servidor verifica que la firma sea válida.
   *
   * @returns true si el login fue exitoso.
   * @throws NotAllowedError si el usuario cancela o la huella no coincide.
   */
  async login(email: string): Promise<boolean> {
    // ── Paso 1: Obtener challenge + credentialId ───────────────────────────
    let options: { challenge: string; credentialId: string };
    try {
      options = await firstValueFrom(
        this.http.post<any>(`${this.API}/login-challenge`, { email })
      );
    } catch {
      return false; // Usuario sin huella registrada (404 del servidor)
    }

    if (!options?.credentialId) return false;

    // ── Paso 2: Construir opciones con ArrayBuffers ────────────────────────
    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge: this.base64urlToBuffer(options.challenge),
      allowCredentials: [{
        type:       'public-key',
        id:         this.base64urlToBuffer(options.credentialId),
        transports: ['internal'], // 'internal' = autenticador del dispositivo
      }],
      userVerification: 'required', // La biometría es OBLIGATORIA
      timeout:          60000,
    };

    // ── Paso 3: El SO muestra el diálogo de huella ─────────────────────────
    const assertion = await navigator.credentials.get(
      { publicKey: publicKeyOptions }
    ) as PublicKeyCredential;

    const assertionResp = assertion.response as AuthenticatorAssertionResponse;

    // ── Paso 4: El servidor verifica la firma criptográfica ────────────────
    const result = await firstValueFrom(
      this.http.post<{ success: boolean }>(`${this.API}/login-verify`, {
        email,
        credentialId:      this.bufferToBase64url(assertion.rawId),
        clientDataJSON:    this.bufferToBase64url(assertionResp.clientDataJSON),
        authenticatorData: this.bufferToBase64url(assertionResp.authenticatorData),
        signature:         this.bufferToBase64url(assertionResp.signature),
      })
    );

    return result?.success ?? false;
  }

  // ─── Utilidades de conversión ArrayBuffer ↔ base64url ────────────────────

  /** ArrayBuffer → base64url  (sin padding '=', con '-' y '_') */
  bufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => (binary += String.fromCharCode(b)));
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /** base64url → ArrayBuffer */
  base64urlToBuffer(base64url: string): ArrayBuffer {
    const base64  = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded  = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const binary  = atob(padded);
    const bytes   = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
}
