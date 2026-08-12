module.exports = (bot) => {
  bot.onText(/^\/minijuego\s+(@\S+)/, async (msg, match) => {
    const canal = match[1];
    const chatId = msg.chat.id;

    const juegos = [
      {
        nombre: "Adivina la Palabra",
        descripcion: "Piensa una palabra secreta y los seguidores deben adivinarla letra por letra en los comentarios."
      },
      {
        nombre: "Numero Secreto",
        descripcion: "He pensado un numero entre 1 y 100. Quien lo adivina primero? Escribe tus intentos en los comentarios."
      },
      {
        nombre: "Trivia Express",
        descripcion: "Quien responde primero esta pregunta? Cual es la capital de Japon?\n(Responde en comentarios)"
      },
      {
        nombre: "Adivina la Cancion",
        descripcion: "Pondre la letra de una cancion famosa. Adivina cual es solo leyendo el primer verso:\n> 'Nunca pense que doliera el amor asi...'"
      },
      {
        nombre: "Emoji Challenge",
        descripcion: "Puedes describir esta pelicula solo con emojis?\nEjemplo: Interestelar\nComenta tu respuesta!"
      }
    ];

    const randomGame = juegos[Math.floor(Math.random() * juegos.length)];

    const texto = `
===================================
   *MINIJUEGO DEL DIA*
===================================

*${randomGame.nombre}*

${randomGame.descripcion}

Participa comentando en el canal.

===================================
`.trim();

    try {
      const canalInfo = await bot.getChat(canal);
      await bot.sendMessage(canalInfo.id, texto, {
        parse_mode: 'Markdown'
      });

      if (chatId !== canalInfo.id) {
        bot.sendMessage(chatId, `El minijuego fue enviado al canal ${canal}`);
      }

    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, `No pude enviar el minijuego a ${canal}. Verifica que el bot tenga permisos suficientes.`);
    }
  });
};
