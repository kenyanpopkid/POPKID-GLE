import config from '../../config.cjs';
import axios from 'axios';

const play = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "playnew") {
    if (!text) {
      return sock.sendMessage(m.from, {
        text: `❌ Please provide a song name.\n\nExample: ${prefix}play despacito`
      }, { quoted: m });
    }

    try {
      const apiUrl = "https://api.vreden.my.id/api/ytplaymp3?query=" + encodeURIComponent(text);
      const { data } = await axios.get(apiUrl);

      if (data.status !== 200 || !data.result?.status) {
        return sock.sendMessage(m.from, { text: "⚠️ Failed to fetch song from API." }, { quoted: m });
      }

      const { metadata, download } = data.result;

      let caption = `🎶 *Now Playing*\n\n`;
      caption += `📌 *Title:* ${metadata.title}\n`;
      caption += `👤 *Artist:* ${metadata.author.name}\n`;
      caption += `⏱ *Duration:* ${metadata.timestamp}\n`;
      caption += `🔗 *URL:* ${metadata.url}\n`;

      // Send thumbnail + caption first
      await sock.sendMessage(m.from, {
        image: { url: metadata.thumbnail },
        caption
      }, { quoted: m });

      // Send audio file
      await sock.sendMessage(m.from, {
        audio: { url: download.url },
        mimetype: "audio/mpeg",
        fileName: `${download.filename || metadata.title}.mp3`
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      sock.sendMessage(m.from, { text: "❌ Error fetching music, try again later." }, { quoted: m });
    }
  }
};

export default play;
