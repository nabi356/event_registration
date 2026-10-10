import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import QRCode from 'qrcode';

/**
 * Outbound email for Eventra.
 *
 * Sending is entirely optional: with no SMTP settings present every function
 * degrades to a no-op that reports `sent: false`. That keeps registration and
 * check-in working on developer machines and in environments that have not
 * provisioned mail yet, instead of failing a user-facing action because of an
 * infrastructure concern.
 */

// Obsidian Glass palette, matching the app shell.
const INK = '#0B0F19';
const ACCENT = '#3B82F6';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';
const SURFACE = '#F8FAFC';

export interface RegistrationEmailInput {
  attendeeName: string;
  attendeeEmail: string;
  enrollmentNo: string;
  university: string;
  ticketId: string;
  seatTier: string;
  event: {
    name: string;
    category: string;
    venue: string;
    startTime: Date;
    endTime: Date;
  };
  /** Long-lived signed pass that the attendee scans at the gate. */
  passToken: string;
  passExpiresAt: Date;
}

export interface SendResult {
  sent: boolean;
  /** Present only when a send was attempted and failed. */
  error?: string;
  reason?: 'not_configured';
}

let transporter: Transporter | null = null;
let warned = false;

function env(name: string): string {
  return process.env[name]?.trim() || '';
}

export function isEmailConfigured(): boolean {
  return Boolean(env('SMTP_HOST') && env('SMTP_USER') && env('SMTP_PASS'));
}

function getTransporter(): Transporter | null {
  if (!isEmailConfigured()) return null;

  if (!transporter) {
    const port = Number(env('SMTP_PORT') || '587');
    const isImplicitTls = port === 465 || port === 2465;
    transporter = nodemailer.createTransport({
      host: env('SMTP_HOST'),
      port,
      // Implicit TLS on 465/2465; ports 587/2587 upgrade via STARTTLS.
      secure: isImplicitTls,
      tls: { servername: env('SMTP_HOST') },
      auth: { user: env('SMTP_USER'), pass: env('SMTP_PASS') },
      // Registration awaits this send for accurate feedback, so bound how long
      // a slow or unreachable SMTP server can hold the request open.
      connectionTimeout: 20_000,
      greetingTimeout: 20_000,
      socketTimeout: 30_000,
      logger: false,
    });
  }
  return transporter;
}

// Every interpolated value is attacker-influenced to some degree (event names
// and venues are free text typed by management), so escape before building HTML.
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatEventDate(start: Date, end: Date): string {
  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });

  if (start.toDateString() === end.toDateString()) {
    return `${dateFormatter.format(start)} &middot; ${timeFormatter.format(start)} &ndash; ${timeFormatter.format(end)}`;
  }
  return `${dateFormatter.format(start)} ${timeFormatter.format(start)} &rarr; ${dateFormatter.format(end)} ${timeFormatter.format(end)}`;
}

function detailRow(label: string, value: string): string {
  return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:12px;line-height:1.4;color:${MUTED};text-transform:uppercase;letter-spacing:0.6px;width:130px;vertical-align:top;">
            ${label}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;line-height:1.5;color:${INK};font-weight:600;">
            ${value}
          </td>
        </tr>`;
}

function buildHtml(input: RegistrationEmailInput, qrDataUrl: string): string {
  const { event, attendeeName, ticketId, seatTier, enrollmentNo, university, passExpiresAt } = input;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(event.name)} &mdash; you are registered</title>
  </head>
  <body style="margin:0;padding:0;background:${SURFACE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SURFACE};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-radius:16px;overflow:hidden;background:#FFFFFF;border:1px solid ${BORDER};">

            <!-- Header -->
            <tr>
              <td style="background:${INK};padding:28px 32px;">
                <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${ACCENT};font-weight:700;margin-bottom:6px;">
                  Eventra
                </div>
                <div style="font-size:22px;line-height:1.25;color:#FFFFFF;font-weight:700;margin:0;">
                  You&rsquo;re registered
                </div>
                <div style="font-size:13px;line-height:1.5;color:#94A3B8;margin:8px 0 0;">
                  Registration confirmed for ${escapeHtml(attendeeName)}.
                </div>
              </td>
            </tr>

            <!-- Event -->
            <tr>
              <td style="padding:28px 32px 8px;">
                <div style="font-size:18px;line-height:1.3;color:${INK};font-weight:700;margin:0 0 4px;">
                  ${escapeHtml(event.name)}
                </div>
                <div style="font-size:13px;color:${MUTED};margin:0;">
                  ${escapeHtml(event.category)}
                </div>
              </td>
            </tr>

            <!-- QR -->
            <tr>
              <td align="center" style="padding:20px 32px 8px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:12px;padding:20px;background:#FFFFFF;">
                  <tr>
                    <td align="center" style="padding:0 0 12px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:${MUTED};font-weight:700;">
                      Scan at the gate
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0;">
                      <img src="${qrDataUrl}" alt="Entry QR code" width="180" height="180" style="display:block;width:180px;height:180px;border:0;" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:12px 0 0;">
                      <div style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:12px;color:${INK};background:${SURFACE};border:1px dashed ${BORDER};border-radius:6px;padding:8px 12px;word-break:break-all;max-width:340px;">
                        ${escapeHtml(ticketId)}
                      </div>
                      <div style="font-size:11px;color:${MUTED};margin:8px 0 0;line-height:1.5;">
                        This pass is valid until
                        ${escapeHtml(new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(passExpiresAt))}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Details -->
            <tr>
              <td style="padding:20px 32px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${detailRow('Date &amp; time', formatEventDate(event.startTime, event.endTime))}
                  ${detailRow('Venue', escapeHtml(event.venue))}
                  ${detailRow('Attendee', escapeHtml(attendeeName))}
                  ${detailRow('Enrollment', escapeHtml(enrollmentNo))}
                  ${detailRow('Institution', escapeHtml(university))}
                  ${detailRow('Admission', escapeHtml(seatTier))}
                  ${detailRow('Ticket', escapeHtml(ticketId))}
                </table>
              </td>
            </tr>

            <!-- Note -->
            <tr>
              <td style="padding:20px 32px 8px;">
                <div style="font-size:13px;line-height:1.6;color:${MUTED};background:${SURFACE};border-left:3px solid ${ACCENT};border-radius:0 8px 8px 0;padding:14px 16px;">
                  Bring this QR with you &mdash; on your phone or printed. It is
                  tied to your account and to this event only, and is rejected
                  once the event has ended. You can also open the pass any time
                  from the Student Portal.
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px 32px;">
                <div style="font-size:11px;line-height:1.6;color:${MUTED};border-top:1px solid ${BORDER};padding-top:16px;">
                  Need to change something? Cancel from the Student Portal and
                  your ticket is released. This is an automated message &mdash;
                  please do not reply to it.
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildText(input: RegistrationEmailInput): string {
  const { event, attendeeName, ticketId, seatTier, enrollmentNo, university, passExpiresAt } = input;
  const plainDate = formatEventDate(event.startTime, event.endTime).replace(/&[a-z]+;/g, ' ');

  return [
    'You are registered for an Eventra event.',
    '',
    `Event:    ${event.name}`,
    `When:     ${plainDate}`,
    `Venue:    ${event.venue}`,
    `Attendee: ${attendeeName}`,
    `Enrollment: ${enrollmentNo}`,
    `Institution: ${university}`,
    `Admission: ${seatTier}`,
    `Ticket:   ${ticketId}`,
    '',
    'Your entry QR is attached to this email as an image. The text below is',
    'the same pass encoded in that QR — show either one at the gate.',
    '',
    `Pass token: ${input.passToken}`,
    `Valid until: ${passExpiresAt.toISOString()}`,
    '',
    'This pass is tied to your account and to this event only.',
  ].join('\n');
}

/**
 * Send the registration confirmation. Never throws: a mail failure must not
 * roll back a successful registration.
 */
export async function sendRegistrationConfirmation(
  input: RegistrationEmailInput
): Promise<SendResult> {
  const transport = getTransporter();

  if (!transport) {
    // Warn once per process so an unconfigured dev server stays readable.
    if (!warned) {
      warned = true;
      console.warn(
        '[mailer] SMTP not configured — skipping confirmation emails. ' +
          'Set SMTP_HOST, SMTP_USER and SMTP_PASS to enable.'
      );
    }
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(input.passToken, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 360,
      color: { dark: INK, light: '#FFFFFF' },
    });

    const from = env('MAIL_FROM') || `Eventra <${env('SMTP_USER')}>`;

    await transport.sendMail({
      from,
      to: input.attendeeEmail,
      replyTo: env('MAIL_REPLY_TO') || undefined,
      subject: `Your pass for ${input.event.name}`,
      text: buildText(input),
      html: buildHtml(input, qrDataUrl),
      // Long pass tokens must not be soft-wrapped by the receiving client.
      textEncoding: 'base64',
    });

    return { sent: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[mailer] Failed to send confirmation to ${input.attendeeEmail}:`, message);
    return { sent: false, error: message };
  }
}
