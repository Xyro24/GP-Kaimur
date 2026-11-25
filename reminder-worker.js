// ===== Cloudflare Worker: app band ho tab bhi batch ke Telegram group mein reminder =====
// Setup: Cloudflare pe Worker banao, ye code paste karo, phir:
//   Settings > Triggers > Cron: "* * * * *"
//   Settings > Variables/Secrets: BOT_TOKEN, CHAT_B1, CHAT_B2 (Telegram group IDs)

const TT_URL = "https://YOUR-USERNAME.github.io/gpk-hub/data/timetable.json";
const REMIND_MINUTES = 10;
const DAY_KEYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env));
  },
  async fetch() {
    return new Response("GPK reminder worker running");
  },
};

async function run(env) {
  const tt = await (await fetch(TT_URL, { cache: "no-store" })).json();

  // India time (IST = UTC+5:30)
  const ist = new Date(Date.now() + 5.5 * 3600e3);
  const dow = ist.getUTCDay();
  if (dow === 0) return;                       // Sunday
  const day = DAY_KEYS[dow];
  const nowMin = ist.getUTCHours() * 60 + ist.getUTCMinutes();

  for (const [bid, bt] of Object.entries(tt.batches)) {
    const chatId = bid === "B1" ? env.CHAT_B1 : env.CHAT_B2;
    if (!chatId) continue;
    for (let i = 0; i < bt.slots.length; i++) {
      const s = bt.slots[i];
      const cell = bt.grid[day][i];
      if (!cell) continue;
      const [h, m] = s.start.split(":").map(Number);
      if (h * 60 + m - nowMin !== REMIND_MINUTES) continue;   // cron har minute chalta hai
      const mt = cell.match(/^(.+)\((T|L)\)$/);
      const code = mt ? mt[1] : cell;
      const type = mt && mt[2] === "L" ? "Lab" : "Class";
      const name = tt.courses[code] || code;
      const text = `⏰ ${REMIND_MINUTES} min mein ${type}: ${name}\n` +
                   `👨‍🏫 ${bt.teachers[code] || ""}\n` +
                   `🕘 ${s.label} · 🏫 Room ${bt.room}`;
      await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
    }
  }
}
