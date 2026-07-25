/* Smart Funds USA — shared interior JS: year stamp, scroll reveals, sticky CTA */
(function(){
  var yr=document.getElementById('yr');
  if(yr){yr.textContent=new Date().getFullYear();}
  var io=('IntersectionObserver'in window)?new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.12}):null;
  document.querySelectorAll('.rv').forEach(function(el){io?io.observe(el):el.classList.add('in');});
  var s=document.getElementById('stickyCta');
  if(s){addEventListener('scroll',function(){s.classList.toggle('on',scrollY>460);},{passive:true});}
})();

/* Mobile hero — move the single form box into the mobile hero ≤991px */
(function(){
  var box=document.querySelector('.hero .form-box')||document.querySelector('.form-box');
  var slot=document.getElementById('mobFormSlot');
  if(!box||!slot)return;
  var home=box.parentNode;
  var mq=window.matchMedia('(max-width: 991px)');
  function place(){
    var target=mq.matches?slot:home;
    if(box.parentNode!==target){target.appendChild(box);}
  }
  mq.addEventListener?mq.addEventListener('change',place):mq.addListener(place);
  addEventListener('resize',place,{passive:true});
  place();
  /* #form anchors point at the (hidden) desktop hero — retarget on mobile */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href="#form"]');
    if(a&&mq.matches){
      e.preventDefault();
      document.getElementById('form-mob').scrollIntoView({behavior:'smooth',block:'start'});
    }
  });
})();

/* Mobile hero — living background: rising $ notes, touch spotlight, tap bursts */
(function(){
  var hero=document.querySelector('.hero-mob');
  var bg=hero&&hero.querySelector('.hm-bg');
  if(!bg)return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce){
    for(var i=0;i<18;i++){
      var n=document.createElement('span');
      n.className='hm-star';
      n.style.left=(2+Math.random()*96)+'%';
      n.style.top=(2+Math.random()*92)+'%';
      var s=(2+Math.random()*4).toFixed(1);
      n.style.width=s+'px';n.style.height=s+'px';
      n.style.setProperty('--o',(0.25+Math.random()*0.4).toFixed(2));
      n.style.animationDuration=(2.5+Math.random()*4).toFixed(1)+'s';
      n.style.animationDelay=(Math.random()*4).toFixed(1)+'s';
      bg.appendChild(n);
    }
  }
  var spot=document.createElement('span');
  spot.className='hm-spot';bg.appendChild(spot);
  var tx=0,ty=0,cx=0,cy=0,raf=null,idle=null;
  function tick(){
    cx+=(tx-cx)*0.14;cy+=(ty-cy)*0.14;
    spot.style.transform='translate3d('+cx+'px,'+cy+'px,0) translate(-50%,-50%)';
    if(Math.abs(tx-cx)+Math.abs(ty-cy)>0.5){raf=requestAnimationFrame(tick);}else{raf=null;}
  }
  hero.addEventListener('pointermove',function(e){
    var b=hero.getBoundingClientRect();
    tx=e.clientX-b.left;ty=e.clientY-b.top;
    spot.classList.add('on');
    if(!raf)raf=requestAnimationFrame(tick);
    clearTimeout(idle);
    idle=setTimeout(function(){spot.classList.remove('on');},1200);
  },{passive:true});
  hero.addEventListener('pointerdown',function(e){
    if(reduce)return;
    if(e.target.closest&&e.target.closest('.hm-form'))return;
    var b=hero.getBoundingClientRect();
    var p=document.createElement('span');
    p.className='hm-pop';p.textContent='$';
    p.style.left=(e.clientX-b.left)+'px';
    p.style.top=(e.clientY-b.top)+'px';
    bg.appendChild(p);
    setTimeout(function(){p.remove();},900);
  },{passive:true});
})();

/* Hero amount quick-pick chips */
(function(){
  var chips=[].slice.call(document.querySelectorAll('.fa-chip'));
  if(!chips.length)return;
  chips.forEach(function(c){
    c.addEventListener('click',function(){
      chips.forEach(function(x){x.classList.toggle('is-on',x===c);});
    });
  });
})();

/* "Pick your Tuesday" situation switcher — accessible tabs */
(function(){
  var tabs=[].slice.call(document.querySelectorAll('.sit-tab'));
  if(!tabs.length)return;
  var panels=[].slice.call(document.querySelectorAll('.sit-panel'));
  function activate(tab){
    tabs.forEach(function(t){
      var on=t===tab;
      t.classList.toggle('is-on',on);
      t.setAttribute('aria-selected',on?'true':'false');
      t.tabIndex=on?0:-1;
    });
    panels.forEach(function(p){p.classList.toggle('is-on',p.id===tab.getAttribute('aria-controls'));});
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){activate(t);});
    t.addEventListener('keydown',function(e){
      var j=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:null;
      if(j===null)return;
      e.preventDefault();
      var next=tabs[(j+tabs.length)%tabs.length];
      next.focus();activate(next);
    });
  });
})();
