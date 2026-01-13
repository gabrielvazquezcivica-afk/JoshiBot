export const handler = async (m, { sock, from }) => {
  // Reacción al comando
  await sock.sendMessage(from, { react: { text: '⏰', key: m.key } })

  const now = new Date()

  const format12 = (date, locale) => date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })

  // Horas por país
  const hora = {
    'México 🇲🇽': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' })), 'es-MX'),
    'Colombia 🇨🇴': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' })), 'es-CO'),
    'Venezuela 🇻🇪': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Caracas' })), 'es-VE'),
    'República Dominicana 🇩🇴': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Santo_Domingo' })), 'es-DO'),
    'Guatemala 🇬🇹': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Guatemala' })), 'es-GT'),
    'Honduras 🇭🇳': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Tegucigalpa' })), 'es-HN'),
    'Perú 🇵🇪': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' })), 'es-PE'),
    'Ecuador 🇪🇨': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Guayaquil' })), 'es-EC'),
    'Bolivia 🇧🇴': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/La_Paz' })), 'es-BO'),
    'Paraguay 🇵🇾': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Asuncion' })), 'es-PY'),
    'Chile 🇨🇱': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Santiago' })), 'es-CL'),
    'Argentina 🇦🇷': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })), 'es-AR'),
    'Uruguay 🇺🇾': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Montevideo' })), 'es-UY'),
    'Cuba 🇨🇺': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Havana' })), 'es-CU'),
    'Costa Rica 🇨🇷': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Costa_Rica' })), 'es-CR'),
    'Panamá 🇵🇦': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Panama' })), 'es-PA'),
    'Nicaragua 🇳🇮': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/Managua' })), 'es-NI'),
    'El Salvador 🇸🇻': format12(new Date(now.toLocaleString('en-US', { timeZone: 'America/El_Salvador' })), 'es-SV')
  }

  // Construir texto
  let text = '📍 *Hora actual en LATAM (12h)*\n\n'
  for (const [pais, h] of Object.entries(hora)) {
    text += `${pais}: ${h}\n`
  }
  text += '\n> ᴊσѕнι мυи∂ιαℓ 🌎'

  // Enviar
  await sock.sendMessage(from, { text }, { quoted: m })
}

handler.command = ['hora', 'time', 'horalatam']
handler.help = ['hora']
handler.tags = ['tools']
handler.menu = true

export default handler
