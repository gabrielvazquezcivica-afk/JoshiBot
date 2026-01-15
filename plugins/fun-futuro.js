// juegos-futuro.js 🔮
export const handler = async (m, { sock, from, isGroup, reply, owner }) => {
  if (!isGroup) return reply('🔮 Este comando solo funciona en grupos')

  /* ───── 👑 MODO ADMIN (SILENCIOSO) ───── */
  if (!global.db) global.db = {}
  if (!global.db.groups) global.db.groups = {}
  if (!global.db.groups[from]) global.db.groups[from] = { modoadmin: false }

  if (global.db.groups[from].modoadmin) {
    const metadata = await sock.groupMetadata(from)
    const participants = metadata.participants || []
    const sender = m.key.participant || m.sender
    const ownerJids = owner?.jid || []

    if (!ownerJids.includes(sender)) {
      const isAdmin = participants.some(
        p => p.id === sender &&
        (p.admin === 'admin' || p.admin === 'superadmin')
      )
      if (!isAdmin) return
    }
  }
  /* ─────────────────────────────────── */

  // 🔮 Reacción
  await sock.sendMessage(from, {
    react: { text: '🔮', key: m.key }
  })

  const futuros = [
    // 💰 Dinero
    'Será millonario… pero en deudas 💸',
    'Ganará dinero inesperadamente 🤑',
    'Siempre estará esperando la quincena 😭',
    'Se hará rico con una idea absurda 💡',

    // ❤️ Amor
    'Se enamorará de quien menos espera 💘',
    'Tendrá muchas parejas, pero ninguna seria 😏',
    'Encontrará al amor de su vida 💍',
    'Se quedará soltero por decisión propia 😎',

    // 😴 Vida diaria
    'Dormirá todo el día y dirá que está cansado 😴',
    'Vivirá con sueño permanente 🥱',
    'Será adicto al celular 📱',
    'Dirá “ya voy” y llegará tarde siempre ⏰',

    // 🐱 Random
    'Tendrá muchos gatos 🐱',
    'Tendrá un perro que manda en la casa 🐶',
    'Se volverá famoso sin querer 😳',
    'Será meme del grupo 😂',

    // 🚀 Futuro exagerado
    'Viajará por todo el mundo ✈️',
    'Vivirá como rey… en su imaginación 👑',
    'Se irá del grupo y volverá arrepentido 🤡',
    'Será admin y abusará del poder 😈',

    // 💀 Oscuro pero gracioso
    'Sobrevivirá a todo, menos a sus decisiones 🤦‍♂️',
    'Siempre dirá “yo sabía” después de que pase 😬',
    'Prometerá cambiar… y no cambiará 😅',

    // 🤖 Bot style
    'Será protegido oficialmente por JoshiBot 🤖',
    'El bot lo vigilará 👀',
    'El bot no confía en él 🧐'
  ]

  const resultado = futuros[Math.floor(Math.random() * futuros.length)]

  await sock.sendMessage(from, {
    text: `
🔮 *FUTURO REVELADO* 🔮

✨ ${resultado}

> El destino no se equivoca
`.trim()
  })
}

handler.command = ['futuro', 'destino', 'prediccion']
handler.tags = ['juegos']
handler.menu = true
handler.group = true

export default handler
