
(function(){
  const header=document.getElementById('header');
  const hamburger=document.getElementById('hamburger');
  const navLinks=document.getElementById('navLinks');
  const links=document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll',()=>{
    header.classList.toggle('scrolled',window.scrollY>20);
  });

  hamburger.addEventListener('click',()=>{
    const open=navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded',open);
  });
  links.forEach(link=>link.addEventListener('click',()=>{
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    links.forEach(l=>l.classList.remove('active'));
    link.classList.add('active');
  }));

  const words=['contratos','demandas','consultas','jurisprudencia','documentos'];
  const typed=document.getElementById('typed');
  let wi=0,ci=0,deleting=false;
  function type(){
    const word=words[wi];
    typed.textContent=word.slice(0,ci);
    if(!deleting){
      ci++;
      if(ci>word.length){deleting=true;setTimeout(type,1800);return}
    }else{
      ci--;
      if(ci===0){deleting=false;wi=(wi+1)%words.length}
    }
    setTimeout(type,deleting?55:95);
  }
  type();

  const revealEls=document.querySelectorAll('.reveal');
  if(typeof IntersectionObserver==='function'){
    const revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },{threshold:.12});
    revealEls.forEach(el=>revealObserver.observe(el));
  }else{
    revealEls.forEach(el=>el.classList.add('visible'));
  }

  const counters=document.querySelectorAll('[data-count]');
  function counterText(el){
    const target=+el.dataset.count;
    const prefix=el.dataset.prefix||'';
    const suffix=el.dataset.suffix||'';
    return prefix+(target>=1000?target.toLocaleString('es-ES'):target)+suffix;
  }
  if(typeof IntersectionObserver==='function'){
    const countObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        const el=entry.target;
        const target=+el.dataset.count;
        const prefix=el.dataset.prefix||'';
        const suffix=el.dataset.suffix||'';
        const duration=1600;
        const start=performance.now();
        function step(now){
          const p=Math.min((now-start)/duration,1);
          const eased=1-Math.pow(1-p,3);
          const value=Math.floor(target*eased);
          el.textContent=prefix+(target>=1000?value.toLocaleString('es-ES'):value)+suffix;
          if(p<1)requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      });
    },{threshold:.5});
    counters.forEach(el=>countObserver.observe(el));
  }else{
    counters.forEach(el=>{el.textContent=counterText(el)});
  }

  const log=document.getElementById('log');
  const form=document.getElementById('chatForm');
  const input=document.getElementById('chatInput');
  const responses=[
    {match:/plazo|demanda|tiempo/i,text:'El plazo depende del tipo de acción. En materia civil, por ejemplo, la <strong>demanda ordinaria</strong> suele estar sujeta a plazos de prescripción amplios, pero hay acciones con plazos cortos. Cuéntame el caso concreto y te indico el plazo aplicable.'},
    {match:/cláusula|contrato|competencia/i,text:'Una <strong>cláusula de no competencia</strong> debe ser razonable en duración, ámbito geográfico y actividad. Si es excesiva, puede ser invalidada. Comparte el texto y te señalo los puntos a revisar.'},
    {match:/demanda.*recurso|recurso.*demanda|diferencia/i,text:'La <strong>demanda</strong> inicia un procedimiento en primera instancia; el <strong>recurso</strong> se usa para impugnar una resolución ya dictada. ¿Quieres que te explique los recursos más habituales?'},
    {match:/hola|buenas| Buenos/i,text:'¡Hola! Encantado de ayudarte 😊. Puedo explicarte conceptos, revisar documentos y orientarte sobre tus opciones. ¿Qué necesitas?'}
  ];
  const fallback='Buena pregunta. Según la normativa aplicable, lo recomendable es <strong>revisar el caso concreto</strong> y valorar las opciones disponibles. Si me das más detalles, puedo ofrecerte una respuesta más precisa.';
  function addMessage(text,who){
    const div=document.createElement('div');
    div.className='msg '+who;
    div.innerHTML=text;
    log.appendChild(div);
    log.scrollTop=log.scrollHeight;
  }
  function respond(question){
    const typing=document.createElement('div');
    typing.className='typing';
    typing.innerHTML='<i></i><i></i><i></i>';
    log.appendChild(typing);
    log.scrollTop=log.scrollHeight;
    setTimeout(()=>{
      typing.remove();
      const found=responses.find(r=>r.match.test(question));
      addMessage(found?found.text:fallback,'bot');
    },900+Math.random()*500);
  }
  function send(question){
    question=question.trim();
    if(!question)return;
    addMessage(question.replace(/</g,'&lt;'),'user');
    respond(question);
    input.value='';
  }
  form.addEventListener('submit',e=>{e.preventDefault();send(input.value)});
  document.querySelectorAll('.prompt').forEach(btn=>{
    btn.addEventListener('click',()=>{
      send(btn.textContent.trim());
      document.getElementById('demo').scrollIntoView({behavior:'smooth',block:'center'});
    });
  });

  const track=document.getElementById('sliderTrack');
  const dots=document.getElementById('dots');
  const slides=track.children.length;
  let current=0;
  for(let i=0;i<slides;i++){
    const b=document.createElement('button');
    b.setAttribute('aria-label','Ir al testimonio '+(i+1));
    if(i===0)b.classList.add('active');
    b.addEventListener('click',()=>goTo(i));
    dots.appendChild(b);
  }
  function goTo(i){
    current=(i+slides)%slides;
    track.style.transform='translateX(-'+(current*100)+'%)';
    [...dots.children].forEach((d,j)=>d.classList.toggle('active',j===current));
  }
  let timer=setInterval(()=>goTo(current+1),6000);
  dots.addEventListener('click',()=>{clearInterval(timer);timer=setInterval(()=>goTo(current+1),6000)});

  document.querySelectorAll('.faq-q').forEach(q=>{
    q.addEventListener('click',()=>{
      const item=q.parentElement;
      const answer=item.querySelector('.faq-a');
      const isOpen=item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(openItem=>{
        openItem.classList.remove('open');
        openItem.querySelector('.faq-a').style.maxHeight=null;
      });
      if(!isOpen){
        item.classList.add('open');
        answer.style.maxHeight=answer.scrollHeight+'px';
      }
    });
  });

  const marquee=document.getElementById('marquee');
  marquee.innerHTML+=marquee.innerHTML;

  document.addEventListener('mousemove',e=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const x=(e.clientX/window.innerWidth-.5)*10;
    const y=(e.clientY/window.innerHeight-.5)*10;
    document.querySelector('.orb-1').style.transform='translate('+x+'px,'+y+'px)';
    document.querySelector('.orb-2').style.transform='translate('+(-x)+'px,'+(-y)+'px)';
  });
})();
