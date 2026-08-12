const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");
const fetch = require("node-fetch");

const streamPipeline = promisify(pipeline);
const LIMIT_MB = 100;

module.exports = (bot) => {
  bot.onText(/^\/tiktok (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];

    if (!url || !url.includes("tiktok.com")) {
      return bot.sendMessage(chatId, "Pasa un enlace valido de TikTok.");
    }

    bot.sendMessage(chatId, "Descargando video de TikTok...");

    try {
      const apiUrl = `https://nightapi.is-a.dev/api/tiktok?url=${encodeURIComponent(url)}`;

      let sizemb = 0;
      let isValidUrl = false;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const headRes = await fetch(apiUrl, {
          method: "HEAD",
          headers: {
            'User-Agent': 'Mozilla/5.0'
          },
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (headRes.ok) {
          isValidUrl = true;
          const length = headRes.headers.get("content-length");
          sizemb = length ? parseInt(length) / (1024 * 1024) : 0;
        }
      } catch (e) {
        console.log("Error al verificar URL:", e.message);
      }

      if (!isValidUrl) {
        return bot.sendMessage(chatId, "La URL no es valida o el video no esta disponible.");
      }

      if (sizemb > LIMIT_MB && sizemb > 0) {
        return bot.sendMessage(chatId, `El video pesa ${sizemb.toFixed(2)} MB. Limite: ${LIMIT_MB} MB. Usa otro video.`);
      }

      const filename = `tiktok_${Date.now()}.mp4`;
      const filepath = path.resolve(__dirname, "temp", filename);

      fs.mkdirSync(path.dirname(filepath), { recursive: true });

      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        },
        redirect: 'follow'
      });

      if (!response.ok) throw new Error(`Error al descargar video: ${response.status}`);

      await streamPipeline(response.body, fs.createWriteStream(filepath));

      await bot.sendVideo(chatId, filepath, {
        caption: "Aqui tienes tu TikTok.",
        supports_streaming: true
      });

      fs.unlinkSync(filepath);

    } catch (err) {
      console.error("Error general:", err);

      if (err.message.includes("ETELEGRAM")) {
        bot.sendMessage(chatId, "Telegram no pudo procesar el video. Puede estar daniado.");
      } else if (err.message.includes("timeout")) {
        bot.sendMessage(chatId, "Tiempo de espera agotado, el servidor no respondio.");
      } else if (err.message.includes("403") || err.message.includes("forbidden")) {
        bot.sendMessage(chatId, "Acceso denegado al video.");
      } else {
        bot.sendMessage(chatId, `Error: ${err.message}`);
      }
    }
  });
};
