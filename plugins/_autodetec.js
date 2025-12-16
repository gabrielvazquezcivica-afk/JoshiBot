// plugins/_autodetec.js
import chalk from 'chalk'

export function initAutoDetect(sock) {
  // 🟢 CAMBIOS DE CONFIGURACIÓN DEL GRUPO
  sock.ev.on('groups.update', async (updates) => {
    for (const update of updates) {
      const jid = update.id

      try {
        // 🔒 ABRIR / CERRAR GRUPO
        if (update.announce !== undefined) {
          const isClosed = update.announce === true

          const text = isClosed
            ? `🔒 El grupo fue cerrado\n\n❄️ Solo los *admins* pueden escribir`
            : `🔓 El grupo fue abierto\n\n✨ Todos pueden escribir`

          await sock.sendMessage(jid, {
            text,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          })
        }

        // ✏️ CAMBIO DE NOMBRE
        if (update.subject) {
          await sock.sendMessage(jid, {
            text:
`✏️ El nombre del grupo fue actualizado

📌 Nuevo nombre:
${update.subject}`,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          })
        }

        // 🧾 CAMBIO DE DESCRIPCIÓN
        if (update.desc !== undefined) {
          await sock.sendMessage(jid, {
            text:
`🧾 La descripción del grupo fue modificada`,
            contextInfo: {
              forwardingScore: 999,
              isForwarded: true
            }
          })
        }

      } catch (e) {
        console.log(chalk.red('❌ AutoDetect error:'), e)
      }
    }
  })

  // 🟢 PROMOVER / DEGRADAR ADMINS (SIN ENTRADAS/SALIDAS)
  sock.ev.on('group-participants.update', async (update) => {
    const { id, action, participants, actor } = update

    if (!['promote', 'demote'].includes(action)) return

    try {
      const admin = actor ? `@${actor.split('@')[0]}` : 'Un admin'
      const user = `@${participants[0].split('@')[0]}`

      const text =
        action === 'promote'
          ? `👑 ${user} ahora es *ADMIN*\n\nAccոէón realizada por:\n${admin}`
          : `🧹 ${user} ya no es *ADMIN*\n\nAcción realizada por:\n${admin}`

      await sock.sendMessage(id, {
        text,
        mentions: [participants[0], actor],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true
        }
      })
    } catch (e) {
      console.log(chalk.red('❌ AutoDetect admin error:'), e)
    }
  })

  console.log(chalk.green('🔔 AutoDetect de grupos ACTIVADO'))
}
