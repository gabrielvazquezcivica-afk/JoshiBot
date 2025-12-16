import chalk from 'chalk'

export function initAutoDetect(sock) {

  sock.ev.on('groups.update', async (updates) => {
    for (const update of updates) {
      try {
        const jid = update.id

        // 🔒 ABRIR / CERRAR GRUPO
        if (update.announce !== undefined) {
          const isClosed = update.announce
          const actionBy = update.author || 'Desconocido'

          const text = `
🔔 *WhatsApp*
━━━━━━━━━━━━━━
${isClosed ? '🔒 El grupo fue *cerrado*' : '🔓 El grupo fue *abierto*'}

${isClosed
  ? '❄️ Solo los *admins* pueden escribir'
  : '✨ Todos los *miembros* pueden escribir'}

👤 Acción realizada por:
@${actionBy.split('@')[0]}
━━━━━━━━━━━━━━
`.trim()

          await sock.sendMessage(jid, {
            text,
            mentions: [actionBy]
          })
        }

        // ✏️ CAMBIO DE NOMBRE
        if (update.subject) {
          const actor = update.author || 'Desconocido'
          const text = `
🔔 *WhatsApp*
━━━━━━━━━━━━━━
✏️ *Nombre del grupo actualizado*

📌 Nuevo nombre:
${update.subject}

👤 Cambiado por:
@${actor.split('@')[0]}
━━━━━━━━━━━━━━
`.trim()

          await sock.sendMessage(jid, {
            text,
            mentions: [actor]
          })
        }

        // 📝 CAMBIO DE DESCRIPCIÓN
        if (update.desc !== undefined) {
          const actor = update.author || 'Desconocido'
          const text = `
🔔 *WhatsApp*
━━━━━━━━━━━━━━
📝 *Descripción del grupo modificada*

👤 Cambiado por:
@${actor.split('@')[0]}
━━━━━━━━━━━━━━
`.trim()

          await sock.sendMessage(jid, {
            text,
            mentions: [actor]
          })
        }

      } catch (err) {
        console.log(chalk.red('❌ AutoDetect error:'), err)
      }
    }
  })

  // ⭐ PROMOTE / DEMOTE ADMIN
  sock.ev.on('group-participants.update', async (update) => {
    try {
      if (!['promote', 'demote'].includes(update.action)) return

      const jid = update.id
      const actor = update.author || 'Desconocido'
      const target = update.participants?.[0]

      if (!target) return

      const isPromote = update.action === 'promote'

      const text = `
🔔 *WhatsApp*
━━━━━━━━━━━━━━
${isPromote ? '⭐ *Nuevo administrador*' : '⚠️ *Administrador removido*'}

👤 Usuario:
@${target.split('@')[0]}

🛠️ Acción realizada por:
@${actor.split('@')[0]}
━━━━━━━━━━━━━━
`.trim()

      await sock.sendMessage(jid, {
        text,
        mentions: [target, actor]
      })

    } catch (err) {
      console.log(chalk.red('❌ Promote/Demote error:'), err)
    }
  })

  // 🖼️ CAMBIO DE FOTO
  sock.ev.on('groups.update', async (updates) => {
    for (const update of updates) {
      if (!update.picture) return

      try {
        const jid = update.id
        const actor = update.author || 'Desconocido'

        const text = `
🔔 *WhatsApp*
━━━━━━━━━━━━━━
🖼️ *Foto del grupo actualizada*

👤 Cambiado por:
@${actor.split('@')[0]}
━━━━━━━━━━━━━━
`.trim()

        await sock.sendMessage(jid, {
          text,
          mentions: [actor]
        })

      } catch (err) {
        console.log(chalk.red('❌ Foto grupo error:'), err)
      }
    }
  })

  console.log(chalk.green('🔔 AutoDetect de grupo ACTIVADO'))
          }
