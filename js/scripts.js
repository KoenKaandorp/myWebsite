/* --- Typewriter --- */
const words = ["AI Engineer","Python Developer","Machine Learning Engineer","Problem Solver","Data Scientist", "Web Developer"];
let wIdx=0,cIdx=0,del=false;
const te=document.getElementById("changing-text");
function type(){
  const w=words[wIdx];
  del?cIdx--:cIdx++;
  te.textContent=w.substring(0,cIdx);
  if(!del&&cIdx===w.length){del=true;setTimeout(type,1100);return;}
  if(del&&cIdx===0){del=false;wIdx=(wIdx+1)%words.length;}
  setTimeout(type,del?28:55);
}
document.addEventListener("DOMContentLoaded",type);

/* --- Navbar scroll --- */
const navbar=document.getElementById("navbar");
window.addEventListener("scroll",()=>{
  navbar.classList.toggle("scrolled",window.scrollY>30);
});

/* --- Mobile nav --- */
const toggle=document.getElementById("nav-toggle");
const mobileNav=document.getElementById("mobile-nav");
toggle.addEventListener("click",()=>{
  const open=mobileNav.classList.toggle("open");
  toggle.classList.toggle("open",open);
  toggle.setAttribute("aria-expanded",open);
});
mobileNav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{
  mobileNav.classList.remove("open");
  toggle.classList.remove("open");
}));

/* --- Tab switcher --- */
document.querySelectorAll(".tab-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-"+btn.dataset.tab).classList.add("active");
  });
});

/* --- Scroll reveal --- */
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible");});
},{threshold:0.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

/* --- Contact form --- */
const form=document.getElementById("contact-form");
const succ=document.getElementById("form-success");
form.addEventListener("submit",async e=>{
  e.preventDefault();
  form.style.display="none";
  succ.style.display="block";
  // Swap this block for actual formspree call when ready:
  // const r=await fetch("https://formspree.io/f/YOUR_ID",{method:"POST",body:new FormData(form),headers:{Accept:"application/json"}});
});

/* --- Particle canvas --- */
document.addEventListener("DOMContentLoaded",()=>{
  const canvas=document.getElementById("hero-canvas");
  const ctx=canvas.getContext("2d");
  const hero=document.querySelector(".hero");
  const COLOR="94,255,216";
  const repel=false;

  function resize(){
    const r=hero.getBoundingClientRect();
    canvas.width=r.width;canvas.height=r.height;
  }
  window.addEventListener("resize",resize);resize();

  const mouse={x:null,y:null,radius:130};
  window.addEventListener("mousemove",e=>{
    const r=canvas.getBoundingClientRect();
    mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;
  });
  window.addEventListener("mouseleave",()=>{mouse.x=null;mouse.y=null;});

  class Particle{
    constructor(){
      this.x=Math.random()*canvas.width;
      this.y=Math.random()*canvas.height;
      this.vx=(Math.random()-0.5)*1.2;
      this.vy=(Math.random()-0.5)*1.2;
      this.r=Math.random()*1.8+0.8;
    }
    update(){
      this.x+=this.vx;this.y+=this.vy;
      if(this.x-this.r<0||this.x+this.r>canvas.width)this.vx*=-1;
      if(this.y-this.r<0||this.y+this.r>canvas.height)this.vy*=-1;
      if(mouse.x&&mouse.y){
        const dx=this.x-mouse.x,dy=this.y-mouse.y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<mouse.radius){repel?(this.x+=dx/10,this.y+=dy/10):(this.x-=dx/80,this.y-=dy/80);}
      }
    }
    draw(){
      let op=0.4;
      if(mouse.x&&mouse.y){
        const dx=this.x-mouse.x,dy=this.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<300)op=0.5+(1-d/300)*0.85;
      }
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${COLOR},${op})`;ctx.fill();
    }
  }

  const count=Math.floor((canvas.width*canvas.height)/5500);
  const particles=Array.from({length:count},()=>new Particle());

  function connect(){
    const maxD=130,mouseR=380,mConnR=130;
    if(!mouse.x||!mouse.y)return;
    for(let a=0;a<particles.length;a++){
      for(let b=a+1;b<particles.length;b++){
        const dx=particles[a].x-particles[b].x,dy=particles[a].y-particles[b].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<maxD){
          const mx=(particles[a].x+particles[b].x)/2,my=(particles[a].y+particles[b].y)/2;
          const dm=Math.sqrt((mx-mouse.x)**2+(my-mouse.y)**2);
          if(dm>mouseR)continue;
          const mf=Math.pow(1-Math.min(dm/mouseR,1),0.5);
          const pf=1-d/maxD;
          ctx.strokeStyle=`rgba(${COLOR},${mf*pf})`;ctx.lineWidth=1;
          ctx.beginPath();ctx.moveTo(particles[a].x,particles[a].y);ctx.lineTo(particles[b].x,particles[b].y);ctx.stroke();
        }
      }
    }
    for(let i=0;i<particles.length;i++){
      const dx=particles[i].x-mouse.x,dy=particles[i].y-mouse.y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d>mConnR)continue;
      const mf=Math.min(Math.pow(Math.max(d/mConnR,0.01),-0.35),1);
      ctx.strokeStyle=`rgba(${COLOR},${mf})`;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke();
    }
  }

  function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{p.update();p.draw();});
    connect();
    requestAnimationFrame(animate);
  }
  animate();
});