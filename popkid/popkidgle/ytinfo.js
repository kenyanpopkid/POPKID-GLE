import config from '../../config.cjs';
import axios from 'axios';

const ytVideo = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  // after command, the rest is the YouTube URL
  const rest = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'ytinfo') {
    if (!rest) {
      return sock.sendMessage(m.from, { text: '❌ You must provide a YouTube link.' }, { quoted: m });
    }

    // Validate/normalize the YouTube URL (you may want to add more validation)
    let ytUrl = rest;
    if (!ytUrl.startsWith('http')) {
      ytUrl = 'https://' + ytUrl;
    }

    const apiKey = config.GTECH_API_KEY;  // you should save your API key in config
    const apiEndpoint = `https://gtech-api-xtp1.onrender.com/api/video/yt?apikey=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(ytUrl)}`;

    try {
      // call the API
      const resp = await axios.get(apiEndpoint);
      const data = resp.data;

      // Check if the API returned an error
      if (!data || data.error) {
        const errMsg = data?.error?.message || 'Failed to fetch video data.';
        return sock.sendMessage(m.from, { text: `❌ Error: ${errMsg}` }, { quoted: m });
      }

      // Format the response message based on the data you get
      // Assuming the API returns something like:
      // { title, description, duration, thumbnail, videoUrl, etc. }
      const { title, description, duration, thumbnail, videoUrl } = data;

      let message = `🎬 *YouTube Video Info*\n\n`;
      message += `*Title:* ${title}\n`;
      message += `*Duration:* ${duration}\n`;
      message += `*Link:* ${videoUrl || ytUrl}\n\n`;
      message += `*Description:*\n${description || 'No description.'}`;

      // If there is a thumbnail, send as image + caption
      if (thumbnail) {
        await sock.sendMessage(
          m.from,
          {
            image: { url: thumbnail },
            caption: message,
          },
          { quoted: m }
        );
      } else {
        await sock.sendMessage(m.from, { text: message }, { quoted: m });
      }
    } catch (err) {
      console.error('ytinfo command error:', err);
      await sock.sendMessage(m.from, { text: '❌ An error occurred when fetching video info.' }, { quoted: m });
    }
  }
};

export default ytVideo;
