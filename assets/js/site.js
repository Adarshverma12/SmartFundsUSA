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
