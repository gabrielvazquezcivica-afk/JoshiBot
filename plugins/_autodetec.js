// Guarda el último admin que habló por grupo (fallback real)
export const lastAdmin = new Map()

export function initAutoDetect(sock) {

  // 🧠 Detectar admins que escriben (para fallback)
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages?.[0]
    if (!m?.key?.remoteJid?.endsWith('@g.us')) return
    if (!m.key.participant) return

    try {
      const meta = await sock.groupMetadata(m.key.remoteJid)
      const isAdmin = meta.participants
        .some(p => p.admin && p.id === m.key.participant)

      if (isAdmin) {
        lastAdmin.set(m.key.remoteJid, m.key.participant)
      }
    } catch {}
  })

  // 🔔 AUTO-DETECT CAMBIOS DE GRUPO (manual y por comando)
  sock.ev.on('group-update', async (u) => {
    const { id, announce, subject, desc, author } = u

    let mentions = []

    // 🔒 Abrir / Cerrar grupo
    if (announce !== undefined) {
      const actor = author || lastAdmin.get(id)
      if (actor) mentions.push(actor)

      const text =
        announce === 'true'
          ? `🔒 *GRUPO CERRADO*\n\n❄️ Solo administradores pueden escribir.\n👤 Acción realizada por @${actor?.split('@')[0] || 'un administrador'}`
          : `🔓 *GRUPO ABIERTO*\n\n🎄 Todos pueden escribir.\n👤 Acción realizada por @${actor?.split('@')[0] || 'un administrador'}`

      await sock.sendMessage(id, {
        text,
        mentions,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true
        }
      })
    }

    // ✏️ Cambio de nombre
    if (subject) {
      const actor = author || lastAdmin.get(id)
      if (actor) mentions.push(actor)

      await sock.sendMessage(id, {
        text: `✏️ *NOMBRE ACTUALIZADO*\n\n🎁 Nuevo nombre:\n*${subject}*\n\n👤 Por @${actor?.split('@')[0] || 'un administrador'}`,
        mentions,
        contextInfo: { forwardingScore: 9999, isForwarded: true }
      })
    }

    // 📝 Cambio de descripción
    if (desc) {
      const actor = author || lastAdmin.get(id)
      if (actor) mentions.push(actor)

      await sock.sendMessage(id, {
        text: `📝 *DESCRIPCIÓN ACTUALIZADA*\n\n🎄 La info del grupo cambió.\n👤 Por @${actor?.split('@')[0] || 'un administrador'}`,
        mentions,
        contextInfo: { forwardingScore: 9999, isForwarded: true }
      })
    }
  })

  // 👑 PROMOTE / DEMOTE (manual y por comando)
  sock.ev.on('group-participants.update', async (u) => {
    const { id, action, participants, actor } = u
