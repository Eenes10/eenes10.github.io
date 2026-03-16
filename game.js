'use strict';
// ═══════════════════════════════════════════
//  ASTEROIDS — game.js
//  Joystick · Hızlı gemi · Skor çarpanı
//  Combo sistemi · Yeni güçlendiriciler
// ═══════════════════════════════════════════
const TAU=Math.PI*2;
const HI='ast_hi2';
const loadHi=()=>+localStorage.getItem(HI)||0;
const saveHi=s=>{if(s>loadHi())localStorage.setItem(HI,s);};
const wrap=(v,m)=>((v%m)+m)%m;
const dst=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));

// ── Ses ──────────────────────────────────
let AC=null;
function snd(type){
  try{
    if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();
    const o=AC.createOscillator(),g=AC.createGain();
    o.connect(g);g.connect(AC.destination);
    const t=AC.currentTime;
    const cfg={
      shoot: ()=>{o.type='square';o.frequency.setValueAtTime(750,t);o.frequency.exponentialRampToValueAtTime(250,t+.07);g.gain.setValueAtTime(.14,t);g.gain.exponentialRampToValueAtTime(.001,t+.07);o.start(t);o.stop(t+.07);},
      boom:  ()=>{o.type='sawtooth';o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(25,t+.3);g.gain.setValueAtTime(.28,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.start(t);o.stop(t+.3);},
      power: ()=>{o.type='sine';o.frequency.setValueAtTime(350,t);o.frequency.exponentialRampToValueAtTime(1300,t+.22);g.gain.setValueAtTime(.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.start(t);o.stop(t+.22);},
      shield:()=>{o.type='sine';o.frequency.setValueAtTime(950,t);g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.start(t);o.stop(t+.14);},
      death: ()=>{o.type='sawtooth';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(35,t+.55);g.gain.setValueAtTime(.32,t);g.gain.exponentialRampToValueAtTime(.001,t+.55);o.start(t);o.stop(t+.55);},
      ufo:   ()=>{o.type='square';o.frequency.setValueAtTime(380,t);g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);o.start(t);o.stop(t+.09);},
      combo: ()=>{o.type='sine';o.frequency.setValueAtTime(600,t);o.frequency.setValueAtTime(900,t+.06);g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.start(t);o.stop(t+.18);},
    };
    cfg[type]&&cfg[type]();
  }catch(e){}
}

// ── Parçacık ─────────────────────────────
class P{
  constructor(x,y,col,sm=1,sx=6,l=38,sz=2.5){
    this.x=x;this.y=y;
    const a=rnd(0,TAU),s=rnd(sm,sx);
    this.vx=Math.cos(a)*s;this.vy=Math.sin(a)*s;
    this.l=this.ml=l+ri(-8,8);this.c=col;this.sz=sz;
  }
  upd(dt){this.x+=this.vx*dt*60;this.y+=this.vy*dt*60;this.vx*=.965;this.vy*=.965;this.l-=dt*60;}
  draw(cx){
    const r=this.l/this.ml;
    cx.globalAlpha=r*.9;cx.fillStyle=this.c;
    cx.beginPath();cx.arc(this.x,this.y,Math.max(.5,this.sz*r),0,TAU);cx.fill();
    cx.globalAlpha=1;
  }
}

function boom(lst,x,y,col,n=22){
  for(let i=0;i<n;i++)lst.push(new P(x,y,col,1,7,42,3));
  lst.push(new P(x,y,'#fff',0,.3,9,10));
}

// Skor metni uçuş efekti
class FloatText{
  constructor(x,y,text,col){
    this.x=x;this.y=y;this.text=text;this.col=col;this.l=60;this.ml=60;
  }
  upd(dt){this.y-=40*dt;this.l-=dt*60;}
  draw(cx,fs){
    const r=this.l/this.ml;
    cx.globalAlpha=r;cx.fillStyle=this.col;
    cx.font=`700 ${fs}px Orbitron,monospace`;
    cx.textAlign='center';cx.textBaseline='middle';
    cx.shadowColor=this.col;cx.shadowBlur=8;
    cx.fillText(this.text,this.x,this.y);
    cx.shadowBlur=0;cx.globalAlpha=1;
  }
}

// ── Yıldız alanı ──────────────────────────
function makeStars(W,H){
  return Array.from({length:150},()=>[
    rnd(0,W),rnd(0,H),rnd(.3,.9),Math.random()<.3,rnd(0,TAU)
  ]);
}
function drawStars(cx,stars,t,W,H){
  stars.forEach(([x,y,br,tw,ph])=>{
    const p=tw?br*(.5+.5*Math.sin(t*1.8+ph)):br;
    const c=Math.floor(p*55);
    cx.fillStyle=`rgba(${200+c},${200+c},255,${p})`;
    cx.beginPath();cx.arc(x,y,tw?1.2:.8,0,TAU);cx.fill();
  });
}

// Arka plan canvas çizimi (menü/over)
function animBg(canvas){
  const cx=canvas.getContext('2d');
  let W,H,stars,t=0,af;
  function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;stars=makeStars(W,H);}
  resize();
  window.addEventListener('resize',resize);
  function loop(ts){
    af=requestAnimationFrame(loop);
    t=ts*.001;
    cx.fillStyle='#05050e';cx.fillRect(0,0,W,H);
    drawStars(cx,stars,t,W,H);
  }
  loop(0);
  return ()=>cancelAnimationFrame(af);
}

// ── GEMİ ──────────────────────────────────
class Ship{
  constructor(W,H){
    this.W=W;this.H=H;
    this.x=W/2;this.y=H/2;
    this.angle=0;this.vx=0;this.vy=0;
    this.inv=0;this.blink=0;
    this.shT=0;this.rpT=0;
    this.thrusting=false;
    this.sz=Math.min(W,H)*.04;
  }
  pts(){
    const a=this.angle,sa=Math.sin(a),ca=Math.cos(a),s=this.sz;
    return[
      [this.x+sa*s,      this.y-ca*s],          // burun
      [this.x-ca*s*.78-sa*s*.78,this.y-sa*s*.78+ca*s*.78], // sol kanat
      [this.x-sa*s*.38,  this.y+ca*s*.38],       // kuyruk
      [this.x+ca*s*.78-sa*s*.78,this.y+sa*s*.78+ca*s*.78], // sağ kanat
    ];
  }
  update(dt,jx,jy,trails){
    if(this.inv>0){this.inv-=dt*60;this.blink+=dt*60;}

    // Joystick açı ve itki
    const jlen=Math.hypot(jx,jy);
    if(jlen>.12){
      // Joystick yönüne bak — smooth dönüş
      const target=Math.atan2(jx,-jy);
      let diff=target-this.angle;
      while(diff>Math.PI)diff-=TAU;
      while(diff<-Math.PI)diff+=TAU;
      this.angle+=diff*Math.min(1,dt*12);
      // İtki — joystick ne kadar itilmişse o kadar güçlü
      const power=Math.min(1,(jlen-.12)/.88);
      const sa=Math.sin(this.angle),ca=Math.cos(this.angle);
      this.vx+=sa*520*power*dt;
      this.vy-=ca*520*power*dt;
      this.thrusting=power>.2;
      if(this.thrusting){
        const ex=this.x-sa*this.sz*1.15,ey=this.y+ca*this.sz*1.15;
        for(let i=0;i<ri(1,3);i++)
          trails.push(new P(ex+rnd(-5,5),ey+rnd(-5,5),
            Math.random()<.5?'#ff8c00':'#ffe600',0,2.5,11,3));
      }
    } else {
      this.thrusting=false;
    }

    // Klavye dönüş (desktop)
    if(this._left)  this.angle-=3.5*dt*Math.PI;
    if(this._right) this.angle+=3.5*dt*Math.PI;
    if(this._thrust){
      const sa=Math.sin(this.angle),ca=Math.cos(this.angle);
      this.vx+=sa*480*dt;this.vy-=ca*480*dt;
      this.thrusting=true;
      const ex=this.x-sa*this.sz*1.1,ey=this.y+ca*this.sz*1.1;
      trails.push(new P(ex+rnd(-4,4),ey+rnd(-4,4),Math.random()<.5?'#ff8c00':'#ffe600',0,2,10,3));
    }

    // Sürtünme & hız sınırı
    this.vx*=.982;this.vy*=.982;
    const spd=Math.hypot(this.vx,this.vy);
    const MAX=500;
    if(spd>MAX){this.vx=this.vx/spd*MAX;this.vy=this.vy/spd*MAX;}

    this.x=wrap(this.x+this.vx*dt,this.W);
    this.y=wrap(this.y+this.vy*dt,this.H);
    if(this.shT>0)this.shT-=dt*60;
    if(this.rpT>0)this.rpT-=dt*60;
  }
  draw(cx){
    if(this.inv>0&&Math.floor(this.blink/5)%2===0)return;
    const p=this.pts();
    // Dış glow
    cx.save();cx.shadowColor='#00d8ff';cx.shadowBlur=20;
    cx.strokeStyle='rgba(0,216,255,.3)';cx.lineWidth=6;
    cx.beginPath();cx.moveTo(p[0][0],p[0][1]);
    for(let i=1;i<p.length;i++)cx.lineTo(p[i][0],p[i][1]);
    cx.closePath();cx.stroke();
    // Ana çizgi
    cx.shadowBlur=10;
    cx.strokeStyle='#00d8ff';cx.lineWidth=2;
    cx.beginPath();cx.moveTo(p[0][0],p[0][1]);
    for(let i=1;i<p.length;i++)cx.lineTo(p[i][0],p[i][1]);
    cx.closePath();cx.stroke();
    cx.restore();
    // Kalkan
    if(this.shT>0){
      const r=this.sz*1.7,pulse=Math.sin(Date.now()*.007)*4;
      cx.save();cx.shadowColor='#00d8ff';cx.shadowBlur=18;
      cx.strokeStyle=`rgba(0,216,255,${.4+.3*Math.sin(Date.now()*.012)})`;cx.lineWidth=2;
      cx.beginPath();cx.arc(this.x,this.y,r+pulse,0,TAU);cx.stroke();
      cx.restore();
    }
    // Hızlı ateş
    if(this.rpT>0){
      cx.save();cx.strokeStyle='rgba(255,230,0,.45)';cx.lineWidth=1.5;
      cx.beginPath();cx.arc(this.x,this.y,this.sz*1.5,0,TAU);cx.stroke();
      cx.restore();
    }
  }
  shoot(){
    const sa=Math.sin(this.angle),ca=Math.cos(this.angle),s=this.sz;
    return new Bullet(this.x+sa*s,this.y-ca*s,this.vx+sa*580,this.vy-ca*580);
  }
  hit(lives){
    if(this.shT>0){this.shT=0;snd('shield');return lives;}
    if(this.inv>0)return lives;
    snd('death');
    this.x=this.W/2;this.y=this.H/2;this.vx=this.vy=0;
    this.inv=150;this.blink=0;
    return lives-1;
  }
  col(obj){
    if(this.inv>0)return false;
    return dst(this.x,this.y,obj.x,obj.y)<obj.r+this.sz*.7;
  }
}

// ── Mermi ─────────────────────────────────
class Bullet{
  constructor(x,y,vx,vy,col='#ffe600',life=58,enemy=false){
    this.x=x;this.y=y;this.vx=vx;this.vy=vy;
    this.c=col;this.l=life;this.enemy=enemy;
    this.trail=[];this.r=5;
  }
  upd(dt,W,H){
    this.trail.push([this.x,this.y]);
    if(this.trail.length>8)this.trail.shift();
    this.x=wrap(this.x+this.vx*dt,W);
    this.y=wrap(this.y+this.vy*dt,H);
    this.l-=dt*60;
  }
  draw(cx){
    for(let i=0;i<this.trail.length;i++){
      const [tx,ty]=this.trail[i],a=(i/this.trail.length)*.45;
      cx.globalAlpha=a;cx.fillStyle=this.c;
      cx.beginPath();cx.arc(tx,ty,2,0,TAU);cx.fill();
    }
    cx.globalAlpha=1;
    cx.save();cx.shadowColor=this.c;cx.shadowBlur=12;
    cx.fillStyle=this.c;
    cx.beginPath();cx.arc(this.x,this.y,3.8,0,TAU);cx.fill();
    cx.restore();
  }
  hits(obj){return dst(this.x,this.y,obj.x,obj.y)<obj.r+this.r;}
}

// ── Asteroid ──────────────────────────────
const RSZ={3:.062,2:.036,1:.021};
const RPT={3:20,2:50,1:100};
const RC={normal:'#7acde0',fast:'#ff8c00',tough:'#ff3c50',ice:'#8cdeff',dark:'#b400ff'};

class Asteroid{
  constructor(W,H,x,y,sz=3,kind='normal'){
    this.W=W;this.H=H;this.sz=sz;this.kind=kind;
    this.r=Math.min(W,H)*RSZ[sz];
    if(x===undefined){
      if(Math.random()<.5){this.x=Math.random()<.5?rnd(0,W*.18):rnd(W*.82,W);this.y=rnd(0,H);}
      else{this.x=rnd(0,W);this.y=Math.random()<.5?rnd(0,H*.18):rnd(H*.82,H);}
    }else{this.x=x;this.y=y;}
    const mul={normal:1,fast:2.4,tough:.58,ice:.82,dark:1.6}[kind]||1;
    const spd=rnd(32,88)*(4-sz)*.42*mul;
    const a=rnd(0,TAU);
    this.vx=Math.cos(a)*spd;this.vy=Math.sin(a)*spd;
    this.hp=kind==='tough'?2:1;
    this.spin=rnd(-52,52);this.ang=0;
    this.verts=Array.from({length:13},()=>rnd(-.3,.3));
    this.flash=0;
  }
  col(){return RC[this.kind]||'#7acde0';}
  upd(dt){
    this.x=wrap(this.x+this.vx*dt,this.W);
    this.y=wrap(this.y+this.vy*dt,this.H);
    this.ang+=this.spin*dt;
    if(this.flash>0)this.flash-=dt*60;
  }
  draw(cx){
    const n=this.verts.length,c=this.flash>0?'#fff':this.col();
    cx.save();cx.shadowColor=c;cx.shadowBlur=9;cx.strokeStyle=c;cx.lineWidth=1.8;
    cx.beginPath();
    for(let i=0;i<n;i++){
      const a=(i/n)*TAU+this.ang,r=this.r*(1+this.verts[i]);
      i===0?cx.moveTo(this.x+Math.cos(a)*r,this.y+Math.sin(a)*r)
           :cx.lineTo(this.x+Math.cos(a)*r,this.y+Math.sin(a)*r);
    }
    cx.closePath();cx.stroke();
    if(this.kind==='tough'&&this.hp===2){
      cx.fillStyle='#ff3c50';cx.shadowColor='#ff3c50';cx.shadowBlur=8;
      cx.beginPath();cx.arc(this.x,this.y,5,0,TAU);cx.fill();
    }
    cx.restore();
  }
  hit(){this.flash=5;this.hp--;return this.hp<=0;}
  split(){
    if(this.sz<=1)return[];
    const nk=this.kind==='tough'?'normal':this.kind;
    return[new Asteroid(this.W,this.H,this.x,this.y,this.sz-1,nk),
           new Asteroid(this.W,this.H,this.x,this.y,this.sz-1,nk)];
  }
  score(){return RPT[this.sz]*({normal:1,fast:2,tough:3,ice:1,dark:3}[this.kind]||1);}
}

// ── UFO ───────────────────────────────────
class UFO{
  constructor(W,H){
    this.W=W;this.H=H;this.r=Math.min(W,H)*.04;
    const s=['L','R','T','B'][ri(0,3)];
    if(s==='L'){this.x=0;this.y=rnd(60,H-60);}
    else if(s==='R'){this.x=W;this.y=rnd(60,H-60);}
    else if(s==='T'){this.x=rnd(60,W-60);this.y=0;}
    else{this.x=rnd(60,W-60);this.y=H;}
    this.vx=Math.random()<.5?-85:85;this.vy=rnd(-55,55);
    this.st=90;this.tt=120;this.bullets=[];this.ang=0;
  }
  upd(dt,sx,sy){
    this.x=wrap(this.x+this.vx*dt,this.W);this.y=wrap(this.y+this.vy*dt,this.H);
    this.ang+=130*dt;
    if((this.tt-=dt*60)<=0){this.vx=(Math.random()-.5)*175||82;this.vy=rnd(-60,60);this.tt=ri(55,145);}
    if((this.st-=dt*60)<=0){
      this.st=ri(65,125);
      const a=Math.atan2(sy-this.y,sx-this.x)+rnd(-.3,.3);
      this.bullets.push(new Bullet(this.x,this.y,Math.cos(a)*260,Math.sin(a)*260,'#ff3cb4',72,true));
      snd('ufo');
    }
    this.bullets.forEach(b=>b.upd(dt,this.W,this.H));
    this.bullets=this.bullets.filter(b=>b.l>0);
  }
  draw(cx){
    const r=this.r,ix=this.x,iy=this.y;
    cx.save();cx.shadowColor='#ff3cb4';cx.shadowBlur=14;cx.strokeStyle='#ff3cb4';cx.lineWidth=2;
    cx.beginPath();cx.ellipse(ix,iy,r,r*.38,0,0,TAU);cx.stroke();
    cx.beginPath();cx.ellipse(ix,iy-r*.08,r*.52,r*.58,0,Math.PI,0);cx.stroke();
    for(let i=0;i<4;i++){
      const a=Math.PI/2*i+this.ang*Math.PI/180;
      const lx=ix+Math.cos(a)*r*.58,ly=iy+Math.sin(a)*r*.22;
      cx.fillStyle=i%2===0?'#ffe600':'#ff8c00';cx.shadowColor=cx.fillStyle;cx.shadowBlur=7;
      cx.beginPath();cx.arc(lx,ly,3,0,TAU);cx.fill();
    }
    cx.restore();
    this.bullets.forEach(b=>b.draw(cx));
  }
}

// ── Güçlendirici ─────────────────────────
const PK=['shield','rapid','life','mult'];
const PC={shield:'#00d8ff',rapid:'#ffe600',life:'#00ff9d',mult:'#ff8c00'};
const PL={shield:'K',rapid:'H',life:'+',mult:'2x'};

class PowerUp{
  constructor(x,y,W,H,kind){
    this.x=x;this.y=y;this.W=W;this.H=H;
    this.kind=kind||PK[ri(0,3)];
    this.r=Math.min(W,H)*.027;
    this.l=280;this.t=rnd(0,TAU);
  }
  upd(dt){this.l-=dt*60;this.t+=dt*3;}
  draw(cx,fsz){
    if(this.l<70&&Math.floor(this.l/7)%2===0)return;
    const c=PC[this.kind],cy=this.y+Math.sin(this.t)*4;
    for(let i=0;i<6;i++){
      const a=this.t+i*Math.PI/3;
      cx.fillStyle=c;cx.globalAlpha=.5;
      cx.beginPath();cx.arc(this.x+Math.cos(a)*this.r*1.6,cy+Math.sin(a)*this.r*1.6,2.5,0,TAU);cx.fill();
    }
    cx.globalAlpha=1;
    cx.save();cx.shadowColor=c;cx.shadowBlur=14;
    cx.strokeStyle=c;cx.lineWidth=1.8;
    cx.beginPath();cx.arc(this.x,cy,this.r,0,TAU);cx.stroke();
    cx.fillStyle=c;cx.font=`700 ${fsz}px Orbitron,monospace`;
    cx.textAlign='center';cx.textBaseline='middle';cx.fillText(PL[this.kind],this.x,cy);
    cx.restore();
  }
}

// ── Dalga ─────────────────────────────────
function makeWave(w,W,H){
  return Array.from({length:3+w},()=>{
    const r=Math.random();
    let k='normal';
    if(w>=6&&r<.13)k='dark';
    else if(w>=5&&r<.23)k='tough';
    else if(w>=3&&r<.38)k='fast';
    else if(w>=4&&r<.52)k='ice';
    return new Asteroid(W,H,undefined,undefined,3,k);
  });
}

// ═══════════════════════════════════════════
//  EKRAN YÖNETİMİ
// ═══════════════════════════════════════════
const SS={};
['menu','how','game','over'].forEach(id=>{SS[id]=document.getElementById('s-'+id);});
function show(id){
  Object.entries(SS).forEach(([k,el])=>el.classList.toggle('active',k===id));
}

// Arka plan animasyonları
const stops=[];
stops.push(animBg(document.getElementById('bg-canvas')));
stops.push(animBg(document.getElementById('bg-canvas2')));
stops.push(animBg(document.getElementById('bg-canvas3')));

// Menü butonları
function goMenu(){updateHiDisp();show('menu');}
document.getElementById('btn-play').onclick=()=>{
  AC=AC||new(window.AudioContext||window.webkitAudioContext)();
  startGame();
};
document.getElementById('btn-how').onclick=()=>show('how');
document.getElementById('btn-back').onclick=goMenu;
document.getElementById('btn-retry').onclick=startGame;
document.getElementById('btn-omenu').onclick=goMenu;

function updateHiDisp(){
  const hi=loadHi();
  const el=document.getElementById('hi-disp');
  el.textContent=hi>0?`EN YÜKSEK  ${String(hi).padStart(6,'0')}`:'';
}
updateHiDisp();

// ═══════════════════════════════════════════
//  OYUN
// ═══════════════════════════════════════════
const canvas=document.getElementById('canvas');
const cx=canvas.getContext('2d');
let W,H,stars;
let ship,bullets,asteroids,particles,trails,powerups,ufos,floats;
let score,lives,wave,shootCd,ufoT,wavePop,gameRunning,multT,combo,comboT;
let animId,lastT=null;

// Joystick durumu
const joy={x:0,y:0,active:false,id:-1};
let fireActive=false,fireId=-1;
// Klavye
const kb={left:false,right:false,thrust:false,fire:false};

function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}

function startGame(){
  resize();show('game');
  stars=makeStars(W,H);
  ship=new Ship(W,H);
  bullets=[];asteroids=makeWave(1,W,H);
  particles=[];trails=[];powerups=[];ufos=[];floats=[];
  score=0;lives=3;wave=1;shootCd=0;ufoT=480;
  wavePop=90;gameRunning=true;multT=0;combo=0;comboT=0;
  updateHUD();showWavePop(1);
  if(animId)cancelAnimationFrame(animId);
  lastT=null;animId=requestAnimationFrame(loop);
}

function endGame(){
  gameRunning=false;cancelAnimationFrame(animId);
  const hi=loadHi();saveHi(score);
  document.getElementById('o-score').textContent=String(score).padStart(6,'0');
  document.getElementById('o-hi').textContent=String(Math.max(hi,score)).padStart(6,'0');
  document.getElementById('o-wave').textContent=wave;
  const nr=document.getElementById('o-record');
  nr.style.display=(score>=Math.max(hi,score)&&score>0)?'block':'none';
  show('over');
}

function updateHUD(){
  document.getElementById('h-score').textContent=String(score).padStart(6,'0');
  document.getElementById('h-hi').textContent='EN İYİ '+String(loadHi()).padStart(6,'0');
  document.getElementById('h-wave').textContent='DALGA '+String(wave).padStart(2,'0');
  document.getElementById('h-mult').style.display=multT>0?'block':'none';
  const lv=document.getElementById('h-lives');
  lv.innerHTML=Array.from({length:lives},()=>'<span class="life">♥</span>').join('');
  // Barlar
  updateBar('shield',ship.shT,300,'c','var(--cyan)');
  updateBar('rapid', ship.rpT,300,'y','var(--yellow)');
  updateBar('mult',  multT,   600,'o','var(--orange)');
  document.getElementById('ufo-warn').style.display=ufos.length?'block':'none';
}

function updateBar(id,val,max,cls,color){
  let bar=document.getElementById('pb-'+id);
  if(!bar){
    const pbars=document.getElementById('pbars');
    bar=document.createElement('div');bar.id='pb-'+id;bar.className='pbar';
    bar.innerHTML=`<div class="pbar-lbl" style="color:${color}">${id.toUpperCase()}</div><div class="pbar-track"><div class="pbar-fill ${cls}" id="pf-${id}"></div></div>`;
    pbars.appendChild(bar);
  }
  const show=val>0;
  bar.classList.toggle('show',show);
  if(show){const f=document.getElementById('pf-'+id);if(f)f.style.width=(val/max*100)+'%';}
}

function showWavePop(w){
  const el=document.getElementById('wave-pop');
  el.textContent='DALGA  '+w;el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),1600);
}

// ── Ana döngü ─────────────────────────────
function loop(ts){
  if(!gameRunning)return;
  if(!lastT)lastT=ts;
  const dt=Math.min((ts-lastT)/1000,.05);lastT=ts;
  update(dt);draw(ts*.001);
  animId=requestAnimationFrame(loop);
}

function update(dt){
  // Ateş
  const fireRate=ship.rpT>0?4:13;
  if(shootCd>0)shootCd-=dt*60;
  if((fireActive||kb.fire)&&shootCd<=0&&ship.inv<=0){
    bullets.push(ship.shoot());shootCd=fireRate;snd('shoot');
  }

  // Klavye kontrolü gemiye aktar
  ship._left=kb.left;ship._right=kb.right;ship._thrust=kb.thrust;
  ship.update(dt,joy.x,joy.y,trails);

  bullets.forEach(b=>b.upd(dt,W,H));bullets=bullets.filter(b=>b.l>0);
  asteroids.forEach(a=>a.upd(dt));
  particles.forEach(p=>p.upd(dt));particles=particles.filter(p=>p.l>0);
  trails.forEach(p=>p.upd(dt));trails=trails.filter(p=>p.l>0);
  powerups.forEach(p=>p.upd(dt));powerups=powerups.filter(p=>p.l>0);
  floats.forEach(f=>f.upd(dt));floats=floats.filter(f=>f.l>0);
  ufos.forEach(u=>u.upd(dt,ship.x,ship.y));
  if(multT>0)multT-=dt*60;
  if(comboT>0)comboT-=dt*60;else combo=0;

  // UFO
  ufoT-=dt*60;
  if(ufoT<=0&&ufos.length<2){ufos.push(new UFO(W,H));ufoT=ri(320,680);}

  // Oyuncu mermisi ↔ asteroid
  const mult=multT>0?2:1;
  for(let i=bullets.length-1;i>=0;i--){
    if(bullets[i].enemy)continue;
    for(let j=asteroids.length-1;j>=0;j--){
      if(bullets[i].hits(asteroids[j])){
        const a=asteroids[j];
        bullets.splice(i,1);
        if(a.hit()){
          boom(particles,a.x,a.y,a.col(),22);snd('boom');
          combo++;comboT=90;
          const pts=a.score()*mult*(combo>=3?combo:1);
          score+=pts;
          floats.push(new FloatText(a.x,a.y-a.r,
            combo>=3?`${combo}x COMBO! +${pts}`:`+${pts}`,
            combo>=3?'#ff8c00':'#ffe600'));
          if(combo>=3)snd('combo');
          asteroids.splice(j,1);
          asteroids.push(...a.split());
          if(Math.random()<.14)powerups.push(new PowerUp(a.x,a.y,W,H));
        }else{
          boom(particles,a.x,a.y,'#ff3c50',6);
        }
        break;
      }
    }
  }

  // Oyuncu mermisi ↔ UFO
  for(let i=bullets.length-1;i>=0;i--){
    if(bullets[i].enemy)continue;
    for(let j=ufos.length-1;j>=0;j--){
      if(dst(bullets[i].x,bullets[i].y,ufos[j].x,ufos[j].y)<ufos[j].r){
        bullets.splice(i,1);
        boom(particles,ufos[j].x,ufos[j].y,'#ff3cb4',28);snd('boom');
        const pts=500*mult;score+=pts;
        floats.push(new FloatText(ufos[j].x,ufos[j].y,'UFO! +'+pts,'#ff3cb4'));
        ufos.splice(j,1);break;
      }
    }
  }

  // UFO mermisi ↔ gemi
  for(const u of ufos){
    for(let i=u.bullets.length-1;i>=0;i--){
      if(ship.inv<=0&&dst(u.bullets[i].x,u.bullets[i].y,ship.x,ship.y)<14){
        u.bullets.splice(i,1);
        boom(particles,ship.x,ship.y,'#00d8ff',22);
        lives=ship.hit(lives);combo=0;
        if(lives<=0){endGame();return;}break;
      }
    }
  }

  // Gemi ↔ asteroid
  for(const a of asteroids){
    if(ship.col(a)){
      boom(particles,ship.x,ship.y,'#00d8ff',28);
      lives=ship.hit(lives);combo=0;
      if(lives<=0){endGame();return;}break;
    }
  }

  // Güçlendirici toplama
  for(let i=powerups.length-1;i>=0;i--){
    const p=powerups[i];
    if(dst(ship.x,ship.y,p.x,p.y)<p.r+18){
      snd('power');
      boom(particles,p.x,p.y,PC[p.kind],12);
      floats.push(new FloatText(p.x,p.y,PL[p.kind],PC[p.kind]));
      if(p.kind==='shield')ship.shT=300;
      else if(p.kind==='rapid')ship.rpT=300;
      else if(p.kind==='life')lives=Math.min(lives+1,5);
      else if(p.kind==='mult')multT=600;
      powerups.splice(i,1);
    }
  }

  // Yeni dalga
  if(asteroids.length===0){
    wave++;asteroids=makeWave(wave,W,H);
    showWavePop(wave);
  }
  if(wavePop>0)wavePop-=dt*60;
  updateHUD();
}

function draw(t){
  cx.fillStyle='#05050e';cx.fillRect(0,0,W,H);
  drawStars(cx,stars,t,W,H);
  trails.forEach(p=>p.draw(cx));
  particles.forEach(p=>p.draw(cx));
  const fsz=Math.max(10,Math.min(W,H)*.03);
  powerups.forEach(p=>p.draw(cx,fsz*.8));
  asteroids.forEach(a=>a.draw(cx));
  bullets.forEach(b=>b.draw(cx));
  ufos.forEach(u=>u.draw(cx));
  ship.draw(cx);
  floats.forEach(f=>f.draw(cx,fsz));
}

// ═══════════════════════════════════════════
//  JOYSTİCK
// ═══════════════════════════════════════════
const joyZone=document.getElementById('joy-zone');
const joyOuter=document.getElementById('joy-outer');
const joyInner=document.getElementById('joy-inner');
const JR=()=>joyOuter.offsetWidth/2;

function joyMove(cx,cy){
  const rect=joyOuter.getBoundingClientRect();
  const ox=rect.left+rect.width/2,oy=rect.top+rect.height/2;
  let dx=cx-ox,dy=cy-oy;
  const len=Math.hypot(dx,dy),r=JR();
  if(len>r){dx=dx/len*r;dy=dy/len*r;}
  joyInner.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
  joy.x=dx/r;joy.y=dy/r;joy.active=true;
}
function joyReset(){
  joyInner.style.transform='translate(-50%,-50%)';
  joy.x=0;joy.y=0;joy.active=false;joy.id=-1;
}

joyZone.addEventListener('touchstart',e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
    if(joy.id===-1){joy.id=t.identifier;joyMove(t.clientX,t.clientY);}
  }
},{passive:false});

window.addEventListener('touchmove',e=>{
  e.preventDefault();
  for(const t of e.changedTouches){
    if(t.identifier===joy.id)joyMove(t.clientX,t.clientY);
    if(t.identifier===fireId){}
  }
},{passive:false});

window.addEventListener('touchend',e=>{
  for(const t of e.changedTouches){
    if(t.identifier===joy.id)joyReset();
    if(t.identifier===fireId){fireActive=false;fireId=-1;document.getElementById('btn-fire').classList.remove('pressed');}
  }
});
window.addEventListener('touchcancel',e=>{
  for(const t of e.changedTouches){
    if(t.identifier===joy.id)joyReset();
    if(t.identifier===fireId){fireActive=false;fireId=-1;}
  }
});

// ── Ateş butonu ──────────────────────────
const fbtn=document.getElementById('btn-fire');
fbtn.addEventListener('touchstart',e=>{
  e.preventDefault();e.stopPropagation();
  for(const t of e.changedTouches){
    if(fireId===-1){fireId=t.identifier;fireActive=true;fbtn.classList.add('pressed');}
  }
},{passive:false});

// Mouse fallback (desktop)
fbtn.addEventListener('mousedown',()=>{fireActive=true;fbtn.classList.add('pressed');});
window.addEventListener('mouseup',()=>{fireActive=false;fbtn.classList.remove('pressed');});

// ── Klavye ────────────────────────────────
window.addEventListener('keydown',e=>{
  if(!gameRunning)return;
  if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')kb.left=true;
  if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')kb.right=true;
  if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')kb.thrust=true;
  if(e.key===' '||e.key==='Enter')kb.fire=true;
  if(e.key==='Escape')endGame();
  e.preventDefault();
});
window.addEventListener('keyup',e=>{
  if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A')kb.left=false;
  if(e.key==='ArrowRight'||e.key==='d'||e.key==='D')kb.right=false;
  if(e.key==='ArrowUp'||e.key==='w'||e.key==='W')kb.thrust=false;
  if(e.key===' '||e.key==='Enter')kb.fire=false;
});

// ── Resize ────────────────────────────────
window.addEventListener('resize',()=>{
  if(gameRunning){
    resize();stars=makeStars(W,H);
    ship.W=W;ship.H=H;
    asteroids.forEach(a=>{a.W=W;a.H=H;});
    ufos.forEach(u=>{u.W=W;u.H=H;});
    powerups.forEach(p=>{p.W=W;p.H=H;});
  }
});

show('menu');
