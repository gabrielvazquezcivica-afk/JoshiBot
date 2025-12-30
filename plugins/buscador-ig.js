import axios from 'axios'

// 📸 Obtener datos del perfil usando Mollygram
const obtenerPerfilMollygram = async (usuario) => {
  const { data } = await axios.get(
    `https://media.mollygram.com/?url=${encodeURIComponent(usuario)}`,
    {
      headers: {
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'es-ES,es;q=0.9',
        'origin': 'https://mollygram.com',
        'referer': 'https://mollygram.com/',
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
      }
    }
  )

  const html = data.html

  const extraerDato = (regex) =>
    html.match(regex)?.[1]?.trim() || '❌ No disponible'

  const fotoPerfil =
    html.match(/<img[^>]*class="[^"]*rounded-circle[^"]*"[^>]*src="([^"]+)"/i)?.[1] ||
    html.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*rounded-circle[^"]*"/i)?.[1] ||
    null

  return {
    usuario: extraerDato(/<h4 class="mb-0">([^<]+)<\/h4>/),
    nombreCompleto: extraerDato(/<p class="text-muted">([^<]+)<\/p>/),
    biografia: extraerDato(/<p class="text-dark"[^>]*>([^<]+)<\/p>/),
    fotoPerfil,
    publicaciones: extraerDato(/posts<\/div>\s*<\/div>\s*<span[^>]*>([^<]+)</i),
    seguidores: extraerDato(/followers<\/div>\s*<\/div>\s*<span[^>]*>([^<]+)</i),
    siguiendo: extraerDato(/following<\/div>\s*<\/div>\s*<span[^>]*>([^<]+)</i)
  }
}

// 🧩 COMANDO IG STALK
export const handler = async (m, { sock, conn, args }) => {
  if (!args[0]) {
    return m.reply('📌 *Uso correcto:* `.igstalk usuario` 🔍')
  }

  await sock.sendMessage(m.chat, {
    react: { text: '🕵️‍♂️', key: m.key }
  })

  let perfil
  try {
    perfil = await obtenerPerfilMollygram(args[0])
  } catch {
    return m.reply('❌ Error al espiar el perfil 💀')
  }

  const mensaje = `
╭───〔 📸✨ INSTAGRAM STALK ✨📸 〕───╮
│ 👤 Usuario: @${perfil.usuario}
│ 📛 Nombre: ${perfil.nombreCompleto}
│ 📝 Bio:
│ ${perfil.biografia}
│
│ 📊 Estadísticas:
│ 📸 Posts: ${perfil.publicaciones}
│ 👥 Seguidores: ${perfil.seguidores}
│ 🧑‍🤝‍🧑 Siguiendo: ${perfil.siguiendo}
╰──〔 🤖 JOSHI-BOT ⚡ 〕──╯
`.trim()

  if (perfil.fotoPerfil) {
    await sock.sendMessage(
      m.chat,
      {
        image: { url: perfil.fotoPerfil },
        caption: mensaje
      },
      { quoted: m }
    )
  } else {
    await m.reply(mensaje)
  }
}

// 📋 CONFIG MENÚ
handler.command = ['igstalk']
handler.tags = ['tools']
handler.menu = true
handler.group = false

export default handler
