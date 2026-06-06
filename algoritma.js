/* =========================
   SALSA NABILLA — Algoritma A*
   ========================= */
function runAstar(){
  if(!sN||!eN){toast('Pilih Start & Tujuan dulu!');return;}
  shortP=[];carPath=[];carRun=false;
  openSet=[sN];closedSet=new Set();cameFrom={};explored=0;
  nodes.forEach(n=>{gS[n.id]=Infinity;fS[n.id]=Infinity;});
  gS[sN.id]=0;fS[sN.id]=heur(sN,eN);
  aOn=true;setStatus('A* menghitung...');
}
function heur(a,b){return Math.hypot(b.x-a.x,b.y-a.y);}
function stepAstar(){
  if(!openSet.length){aOn=false;setStatus('Tidak ada rute!');return;}
  openSet.sort((a,b)=>fS[a.id]-fS[b.id]);
  const cur=openSet.shift();closedSet.add(cur.id);explored++;
  if(cur.id===eN.id){
    let path=[cur.id],t=cur.id;
    while(t in cameFrom){t=cameFrom[t].id;path.unshift(t);}
    shortP=path;aOn=false;buildCarPath();
    setStatus('Rute: '+path.length+' titik, '+Math.round(gS[eN.id])+' m');
    updateUI();toast('Rute ditemukan! Tekan Mulai Perjalanan');
    return;
  }
  for(const nid of cur.neighbors){
    if(closedSet.has(nid))continue;
    const e=edges.find(e=>(e.from===cur.id&&e.to===nid)||(e.from===nid&&e.to===cur.id));
    if(!e)continue;
    const g=gS[cur.id]+e.weight;
    if(g<gS[nid]){cameFrom[nid]=cur;gS[nid]=g;fS[nid]=g+heur(nodes[nid],eN);if(!openSet.some(n=>n.id===nid))openSet.push(nodes[nid]);}
  }
}
function buildCarPath(){
  if(shortP.length<2)return;
  let raw=[];
  for(let i=0;i<shortP.length-1;i++){
    const u=shortP[i],v=shortP[i+1];
    const e=edges.find(e=>(e.from===u&&e.to===v)||(e.from===v&&e.to===u));
    if(!e)continue;
    const fwd=e.from===u;
    const SEGS=60;
    for(let s=(i===0?0:1);s<=SEGS;s++){
      const t=fwd?s/SEGS:(SEGS-s)/SEGS;
      raw.push(bezPt(nodes[e.from],{x:e.cpX,y:e.cpY},nodes[e.to],t));
    }
  }
  let pts=[...raw];
  for(let p=0;p<8;p++){
    const o=[pts[0]];
    for(let i=1;i<pts.length-1;i++) o.push({x:pts[i-1].x*.25+pts[i].x*.5+pts[i+1].x*.25,y:pts[i-1].y*.25+pts[i].y*.5+pts[i+1].y*.25});
    o.push(pts[pts.length-1]);pts=o;
  }
  carPath=pts;carIdx=0;
  carX=pts[0].x;carY=pts[0].y;
  if(pts.length>1)carAng=Math.atan2(pts[1].y-pts[0].y,pts[1].x-pts[0].x);
}