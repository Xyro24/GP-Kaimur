// ===== Class reminders (jab app khuli ho) =====
// App band hone par reminder ke liye worker/reminder-worker.js (Telegram) use hota hai.

async function enableReminders() {
  if (!("Notification" in window)) { alert("Is browser mein notification support nahi hai."); return; }
  const p = await Notification.requestPermission();
  alert(p === "granted"
    ? "Reminders on ho gaye! Class se " + REMIND_MINUTES + " minute pehle notification aayega."
    : "Notification permission nahi mili. Browser settings mein allow karo.");
}

function notifyUser(title, body, tag) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (navigator.serviceWorker && navigator.serviceWorker.ready) {
    navigator.serviceWorker.ready
      .then(reg => reg.showNotification(title, { body, tag }))
      .catch(() => new Notification(title, { body, tag }));
  } else {
    new Notification(title, { body, tag });
  }
}

async function checkReminders() {
  const data = await loadTT();
  const b = getBatch();
  if (!data || !b) return;
  const now = new Date();
  const dow = now.getDay();
  if (dow === 0) return;                       // Sunday
  const day = DAY_KEYS[dow - 1];
  const bt = data.batches[b.id];

  bt.slots.forEach((s, i) => {
    const cell = bt.grid[day][i];
    if (!cell) return;
    const [hh, mm] = s.start.split(":").map(Number);
    const start = new Date(now);
    start.setHours(hh, mm, 0, 0);
    const diffMin = (start - now) / 60000;
    const key = `rem-${now.toDateString()}-${day}-${i}`;
    if (diffMin > 0 && diffMin <= REMIND_MINUTES && !localStorage.getItem(key)) {
      localStorage.setItem(key, "1");
      const m = cell.match(/^(.+)\((T|L)\)$/);
      const code = m ? m[1] : cell;
      const type = m && m[2] === "L" ? "Lab" : "Class";
      const name = data.courses[code] || code;
      notifyUser(`${REMIND_MINUTES} min mein ${type}: ${name}`,
                 `${bt.teachers[code] || ""} · Room ${bt.room} · ${s.label}`, key);
    }
  });
}

setInterval(checkReminders, 60000);
checkReminders();
