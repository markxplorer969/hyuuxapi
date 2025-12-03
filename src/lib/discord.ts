import axios from "axios";

const WEBHOOK_URL = " https://discord.com/api/webhooks/1445670315094179880/YHnDe-O96Ae6htaVjJfg4qllfH4yuzH5gWymuruSTggHN_yiozlGPL3dlV3baBT-x9of";

export async function sendToDiscord({
  ip,
  endpoint,
  method,
  query,
  response,
}: {
  ip: string;
  endpoint: string;
  method: string;
  query?: any;
  response?: any;
}) {
  try {
    if (!WEBHOOK_URL) {
      console.log("[Discord Logger] Missing DISCORD_WEBHOOK_URL");
      return;
    }

    const embed = {
      title: "📥 API Request Received",
      color: 0x5865f2, // Discord blurple
      fields: [
        {
          name: "🌐 IP",
          value: `\`${ip}\``,
          inline: true,
        },
        {
          name: "📌 Endpoint",
          value: `\`${endpoint}\``,
        },
        {
          name: "🛠 Method",
          value: `\`${method}\``,
          inline: true,
        },
        {
          name: "📥 Request",
          value:
            "```json\n" +
            JSON.stringify(query || {}, null, 2).slice(0, 1950) +
            "\n```",
        },
        {
          name: "📤 Response",
          value:
            "```json\n" +
            JSON.stringify(response || {}, null, 2).slice(0, 1950) +
            "\n```",
        },
      ],
      timestamp: new Date().toISOString(),
    };

    await axios.post(WEBHOOK_URL, {
      username: "Slowly API Logger",
      avatar_url:
        "https://cdn.discordapp.com/embed/avatars/0.png",
      embeds: [embed],
    });
  } catch (err: any) {
    console.error("[Discord Logger Error]:", err?.response?.data || err);
  }
}
