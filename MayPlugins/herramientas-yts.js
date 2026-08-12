const yts = require('yt-search');

module.exports = (bot) => {
  bot.onText(/^\/(ytsearch|ytbuscar|yts)(?:\s+(.*))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[2];

    if (!text) {
      return bot.sendMessage(chatId, `Por favor, ingresa una busqueda de YouTube.`, {
        reply_to_message_id: msg.message_id
      });
    }

    await bot.sendMessage(chatId, `Buscando en YouTube...`, {
      reply_to_message_id: msg.message_id
    });

    try {
      const results = await yts(text);
      const videos = results.videos.slice(0, 5);

      if (videos.length === 0) {
        return bot.sendMessage(chatId, `No se encontraron resultados para: *${text}*`, {
          parse_mode: "Markdown",
          reply_to_message_id: msg.message_id
        });
      }

      const msgResults = videos.map(v => {
        return `*${v.title}*
${v.author.name}
${v.timestamp}
${v.ago}
${v.views.toLocaleString()} vistas
${v.url}`;
      }).join('\n\n---------------\n\n');

      await bot.sendPhoto(chatId, videos[0].thumbnail, {
        caption: `*Resultados para:* _${text}_\n\n${msgResults}`,
        parse_mode: "Markdown"
      });

    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, `Error al buscar en YouTube.`, {
        reply_to_message_id: msg.message_id
      });
    }
  });
};
