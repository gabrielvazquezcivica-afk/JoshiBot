import fetch from 'node-fetch'

const clima = {
  url: {
    clima_actual: `https://weather.bmkg.go.id/api/presentwx/coord`,
    clima_alerta: `https://cuaca.bmkg.go.id/api/v1/public/weather/warning`
  },

  tokens: {
    bmkg: 'TOKEN_DE_AUTORIZACIÓN_DE_BMKG_AQUÍ'
  },

  headers: {
    'accept-encoding': 'gzip, deflate, br'
  },

  validarCoordenada(nombre, valor, min, max) {
    const num = parseFloat(valor)
    if (isNaN(num) || num < min || num > max)
      throw new Error(`Coordenada inválida: ${nombre}`)
  },

  async solicitarJson(desc, url, opciones) {
    const res = await fetch(url, opciones)
    if (!res.ok) throw new Error(`${desc} - ${res.status} ${res.statusText}`)
    return await res.json()
  },

  async obtenerClimaBMKG(lat, lon, lugar = '') {
    this.validarCoordenada('latitud', lat, -12, 7)
    this.validarCoordenada('longitud', lon, 93, 142)

    const urlClima = new URL(this.url.clima_actual)
    urlClima.search = new URLSearchParams({ lat, lon })

    const urlAlerta = new URL(this.url.clima_alerta)
    urlAlerta.search = new URLSearchParams({ lat, long: lon })

    const header = { 'X-api-key': this.tokens.bmkg, ...this.headers }

    const [datosClima, datosAlerta] = await Promise.all([
      this.solicitarJson('Clima', urlClima, { headers: this.headers }),
      this.solicitarJson('Alerta', urlAlerta, { headers: header })
    ])

    const loc = datosClima.data.lokasi
    const cu = datosClima.data.cuaca
    const vientoDir = {
      N: 'Norte', NE: 'Noreste', E: 'Este', SE: 'Sureste', S: 'Sur',
      SW: 'Suroeste', W: 'Oeste', NW: 'Noroeste'
    }

    const textoClima = `🌍 *Ubicación:* ${loc.desa}, ${loc.kecamatan}, ${loc.kotkab}, ${loc.provinsi}
🕒 *Hora local:* ${cu.local_datetime.split(' ')[1]}
⛅ *Clima:* ${cu.weather_desc} / ${cu.weather_desc_en}
🌡️ *Temperatura:* ${cu.t}°C
💧 *Humedad:* ${cu.hu}%
☁️ *Nubosidad:* ${cu.tcc}%
🌫️ *Visibilidad:* ${cu.vs_text} (${cu.vs} m)
🌬️ *Viento:* Desde ${vientoDir[cu.wd]} hacia ${vientoDir[cu.wd_to]}, ${cu.ws} km/h, ${cu.wd_deg}°`

    const impacto = datosAlerta.data?.today?.kategoridampak
    const advertencia = datosAlerta.data?.today?.description?.description?.trim() || 'Sin datos'
    const impactoTexto = impacto ? JSON.parse(impacto.replaceAll("'", '"')).join(', ') : 'Sin datos'

    const textoAlerta = `⚠️ *Impacto:* ${impactoTexto}\n📢 *Advertencia:* ${advertencia}`

    const enlaceBMKG = `🌐 BMKG: https://www.bmkg.go.id/cuaca/prakiraan-cuaca/${loc.adm4}`
    const enlaceMaps = `🗺️ Google Maps: https://www.google.com/maps?q=${lat},${lon}`

    return `${lugar ? `🏷️ *Lugar buscado:* ${lugar}\n\n` : ''}${textoClima}\n\n${textoAlerta}\n\n${enlaceBMKG}\n${enlaceMaps}`
  },

  async ejecutar(lugar) {
    // Buscar coordenadas en Google Maps
    const url = new URL('https://www.google.com/s')
    url.search = new URLSearchParams({ q: lugar, tbm: 'map' })
    const res = await fetch(url, { headers: this.headers })
    if (!res.ok) throw new Error('Error buscando ubicación en Google Maps')
    const texto = await res.text()
    const datos = texto.split('\n')[1].trim()
    const plano = [...new Set(eval(datos).flat(7).filter(v => v))]
    const coords = plano.filter(v => typeof v !== 'string' && !Number.isInteger(v))
    const textos = plano.filter(v => typeof v === 'string')
    const lat = coords[0], lon = coords[1], nombre = textos[1]?.split(', ')[0]
    return await this.obtenerClimaBMKG(lat, lon, nombre)
  }
}

// 🧩 Comando JoshiBot
export const handler = async (m, { sock, from, args, reply }) => {
  if (!args[0]) return reply('🧭 *Escribe el lugar a consultar el clima*\nEjemplo: `.cuaca Caracas`')

  await sock.sendMessage(from, { react: { text: '⛅', key: m.key } })

  try {
    const lugar = args.join(' ')
    const resultado = await clima.ejecutar(lugar)

    const mensaje = `
╭──〔 ⛅ CLIMA JOSHI-BOT 〕──╮
${resultado}
╰──〔 🤖 JOSHI-BOT 〕──╯
`.trim()

    await reply(mensaje)
  } catch (e) {
    await reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['cuaca <lugar>']
handler.tags = ['tools']
handler.menu = true
handler.command = ['cuaca', 'weather']
handler.group = false

export default handler
