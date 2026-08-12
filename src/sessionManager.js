const TelegramBot = require('Telegram');
const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = path.join(__dirname, 'Sessions');
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

const pluginsPath = path.join(__dirname, 'Commands');

const bots = {};

function loadPlugins(bot) {
  fs.readdirSync(pluginsPath).forEach(file => {
    const handler = require(path.join(pluginsPath, file));
    if (typeof handler === 'function') {
      handler(bot);
    }
  });
}

function loadBot(token) {
  if (bots[token]) return bots[token];

  const bot = new TelegramBot(token, { polling: true });
  bots[token] = bot;

  const sessionPath = path.join(SESSIONS_DIR, `${token}.json`);
  fs.writeFileSync(sessionPath, JSON.stringify({ token, startedAt: Date.now() }, null, 2));

  loadPlugins(bot);

  bot.on('polling_error', (err) => {
    console.error(`[${token}] Error:`, err.message);
  });

  return bot;
}

function isActive(token) {
  return bots[token] !== undefined;
}

module.exports = {
  loadBot,
  isActive,
};
