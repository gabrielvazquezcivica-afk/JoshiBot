// anime-info.js 🎌 | JOSHI-BOT

export const handler = async (m, { sock, from, args, reply, isGroup }) => {

  const anime = args[0] || 'naruto'
  const episodio = args[1] || '1'

  const texto = `
╭──〔 🎬 ANIME INFO 〕──╮
│ 🎌 Anime: ${anime}
│ 📺 Episodio: ${episodio}
│ 🌐 Fuente: AnimeFLV
│ ⭐ Calidad: HD
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

  await sock.sendMessage(
    from,
    {
      text: texto,
      footer: 'Selecciona una opción 👇',
      buttons: [
        {
          buttonId: `.veranime ${anime} ${episodio}`,
          buttonText: { displayText: '▶️ Ver Video' },
          type: 1
        },
        {
          buttonId: `.animelink ${anime} ${episodio}`,
          buttonText: { displayText: '🔗 Ver Link' },
          type: 1
        }
      ],
      headerType: 1
    },
    { quoted: m }
  )
}

handler.command = ['animeinfo', 'veranimeinfo']
handler.help = ['animeinfo <anime> <episodio>']
handler.tags = ['descargas']
handler.menu = true
handler.group = true

export default handler
