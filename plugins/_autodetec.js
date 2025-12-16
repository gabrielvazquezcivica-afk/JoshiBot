import chalk from 'chalk'

const lastAdmin = new Map() // grupo => último admin activo

export function initAutoDetect(sock) {

  /* ───── Guardar último admin que habló ───── */
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages?.[0]
    if (!m?.key?.remoteJid?.endsWith('@g.us')) return

    const jid = m.key.remoteJid
    const sender = m.key.participant
    if (!sender) return

    try {
      const meta = await sock.groupMetadata(jid)
      const isAdmin = meta.participants.find(
        p =>
          p.id === sender &&
          (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (isAdmin) lastAdmin.set(jid, sender)
    } catch {}
  })

  /* ───── Abrir / cerrar grupo ───── */
  sock.ev.on('groups.update', async (updates) => {
    for (const u of updates) {
      if (u.announce === undefined) continue

      const jid = u.id
      const actor = lastAdmin.get(jid)

      const actorJid = actor || null
      const actorText = actorJid
        ? `@${actorJid.split('@')[0]}`
        : 'un administrador'

      await sock.sendMessage(jid, {
        text: u.announce
          ? `🔒 Solo los administradores pueden enviar mensajes.\n\n👤 Acción realizada por ${actorText}`
          : `🔓 Todos los participantes pueden enviar mensajes.\n\n👤 Acción realizada por ${actorText}`,
        mentions: actorJid ? [actorJid] : [],
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true
        }
      })
    }
  })

  /* ───── Dar / quitar admin (FIX REAL) ───── */
  sock.ev.on('group-participants.update', async (u) => {
    const { id, action, participants, actor } = u
    if (!['promote', 'demote'].includes(action)) return

    const target = participants?.[0]
    const actorJid = actor || lastAdmin.get(id) || null

    const userTag = target ? `@${target.split('@')[0]}` : 'un usuario'
    const adminTag = actorJid
      ? `@${actorJid.split('@')[0]}`
      : 'un administrador'

    const mentions = []
    if (target) mentions.push(target)
    if (actorJid) mentions.push(actorJid)

    await sock.sendMessage(id, {
      text:
        action === 'promote'
          ? `👑 ${userTag} ahora es administrador.\n\n👤 Acción realizada por ${adminTag}`
          : `🧹 ${userTag} ya no es administrador.\n\n👤 Acción realizada por ${adminTag}`,
      mentions,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true
      }
    })
  })

  console.log(chalk.green('🔔 AutoDetect WhatsApp-style (admin FIXED)'))
}
