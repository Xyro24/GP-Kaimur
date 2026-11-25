// ===== GPK Hub CONFIG: sirf yahan badlo, code mein haath mat lagao =====

// AI Buddy ka server proxy (Cloudflare Worker URL)
const AI_ENDPOINT = "https://YOUR-WORKER.workers.dev/ai";

// Password ka SHA-256 hash (README mein steps hain). Khali = login band.
const TEACHER_HASH = "";
const ADMIN_HASH = "";

// Admin ka Telegram ID
const ADMIN_TG_ID = 6498954053;

// Class se kitne minute pehle reminder aaye
const REMIND_MINUTES = 10;

// Batch ranges: roll number ke last digits se batch pehchana jayega
// NOTE: Batch 2 ka range confirm karo (aapne 66-650 likha tha)
const BATCHES = [
  { id: "B1", label: "Batch 1 (CE B1)", from: 1,  to: 65  },
  { id: "B2", label: "Batch 2 (CE B2)", from: 66, to: 650 },
];

// Civil semester Drive folders (Sem 1 se 6)
const civilLinks = [
  "https://drive.google.com/drive/folders/1XM8ddyBa557rif1GH6bspAMeHbr4n_4Y",
  "https://drive.google.com/drive/folders/1ZEMyELCH7vsrtFLD_fA7cRVWS41n2S8g",
  "https://drive.google.com/drive/folders/1dju1gRp-zrNaycEaVZaV8o6u-bYO60qu",
  "https://drive.google.com/drive/folders/1u721OCadi0pu84_T56u_UfpFWLjnome6",
  "https://drive.google.com/drive/folders/1aNk6jJ1w48TghvgjxWShApwMxfWl9FlP",
  "https://drive.google.com/drive/folders/1SMh_VjVGeH68mVq_yz9nTg1XJAdDLTY6",
];
