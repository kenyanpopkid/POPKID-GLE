import config from '../../config.cjs';
import axios from "axios";
import yts from "yt-search";

const play = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "play") {
    if (!text) {
      return sock.sendMessage(m.from, { text: "❌ Please provide a song name!" }, { quoted: m });
    }

    await m.React('🎶'); // reaction while searching

    try {
      // 🔍 Search song
      const search = await yts(text);
      const video = search.videos[0];
      if (!video) {
        return sock.sendMessage(m.from, { text: "❌ No results found." }, { quoted: m });
      }

      // 🎵 Download audio
      const apiUrl = `https://jawad-tech.vercel.app/download/yt?url=${encodeURIComponent(video.url)}`;
      const res = await axios.get(apiUrl);

      if (!res.data.status) {
        return sock.sendMessage(m.from, { text: "❌ Failed to fetch audio. Try again later." }, { quoted: m });
      }

      // 📀 Send details first
      const caption = `🎧 *Now Playing...*\n\n` +
        `*🎵 Title:* ${video.title}\n` +
        `*📺 Channel:* ${video.author.name}\n` +
        `*⏳ Duration:* ${video.timestamp}\n` +
        `*👀 Views:* ${video.views.toLocaleString()}\n` +
        `*🔗 Link:* ${video.url}\n\n` +
        `⚡ Powered by *GLE-BOT*`;

      await sock.sendMessage(m.from, {
        image: { url: video.thumbnail },
        caption,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true
        }
      }, { quoted: m });

      // 🎼 Send audio
      await sock.sendMessage(m.from, {
        audio: { url: res.data.result },
        mimetype: "audio/mpeg",
        ptt: false,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true
        }
      }, { quoted: m });

    } catch (e) {
      console.error("❌ Play command error:", e);
      sock.sendMessage(m.from, { text: "⚠️ Error while processing your request." }, { quoted: m });
    }
  }
};

export default play;
