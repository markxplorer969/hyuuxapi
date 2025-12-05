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

export async function logPlanPurchaseToDiscord({
  userId,
  planId,
  planName,
  amount,
  customerName,
  customerEmail,
  merchantRef,
  status,
  ip,
  method = 'QRIS',
  expiredTime,
}: {
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  merchantRef: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  ip: string;
  method?: string;
  expiredTime?: number;
}) {
  try {
    if (!WEBHOOK_URL) {
      console.log("[Discord Logger] Missing DISCORD_WEBHOOK_URL");
      return;
    }

    const getMethodIcon = (method: string) => {
      switch (method) {
        case 'QRIS': return '📱';
        case 'DANA': return '💰';
        case 'OVO': return '🟣';
        case 'SHOPEEPAY': return '🟠';
        case 'GOPAY': return '🟢';
        default: return '💳';
      }
    };

    const embed = {
      title: status === "PENDING" ? "🛒 Plan Purchase Initiated" : 
             status === "SUCCESS" ? "✅ Plan Purchase Successful" : "❌ Plan Purchase Failed",
      color: status === "PENDING" ? 0xffaa00 : 
             status === "SUCCESS" ? 0x00ff00 : 0xff0000,
      fields: [
        {
          name: "👤 User",
          value: `\`${customerName}\` (${customerEmail})`,
          inline: true,
        },
        {
          name: "🆔 User ID",
          value: `\`${userId}\``,
          inline: true,
        },
        {
          name: "📦 Plan",
          value: `\`${planName}\` (${planId})`,
          inline: true,
        },
        {
          name: "💰 Amount",
          value: `\`Rp ${amount.toLocaleString('id-ID')}\``,
          inline: true,
        },
        {
          name: `${getMethodIcon(method)} Payment Method`,
          value: `\`${method}\``,
          inline: true,
        },
        {
          name: "🧾 Merchant Ref",
          value: `\`${merchantRef}\``,
        },
        ...(expiredTime ? [{
          name: "⏰ Valid For",
          value: `\`${expiredTime} minutes\``,
          inline: true,
        }] : []),
        {
          name: "🌐 IP Address",
          value: `\`${ip}\``,
          inline: true,
        },
        {
          name: "📅 Timestamp",
          value: `\`${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\``,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Slowly API Payment System",
        icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
      },
    };

    await axios.post(WEBHOOK_URL, {
      username: "Slowly API Payments",
      avatar_url:
        "https://cdn.discordapp.com/embed/avatars/0.png",
      embeds: [embed],
    });
  } catch (err: any) {
    console.error("[Discord Payment Logger Error]:", err?.response?.data || err);
  }
}
