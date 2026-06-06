/* 
NIM: 2401020066
NAMA: SASTA TANIA PUTRI
Kontrol pengguna dan UI
 */
/* ── Input ───────────────────────────────────── */
cv.addEventListener('click',e=>{
  if(didDrag||!mode||!nodes.length)return;
  const r=cv.getBoundingClientRect();
  const wx=sx2w(e.clientX-r.left),wy=sy2w(e.clientY-r.top);
  const hit=nodes.find(n=>dist({x:wx,y:wy},n)<90);
  if(!hit){toast('Klik lebih dekat ke persimpangan jalan!');return;}
  if(mode==='start'){sN=hit;if(eN===sN)eN=null;}
  else{eN=hit;if(sN===eN)sN=null;}
  mode=null;
  document.getElementById('bS').className='btn';
  document.getElementById('bE').className='btn';
  shortP=[];carPath=[];carRun=false;
  aOn=false;openSet=[];closedSet=new Set();cameFrom={};explored=0;
  updateUI('Lokasi diset');toast('Lokasi diset — tekan Hitung A*!');
});

cv.addEventListener('mousedown',e=>{
  if(e.button!==0)return;
  drag=true;didDrag=false;
  dsx=e.clientX;dsy=e.clientY;
  dcx0=cam.cx;dcy0=cam.cy;
  cv.classList.add('grabbing');
  if(followCar){
    followCar=false;
    document.getElementById('bF').textContent='📷 Ikut Mobil: OFF';
    document.getElementById('bF').className='btn';
  }
});
window.addEventListener('mousemove',e=>{
  if(!drag)return;
  const dx=e.clientX-dsx,dy=e.clientY-dsy;
  if(Math.abs(dx)+Math.abs(dy)>4)didDrag=true;
  cam.cx=dcx0+dx;cam.cy=dcy0+dy;
});
window.addEventListener('mouseup',()=>{drag=false;cv.classList.remove('grabbing');setTimeout(()=>{didDrag=false;},50);});

cv.addEventListener('wheel',e=>{
  e.preventDefault();
  const r=cv.getBoundingClientRect();
  const f=e.deltaY<0?1.12:1/1.12;
  doZoom(f,e.clientX-r.left,e.clientY-r.top);
},{passive:false});

let touches0=null;
cv.addEventListener('touchstart',e=>{
  touches0=Array.from(e.touches).map(t=>({x:t.clientX,y:t.clientY}));
  didDrag=false;
  dcx0=cam.cx;dcy0=cam.cy;
  if(followCar&&e.touches.length===1){
    followCar=false;
    document.getElementById('bF').textContent='📷 Ikut Mobil: OFF';
    document.getElementById('bF').className='btn';
  }
},{passive:true});
cv.addEventListener('touchmove',e=>{
  e.preventDefault();
  const ts=Array.from(e.touches).map(t=>({x:t.clientX,y:t.clientY}));
  if(ts.length===1&&touches0&&touches0.length===1){
    const dx=ts[0].x-touches0[0].x,dy=ts[0].y-touches0[0].y;
    if(Math.abs(dx)+Math.abs(dy)>5)didDrag=true;
    cam.cx=dcx0+dx;cam.cy=dcy0+dy;
  }
  if(ts.length===2&&touches0&&touches0.length>=2){
    const d0=Math.hypot(touches0[1].x-touches0[0].x,touches0[1].y-touches0[0].y);
    const d1=Math.hypot(ts[1].x-ts[0].x,ts[1].y-ts[0].y);
    const f=d1/(d0||1);
    const mx=(ts[0].x+ts[1].x)/2,my=(ts[0].y+ts[1].y)/2;
    const r=cv.getBoundingClientRect();
    doZoom(f,mx-r.left,my-r.top);
    touches0=ts;
    dcx0=cam.cx;dcy0=cam.cy;
    didDrag=true;
  }
},{passive:false});
cv.addEventListener('touchend',()=>{setTimeout(()=>{didDrag=false;},60);});

document.getElementById('sR').addEventListener('input',function(){document.getElementById('sL').textContent=this.value;});

/* ── UI helpers ──────────────────────────────── */
function toggleFollow(){
  followCar=!followCar;
  document.getElementById('bF').textContent='📷 Ikut Mobil: '+(followCar?'ON':'OFF');
  document.getElementById('bF').className='btn'+(followCar?' follow':'');
  toast(followCar?'Kamera mengikuti mobil':'Kamera bebas');
}
function toggleTrack(){
  if(!carPath.length){toast('Hitung A* dulu!');return;}
  carRun=!carRun;
  if(carRun&&!followCar){
    followCar=true;
    document.getElementById('bF').textContent='📷 Ikut Mobil: ON';
    document.getElementById('bF').className='btn follow';
  }
  document.getElementById('bT').textContent=carRun?'⏸ Jeda':'▶ Lanjut';
  document.getElementById('bT').className=carRun?'btn sel':'btn info';
}
function randPos(silent){
  if(nodes.length<2)return;
  shortP=[];carPath=[];carRun=false;
  aOn=false;openSet=[];closedSet=new Set();cameFrom={};explored=0;
  sN=nodes[Math.floor(Math.random()*nodes.length)];
  do{eN=nodes[Math.floor(Math.random()*nodes.length)];}while(eN===sN);
  updateUI('Posisi diacak');
  if(!silent)toast('Posisi diacak');
}
function setMode(m){
  if(!nodes.length){toast('Acak peta dulu!');return;}
  mode=m;
  document.getElementById('bS').className='btn'+(m==='start'?' sel':'');
  document.getElementById('bE').className='btn'+(m==='end'?' sel':'');
  toast(m==='start'?'Klik persimpangan untuk START':'Klik persimpangan untuk TUJUAN',2200);
}
function setStatus(m){document.getElementById('iSt').textContent=m;}
function updateUI(msg){
  if(msg)setStatus(msg);
  document.getElementById('iSn').textContent=sN?'Node '+sN.id:'—';
  document.getElementById('iEn').textContent=eN?'Node '+eN.id:'—';
  document.getElementById('iDi').textContent=(shortP.length>0&&eN)?Math.round(gS[eN.id])+' m':'—';
}

/* Expose to HTML onclick */
window.initMap=initMap;window.setMode=setMode;window.randPos=randPos;
window.runAstar=runAstar;window.toggleTrack=toggleTrack;window.toggleFollow=toggleFollow;
window.zoomBtn=zoomBtn;window.resetCam=resetCam;

/* ── Boot ────────────────────────────────────── */
initMap();
draw();
})();
</script>
</body>
</html>