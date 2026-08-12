const yts = require("yt-search");
const { yta } = require("@soymaycol/maytube");

module.exports = (bot) => {
  bot.onText(/^\/playaudio (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const text = match[1];

    if (!text) return bot.sendMessage(chatId, "Ingresa un nombre o URL de YouTube.");

    bot.sendMessage(chatId, "Buscando en YouTube...");

    try {
      const res = await yts(text);
      const video = res?.all?.[0];

      if (!video) return bot.sendMessage(chatId, "No se encontro ningun video.");

      const info = `*${video.title}*
Canal: ${video.author?.name || "Desconocido"}
Duracion: ${video.duration?.timestamp || "?"}
Vistas: ${video.views || "?"}

Descargando audio...`;

      if (video.thumbnail) {
        await bot.sendPhoto(chatId, video.thumbnail, { caption: info, parse_mode: "Markdown" });
      } else {
        await bot.sendMessage(chatId, info, { parse_mode: "Markdown" });
      }

      const api = await yta(video.url);
      if (!api?.result?.download) throw new Error("No se pudo obtener el enlace de audio.");

      await bot.sendAudio(chatId, api.result.download, {
        filename: `${video.title.replace(/[^\w\s]/gi, "")}.mp3`,
        caption: `*${api.result.title || video.title}*`,
        parse_mode: "Markdown"
      });

    } catch (err) {
      console.error("Error:", err);
      bot.sendMessage(chatId, `Error:\n${err.message}`);
    }
  });
};
