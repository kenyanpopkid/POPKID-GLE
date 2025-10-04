import config from '../../config.cjs';
import acrcloud from 'acrcloud';

// Initialize ACRCloud client
const acr = new acrcloud({
    host: "identify-ap-southeast-1.acrcloud.com",
    access_key: "ee1b81b47cf98cd73a0072a761558ab1",
    access_secret: "ya9OPe8onFAnNkyf9xMTK8qRyMGmsghfuHrIMmUI"
});

const BOT_FOOTER = '*⚡ Powered by POPKID GLE ⚡*'; // Simplified footer

// --- UTILITY FUNCTIONS (FROM YOUR ORIGINAL CODE) ---

async function identifyMusic(buffer) {
    let data = (await acr.identify(buffer)).metadata
    if (!data.music) return []

    return data.music.map(track => ({
        title: track.title,
        artist: track.artists[0].name,
        duration: formatTime(track.duration_ms),
        url: Object.keys(track.external_metadata).map(platform =>
            platform === "youtube"
                ? "https://youtu.be/" + track.external_metadata[platform].vid
                : platform === "deezer"
                    ? "https://www.deezer.com/us/track/" + track.external_metadata[platform].track.id
                    : platform === "spotify"
                        ? "https://open.spotify.com/track/" + track.external_metadata[platform].track.id
                        : ""
        ).filter(x => x) // Filter out empty strings
    }))
}

function formatTime(ms) {
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [m, s].map(v => v.toString().padStart(2, "0")).join(":")
}

// --- MAIN COMMAND HANDLER ---

const shazam = async (m, sock) => {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    if (cmd === "shazam" || cmd === "shazam") {
        const quotedMsg = m.quoted ? m.quoted : m;
        
        // 1. Check for quoted audio message
        if (!quotedMsg.mimetype || !quotedMsg.mimetype.includes("audio")) {
            // Clean Usage Error
            const usageText = `
*🎶 SHAZAM / MUSIC IDENTIFICATION 🎶*
---------------------------------
❌ *ERROR:* Please reply to an *audio* or *voice note* to identify the song.
*USAGE:* .${cmd} (reply to audio)
---------------------------------
${BOT_FOOTER}
`.trim();
            return sock.sendMessage(m.from, { text: usageText }, { quoted: m });
        }

        // 2. Start Processing
        await m.React('⏳');
        
        let buffer;
        try {
            buffer = await quotedMsg.download();
        } catch (e) {
             console.error("Shazam download error:", e);
             await m.React('🚨');
             const errorText = `
*🚨 DOWNLOAD FAILED*
Could not download the audio file. Please try again.
${BOT_FOOTER}
`.trim();
             return sock.sendMessage(m.from, { text: errorText }, { quoted: m });
        }

        try {
            const results = await identifyMusic(buffer);
            
            // 3. Check if song was found
            if (!results.length) {
                await m.React('💔');
                const notFoundText = `
*💔 NOT FOUND*
No song data found for this audio.
Try a clearer or longer snippet.
${BOT_FOOTER}
`.trim();
                return sock.sendMessage(m.from, { text: notFoundText }, { quoted: m });
            }

            // 4. Format Stylish Success Message (Box-Free)
            let messageText = '*✨ SONG IDENTIFIED ✨*\n\n';
            
            for (const result of results) {
                const links = result.url.map(i => ` • ${i}`).join('\n');
                
                messageText += 
`*TITLE:* _${result.title}_
*ARTIST:* *${result.artist}*
*DURATION:* ${result.duration}
*LINKS:*
${links}
---------------------------------
`;
            }

            const finalMessage = messageText.trim() + `\n\n${BOT_FOOTER}`;

            // 5. Send the final stylized message
            await sock.sendMessage(m.from, { text: finalMessage }, { quoted: m });
            await m.React('✅');

        } catch (error) {
            console.error("Shazam identification error:", error);
            await m.React('🚨');
            const errorText = `
*🚨 SYSTEM ERROR*
An unexpected error occurred during identification.
Please check the bot console or try again later.
${BOT_FOOTER}
`.trim();
            sock.sendMessage(m.from, { text: errorText }, { quoted: m });
        }
    }
}

export default shazam;
