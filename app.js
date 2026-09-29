const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COV=['#e0567a','#f4a261','#e9c46a','#2a9d8f','#4a90d9','#7b5ea7','#3d3d4e','#f2b5c4','linear-gradient(135deg,#f6d365,#fda085)','linear-gradient(135deg,#a1c4fd,#c2e9fb)','linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#43e97b,#38f9d7)'];
const TXT=['#ffffff','#3a2e2a','#ffe27a','#ffd6e5'];
const FONTS=[['Mali','น่ารัก'],['Kanit','เท่'],['Sriracha','ลายมือ']];
const STK=['🌸','⭐','❤️','🌈','🎀','🦋','☀️','🌙','✨','🎈','🐶','🐱','🍓','🌻','🎂','✈️','📷','🏖️','🎵','👑','🍀','🎉'];
const PGBG=['#ffffff','#fff1e6','#e8f5e9','#e3f2fd','#f3e5f5','#fff9c4','#fce4ec','#263238','radial-gradient(#f3c9d5 2px,transparent 2px) 0 0/18px 18px #ffffff','repeating-linear-gradient(45deg,#ffffff,#ffffff 10px,#fdf0e6 10px,#fdf0e6 20px)'];
const LAY=[['1','1 รูป'],['2','2 รูป'],['3','3 รูป'],['4','4 รูป'],['mix','ผสม']];
const FRM=[['0','เรียบ'],['1','โพลารอยด์'],['2','ทอง'],['3','มน'],['4','เส้นประ']];

/* ---- storage (IndexedDB, in-memory fallback) ---- */
let mem={};
const idb=new Promise((res,rej)=>{try{const r=indexedDB.open('albumapp',1);r.onupgradeneeded=()=>r.result.createObjectStore('a',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});
const tx=async(m,f)=>{const d=await idb;return new Promise((res,rej)=>{const t=d.transaction('a',m),q=f(t.objectStore('a'));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)})};
const put=async a=>{mem[a.id]=a;try{await tx('readwrite',s=>s.put(a))}catch(e){}};
const del=async id=>{delete mem[id];try{await tx('readwrite',s=>s.delete(id))}catch(e){}};
const mine=async()=>{let l;try{l=await tx('readonly',s=>s.getAll())}catch(e){l=Object.values(mem)}return l.filter(a=>a.email===me).map(norm)};
let me='';try{me=localStorage.getItem('albumMe')||''}catch(e){}

/* ---- helpers ---- */
let tt;const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),2200)};
const show=id=>{$$('section').forEach(s=>s.classList.toggle('on',s.id==='v-'+id));window.scrollTo(0,0);if(id==='home')$('#who').textContent='👋 '+me;if(id==='list')renderList();if(id==='trash')renderTrash()};
$$('.bk').forEach(b=>b.onclick=()=>show('home'));
const LO={1:[[1]],2:[[1,1],[2]],3:[[1,2],[2,1],[1,1,1],[3]],4:[[2,2],[1,3],[3,1]],5:[[2,3],[3,2],[1,2,2]],6:[[3,3],[2,2,2],[1,2,3]],7:[[3,2,2],[2,2,3],[1,3,3]],8:[[3,3,2],[2,3,3],[2,2,2,2]],9:[[3,3,3],[2,2,2,3],[3,2,2,2]]};
const norm=a=>{if(!a.pgs){const L=a.layout,c=+a.pages||4;a.pgs=Array.from({length:c},(_,p)=>({n:L==='mix'?[4,3,2,1][p%4]:(+L||4),v:0}))}if(a.folder===undefined)a.folder=null;return a};
const fKey=()=>'albumFolders:'+me;
const getFolders=()=>{try{return JSON.parse(localStorage.getItem(fKey())||'[]')}catch(e){return[]}};
const saveFolders=arr=>{try{localStorage.setItem(fKey(),JSON.stringify(arr))}catch(e){}};
let curFolder='all';
const total=a=>a.pgs.reduce((t,g)=>t+g.n,0);
const cover=a=>`<div class="cover" style="background:${a.color};color:${a.tc};font-family:'${a.font}','Mali',sans-serif"><div class="ct">${esc(a.title||'อัลบั้มของฉัน')}</div><div class="cs">${esc(a.sub||'')}</div>${a.st.map((s,i)=>`<b class="stk" data-i="${i}" style="left:${s.x}%;top:${s.y}%;font-size:${s.z}cqw">${s.e}</b>`).join('')}</div>`;
const pageHTML=(a,p)=>{const g=a.pgs[p],V=LO[g.n],rows=V[g.v%V.length];let i=0,h=`<div class="page d${g.n>=7?2:g.n>=4?1:0}" style="background:${a.bg};grid-template-rows:repeat(${rows.length},1fr)">`;rows.forEach((k,r)=>{for(let j=0;j<k;j++,i++){const key=p+'-'+i,u=a.photos[key];h+=`<div class="slot f${a.frame}" data-k="${key}" style="grid-column:span ${6/k};grid-row:${r+1}">${u?`<div class="ph" style="background-image:url('${u}')"></div>`:`<div class="ph e"><span>📷</span>คลิกเพื่อใส่รูป</div>`}</div>`}});return h+`<div class="pn">${p+1}</div></div>`};

/* ---- login / home ---- */
const enter=()=>{const v=$('#em').value.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return toast('กรุณากรอกอีเมลให้ถูกต้อง');me=v;try{localStorage.setItem('albumMe',v)}catch(e){}purge();show('home')};
$('#lg').onclick=enter;$('#em').onkeydown=e=>e.key==='Enter'&&enter();
$('#out').onclick=()=>{me='';try{localStorage.removeItem('albumMe')}catch(e){}$('#em').value='';show('login')};
$('#mList').onclick=()=>show('list');$('#mTrash').onclick=()=>show('trash');
async function purge(){for(const a of await mine())if(a.status==='trash'&&Date.now()-a.del>=15*864e5)await del(a.id)}

/* ---- lists ---- */
function folderChips(all){const folders=getFolders(),cnt={};all.forEach(a=>{const k=a.folder||'__none__';cnt[k]=(cnt[k]||0)+1});
let h=`<button class="chip ${curFolder==='all'?'on':''}" data-f="all">ทั้งหมด (${all.length})</button>`;
folders.forEach(f=>h+=`<button class="chip ${curFolder===f?'on':''}" data-f="${esc(f)}">📁 ${esc(f)} (${cnt[f]||0})</button>`);
if(cnt.__none__)h+=`<button class="chip ${curFolder==='__none__'?'on':''}" data-f="__none__">ไม่มีหมวดหมู่ (${cnt.__none__})</button>`;
if(folders.includes(curFolder))h+=`<button id="delF">🗑️ ลบโฟลเดอร์นี้</button>`;
h+=`<button id="nfBtn">＋ โฟลเดอร์ใหม่</button>`;return h}
function card(a){const fs=getFolders();return `<div class="card" data-id="${a.id}"><div class="cvw">${cover(a)}</div><b>${esc(a.title)}</b><small class="mut">${a.status==='draft'?'⏳ ยังใส่รูปไม่ครบ':'✅ '+new Date(a.created).toLocaleDateString('th-TH')}</small>
<select class="fsel" data-id="${a.id}" onclick="event.stopPropagation()"><option value="">— ไม่มีหมวดหมู่ —</option>${fs.map(f=>`<option value="${esc(f)}" ${a.folder===f?'selected':''}>📁 ${esc(f)}</option>`).join('')}</select></div>`}
async function renderList(){const all=(await mine()).filter(a=>a.status!=='trash').sort((a,b)=>b.created-a.created);
$('#fRow').innerHTML=folderChips(all);
const l=curFolder==='all'?all:all.filter(a=>(a.folder||'__none__')===curFolder);
$('#gList').innerHTML=l.length?l.map(card).join(''):'<p class="mut">ยังไม่มีอัลบั้มในหมวดนี้</p>';
$('#gList').onclick=e=>{if(e.target.closest('select'))return;const c=e.target.closest('.card');if(!c)return;openBook(all.find(a=>a.id===c.dataset.id))};
$('#gList').onchange=async e=>{const s=e.target.closest('.fsel');if(!s)return;const a=all.find(x=>x.id===s.dataset.id);if(!a)return;a.folder=s.value||null;await put(a);renderList()};
$('#fRow').onclick=async e=>{const t=e.target;
if(t.dataset.f){curFolder=t.dataset.f;renderList();return}
if(t.id==='nfBtn'){$('#fRow').innerHTML=`<input id="nfIn" type="text" maxlength="24" placeholder="ชื่อโฟลเดอร์ใหม่" style="max-width:200px;display:inline-block;margin:0 6px 6px 0"><button id="nfOk" class="btn">สร้าง</button><button id="nfX">ยกเลิก</button>`;$('#nfIn').focus();return}
if(t.id==='nfOk'){const v=$('#nfIn').value.trim(),fs=getFolders();if(!v)return toast('กรุณาใส่ชื่อโฟลเดอร์');if(fs.includes(v))return toast('มีโฟลเดอร์นี้อยู่แล้ว');if(fs.length>=20)return toast('สร้างโฟลเดอร์ได้สูงสุด 20 โฟลเดอร์');fs.push(v);saveFolders(fs);curFolder=v;renderList();return}
if(t.id==='nfX'){renderList();return}
if(t.id==='delF'){if(!t.dataset.s){t.dataset.s=1;t.textContent='กดอีกครั้งเพื่อยืนยัน';return}saveFolders(getFolders().filter(f=>f!==curFolder));for(const a of all.filter(a=>a.folder===curFolder)){a.folder=null;await put(a)}curFolder='all';renderList()}};
$('#fRow').onkeydown=e=>{if(e.target.id==='nfIn'&&e.key==='Enter')$('#nfOk').click()}}
async function renderTrash(){const l=(await mine()).filter(a=>a.status==='trash');$('#gTrash').innerHTML=l.length?l.map(a=>{const d=Math.max(0,15-Math.floor((Date.now()-a.del)/864e5));return`<div class="card"><div class="cvw">${cover(a)}</div><b>${esc(a.title)}</b><small class="mut">เหลืออีก ${d} วัน</small><div class="row" style="margin-top:8px"><button data-r="${a.id}">กู้คืน</button><button data-x="${a.id}">ลบถาวร</button></div></div>`}).join(''):'<p class="mut">ถังขยะว่างเปล่า</p>';
$$('[data-r]').forEach(b=>b.onclick=async()=>{const a=l.find(x=>x.id===b.dataset.r);a.status=Object.keys(a.photos).length>=total(a)?'saved':'draft';delete a.del;await put(a);toast('กู้คืนแล้ว');renderTrash()});
$$('[data-x]').forEach(b=>b.onclick=async()=>{if(!b.dataset.s){b.dataset.s=1;b.textContent='กดอีกครั้งเพื่อยืนยัน';return}await del(b.dataset.x);toast('ลบถาวรแล้ว');renderTrash()})}

/* ---- designer ---- */
let D,dp=0,sel=-1;
const DEF=()=>({id:'a'+Date.now()+Math.random().toString(36).slice(2,6),email:me,title:'',sub:'',color:COV[0],tc:'#ffffff',font:'Mali',st:[],frame:'1',bg:PGBG[0],pgs:Array.from({length:4},()=>({n:4,v:0})),all:true,folder:null,photos:{},status:'draft',created:Date.now()});
$('#mNew').onclick=()=>{D=DEF();dp=0;sel=-1;show('design');buildCtl();updPrev()};
const sw=(k,list,cur)=>`<div class="row">${list.map(v=>`<button class="sw ${v===cur?'on':''}" data-k="${k}" data-v="${v}" style="background:${v}"></button>`).join('')}</div>`;
const chips=(k,list,cur)=>`<div class="row">${list.map(([v,t])=>`<button class="chip ${String(cur)===v?'on':''}" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div>`;
const stp=(id,v,mn,mx)=>`<div class="st"><button data-st="${id}" data-d="-1" ${v<=mn?'disabled':''}>−</button><b>${v}</b><button data-st="${id}" data-d="1" ${v>=mx?'disabled':''}>＋</button></div>`;
const thumb=(rows,on,v)=>`<button class="lt ${on?'on':''}" data-vr="${v}"><div class="mg" style="grid-template-rows:repeat(${rows.length},1fr)">${rows.map(k=>Array.from({length:k},()=>`<i style="grid-column:span ${6/k}"></i>`).join('')).join('')}</div></button>`;
function buildCtl(){const pg=D.pgs[dp],vs=LO[pg.n],ds=sel<0?'disabled':'';
$('#ctl').innerHTML=`<h2>🎨 ตกแต่งหน้าปก</h2>
<h3>ชื่ออัลบั้ม</h3><input type="text" id="iT" maxlength="40" value="${esc(D.title)}" placeholder="เช่น ทริปเชียงใหม่ 2026">
<h3>ข้อความรอง</h3><input type="text" id="iS" maxlength="50" value="${esc(D.sub)}" placeholder="เช่น กับครอบครัว">
<h3>สีปก</h3>${sw('color',COV,D.color)}<h3>สีตัวอักษร</h3>${sw('tc',TXT,D.tc)}<h3>ฟอนต์</h3>${chips('font',FONTS,D.font)}
<h3>สติ๊กเกอร์ — ลากไปวางบนปกด้านบนได้เลย</h3><div class="row">${STK.map(e=>`<button class="em1" data-add="${e}">${e}</button>`).join('')}</div>
<div class="row" style="margin-top:8px"><button data-act="big" ${ds}>＋ ใหญ่ขึ้น</button><button data-act="small" ${ds}>－ เล็กลง</button><button data-act="del" ${ds}>🗑️ ลบอันที่เลือก</button></div>
<h2>📄 ตกแต่งหน้าอัลบั้ม</h2>
<h3>จำนวนหน้าทั้งหมด</h3>${stp('pages',D.pgs.length,1,30)}
<h3>เลือกหน้าที่จะตั้งค่า (ดูตัวอย่างด้านบน)</h3><div class="row">${D.pgs.map((_,i)=>`<button class="chip ${i===dp?'on':''}" data-pick="${i}">${i+1}</button>`).join('')}</div>
<label class="mut" style="display:block;margin-top:8px"><input type="checkbox" id="all" ${D.all?'checked':''}> ตั้งค่าเหมือนกันทุกหน้า</label>
<h3>จำนวนรูปในหน้า ${dp+1}</h3>${stp('n',pg.n,1,9)}
<h3>เลย์เอาท์ของหน้า ${dp+1}</h3><div class="row">${vs.map((r,i)=>thumb(r,i===pg.v%vs.length,i)).join('')}</div>
<h3>กรอบรูป</h3>${chips('frame',FRM,D.frame)}<h3>พื้นหลังหน้า</h3>${sw('bg',PGBG,D.bg)}`}
function updPrev(){$('#pvC').innerHTML=cover(D);$('#pvP').innerHTML=pageHTML(D,dp)+`<div class="nav"><button data-pg="-1" ${dp<1?'disabled':''}>‹</button><span class="mut">หน้า ${dp+1}/${D.pgs.length}</span><button data-pg="1" ${dp>=D.pgs.length-1?'disabled':''}>›</button></div>`;if(sel>=0){const e=$(`#pvC .stk[data-i="${sel}"]`);e&&e.classList.add('sel')}}
$('#pvP').onclick=e=>{const b=e.target.closest('[data-pg]');if(!b||b.disabled)return;dp+=+b.dataset.pg;buildCtl();updPrev()};
$('#ctl').oninput=e=>{const t=e.target;if(t.id==='iT')D.title=t.value;else if(t.id==='iS')D.sub=t.value;else return;updPrev()};
$('#ctl').onchange=e=>{if(e.target.id!=='all')return;D.all=e.target.checked;if(D.all)D.pgs=D.pgs.map(()=>({...D.pgs[dp]}));buildCtl();updPrev()};
$('#ctl').onclick=e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset,tg=D.all?D.pgs:[D.pgs[dp]];
if(d.k)D[d.k]=d.v;
else if(d.st==='pages'){if(+d.d>0)D.pgs.push({...D.pgs[D.pgs.length-1]});else D.pgs.pop();dp=Math.min(dp,D.pgs.length-1)}
else if(d.st==='n'){const n=D.pgs[dp].n+ +d.d;tg.forEach(p=>{p.n=n;p.v=0})}
else if(d.pick!==undefined)dp=+d.pick;
else if(d.vr!==undefined)tg.forEach(p=>p.v=+d.vr);
else if(d.act&&sel>=0){if(d.act==='del'){D.st.splice(sel,1);sel=-1}else D.st[sel].z=Math.max(6,Math.min(50,D.st[sel].z+(d.act==='big'?4:-4)))}
else return;
buildCtl();updPrev()};
/* drag sticker from palette onto cover */
$('#ctl').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-add]');if(!b)return;e.preventDefault();const g=document.createElement('div');g.className='ghost';g.textContent=b.dataset.add;document.body.appendChild(g);
const at=ev=>{g.style.left=ev.clientX+'px';g.style.top=ev.clientY+'px'};at(e);const sx=e.clientX,sy=e.clientY;
const up=ev=>{['pointermove','pointerup','pointercancel'].forEach((t,i)=>document.removeEventListener(t,i?up:at));g.remove();const r=$('#pvC .cover').getBoundingClientRect();let x=(ev.clientX-r.left)/r.width*100,y=(ev.clientY-r.top)/r.height*100;
if(Math.hypot(ev.clientX-sx,ev.clientY-sy)<=8){x=50;y=60}else if(x<0||x>100||y<0||y>100)return;
if(D.st.length>=30)return toast('สติ๊กเกอร์เต็มแล้ว');D.st.push({e:b.dataset.add,x,y,z:16});sel=D.st.length-1;buildCtl();updPrev()};
document.addEventListener('pointermove',at);document.addEventListener('pointerup',up);document.addEventListener('pointercancel',up)});
/* move sticker already on cover */
$('#pvC').addEventListener('pointerdown',e=>{const s=e.target.closest('.stk');if(!s)return;const i=+s.dataset.i,r=s.parentElement.getBoundingClientRect();sel=i;s.setPointerCapture(e.pointerId);
const mv=ev=>{D.st[i].x=Math.max(0,Math.min(100,(ev.clientX-r.left)/r.width*100));D.st[i].y=Math.max(0,Math.min(100,(ev.clientY-r.top)/r.height*100));s.style.left=D.st[i].x+'%';s.style.top=D.st[i].y+'%'};
const up=()=>{s.removeEventListener('pointermove',mv);s.removeEventListener('pointerup',up);buildCtl();updPrev()};s.addEventListener('pointermove',mv);s.addEventListener('pointerup',up)});
$('#go').onclick=async()=>{D.title=D.title.trim()||'อัลบั้มของฉัน';D.status='draft';await put(D);openBook(D)};

/* ---- book ---- */
let A,pi=0,opened=false,curK='';
const nPages=()=>A.pgs.length;
function openBook(a){A=a;pi=0;opened=false;$('#bt').textContent=a.title;$('#cv').innerHTML=cover(a);$('#cv').classList.remove('open');$('#hint').style.display='';$('#nav').style.display='none';show('book');drawPage();prog()}
function drawPage(){$('#pg').innerHTML=pageHTML(A,pi);$('#pi').textContent=`หน้า ${pi+1} / ${nPages()}`;$('#pp').disabled=pi===0;$('#pn').disabled=pi===nPages()-1}
function prog(){const f=Object.keys(A.photos).length,t=total(A);$('#prog').textContent=`ใส่รูปแล้ว ${f} / ${t} ช่อง`;$('#keep').style.display=A.status==='draft'?'':'none';$('#keep').disabled=f<t;$('#keep').title=f<t?'ใส่รูปให้ครบทุกหน้าก่อน':''}
$('#cv').onclick=()=>{if(opened)return;opened=true;$('#cv').classList.add('open');$('#hint').style.display='none';$('#nav').style.display='flex';toast('คลิกที่กรอบรูปเพื่อใส่รูป')};
$('#pp').onclick=()=>{pi--;drawPage()};$('#pn').onclick=()=>{pi++;drawPage()};
$('#pg').onclick=e=>{const s=e.target.closest('.slot');if(!s||!opened)return;curK=s.dataset.k;$('#file').click()};
const shrink=f=>new Promise((res,rej)=>{const u=URL.createObjectURL(f),i=new Image();i.onerror=rej;i.onload=()=>{const s=Math.min(1,1000/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.82))};i.src=u});
$('#file').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f||!curK)return;try{A.photos[curK]=await shrink(f)}catch(x){return toast('ไฟล์นี้ใช้ไม่ได้ ลองรูปอื่นนะ')}await put(A);drawPage();prog();if(A.status==='draft'&&Object.keys(A.photos).length>=total(A))toast('ครบทุกหน้าแล้ว! กด "เก็บอัลบั้ม" ได้เลย 🎉')};
$('#keep').onclick=async()=>{A.status='saved';await put(A);toast('เก็บอัลบั้มแล้ว 🎉');show('list')};
$('#trash').onclick=async()=>{A.status='trash';A.del=Date.now();await put(A);toast('ย้ายไปถังขยะแล้ว (เก็บไว้ 15 วัน)');show('home')};

/* ---- start ---- */
purge();me?show('home'):show('login');

/* ---- PWA: service worker + install prompt ---- */
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
let dfi=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();dfi=e;$('#inst').style.display='inline-block'});
window.addEventListener('appinstalled',()=>{$('#inst').style.display='none'});
$('#inst').onclick=async()=>{if(!dfi)return;dfi.prompt();await dfi.userChoice;dfi=null;$('#inst').style.display='none'};

/* ---- splash (หน้าเปิดแอป) ---- */
(()=>{const sp=$('#splash');if(!sp)return;
const fl=$('#spFl'),em=['🌸','⭐','❤️','🌈','🎀','🦋','✨','🍓','🌻','🐱','🎈','🍀'];
for(let i=0;i<16;i++){const s=document.createElement('span');s.textContent=em[i%em.length];
s.style.cssText=`left:${(i*6.4+Math.random()*4)%96}%;font-size:${16+Math.random()*20}px;animation-duration:${3.5+Math.random()*3}s;animation-delay:${Math.random()*2.5}s`;fl.appendChild(s)}
let done=false;const close=()=>{if(done)return;done=true;sp.classList.add('out');setTimeout(()=>sp.remove(),600)};
sp.addEventListener('click',close);
setTimeout(close,matchMedia('(prefers-reduced-motion:reduce)').matches?1200:3200);
})();
