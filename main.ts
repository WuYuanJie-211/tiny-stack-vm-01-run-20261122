import{readdirSync as A,readFileSync as B,mkdirSync as C,writeFileSync as D}from"node:fs";
const F=[(a,b)=>a+b|0,(a,b)=>a-b|0,(a,b)=>Math.imul(a,b),(a,b)=>a/b|0,(a,b)=>a%b,(a,b)=>(a>>>0)/(b>>>0)|0,(a,b)=>(a>>>0)%(b>>>0)|0];
const I=process.env.MAKEFUN_INPUT_DIR??"/input",O=process.env.MAKEFUN_OUTPUT_DIR??"/output";
for(const d of A(I).sort()){
let p=B(I+"/"+d+"/program.bin"),n=B(I+"/"+d+"/input.bin"),s=[],c=[],m=new Int32Array(256),o=[],q=0,t=0,k=0,e=0;
try{for(;;){
if(t==1e6)throw 10;
let g=p[q];if(g===undefined)throw 9;
if(!(g<8||g>15&&g<35&&g!=31||g>47&&g<53||g>63&&g<66||g>79&&g<84))throw 5;
let h=p[q+1],x=h|p[q+2]<<8,i=g==1?1:g==2?4:g>47&&g<52?2:0;
if(q+i>=p.length)throw 9;
let u=g<8?"00011223"[g]|0:g<35?g==23||g==27?1:2:g<53?g>48&&g<51?1:0:g<66?g==64?1:2:g==82?0:1;
let v=g<8?"01102233"[g]|0:g<35?1:g<53?0:g==64?1:g==65?0:g==82?1:0;
t++;let z=q+1+i;
if(s.length<u)throw 2;
if(s.length-u+v>256)throw 3;
q=z;
if(g<8){
if(g==0)throw 0;
if(g<3)s.push(g==1?h<<24>>24:p[q-4]|p[q-3]<<8|p[q-2]<<16|p[q-1]<<24);
else if(g==3)s.pop();
else if(g==4)s.push(s.at(-1));
else if(g==5)s.push(s.splice(s.length-2,1)[0]);
else if(g==6)s.push(s.at(-2));
else s.push(s.splice(s.length-3,1)[0]);
}else if(g<35){
let b=s.pop();
if(g==23)s.push(-b|0);
else if(g==27)s.push(~b);
else{let a=s.pop();
if(g>18&&g<23&&!b)throw 4;
s.push(g<23?F[g-16](a,b):g<27?g==24?a&b:g==25?a|b:a^b:g<31?g==28?a<<(b&31):g==29?a>>(b&31):a>>>(b&31)|0:g==32?a==b?1:0:g==33?a<b?1:0:(a>>>0)<(b>>>0)?1:0);}
}else if(g<53){
if(g==48)q=z+(x<<16>>16);
else if(g<51){let a=s.pop();if((g==49)==(a==0))q=z+(x<<16>>16);}
else if(g==51){if(c.length==64)throw 7;c.push(z);q=x;}
else{if(!c.length)throw 8;q=c.pop();}
}else if(g<66){
let a=s.pop();
if(g==64){if(a>>>0>255)throw 6;s.push(m[a]);}
else{let b=s.pop();if(a>>>0>255)throw 6;m[a]=b;}
}else{
if(g==82)s.push(k<n.length?n[k++]:-1);
else if(g==83)throw s.pop()&255;
else if(g==80){let y=""+s.pop();if(o.length+y.length>65536)throw 11;o.push(...Buffer.from(y));}
else{if(o.length+1>65536)throw 11;o.push(s.pop()&255);}
}
}}catch(y){e=y}
C(O+"/"+d,{recursive:true});
D(O+"/"+d+"/stdout.bin",Buffer.from(o));
D(O+"/"+d+"/exit.txt",e+"\n");
}
