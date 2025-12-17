// ─────────────────────────────
// CONFIGURACIÓN GLOBAL JOSHI-BOT
// ─────────────────────────────

const toJid = (n) => {
  if (!n) return null
  if (n.includes('@')) return n
  return n.length > 15
    ? `${n}@lid`
    : `${n}@s.whatsapp.net`
}

const config = {

  // ───── BOT ─────
  bot: {
    name: 'JOSHI-BOT',
    prefix: '.',
    public: true,
    version: '1.0.0'
  },

  // ───── OWNER ─────
  owner: {
    name: 'Joshi',

    // números crudos (para editar fácil)
    numbers: [
      '523310167470',      // 📱 Número real
      '215590228750567'    // 🔥 LID real (MD)
    ],

    // JID normalizados (USO INTERNO)
    jid: [
      '523310167470@s.whatsapp.net',
      '215590228750567@lid'
    ]
  },

  // ───── LOGIN ─────
  login: {
    pairing: true // true = código | false = QR
  },

  // ───── APIS ─────
  APIs: {
    openai: 'https://api.openai.com/v1',
    gemini: 'https://generativelanguage.googleapis.com',
    removebg: 'https://api.remove.bg/v1.0',
    weather: 'https://api.openweathermap.org/data/2.5'
  },

  // ───── API KEYS ─────
  APIKeys: {
    openai: process.env.OPENAI_KEY || '',
    gemini: process.env.GEMINI_KEY || '',
    removebg: process.env.REMOVEBG_KEY || '',
    weather: process.env.WEATHER_KEY || ''
  },

  // ───── LIMITES ─────
  limits: {
    free: 10,
    premium: 100
  }
}

// 🔥 EXPORTS ÚTILES PARA TODO EL BOT
config.owner.jid = config.owner.jid
  .concat(config.owner.numbers.map(toJid))
  .filter(Boolean)

export default config
