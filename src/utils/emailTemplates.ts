/**
 * Genera el cuerpo del correo de bienvenida para usuarios PRO
 */
export const getWelcomeEmailTemplate = (firstName: string, planName: string, transactionId: string) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 40px; overflow: hidden; border: 1px solid #E2E8F0; }
        .header { background-color: #007BFF; padding: 40px; text-align: center; }
        .content { padding: 40px; color: #1E293B; }
        h1 { font-size: 24px; font-weight: 900; color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: -1px; }
        h2 { font-size: 20px; font-weight: 900; color: #0F172A; margin-top: 0; }
        p { color: #64748B; line-height: 1.6; font-size: 15px; }
        .plan-card { background-color: #F1F5F9; border-radius: 24px; padding: 25px; margin: 25px 0; border: 1px solid #E2E8F0; }
        .plan-label { color: #007BFF; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
        .plan-title { font-size: 24px; font-weight: 900; color: #0F172A; }
        .button-container { text-align: center; margin-top: 30px; }
        .button { background-color: #007BFF; color: #ffffff !important; padding: 18px 35px; border-radius: 18px; text-decoration: none; font-weight: 900; display: inline-block; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
        .footer { padding: 30px; text-align: center; background-color: #F8FAFC; font-size: 10px; color: #94A3B8; text-transform: uppercase; letter-spacing: 2px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>VitaMetra PRO</h1>
        </div>
        <div class="content">
          <h2>¡Excelente decisión, ${firstName}!</h2>
          <p>Tu acceso al nivel de inteligencia metabólica avanzada ha sido activado con éxito. Ya puedes comenzar a utilizar todas las funciones premium de la plataforma.</p>
          
          <div class="plan-card">
            <div class="plan-label">Suscripción Activa</div>
            <div class="plan-title">${planName}</div>
            <p style="margin: 8px 0 0 0; font-size: 11px; font-weight: bold; color: #94A3B8;">ID DE PAGO: #${transactionId}</p>
          </div>

          <p>Hemos desbloqueado para ti el análisis ilimitado, la proyección de HbA1c y los reportes detallados para tu médico.</p>
          
          <div class="button-container">
            <a href="https://vitametras.com/analyzer" class="button">Ir al Analizador</a>
          </div>
        </div>
        <div class="footer">
          © 2026 VitaMetra Health Intelligence • Acceso Seguro
        </div>
      </div>
    </body>
    </html>
  `;
};
