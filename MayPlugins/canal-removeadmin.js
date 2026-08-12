module.exports = (bot) => {
  bot.onText(/^\/removeadmin\s+(@\S+)\s*\|\s*(@\S+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const canal = match[1];
    const usuario = match[2];

    try {
      const canalInfo = await bot.getChat(canal);
      const userInfo = await bot.getChatMember(canal, usuario);
      const userId = userInfo.user.id;

      await bot.promoteChatMember(canalInfo.id, userId, {
        can_change_info: false,
        can_post_messages: false,
        can_edit_messages: false,
        can_delete_messages: false,
        can_invite_users: false,
        can_restrict_members: false,
        can_pin_messages: false,
        can_promote_members: false,
        is_anonymous: false,
      });

      bot.sendMessage(chatId, `Se removio a ${usuario} como admin del canal ${canal}`);
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, `No pude quitar a ${usuario} como admin de ${canal}. Verifica que tenga permisos suficientes.`);
    }
  });
};
