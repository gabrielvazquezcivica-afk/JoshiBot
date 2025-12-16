export async function autoDetectSystem(sock) {

  // ───────────── ADMINS (PROMOTE / DEMOTE) ─────────────
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const { id, participants, action, author } = update

      // ❌ IGNORAR add / remove
      if (!['promote', 'demote'].includes(action)) return

      const icon = action === 'promote' ? '⬆️' : '⬇️'
      const text =
        action === 'promote'
          ? 'Se otorgó administrador'
          : 'Se retiró administrador'

      const systemMsg = `
╭───〔 ${icon} Sistema de WhatsApp 〕
│
│ ${text}
│
│ 👤 Usuario:
│ ${participants.map(u => `@${u.split('@')[0]}`).join(', ')}
│
│ 🛠️ Acción realizada por:
│ @${author?.split('@')[0] || 'Sistema'}
╰─────────────────────────────
`.trim()

      await sock.sendMessage(id, {
        text: systemMsg,
        mentions: [...participants, author].filter(Boolean)
      })
    } catch {}
  })

  // ───────────── CONFIGURACIÓN DEL GRUPO ─────────────
  sock.ev.on('groups.update', async (updates) => {
    try {
      for (const update of updates) {
        const { id, subject, desc, announce, restrict, author } = update

        let text = ''
        let icon = '⚙️'

        if (subject) {
          icon = '✏️'
          text = `Nombre del grupo actualizado:\n${subject}`
        } else if (desc) {
          icon = '📝'
          text = `Descripción del grupo actualizada`
        } else if (announce !== undefined) {
          icon = announce ? '🔒' : '🔓'
          text = announce
            ? 'El grupo fue cerrado (solo administradores)'
            : 'El grupo fue abierto (todos pueden escribir)'
        } else if (restrict !== undefined) {
          icon = '🛡️'
          text = restrict
            ? 'Edición del grupo solo para administradores'
            : 'Edición del grupo permitida para todos'
        }

        if (!text) return

        const systemMsg = `
╭───〔 ${icon} Sistema de WhatsApp 〕
│
│ ${text}
│
│ 🛠️ Modificado por:
│ @${author?.split('@')[0] || 'Sistema'}
╰─────────────────────────────
`.trim()

        await sock.sendMessage(id, {
          text: systemMsg,
          mentions: author ? [author] : []
        })
      }
    } catch {}
  })

  // ───────────── FOTO DEL GRUPO ─────────────
  sock.ev.on('groups.picture.update', async (update) => {
    try {
      const { id, author } = update

      const systemMsg = `
╭───〔 🖼️ Sistema de WhatsApp 〕
│
│ La foto del grupo fue actualizada
│
│ 🛠️ Modificado por:
│ @${author?.split('@')[0] || 'Sistema'}
╰─────────────────────────────
`.trim()

      await sock.sendMessage(id, {
        text: systemMsg,
        mentions: author ? [author] : []
      })
    } catch {}
  })
}

// ───────────── AUTO CARGA (SIN MENÚ) ─────────────
export const handler = async (m, { sock }) => {
  if (sock._autoDetectLoaded) return
  sock._autoDetectLoaded = true
  await autoDetectSystem(sock)
}

// 🔒 OCULTO TOTAL
handler.command = []      // sin comandos
handler.tags = []         // sin categoría
handler.help = []         // sin ayuda
handler.hidden = true     // por si tu menú lo soporta
