import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function generateNewsletterHTML(films) {
    const filmCards = films.map(film => `
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; background: #fff;">
            <h2 style="color: #e50914; margin-top: 0;">${film.title}</h2>
            
            <!-- Póster de la película -->
            <div style="margin: 15px 0; text-align: center;">
                ${film.poster ? 
                    `<img src="${film.poster}" alt="${film.title}" style="max-width: 300px; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">` 
                    : '<p style="color: #999; font-style: italic;">Póster no disponible</p>'}
            </div>
            
            <div style="margin: 15px 0;">
                <h3 style="color: #333; font-size: 16px;">📅 Horarios disponibles:</h3>
                ${film.Days.map((day, index) => {
                    const dayKey = Object.keys(day)[0];
                    const dayValue = day[dayKey];
                    
                    const hours = film.Hours.hoursText[index] ? 
                        Object.values(film.Hours.hoursText[index])[0] : [];
                    
                    return `
                        <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                            <strong style="color: #e50914;">${dayValue}</strong>
                            <div style="margin-top: 5px;">
                                ${hours.length > 0 ? 
                                    hours.map(h => `<span style="display: inline-block; background: #fff; padding: 5px 10px; margin: 3px; border-radius: 4px; border: 1px solid #ddd;">${h}</span>`).join('') 
                                    : '<em>No hay horarios disponibles</em>'}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; background: #f0f0f0; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #e50914 0%, #b20710 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎬 Cartelera ABC Park</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 20px;">
                    <p style="color: #333; font-size: 16px;">¡Hola buenas!</p>
                    <p style="color: #666; line-height: 1.6;">
                        Aquí tienes el resumen de esta semana de las películas disponibles en el ABC Park de Valencia.
                    </p>
                    
                    ${filmCards}
                    
                    <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center;">
                        <p style="color: #666; margin: 0;">¡Disfruta tu película! 🍿</p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #333; padding: 20px; text-align: center;">
                    <p style="color: #999; margin: 0; font-size: 12px;">
                        ${new Date().toLocaleDateString('es-ES')}
                    </p>
                </div>
                
            </div>
        </body>
        </html>
    `;
}

export async function sendNewsletter(filmsData) {
    const htmlContent = generateNewsletterHTML(filmsData);

    const mailOptions = {
        from: `"Cartelera de Cine 🎬" <${process.env.EMAIL_USER}>`,
        to: process.env.RECIPIENT_EMAIL,
        subject: `🎬 Cartelera actualizada - ${new Date().toLocaleDateString('es-ES')}`,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Newsletter enviada exitosamente!');
        console.log('Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error enviando newsletter:', error);
        return { success: false, error: error.message };
    }
}