import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';

const handler = async (m, { sock, text }) => {
  if (!text || !text.trim()) return m.reply('🔎 Ingresa un nombre de video o URL de YouTube');

  const from = m.key.remoteJid;
  await m.react('⏳'); // reacción de espera

  try {
    // ───── Ruta temporal ─────
    const tmpVideo = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);

    // ───── Usar yt-dlp para obtener video directo ─────
    await new Promise((resolve, reject) => {
      const ytdlp = spawn('yt-dlp', [
        '-f', 'best[ext=mp4]+bestaudio/best',
        '--merge-output-format', 'mp4',
        '-o', tmpVideo,
        text
      ]);

      ytdlp.stdout.on('data', () => {}); // ignorar stdout
      ytdlp.stderr.on('data', () => {}); // ignorar stderr
      ytdlp.on('close', code => code === 0 ? resolve() : reject(new Error('yt-dlp falló')));
    });

    if (!fs.existsSync(tmpVideo)) throw new Error('No se descargó el video');

    // ───── Obtener miniatura de YouTube ─────
    let thumbnailUrl = '';
    try {
      const infoProc = spawn('yt-dlp', ['--get-thumbnail', text]);
      let output = '';
      for await (const chunk of infoProc.stdout) output += chunk.toString();
      await new Promise(res => infoProc.on('close', res));
      thumbnailUrl = output.trim().split('\n')[0] || '';
    } catch {}

    let thumbBuffer;
    if (thumbnailUrl) {
      try {
        const res = await fetch(thumbnailUrl);
        thumbBuffer = await res.arrayBuffer();
      } catch {}
    }

    // ───── Enviar video con info ─────
    const caption = `
╭─[ 🎬 Reproducción YouTube ]─╮
│
│ 🔗 ${text}
╰─────────────────────╯
`;

    await sock.sendMessage(from, {
      video: fs.readFileSync(tmpVideo),
      caption,
      mimetype: 'video/mp4',
      fileName: 'video.mp4',
      ...(thumbBuffer ? { thumbnail: Buffer.from(thumbBuffer) } : {})
    }, { quoted: m });

    await m.react('✅'); // reacción de éxito

    // ───── Limpiar temporal ─────
    fs.unlinkSync(tmpVideo);

  } catch (e) {
    console.error('PLAY2 ERROR:', e);
    m.reply('❌ Ocurrió un error al procesar el video');
  }
};

handler.command = ['play2'];
handler.tags = ['descargas'];
handler.help = ['play2 <nombre o link>'];
handler.group = false;
handler.private = true;
handler.menu = true;

export default handler;
