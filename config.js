// ─────────────────────────────
// CONFIGURACIÓN GLOBAL DEL BOT
// ─────────────────────────────

const config = {
  bot: {
    name: 'JOSHI-BOT',
    prefix: '.',
    public: true
  },

  owner: {
    name: 'Joshi',
    jids: [
      '523310167470@s.whatsapp.net'
    ]
  },

  login: {
    pairing: true
  },

  APIs: {
    openai: 'https://api.openai.com/v1',
    gemini: 'https://generativelanguage.googleapis.com',
    removebg: 'https://api.remove.bg/v1.0',
    weather: 'https://api.openweathermap.org/data/2.5'
  },

  APIKeys: {
    openai: process.env.OPENAI_KEY || '',
    gemini: process.env.GEMINI_KEY || '',
    removebg: process.env.REMOVEBG_KEY || '',
    weather: process.env.WEATHER_KEY || ''
  },

  limits: {
    free: 10,
    premium: 100
  }
}

export default config
