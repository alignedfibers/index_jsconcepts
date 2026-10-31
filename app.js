/* Shawn Stark · General Web. One-page collection reader; file:// safe. */
(() => {
  'use strict';
  const DB = window.ARCHIVE_DATA || {items: [],collections:[],taxonomy:[],counts:{}};
  const $ = id => document.getElementById(id);
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const items = new Map(DB.items.map(i => [i.id,i]));
  const collections = new Map(DB.collections.map(c => [c.id,c]));
  const AREA = {
    blogs: ['Blog Archive','CSS, Linux, and development notes.'],
    writing: ['Writing','Technical reports, research, and essays.'],
    bestpractices: ['Best Practices','Software design, construction, debugging and review notes.'],
    macro: ['Macroeconomics','Economic concepts and written reflections.'],
    xml: ['XML Course','XML, XSLT, XSD, and CSS.'],
    images: ['Images','Fairy illustrations and website designs.'],
    jsconcepts: ['Vanilla JS - Evented nB Tail & Concepts','Non-blocking event recursion and JavaScript concepts.'],
    favorites: ['Favorites','Selected writing, data, and interactive projects.'],
    webone: ['Web One Archive','Web design, page layout, and navigation.'],
    webtwo: ['Web Two Archive','JavaScript, XML, and interactive forms.']
  };
  let term='',collapsed=false, activeArea='home',activeCollection='', activeCategory='', anchorItem='';
  const href=(area,id='',kind='collection')=>`#/section/${area}${id?'/'+kind+'/'+encodeURIComponent(id):''}`;
  const fmtDate=s=> /^\d{4}-\d{2}-\d{2}$/.test(s||'') ? new Date(s+'T12:00:00').toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}):'';
  const cleanText=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const collec=area=>DB.collections.filter(c=>c.area===area && c.items.some(id=>items.has(id))).sort((a,b)=>a.title.localeCompare(b.title,undefined,{numeric:true}));
  const byDate=(a,b)=>(b.date||'').localeCompare(a.date||'')||(a.order||0)-(b.order||0);
  const byOrder=(a,b)=>(a.order||999)-(b.order||999)||(b.date||'').localeCompare(a.date||'')||a.title.localeCompare(b.title,undefined,{numeric:true});
  const relevant=it=> !term || [it.title,it.excerpt,cleanText(it.body),it.category].join(' ').toLowerCase().includes(term.toLowerCase());
  const categories=()=>{
    const m=new Map();
    DB.items.filter(i=>i.area==='blogs'&&['blog-post','site-page'].includes(i.kind)).forEach(i=>String(i.category||'General').split(',').map(x=>x.trim()).filter(Boolean).forEach(k=>m.set(k,(m.get(k)||0)+1)));
    return [...m].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  };
  const sideLabel=(txt,sub='',cls='')=>`<span class="side-label ${cls}">${E(txt)}${sub?` <small>${E(sub)}</small>`:''}</span>`;
  function sideNav(area,selected='',category=''){
    const isPublished=area==='blogs', isHome=area==='home',col=collec(area);
    let anchors='';
    if(isHome){
      anchors=['favorites','jsconcepts','blogs','writing','bestpractices','macro','webone','webtwo','xml','images'].map(a=>
        `<a class="side-link" href="${href(a)}">${sideLabel(AREA[a][0],String(a==='blogs'?categories().length:collec(a).length))}</a>`
      ).join('');
    }else if(isPublished){
      // The source site categories are the collection names, not an additional taxonomy tier.
      const cats=categories();
      anchors=`<a class="side-link ${!category?'selected':''}" href="${href(area)}">${sideLabel('All collections',String(cats.length))}</a>`+
        cats.map(([name,count])=>`<a class="side-link ${category===name?'selected':''}" href="${href(area,name,'category')}">${sideLabel(name,String(count))}</a>`).join('');
    }else{
      anchors=`<a class="side-link ${!selected?'selected':''}" href="${href(area)}">${sideLabel('All collections',String(col.length))}</a>`+
        col.map(c=>`<a class="side-link ${selected===c.id?'selected':''}" href="${href(area,c.id)}">${sideLabel(c.title,String(c.items.length))}</a>`).join('');
    }
    const summary=isHome?'Explore the archive':'Collections';
    return `<aside class="collection-sidebar ${collapsed?'collapsed':''}" id="collection-sidebar" aria-label="${E(summary)}">
      <div class="side-head"><strong>${E(summary)}</strong><!-- handler: app.js :: document.click -> toggle-sidebar branch --> <button type="button" id="toggle-sidebar" aria-label="${collapsed?'Expand':'Collapse'} collections" title="${collapsed?'Expand':'Collapse'} sidebar">${collapsed?'›':'‹'}</button></div>
      <div class="side-content">${anchors}</div>
      <div class="mobile-side"><details id="mobile-collections"><summary>${E(summary)} <span>⌄</span></summary><div class="mobile-side-content">${anchors}</div></details></div>
    </aside>`;
  }
  function files(it){return (it.files||[]).length?`<div class="entry-files">${it.files.map(f=>`<a class="file-pill" href="${E(f.href)}" download>${E(f.label||'Original document')} <span aria-hidden="true">↓</span></a>`).join('')}</div>`:'<p class="subdued">No attachments.</p>';}
  function originalNotes(it){const notes=(it.review||[]).map(r=>`<p class="review-text"><b>${E(r.label||'Note')}</b> ${E(r.text)}</p>`).join('');return notes;}
  function tone(it){if(it.style==='manifest')return'manifest';if(it.style==='school')return'school';if(it.area==='blogs'){
    let s=(it.category||'').toLowerCase();return s.includes('journal')?'journal':s.includes('job')?'work':s.includes('css')?'code':s.includes('linux')?'code':'blog';}
    if(it.area==='xml')return'xml';if(it.area==='writing')return'essay';if(it.area==='bestpractices')return'code';if(it.area==='macro')return'course';return'archive';}
  function article(it,opened=false){
    if(it.id==='jsconcepts-safe'&&activeArea==='home')opened=true;
    const sourceFiles=(it.files||[]).length;
    const c=collections.get(it.collection);
    const date=fmtDate(it.date);
    const published=it.area==='blogs'&&it.kind==='blog-post';
    const archivedReview=(it.review||[]).map(r=>`<blockquote class="inline-review"><strong>${E(r.label||'Note')}</strong> ${E(r.text)}</blockquote>`).join('');
    const month=published&&date?new Date(it.date+'T12:00:00').toLocaleDateString('en-US',{month:'short'}):'';
    const day=published&&date?String(Number(it.date.slice(8,10))):'';
    const year=published&&date?it.date.slice(0,4):'';
    const author=published?`<div class="post-byline">Posted by <strong>Shawn Stark</strong>${it.category?` <span class="post-byline-separator">·</span> ${E(it.category)}`:''}${year?` <span class="post-byline-separator">·</span> ${E(year)}`:''}</div>`:'';
    const posthead=published?`<div class="post-heading">
       <time class="post-date-stamp" datetime="${E(it.date)}" title="${E(date)}"><b>${E(day)}</b><small>${E(month)}</small></time>
       <div class="post-heading-copy"><h2>${E(it.title)}</h2>${author}</div>
     </div>`:`<div class="reading-meta">${date?`<time datetime="${E(it.date)}">${E(date)}</time>`:`<span>${E(c?.title||'Archive')}</span>`}</div><h2>${E(it.title)}</h2>`;
    const attachments=sourceFiles?`<details class="entry-attachments"><summary>Files & feedback${sourceFiles?` · ${sourceFiles}`:''}</summary><div class="attachment-content">${files(it)}${originalNotes(it)}</div></details>`:'';
    return `<article id="entry-${E(it.id)}" class="reading-entry tone-${tone(it)} ${opened?'expanded':''} ${published?'original-post':''}" data-entry="${E(it.id)}">
      <div class="entry-accent"></div><div class="entry-inner">${posthead}
      <div class="entry-body-wrap ${opened?'expanded':''}" id="body-${E(it.id)}"><div class="article-body">${it.body||`<p>${E(it.excerpt)}</p>`}${archivedReview}</div></div>
      <div class="entry-actions">${attachments}
      <!-- handler: app.js :: document.click -> data-expand branch; jsconcepts-safe also calls afAfterRender()/afPause() --> <button class="see-more" type="button" aria-expanded="${opened?'true':'false'}" aria-controls="body-${E(it.id)}" data-expand="${E(it.id)}">${opened?'Show less ↑':'See more ↓'}</button></div></div></article>`;
  }
  function intro(title,sub='',n=0){return `<div class="reading-intro"><div><h1>${E(title)}</h1>${sub?`<p>${E(sub)}</p>`:''}</div>${n?`<small>${n} ${n===1?'entry':'entries'}</small>`:''}</div>`;}
  function heading(text){return `<div class="feed-label"><span>${E(text)}</span></div>`;}
  function feedFor(area,selected='',category=''){
    let cols=collec(area);if(selected)cols=cols.filter(c=>c.id===selected);
    let feed=[], ordered=[],lastYear='';
    if(area==='blogs'){
      // Include the original short Home page in the General category; it was a real published page.
      const results=cols.flatMap(c=>c.items.map(id=>items.get(id)).filter(Boolean))
        .filter(i=>['blog-post','site-page'].includes(i.kind) &&
          (category?String(i.category||'General').split(',').map(x=>x.trim()).includes(category):true)&&relevant(i)).sort(byDate);
      for(const it of results){const yr=it.date?.slice(0,4)||'Undated';if(yr!==lastYear){feed.push(heading(yr));lastYear=yr;}feed.push(article(it,it.id===anchorItem));ordered.push(it);}
    }else{
      for(const c of cols){const list=c.items.map(id=>items.get(id)).filter(Boolean).filter(relevant).sort(byOrder);if(!list.length)continue;
        if(!selected)feed.push(heading(c.title));
        for(const it of list){feed.push(article(it,it.id===anchorItem));ordered.push(it);}
      }
    }
    return {html:feed.join('')||'<div class="empty-feed">Nothing matches this search. Try a different word or collection.</div>',count:ordered.length,ordered};
  }
  function contentsRail(ordered=[], area='', selected='', category=''){
    if(!ordered.length)return '';
    const count=ordered.length;
    const links=ordered.map(it=>{
      const d=fmtDate(it.date);
      const short=d?new Date(it.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):'';
      return `<!-- handler: app.js :: document.click -> data-jump branch --> <button type="button" class="contents-link" data-jump="${E(it.id)}" title="${E(it.title)}"><span class="contents-item-title">${E(it.title)}</span>${area==='blogs'&&short?`<time datetime="${E(it.date)}">${E(short)}</time>`:''}</button>`;
    }).join('');
    const where=(AREA[area]?.[0]||'Archive')+' / '+(category||(selected?collections.get(selected)?.title:'All collections')||'All collections');
    const head=`<span class="contents-title">${E(where)}</span><small>Content in this collection · ${count}</small>`;
    return `<aside class="contents-rail" id="contents-rail" aria-label="Content in this collection"><div class="contents-head">${head}</div><div class="contents-list">${links}</div></aside>
    <details class="contents-mobile" id="contents-mobile"><summary>${E(where)} <small>${count} ${count===1?'entry':'entries'}</small></summary><div class="contents-list">${links}</div></details>`;
  }
  function searchbar(){return `<div class="inline-search"><label for="entry-search" class="visually-hidden">Search this collection</label><span aria-hidden="true">⌕</span><!-- handler: app.js :: document.input -> updateFeed() --> <input id="entry-search" type="search" placeholder="Find something here…" value="${E(term)}" autocomplete="off"><!-- handler: app.js :: document.click -> clear-search branch --> <button id="clear-search" type="button" title="Clear search" aria-label="Clear search">×</button></div>`;}
  function section(area,selected='',category=''){
    const label=AREA[area]?.[0]||'Archives';if(!AREA[area])return home();
    const c=collections.get(selected);
    const title=category||((area==='blogs')?'Blog Archive':c?.title||label);
    const description=selected||category?'':AREA[area][1];
    const result=feedFor(area,selected,category);
    const rail=contentsRail(result.ordered,area,selected,category);
    return `<div class="reader-layout has-toc archive-${E(area)} ${collapsed?'sidebar-collapsed':''}">${sideNav(area,selected,category)}<section class="reader-feed" aria-label="${E(label)} entries">${intro(title,description,result.count)}${searchbar()}<div id="mobile-toc-slot">${rail.match(/<details class="contents-mobile"[\s\S]*?<\/details>/)?.[0]||''}</div><div id="feed-content">${result.html}</div></section>${rail.replace(/<details class="contents-mobile"[\s\S]*?<\/details>/,'')}</div>`;
  }
  function home(){
    // Preserve the previous welcome and a swipeable Place to Begin wheel.
    // Render the same complete favorite entries used by the dedicated Favorites page.
    const starts=[
      {label:'XML Course',hint:'XML, XSLT, stylesheets and working data exhibits',target:href('xml'),area:'xml'},
      {label:'Web One Archive',hint:'Web design, graphics and navigation',target:href('webone'),area:'webone'},
      {label:'Web Two Archive',hint:'Later lessons and interactive browser examples',target:href('webtwo'),area:'webtwo'},
      {label:'Vanilla JS · Evented nB Tail',hint:'Non-blocking browser-side event recursion',target:href('jsconcepts'),area:'jsconcepts'}
    ];
    const suggestions=starts.map((entry,i)=>`<a class="home-feature start-feature" href="${entry.target}"><span>0${i+1} / ${E(AREA[entry.area][0])}</span><strong>${E(entry.label)}</strong><small>${E(entry.hint)}</small></a>`).join('');
    const favoriteCollection=collec('favorites')[0];
    const favorites=feedFor('favorites',favoriteCollection?.id||'');
    const rail=contentsRail(favorites.ordered,'favorites',favoriteCollection?.id||'');
    const mobileContents=rail.match(/<details class="contents-mobile"[\s\S]*?<\/details>/)?.[0]||'';
    return `<div class="reader-layout has-toc archive-home ${collapsed?'sidebar-collapsed':''} home-reader">${sideNav('home')}<section class="reader-feed" aria-label="Welcome and favorites">
      <div class="home-wrap"><section class="welcome"><span class="home-eyebrow">Shawn Stark · General Web</span><h1>A little history, kept close.</h1>
      <p>This is a quiet archive of writing, coursework, programming notes, and working early web experiments—selected for useful ideas and easy reading.</p>
      <p>Choose an archive across the top, then a collection on the left. The index on the right names every entry in the current collection; read them all by scrolling the center column. On mobile, expand the left Collections menu or the contents index. <strong>See more</strong> opens the complete text in place.</p></section>
      <section class="home-sections start-section" aria-label="Place to Begin"><div class="home-label"><span>Place to Begin</span><small>Swipe or hover near either edge to explore</small></div>
        <div class="started-carousel" aria-roledescription="carousel" aria-label="Recommended archives">
          <!-- handler: app.js :: document.click -> data-start-direction branch --> <button class="started-arrow started-arrow-left" type="button" data-start-direction="-1" aria-label="Previous archive" title="Previous archive">‹</button>
          <!-- handlers: app.js :: document.keydown / document.pointermove / document.pointerover / document.pointerout -> startedGlide() --> <div class="started-track" id="started-track" tabindex="0" role="region" aria-label="Swipeable recommended archives">${suggestions}</div>
          <!-- handler: app.js :: document.click -> data-start-direction branch --> <button class="started-arrow started-arrow-right" type="button" data-start-direction="1" aria-label="Next archive" title="Next archive">›</button>
        </div>
      </section>
      <section class="home-sections favorites-section" aria-label="Favorite entries"><div class="home-label"><span>Favorites</span><a href="${href('favorites')}">View Favorites</a></div>
        <div id="mobile-toc-slot">${mobileContents}</div>
        <div id="feed-content">${favorites.html}</div>
      </section></div>
    </section>${rail.replace(/<details class="contents-mobile"[\s\S]*?<\/details>/,'')}</div>`;
  }
  function notesPage(){return `<div class="reader-layout ${collapsed?'sidebar-collapsed':''}">${sideNav('xml')}<section class="reader-feed simple-page">${intro('Course feedback','Comments and evaluations for XML coursework.')}<p><a href="${href('xml','xml-course-evaluations')}">Read course feedback</a></p></section></div>`;}
  function filesPage(){let out=[];let seen=new Set();for(const it of DB.items)for(const f of (it.files||[])){if(seen.has(f.href))continue;seen.add(f.href);out.push({label:it.title,href:f.href,filename:f.label});}
    return `<div class="reader-layout ${collapsed?'sidebar-collapsed':''}">${sideNav('home')}<div class="reader-feed simple-page">${intro('Files','Documents and downloads.',out.length)}<div class="file-index">${out.map(f=>`<a href="${E(f.href)}" download><b>${E(f.label)}</b><small>${E(f.filename)}</small></a>`).join('')}</div></div></div>`;}
  function parseLocation(){let h=location.hash.replace(/^#\/?/,'').replace(/^\//,'').split('/').filter(Boolean).map(x=>decodeURIComponent(x));
    if(!h.length)return {area:'home'};
    if(h[0]==='home')return {area:'home'};
    if(h[0]==='feedback')return {area:'feedback'};
    if(h[0]==='files')return {area:'files'};
    if(h[0]==='collection'&&collections.has(h[1])){const c=collections.get(h[1]);return {area:c.area,collection:c.id};}
    if(h[0]==='item'&&items.has(h[1])){const it=items.get(h[1]);return {area:it.area,collection:it.collection,article:it.id};}
    if(h[0]==='section'&&AREA[h[1]]){
      if(h[2]==='collection')return {area:h[1],collection:h[3]||''};
      if(h[2]==='category')return {area:h[1],category:h[3]||''};
      return {area:h[1]};
    }
    return {area:'home'};
  }
  let webOnePage='index.html';
  function drawWebOne(){
   const host=$('webone-site'),data=window.WEB_ONE_PAGES;if(!host||!data)return;
   const nav=host.querySelector('.legacy-web-tabs'),target=host.querySelector('.legacy-web-content');if(!nav||!target)return;
   if(!data[webOnePage])webOnePage='index.html';
   nav.innerHTML=Object.entries(data).map(([k,p])=>`<!-- handler: app.js :: document.click -> drawWebOne() --> <button type="button" data-webone-page="${E(k)}" class="${k===webOnePage?'active':''}">${E(p.title)}</button>`).join('');
   target.innerHTML=data[webOnePage].html;
   target.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')==='#'&&!a.dataset.webonePage)a.removeAttribute('href');});
  }
  // Get Started supports touch, trackpad, keyboard, arrow and gentle edge-hover scrolling.
  let startedFrame=0,startedSpeed=0,startedLast=0;
  function stopStartedGlide(){if(startedFrame)cancelAnimationFrame(startedFrame);startedFrame=0;startedSpeed=0;startedLast=0;}
  function startedGlide(t){
    const track=$('started-track');if(!track||!startedSpeed){stopStartedGlide();return;}
    if(startedLast){const delta=Math.min((t-startedLast)/1000,.05);track.scrollLeft+=startedSpeed*delta;}
    startedLast=t;
    if((startedSpeed<0&&track.scrollLeft<=0)||(startedSpeed>0&&track.scrollLeft+track.clientWidth>=track.scrollWidth-1)){stopStartedGlide();return;}
    startedFrame=requestAnimationFrame(startedGlide);
  }
  function setStartedGlide(speed){if(speed===startedSpeed)return;stopStartedGlide();startedSpeed=speed;if(speed)startedFrame=requestAnimationFrame(startedGlide);}
  document.addEventListener('pointermove',ev=>{
    const track=$('started-track');
    if(ev.pointerType!=='mouse'||!track||!track.contains(ev.target)||matchMedia('(prefers-reduced-motion: reduce)').matches){stopStartedGlide();return;}
    const rect=track.getBoundingClientRect(),edge=Math.min(64,rect.width*.25),x=ev.clientX-rect.left;
    const speed=x<edge?-(edge-x)/edge*220:x>rect.width-edge?(x-(rect.width-edge))/edge*220:0;
    setStartedGlide(speed);
  });
  document.addEventListener('pointerover',ev=>{
    const arrow=ev.target.closest?.('button[data-start-direction]');
    if(arrow&&ev.pointerType==='mouse'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)
      setStartedGlide(Number(arrow.dataset.startDirection)*180);
  });
  document.addEventListener('pointerout',ev=>{
    if(ev.target.closest?.('.started-carousel')&&!ev.relatedTarget?.closest?.('.started-carousel'))stopStartedGlide();
  });
  document.addEventListener('keydown',ev=>{
    if(ev.target?.id!=='started-track'||!['ArrowLeft','ArrowRight'].includes(ev.key))return;
    ev.preventDefault();const dir=ev.key==='ArrowRight'?1:-1;
    ev.target.scrollBy({left:dir*((ev.target.querySelector('.start-feature')?.getBoundingClientRect().width||240)+12),behavior:'smooth'});
  });
  // The authored pseudo_threads2.js is loaded by a normal script tag in index.html,
  // after its original stage markup, jQuery, jQuery UI and testingclosures.js.
  // The original recursion and DOM message API are owned by pseudo_threads2.js.
  // Page lifecycle requests pause through loopStack.haltfornow(); no event/recursion changes.
  let afStage=document.getElementById('af-shell'),
      afLoaded=Boolean(window.loopStack&&window.simConstantMomentum),
      afDormant=false,afHomeWindowUsed=false,afHaltTimeoutId=null,afNextBall=0,
      afHasRendered=false,afLastRoute='',afBrowserPaused=false;
  const afAdded=[];
  const afParking=document.getElementById('af-original-parking');
  function afStatus(message){
    const el=document.querySelector('#entry-jsconcepts-safe [data-af-status]');
    if(el)el.textContent=message;
  }
  function afCancelHomeWindow(){
    if(afHaltTimeoutId!==null){clearTimeout(afHaltTimeoutId);afHaltTimeoutId=null;}
  }
  function afArmInitialHomeWindow(){
    // One 45-second window on the first Home activation; never repeat it on restart.
    if(activeArea!=='home'||afHomeWindowUsed||afDormant||!afLoaded)return;
    afHomeWindowUsed=true;
    afHaltTimeoutId=setTimeout(()=>{
      afHaltTimeoutId=null;
      window.loopStack?.haltfornow();
      afDormant=true;
      afStatus('45 seconds elapsed · Paused');
    },45000);
  }
  function afPause(message){
    if(!afLoaded||!window.loopStack)return;
    afCancelHomeWindow();
    if(!afDormant)window.loopStack.haltfornow();
    afDormant=true;
    afStatus(message||'Paused');
  }
  function afResumeAll(message){
    // Each public excite() moves ONE dormant context using the original __push/notify path.
    // Calling the exposed API repeatedly restores the original full set on re-entry.
    if(!afLoaded||!window.loopStack)return 0;
    let restored=0;
    while(window.loopStack.excite()){restored++;}
    if(restored){afDormant=false;afHomeWindowUsed=true;afStatus(message||'Running');}
    else afStatus('No dormant context available to excite.');
    return restored;
  }
  function afBeforeRender(pauseForNavigation=false){
    // Keep the exact same DOM objects: original jQuery movement closures retain them.
    // Changing archive/collection parks the stage AND asks the original event path to
    // divert its contexts into the dormant queue. No global event/prototype changes.
    if(pauseForNavigation){afBrowserPaused=false;afPause('Pausing');}
    if(!afStage)afStage=document.getElementById('af-shell');
    if(afStage && afStage.parentNode!==afParking)afParking.appendChild(afStage);
  }
  function afAfterRender(){
    const article=$('entry-jsconcepts-safe');
    const expanded=Boolean(article?.querySelector('.entry-body-wrap.expanded'));
    if(!expanded)return;
    const target=article.querySelector('[data-af-stage]');
    if(afStage && target && afStage.parentNode!==target)target.replaceChildren(afStage);
    if(!afLoaded){afStatus('Unable to start. Check script dependencies.');return;}
    if(document.hidden){afPause('Paused');return;}
    if(afDormant)afResumeAll('Running');
    else afStatus(activeArea==='home'&&!afHomeWindowUsed?'Running · 45-second Home session':'Running');
    afArmInitialHomeWindow();
  }
  function afAction(name){
    if(!afLoaded || !window.loopStack){afStatus('Unable to start');return;}
    if(name==='pause'){
      afBrowserPaused=false;afPause('Pausing');
    } else if(name==='start'){
      afBrowserPaused=false;
      if(document.hidden){afStatus('Paused');return;}
      // Manual Start/Excite exposes the original single-context operation; never re-arm.
      const excited=window.loopStack.excite();
      if(!excited){afStatus('No dormant context to excite.');return;}
      afDormant=false;
      afHomeWindowUsed=true;
      afCancelHomeWindow();
      afStatus('Running');
    } else if(name==='add'){
      // The author's original public push() and movement function, with no replacement.
      const ball=window.newCircle(0,0).attr('id','af-extra-'+(++afNextBall));
      const motion=window.simConstantMomentum(ball,window.jQuery('#bounding-div0'),'.125');
      const pkg='afAddedMotion'+afNextBall,fn='afAddedFunction'+afNextBall;
      const pack={name:pkg};pack[fn]=motion;
      const handle=window.loopStack.push({gravity:'',movementRate:'',locationId:''},
        [{pak_name:pkg,func_name:fn,delay:30,max_cycle:0,min_cycle:0}],[pack]);
      afAdded.push({ball,handle});afStatus('Added');
    } else if(name==='remove'){
      afStatus('Remove unavailable');
    }
  }
  function hydrate(){drawWebOne();afAfterRender();
    document.querySelectorAll('.reading-entry').forEach(a=>{
      const body=a.querySelector('.entry-body-wrap'),btn=a.querySelector('.see-more');if(!body||!btn)return;
      if(body.classList.contains('expanded'))return;
      // Give each complete article a short window; expand immediately in place.
      if(body.scrollHeight<=body.clientHeight+9){btn.classList.add('no-more');body.classList.add('fits');}
    });

  }
  function focusAnchor(){if(!anchorItem)return;const elem=$('entry-'+anchorItem);if(elem)requestAnimationFrame(()=>elem.scrollIntoView({block:'start'}));}
  function render(resetSearch=true){
    stopStartedGlide();
    const r=parseLocation(),route=[r.area,r.collection||'',r.category||'',r.article||''].join('/');
    // Initial Home may run immediately. All other initial routes become dormant
    // until the original demo is expanded; subsequent archive/collection switches pause.
    const leaving=afHasRendered && route!==afLastRoute;
    afBeforeRender(leaving||(!afHasRendered&&r.area!=='home'));
    afLastRoute=route;afHasRendered=true;
    activeArea=r.area;activeCollection=r.collection||'';activeCategory=r.category||'';anchorItem=r.article||'';
    if(resetSearch)term='';
    $('content').innerHTML=r.area==='home'?home():r.area==='feedback'?notesPage():r.area==='files'?filesPage():section(r.area,activeCollection,activeCategory);
    document.title=(r.area==='home'?'General Web':activeCategory||collections.get(activeCollection)?.title||AREA[r.area]?.[0]||'Archives')+' · Shawn Stark';
    document.querySelectorAll('.nav-item').forEach(a=>a.setAttribute('aria-current',a.dataset.area===activeArea?'page':'false'));
    document.querySelectorAll('.nav-more').forEach(d=>d.open=false);
    hydrate();if(resetSearch&&anchorItem)focusAnchor();else if(resetSearch)window.scrollTo(0,0);
  }
  function updateFeed(){afBeforeRender();
    let result=feedFor(activeArea,activeCollection,activeCategory),x=$('feed-content');if(!x)return;
    x.innerHTML=result.html;
    const rail=contentsRail(result.ordered,activeArea,activeCollection,activeCategory);
    const mobile=rail.match(/<details class="contents-mobile"[\s\S]*?<\/details>/)?.[0]||'';
    const slot=$('mobile-toc-slot');if(slot)slot.innerHTML=mobile;
    const aside=$('contents-rail');if(aside)aside.outerHTML=rail.replace(/<details class="contents-mobile"[\s\S]*?<\/details>/,'');
    const small=document.querySelector('.reading-intro small');if(small)small.textContent=`${result.count} ${result.count===1?'entry':'entries'}`;
    hydrate();
  }
  document.addEventListener('input',ev=>{if(ev.target?.id==='entry-search'){term=ev.target.value;updateFeed();}
    if(ev.target?.id==='three-width'){const n=Number(ev.target.value);$('three-demo')?.style.setProperty('--middle',n+'%');const o=$('three-width-label');if(o)o.textContent=n+'%';}});
  document.addEventListener('click',ev=>{
    const legacy=ev.target.closest('a[data-webone-page]');if(legacy){ev.preventDefault();webOnePage=legacy.dataset.webonePage;drawWebOne();return;}
    const btn=ev.target.closest('button');if(!btn)return;
    if(btn.dataset.startDirection){
      const track=$('started-track');if(!track)return;
      stopStartedGlide();const direction=Number(btn.dataset.startDirection);
      const item=track.querySelector('.start-feature');const step=(item?.getBoundingClientRect().width||250)+12;
      const end=track.scrollWidth-track.clientWidth;
      if(direction>0&&track.scrollLeft>=end-3)track.scrollTo({left:0,behavior:'smooth'});
      else if(direction<0&&track.scrollLeft<=3)track.scrollTo({left:end,behavior:'smooth'});
      else track.scrollBy({left:step*direction,behavior:'smooth'});
      return;
    }
    if(btn.dataset.afAction){afAction(btn.dataset.afAction);return;}
    if(btn.dataset.webonePage){if(window.WEB_ONE_PAGES?.[btn.dataset.webonePage]){webOnePage=btn.dataset.webonePage;drawWebOne();}return;}
    if(btn.dataset.webtwoTab){const host=btn.closest('.webtwo-exhibit');if(!host)return;host.querySelectorAll('[data-webtwo-tab]').forEach(x=>x.classList.toggle('active',x===btn));host.querySelectorAll('[data-webtwo-pane]').forEach(x=>x.hidden=x.dataset.webtwoPane!==btn.dataset.webtwoTab);return;}
    if(btn.id==='three-short-side'){const demo=$('three-demo');demo?.classList.toggle('short-side');btn.textContent=demo?.classList.contains('short-side')?'Restore left column':'Shorten left column';return;}
    if(btn.id==='three-reset'){const d=$('three-demo'),r=$('three-width'),o=$('three-width-label');if(d){d.style.setProperty('--middle','56%');d.classList.remove('short-side');}if(r)r.value=56;if(o)o.textContent='56%';const b=$('three-short-side');if(b)b.textContent='Shorten left column';return;}
    if(btn.id==='js-toggle-panel'){const d=$('js-panel');if(d)d.hidden=!d.hidden;return;}
    if(btn.id==='js-move-panel'){const d=$('js-panel');if(d){d.classList.toggle('moved');d.hidden=false;}return;}
    if(btn.dataset.xmlMode){const panel=btn.closest('.xml-demo'),key=panel?.dataset.xmlDemo,d=DB.xmlExhibits?.[key],mode=btn.dataset.xmlMode;if(!panel||!d)return;
      panel.querySelectorAll('.xml-mode').forEach(x=>x.classList.toggle('active',x===btn));const dest=panel.querySelector('.xml-mode-content');if(!dest)return;
      if(mode==='rendered'){dest.innerHTML=d.rendered;}
      else{const pre=document.createElement('pre'),code=document.createElement('code');code.textContent=d[mode]||'';pre.append(code);dest.replaceChildren(pre);}
      return;
    }
    if(btn.id==='xml-run-transform'){const panel=btn.closest('.xml-demo'),key=panel?.dataset.xmlDemo,d=DB.xmlExhibits?.[key],dest=panel?.querySelector('.xml-mode-content');if(!d||!dest)return;
      try{const dom=new DOMParser(),xml=dom.parseFromString(d.xml,'application/xml'),xsl=dom.parseFromString(d.xslt,'application/xml');if(!window.XSLTProcessor||xml.querySelector('parsererror')||xsl.querySelector('parsererror'))throw Error('Native XSLT not supported');const p=new XSLTProcessor();p.importStylesheet(xsl);const frag=p.transformToFragment(xml,document);if(!frag)throw Error('Transform not returned');dest.replaceChildren(frag);}
      catch(e){dest.innerHTML=d.rendered;}
      return;}
    if(btn.dataset.jump){
      const el=$('entry-'+btn.dataset.jump);if(!el)return;
      // Do not navigate away, or add another click to get the full article.
      const box=el.querySelector('.entry-body-wrap');const more=el.querySelector('.see-more');
      if(box&&!box.classList.contains('fits')&&!box.classList.contains('expanded')){
        box.classList.add('expanded');el.classList.add('expanded');
        if(btn.dataset.jump==='jsconcepts-safe')afAfterRender();
        if(more){more.textContent='Show less ↑';more.setAttribute('aria-expanded','true');}
      }
      document.querySelectorAll('.contents-link').forEach(x=>x.classList.toggle('current',x.dataset.jump===btn.dataset.jump));
      el.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
      return;
    }
    if(btn.id==='toggle-sidebar'){collapsed=!collapsed;const lay=document.querySelector('.reader-layout'),side=$('collection-sidebar');lay?.classList.toggle('sidebar-collapsed',collapsed);side?.classList.toggle('collapsed',collapsed);btn.textContent=collapsed?'›':'‹';btn.setAttribute('aria-label',(collapsed?'Expand':'Collapse')+' collections');return;}
    if(btn.id==='clear-search'){term='';const input=$('entry-search');if(input)input.value='';updateFeed();input?.focus();return;}
    if(btn.dataset.expand){const box=$('body-'+btn.dataset.expand),node=box?.closest('.reading-entry');if(!box)return;
      const open=!box.classList.contains('expanded');box.classList.toggle('expanded',open);node?.classList.toggle('expanded',open);btn.textContent=open?'Show less ↑':'See more ↓';btn.setAttribute('aria-expanded',String(open));
      if(btn.dataset.expand==='jsconcepts-safe'){if(open)afAfterRender();else {afBrowserPaused=false;afPause('Paused');}}if(!open)node?.scrollIntoView({block:'nearest'});return;}
  });
  document.addEventListener('submit',ev=>{
   const f=ev.target;
   if(f.id==='webtwo-temperature'){ev.preventDefault();const v=Number(f.elements.input.value),c=f.elements.scale.value==='f';f.querySelector('output').textContent=Number((c?(v-32)*5/9:v*9/5+32).toFixed(2))+(c?' °C':' °F');}
   else if(f.id==='webtwo-pay'){ev.preventDefault();const w=Math.max(0,Number(f.elements.wage.value)),h=Math.max(0,Number(f.elements.hours.value));f.querySelector('output').textContent=(w*h).toLocaleString('en-US',{style:'currency',currency:'USD'})+' gross pay';}
   else if(f.id==='webtwo-validate'){ev.preventDefault();f.querySelector('output').textContent=f.elements.priority.value?'Valid · priority '+f.elements.priority.value+' · nothing was submitted':'Choose a priority first.';}
   else if(f.hasAttribute('data-historic-form'))ev.preventDefault();
  });
  window.addEventListener('hashchange',()=>render());
  // The browser may suspend timers and painting. All currently running demo
  // contexts move through the exposed RecursionStack API before suspension.
  // A deliberate Pause, route change, or collapsed article does not auto-resume.
  function afBrowserSuspend(){
    const visibleDemo=Boolean(document.querySelector('#entry-jsconcepts-safe .entry-body-wrap.expanded'));
    if(!afLoaded || afDormant || !visibleDemo)return;
    afBrowserPaused=true;
    afPause('Paused');
  }
  function afBrowserReturn(){
    if(!afBrowserPaused || document.visibilityState==='hidden')return;
    afBrowserPaused=false;
    const visibleDemo=Boolean(document.querySelector('#entry-jsconcepts-safe .entry-body-wrap.expanded'));
    if(visibleDemo && afDormant)afAfterRender();
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden')afBrowserSuspend();
    else afBrowserReturn();
  });
  document.addEventListener('freeze',afBrowserSuspend);
  document.addEventListener('resume',afBrowserReturn);
  window.addEventListener('pagehide',afBrowserSuspend);
  window.addEventListener('pageshow',afBrowserReturn);
  render();
})();
