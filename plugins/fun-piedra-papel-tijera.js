export const handler = async (m, { sock, from, args, reply, sender }) => {
  const opciones = ['piedra', 'papel', 'tijera']
  const userChoice = (args[0] || '').toLowerCase()

  if (!opciones.includes(userChoice)) {
    return reply('❌ Debes elegir: piedra, papel o tijera\nEjemplo: .ppt piedra')
  }

  const botChoice = opciones[Math.floor(Math.random() * opciones.length)]

  let resultado
  if (userChoice === botChoice) resultado = 'Empate 😐'
  else if (
    (userChoice === 'piedra' && botChoice === 'tijera') ||
    (userChoice === 'papel' && botChoice === 'piedra') ||
    (userChoice === 'tijera' && botChoice === 'papel')
  ) resultado = 'Ganaste 🎉'
  else resultado = 'Perdiste 😢'

  reply(`
🎮 Piedra, Papel o Tijera
Tu elección: ${userChoice}
Bot: ${botChoice}

Resultado: ${resultado}
> ¡Sigue jugando y diviértete!
`.trim())
}

handler.command = ['ppt']
handler.tags = ['juegos']
handler.help = ['ppt <piedra|papel|tijera>']
handler.menu = true

export default handler
