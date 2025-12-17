import fs from 'fs'

// 🔥 CAMBIO NECESARIO (exportar)
export const lastAdmin = new Map()

// Guarda último admin que habló (fallback real)
export function initAutoDetect(sock) {

  // 🧠 Detectar admins que escriben
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages?.[0]
    if (!m?.key?.remoteJid?.endsWith('@g.us')) return
    if (!m.key.participant) return

    try {
      const meta = await sock.groupMetadata(m.key.remoteJid)
      const isAdmin = meta.participants
        .filter(p => p.admin)
        .some(p => p.id === m.key.participant)

      if (isAdmin) {
        lastAdmin.set(m.key.remoteJid, m.key.participant)
      }
    } catch {}
  })

  // 🔔 AUTO-DETECT CAMBIOS
  sock.ev.on('group-update', async (u) => {
    const { id, announce, restrict, subject, desc, author } = u

    let text = ''
    let mentions = []

    // 🔒 Abrir / cerrar grupo
    if (announce !== undefined) {
      const actor = author || lastAdmin.get(id)

      if (actor) mentions.push(actor)

      text =
        announce === 'true'
          ? `🔒 Solo los administradores pueden enviar mensajes.\n\n👤 Acción realizada por @${actor?.split('@')[0] || 'un administrador'}`
          : `🔓 Todos los participantes pueden enviar mensajes.\n\n👤 Acción realizada por @${actor?.split('@')[0] || 'un administrador'}`

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
        text: `✏️ El nombre del grupo fue cambiado a:\n*${subject}*\n\n👤 Acción realizada por @${actor?.split('@')[0] || 'un administrador'}`,
        mentions,
        contextInfo: { forwardingScore: 9999, isForwarded: true }
      })
    }

    // 📝 Cambio de descripción
    if (desc) {
      const actor = author || lastAdmin.get(id)
      if (actor) mentions.push(actor)

      await sock.sendMessage(id, {
        text: `📝 La descripción del grupo fue actualizada.\n\n👤 Acción realizada por @${actor?.split('@')[0] || 'un administrador'}`,
        mentions,
        contextInfo: { forwardingScore: 9999, isForwarded: true }
      })
    }
  })

  // 👑 PROMOTE / DEMOTE
  sock.ev.on('group-participants.update', async (u) => {
    const { id, action, participants, actor } = u
    if (!['promote', 'demote'].includes(action)) return

    const target = participants?.[0]

    // 🔥 actor real o fallback
    const adminActor = actor || lastAdmin.get(id)

    const mentions = []
    if (target) mentions.push(target)
    if (adminActor) mentions.push(adminActor)

    const userTag = target ? `@${target.split('@')[0]}` : 'un usuario'
    const adminTag = adminActor
      ? `@${adminActor.split('@')[0]}`
      : 'un administrador'

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
        }
