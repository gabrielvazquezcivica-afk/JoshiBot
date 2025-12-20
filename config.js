// ─────────────────────────────
// CONFIGURACIÓN GLOBAL JOSHI-BOT
// ─────────────────────────────

// 🔧 Normalizador JID
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

    // números crudos
    numbers: [
      '523310167470',
      '215590228750567'
    ],

    // JID base
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

    // IA / Servicios
    openai: 'https://api.openai.com/v1',
    gemini: 'https://generativelanguage.googleapis.com',
    removebg: 'https://api.remove.bg/v1.0',
    weather: 'https://api.openweathermap.org/data/2.5',

    // APIs Bots
    amel: 'https://melcanz.com',
    bx: 'https://bx-hunter.herokuapp.com',
    nrtm: 'https://nurutomo.herokuapp.com',
    xteam: 'https://api.xteam.xyz',
    nzcha: 'http://nzcha-apii.herokuapp.com',
    bg: 'http://bochil.ddns.net',
    fdci: 'https://api.fdci.se',
    dzx: 'https://api.dhamzxploit.my.id',
    bsbt: 'https://bsbt-api-rest.herokuapp.com',
    zahir: 'https://zahirr-web.herokuapp.com',
    zeks: 'https://api.zeks.me',
    hardianto: 'https://hardianto-chan.herokuapp.com',
    pencarikode: 'https://pencarikode.xyz',
    LeysCoder: 'https://leyscoders-api.herokuapp.com',
    adiisus: 'https://adiixyzapi.herokuapp.com',
    lol: 'https://api.lolhuman.xyz',
    fgmods: 'https://api-fgmods.ddns.net',
    Velgrynd: 'https://velgrynd.herokuapp.com',
    rey: 'https://server-api-rey.herokuapp.com',
    shadow: 'https://api.reysekha.xyz',
    apialc: 'https://api-alc.herokuapp.com',
    botstyle: 'https://botstyle-api.herokuapp.com',
    neoxr: 'https://neoxr-api.herokuapp.com',
    ana: 'https://anabotofc.herokuapp.com',
    kanx: 'https://kannxapi.herokuapp.com',
    dhnjing: 'https://dhnjing.xyz'
  },

  // ───── API KEYS ─────
  APIKeys: {

    // ENV (opcional)
    openai: process.env.OPENAI_KEY || '',
    gemini: process.env.GEMINI_KEY || '',
    removebg: process.env.REMOVEBG_KEY || '',
    weather: process.env.WEATHER_KEY || '',

    // Keys Bots
    'https://api-alc.herokuapp.com': 'ConfuMods',
    'https://api.reysekha.xyz': 'apirey',
    'https://melcanz.com': 'F3bOrWzY',
    'https://bx-hunter.herokuapp.com': 'Ikyy69',
    'https://api.xteam.xyz': '5bd33b276d41d6b4',
    'https://zahirr-web.herokuapp.com': 'zahirgans',
    'https://bsbt-api-rest.herokuapp.com': 'benniismael',
    'https://api.zeks.me': 'apivinz',
    'https://hardianto-chan.herokuapp.com': 'hardianto',
    'https://pencarikode.xyz': 'pais',
    'https://api-fgmods.ddns.net': 'fg-dylux',
    'https://leyscoders-api.herokuapp.com': 'MIMINGANZ',
    'https://server-api-rey.herokuapp.com': 'apirey',
    'https://api.lolhuman.xyz': 'GataDiosV2',
    'https://botstyle-api.herokuapp.com': 'Eyar749L',
    'https://neoxr-api.herokuapp.com': 'yntkts',
    'https://anabotofc.herokuapp.com': 'AnaBot'
  },

  // ───── LIMITES ─────
  limits: {
    free: 10,
    premium: 100
  }
}

// 🔥 Normalizar owner JIDs finales
config.owner.jid = config.owner.jid
  .concat(config.owner.numbers.map(toJid))
  .filter(Boolean)

export default config
