export const handler = async (m, { sock, args, sender, owner, reply }) => {

  // ─── OWNER CHECK ───
  const owners = owner.jid || []
  if (!owners.includes(sender)) {
    return reply('🎅 Solo el Owner puede usar este comando')
  }

  // ─── LINK CHECK ───
  const link = args[0]
  if (!link) return reply('🎄 Usa: .join <link>')

  const code = link.split('/').pop().split('?')[0]

  // ─── GROUPS BEFORE ───
  const before = Object.keys(await sock.groupFetchAllParticipating())

  try {
    // ─── JOIN ───
    await sock.groupAcceptInvite(code)

    await reply('✅ Unido al grupo\n🎄 Enviando aviso navideño...')

    // ─── WAIT WA SYNC ───
    await new Promise(r => setTimeout(r, 4000))

    // ─── GROUPS AFTER ───
    const after = Object.keys(await sock.groupFetchAllParticipating())

    const joined = after.find(jid => !before.includes(jid))
    if (!joined) return

    // ─── NAVIDAD FUTURISTA ───
    await sock.sendMessage(joined, {
      text: `
╭─❮ 🎄🤖 JOSHI-BOT ❯
│
│  🎅 Ho Ho Ho~
│  🔗 Entré por enlace
│  👑 Invitado por mi Owner
│
│  ❄️ Sistema Navideño Activo
│  ⚡ Modo Futurista ON
│
╰─❮ 🎄 SISTEMA ❯
`.trim()
    })

  } catch (e) {
    console.error(e)
    reply('❌ No pude unirme al grupo')
  }
}

handler.command = ['join']
handler.owner = true
