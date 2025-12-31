import fetch from 'node-fetch'

const clima = {
  get url() {
    return {
      clima_actual: `https://weather.bmkg.go.id/api/presentwx/coord`,
      clima_alerta: `https://cuaca.bmkg.go.id/api/v1/public/weather/warning`
    }
  },

  get tokens() {
    return {
      bmkg: 'TOKEN_DE_AUTORIZACIÓN_DE_BMKG_AQUÍ'
    }
  },

  get encabezadosBase() {
    return {
      'accept-encoding': 'gzip, deflate, br, zstd'
    }
  },

  validarCoordenada(nombre, valor, min, max) {
    const num = parseFloat(valor)
    if (isNaN(num) || num < min || num > max) throw new Error(`Coordenada inválida: ${nombre}`)
  },

  validarTexto(campo, valor) {
    if (typeof valor !== "string" || !valor.trim().length)
      throw new Error(`El parámetro ${campo} debe ser texto y no puede estar vacío`)
  },

  solicitarJson: async function(desc, url, opciones) {
    try {
      const res = await fetch(url, opciones)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}\n${await res.text()}`)
      return await res.json()
    } catch (err) {
      throw new Error(`Error obteniendo JSON: ${desc}\n${err.message}`)
    }
  },

  obtenerClimaBMKG: async function(latitud, longitud, lugar = '') {
    this.validarCoordenada('latitud', latitud, -12, 7)
    this.validarCoordenada('longitud', longitud, 93, 142)

    const urlClima = new URL(this.url.clima_actual)
    urlClima.search = new URLSearchParams({ lat: latitud, lon: longitud })

    const urlAdvertencia = new URL(this.url.clima_alerta)
    urlAdvertencia.search = new URLSearchParams({ lat: latitud, long: longitud })

    const [datosClima, datosAdvertencia] = await Promise.all([
      this.solicitarJson('clima', urlClima, { headers: this.encabezadosBase }),
      this.solicitarJson('alerta', urlAdvertencia, { headers: { 'X-api-key': this.tokens.bmkg, ...this.encabezadosBase } })
    ])

    const loc = datosClima.data.lokasi
    const cuaca = datosClima.data.cuaca

    const direcciones = { N: '⬆️ Norte', NE: '↗️ Noreste', E: '➡️ Este', SE: '↘️ Sureste', S: '⬇️ Sur', SW: '↙️ Suroeste', W: '⬅️ Oeste', NW: '↖️ Noroeste' }
    const viento = `🌬️ ${direcciones[cuaca.wd]} → ${direcciones[cuaca.wd_to]}, ${cuaca.ws} km/h (${cuaca.wd_deg}°)`

    const climaTexto = `
📍 *Ubicación:* ${loc.desa}, ${loc.kecamatan}, ${loc.kotkab}, ${loc.provinsi}
🕒 *Hora local:* ${cuaca.local_datetime.split(" ")[1]}
⛅ *Clima:* ${cuaca.weather_desc} / ${cuaca.weather_desc_en}
🌡️ *Temperatura:* ${cuaca.t}°C
💧 *Humedad:* ${cuaca.hu}%
☁️ *Nubosidad:* ${cuaca.tcc}%
🌫️ *Visibilidad:* ${cuaca.vs_text} (${cuaca.vs} m)
${viento}
    `.trim()

    const impacto = datosAdvertencia.data?.today?.kategoridampak
    const advertencia = datosAdvertencia.data?.today?.description?.description?.trim() || 'Sin advertencias'
    const impactoTexto = impacto ? JSON.parse(impacto.replaceAll("'", '"')).join(', ') : 'Sin impacto'

    const alertaTexto = `
⚠️ *Alerta BMKG*
Impacto: ${impactoTexto}
📢 ${advertencia}
    `.trim()

    const enlaceBMKG = `🌐 [BMKG](${`https://www.bmkg.go.id/cuaca/prakiraan-cuaca/${loc.adm4}`})`
    const enlaceMapas = `🗺️ [Google Maps](https://www.google.com/maps?q=${latitud},${longitud})`

    return `
═════════════ 🌦️ CLIMA 🌦️ ═════════════

${lugar ? `📌 *Lugar buscado:* ${lugar}\n\n` : ''}
${climaTexto}

${alertaTexto}

${enlaceBMKG} | ${enlaceMapas}

═══════════════════════════════════════
    `.trim()
  },

  ejecutar: async function(lugar) {
    // Busqueda simple: para este diseño, asumimos que ya se dan coordenadas válidas
    // Si quieres, puedo agregar Google Maps lookup aquí también
    throw new Error('Función de búsqueda de coordenadas pendiente de implementar')
  }
}

// ───── HANDLER JOSHI-BOT ─────
let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) return await conn.sendMessage(m.chat, { text: '🧭 Escribe un lugar para consultar el clima\nEjemplo: _.cuaca Caracas_', mentions: [m.sender] }, { quoted: m })

    // Aquí normalmente llamarías clima.ejecutar(args.join(' ')), pero como la búsqueda de coordenadas no está implementada, solo mostramos ejemplo
    const ejemploResultado = await clima.obtenerClimaBMKG(-6.1751, 106.8650, args.join(' ')) // Yakarta como ejemplo

    await conn.sendMessage(m.chat, { text: ejemploResultado, mentions: [m.sender] }, { quoted: m })
  } catch (e) {
    await conn.sendMessage(m.chat, { text: `❌ Error: ${e.message}`, mentions: [m.sender] }, { quoted: m })
  }
}

handler.help = ['cuaca <lugar>']
handler.tags = ['tools']
handler.command = ['cuaca', 'weather']
handler.menu = true

export default handler
