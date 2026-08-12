module.exports = (bot) => {
  bot.onText(/^\/addadmin\s+(@\S+)\s*\|\s*(@\S+)/, async (msg, match) => {
    const canal = match[1];
    const usuario = match[2];
    const chatId = msg.chat.id;

    try {
      const canalInfo = await bot.getChat(canal);
      const userInfo = await bot.getChatMember(canalInfo.id, usuario);
      const userId = userInfo.user.id;

      await bot.promoteChatMember(canalInfo.id, userId, {
        can_post_messages: true,
        can_edit_messages: true,
        can_delete_messages: true,
        can_invite_users: true,
        can_change_info: true,
        can_pin_messages: true,
        can_promote_members: false,
        is_anonymous: false
      });

      await bot.sendMessage(chatId, `El usuario [${userInfo.user.first_name}](tg://user?id=${userId}) ha sido promovido como admin en ${canal}`, {
        parse_mode: 'Markdown'
      });

    } catch (err) {
      console.error('[AddAdmin Error]', err);
      const errorMsg = err.response?.body?.description || err.message;

      if (
        errorMsg.includes("not enough rights") ||
        errorMsg.includes("can't promote chat member")
      ) {
        return bot.sendMessage(chatId, `No tengo permisos suficientes para hacer eso en *${canal}*`, {
          parse_mode: 'Markdown'
        });
      }

      bot.sendMessage(chatId, `Error inesperado: \`${errorMsg}\``, {
        parse_mode: 'Markdown'
      });
    }
  });
};
