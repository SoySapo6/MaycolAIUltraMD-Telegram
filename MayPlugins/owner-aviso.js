module.exports = (bot) => {
  const OWNER_ID = 7675783113;
  const CHANNEL_ID = '@soymaycol';

  bot.onText(/^\/aviso(?:\s+)?([\s\S]*)/i, async (msg, match) => {
    const userId = msg.from.id;

    if (userId !== OWNER_ID) {
      return bot.sendMessage(msg.chat.id, 'Este comando es exclusivo para el owner.', {
        reply_to_message_id: msg.message_id
      });
    }

    const contenido = match[1]?.trim();
    if (!contenido) {
      return bot.sendMessage(msg.chat.id, 'Escribe el mensaje del aviso despues del comando. Ejemplo:\n\n`/aviso Se viene actualizacion!`', {
        reply_to_message_id: msg.message_id,
        parse_mode: 'Markdown'
      });
    }

    const decorado = `
===================================
       *AVISO OFICIAL*
===================================

*Mensaje:*
${contenido}

*Publicado:* ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}

*Enviado por:* Pyl

===================================
`.trim();

    try {
      await bot.sendMessage(CHANNEL_ID, decorado, {
        parse_mode: 'Markdown'
      });

      await bot.sendMessage(msg.chat.id, 'Aviso enviado con exito al canal.', {
        reply_to_message_id: msg.message_id
      });
    } catch (err) {
      console.error('[Error enviando aviso]', err);
      await bot.sendMessage(msg.chat.id, 'Ocurrio un error al enviar el aviso al canal.', {
        reply_to_message_id: msg.message_id
      });
    }
  });
};
