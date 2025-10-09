const { cmd } = require("../command");
const axios = require("axios");
const yts = require("yt-search");

cmd({
  pattern: "play",
  alias: ["song", "ytmp3"],
  desc: "Download a YouTube song by name or link.",
  category: "music",
  react: "🎶",
  filename: __filename
},
async (conn, m, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a song name or YouTube link!\nExample: `.play despacito`");

    reply("🔎 Searching for your song... Please wait 🎧");

    // 🔍 Search song
    const search = await yts(q);
    const video = search.videos[0];
    if (!video) {
      return conn.sendMessage(from, { text: "❌ No results found for that song." }, { quoted: m });
    }

    // 🎵 Song details
    const title = video.title;
    const views = video.views;
    const duration = video.timestamp;
    const thumbnail = video.thumbnail;
    const link = video.url;

    // 🪄 Try fetching download link
    const apiUrl = `https://jawad-tech.vercel.app/download/yt?url=${encodeURIComponent(link)}`;
    const res = await axios.get(apiUrl);

    if (!res.data || !res.data.status || !res.data.data || !res.data.data.audio) {
      return conn.sendMessage(from, { text: "❌ Failed to fetch audio. Please try again later." }, { quoted: m });
    }

    const audioUrl = res.data.data.audio;

    // 🎧 Send song info first
    await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: `🎵 *${title}*\n🕒 *Duration:* ${duration}\n👁️ *Views:* ${views}\n\n📥 Downloading and sending audio...`,
    }, { quoted: m });

    // 🎶 Send audio file
    await conn.sendMessage(from, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: m });

  } catch (error) {
    console.error("Play Command Error:", error);
    reply(`❌ Error: ${error.message || "Something went wrong while processing your request."}`);
  }
});
