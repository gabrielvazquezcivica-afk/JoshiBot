// ─────────────────────────────
// CONFIGURACIÓN GLOBAL JOSHI-BOT
// ─────────────────────────────

import fs from 'fs'

// ───── DATOS DEL BOT ─────
global.botnumber = ''

global.bot = {
  name: 'JOSHI-BOT',
  prefix: '.',
  public: true
}

// ───── OWNERS (FORMATO AVANZADO) ─────
// [ numero | nombre | isCreator ]

global.owner = [
  ['523310167470', 'Joshi 👑', true], // OWNER PRINCIPAL
]

// ───── ROLES ─────
global.mods = []
global.suittag = []
global.prems = []

// ───── STICKERS ─────
global.packsticker = 'Joshi-Bot'
global.packname = 'JOSHI-BOT'
global.author = 'Joshi'
global.wm = 'JOSHI-BOT'
global.titulowm = 'JOSHI-BOT'
global.titulowm2 = 'Joshi'
global.igfg = 'Joshi'
global.botname = 'JOSHI-BOT'
global.dev = 'Joshi'
global.textbot = 'JOSHI-BOT'
global.gt = '🤖 JOSHI'
global.namechannel = 'JoshiBot'
global.vs = 'v1.0.0'

// ───── LOGIN ─────
global.login = {
  pairing: true // true = código | false = QR
}

// ───── APIS ─────
global.APIs = {
  openai: 'https://api.openai.com/v1',
  gemini: 'https://generativelanguage.googleapis.com',
  removebg: 'https://api.remove.bg/v1.0',
  weather: 'https://api.openweathermap.org/data/2.5'
}

// ───── API KEYS ─────
global.APIKeys = {
  'https://api.openai.com/v1': process.env.OPENAI_KEY || '',
  'https://generativelanguage.googleapis.com': process.env.GEMINI_KEY || '',
  'https://api.remove.bg/v1.0': process.env.REMOVEBG_KEY || '',
  'https://api.openweathermap.org/data/2.5': process.env.WEATHER_KEY || ''
}

// ───── LIMITES ─────
global.limits = {
  free: 10,
  premium: 100
}
