import chalk from 'chalk'

export function initAutoDetect(sock) {

  // 🔔 CAMBIOS DEL GRUPO
  sock.ev.on('groups.update', async (updates) => {
    for (const update of updates) {
      const jid = update.id

      try {
        // 🔒 ABRIR / CERRAR
        if (update.announce !== undefined) {
          const closed = update.announce === true

          await sock.sendMessage(jid, {
            text: closed
              ? `🔒 El grupo fue cerrado\n\nSolo los administradores pueden enviar mensajes`
              : `🔓 El grupo fue abierto\n\nTodos los participantes pueden enviar mensajes`,
            contextInfo: {
              forwardingScore: 9999,
              isForwarded: true
            }
          })
        }

        // ✏️ NOMBRE
        if (update.subject) {
          await sock.sendMessage(jid, {
            text: `✏️ El nombre del grupo fue cambiado\n\nNuevo nombre:\n${update.subject}`,
            contextInfo: {
              forwardingScore: 9999,
              isForwarded: true
            }
          })
        }

        // 🧾 DESCRIPCIÓN
        if (update.desc !== undefined) {
          await sock.sendMessage(jid, {
            text: `🧾 La descripción del grupo fue actualizada`,
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

  // 👑 PROMOVER / QUITAR ADMIN
  sock.ev.on('group-participants.update', async (update) => {
    const { id, action, participants, actor } = update
    if (!['promote', 'demote'].includes(action)) return

    const admin = actor ? `@${actor.split('@')[0]}` : ''
    const user = `@${participants[0].split('@')[0]}`

    await sock.sendMessage(id, {
      text:
        action === 'promote'
          ? `👑 ${user} ahora es administrador\n\nAcción realizada por ${admin}`
          : `🧹 ${user} ya no es administrador\n\nAcción realizada por ${admin}`,
      mentions: [participants[0], actor],
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true
      }
    })
  })

  console.log(chalk.green('🔔 AutoDetect WhatsApp-Style activo'))
}
