export const handler = async (m, { sock, args, sender, owner, reply }) => {
  const owners = owner.numbers || []
  const cleanSender = sender.replace(/[^0-9]/g, '')

  if (!owners.includes(cleanSender)) {
    return reply(`
╭─❮ 🎅🚫 ACCESO DENEGADO ❯
│
│  🎄 Solo el OWNER puede
│  ejecutar este comando
│
╰─❮ 🤖 JOSHI NAVIDAD ❯
`.trim())
  }

  const link = args[0]
  if (!link) {
    return reply(`
╭─❮ 🎄❌ ERROR DE USO ❯
│
│  🎁 Usa:
│  ${global.prefix}join <link>
│
╰─❮ 🤖 JOSHI NAVIDAD ❯
`.trim())
  }

  const code = link.split('/').pop().split('?')[0]

  await reply(`
╭─❮ 🎄⚡ PROCESANDO ❯
│
│  🎅 Analizando invitación
│  ❄️ Verificando acceso
│
╰─❮ 🤖 JOSHI NAVIDAD ❯
`.trim())

  try {
    const res = await sock.groupAcceptInvite(code)
    const jid = res.gid || res

    // 🎄 AVISO EN EL GRUPO
    await sock.sendMessage(jid, {
      text: `
╭─❮ 🎄🤖 JOSHI-BOT NAVIDEÑO ❯
│
│  🎁 Ho Ho Ho~ ¡Ya llegué!
│  🔗 Entré mediante enlace
│
│  ❄️ Feliz Navidad a todos
│
╰─❮ 🎅 SISTEMA FESTIVO ❯
`.trim()
    })

    return reply(`
╭─❮ 🎄✅ MISIÓN CUMPLIDA ❯
│
│  🎁 Bot unido al grupo
│
╰─❮ 🤖 JOSHI NAVIDAD ❯
`.trim())

  } catch (e1) {
    try {
      const res = await sock.groupAcceptInviteV4(code)
      const jid = res.gid || res

      // 🎄 AVISO EN EL GRUPO (V4)
      await sock.sendMessage(jid, {
        text: `
╭─❮ 🎄🤖 JOSHI-BOT NAVIDEÑO ❯
│
│  🎁 Ho Ho Ho~ ¡Ya llegué!
│  🔗 Entré mediante enlace
│
│  ❄️ Feliz Navidad a todos
│
╰─❮ 🎅 SISTEMA FESTIVO ❯
`.trim()
      })

      return reply(`
╭─❮ 🎄🔐 ACCESO V4 EXITOSO ❯
│
│  🎁 Unión navideña completada
│
╰─❮ 🤖 JOSHI NAVIDAD ❯
`.trim())

    } catch (e2) {
      console.error('JOIN ERROR:', e2)
      return reply(`
╭─❮ 🎄❌ ERROR FESTIVO ❯
│
│  🚧 No pude unirme al grupo
│
╰─❮ 🤖 JOSHI NAVIDAD ❯
`.trim())
    }
  }
}

handler.command = ['join']
handler.owner = true
