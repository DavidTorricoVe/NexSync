import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export function getFromAddress(): string {
  return (
    process.env.RESEND_FROM ??
    "NexSync <onboarding@resend.dev>"
  );
}

export function getPlatformEmail(): string {
  return process.env.PLATFORM_EMAIL ?? "facturacion@recursolink.sc";
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
