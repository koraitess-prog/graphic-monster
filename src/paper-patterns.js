// Printed before the wear plate, so motifs lose ink with the same physical paper.
export function printPaperPattern(g,kind,dark=false){
 if(!kind)return;
 g.save();g.fillStyle=dark?'#e8ddba':'#151a1b';g.strokeStyle=g.fillStyle;g.globalAlpha=.78;g.lineWidth=3;
 if(['newsprint','magazine-type','oversized-type'].includes(kind)){
  g.globalAlpha=.94;
  if(kind==='newsprint'){
   g.font='bold 32px Georgia,serif';g.fillText('THE OTHER SIDE',7,35);g.fillRect(7,44,367,1.5);
   const lines=['A shape takes the place of a word.','Between the lines, something stirs.','Paper remembers every cut.','Nothing stays inside its margins.','A small disturbance in the ordinary.','The printed world comes apart.'];
   g.font='11px Georgia,serif';
   for(let col=0;col<3;col++)for(let row=0;row<25;row++){g.save();g.beginPath();g.rect(8+col*127,53,117,330);g.clip();g.fillText(lines[(row+col*2)%lines.length],8+col*127,64+row*12);g.restore();}
   g.fillRect(132,58,.6,320);g.fillRect(259,58,.6,320);
  }else{
   const glyphs=kind==='oversized-type'?['R','a','&','g']:['CUT','FORM','Aa','TYPE'];
   for(let i=0;i<4;i++){g.save();g.translate(8+(i%2)*190,155+Math.floor(i/2)*190);g.rotate(i%2?-.055:.035);g.font=`${i%2?'italic ':''}900 ${kind==='oversized-type'?192:72}px ${i%2?'Georgia,serif':'Arial,sans-serif'}`;g.fillText(glyphs[i],0,0);g.restore();}
  }
  g.restore();return;
 }
 const dot=(x,y,r)=>{g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();};
 if(kind.startsWith('dots')||kind==='spots'){
  const large=kind==='dots-large',step=large?37:kind==='spots'?29:16;
  for(let y=-step;y<420;y+=step)for(let x=-step;x<420;x+=step){const n=Math.sin(x*13+y*7);dot(x+(y/step%2)*step*.5+(kind==='spots'?n*8:0),y+(kind==='spots'?Math.cos(x+y)*7:0),large?10:kind==='spots'?4+n*2.8:2.4);}
 }else if(kind.includes('checks')){
  const step=kind==='checks'?24:28;
  for(let y=-step;y<420;y+=step)for(let x=-step;x<420;x+=step)if((Math.round(x/step)+Math.round(y/step))%2===0){
   const warp=kind==='checks'?0:Math.sin(y/37)*9;
   g.beginPath();g.moveTo(x+warp,y);g.lineTo(x+step+warp,y+2);g.lineTo(x+step+Math.sin((y+step)/37)*warp,y+step);g.lineTo(x+warp*.5,y+step-1);g.closePath();g.fill();
  }
 }else if(kind.startsWith('stripes')){
  const vertical=kind==='stripes-vertical',diagonal=kind==='stripes-diagonal',wave=kind==='stripes-wave';
  g.lineWidth=wave?7:8;
  for(let y=-400;y<800;y+=21){g.beginPath();for(let x=-400;x<=800;x+=8){const u=vertical?y:x,v=vertical?x:y+(diagonal?x*.65:wave?Math.sin(x/23)*6:0);if(x===-400)g.moveTo(u,v);else g.lineTo(u,v);}g.stroke();}
 }else if(kind==='scales'){
  g.lineWidth=2.5;for(let y=-20;y<420;y+=20)for(let x=-20;x<420;x+=24){g.beginPath();g.arc(x+(y/20%2)*12,y,12,0,Math.PI);g.stroke();}
 }else{
  for(let y=0;y<400;y+=kind==='broken-grid'?24:19)for(let x=0;x<400;x+=kind==='broken-grid'?25:22){
   if(kind==='broken-grid'&&Math.sin(x*5+y*3)<-.15)continue;
   g.beginPath();g.moveTo(x,y);g.lineTo(x+(kind==='marks'?5:14),y+(kind==='marks'?-10:2));
   if(kind!=='marks'){g.moveTo(x+7,y-7);g.lineTo(x+6,y+9);}g.stroke();
  }
 }
 g.restore();
}
