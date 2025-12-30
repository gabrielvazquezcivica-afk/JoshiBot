import axios from 'axios'

// 📸 Obtener datos del perfil usando Mollygram
const obtenerPerfilMollygram = async (usuario) => {
  const { data } = await axios.get(
    `https://media.mollygram.com/?url=${encodeURIComponent(usuario)}`,
    {
      headers: {
        'accept': '*/*',
        'accept-language': 'es-ES,es;q=0.9',
        'origin': 'https://mollygram.com',
        'referer': 'https://mollygram.com/',
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
      }
    }
  )

  const html = data.html
  const get = (r) => html.match(r)?.[1]?.trim() || '❌ No disponible'

  return {
    usuario: get(/<h4 class="mb-0">([^<]+)</),
    nombre: get(/<p class="text-muted">([^<]+)</),
    bio: get(/<p class="text-dark"[^>]*>([^<]+)</),
    posts: get(/posts<\/div>[\s\S]*?<span[^>]*>([^<]+)/i),
    seguidores: get(/followers<\/div>[\s\S]*?<span[^>]*>([^<]+)/i),
    siguiendo: get(/following<\/div>[\s\S]*?<span[^>]*>([^<]+)/i),
    foto:
      html.match(/rounded-circle[^>]*src="([^"]+)"/i)?.[1] || null
  }
}

// 🧩 COMANDO IGSTALK
export const handler = async (m, { sock, from, args, reply }) => {
  if (!args[0]) {
    return reply('📌 *Uso correcto:* `.igstalk usuario` 🕵️‍♂️')
  }

  // ⚡ reacción
  await sock.sendMessage(from, {
    react: { text: '🕵️‍♂️', key: m.key }
  })

  let p
  try {
    p = await obtenerPerfilMollygram(args[0])
  } catch {
    return reply('❌ No pude espiar ese perfil 💀')
  }

  const texto = `
╭──〔 📸 IG STALK 📸 〕──╮
│ 👤 Usuario: @${p.usuario}
│ 📛 Nombre: ${p.nombre}
│ 📝 Bio:
│ ${p.bio}
│
│ 📊 Stats:
│ 📸 Posts: ${p.posts}
│ 👥 Seguidores: ${p.seguidores}
│ 🧑‍🤝‍🧑 Siguiendo: ${p.siguiendo}
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

  if (p.foto) {
    await sock.sendMessage(
      from,
      {
        image: { url: p.foto },
        caption: texto
      },
      { quoted: m }
    )
  } else {
    await reply(texto)
  }
}

// 📋 CONFIG MENÚ
handler.command = ['igstalk']
handler.tags = ['tools']
handler.menu = true
handler.group = false
