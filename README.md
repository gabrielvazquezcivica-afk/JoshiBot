<!-- JOSHI BOT README --><!-- Animated Title (SVG, no GIF) --><div align="center"><svg width="100%" height="120" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff0000" />
      <stop offset="50%" stop-color="#00ff00" />
      <stop offset="100%" stop-color="#ff0000" />
    </linearGradient>
    <style>
      .title { font: 900 72px 'Arial', sans-serif; fill: url(#rg); }
      .pulse { animation: pulse 2.5s ease-in-out infinite; }
      @keyframes pulse {
        0% { letter-spacing: 2px; opacity: 1; }
        50% { letter-spacing: 6px; opacity: .9; }
        100% { letter-spacing: 2px; opacity: 1; }
      }
    </style>
  </defs>
  <text x="50%" y="78" text-anchor="middle" class="title pulse">JOSHI BOT</text>
</svg><p><b>Bot de WhatsApp • Estable • Optimizado para Termux</b></p><!-- Buttons --><p>
  <a href="https://f-droid.org/repo/com.termux_118.apk">
    <img alt="Descargar Termux" src="https://img.shields.io/badge/Descargar-Termux-1a1a1a?style=for-the-badge&logo=android" />
  </a>
  <a href="https://wa.me/523310167470">
    <img alt="Contacto WhatsApp" src="https://img.shields.io/badge/WhatsApp-Soporte-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
  </a>
</p></div>
---

📌 Descripción

JOSHI BOT es un bot de WhatsApp enfocado en grupos y uso diario, diseñado para correr de forma estable en Termux. Incluye administración de grupos, respuestas rápidas y módulos personalizables.

> ⚠️ Este README es detallado, ordenado y sin GIFs. Cada paso está separado para facilitar la copia.




---

📱 Requisitos

Teléfono Android

Conexión a internet estable

Termux (desde F-Droid)



---

🚀 Instalación en Termux

Sigue los pasos en orden. Cada bloque tiene su propio botón de copiar.

1️⃣ Actualizar paquetes

pkg update && pkg upgrade

2️⃣ Instalar dependencias básicas

pkg install -y git nodejs ffmpeg imagemagick

3️⃣ Clonar el repositorio de JOSHI BOT

git clone https://github.com/USUARIO/JOSHI-BOT

4️⃣ Entrar a la carpeta del bot

cd JOSHI-BOT

5️⃣ Instalar dependencias del bot

npm install


---

▶️ Iniciar JOSHI BOT

Ejecuta el bot y escanea el QR con WhatsApp:

npm start

Cuando veas el mensaje de conexión exitosa, el bot estará activo.


---

⚙️ Configuración básica

Edita el archivo de configuración para cambiar:

Prefijo de comandos

Número de dueño

Mensaje de bienvenida


Reinicia el bot después de cada cambio.



---

🧩 Funciones destacadas

Administración de grupos

Ocultar etiquetas (hidetag)

Borrado de mensajes por admins

Respuestas multimedia

Sistema modular (plugins)



---

🔐 Recomendaciones

Mantén Termux actualizado

No compartas tu sesión

Usa el bot solo en grupos autorizados



---

📞 Soporte

¿Problemas o dudas?

👉 WhatsApp: +52 33 1016 7470

<a href="https://wa.me/523310167470">
  <img alt="Soporte WhatsApp" src="https://img.shields.io/badge/Soporte-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
</a>
---

<div align="center">
<b>Hecho con ❤️ para la comunidad</b>
</div>
