/* =========================
   Nur Indah Sari — Gambar dan Animasi
   ========================= */
function moveCar(){
  if(!carRun||!carPath.length)return;
  const spd=parseInt(document.getElementById('sR').value)*1.8;
  let rem=spd;
  while(rem>0&&carIdx<carPath.length-1){
    const nx=carPath[carIdx+1].x-carX,ny=carPath[carIdx+1].y-carY;
    const d=Math.hypot(nx,ny);
    if(d<0.01){carIdx++;continue;}
    const step=Math.min(rem,d);
    carX+=nx/d*step;carY+=ny/d*step;
    const ta=Math.atan2(ny,nx);
    let diff=ta-carAng;
    while(diff>Math.PI)diff-=2*Math.PI;while(diff<-Math.PI)diff+=2*Math.PI;
    carAng+=diff*0.13;
    rem-=step;if(step>=d)carIdx++;
  }
  if(followCar){
    const tx=W/2-carX*cam.sc;
    const ty=H/2-carY*cam.sc;
    cam.cx+=(tx-cam.cx)*0.09;
    cam.cy+=(ty-cam.cy)*0.09;
  }
  if(carIdx>=carPath.length-1){
    carRun=false;
    document.getElementById('bT').textContent='Mulai Perjalanan';
    document.getElementById('bT').className='btn info';
    setStatus('Tiba di tujuan! 🎉');toast('🎉 Tiba di tujuan!');
  }
}

function draw(){
  if(!W||!H){requestAnimationFrame(draw);return;}

  ctx.fillStyle='#3a6b28';
  ctx.fillRect(0,0,W,H);

  ctx.save();
  ctx.translate(cam.cx,cam.cy);
  ctx.scale(cam.sc,cam.sc);

  const BORDER=8000;
  const tg=ctx.createRadialGradient(WS/2,WS/2,WS*.08,WS/2,WS/2,WS*.75);
  tg.addColorStop(0,'#44803a');
  tg.addColorStop(0.5,'#3a6b28');
  tg.addColorStop(1,'#2e5520');
  ctx.fillStyle=tg;
  ctx.fillRect(-BORDER,-BORDER,WS+BORDER*2,WS+BORDER*2);

  drawGrassPatches();

  for(const t of trees){
    ctx.fillStyle='rgba(0,0,0,0.16)';
    ctx.beginPath();ctx.ellipse(t.x+5,t.y+6,t.r*.9,t.r*.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=t.dark?'#2d6118':'#3d8222';
    ctx.beginPath();ctx.arc(t.x,t.y,t.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=t.dark?'#387022':'#52a830';
    ctx.beginPath();ctx.arc(t.x-t.r*.3,t.y-t.r*.3,t.r*.55,0,Math.PI*2);ctx.fill();
  }

  for(const e of edges){
    drawRoadLayer(e,115,'#1c180e','round');
  }
  for(const e of edges){
    drawRoadLayer(e,95,'#8a7e6e','round');
  }
  for(const e of edges){
    drawRoadLayer(e,70,'#2a2620','round');
  }
  for(const e of edges){
    drawRoadLayer(e,64,'#322e24','round');
  }
  for(const n of nodes){
    ctx.beginPath();ctx.arc(n.x,n.y,52,0,Math.PI*2);ctx.fillStyle='#2a2620';ctx.fill();
    ctx.beginPath();ctx.arc(n.x,n.y,44,0,Math.PI*2);ctx.fillStyle='#322e24';ctx.fill();
  }
  ctx.save();ctx.setLineDash([28,22]);ctx.lineWidth=3.5;ctx.lineCap='round';
  for(const e of edges){
    const p0=nodes[e.from],p1=nodes[e.to];
    ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.quadraticCurveTo(e.cpX,e.cpY,p1.x,p1.y);
    ctx.strokeStyle='rgba(255,255,160,0.35)';ctx.stroke();
  }
  ctx.restore();

  for(const cid in cameFrom){
    const par=cameFrom[cid],ch=nodes.find(n=>n.id==cid);
    if(!ch||!par)continue;
    ctx.beginPath();ctx.moveTo(par.x,par.y);ctx.lineTo(ch.x,ch.y);
    ctx.strokeStyle='rgba(255,200,0,0.22)';ctx.lineWidth=18;ctx.lineCap='round';ctx.stroke();
  }

  if(shortP.length>1){
    for(let i=0;i<shortP.length-1;i++){
      const u=shortP[i],v=shortP[i+1];
      const e=edges.find(e=>(e.from===u&&e.to===v)||(e.from===v&&e.to===u));
      if(!e)continue;
      const p0=nodes[u],p1=nodes[v];
      ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.quadraticCurveTo(e.cpX,e.cpY,p1.x,p1.y);
      ctx.strokeStyle='rgba(0,220,200,0.18)';ctx.lineWidth=46;ctx.lineCap='round';ctx.stroke();
      ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.quadraticCurveTo(e.cpX,e.cpY,p1.x,p1.y);
      ctx.strokeStyle='rgba(0,220,190,0.85)';ctx.lineWidth=22;ctx.stroke();
    }
  }

  for(const b of buildings){
    ctx.save();ctx.translate(b.x,b.y);
    b.type==='gedung'?drawGedung(ctx,b.seed):drawRumah(ctx,b.seed);
    ctx.restore();
  }

  for(const n of nodes){
    const inC=closedSet.has(n.id),inO=openSet.some(o=>o.id===n.id);
    if(n===sN||n===eN||inC||inO){
      ctx.beginPath();ctx.arc(n.x,n.y,72,0,Math.PI*2);
      ctx.fillStyle=n===sN?'rgba(231,76,60,0.22)':n===eN?'rgba(46,204,113,0.22)':inO?'rgba(255,200,0,0.15)':'rgba(52,152,219,0.1)';
      ctx.fill();
    }
    if(n===sN)drawFlag(ctx,n.x,n.y,'#e74c3c','S');
    if(n===eN)drawFlag(ctx,n.x,n.y,'#2ecc71','T');
  }

  if(carPath.length>0){
    if(carRun){
      ctx.save();ctx.translate(carX,carY);ctx.rotate(carAng);
      const gl=ctx.createRadialGradient(30,0,8,30,0,180);
      gl.addColorStop(0,'rgba(255,248,180,0.32)');
      gl.addColorStop(1,'rgba(255,248,180,0)');
      ctx.fillStyle=gl;
      ctx.beginPath();ctx.moveTo(30,-14);ctx.lineTo(210,-65);ctx.lineTo(210,65);ctx.closePath();ctx.fill();
      ctx.restore();
    }
    ctx.save();ctx.translate(carX,carY);ctx.rotate(carAng);
    drawCar(ctx,carRun);
    ctx.restore();
  }

  ctx.restore();
  document.getElementById('iZm').textContent=Math.round(cam.sc*100)+'%';

  if(aOn){afc++;if(afc>=2){stepAstar();afc=0;}}
  moveCar();
  updateUI();
  requestAnimationFrame(draw);
}

let grassPatches=null;
function buildGrassPatches(){
  grassPatches=[];
  const rng=seededRng(42);
  const SIZE=WS+16000;
  const ORIGIN=-8000;
  for(let i=0;i<1200;i++){
    grassPatches.push({
      x:ORIGIN+rng()*SIZE,
      y:ORIGIN+rng()*SIZE,
      rx:30+rng()*120,ry:20+rng()*80,
      rot:rng()*Math.PI,
      col:`rgba(${40+rng()*25|0},${90+rng()*35|0},${25+rng()*18|0},${0.12+rng()*.14})`
    });
  }
}
function seededRng(s){let v=s;return function(){v=v*1664525+1013904223>>>0;return v/4294967296;};}

function drawGrassPatches(){
  if(!grassPatches)buildGrassPatches();
  for(const p of grassPatches){
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
    ctx.fillStyle=p.col;
    ctx.beginPath();ctx.ellipse(0,0,p.rx,p.ry,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
}

function drawRoadLayer(e,lw,col,cap){
  const p0=nodes[e.from],p1=nodes[e.to];
  ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.quadraticCurveTo(e.cpX,e.cpY,p1.x,p1.y);
  ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineCap=cap||'round';ctx.lineJoin='round';ctx.stroke();
}

function drawCar(c,lights){
  c.fillStyle='rgba(0,0,0,0.24)';
  c.beginPath();c.ellipse(3,9,32,14,0,0,Math.PI*2);c.fill();
  c.fillStyle='#e74c3c';rrRect(c,-30,-15,60,30,8);c.fill();
  c.fillStyle='#c0392b';rrRect(c,-13,-13,26,24,5);c.fill();
  c.fillStyle='rgba(160,230,255,0.88)';c.fillRect(6,-12,16,22);
  c.fillStyle='rgba(120,190,225,0.75)';c.fillRect(-20,-12,12,22);
  c.fillStyle='#111';
  [[-17,-17],[15,-17],[-17,13],[15,13]].forEach(([bx,by])=>{
    c.beginPath();c.ellipse(bx,by,7.5,5.5,0,0,Math.PI*2);c.fill();
    c.fillStyle='#3a3a3a';c.beginPath();c.arc(bx,by,3.2,0,Math.PI*2);c.fill();
    c.fillStyle='#111';
  });
  if(lights){
    c.fillStyle='rgba(255,248,140,1)';
    c.beginPath();c.ellipse(30,-9,6,4,0,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(30,9,6,4,0,0,Math.PI*2);c.fill();
    c.fillStyle='rgba(255,250,200,0.4)';
    c.beginPath();c.ellipse(30,-9,13,9,0,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(30,9,13,9,0,0,Math.PI*2);c.fill();
  } else {
    c.fillStyle='rgba(255,248,140,0.65)';
    c.beginPath();c.ellipse(30,-9,5.5,3.5,0,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(30,9,5.5,3.5,0,0,Math.PI*2);c.fill();
  }
  c.fillStyle=lights?'rgba(255,40,40,1)':'rgba(255,80,80,0.8)';
  c.beginPath();c.ellipse(-30,-9,5,3.5,0,0,Math.PI*2);c.fill();
  c.beginPath();c.ellipse(-30,9,5,3.5,0,0,Math.PI*2);c.fill();
}

function rrRect(c,x,y,w,h,r){
  c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);
  c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);
  c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();
}

const gCols=['#2c3e50','#34495e','#2e4057','#283747','#1c2833','#212f3d'];
const rCols=['#c0392b','#7d3c98','#1a5276','#117a65','#784212','#1e8449'];
const roofC=['#922b21','#6c3483','#154360','#0e6655','#6e2f1a','#1a6e37'];

function drawGedung(c,s){
  const w=52+s*14,h=58+Math.floor(s*5)*18;
  const col=gCols[Math.floor(s*gCols.length)];
  c.fillStyle='rgba(0,0,0,0.22)';c.fillRect(-w/2+7,-h+7,w,h);
  c.fillStyle=col;c.fillRect(-w/2,-h,w,h);
  c.fillStyle='rgba(0,0,0,0.2)';c.fillRect(-w/2,-h,w,10);
  c.fillStyle='rgba(150,215,255,0.62)';
  for(let rr=-(h-18);rr<-14;rr+=22) for(let cc=-w/2+10;cc<w/2-13;cc+=19) c.fillRect(cc,rr,11,13);
  c.fillStyle='rgba(255,255,255,0.05)';c.fillRect(-w/2,-h,6,h);
}

function drawRumah(c,s){
  const w=50,bh=36;
  const col=rCols[Math.floor(s*rCols.length)];
  const rc=roofC[Math.floor(s*roofC.length)];
  c.fillStyle='rgba(0,0,0,0.2)';c.fillRect(-w/2+5,-bh+5,w,bh);
  c.fillStyle=col;c.fillRect(-w/2,-bh,w,bh);
  c.fillStyle='#5d3a1a';c.fillRect(-7,0,14,bh);
  c.fillStyle='rgba(150,210,255,0.78)';c.fillRect(11,-bh+9,12,12);c.fillRect(-23,-bh+9,12,12);
  c.fillStyle=rc;
  c.beginPath();c.moveTo(-w/2-12,-bh);c.lineTo(0,-bh-36);c.lineTo(w/2+12,-bh);c.closePath();c.fill();
}

function drawFlag(c,x,y,col,lbl){
  c.save();c.translate(x,y);
  c.strokeStyle='rgba(255,255,255,0.75)';c.lineWidth=4;c.lineCap='round';
  c.beginPath();c.moveTo(-16,-32);c.lineTo(-16,-92);c.stroke();
  c.fillStyle=col;
  c.beginPath();c.moveTo(-16,-92);c.lineTo(26,-77);c.lineTo(-16,-60);c.closePath();c.fill();
  c.fillStyle='#fff';c.font='bold 15px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(lbl,5,-77);
  c.beginPath();c.arc(-16,-32,9,0,Math.PI*2);c.fillStyle=col;c.fill();
  c.restore();
}