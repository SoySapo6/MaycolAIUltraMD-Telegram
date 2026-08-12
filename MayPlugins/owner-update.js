const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

global._registeredPlugins = global._registeredPlugins || {};

module.exports = (bot) => {
  bot.onText(/^\/update$/, async (msg) => {
    const chatId = msg.chat.id;

    if (msg.from.id !== 7675783113) {
      return bot.sendMessage(chatId, 'Solo el creador puede actualizar el bot.');
    }

    bot.sendMessage(chatId, 'Actualizando y reiniciando...');

    exec('git pull', async (err, stdout, stderr) => {
      if (err) {
        return bot.sendMessage(chatId, `Error en git pull:\n${stderr}`);
      }

      await bot.sendMessage(chatId, `Bot actualizado con exito. Reiniciando...`);

      const entryFile = process.argv[1];
      exec(`node ${entryFile}`);

      process.exit(0);
    });
  });
};
