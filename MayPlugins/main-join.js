module.exports = (bot) => {
  bot.onText(/^\/join$/, async (msg) => {
    const chatId = msg.chat.id;
    const botUsername = (await bot.getMe()).username;

    const url = `https://t.me/${botUsername}?startgroup=true`;

    bot.sendMessage(chatId, `Agrega a *Pyl* a tu grupo:`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[
          { text: "Invitar a un grupo", url }
        ]]
      }
    });
  });
};
