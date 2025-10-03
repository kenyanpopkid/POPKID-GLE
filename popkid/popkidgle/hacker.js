import config from '../../config.cjs';
import axios from 'axios';

const hackerlogo = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "hacker") {
    if (!text) {
      return sock.sendMessage(m.from, { text: `❌ Please provide text.\n\nExample: ${prefix}hacker POPKID` }, { quoted: m });
    }

    try {
      // Call the API
      const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-hacker-style-glitch-text-effect-online-697.html&name=${encodeURIComponent(text)}`;
      const { data } = await axios.get(apiUrl);

      if (!data?.result?.download_url) {
        return sock.sendMessage(m.from, { text: "⚠️ Failed to generate logo. Try again later." }, { quoted: m });
      }

      // Send generated image
      await sock.sendMessage(m.from, {
        image: { url: data.result.download_url },
        caption: `👨‍💻 *Hacker Logo Created*\n\n🖊 Text: ${text}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ-ɢʟᴇ ⚡`
      }, { quoted: m });

    } catch (e) {
      await sock.sendMessage(m.from, { text: `❌ Error: ${e.message}` }, { quoted: m });
    }
  }
};

export default hackerlogo;
