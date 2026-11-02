"use strict";
const base = "/notes-solutions/";
const main = document.querySelector("#bank");
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const path = location.pathname.split("/").filter(Boolean);
const courseSlug = path[1], exerciseSlug = path[2];
function show(data) {
  const course = data.courses.find(item => item.slug === courseSlug);
  const crumbs = '<nav class="bank-crumbs" aria-label="Breadcrumb"><a href="'+base+'">Solution Bank</a>'+(course?' &rsaquo; <a href="'+base+course.slug+'/">'+escapeHTML(course.title)+'</a>':'')+'</nav>';
  if (!courseSlug) {
    main.innerHTML = '<section class="solutions-hero"><div class="solutions-wrap"><p class="solutions-eyebrow">DR JON\'S NOTES</p><h1>Solution Bank</h1><p class="solutions-lead">A clearer way to check your understanding.</p><p>Choose your course, then select an exercise to view its worked solutions.</p></div></section><section class="solutions-wrap solutions-courses"><h2>Find your solutions</h2><div class="solutions-grid">'+data.courses.map(c=>'<article class="solutions-course"><p class="solutions-eyebrow">'+escapeHTML(c.board)+'</p><h3><a href="'+base+c.slug+'/">'+escapeHTML(c.title)+'</a></h3><p>Worked solutions organised by chapter and exercise.</p><a class="solutions-status" href="'+base+c.slug+'/">Browse exercises &rarr;</a></article>').join('')+'</div></section>';
  } else if (course && !exerciseSlug) {
    main.innerHTML='<section class="solutions-wrap solutions-courses">'+crumbs+'<p class="solutions-eyebrow">'+escapeHTML(course.board)+'</p><h1>'+escapeHTML(course.title)+' &mdash; Solution Bank</h1><div class="solutions-grid">'+course.chapters.map(ch=>'<section class="solutions-course"><h2>'+escapeHTML(ch.title)+'</h2><ul class="bank-exercises">'+ch.exercises.map(ex=>'<li><a href="'+base+course.slug+'/'+ex.slug+'/">'+escapeHTML(ex.title)+'</a></li>').join('')+'</ul></section>').join('')+'</div></section>';
  } else {
    const exercises=course?course.chapters.flatMap(ch=>ch.exercises):[];
    const index=exercises.findIndex(ex=>ex.slug===exerciseSlug);
    const exercise=exercises[index];
    main.innerHTML='<section class="solutions-wrap solutions-courses">'+crumbs+'<p class="solutions-eyebrow">DR JON\'S NOTES &mdash; SOLUTIONS</p><h1>'+escapeHTML(exercise?course.title+' — '+exercise.title:'Solutions coming soon')+'</h1>'+(exercise?'<p>Scroll within the viewer to read the full worked solutions.</p><iframe class="bank-viewer" title="'+escapeHTML(exercise.title)+' worked solutions" src="https://drive.google.com/file/d/'+exercise.driveId+'/preview" allowfullscreen></iframe><p><a target="_blank" rel="noopener" href="https://drive.google.com/file/d/'+exercise.driveId+'/view">Open full-screen viewer &nearr;</a></p>':'<p>These solutions are being prepared. Please check back soon.</p>')+'<nav class="bank-pagination" aria-label="Exercise navigation">'+(index>0?'<a href="'+base+course.slug+'/'+exercises[index-1].slug+'/">&larr; '+escapeHTML(exercises[index-1].title)+'</a>':'<span></span>')+(index>=0&&index<exercises.length-1?'<a href="'+base+course.slug+'/'+exercises[index+1].slug+'/">'+escapeHTML(exercises[index+1].title)+' &rarr;</a>':'')+'</nav></section>';
  }
  document.title = course ? course.title+' — Dr Jon\'s Notes' : "Dr Jon's Notes — Solution Bank";
}
async function start() {
  main.innerHTML='<p class="solutions-wrap">Loading solutions…</p>';
  try {
    const response=await fetch(base+'catalog.json');
    if(!response.ok) throw new Error('Catalog unavailable');
    show(await response.json());
  } catch {
    main.innerHTML='<p class="solutions-wrap" role="alert">Unable to load solutions. Please refresh the page.</p>';
  }
}
const gate=document.querySelector('#bank-gate');
function unlock(){gate.hidden=true;main.hidden=false;start();}
let saved=false;
try { saved=Number(localStorage.getItem('drjon-notes-until'))>Date.now(); } catch {}
if(saved) unlock();
document.querySelector('#bank-login').addEventListener('submit',async event=>{
  event.preventDefault();
  const input=document.querySelector('#bank-password');
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input.value));
  const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  if(hash!=='4a131de2d28819085348530d867049364c43d1277bf0c274a7e242ebb1f39576'){
    document.querySelector('#bank-error').textContent='Wrong password, try again';return;
  }
  if(document.querySelector('#bank-remember').checked) {
    try {localStorage.setItem('drjon-notes-until',String(Date.now()+365*86400000));} catch {}
  }
  input.value='';unlock();
});

