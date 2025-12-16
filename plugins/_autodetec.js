import fetch from 'node-fetch'

export async function groupAutoDetect(sock, update) {
  const jid = update.id
  if (!jid.endsWith('@g.us')) return

  const actor = update.participants?.[0]
  if (!actor) return

  const user = '@' + actor.split('@')[0]

  let title = ''
  let body = ''

  switch (update.action) {
    case 'restrict':
      title = '🔒 El grupo fue cerrado'
      body = 'Solo los administradores pueden escribir'
      break

    case 'announce':
      title = '🔓 El grupo fue abierto'
      body = 'Todos los participantes pueden escribir'
      break

    case 'promote':
      title = '👑 Nuevo administrador'
      body = `${user} ahora es administrador`
      break

    case 'demote':
      title = '⚠️ Admin removido'
      body = `${user} ya no es administrador`
      break

    default:
      return
  }

  const fakeSystem = {
    key: {
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'JoshiBot-System'
    },
    message: {
      locationMessage: {
        name: '🤖 JoshiBot • Sistema',
        jpegThumbnail: await (
          await fetch('https://i.imgur.com/4M34hi2.jpeg')
        ).buffer(),
        vcard:
          'BEGIN:VCARD\n' +
          'VERSION:3.0\n' +
          'N:JoshiBot;;;\n' +
          'FN:JoshiBot System\n' +
          'ORG:JoshiBot Automations\n' +
          'TITLE:System\n' +
          'END:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  }

  const text =
`╭──〔 WhatsApp • Sistema 〕
│
│ ${title}
│ ${body}
│
│ 👤 Acción realizada por:
│ ${user}
╰──────────────────────`

  await sock.sendMessage(
    jid,
    { text, mentions: [actor] },
    { quoted: fakeSystem }
  )
}
