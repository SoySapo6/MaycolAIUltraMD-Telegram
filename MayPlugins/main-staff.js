module.exports = (bot) => {
  bot.onText(/Staff/, (msg) => {
    const chatId = msg.chat.id;

    const caption = `*Pyl - Staff Oficial*

Desarrollado y mantenido por:
  Creador: [Zyn](https://github.com/toZyn)
  Repositorio: [GitHub](https://github.com/toZyn)

Comando solicitado por: ${msg.from.first_name || "usuario"}
`;

    bot.sendMessage(chatId, caption, {
      parse_mode: 'Markdown',
    });
  });
};
