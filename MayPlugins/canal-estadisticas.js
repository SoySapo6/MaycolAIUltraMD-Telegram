const axios = require('axios');

module.exports = (bot) => {
  bot.onText(/^\/estadisticas(?:\s+(@\S+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const canal = match[1];

    const objetivo = canal || msg.chat.username
      ? `@${msg.chat.username}`
      : msg.chat.id;

    try {
      const info = await bot.getChat(objetivo);
      const miembros = await bot.getChatMembersCount(info.id);

      bot.sendMessage(chatId, `*Estadisticas del Canal*

*Nombre:* ${info.title || info.username}
*Miembros:* ${miembros}`, {
        parse_mode: 'Markdown'
      });
    } catch (e) {
      console.error("[Error]", e);
      bot.sendMessage(chatId, `No pude obtener las estadisticas del canal ${canal || ''}. Verifica que el bot sea admin.`);
    }
  });
};
