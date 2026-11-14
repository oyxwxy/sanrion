/* ===== 설정 ===== */
const START_DATE='2025-11-15';
const FIREBASE_CONFIG={apiKey:'YOUR_API_KEY',authDomain:'YOUR_PROJECT.firebaseapp.com',projectId:'YOUR_PROJECT',appId:'YOUR_APP_ID'};
/* ================ */
const $=s=>document.querySelector(s);
const PAL={R:'#e60012',S:'#ffcc99',K:'#1b1b2f',B:'#2a5bd7',Y:'#ffc400',N:'#5a3418',W:'#fff',G:'#00a651',P:'#8e44ad',O:'#ff8a00'};
const spr=(c,rows,x,y,px)=>rows.forEach((r,j)=>[...r].forEach((ch,i)=>{if(PAL[ch]){c.fillStyle=PAL[ch];c.fillRect(x+i*px,y+j*px,px,px)}}));
const HERO=['...RRRRR....','..RRRRRRRR..','..SSSKSKSS..','..SSSSSSSS..','...BBBBBB...','.SBBBBBBBBS.','.SBBYBBYBBS.','..BBBBBBBB..','..BBB..BBB..','..NNN..NNN..','..NNN..NNN..'];
const ENV=['','.WWWWWWWWWW.','.WRWWWWWWRW.','.WWRWWWWRWW.','.WWWRWWRWWW.','.WWWWRRWWWW.','.WWWWWWWWWW.','.WWWWWWWWWW.'];
const PALS=['RRRRYYYYGGGG','RRRRYYYYGGGG','RRRRYYYYGGGG','BBBBPPPPOOOO','BBBBPPPPOOOO','BBBBPPPPOOOO'];
const LOCK=['...KKKKK....','..KK...KK...','.......KK...','......KK....','.....KK.....','.....KK.....','............','.....KK.....'];
const SCALE=()=>$('#inner').style.transform=`scale(${$('#scr').clientWidth/960})`;
new ResizeObserver(SCALE).observe($('#scr'));

/* ---------- 화면 전환 / 입력 ---------- */
const VIEWS=['boot','home','game','maker','guest'];let view='boot',sel=0;
const go=v=>{view=v;VIEWS.forEach(k=>$('#'+k).classList.toggle('on',k===v));v==='game'?Game.start():Game.stop()};
const press=k=>{
  if(view==='boot'){if(k==='a')go('home');return}
  if(k==='home'||(k==='b'&&view!=='home'))return go('home');
  if(view==='home'){if(k==='left')pick(sel-1);if(k==='right')pick(sel+1);if(k==='a')open(sel)}
  else if(view==='game'&&k==='a')Game.jump();
};
document.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>press(b.dataset.k));
addEventListener('keydown',e=>{
  if(/INPUT|TEXTAREA/.test(e.target.tagName)){if(e.code==='Escape'){e.target.blur();press('b')}return}
  const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',Enter:'a',KeyZ:'a',Space:view==='game'?'a':'',Escape:'b',KeyX:'b'}[e.code];
  if(m){e.preventDefault();press(m)}});
$('#boot').onclick=()=>press('a');setTimeout(()=>view==='boot'&&go('home'),3200);

/* ---------- 홈 ---------- */
const APPS=[{n:'코인 러너',v:'game',s:HERO,bg:'#ff6b6b'},{n:'도트 메이커',v:'maker',s:PALS,bg:'#ffd23f'},{n:'방명록',v:'guest',s:ENV,bg:'#4ecdc4'},{n:'2주년 ???',s:LOCK,bg:'#b0b3bd'}];
APPS.forEach((a,i)=>{const t=document.createElement('div'),c=document.createElement('canvas');t.className='tile';t.style.background=a.bg;c.width=c.height=144;
  spr(c.getContext('2d'),a.s,0,a.s===HERO?6:24,12);t.append(c);t.onmouseenter=()=>pick(i);t.onclick=()=>{pick(i);open(i)};$('#tiles').append(t)});
const pick=i=>{sel=(i+APPS.length)%APPS.length;document.querySelectorAll('.tile').forEach((t,j)=>t.classList.toggle('sel',j===sel));$('#ttl').textContent=APPS[sel].n};
const open=i=>APPS[i].v?go(APPS[i].v):($('#ttl').textContent='아직 준비 중이에요!');
pick(0);
$('#dd').textContent='D+'+Math.max(1,Math.floor((Date.now()-new Date(START_DATE))/864e5)+1);
const tick=()=>$('#clk').textContent=new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});tick();setInterval(tick,3e4);
function drawAva(){const c=$('#ava').getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,48,48);const d=localStorage.getItem('ava');
  if(d){const im=new Image();im.onload=()=>c.drawImage(im,0,0,48,48);im.src=d}else spr(c,HERO,0,4,4)}drawAva();

/* ---------- 게임: 코인 러너 ---------- */
const Game=(()=>{const cv=$('#cv'),c=cv.getContext('2d'),G=440;let raf,p,ob,co,sc,t,cd,run,over,best=+localStorage.getItem('best')||0;
  const reset=()=>{p={y:G-48,vy:0};ob=[];co=[];sc=0;t=0;cd=50;run=true;over=false};
  const jump=()=>{if(over)return reset();if(p.y>=G-48)p.vy=-17};
  const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  cv.addEventListener('pointerdown',jump);
  function frame(){
    const sp=7+sc/400;
    if(run){t++;p.vy+=.9;p.y=Math.min(G-48,p.y+p.vy);
      if(--cd<=0){ob.push({x:1000,y:G-44,w:44,h:44});if(Math.random()<.7)co.push({x:1000+Math.random()*220,y:G-120-Math.random()*90,w:24,h:24});cd=(380+Math.random()*320)/sp}
      ob.forEach(o=>o.x-=sp);co.forEach(o=>o.x-=sp);
      const P={x:108,y:p.y+6,w:32,h:40};
      co=co.filter(o=>o.x>-30&&!(hit(P,o)&&(sc+=50)));ob=ob.filter(o=>o.x>-60);
      if(ob.some(o=>hit(P,{x:o.x+4,y:o.y+4,w:o.w-8,h:o.h-4}))){run=false;over=true;if(sc>best){best=sc|0;localStorage.setItem('best',best)}}
      sc+=.15}
    ['#6ec6ff','#8dd3ff','#aee1ff','#cdeeff'].forEach((s,i)=>{c.fillStyle=s;c.fillRect(0,i*110,960,110)});
    c.fillStyle='#fff';for(let i=0;i<4;i++){const x=((i*320-t*.5)%1100+1100)%1100-120,y=60+i%2*70;c.fillRect(x,y,120,24);c.fillRect(x+20,y-16,70,16)}
    c.fillStyle='#4cc36a';for(let x=0;x<960;x+=8){const h=70+40*Math.sin((x+t*1.5)/110)|0;c.fillRect(x,G-h,8,h)}
    c.fillStyle='#c8782f';c.fillRect(0,G,960,100);c.fillStyle='#5ec34a';c.fillRect(0,G,960,12);
    c.fillStyle='#a85f22';for(let x=-(t*7)%64;x<960;x+=64)c.fillRect(x,G+30,32,6);
    ob.forEach(o=>{c.fillStyle='#8b4a1a';c.fillRect(o.x,o.y,44,44);c.fillStyle='#d9954a';c.fillRect(o.x+4,o.y+4,36,36);c.fillStyle='#8b4a1a';c.fillRect(o.x+18,o.y+4,8,36);c.fillRect(o.x+4,o.y+18,36,8)});
    co.forEach(o=>{const w=Math.abs(Math.cos(t/8))*20+4;c.fillStyle='#ffc400';c.fillRect(o.x+12-w/2,o.y,w,24);c.fillStyle='#fff';c.fillRect(o.x+10,o.y+4,4,10)});
    spr(c,HERO,100,p.y+(p.y>=G-48&&run?(t>>3&1)*2:0),4);
    c.font='18px "Press Start 2P",monospace';c.fillStyle='#1b1b2f';c.textAlign='left';c.fillText(`SCORE ${sc|0}   BEST ${best}`,32,50);
    if(over){c.fillStyle='#000a';c.fillRect(0,0,960,540);c.fillStyle='#fff';c.textAlign='center';c.font='34px "Press Start 2P",monospace';c.fillText('GAME OVER',480,240);
      c.font='16px "Press Start 2P",monospace';c.fillText(`SCORE ${sc|0}`,480,290);c.fillText('A / SPACE : RETRY    B : HOME',480,340)}
    else if(t<150){c.fillStyle='#1b1b2f';c.textAlign='center';c.font='16px "Press Start 2P",monospace';c.fillText('A / SPACE / TOUCH : JUMP',480,160)}}
  return{jump,start(){reset();cancelAnimationFrame(raf);const L=()=>{frame();raf=requestAnimationFrame(L)};L()},stop(){cancelAnimationFrame(raf)}}})();

/* ---------- 도트 메이커 ---------- */
(()=>{const N=16,S=25,ed=$('#ed'),c=ed.getContext('2d'),pv=$('#pv').getContext('2d');
  const COL=['#1b1b2f','#ffffff','#e60012','#ff8a00','#ffc400','#00a651','#5c94fc','#2a5bd7','#8e44ad','#ff7eb6','#ffcc99','#b5651d','#5a3418','#9aa0a6','#00c2c7','#b8e986'];
  let g=Array.from({length:N},()=>Array(N).fill(null)),color=COL[2],tool='pen',dn=false;
  [[5,3,9,3,'#e60012'],[4,4,11,4,'#e60012'],[4,5,11,7,'#ffcc99'],[6,6,6,6,'#1b1b2f'],[9,6,9,6,'#1b1b2f'],[4,8,11,11,'#2a5bd7'],[3,9,3,10,'#ffcc99'],[12,9,12,10,'#ffcc99'],[5,12,6,13,'#5a3418'],[9,12,10,13,'#5a3418']]
    .forEach(([a,b,x,y,k])=>{for(let j=b;j<=y;j++)for(let i=a;i<=x;i++)g[j][i]=k});
  const pal=$('#pal');COL.forEach(k=>{const i=document.createElement('i');i.style.background=k;i.dataset.c=k;i.onclick=()=>{color=k;if(tool==='erase')tool='pen';sync()};pal.append(i)});
  const sync=()=>{pal.querySelectorAll('i').forEach(i=>i.classList.toggle('on',i.dataset.c===color));document.querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===tool))};
  document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tool=b.dataset.t;sync()});sync();
  const px=(cx,k)=>{cx.clearRect(0,0,N,N);g.forEach((r,y)=>r.forEach((v,x)=>{if(v){cx.fillStyle=v;cx.fillRect(x,y,1,1)}}))};
  function draw(){c.clearRect(0,0,400,400);g.forEach((r,y)=>r.forEach((v,x)=>{if(v){c.fillStyle=v;c.fillRect(x*S,y*S,S,S)}}));
    c.strokeStyle='#0002';c.beginPath();for(let i=0;i<=N;i++){c.moveTo(i*S,0);c.lineTo(i*S,400);c.moveTo(0,i*S);c.lineTo(400,i*S)}c.stroke();px(pv)}
  function fill(x,y,to){const f=g[y][x];if(f===to)return;const s=[[x,y]];while(s.length){const[a,b]=s.pop();if(a<0||b<0||a>=N||b>=N||g[b][a]!==f)continue;g[b][a]=to;s.push([a+1,b],[a-1,b],[a,b+1],[a,b-1])}}
  function act(e){const r=ed.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*N|0,y=(e.clientY-r.top)/r.height*N|0;if(x<0||y<0||x>=N||y>=N)return;
    if(tool==='fill'){if(e.type==='pointerdown')fill(x,y,color)}else g[y][x]=tool==='erase'?null:color;draw()}
  ed.addEventListener('pointerdown',e=>{dn=true;ed.setPointerCapture(e.pointerId);act(e)});ed.addEventListener('pointermove',e=>dn&&act(e));addEventListener('pointerup',()=>dn=false);
  $('#clr').onclick=()=>{g=g.map(r=>r.map(()=>null));draw()};
  const out=s=>{const o=document.createElement('canvas');o.width=o.height=s;const x=o.getContext('2d');x.imageSmoothingEnabled=false;x.scale(s/N,s/N);px(x);return o};
  $('#save').onclick=()=>out(512).toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='my-pixel-character.png';a.click();URL.revokeObjectURL(a.href);$('#mt').textContent='저장했어요!'});
  $('#setava').onclick=()=>{localStorage.setItem('ava',out(16).toDataURL());drawAva();$('#mt').textContent='홈 화면 프로필로 설정했어요!'};
  draw()})();

/* ---------- 방명록 ---------- */
(()=>{const list=$('#gl'),stat=$('#gstat'),live=FIREBASE_CONFIG.apiKey!=='YOUR_API_KEY'&&window.firebase;let db;
  const render=a=>list.replaceChildren(...a.map(d=>{const li=document.createElement('li'),b=document.createElement('b'),m=document.createElement('div'),s=document.createElement('small');
    b.textContent=d.name;m.textContent=d.msg;s.textContent=d.at?new Date(d.at).toLocaleString('ko-KR'):'';li.append(b,m,s);return li}));
  if(live){firebase.initializeApp(FIREBASE_CONFIG);db=firebase.firestore();
    db.collection('guestbook').orderBy('createdAt','desc').limit(50).onSnapshot(q=>render(q.docs.map(x=>{const d=x.data();return{name:d.name,msg:d.msg,at:d.createdAt&&d.createdAt.toMillis()}})),()=>stat.textContent='불러오지 못했어요. Firestore 규칙을 확인하세요.')}
  else{stat.textContent='Firebase 미설정: 데모 모드(이 브라우저에만 저장)';render(JSON.parse(localStorage.getItem('gb')||'[]'))}
  $('#gf').onsubmit=async e=>{e.preventDefault();const name=$('#gn').value.trim(),msg=$('#gm').value.trim();if(!name||!msg)return;
    try{if(live)await db.collection('guestbook').add({name,msg,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
      else{const a=JSON.parse(localStorage.getItem('gb')||'[]');a.unshift({name,msg,at:Date.now()});localStorage.setItem('gb',JSON.stringify(a));render(a)}
      e.target.reset()}catch(err){stat.textContent='등록에 실패했어요. 다시 시도해 주세요.'}};
})();
