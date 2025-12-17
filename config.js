// ─────────────────────────────
// CONFIGURACIÓN GLOBAL DEL BOT
// ─────────────────────────────

const config = {
  // 🤖 BOT
  bot: {
    name: 'JOSHI-BOT',
    prefix: '.',
    public: true
  },

  // 👑 OWNER (SOLO NÚMEROS)
  owner: {
    name: 'Joshi',
    numbers: [
      '523310167470'
    ]
  },

  // 🔐 LOGIN
  login: {
    pairing: true
  },

  // 🌐 APIS
  APIs: {
    openai: 'https://api.openai.com/v1',
    gemini: 'https://generativelanguage.googleapis.com',
    removebg: 'https://api.remove.bg/v1.0',
    weather: 'https://api.openweathermap.org/data/2.5'
  },

  // 🔑 API KEYS
  APIKeys: {
    'https://api.openai.com/v1': process.env.OPENAI_KEY || '',
    'https://generativelanguage.googleapis.com': process.env.GEMINI_KEY || '',
    'https://api.remove.bg/v1.0': process.env.REMOVEBG_KEY || '',
    'https://api.openweathermap.org/data/2.5': process.env.WEATHER_KEY || ''
  },

  // 📊 LIMITES
  limits: {
    free: 10,
    premium: 100
  }
}

export default config
