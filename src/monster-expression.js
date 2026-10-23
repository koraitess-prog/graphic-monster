// Silent, deterministic performances: preparation -> gesture -> reaction -> rest.
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const window=(t,a,b,c,d)=>smooth((t-a)/(b-a))*(1-smooth((t-c)/(d-c)));
const pulse=(t,a,w)=>Math.exp(-(((t-a)/w)**2));
export const MOUTH_ACTIONS=['open','yawn','irritated','chatter','growl','gasp','grin'];
export const MONSTER_ACTIONS=['suspicious','twitch','startle','creep','inspect','outburst','sleepy'];
export function expressionPerformance(action,t,seed=0){
 t=clamp(t);const envelope=Math.sin(t*Math.PI)**2,phase=(seed%13)*.17;
 const c={open:0,yawn:0,snarl:0,chatter:0,grin:0,lid:0,wide:0,brace:0,recoil:0,twitch:0,slump:0,suspicion:0,inspect:0,freeze:0};
 if(action==='open')c.open=window(t,.08,.30,.58,.92);
 if(action==='yawn'||action==='stretch'){c.yawn=window(t,.10,.40,.60,.96);c.open=c.yawn;c.lid=c.yawn*.88;}
 if(action==='growl'){c.snarl=window(t,.08,.31,.64,.96);c.open=c.snarl*.76;c.brace=c.snarl;c.lid=c.snarl*.42;}
 if(action==='irritated'){c.snarl=window(t,.12,.32,.62,.91);c.open=c.snarl*.17;c.lid=c.snarl*.55;c.brace=c.snarl*.75;c.twitch=pulse(t,.52,.027)-pulse(t,.59,.045)*.35;}
 if(action==='chatter'){const pauses=window(t,.12,.23,.62,.89);c.chatter=pauses*Math.max(0,Math.sin(t*91+phase)*Math.sin(t*37+.8));c.open=c.chatter*.42;c.twitch=pauses*Math.sin(t*87+phase)*.12;}
 if(action==='gasp'||action==='startle'){const catchBreath=window(t,.12,.19,.39,.88);c.open=catchBreath;c.wide=catchBreath;c.recoil=window(t,.10,.19,.35,.95);}
 if(action==='grin')c.grin=window(t,.10,.36,.64,.96);
 if(action==='suspicious'){c.freeze=window(t,.03,.07,.16,.28);c.suspicion=window(t,.20,.45,.63,.96);c.lid=c.suspicion*.32;}
 if(action==='twitch'){c.twitch=pulse(t,.34,.022)-pulse(t,.40,.04)*.38;c.wide=pulse(t,.49,.12)*.35;c.open=pulse(t,.51,.12)*.23;c.suspicion=window(t,.45,.61,.72,.97)*.45;}
 if(action==='creep'){c.suspicion=envelope;c.lid=envelope*.24;}
 if(action==='inspect'){c.inspect=window(t,.12,.39,.63,.97);c.suspicion=c.inspect*.4;c.grin=c.inspect*.15;}
 if(action==='outburst'){c.open=window(t,.18,.30,.44,.83)*.73;c.wide=window(t,.14,.25,.40,.85)*.5;c.grin=window(t,.57,.72,.79,.98)*.5;}
 if(action==='sleepy'){
  c.slump=window(t,.05,.25,.77,.98);c.yawn=window(t,.18,.36,.48,.65);c.open=c.yawn;c.lid=Math.max(c.slump*.72,c.yawn*.92);
  const wake=window(t,.81,.85,.89,.99);c.wide=wake;c.recoil=wake*.55;c.open=Math.max(c.open,wake*.7);c.lid*=1-wake;
 }
 return c;
}
