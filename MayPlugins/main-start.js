const moment = require('moment-timezone');

module.exports = (bot) => {
  bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id;
    const nombre = msg.from.first_name;

    const hora = moment().tz('America/Lima').hour();
    let saludo;
    if (hora >= 5 && hora < 12) saludo = 'Buenos dias';
    else if (hora >= 12 && hora < 18) saludo = 'Buenas tardes';
    else saludo = 'Buenas noches';

    const imagen = 'https://files.catbox.moe/ck08jl.jpeg';

    const mensaje = `
===================================
   ${saludo}, *${nombre}*
===================================

Bienvenido a *Pyl*
Un bot de Telegram con multiples funciones.

-----------------------------------
  Creador: *Zyn*
  Bot: *Pyl*
  Version: 1.0.0
-----------------------------------

Usa los botones para navegar por las opciones disponibles.
`;

    const teclado = {
      reply_markup: {
        keyboard: [
          [{ text: "Menu Completo" }],
          [{ text: "Staff" }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      },
      parse_mode: "Markdown"
    };

    await bot.sendPhoto(chatId, imagen, {
      caption: mensaje,
      ...teclado
    });
  });
};
