

// TELEGRAM + ADMIN DETECT
const tg = window.Telegram?.WebApp;
let tgUser = null;
let isAdmin = false;

(function initTelegram() {
  if (tg) {
    tg.ready(); tg.expand();
    try { tg.setHeaderColor('#07080f'); tg.setBackgroundColor('#07080f'); } catch(e){}
    const u = tg.initDataUnsafe?.user;
    if (u) {
      tgUser = u;
      const full = [u.first_name, u.last_name].filter(Boolean).join(' ');
      document.getElementById("heroName").textContent = full;
      // Avatar initials
      const initials = full.trim().split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
      const av = document.getElementById('heroAvatar');
      if(av) av.textContent = initials;
      // Show Telegram ID badge in hero
      const badge = document.createElement('div');
      badge.className = 'admin-id-badge';
      badge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.48 2 2 0 0 1 3.62 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ID: ' + u.id;
      document.querySelector('.hero-sub')?.after(badge);

      // ADMIN CHECK
      if (Number(u.id) === ADMIN_TG_ID) {
        isAdmin = true;
        const adminBtn = document.getElementById("adminBtn");
        if (adminBtn) adminBtn.style.display = "flex";
        // Auto-unlock admin
        localStorage.setItem("adminUnlocked", "yes");
      }
    }
  } else {
    // Browser fallback — demo mode
    document.getElementById("heroName").textContent = "Student";
  }
})();

// THEME
let isDark = localStorage.getItem("theme") !== "light";
function applyTheme(){document.body.setAttribute("data-theme",isDark?"dark":"light");/* theme icon handled by SVG */;const l=document.getElementById("themeLabel");if(l)l.textContent=isDark?"Dark":"Light";localStorage.setItem("theme",isDark?"dark":"light")}
function toggleTheme(){isDark=!isDark;applyTheme()}
applyTheme();

// NAVIGATION
function showPage(name){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById(`page-${name}`)?.classList.add("active");
  document.getElementById(`nav-${name}`)?.classList.add("active");
  if(name==="attendance")renderSubjects();
  if(name==="timetable")renderTimetable();
  if(name==="study")renderStudy();
  if(name==="exam")renderExams();
  if(name==="more"){renderAssignments();renderNotices()}
}

// DAILY QUOTE
const quotes=[
  {text:"The engineer has been, and is, a maker of history.",author:"James Kip Finch"},
  {text:"Science can amuse us, but it is engineering that changes the world.",author:"Isaac Asimov"},
  {text:"Education is the most powerful weapon to change the world.",author:"Nelson Mandela"},
  {text:"Success is the sum of small efforts repeated day in and day out.",author:"Robert Collier"},
  {text:"Don't watch the clock; do what it does. Keep going.",author:"Sam Levenson"},
  {text:"Hard work beats talent when talent doesn't work hard.",author:"Tim Notke"},
  {text:"The secret of getting ahead is getting started.",author:"Mark Twain"},
  {text:"Believe you can and you're halfway there.",author:"Theodore Roosevelt"},
  {text:"An engineer can do with one dollar what any fool can do with two.",author:"Arthur M. Wellington"},
  {text:"Zindagi mein shortcuts nahi hote, sirf mehnat ka raasta hota hai.",author:"Unknown"},
  {text:"Padhai karo, kyunki koi bhi degree chheen nahi sakta.",author:"Unknown"},
  {text:"A smooth sea never made a skilled sailor.",author:"Franklin D. Roosevelt"},
  {text:"Good engineers make things work. Great engineers make things simple.",author:"Unknown"},
  {text:"The strength of the structure is in the foundation.",author:"Civil Proverb"},
];
function loadQuote(){
  const d=Math.floor((new Date()-new Date(new Date().getFullYear(),0,0))/86400000);
  const q=quotes[d%quotes.length];
  document.getElementById("quoteText").textContent=q.text;
  document.getElementById("quoteAuthor").textContent="— "+q.author;
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],now=new Date();
  document.getElementById("quoteDay").textContent=`${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
}
loadQuote();

function openLink(url){if(tg)tg.openLink(url);else window.open(url,"_blank")}

// BRANCHES
const branches={
  "Civil":["Foundation Maths & Drawing","Applied Mechanics & Surveying-1","Soil Mechanics & Hydraulics","Advanced Surveying & TOS","RCC & Estimation","Advanced Structures"],
  "Mechanical":["Engg Maths & Physics","Engg Drawing & Workshop","Thermodynamics & Fluid Mech","Manufacturing Processes","Machine Design","Industrial Engg"],
  "Electrical":["Basic Electrical & Maths","Circuit Theory & Machines","Power Systems & Electronics","Control Systems","Power Electronics","Electrical Drives"],
  "CS":["Programming Fundamentals","Data Structures & DBMS","OS & Networks","Web Development","Software Engineering","AI & Project"],
  "Electronics":["Basic Electronics & Maths","Analog & Digital Circuits","Microprocessors & PCB","Communication Systems","Embedded Systems","VLSI & Project"],
};
let activeBranch="Civil";

// Civil branch actual Google Drive links

function renderStudy(){
  document.getElementById("branchStrip").innerHTML=Object.keys(branches).map(b=>`<button class="branch-chip ${b===activeBranch?'active':''}" onclick="setBranch('${b}')">${b}</button>`).join("");
  document.getElementById("branchLabel").textContent=activeBranch;
  const ords=["1st","2nd","3rd","4th","5th","6th"];
  document.getElementById("semGrid").innerHTML=branches[activeBranch].map((s,i)=>{
    // Use actual links for Civil, placeholder for others
    const link = activeBranch==="Civil" ? civilLinks[i] : null;
    const attrs = link ? `onclick="openLink('${link}')"` : `style="opacity:.5;cursor:default"`;
    const soon = link ? "" : `<div class="sem-ord" style="color:var(--gold)">Coming soon</div>`;
    return `<div class="sem-tile" ${attrs}><div class="sem-num">${i+1}</div><div class="sem-ord">${ords[i]} Sem</div><div class="sem-label">${s}</div>${soon}</div>`;
  }).join("");
}
function setBranch(b){activeBranch=b;renderStudy()}

// ATTENDANCE
let subjects=JSON.parse(localStorage.getItem("att_subjects")||"[]");
function addSubject(){const v=document.getElementById("subjectInput").value.trim();if(!v)return;subjects.push({name:v,present:0,absent:0});localStorage.setItem("att_subjects",JSON.stringify(subjects));document.getElementById("subjectInput").value="";renderSubjects()}
function mark(i,type){subjects[i][type]++;localStorage.setItem("att_subjects",JSON.stringify(subjects));renderSubjects()}
function delSubject(i){subjects.splice(i,1);localStorage.setItem("att_subjects",JSON.stringify(subjects));renderSubjects()}
function renderSubjects(){
  const el=document.getElementById("subjectList");
  if(!subjects.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="opacity:.4"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div><div class="empty-text">No subjects added yet</div></div>`;return}
  el.innerHTML=subjects.map((s,i)=>{
    const total=s.present+s.absent,pct=total?Math.round(s.present/total*100):0;
    const cls=pct>=75?"pct-good":pct>=65?"pct-warn":"pct-bad";
    const bar=pct>=75?"var(--success)":pct>=65?"var(--warn)":"var(--danger)";
    return`<div class="att-card"><div class="att-header"><div class="att-subject-name">${s.name}</div><div class="att-pct ${cls}">${pct}%</div></div><div class="pct-bar"><div class="pct-fill" style="width:${pct}%;background:${bar}"></div></div><div class="att-counts">P: ${s.present} | A: ${s.absent} | Total: ${total}</div><div class="att-actions"><button class="att-btn btn-present" onclick="mark(${i},'present')">✓ Present</button><button class="att-btn btn-absent" onclick="mark(${i},'absent')">✗ Absent</button><button class="att-btn btn-del" onclick="delSubject(${i})">Del</button></div></div>`;
  }).join("");
}

// TIMETABLE
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat"];
let activeDay="Mon",tt=JSON.parse(localStorage.getItem("timetable")||"{}");
function setDay(d){activeDay=d;renderTimetable()}
function addPeriod(){const sub=document.getElementById("ttSub").value.trim(),teacher=document.getElementById("ttTeacher").value.trim(),time=document.getElementById("ttTime").value.trim();if(!sub||!time)return;if(!tt[activeDay])tt[activeDay]=[];tt[activeDay].push({sub,teacher,time});localStorage.setItem("timetable",JSON.stringify(tt));document.getElementById("ttSub").value="";document.getElementById("ttTeacher").value="";document.getElementById("ttTime").value="";renderPeriods()}
function delPeriod(i){tt[activeDay].splice(i,1);localStorage.setItem("timetable",JSON.stringify(tt));renderPeriods()}
function renderPeriods(){const el=document.getElementById("periodList"),periods=tt[activeDay]||[];if(!periods.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="opacity:.4"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div><div class="empty-text">No classes for ${activeDay}</div></div>`;return}el.innerHTML=periods.map((p,i)=>`<div class="period-row"><div class="period-time">${p.time}</div><div class="period-info"><div class="period-name">${p.sub}</div><div class="period-teacher">${p.teacher||"—"}</div></div><button class="period-del-btn" onclick="delPeriod(${i})">&#x2715;</button></div>`).join("")}

// EXAM SCHEDULE
let exams=JSON.parse(localStorage.getItem("exams")||"[]");
function addExam(){const sub=document.getElementById("examSub").value.trim(),date=document.getElementById("examDate").value,time=document.getElementById("examTime").value.trim(),venue=document.getElementById("examVenue").value.trim();if(!sub||!date)return;exams.push({sub,date,time,venue});exams.sort((a,b)=>new Date(a.date)-new Date(b.date));localStorage.setItem("exams",JSON.stringify(exams));document.getElementById("examSub").value="";document.getElementById("examDate").value="";document.getElementById("examTime").value="";document.getElementById("examVenue").value="";renderExams()}
function delExam(i){exams.splice(i,1);localStorage.setItem("exams",JSON.stringify(exams));renderExams()}
function renderExams(){
  const el=document.getElementById("examList");
  if(!exams.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="opacity:.4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="empty-text">No exams added yet</div></div>`;return}
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  el.innerHTML=exams.map((e,i)=>{
    const d=new Date(e.date);
    return`<div class="exam-card"><div class="exam-date-box"><div class="exam-day">${d.getDate()}</div><div class="exam-month">${months[d.getMonth()]}</div></div><div style="flex:1"><div class="exam-subject">${e.sub}</div><div class="exam-time">${e.time||"Time TBD"}${e.venue?" · "+e.venue:""}</div></div><button class="exam-del" onclick="delExam(${i})">✕</button></div>`;
  }).join("");
}

// CANTEEN MENU
const canteenMenu={
  Mon:[{name:"Poha + Chai",time:"Breakfast 7-9AM",price:"₹20"},{name:"Dal Rice + Sabji",time:"Lunch 1-2PM",price:"₹40"},{name:"Roti + Dal",time:"Dinner 8-9PM",price:"₹35"}],
  Tue:[{name:"Bread Omelette + Chai",time:"Breakfast 7-9AM",price:"₹25"},{name:"Rajma Rice",time:"Lunch 1-2PM",price:"₹45"},{name:"Roti + Sabji",time:"Dinner 8-9PM",price:"₹35"}],
  Wed:[{name:"Upma + Chai",time:"Breakfast 7-9AM",price:"₹20"},{name:"Chhole Rice",time:"Lunch 1-2PM",price:"₹40"},{name:"Puri + Sabji",time:"Dinner 8-9PM",price:"₹40"}],
  Thu:[{name:"Paratha + Curd",time:"Breakfast 7-9AM",price:"₹30"},{name:"Kadhi Rice",time:"Lunch 1-2PM",price:"₹40"},{name:"Roti + Dal",time:"Dinner 8-9PM",price:"₹35"}],
  Fri:[{name:"Idli Sambar",time:"Breakfast 7-9AM",price:"₹25"},{name:"Mix Veg Rice",time:"Lunch 1-2PM",price:"₹40"},{name:"Roti + Paneer",time:"Dinner 8-9PM",price:"₹50"}],
  Sat:[{name:"Puri Bhaji",time:"Breakfast 7-9AM",price:"₹30"},{name:"Special Biryani",time:"Lunch 1-2PM",price:"₹55"},{name:"Roti + Dal",time:"Dinner 8-9PM",price:"₹35"}],
};
const menuDays=["Mon","Tue","Wed","Thu","Fri","Sat"];
let activeMenuDay=menuDays[new Date().getDay()===0?0:new Date().getDay()-1]||"Mon";
function renderCanteen(){
  document.getElementById("menuDayStrip").innerHTML=menuDays.map(d=>`<button class="menu-day-chip ${d===activeMenuDay?'active':''}" onclick="setMenuDay('${d}')">${d}</button>`).join("");
  renderMenu();
}
function setMenuDay(d){activeMenuDay=d;renderCanteen()}
function renderMenu(){
  const items=canteenMenu[activeMenuDay]||[];
  document.getElementById("menuList").innerHTML=items.map(m=>`<div class="menu-item"><div><div class="menu-name">${m.name}</div><div class="menu-time">${m.time}</div></div><div class="menu-price">${m.price}</div></div>`).join("");
}

// TEACHER PANEL
async function sha256(text){
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,"0")).join("");
}
async function unlockTeacher(){
  const pass=document.getElementById("teacherPass").value;
  if(TEACHER_HASH && await sha256(pass)===TEACHER_HASH){document.getElementById("teacherLocked").style.display="none";document.getElementById("teacherPanel").style.display="block";localStorage.setItem("teacherUnlocked","yes")}
  else{alert("Wrong password!")}
}
function lockTeacher(){document.getElementById("teacherLocked").style.display="block";document.getElementById("teacherPanel").style.display="none";localStorage.removeItem("teacherUnlocked")}
if(localStorage.getItem("teacherUnlocked")==="yes"){document.getElementById("teacherLocked").style.display="none";document.getElementById("teacherPanel").style.display="block"}

// NOTICES
let notices=JSON.parse(localStorage.getItem("notices")||"[]");
function postNotice(){
  const title=document.getElementById("noticeTitle").value.trim(),body=document.getElementById("noticeBody").value.trim();
  if(!title||!body)return;
  const now=new Date();
  notices.unshift({title,body,date:now.toLocaleDateString()});
  localStorage.setItem("notices",JSON.stringify(notices));
  document.getElementById("noticeTitle").value="";
  document.getElementById("noticeBody").value="";
  renderNotices();alert("Notice posted!")
}
function renderNotices(){
  const el=document.getElementById("noticeList");
  const welcome=`<div class="notice-item"><div class="notice-title-text">Welcome to GPK Hub!</div><div class="notice-body">All-in-one student companion for Government Polytechnic Kaimur.</div><div class="notice-date">Today</div></div>`;
  if(!notices.length){el.innerHTML=welcome;return}
  el.innerHTML=notices.map(n=>`<div class="notice-item"><div class="notice-title-text">${n.title}</div><div class="notice-body">${n.body}</div><div class="notice-date">${n.date}</div></div>`).join("")+welcome;
}

// ASSIGNMENTS
let assignments=JSON.parse(localStorage.getItem("assignments")||"[]");
function postAssignment(){
  const sub=document.getElementById("assignSub").value.trim(),title=document.getElementById("assignTitle").value.trim(),due=document.getElementById("assignDue").value,desc=document.getElementById("assignDesc").value.trim();
  if(!sub||!title)return;
  assignments.unshift({sub,title,due,desc});
  localStorage.setItem("assignments",JSON.stringify(assignments));
  document.getElementById("assignSub").value="";document.getElementById("assignTitle").value="";document.getElementById("assignDue").value="";document.getElementById("assignDesc").value="";
  renderAssignments();alert("Assignment posted!")
}
function renderAssignments(){
  const el=document.getElementById("assignmentList");
  if(!assignments.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="opacity:.4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="empty-text">No assignments posted yet</div></div>`;return}
  el.innerHTML=assignments.map(a=>`<div class="assignment-card"><div class="assignment-title">${a.title}</div><div class="assignment-sub">Subject: ${a.sub}${a.desc?" · "+a.desc:""}</div>${a.due?`<div class="assignment-due">Due: ${new Date(a.due).toLocaleDateString()}</div>`:""}</div>`).join("");
}

// TEACHER ADD EXAM
function teacherAddExam(){
  const sub=document.getElementById("tExamSub").value.trim(),date=document.getElementById("tExamDate").value,time=document.getElementById("tExamTime").value.trim();
  if(!sub||!date)return;
  exams.push({sub,date,time,venue:"Exam Hall"});
  exams.sort((a,b)=>new Date(a.date)-new Date(b.date));
  localStorage.setItem("exams",JSON.stringify(exams));
  document.getElementById("tExamSub").value="";document.getElementById("tExamDate").value="";document.getElementById("tExamTime").value="";
  alert("Exam date added!")
}

// AI BUDDY
async function sendAI(){
  const input=document.getElementById("aiInput");
  const q=input.value.trim();if(!q)return;
  input.value="";
  const now=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  addBubble(q,"user",now);
  const thinkEl=addThinking();
  try{
    const res=await fetch(AI_ENDPOINT,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"llama-3.1-8b-instant",
        messages:[
          {role:"system",content:`Tu ek friendly AI buddy hai Government Polytechnic Kaimur, Bihar ke students ka. Tu unka best dost, senior aur mentor hai.

Teri personality:
- Caring senior jaisa baat kar — "yaar", "bhai", "dost" use kar freely
- Fun aur relatable reh — kabhi boring mat ban
- Sab branches help kar: Civil, Mechanical, Electrical, CS, Electronics
- Exam stress, anxiety mein emotional support de genuinely
- Motivate kar jab demotivated ho — real wali motivation
- College life, hostel, career, JE/AE — sab pe baat kar
- Hinglish mein baat kar naturally
- Kabhi judge mat kar — hamesha supportive reh
- Agar bahut stressed/sad lage to gently professional help suggest kar
- Formulas aur concepts clearly explain kar with examples
- Short answers de unless detail maanga ho`},
          {role:"user",content:q}
        ],
        max_tokens:1024
      })
    });
    const data=await res.json();
    thinkEl.remove();
    addBubble(data.choices[0].message.content,"ai",now);
  }catch{thinkEl.remove();addBubble("Yaar connection thoda slow hai, ek baar aur try kar! ","ai",now)}
}
function sendMood(msg){document.getElementById("aiInput").value=msg;sendAI()}
function formatAIText(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/^(\d+)\.\s+(.+)$/gm, function(m,n,t){
    return '<div class="ai-step"><div class="ai-step-num">'+n+'</div><div>'+t+'</div></div>';
  });
  text = text.replace(/^#{1,3}\s+(.+)$/gm, '<span class="ai-section">$1</span>');
  text = text.replace(/^>\s+(.+)$/gm, '<span class="ai-highlight">$1</span>');
  text = text.split('\n\n').join('<br><br>');
  text = text.split('\n').join('<br>');
  return text;
}
function addBubble(text,type,time){
  const box=document.getElementById("chatBox");
  const wrap=document.createElement("div");
  wrap.className=`bubble-wrap ${type}`;
  const formatted = type==='ai' ? formatAIText(text) : text.split('\n').join('<br>');
  wrap.innerHTML=`<div class="bubble">${formatted}</div><div class="bubble-time">${time}</div>`;
  box.appendChild(wrap);box.scrollTop=box.scrollHeight;
}
function addThinking(){const box=document.getElementById("chatBox");const wrap=document.createElement("div");wrap.className="bubble-wrap ai";wrap.innerHTML=`<div class="bubble thinking"><span></span><span></span><span></span></div>`;box.appendChild(wrap);box.scrollTop=box.scrollHeight;return wrap}

// QUIZ
const quizQ=[
  {q:"Full form of RCC?",opts:["Reinforced Cement Concrete","Raw Cement Concrete","Rigid Cement Concrete","Round Cement Concrete"],ans:0},
  {q:"Ohm's Law: V = ?",opts:["IR","I/R","R/I","I²R"],ans:0},
  {q:"Full form of CPU?",opts:["Central Processing Unit","Computer Processing Unit","Central Program Unit","Core Processing Unit"],ans:0},
  {q:"Tacheometric surveying is used for?",opts:["Rapid indirect surveying","Soil testing","Mix design","Land acquisition"],ans:0},
  {q:"In digital electronics, AND gate output is 1 when?",opts:["All inputs are 1","Any input is 1","All inputs are 0","Any input is 0"],ans:0},
  {q:"IS code for soil classification?",opts:["IS 1498","IS 456","IS 800","IS 383"],ans:0},
  {q:"Modulus of Elasticity of steel?",opts:["2×10⁵ N/mm²","1×10⁵ N/mm²","3×10⁵ N/mm²","0.5×10⁵ N/mm²"],ans:0},
  {q:"HTML stands for?",opts:["HyperText Markup Language","High Text Markup Language","HyperText Making Language","None of these"],ans:0},
  {q:"In thermodynamics, adiabatic process: heat transfer =?",opts:["Zero","Maximum","Minimum","Constant"],ans:0},
  {q:"Portland cement was patented in?",opts:["1824","1900","1756","1850"],ans:0},
];
let qIdx=0,qScore=0;
function startQuiz(){qIdx=0;qScore=0;showQuestion();showPage("more")}
function showQuestion(){
  const el=document.getElementById("assignmentList");
  if(qIdx>=quizQ.length){el.innerHTML=`<div class="quiz-wrap" style="text-align:center"><div style="font-size:48px;margin-bottom:10px">${qScore>=8?'★':qScore>=6?'✓':'●'}</div><div style="font-family:var(--font-display);font-size:28px;font-weight:900;color:var(--accent)">${qScore}/${quizQ.length}</div><div style="color:var(--muted);margin:8px 0 20px;font-size:14px">${qScore>=8?'Excellent!':qScore>=6?'Good job!':'Keep studying!'}</div><button class="btn-primary" onclick="renderAssignments()">Back</button></div>`;return}
  const q=quizQ[qIdx];
  el.innerHTML=`<div class="quiz-wrap"><div class="quiz-progress">Q ${qIdx+1}/${quizQ.length} · Score: ${qScore}</div><div class="quiz-q">${q.q}</div>${q.opts.map((o,i)=>`<button class="quiz-opt" onclick="answerQ(${i})"><span class="opt-letter">${String.fromCharCode(65+i)}</span>${o}</button>`).join("")}</div>`;
}
function answerQ(i){const q=quizQ[qIdx];const opts=document.querySelectorAll(".quiz-opt");opts[q.ans].classList.add("correct");if(i!==q.ans)opts[i].classList.add("wrong");else qScore++;opts.forEach(o=>o.onclick=null);setTimeout(()=>{qIdx++;showQuestion()},900)}


// NOTICES & ASSIGNMENTS (localStorage)
function renderNotices() {
  const el = document.getElementById("noticeList");
  if(!el) return;
  let notices = JSON.parse(localStorage.getItem("notices") || "[]");
  const welcome = `<div class="notice-item"><div class="notice-title-text">Welcome to GPK Hub!</div><div class="notice-body">All-in-one student companion for Government Polytechnic Kaimur.</div><div class="notice-date">Today</div></div>`;
  if(!notices.length) { el.innerHTML = welcome; return; }
  el.innerHTML = notices.map(n => `<div class="notice-item"><div class="notice-title-text">${n.title}</div><div class="notice-body">${n.body}</div><div class="notice-date">${n.date}</div></div>`).join("") + welcome;
}

function renderAssignments() {
  const el = document.getElementById("assignmentList");
  if(!el) return;
  let assignments = JSON.parse(localStorage.getItem("assignments") || "[]");
  if(!assignments.length) { el.innerHTML = `<div class="empty-state"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="opacity:.4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div class="empty-text">No assignments yet</div></div>`; return; }
  el.innerHTML = assignments.map(a => `<div class="assignment-card"><div class="assignment-title">${a.title}</div><div class="assignment-sub">${a.sub}</div>${a.due?`<div class="assignment-due">Due: ${new Date(a.due).toLocaleDateString()}</div>`:""}</div>`).join("");
}

// INIT
renderSubjects();

// ── STREAK SYSTEM ──
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function initStreak() {
  const today = getTodayStr();
  let streakData = JSON.parse(localStorage.getItem('streakData') || '{"days":[],"current":0,"best":0}');

  if (!streakData.days.includes(today)) {
    // Check if yesterday was visited
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;

    if (streakData.days.includes(yStr)) {
      streakData.current = (streakData.current || 0) + 1;
    } else if (streakData.days.length > 0) {
      streakData.current = 1; // reset
    } else {
      streakData.current = 1;
    }
    streakData.days.push(today);
    streakData.best = Math.max(streakData.best || 0, streakData.current);
    localStorage.setItem('streakData', JSON.stringify(streakData));
  }

  document.getElementById('streakNum').textContent = streakData.current || 1;
  return streakData;
}

function openStreakModal() {
  const streakData = JSON.parse(localStorage.getItem('streakData') || '{"days":[],"current":0,"best":0}');
  document.getElementById('streakCurrent').textContent = streakData.current || 0;
  document.getElementById('streakBest').textContent = streakData.best || 0;
  document.getElementById('streakTotal').textContent = streakData.days?.length || 0;

  // Build last 28 days calendar
  const cal = document.getElementById('streakCalendar');
  const days = ['S','M','T','W','T','F','S'];
  // Day labels row
  cal.innerHTML = days.map(d => `<div style="text-align:center;font-size:9px;color:var(--muted);font-family:var(--font-mono);font-weight:700;padding:4px 0">${d}</div>`).join('');

  const today = new Date();
  // Fill to start of week
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() - 20);

  for (let i = 0; i < 28; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const todayStr = getTodayStr();
    const isToday = dStr === todayStr;
    const isDone = streakData.days?.includes(dStr);
    const cls = isToday ? 'today' : isDone ? 'done' : 'empty';
    cal.innerHTML += `<div class="streak-day ${cls}">${d.getDate()}</div>`;
  }

  document.getElementById('streakModal').classList.add('open');
}

function closeStreakModal(e) {
  if (e.target === document.getElementById('streakModal'))
    document.getElementById('streakModal').classList.remove('open');
}

initStreak();

// ── GREETING based on time ──
function setGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('heroGreeting').textContent = g;
}
setGreeting();


// SPLASH SCREEN
function hideSplash() {
  const splash = document.getElementById("splashScreen");
  if (!splash || splash.style.display === "none") return;
  splash.style.transition = "opacity 0.4s ease";
  splash.style.opacity = "0";
  splash.style.pointerEvents = "none";
  setTimeout(() => { splash.style.display = "none"; }, 420);
}
// Auto hide after 2s
setTimeout(hideSplash, 2000);
// Tap to skip
document.getElementById("splashScreen")?.addEventListener("click", hideSplash);
// Safety fallback — force hide after 4s no matter what
setTimeout(() => {
  const splash = document.getElementById("splashScreen");
  if (splash) splash.style.display = "none";
}, 4000);

// ===== STUDENT FIRST VISIT =====
function checkFirstVisit() {
  const info = localStorage.getItem("studentInfo");
  if(!info) {
    // Show after splash screen disappears
    setTimeout(() => {
      document.getElementById("studentModal").style.display = "flex";
    }, 2400);
  } else {
    try {
      const s = JSON.parse(info);
      document.getElementById("heroName").textContent = s.name;
    const ini = s.name.trim().split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    const av3 = document.getElementById('heroAvatar');
    if(av3) av3.textContent = ini;
    } catch(e) { localStorage.removeItem("studentInfo"); }
  }
}

function saveStudentInfo() {
  const name = document.getElementById("studentName").value.trim();
  const roll = document.getElementById("studentRoll").value.trim();
  const branch = document.getElementById("studentBranch").value;
  const sem = document.getElementById("studentSem").value;
  if(!name) { alert("Please enter your name!"); return; }

  const info = {name, roll, branch, sem, joinedAt: new Date().toISOString()};
  localStorage.setItem("studentInfo", JSON.stringify(info));

  // Save to students list
  let students = JSON.parse(localStorage.getItem("allStudents") || "[]");
  if(!students.find(s => s.roll === roll)) {
    students.push(info);
    localStorage.setItem("allStudents", JSON.stringify(students));
  }

  document.getElementById("studentModal").style.display = "none";
  document.getElementById("heroName").textContent = name;
  const initials2 = name.trim().split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const av2 = document.getElementById('heroAvatar');
  if(av2) av2.textContent = initials2;
}

// ===== ADMIN PANEL =====

function showAdmin() {
  if(!isAdmin) return; // non-admins can't open
  document.getElementById("adminModal").style.display = "flex";
  document.getElementById("adminLoginSection").style.display = "none";
  document.getElementById("adminDashboard").style.display = "block";
  loadAdminStudents();
}

function closeAdmin() {
  document.getElementById("adminModal").style.display = "none";
}

async function checkAdminPass() {
  const v = document.getElementById("adminPassInput").value;
  if(ADMIN_HASH && await sha256(v) === ADMIN_HASH) {
    localStorage.setItem("adminUnlocked", "yes");
    document.getElementById("adminLoginSection").style.display = "none";
    document.getElementById("adminDashboard").style.display = "block";
    loadAdminStudents();
  } else {
    alert("Wrong password!");
  }
}

function adminLogout() {
  localStorage.removeItem("adminUnlocked");
  document.getElementById("adminLoginSection").style.display = "block";
  document.getElementById("adminDashboard").style.display = "none";
}

function loadAdminStudents() {
  const students = JSON.parse(localStorage.getItem("allStudents") || "[]");
  const el = document.getElementById("adminStudentsList");
  if(!students.length) {
    el.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:8px">No students registered yet</div>';
    return;
  }
  el.innerHTML = students.map(s =>
    `<div style="background:var(--surface2);border-radius:8px;padding:8px 10px;margin-bottom:6px;font-size:12px">
      <div style="font-weight:600">${s.name}</div>
      <div style="color:var(--muted);font-family:var(--font-mono);font-size:10px">${s.roll || "No Roll"} · ${s.branch} Sem${s.sem}</div>
    </div>`
  ).join('');
}

function exportStudents() {
  const students = JSON.parse(localStorage.getItem("allStudents") || "[]");
  if(!students.length) { alert("No students yet!"); return; }
  let text = "Name | Roll | Branch | Semester | Joined\n";
  students.forEach(s => {
    text += `${s.name} | ${s.roll||"N/A"} | ${s.branch} | ${s.sem} | ${s.joinedAt?.slice(0,10)||"N/A"}\n`;
  });
  alert(text);
}

function adminPostNotice() {
  const title = document.getElementById("adminNoticeTitle").value.trim();
  const body = document.getElementById("adminNoticeBody").value.trim();
  if(!title || !body) { alert("Fill all fields!"); return; }
  let notices = JSON.parse(localStorage.getItem("notices") || "[]");
  notices.unshift({title, body, date: new Date().toLocaleDateString()});
  localStorage.setItem("notices", JSON.stringify(notices));
  document.getElementById("adminNoticeTitle").value = "";
  document.getElementById("adminNoticeBody").value = "";
  renderNotices();
  alert("Notice posted!");
}

function adminPostAssignment() {
  const sub = document.getElementById("adminAssignSub").value.trim();
  const title = document.getElementById("adminAssignTitle").value.trim();
  const due = document.getElementById("adminAssignDue").value;
  if(!sub || !title) { alert("Fill subject and title!"); return; }
  let assignments = JSON.parse(localStorage.getItem("assignments") || "[]");
  assignments.unshift({sub, title, due, date: new Date().toLocaleDateString()});
  localStorage.setItem("assignments", JSON.stringify(assignments));
  document.getElementById("adminAssignSub").value = "";
  document.getElementById("adminAssignTitle").value = "";
  document.getElementById("adminAssignDue").value = "";
  renderAssignments();
  alert("Assignment posted!");
}

function adminAddExam() {
  const sub = document.getElementById("adminExamSub").value.trim();
  const date = document.getElementById("adminExamDate").value;
  const time = document.getElementById("adminExamTime").value.trim();
  if(!sub || !date) { alert("Fill subject and date!"); return; }
  exams.push({sub, date, time});
  exams.sort((a,b) => new Date(a.date) - new Date(b.date));
  localStorage.setItem("exams", JSON.stringify(exams));
  document.getElementById("adminExamSub").value = "";
  document.getElementById("adminExamDate").value = "";
  document.getElementById("adminExamTime").value = "";
  renderExams();
  alert("Exam added!");
}

// Admin access — Telegram ID only
// Logo tap kept for fallback testing (10 taps)
let tapCount = 0;
document.querySelector('.logo-mark')?.addEventListener('click', () => {
  tapCount++;
  if(tapCount >= 10) { tapCount = 0; showAdmin(); }
});
if(isAdmin) document.getElementById("adminBtn").style.display = "flex";

// Check first visit
checkFirstVisit();

renderTimetable();
renderStudy();
renderExams();
renderAssignments();
renderNotices();


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  });
}
