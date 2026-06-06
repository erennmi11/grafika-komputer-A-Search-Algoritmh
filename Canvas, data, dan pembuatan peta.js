/* =========================
   Sheren Naomi B — Canvas, data, dan pembuatan peta
   ========================= */
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const wr = document.getElementById('wrap');
let W=0,H=0;
function rsz(){
  const r=wr.getBoundingClientRect();
  cv.width=r.width; cv.height=r.height; W=r.width; H=r.height;
}
new ResizeObserver(rsz).observe(wr); rsz();

let cam={cx:0,cy:0,sc:1};
function wx2s(wx){return wx*cam.sc+cam.cx;}
function wy2s(wy){return wy*cam.sc+cam.cy;}
function sx2w(sx){return(sx-cam.cx)/cam.sc;}
function sy2w(sy){return(sy-cam.cy)/cam.sc;}

const ROAD_R=52;
let nodes=[],edges=[],buildings=[],trees=[];
let sN=null,eN=null,mode=null,didDrag=false;

let shortP=[],openSet=[],closedSet=new Set(),cameFrom={},gS={},fS={},explored=0,aOn=false,afc=0;

let carPath=[],carX=0,carY=0,carAng=0,carRun=false,carIdx=0;
let followCar=false;

let drag=false,dsx=0,dsy=0,dcx0=0,dcy0=0;

let toastT=null;
function toast(m,d=1900){
  const el=document.getElementById('toast');
  el.textContent=m;el.style.opacity=1;
  clearTimeout(toastT);toastT=setTimeout(()=>el.style.opacity=0,d);
}

function bezPt(p0,cp,p1,t){
  const u=1-t;
  return{x:u*u*p0.x+2*u*t*cp.x+t*t*p1.x,
         y:u*u*p0.y+2*u*t*cp.y+t*t*p1.y};
}
function dist(a,b){return Math.hypot(b.x-a.x,b.y-a.y);}

const WS=3000;

function initMap(){
  nodes=[];edges=[];buildings=[];trees=[];
  sN=null;eN=null;mode=null;
  shortP=[];carPath=[];carRun=false;
  aOn=false;openSet=[];closedSet=new Set();cameFrom={};explored=0;
  document.getElementById('bT').textContent='Mulai Perjalanan';
  document.getElementById('bT').className='btn info';

  const M=240, IW=WS-M*2, IH=WS-M*2;
  const GX=6, GY=6;
  const cw=IW/GX, ch=IH/GY;

  for(let r=0;r<=GY;r++) for(let c=0;c<=GX;c++){
    const onEdge=(c===0||c===GX||r===0||r===GY);
    const jx=onEdge?0:(Math.random()-.5)*cw*.35;
    const jy=onEdge?0:(Math.random()-.5)*ch*.35;
    nodes.push({id:nodes.length,x:M+c*cw+jx,y:M+r*ch+jy,neighbors:[],deg:0});
  }

  const gi=(r,c)=>r*(GX+1)+c;
  for(let r=0;r<=GY;r++) for(let c=0;c<GX;c++) addEdge(gi(r,c),gi(r,c+1));
  for(let r=0;r<GY;r++) for(let c=0;c<=GX;c++) addEdge(gi(r,c),gi(r+1,c));
  for(let r=0;r<GY;r++) for(let c=0;c<GX;c++){
    if(Math.random()<.52){
      if(Math.random()<.5) addEdge(gi(r,c),gi(r+1,c+1));
      else                 addEdge(gi(r,c+1),gi(r+1,c));
    }
  }

  placeTrees();
  placeBuildings();
  randPos(true);
  resetCam();
  updateUI('Peta siap');
  toast('Peta baru — '+nodes.length+' persimpangan');
}

function addEdge(u,v){
  if(u===v||u<0||v<0||u>=nodes.length||v>=nodes.length) return;
  if(edges.some(e=>(e.from===u&&e.to===v)||(e.from===v&&e.to===u))) return;
  const p0=nodes[u],p1=nodes[v];
  const len=dist(p0,p1)||1;
  const mx=(p0.x+p1.x)/2,my=(p0.y+p1.y)/2;
  const dx=(p1.x-p0.x)/len,dy=(p1.y-p0.y)/len;
  const px=-dy;const py=dx;

  const isStraight = Math.random() < 0.1;
  const inten = isStraight ? 0 : (0.05 + Math.random()*.12) * len;
  const sign = Math.random() > .5 ? 1 : -1;

  edges.push({from:u,to:v,cpX:mx+px*inten*sign,cpY:my+py*inten*sign,weight:len});
  nodes[u].neighbors.push(v);nodes[v].neighbors.push(u);
  nodes[u].deg++;nodes[v].deg++;
}

function onAnyRoad(x,y,minD){
  for(const e of edges){
    const p0=nodes[e.from],p1=nodes[e.to],cp={x:e.cpX,y:e.cpY};
    for(let t=0;t<=1;t+=0.05){
      const bp=bezPt(p0,cp,p1,t);
      if(dist({x,y},bp)<minD) return true;
    }
  }
  return false;
}

function placeTrees(){
  trees=[];
  for(let i=0;i<350;i++){
    const x=100+Math.random()*(WS-200);
    const y=100+Math.random()*(WS-200);
    if(onAnyRoad(x,y,ROAD_R+40)) continue;
    if(nodes.some(n=>dist({x,y},n)<ROAD_R+50)) continue;
    trees.push({x,y,r:14+Math.random()*22,dark:Math.random()<.4,s:Math.random()});
  }
}

function placeBuildings(){
  buildings=[];
  const CLEAR=ROAD_R+55;
  for(let i=0;i<300;i++){
    const x=120+Math.random()*(WS-240);
    const y=120+Math.random()*(WS-240);
    if(onAnyRoad(x,y,CLEAR)) continue;
    if(nodes.some(n=>dist({x,y},n)<CLEAR+20)) continue;
    if(buildings.some(b=>dist({x,y},{x:b.x,y:b.y})<70)) continue;
    const isGedung=Math.random()<.35;
    buildings.push({x,y,type:isGedung?'gedung':'rumah',seed:Math.random()});
  }
}