import chalk from 'chalk'

const lastAdmin = new Map() // grupo => último admin activo

export function initAutoDetect(sock) {

  /* ───── Detectar último admin que habló ───── */
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages?.[0]
    if (!m?.key?.remoteJid) return
    if (!m.key.remoteJid.endsWith('@g.us')) return

    const jid = m.key.remoteJid
    const sender = m.key.participant
    if (!sender) return

    try {
      const meta = await sock.groupMetadata(jid)
      const isAdmin = meta.participants.find(
        p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (isAdmin) lastAdmin.set(jid, sender)
    } catch {}
  })

  /* ───── Cambios del grupo (abrir / cerrar / nombre / desc) ───── */
  sock.ev.on('groups.update', async (updates) => {
    for (const u of updates) {
      const jid = u.id
      const actor = lastAdmin.get(jid)
      const actorTag = actor ? `@${actor.split('@')[0]}` : 'un administrador'

      try {
        // 🔒 Abrir / cerrar grupo
        if (u.announce !== undefined) {
          const txt = u.announce
            ? `🔒 Solo los administradores pueden enviar mensajes.\n\n👤 Acción realizada por ${actorTag}`
            : `🔓 Todos los participantes pueden enviar mensajes.\n\n👤 Acción realizada por ${actorTag}`

          await sock.sendMessage(jid, {
            text: txt,
            mentions: actor ? [actor] : [],
            contextInfo: {
              forwardingScore: 9999,
              isForwarded: true
            }
          })
        }

        // ✏️ Cambio de nombre
        if (u.subject) {
          await sock.sendMessage(jid, {
            text:
`✏️ El nombre del grupo fue cambiado.

📛 ${u.subject}

👤 Acción realizada por ${actorTag}`,
            mentions: actor ? [actor] : [],
            contextInfo: {
              forwardingScore: 9999,
              isForwarded: true
            }
          })
        }

        // 🧾 Descripción
        if (u.desc !== undefined) {
          await sock.sendMessage(jid, {
            text:
`🧾 La descripción del grupo fue actualizada.

👤 Acción realizada por ${actorTag}`,
            mentions: actor ? [actor] : [],
            contextInfo: {
              forwardingScore: 9999,
              isForwarded: true
            }
          })
        }

      } catch (e) {
        console.log(chalk.red('AutoDetect error:'), e)
      }
    }
  })

  /* ───── Admins (aquí WhatsApp SÍ manda actor) ───── */
  sock.ev.on('group-participants.update', async (u) => {
    const { id, action, participants, actor } = u
    if (!['promote', 'demote'].includes(action)) return

    const user = `@${participants[0].split('@')[0]}`
    const admin = actor ? `@${actor.split('@')[0]}` : 'un administrador'

    await sock.sendMessage(id, {
      text:
        action === 'promote'
          ? `👑 ${user} ahora es administrador.\n\n👤 Acción realizada por ${admin}`
          : `🧹 ${user} ya no es administrador.\n\n👤 Acción realizada por ${admin}`,
      mentions: actor ? [participants[0], actor] : [participants[0]],
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true
      }
    })
  })

  console.log(chalk.green('🔔 AutoDetect estilo WhatsApp activo'))
    }
