module.exports = (bot) => {
  bot.onText(/^\/encuesta\s+(@\S+)\s*\|\s*(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const canal = match[1];
    const pregunta = match[2];

    if (!canal || !pregunta) {
      return bot.sendMessage(chatId, `Usa el comando asi:\n/encuesta @Canal | Te gusta el bot?`);
    }

    try {
      await bot.sendPoll(canal, `*Encuesta de la Comunidad*\n\n${pregunta}`, ['Si', 'No', 'Tal vez'], {
        is_anonymous: false,
        allows_multiple_answers: false,
        parse_mode: 'Markdown'
      });

      bot.sendMessage(chatId, `Encuesta enviada correctamente a ${canal}`);

    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, `No pude enviar la encuesta a ${canal}. Verifica que el bot sea admin o tenga permisos para enviar encuestas.`);
    }
  });
};
