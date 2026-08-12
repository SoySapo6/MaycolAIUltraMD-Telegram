const fs = require('fs');
const path = require('path');

module.exports = (bot) => {
  bot.onText(/Menu Completo/, async (msg) => {
    const chatId = msg.chat.id;
    const pluginsPath = path.join(__dirname);
    const categorias = {};

    fs.readdirSync(pluginsPath).forEach(file => {
      if (!file.endsWith('.js') || file === 'main-menucompleto.js') return;

      const fileName = file.replace('.js', '');
      const [tag, comando] = fileName.split('-');

      if (!tag || !comando) return;

      if (!categorias[tag]) categorias[tag] = [];
      categorias[tag].push(`/${comando}`);
    });

    if (Object.keys(categorias).length === 0) {
      return bot.sendMessage(chatId, 'No se encontraron comandos disponibles.');
    }

    let lista = '';
    for (const tag in categorias) {
      lista += `\n*${tag.toUpperCase()}*\n`;
      lista += categorias[tag].map(cmd => `  ${cmd}`).join('\n') + '\n';
    }

    const menu = `
===================================
   *MENU DE COMANDOS - PYL*
===================================

${lista}

===================================
  Desarrollado por Zyn
===================================
`;

    await bot.sendMessage(chatId, menu, {
      parse_mode: 'Markdown'
    });
  });
};
