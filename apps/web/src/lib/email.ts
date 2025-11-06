import nodemailer from 'nodemailer';

export function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing. Please set SMTP_HOST, SMTP_USER, SMTP_PASS');
  }

  const secure = process.env.SMTP_SECURE === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendMail(options: { to: string; subject: string; html?: string; text?: string; from?: string; }) {
  const transporter = createTransport();
  const from = options.from || process.env.SMTP_FROM || 'no-reply@calisthenics-platform.local';

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}