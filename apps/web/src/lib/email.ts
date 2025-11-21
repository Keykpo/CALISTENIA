import nodemailer from 'nodemailer';

// Check if we're in development mode without SMTP configured
const isDevelopment = process.env.NODE_ENV === 'development';
const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

export function createTransport() {
  // In development without SMTP, use ethereal (fake SMTP for testing)
  if (isDevelopment && !hasSmtpConfig) {
    console.log('📧 SMTP not configured - emails will be logged to console');
    return null;
  }

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

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export async function sendMail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; preview?: string }> {
  const from = options.from || process.env.SMTP_FROM || 'Calisthenics Platform <no-reply@calisthenics.app>';

  // Development mode without SMTP - log to console
  if (isDevelopment && !hasSmtpConfig) {
    console.log('\n📧 ===== EMAIL (Development Mode) =====');
    console.log(`To: ${options.to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${options.subject}`);
    console.log('------- Content -------');
    console.log(options.text || options.html?.replace(/<[^>]*>/g, ' ').trim());
    console.log('===== END EMAIL =====\n');

    return {
      success: true,
      messageId: `dev-${Date.now()}`,
      preview: 'Email logged to console (development mode)'
    };
  }

  try {
    const transporter = createTransport();
    if (!transporter) {
      throw new Error('Failed to create email transporter');
    }

    const result = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`📧 Email sent successfully to ${options.to} (ID: ${result.messageId})`);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error('📧 Failed to send email:', error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  resetPassword: (resetUrl: string) => ({
    subject: 'Restablecer tu contraseña - Calisthenics Platform',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Calisthenics Platform</h1>
          </div>
          <div class="content">
            <h2>Restablecer Contraseña</h2>
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </p>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; font-size: 12px; color: #666;">${resetUrl}</p>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste esto, puedes ignorar este email de forma segura.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Calisthenics Platform. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Restablecer tu contraseña - Calisthenics Platform

Hola,

Recibimos una solicitud para restablecer tu contraseña. Visita el siguiente enlace para crear una nueva:

${resetUrl}

Este enlace expirará en 1 hora.

Si no solicitaste esto, puedes ignorar este email de forma segura.

— Calisthenics Platform
    `.trim(),
  }),

  welcome: (username: string) => ({
    subject: 'Bienvenido a Calisthenics Platform',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido!</h1>
          </div>
          <div class="content">
            <h2>Hola ${username},</h2>
            <p>¡Gracias por unirte a Calisthenics Platform! Estamos emocionados de tenerte.</p>
            <h3>Lo que puedes hacer:</h3>
            <div class="feature">💪 Completar tu evaluación inicial para personalizar tu entrenamiento</div>
            <div class="feature">🎯 Seguir misiones diarias y ganar XP</div>
            <div class="feature">📈 Trackear tu progreso con el sistema de hexágono</div>
            <div class="feature">🏆 Desbloquear achievements y subir de nivel</div>
            <p style="margin-top: 20px;">¡Comienza tu viaje hacia una mejor versión de ti mismo!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Calisthenics Platform. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
¡Bienvenido a Calisthenics Platform!

Hola ${username},

¡Gracias por unirte! Estamos emocionados de tenerte.

Lo que puedes hacer:
- Completar tu evaluación inicial
- Seguir misiones diarias y ganar XP
- Trackear tu progreso con el hexágono
- Desbloquear achievements

¡Comienza tu viaje hacia una mejor versión de ti mismo!

— Calisthenics Platform
    `.trim(),
  }),
};