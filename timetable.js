// ===== Timetable: data/timetable.json se batch ke hisaab se =====
const DAY_KEYS = ["Mon","Tue","Wed","Thu","Fri","Sat"];
let TT = null;
let ttDay = null;

async function loadTT() {
  if (TT) return TT;
  try {
    const r = await fetch("data/timetable.json", { cache: "no-cache" });
    TT = await r.json();
  } catch (e) { TT = null; }
  return TT;
}

// Roll number ke last digits se batch
function getBatch() {
  let info = null;
  try { info = JSON.parse(localStorage.getItem("studentInfo") || "null"); } catch (e) {}
  if (!info || !info.roll) return null;
  const m = String(info.roll).match(/(\d+)\s*$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return BATCHES.find(b => n >= b.from && n <= b.to) || null;
}

function ttSetDay(d) { ttDay = d; renderTimetable(); }

async function renderTimetable() {
  const el = document.getElementById("ttOfficial");
  if (!el) return;
  const data = await loadTT();
  const b = getBatch();
  if (!data) { el.innerHTML = `<div class="card">Timetable load nahi hua. Internet check karo.</div>`; return; }
  if (!b) { el.innerHTML = `<div class="card">Pehle Student profile mein sahi roll number daalo, phir apne batch ka timetable dikhega.</div>`; return; }

  if (!ttDay) {
    const dow = new Date().getDay();            // Sun=0 ... Sat=6
    ttDay = DAY_KEYS[Math.max(0, dow - 1)];     // Sunday ko Monday
  }
  const bt = data.batches[b.id];

  const chips = DAY_KEYS.map(d =>
    `<button class="branch-chip ${d === ttDay ? "active" : ""}" onclick="ttSetDay('${d}')">${d}</button>`).join("");

  const rows = bt.slots.map((s, i) => {
    const cell = bt.grid[ttDay][i];
    if (!cell) {
      return `<div class="tt-slot tt-free"><div class="tt-time">${s.label}</div>
              <div><div class="tt-course">Notional / Self study</div></div></div>`;
    }
    const m = cell.match(/^(.+)\((T|L)\)$/);
    const code = m ? m[1] : cell;
    const isLab = m && m[2] === "L";
    const name = data.courses[code] || code;
    const teacher = bt.teachers[code] || "";
    return `<div class="tt-slot">
      <div class="tt-time">${s.label}</div>
      <div>
        <div class="tt-course">${name}</div>
        <div class="tt-meta">${teacher} · Room ${bt.room}</div>
      </div>
      <span class="tt-tag ${isLab ? "lab" : ""}">${isLab ? "Lab" : "Theory"}</span>
    </div>`;
  }).join("");

  el.innerHTML = `
    <div class="card">
      <div class="field-label">${b.label} · Semester ${data.semester}</div>
      <div class="branch-strip">${chips}</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:10px">
        Lunch 1–2 PM · Effective from ${data.effective_from}
      </div>
      ${rows}
    </div>
    <button class="btn-primary" onclick="enableReminders()">🔔 Class reminders on karo</button>`;
}
