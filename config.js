import fs from 'fs'
import moment from 'moment-timezone'

/* ───── BOT INFO ───── */
global.botnumber = ''

global.bot = {
  name: 'JOSHI-BOT',
  prefix: '.',
  public: true
}

/* ───── OWNER (FORMATO AVANZADO) ─────
  [ numero | lid , nombre , isCreator ]
*/
global.owner = [
  ['5218711426787', 'Propietario 👑', true],
  ['239298850873418', 'creatorLid', true], // LID
  ['5492916450307'],
  ['5218712620915'],
  ['5351524614']
]

/* ───── ROLES ───── */
global.mods = []
global.suittag = []
global.prems = []

/* ───── LOGIN ───── */
global.login = {
  pairing: true
}

/* ───── STICKERS ───── */
global.packname = 'JoshiBot'
global.author = 'Joshi'
global.wm = 'JoshiBot'
global.dev = 'Joshi'
global.botname = 'JOSHI-BOT'
global.vs = 'V1.0'

/* ───── APIS ───── */
global.APIs = {
  openai: 'https://api.openai.com/v1',
  gemini: 'https://generativelanguage.googleapis.com',
  removebg: 'https://api.remove.bg/v1.0',
  weather: 'https://api.openweathermap.org/data/2.5'
}

/* ───── API KEYS ───── */
global.APIKeys = {
  'https://api.openai.com/v1': process.env.OPENAI_KEY || '',
  'https://generativelanguage.googleapis.com': process.env.GEMINI_KEY || '',
  'https://api.remove.bg/v1.0': process.env.REMOVEBG_KEY || '',
  'https://api.openweathermap.org/data/2.5': process.env.WEATHER_KEY || ''
}

/* ───── LIMITES ───── */
global.limits = {
  free: 10,
  premium: 100
}

/* ───── TIMEZONE ───── */
global.timezone = 'America/Mexico_City'
global.moment = moment

export default {}
