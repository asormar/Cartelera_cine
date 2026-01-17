import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true para port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function generateNewsletterHTML(films) {
    const filmCards = films.map(film => `
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; background: #fff;">
            <h2 style="color: #e50914; margin-top: 0;">${film.title}</h2>
            
            <div style="margin: 15px 0;">
                <h3 style="color: #333; font-size: 16px;">📝 Sinopsis:</h3>
                <p style="color: #666; line-height: 1.6;">${film.sinopsis}</p>
            </div>
            
            <div style="margin: 15px 0;">
                <h3 style="color: #333; font-size: 16px;">📅 Horarios disponibles:</h3>
                ${film.Days.map((day, index) => {
                    const dayKey = Object.keys(day)[0]; // dayKey = "tabs-1"

                    const dayValue = day[dayKey]; // dayValue = "Lunes 20 de Enero"
                    
                    const hours = film.Hours.hoursText[index] ? // Find the right dates
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
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎬 Cartelera de Cine</h1>
                    <p style="color: #fff; margin: 10px 0 0 0; opacity: 0.9;">Tu resumen semanal de películas</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 20px;">
                    <p style="color: #333; font-size: 16px;">¡Hola! 👋</p>
                    <p style="color: #666; line-height: 1.6;">
                        Aquí está la cartelera actualizada con las películas disponibles y sus horarios.
                    </p>
                    
                    ${filmCards}
                    
                    <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center;">
                        <p style="color: #666; margin: 0;">¡Disfruta tu película! 🍿</p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #333; padding: 20px; text-align: center;">
                    <p style="color: #999; margin: 0; font-size: 12px;">
                        Newsletter generada automáticamente • ${new Date().toLocaleDateString('es-ES')}
                    </p>
                </div>
                
            </div>
        </body>
        </html>
    `;
}