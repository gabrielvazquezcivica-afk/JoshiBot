// ─────────────────────────────
// CONFIGURACIÓN GLOBAL JOSHI-BOT
// ─────────────────────────────

const config = {

  // ───── BOT ─────
  bot: {
    name: 'JOSHI-BOT',
    prefix: '.',
    public: true
  },

  // ───── OWNER (NUM + LID) ─────
  owner: {
    name: 'Joshi',
    numbers: [
      '523310167470',      // 📱 Número real
      '215590228750567'    // 🔥 LID real (MD)
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
    'https://api.openai.com/v1': process.env.OPENAI_KEY || '',
    'https://generativelanguage.googleapis.com': process.env.GEMINI_KEY || '',
    'https://api.remove.bg/v1.0': process.env.REMOVEBG_KEY || '',
    'https://api.openweathermap.org/data/2.5': process.env.WEATHER_KEY || ''
  },

  // ───── LIMITES ─────
  limits: {
    free: 10,
    premium: 100
  }
}

export default config
