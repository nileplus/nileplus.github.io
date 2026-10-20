/* ───────── NILE+ · a marketplace for Qatar ─────────
   Companies register with their commercial registration and sell through
   NILE+ (NILE+ collects the money, keeps its commission and pays them out).
   Individuals pay a flat fee per ad. Everything is stored in Supabase. */

/* ───────── fixed reference data ───────── */
const CATS={all:['كل الأقسام','All Departments','✦'],electronics:['الإلكترونيات','Electronics','🎧'],fashion:['الأزياء والحقائب','Fashion & Bags','👟'],home:['المنزل والمطبخ','Home & Kitchen','🛋️'],beauty:['الجمال والعناية','Beauty & Care','✨'],sports:['الرياضة واللياقة','Sports & Fitness','🏋️'],accessories:['الساعات والإكسسوارات','Watches & Accessories','⌚']};
const CITIES=[
 {k:'doha',ar:'الدوحة',en:'Doha',min:1,max:2,same:true},
 {k:'rayyan',ar:'الريان',en:'Al Rayyan',min:1,max:2,same:false},
 {k:'wakra',ar:'الوكرة',en:'Al Wakrah',min:1,max:2,same:false},
 {k:'umm',ar:'أم صلال',en:'Umm Salal',min:1,max:3,same:false},
 {k:'khor',ar:'الخور',en:'Al Khor',min:2,max:3,same:false},
 {k:'shamal',ar:'الشمال',en:'Al Shamal',min:2,max:4,same:false},
 {k:'dukhan',ar:'دخان والشيحانية',en:'Dukhan & Al Shahaniya',min:3,max:4,same:false}
];
// delivery fees in QAR; the owner changes them in the admin panel
// comm = NILE+ commission in % of what the customer pays for the items
const DEF={freeOver:100,std:10,next:15,same:25,cod:10,gift:10,comm:10,adFee:15,adDays:30,payInfo:'',termsV:1};
const ADCATS={...Object.fromEntries(Object.entries(CATS).filter(([k])=>k!=='all')),other:['أخرى','Other','🏷️']};
const PALETTE=['#d7141e','#0c0c0c','#3a3a3a','#a80f17','#1f4e79','#0a7a33','#7a4a2a','#5b2a86'];
const EMOJIS=['🎧','🔊','⌚','📱','💻','📷','🎮','👟','🎒','👜','👗','🕶️','💍','💡','🛋️','☕','🍳','🧴','✨','💄','🏋️','🥤','⚽','🚲','🧸','📚','🎁','🔌','👕','🧹','🛏️','🪑','❄️','🧊','📦'];
const CARRIERS=[['nile','نيل + للتوصيل','NILE+ Delivery'],['qpost','بريد قطر','Qatar Post'],['aramex','أرامكس','Aramex'],['dhl','دي إتش إل','DHL'],['snoonu','سنونو','Snoonu'],['own','مندوب المتجر','Store’s own driver']];
const RESP=[['1h','خلال ساعة','within 1 hour'],['3h','خلال ٣ ساعات','within 3 hours'],['day','خلال يوم','within a day']];
const RETS=[7,14,15,30];
const STEP_KEYS=['placed','packed','shipped','out','delivered'];
const ST={placed:['تم الطلب','Ordered'],packed:['تم التجهيز','Packed'],shipped:['تم الشحن','Shipped'],out:['خرج للتوصيل','Out for delivery'],delivered:['تم التوصيل','Delivered'],
  cancelled:['ملغي','Cancelled'],return_req:['طلب إرجاع','Return requested'],returned:['تم استلام المرتجع','Return received'],refunded:['تم رد المبلغ','Refunded'],return_rej:['رُفض الإرجاع','Return declined']};
const CANCEL_R=[['mind',['غيّرت رأيي','Changed my mind']],['price',['لقيت سعر أفضل','Found a better price']],['late',['التوصيل يتأخر','Delivery takes too long']],['mistake',['طلبت بالغلط','Ordered by mistake']]];
const SCANCEL_R=[['stock',['المنتج نفد','Out of stock']],['area',['ما نقدر نوصّل للمنطقة','Can’t deliver to the area']],['buyer',['بطلب العميل','Customer asked']],['price',['خطأ في السعر','Pricing error']]];
const RET_R=[['damaged',['وصل تالف','Arrived damaged']],['wrong',['منتج غلط','Wrong item']],['desc',['مختلف عن الوصف','Not as described']],['defect',['فيه عيب أو ما يشتغل','Defective']],['size',['المقاس ما ناسب','Wrong size']],['mind',['ما احتجته','No longer needed']]];
const REP_R=[['fake',['منتج مقلّد أو غير أصلي','Counterfeit or fake']],['scam',['احتيال','Scam']],['wrong',['معلومات غلط','Wrong information']],['bad',['محتوى مسيء','Offensive content']],['other',['سبب ثاني','Something else']]];

/* ───────── state ───────── */
const S={ar:true,view:'home',cat:'all',q:'',fav:false,slide:0,sort:'feat',minR:0,price:'',storeF:'',fastOnly:false,dealsOnly:false,
  pid:null,img:0,vsel:{},qty:1,gift:false,revF:0,sid:null,stab:'home',storeCat:'all',city:'doha',
  speed:'std',pay:'cod',addr:null,lastGroup:null,oid:null,ordTab:'all',tid:null,sellTab:'home',ordF:'new',editPid:null,adminTab:'home',err:'',busy:false,
  adCat:'all',adQ:'',adId:null,joinAs:''};
// what the database holds, as this viewer sees it
const D={stores:{},products:{},reviews:{},questions:{},follows:{},mod:{},reports:{},settings:{...DEF},myOrders:{},sellOrders:{},allOrders:{},thrB:{},thrS:{},
  ads:{},adPays:[],payouts:[],banners:[],loaded:{stores:false,products:false}};
// who is viewing and what they may do
const ME={uid:null,owner:false,write:null,sb:null,email:'',name:'',banned:false,ready:false,live:false,offline:false,chan:null,
  doc:{cart:[],wish:[],addrs:[],recent:[],cpns:[],follows:[],seen:{},costs:{},phone:''}};

/* ───────── helpers ───────── */
const $=s=>document.querySelector(s);
const L=(a,e)=>S.ar?a:e;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tx=a=>esc(Array.isArray(a)?(S.ar?(a[0]||a[1]):(a[1]||a[0])):a);
const num=x=>new Intl.NumberFormat(S.ar?'ar-EG':'en-US',{maximumFractionDigits:1}).format(Number(x)||0);
const cur=()=>L('ر.ق','QAR');
const money=x=>`${num(x)} ${cur()}`;
const cname=k=>(CATS[k]||CATS.all)[S.ar?0:1];
const pname=p=>esc(S.ar?(p.ar||p.en):(p.en||p.ar));
const sname=s=>s?esc(S.ar?(s.ar||s.en):(s.en||s.ar)):esc(L('متجر','Store'));
const city=()=>CITIES.find(c=>c.k===S.city)||CITIES[0];
const cityOf=k=>CITIES.find(c=>c.k===k)||CITIES[0];
const cityName=c=>S.ar?c.ar:c.en;
const stars=r=>{const f=Math.max(0,Math.min(5,Math.round(r||0)));return '★★★★★'.slice(0,f)+'☆☆☆☆☆'.slice(0,5-f);};
const pct=p=>p.o>p.p?Math.round((1-p.p/p.o)*100):0;
const heart=f=>`<svg width="17" height="17" viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M12 20s-7-4.4-9-8.6C1.6 8.3 3.6 5 7 5c2 0 3.3 1.1 5 3 1.7-1.9 3-3 5-3 3.4 0 5.4 3.3 4 6.4C19 15.6 12 20 12 20Z"/></svg>`;
const fmtD=d=>d.toLocaleDateString(S.ar?'ar-EG':'en-GB',{weekday:'long',day:'numeric',month:'long'});
const fmtShort=d=>d.toLocaleDateString(S.ar?'ar-EG':'en-GB',{day:'numeric',month:'long'});
const fmtFull=t=>new Date(t).toLocaleString(S.ar?'ar-EG':'en-GB',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return d;};
const ago=t=>{const m=Math.max(0,Math.round((Date.now()-t)/60000));if(m<1)return L('الآن','just now');if(m<60)return L(`قبل ${num(m)} د`,`${m} min ago`);const h=Math.round(m/60);if(h<24)return L(`قبل ${num(h)} س`,`${h} h ago`);return fmtShort(new Date(t));};
const rid=(n=10)=>{const a='abcdefghijklmnopqrstuvwxyz0123456789';let s='';const r=crypto.getRandomValues(new Uint8Array(n));for(const x of r)s+=a[x%36];return s;};
const okId=v=>typeof v==='string'&&/^[A-Za-z0-9_\-.~:@+]{1,120}$/.test(v);
// photos live in storage at <account id>/<file>
const okAsset=v=>typeof v==='string'&&/^[0-9a-f-]{36}\/[A-Za-z0-9_.-]{1,80}$/.test(v);
const str=(v,max=300)=>typeof v==='string'?v.slice(0,max):'';
const pair=(v,max=300)=>Array.isArray(v)?[str(v[0],max),str(v[1],max)]:[str(v,max),''];
const nn=(v,min=0,max=1e7)=>{const x=Number(v);return isFinite(x)?Math.max(min,Math.min(max,x)):min;};
const LS={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};
function toast(m,bad){const e=$('#toast');e.textContent=(bad?'⚠ ':'✓ ')+m;e.classList.toggle('bad',!!bad);e.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>e.hidden=true,2400);}
const later=ms=>new Promise(r=>setTimeout(r,ms));

/* ───────── database (Supabase) ───────── */
const CFG=window.NP_CONFIG||{};
const SB_URL=CFG.url||'';
const IMG=p=>okAsset(p)?`${SB_URL}/storage/v1/object/public/photos/${p.split('/').map(encodeURIComponent).join('/')}`:'';
const ts=v=>v?(Date.parse(v)||0):0;
const isUuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/* rows → the shapes the pages use (shared data is untrusted: clean every field) */
function normS(r){
  if(!r)return null;
  return {id:r.id,owner:r.owner_id,ar:str(r.name_ar,60),en:str(r.name_en,60),lg:[str(r.logo_ar,2),str(r.logo_en,2)],bg:/^#[0-9a-fA-F]{6}$/.test(r.color)?r.color:PALETTE[0],
    e:EMOJIS.includes(r.emoji)||r.emoji==='🏬'?r.emoji:'🏬',d:[str(r.about_ar,600),str(r.about_en,600)],city:cityOf(r.city).k,ret:RETS.includes(r.ret_days)?r.ret_days:14,
    resp:RESP.some(x=>x[0]===r.resp)?r.resp:'3h',since:new Date(ts(r.created_at)||Date.now()).getFullYear(),cr:str(r.cr_number,30),activity:str(r.activity,120),
    phone:str(r.public_phone,20),status:['pending','approved','rejected','suspended'].includes(r.status)?r.status:'pending',note:str(r.status_note,500),
    comm:nn(r.commission,0,50),ver:!!r.verified,ful:!!r.fulfilled,sample:!!r.demo,createdAt:ts(r.created_at)};
}
function normP(r){
  if(!r)return null;
  const v=r.options&&typeof r.options==='object'?r.options:{};
  let opts=Array.isArray(v.o)?v.o.slice(0,16).map(o=>({ar:str(o&&o.ar,40),en:str(o&&o.en,40),hex:/^#[0-9a-fA-F]{6}$/.test(o&&o.hex)?o.hex:''})).filter(o=>o.ar||o.en):[];
  if(!opts.length)opts=[{ar:'قياسي',en:'Standard',hex:''}];
  const p={id:r.id,s:r.shop_id,owner:'',c:CATS[r.category]&&r.category!=='all'?r.category:'home',sub:[str(r.sub_ar,60),str(r.sub_en,60)],e:EMOJIS.includes(r.emoji)?r.emoji:'📦',
    imgs:Array.isArray(r.images)?r.images.filter(okAsset).slice(0,8):[],p:nn(r.price,0,1e6),o:nn(r.list_price,0,1e6),stock:Math.floor(nn(r.stock,0,1e5)),cpn:nn(r.coupon,0,1e5),
    same:!!r.same_day,cod:r.cod!==false,ar:str(r.title_ar,220),en:str(r.title_en,220),model:str(r.model,60),w:str(r.weight,30),kg:nn(r.kg,0,1000),dim:pair(r.dims,60),mat:pair(r.material,80),
    war:Math.floor(nn(r.warranty,0,10)),org:pair(r.origin,40),v:{t:pair(v.t,30),o:opts},b:Array.isArray(r.bullets)?r.bullets.slice(0,8).map(x=>pair(x,240)).filter(x=>x[0]||x[1]):[],
    active:r.active!==false,hidden:!!r.hidden,mod:['pending','approved','flagged','rejected'].includes(r.mod_status)?r.mod_status:'pending',modWhy:Array.isArray(r.mod_reasons)?r.mod_reasons.filter(x=>typeof x==='string').slice(0,6).map(x=>x.slice(0,300)):[],sold:Math.floor(nn(r.sold,0,1e9)),co:r.co&&typeof r.co==='object'?r.co:{},sample:false,createdAt:ts(r.created_at)};
  if(!p.v.t[0]&&!p.v.t[1])p.v.t=['الخيار','Option'];
  if(p.o<=p.p)p.o=0;
  if(p.cpn>=p.p)p.cpn=0;
  return p;
}
function normO(r){
  if(!r)return null;
  const a=r.address&&typeof r.address==='object'?r.address:{},f=r.fees||{},t=r.tracking;
  return {id:r.id,no:str(r.no,30),grp:r.grp,buyer:r.buyer_id,s:r.shop_id,sowner:r.seller_id,
    items:Array.isArray(r.items)?r.items.slice(0,50).map(i=>({pid:str(i&&i.pid,60),v:Math.floor(nn(i&&i.v,0,50)),q:Math.floor(nn(i&&i.q,1,99)),p:nn(i&&i.p,0,1e6),
      ar:str(i&&i.ar,220),en:str(i&&i.en,220),e:EMOJIS.includes(i&&i.e)?i.e:'📦',img:okAsset(i&&i.img)?i.img:'',vl:pair(i&&i.vl,40),cpn:nn(i&&i.cpn,0,1e5)})):[],
    addr:{name:str(a.name,80),phone:str(a.phone,20),zone:str(a.zone,6),street:str(a.street,8),bldg:str(a.bldg,8),unit:str(a.unit,20),city:cityOf(a.city).k,note:str(a.note,200)},
    speed:['std','next','same'].includes(r.speed)?r.speed:'std',pay:r.pay==='cardod'?'cardod':'cod',fees:{del:nn(f.del),cod:nn(f.cod),gift:nn(f.gift)},
    sub:nn(r.sub),cpn:nn(r.coupon),total:nn(r.total),status:ST[r.status]?r.status:'placed',rate:nn(r.comm_rate,0,100),
    tl:Array.isArray(r.timeline)?r.timeline.slice(-40).map(e=>({s:ST[e&&e.s]?e.s:'placed',at:nn(e&&e.at,0,9e15),by:['buyer','seller','admin'].includes(e&&e.by)?e.by:'seller',note:str(e&&e.note,300)})):[],
    trk:t&&typeof t==='object'?{c:CARRIERS.some(c=>c[0]===t.c)?t.c:'nile',no:str(t.no,40)}:null,
    eta:ts(r.eta),gift:!!r.gift,note:str(r.note,300),reason:str(r.reason,300),createdAt:ts(r.created_at),updatedAt:ts(r.updated_at)};
}
const normR=r=>({id:r.id,pid:r.product_id,s:r.shop_id,by:r.user_id,r:Math.round(nn(r.rating,1,5)),t:str(r.title,120),b:str(r.body,3000),vl:pair(r.variant,40),oid:r.order_id||'',
  hv:Array.isArray(r.helpful)?r.helpful:[],reply:str(r.reply,1500),at:ts(r.updated_at||r.created_at)});
const normA=r=>({id:r.id,uid:r.user_id,c:r.category,t:str(r.title,120),d:str(r.description,3000),p:nn(r.price,0,1e7),cond:r.condition==='new'?'new':'used',city:cityOf(r.city).k,
  phone:str(r.contact_phone,16),showPhone:!!r.show_phone,e:EMOJIS.includes(r.emoji)?r.emoji:'📦',imgs:Array.isArray(r.images)?r.images.filter(okAsset).slice(0,8):[],
  status:r.status,note:str(r.status_note,500),until:ts(r.paid_until),mod:['pending','approved','flagged','rejected'].includes(r.mod_status)?r.mod_status:'pending',modWhy:Array.isArray(r.mod_reasons)?r.mod_reasons.filter(x=>typeof x==='string').slice(0,6).map(x=>x.slice(0,300)):[],releaseAt:ts(r.release_at),demo:!!r.demo,createdAt:ts(r.created_at)});
// customers see an ad once it's paid, passed review and its holding time is over
const adLive=a=>!!a&&a.status==='live'&&a.until>Date.now()&&a.mod==='approved'&&a.releaseAt<=Date.now();

/* ───────── what belongs to whom ───────── */
const isMine=owner=>!!owner&&!!ME.uid&&owner===ME.uid;
const store=id=>D.stores[id]||null;
const prod=id=>D.products[id]||null;
const modS=id=>{const s=store(id);return s?{hidden:s.status==='suspended',ver:s.ver,ful:s.ful}:{};};
const modP=id=>{const p=prod(id);return p?{hidden:p.hidden}:{};};
const storeLive=s=>!!s&&s.status==='approved';
const visible=p=>!!p&&p.active&&!p.hidden&&p.mod==='approved'&&storeLive(store(p.s))&&p.p>0;
const allProds=()=>Object.values(D.products).filter(visible);
const storeProds=sid=>allProds().filter(p=>p.s===sid);
const ful=s=>!!(s&&s.ful);
const verified=s=>!!(s&&s.ver);
const S2=()=>({...DEF,...D.settings});

/* ratings come only from real reviews */
function ratingOf(pid){
  const rs=Object.values(D.reviews).filter(r=>r.pid===pid);
  const dist=[0,0,0,0,0];rs.forEach(r=>dist[5-r.r]++);
  const n=rs.length,sum=rs.reduce((a,r)=>a+r.r,0);
  return {n,avg:n?Math.round(sum/n*10)/10:0,dist:dist.map(x=>n?Math.round(x/n*100):0)};
}
function storeRating(sid){
  const rs=Object.values(D.reviews).filter(r=>r.s===sid);
  const n=rs.length,sum=rs.reduce((a,r)=>a+r.r,0),pos=rs.filter(r=>r.r>=4).length;
  const dist=[0,0,0,0,0];rs.forEach(r=>dist[5-r.r]++);
  return {n,avg:n?Math.round(sum/n*10)/10:0,pos:n?Math.round(pos/n*100):0,dist:dist.map(x=>n?Math.round(x/n*100):0)};
}
const followers=sid=>Object.values(D.follows).filter(f=>f.s===sid).length;
const following=sid=>!!ME.uid&&Object.values(D.follows).some(f=>f.s===sid&&f.by===ME.uid);
function bestIn(p){
  if(!p.sold)return 0;
  const peers=allProds().filter(x=>x.c===p.c).sort((a,b)=>b.sold-a.sold);
  return peers.findIndex(x=>x.id===p.id)+1;
}
const isBest=p=>bestIn(p)===1;
function deliveredFor(pid){
  return Object.values(D.myOrders).filter(o=>['delivered','return_req','returned','refunded','return_rej'].includes(o.status)&&o.items.some(i=>i.pid===pid));
}
const myReview=pid=>Object.values(D.reviews).find(r=>r.pid===pid&&r.by===ME.uid)||null;

/* ───────── loading ───────── */
async function q(p){const {data,error}=await p;if(error)throw error;return data||[];}
async function rpc(name,args){const {data,error}=await ME.sb.rpc(name,args||{});if(error)throw error;return data;}
function intoMap(map,list){Object.keys(map).forEach(k=>delete map[k]);list.forEach(x=>{if(x)map[x.id]=x;});}

async function loadCatalog(){
  const sb=ME.sb;
  try{
    const [st,sh,pr,rv,qs,an,fo,ads,bn]=await Promise.all([
      q(sb.from('settings').select('*').eq('id',1)),q(sb.from('shops').select('*').limit(1000)),q(sb.from('products').select('*').order('created_at',{ascending:false}).limit(1000)),
      q(sb.from('reviews').select('*').limit(1000)),q(sb.from('questions').select('*').order('created_at',{ascending:false}).limit(1000)),q(sb.from('answers').select('*').order('created_at').limit(3000)),
      q(sb.from('follows').select('shop_id,user_id').limit(5000)),q(sb.from('ads').select('*').order('created_at',{ascending:false}).limit(500)),
      q(sb.from('banners').select('id,title,advertiser,image,link,placement,starts_at,ends_at,active,sort').order('sort').order('created_at',{ascending:false}).limit(50))]);
    const s=st[0]||{};
    D.settings={freeOver:nn(s.free_over,0,1e4),std:nn(s.fee_std,0,1e4),next:nn(s.fee_next,0,1e4),same:nn(s.fee_same,0,1e4),cod:nn(s.fee_cod,0,1e4),gift:nn(s.fee_gift,0,1e4),
      comm:nn(s.comm,0,50),adFee:nn(s.ad_fee,0,1e4),adDays:Math.floor(nn(s.ad_days,1,365)),payInfo:str(s.pay_info,1000),termsV:s.terms_version||1,reviewMin:Math.floor(nn(s.review_minutes,0,1440))};
    if(!st[0])D.settings={...DEF};
    intoMap(D.stores,sh.map(normS));
    intoMap(D.products,pr.map(normP));
    Object.values(D.products).forEach(p=>{p.owner=(D.stores[p.s]||{}).owner||'';});
    intoMap(D.reviews,rv.map(normR));
    const byQ={};an.forEach(a=>{(byQ[a.question_id]=byQ[a.question_id]||[]).push({by:a.user_id,t:str(a.body,1500),at:ts(a.created_at),seller:!!a.is_seller});});
    intoMap(D.questions,qs.map(x=>({id:x.id,pid:x.product_id,s:x.shop_id,by:x.user_id,q:str(x.body,600),at:ts(x.created_at),ans:byQ[x.id]||[]})));
    intoMap(D.follows,fo.map(f=>({id:f.shop_id+'_'+f.user_id,s:f.shop_id,by:f.user_id})));
    intoMap(D.ads,ads.map(normA));
    D.banners=bn.filter(b=>okAsset(b.image)).map(b=>({id:b.id,t:str(b.title,120),by:str(b.advertiser,120),img:b.image,link:str(b.link,500),place:b.placement==='mid'?'mid':'hero',from:ts(b.starts_at),to:ts(b.ends_at),on:!!b.active}));
    D.loaded.stores=D.loaded.products=true;ME.live=true;
  }catch(e){console.warn('[NILE+] catalog',e);ME.offline=true;}
  schedule();
}
async function loadMine(){
  const sb=ME.sb,uid=ME.uid;if(!uid)return;
  try{
    const [mo,so,th,pays,pos]=await Promise.all([
      q(sb.from('orders').select('*').eq('buyer_id',uid).order('created_at',{ascending:false}).limit(500)),
      q(sb.from('orders').select('*').eq('seller_id',uid).order('created_at',{ascending:false}).limit(1000)),
      q(sb.from('threads').select('*').or(`buyer_id.eq.${uid},seller_id.eq.${uid}`).order('last_at',{ascending:false}).limit(300)),
      q(sb.from('ad_payments').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(500)),
      q(sb.from('payouts').select('*').order('created_at',{ascending:false}).limit(1000))]);
    intoMap(D.myOrders,mo.map(normO));intoMap(D.sellOrders,so.map(normO));
    const ids=th.map(t=>t.id),msgs=ids.length?await q(sb.from('messages').select('*').in('thread_id',ids).order('id').limit(5000)):[];
    const byT={};msgs.forEach(m=>{(byT[m.thread_id]=byT[m.thread_id]||[]).push(m);});
    const T=t=>({id:t.id,buyer:t.buyer_id,sowner:t.seller_id,s:t.shop_id||'',ad:t.ad_id||'',pid:t.product_id||'',
      msgs:(byT[t.id]||[]).slice(-300).map(m=>({by:m.sender_id,t:str(m.body,2000),at:ts(m.created_at),seller:m.sender_id===t.seller_id})),lastAt:ts(t.last_at),seenB:ts(t.seen_buyer),seenS:ts(t.seen_seller)});
    intoMap(D.thrB,th.filter(t=>t.buyer_id===uid).map(T));intoMap(D.thrS,th.filter(t=>t.seller_id===uid).map(T));
    D.adPays=pays.map(p=>({id:p.id,ad:p.ad_id,kind:p.kind,amount:nn(p.amount),days:p.days,method:p.method,ref:str(p.reference,80),status:p.status,note:str(p.note,300),at:ts(p.created_at)}));
    D.payouts=pos.map(p=>({id:p.id,s:p.shop_id,amount:nn(p.amount),ref:str(p.reference,80),note:str(p.note,300),at:ts(p.created_at)}));
  }catch(e){console.warn('[NILE+] mine',e);}
  schedule();
}
let mineT=0,catT=0;
const reloadMine=()=>{clearTimeout(mineT);mineT=setTimeout(loadMine,350);};
const reloadCatalog=()=>{clearTimeout(catT);catT=setTimeout(loadCatalog,350);};
const refresh=()=>{reloadCatalog();reloadMine();};

/* ───────── signing in ───────── */
async function onSession(session){
  const uid=session&&session.user?session.user.id:null;
  if(uid===ME.uid&&ME.ready)return;
  ME.uid=uid;ME.email=session&&session.user?session.user.email:'';ME.ready=true;
  if(ME.chan){ME.sb.removeChannel(ME.chan);ME.chan=null;}
  ['myOrders','sellOrders','thrB','thrS'].forEach(k=>intoMap(D[k],[]));D.adPays=[];D.payouts=[];
  if(!uid){ME.owner=false;ME.write=null;ME.banned=false;ME.doc=cleanMe(LS_me());await loadCatalog();return render(true);}
  const [adm,prof]=await Promise.all([ME.sb.rpc('is_admin'),ME.sb.from('profiles').select('full_name,banned').eq('id',uid).maybeSingle()]);
  ME.owner=!!adm.data;ME.banned=!!(prof.data&&prof.data.banned);ME.write=!ME.banned;ME.name=prof.data?prof.data.full_name:'';
  if(ME.name)NAMES[uid]=ME.name;
  await loadMe();
  ME.chan=ME.sb.channel('np-'+uid)
    .on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>{reloadMine();reloadCatalog();})
    .on('postgres_changes',{event:'*',schema:'public',table:'threads'},reloadMine)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},reloadMine)
    .on('postgres_changes',{event:'*',schema:'public',table:'ad_payments'},refresh)
    .subscribe();
  await Promise.all([loadCatalog(),loadMine()]);
  render(true);
}
async function boot(){
  render();
  if(!window.supabase||!SB_URL){ME.offline=true;render(true);return;}
  ME.sb=window.supabase.createClient(SB_URL,CFG.key,{auth:{persistSession:true,autoRefreshToken:true}});
  ME.live=true;
  const {data}=await ME.sb.auth.getSession();
  await onSession(data.session);
  deepLink();
  ME.sb.auth.onAuthStateChange((ev,session)=>{
    if(ev==='PASSWORD_RECOVERY')setTimeout(()=>openAuth('newpw'),0);
    if(ev==='SIGNED_IN'||ev==='SIGNED_OUT'||ev==='USER_UPDATED')setTimeout(()=>onSession(session),0);});
  setInterval(()=>{if(!document.hidden)refresh();},60000);
  addEventListener('focus',refresh);
}
// re-render at most once per moment when data arrives; never while someone is typing in a form
let rq=0;
function typing(){
  const a=document.activeElement;
  // the chat box is the exception: new messages must show while you type (render keeps your text)
  if(a&&a.id!=='cmsg'&&a.matches&&a.matches('input:not([type=radio]):not([type=checkbox]),textarea,select')&&a.closest('#view,#sheet'))return true;
  return !!(S.dirty&&document.querySelector('#view form.keep'));
}
// (a timer, not an animation frame, so a page in a background tab still catches up)
function schedule(){if(rq)return;rq=setTimeout(()=>{rq=0;render(true,typing());},40);}

/* ───────── the viewer's own private data: cart, addresses, wish list, cost prices ───────── */
function cleanMe(d){
  d=d&&typeof d==='object'?d:{};
  const arr=(v,n)=>Array.isArray(v)?v.slice(0,n):[];
  return {cart:arr(d.cart,60).filter(c=>c&&isUuid(c.pid)).map(c=>({pid:c.pid,v:Math.floor(nn(c.v,0,50)),q:Math.floor(nn(c.q,1,99)),later:!!c.later})),
    wish:arr(d.wish,300).filter(isUuid),recent:arr(d.recent,30).filter(isUuid),cpns:arr(d.cpns,100).filter(isUuid),follows:[],
    addrs:arr(d.addrs,12).filter(a=>a&&typeof a==='object').map(a=>({id:okId(a.id)?a.id:rid(),name:str(a.name,80),phone:str(a.phone,20),zone:str(a.zone,6),street:str(a.street,8),bldg:str(a.bldg,8),unit:str(a.unit,20),city:cityOf(a.city).k,note:str(a.note,200),def:!!a.def})),
    seen:d.seen&&typeof d.seen==='object'?{o:nn(d.seen.o,0,9e15),m:nn(d.seen.m,0,9e15),s:nn(d.seen.s,0,9e15)}:{o:0,m:0,s:0},city:typeof d.city==='string'?d.city:'',
    phone:str(d.phone,20),
    costs:d.costs&&typeof d.costs==='object'?Object.fromEntries(Object.entries(d.costs).filter(([k,v])=>isUuid(k)&&Number(v)>=0).slice(0,1000).map(([k,v])=>[k,nn(v,0,1e6)])):{}};
}
function LS_me(){try{return JSON.parse(LS.get('nileplus.me')||'null');}catch(e){return null;}}
async function loadMe(){
  const {data}=await ME.sb.from('user_data').select('doc').eq('user_id',ME.uid).maybeSingle();
  const server=cleanMe(data&&data.doc),local=cleanMe(LS_me());
  // anything added to the cart before signing in joins the account's cart
  local.cart.forEach(c=>{if(!server.cart.some(x=>x.pid===c.pid&&x.v===c.v))server.cart.push(c);});
  ME.doc=server;
  if(ME.doc.city&&CITIES.some(c=>c.k===ME.doc.city))S.city=ME.doc.city;
  if(local.cart.length)saveMe();
}
let meT=0,meBusy=false,meAgain=false;
function saveMe(){
  // signed out: the cart lives on this device; signed in: it lives on the account
  if(!ME.uid||!ME.sb){LS.set('nileplus.me',JSON.stringify(ME.doc));return;}
  LS.set('nileplus.me','null');
  clearTimeout(meT);
  meT=setTimeout(async function go(){
    if(meBusy){meAgain=true;return;}
    meBusy=true;
    try{const {error}=await ME.sb.from('user_data').upsert({user_id:ME.uid,doc:JSON.parse(JSON.stringify(ME.doc)),updated_at:new Date().toISOString()});if(error)throw error;}
    catch(e){console.warn('[NILE+] my data',e);}
    meBusy=false;
    if(meAgain){meAgain=false;go();}
  },600);
}
// someone not signed in keeps their cart on this device
(function(){const d=LS_me();if(d)ME.doc=cleanMe(d);})();

/* ───────── writing ───────── */
const canWrite=()=>!!ME.sb&&!!ME.uid&&!ME.banned;
function guard(){
  if(!ME.sb){toast(L('ما قدرنا نتصل بنيل +. تأكد من الإنترنت.','Couldn’t reach NILE+. Check your connection.'),true);return false;}
  if(!ME.uid){openAuth('in');return false;}
  if(ME.banned){toast(L('حسابك موقوف. تواصل مع إدارة نيل +.','Your account is suspended. Contact NILE+.'),true);return false;}
  return true;
}
function dbErr(e){
  const m=String(e&&(e.message||e.msg||e.code)||'');
  const T={not_allowed:L('ما عندك صلاحية لهذا.','You’re not allowed to do that.'),speed:L('سرعة التوصيل هذي ما تنفع لطلبك أو منطقتك الحين.','That delivery speed isn’t available for this order or area right now.'),
    pay:L('أحد المنتجات ما يقبل الدفع النقدي. اختر البطاقة عند الاستلام.','An item doesn’t accept cash. Choose card on delivery.'),own_product:L('ما تقدر تشتري من متجرك.','You can’t buy from your own shop.'),
    bad_address:L('تأكد من العنوان: رقم جوال قطري من ٨ أرقام، وأرقام المنطقة والشارع والمبنى.','Check the address: an 8-digit Qatar mobile and the zone, street and building numbers.'),
    reason:L('اكتب السبب.','Enter a reason.'),window:L('انتهت مدة الإرجاع لهذا الطلب.','The return window for this order has ended.'),tracking:L('اكتب رقم تتبع صحيح.','Enter a valid tracking number.'),
    carrier:L('اختر شركة الشحن.','Choose the carrier.'),terms:L('لازم توافق على شروط البيع في نيل +.','You need to accept the NILE+ seller terms.'),
    too_many:L('وصلت للحد المسموح. انتظر مراجعة طلباتك السابقة.','You’ve reached the limit. Wait for your earlier requests to be reviewed.'),
    pending_exists:L('عندك طلب ينتظر المراجعة.','You already have a request waiting for review.'),cr_file:L('ارفع صورة أو ملف السجل التجاري.','Upload the commercial registration file.'),
    not_delivered:L('تقدر تقيّم بعد ما يوصلك الطلب.','You can review once your order is delivered.'),own:L('هذا إعلانك أو متجرك.','This is your own ad or shop.'),
    already_set:L('لوحة التحكم لها مالك مسبقًا.','The dashboard already has an owner.'),bad_code:L('رمز الإعداد غير صحيح.','The setup code is wrong.'),
    sign_in:L('سجّل دخولك أول.','Sign in first.'),demo:L('هذا متجر أو إعلان تجريبي للعرض فقط، ما يستقبل طلبات ولا رسائل.','This is a sample shop or ad for display only. It takes no orders or messages.'),state:L('حالته تغيّرت. شوف آخر تحديث.','Its status has changed. See the latest update.'),gone:L('ما عاد موجود.','It no longer exists.')};
  const k=m.split(':')[0];
  if(k==='stock'){const [,n,t]=m.split(':');return L(`الكمية المتوفرة من «${t}» صارت ${num(n)}. عدّل الكمية في السلة.`,`Only ${n} of “${t}” left now. Change the quantity in your cart.`);}
  if(k==='gone'&&m.split(':')[1])return L(`«${m.split(':')[1]}» ما عاد متاح. احذفه من السلة.`,`“${m.split(':')[1]}” is no longer available. Remove it from your cart.`);
  if(T[k])return T[k];
  if(/duplicate key/.test(m))return L('موجود مسبقًا.','Already exists.');
  if(/violates check constraint|invalid input/.test(m))return L('تأكد من البيانات المدخلة.','Check what you entered.');
  if(/JWT|session/i.test(m))return L('انتهت جلستك. سجّل دخولك مرة ثانية.','Your session ended. Please sign in again.');
  return L('ما انحفظ. تأكد من الاتصال وحاول مرة ثانية.','Not saved. Check your connection and try again.');
}
const NAMES={};
async function names(root){
  const els=[...(root||document).querySelectorAll('[data-uid]')];
  const miss=[...new Set(els.map(e=>e.dataset.uid))].filter(id=>isUuid(id)&&!(id in NAMES));
  if(miss.length&&ME.sb){miss.forEach(i=>NAMES[i]='');try{const {data}=await ME.sb.from('profiles').select('id,full_name').in('id',miss);(data||[]).forEach(p=>NAMES[p.id]=p.full_name||'');}catch(e){}}
  els.forEach(e=>{const n=NAMES[e.dataset.uid];if(n&&e.textContent!==n)e.textContent=n;});
}
const who=(id,fallback)=>`<span data-uid="${esc(id)}">${esc(NAMES[id]||fallback||(id===ME.uid?L('أنت','You'):L('عميل نيل +','NILE+ customer')))}</span>`;

/* ───────── stores the viewer runs ───────── */
const myStores=()=>Object.values(D.stores).filter(s=>isMine(s.owner)).sort((a,b)=>(a.sample-b.sample)||(a.createdAt-b.createdAt));
const curStore=()=>{const l=myStores();return l.find(s=>s.id===S.mySid)||l[0]||null;};

/* ───────── cart (private to each person) ───────── */
const cartLines=()=>ME.doc.cart.filter(c=>!c.later);
const count=()=>cartLines().reduce((a,c)=>a+c.q,0);
const lineP=c=>prod(c.pid);
const subtotal=()=>cartLines().reduce((s,c)=>{const p=lineP(c);return s+(p&&visible(p)?p.p*c.q:0);},0);
const couponTotal=()=>cartLines().reduce((s,c)=>{const p=lineP(c);return s+(p&&visible(p)&&p.cpn&&ME.doc.cpns.includes(p.id)?p.cpn*c.q:0);},0);
function addItem(pid,q=1,v){
  const p=prod(pid);if(!p||!visible(p))return false;
  if((store(p.s)||{}).sample){toast(dbErr({message:'demo'}),true);return false;}
  v=v??(S.vsel[pid]??0);
  if(p.stock<1){toast(L('نفدت الكمية','Out of stock'),true);return false;}
  const c=ME.doc.cart.find(x=>x.pid===pid&&x.v===v);
  if(c){c.q=Math.min(p.stock,99,c.q+q);c.later=false;}
  else ME.doc.cart.unshift({pid,v,q:Math.min(p.stock,q),later:false});
  saveMe();return true;
}
function add(pid,q=1){if(addItem(pid,q)){toast(L('تمت الإضافة إلى السلة','Added to cart'));render(true);}}

/* ───────── delivery engine (fees from the admin settings) ───────── */
function heavyP(p){return !!p&&(p.kg>=10);}
function delivery(p,subt){
  const c=city(),h=new Date().getHours(),heavy=heavyP(p),st=S2(),extra=heavy?1:0;
  const std={k:'std',fee:(subt??(p?p.p:0))>=st.freeOver?0:st.std,from:addDays(Math.max(2,c.min+1)+extra),to:addDays(c.max+1+extra)};
  const next={k:'next',fee:st.next,ok:c.min===1&&!heavy,d:addDays(h<22?1:2)};
  const same={k:'same',fee:st.same,ok:c.same&&h<12&&!heavy&&(!p||p.same),d:addDays(0)};
  return {std,next,same,heavy};
}
function cutoff(){const now=new Date(),h=now.getHours();const t=new Date(now);
  if(city().same&&h<12)t.setHours(12,0,0,0);else{t.setHours(22,0,0,0);if(h>=22)t.setDate(t.getDate()+1);}
  const m=Math.max(0,Math.round((t-now)/60000));return L(`${num(Math.floor(m/60))} س ${num(m%60)} د`,`${Math.floor(m/60)} hrs ${m%60} mins`);}

/* ───────── small pieces ───────── */
const priceHTML=p=>`<div class="price"><span class="whole">${num(p.p)}</span><span class="cur">${cur()}</span>${p.o?`<s>${num(p.o)}</s>`:''}</div>`;
const nbadge=`<span class="badge-n">NILE<i>+</i></span>`;
const logo=(s,size=44)=>s?`<span class="slogo" style="width:${size}px;height:${size}px;background:${s.bg};font-size:${Math.round(size*.45)}px">${esc((s.lg[S.ar?0:1]||s.lg[0]||(s.ar||s.en||'+')).slice(0,2))}</span>`:'';
const vbadge=()=>`<span class="vbadge">✔ ${L('بائع موثّق','Verified seller')}</span>`;
// the small “personal” mark on every ad posted by an individual
const pBadge=(cls='')=>`<img class="pbadge ${cls}" src="img/personal.png" alt="${L('إعلان شخصي','Personal ad')}" width="200" height="129" loading="lazy">`;
// the small "sample" tag on demo shops and ads
const demoTag=x=>x&&(x.demo||x.sample)?`<span class="spl">${L('تجريبي','Sample')}</span>`:'';
const samplePill=s=>s&&s.sample?`<span class="spl">${L('متجر تجريبي','Sample store')}</span>`:'';
function pimg(p,i=0,big){
  const id=p&&p.imgs&&p.imgs[i];
  return id?`<img src="${IMG(id)}" alt="${pname(p)}" loading="lazy" decoding="async">`:`<span class="emo${big?' big':''}" aria-hidden="true">${p?p.e:'📦'}</span>`;
}
const imgOf=(img,e)=>img?`<img src="${IMG(img)}" alt="" loading="lazy">`:`<span class="emo" aria-hidden="true">${e||'📦'}</span>`;
function rateRow(pid,small){
  const r=ratingOf(pid);
  if(!r.n)return `<div class="stars nr">${L('لا تقييمات بعد','No ratings yet')}</div>`;
  return `<div class="stars"${small?' style="font-size:12px"':''}>${num(r.avg)} ${stars(r.avg)}<small>(${num(r.n)})</small></div>`;
}
const soldTxt=n=>n?L(`بيع منه ${num(n)}`,`${num(n)} sold`):'';
function card(p){const st=store(p.s),dl=delivery(p),fav=ME.doc.wish.includes(p.id),out=p.stock<1;
  return`<article class="prod">
   <button class="im" data-open="${p.id}" aria-label="${pname(p)}">${pimg(p)}${isBest(p)?`<span class="best">${L('الأكثر مبيعًا','Best seller')}</span>`:''}</button>
   <button class="fav" data-fav="${p.id}" aria-pressed="${fav}" aria-label="${L('قائمة الأمنيات','Wish list')}">${heart(fav)}</button>
   <div class="bd">
     <button class="nm clamp2" data-open="${p.id}">${pname(p)}</button>
     <div class="by muted">${L('من','by')} <button class="lnk" data-store="${p.s}">${sname(st)}</button> ${demoTag(st)}</div>
     ${rateRow(p.id)}
     ${p.sold?`<div class="bought">${soldTxt(p.sold)}</div>`:''}
     ${p.o?`<div class="tags"><span class="off">${L('خصم','-')} ${num(pct(p))}٪</span><span class="lim">${L('عرض','Deal')}</span></div>`:''}
     ${priceHTML(p)}
     ${p.cpn?`<div><span class="cpn">${L(`وفّر ${money(p.cpn)} مع الكوبون`,`Save ${money(p.cpn)} with coupon`)}</span></div>`:''}
     ${out?`<div class="ship redc"><b class="redc">${L('نفدت الكمية','Out of stock')}</b></div>`:`<div class="ship">${ful(st)?nbadge+' ':''}${dl.std.fee?L(`توصيل ${money(dl.std.fee)}`,`${money(dl.std.fee)} delivery`):L('توصيل مجاني','FREE delivery')} <b>${fmtShort(dl.std.from)}</b></div>
     ${dl.same.ok?`<div class="ship">${L('أو اليوم','Or today')} <b>${L('خلال ساعات','within hours')}</b></div>`:dl.next.ok?`<div class="ship">${L('أو أسرع توصيل','Or fastest delivery')} <b>${L('غدًا','Tomorrow')}</b></div>`:''}`}
     <button class="addc" data-add="${p.id}" ${out?'disabled':''}>${out?L('غير متوفر','Unavailable'):L('أضف إلى السلة','Add to cart')}</button>
   </div></article>`;}
const statusPill=s=>`<span class="stp st-${s}">${tx(ST[s])}</span>`;

/* ───────── what's new for this viewer ───────── */
function alerts(){
  const seen=ME.doc.seen||{},out=[];
  Object.values(D.myOrders).forEach(o=>o.tl.forEach(e=>{if(e.by!=='buyer'&&e.at>(seen.o||0))out.push({t:e.at,k:'o',o,e});}));
  Object.values(D.sellOrders).forEach(o=>o.tl.forEach(e=>{if(e.by==='buyer'&&e.at>(seen.s||0))out.push({t:e.at,k:'s',o,e});}));
  Object.values(D.thrB).forEach(t=>t.msgs.forEach(m=>{if(m.seller&&m.at>Math.max(t.seenB,seen.m||0))out.push({t:m.at,k:'m',th:t,m});}));
  Object.values(D.thrS).forEach(t=>t.msgs.forEach(m=>{if(!m.seller&&m.at>Math.max(t.seenS,seen.m||0))out.push({t:m.at,k:'m',th:t,m,seller:true});}));
  return out.sort((a,b)=>b.t-a.t);
}

/* ───────── header, menus, footer ───────── */
function headerBits(){
  const d=document.documentElement;d.dir=S.ar?'rtl':'ltr';d.lang=S.ar?'ar':'en';
  $('#lang').textContent=S.ar?'EN':'عربي';
  $('#hDel1').textContent=L('التوصيل إلى','Deliver to');$('#hDel2').textContent=cityName(city());
  $('#mDel').textContent='📍 '+L(`التوصيل إلى ${cityName(city())}، قطر`,`Deliver to ${cityName(city())}, Qatar`);
  $('#hAcc1').textContent=ME.uid?L('مرحبًا،','Hello,'):L('مرحبًا، سجّل الدخول','Hello, sign in');
  $('#hAcc2').innerHTML=ME.uid?`<span data-uid="${esc(ME.uid)}">${esc(ME.name||L('حسابك','your account'))}</span>`:L('الحساب والقوائم','Account & Lists');
  $('#hOrd1').textContent=L('المرتجعات','Returns');$('#hOrd2').textContent=L('والطلبات','& Orders');
  $('#hCart').textContent=L('السلة','Cart');$('#cnt').textContent=num(count());
  const na=alerts().length;$('#bn').textContent=na?num(na):'';$('#bell').setAttribute('aria-label',L(`التنبيهات (${num(na)})`,`Notifications (${na})`));
  $('#q').placeholder=$('#mq').placeholder=L('ابحث في نيل +','Search NILE+');
  $('#scat').innerHTML=Object.keys(CATS).map(k=>`<option value="${k}" ${k===S.cat?'selected':''}>${k==='all'?L('الكل','All'):cname(k)}</option>`).join('');
  $('#sub').innerHTML=`<button class="all" data-act="menu">☰ ${L('الكل','All')}</button>`+
   [[L('عروض اليوم','Today’s Deals'),'deals','hot'],[L('المتاجر','Stores'),'stores'],[L('الأكثر مبيعًا','Best Sellers'),'bestsellers'],[L('إعلانات الأفراد','Classifieds'),'ads'],[L('أعلن عن غرض','Post an ad'),'postad','hot'],[L('طلباتك','Your Orders'),'orders'],
    ...Object.keys(CATS).filter(k=>k!=='all').map(k=>[cname(k),'c:'+k]),[L('خدمة العملاء','Customer Service'),'help'],[L('بِع على نيل +','Sell on NILE+'),'sell'],...(ME.owner?[[L('لوحة التحكم','Dashboard'),'admin','hot']]:[])]
   .map(([l,a,c])=>`<button data-act="${a}" class="${c||''}">${l}</button>`).join('');
  $('#totop').textContent=L('العودة إلى الأعلى','Back to top');
  $('#fcols').innerHTML=[[L('تعرّف علينا','Get to know us'),[[L('المتاجر','Stores'),'stores'],[L('الأكثر مبيعًا','Best sellers'),'bestsellers'],[L('عروض اليوم','Today’s deals'),'deals']]],
   [L('اربح معنا','Make money with us'),[[L('سجّل شركتك','Register your company'),'newStore'],[L('أعلن عن غرض','Post an ad'),'postad'],[L('مركز البائع','Seller Center'),'sell']]],
   [L('حسابك','Your account'),[[L('طلباتك','Your orders'),'orders'],[L('عناوينك','Your addresses'),'addrs'],[L('قائمة الأمنيات','Wish list'),'wish'],[L('الرسائل','Messages'),'inbox']]],
   [L('دعنا نساعدك','Let us help you'),[[L('الشحن والتوصيل','Shipping & delivery'),'help'],[L('الإرجاع والاستبدال','Returns & exchanges'),'help'],[L('خدمة العملاء','Customer service'),'help']]]]
   .map(([h,l])=>`<div><h3>${h}</h3><ul>${l.map(([x,a])=>`<li><button class="flink" data-act="${a}">${x}</button></li>`).join('')}</ul></div>`).join('');
  $('#fcopy').textContent=L('© ٢٠٢٦ نيل +. سوق إلكتروني في قطر.','© 2026 NILE+. An online marketplace in Qatar.');
  const n=count(),v=S.view;
  $('#mbar').innerHTML=[[L('الرئيسية','Home'),'home','M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z',v==='home'||v==='results'],
    [L('المتاجر','Stores'),'stores','M4 9 5.5 4h13L20 9M4 9h16v11H4zM9 20v-6h6v6',v==='stores'||v==='store'],
    [L('حسابي','Account'),'account','M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0',['account','orders','order','addrs','inbox','thread','done'].includes(v)],
    [L('السلة','Cart'),'cart','M2 4h3l3 12h11l2-8H6',false],[L('القائمة','Menu'),'menu','M4 6h16M4 12h16M4 18h16',false]]
   .map(([l,a,d,on])=>`<button data-act="${a}" aria-current="${on}">${a==='cart'?`<span class="n">${num(n)}</span>`:''}<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="${d}"/></svg>${l}</button>`).join('');
  const rb=$('#robar');
  if(ME.offline){rb.hidden=false;rb.innerHTML=`<div class="wrap">${L('ما قدرنا نتصل بنيل +. تأكد من الإنترنت وحدّث الصفحة.','Couldn’t reach NILE+. Check your connection and refresh.')}</div>`;}
  else if(ME.banned){rb.hidden=false;rb.innerHTML=`<div class="wrap">${L('حسابك موقوف. تقدر تتصفح فقط.','Your account is suspended. You can browse only.')}</div>`;}
  else rb.hidden=true;
}

/* ───────── review before publishing (shown to the post's owner) ───────── */
const modPill=x=>({pending:`<span class="stp st-placed">🔍 ${L('قيد المراجعة','Under review')}</span>`,flagged:`<span class="stp st-return_req">⚠ ${L('يحتاج تعديل','Needs changes')}</span>`,
  rejected:`<span class="stp st-cancelled">✖ ${L('مرفوض','Rejected')}</span>`,approved:''})[x.mod]||'';
function modBox(x,kind){
  if(x.mod==='approved')return'';
  const t={pending:kind==='ad'?L('إعلانك قيد المراجعة الآلية. نتأكد إنه مناسب وإن سعره واقعي، وعادةً تخلص خلال دقائق.','Your ad is being reviewed automatically for suitability and a realistic price. This usually takes minutes.')
      :L('المنتج قيد المراجعة الآلية للتأكد إن المنشور واضح وصريح. عادةً تخلص خلال دقائق.','This product is being reviewed automatically to make sure the listing is clear and accurate. This usually takes minutes.'),
    flagged:kind==='ad'?L('المراجعة لقت ملاحظات، وإدارة نيل + بتراجع الإعلان بنفسها:','The review found issues, and NILE+ will check the ad itself:')
      :L('المراجعة لقت ملاحظات. عدّل المنتج حسبها ويرجع للمراجعة تلقائيًا:','The review found issues. Fix them and the product is reviewed again automatically:'),
    rejected:L('رفضت إدارة نيل + هذا المنشور:','NILE+ rejected this post:')}[x.mod];
  return`<div class="modbox m-${x.mod}"><b>${t}</b>${x.modWhy.length?`<ul>${x.modWhy.map(r=>`<li dir="auto">${esc(r)}</li>`).join('')}</ul>`:''}</div>`;
}

/* ───────── home ───────── */
function emptyMarket(){
  const loading=ME.live&&!(D.loaded.products&&D.loaded.stores);
  return `<div class="wrap"><section class="panel empty-m">${loading?`<p class="muted">${L('جاري تحميل المتجر…','Loading the store…')}</p>`:
   `<h2>${L('ما فيه منتجات معروضة للحين','No products listed yet')}</h2><p class="muted">${L('أول متجر يفتح وينشر منتجاته يظهر هنا لكل اللي يفتحون نيل +.','The first store to open and list products shows up here for everyone on NILE+.')}</p>
    <button class="btn red" style="width:auto" data-act="newStore">${L('سجّل شركتك','Register your company')}</button> <button class="btn out" style="width:auto" data-act="postad">${L('أعلن عن غرض','Post an ad')}</button>`}</section></div>`;
}
function vHome(){
  const ps=allProds();
  if(!ps.length)return heroHTML()+`<div class="wrap">${midBanners()}</div>`+emptyMarket()+`<div class="wrap">${adsRail()}</div>`;
  const byCat=k=>ps.filter(p=>p.c===k).sort((a,b)=>b.sold-a.sold);
  const top=[...ps].sort((a,b)=>(b.sold-a.sold)||(b.createdAt-a.createdAt));
  const stores=Object.values(D.stores).filter(s=>storeLive(s)&&storeProds(s.id).length).sort((a,b)=>(storeRating(b.id).n-storeRating(a.id).n)||(storeProds(b.id).length-storeProds(a.id).length));
  const cats=Object.keys(CATS).filter(k=>k!=='all'&&byCat(k).length);
  const pick4=l=>l.slice(0,4);
  const box1=[L('تسوّق حسب الفئة','Shop by category'),cats.slice(0,4).map(k=>['c',k]),L('شاهد المزيد','See more'),'c:all'];
  const homeL=pick4(byCat('home').length?byCat('home'):top);
  const box2=[L('جدّد مساحتك','Refresh your space'),homeL.map(p=>['p',p.id]),L('تسوّق الآن','Shop now'),'c:home'];
  const elec=pick4(byCat('electronics').length?byCat('electronics'):top.slice(4));
  const box3=[L('الأكثر مبيعًا في الإلكترونيات','Top picks in electronics'),elec.map(p=>['p',p.id]),L('شاهد المزيد','See more'),'c:electronics'];
  const box4=[L('متاجر مميزة','Featured stores'),stores.slice(0,4).map(s=>['s',s.id]),L('كل المتاجر','All stores'),'stores'];
  const boxes=[box1,box2,box3,box4].filter(b=>b[1].length);
  const deals=ps.filter(p=>p.o).sort((a,b)=>pct(b)-pct(a));
  const recent=ME.doc.recent.map(prod).filter(visible).slice(0,12);
  return heroHTML()+`<div class="wrap">
   <section class="cards">${boxes.map(([h,items,more,a])=>`<div class="box"><h2>${h}</h2><div class="quad">${items.map(([t,k])=>{
     if(t==='c'){const p1=byCat(k)[0];return`<button class="qi" data-act="c:${k}"><div class="im">${p1&&p1.imgs[0]?pimg(p1):`<span class="emo">${CATS[k][2]}</span>`}</div><span>${cname(k)}</span></button>`;}
     if(t==='s'){const s=store(k);return`<button class="qi" data-store="${k}"><div class="im">${logo(s,56)}</div><span>${sname(s)}</span></button>`;}
     const p=prod(k);return`<button class="qi" data-open="${k}"><div class="im">${pimg(p)}</div><span class="clamp2">${tx(p.sub[0]||p.sub[1]?p.sub:[cname(p.c),cname(p.c)])}</span></button>`;}).join('')}</div>
     <button class="lnk more" data-act="${a}">${more}</button></div>`).join('')}</section>
   ${midBanners()}
   ${recent.length?`<section class="panel"><div class="ph"><h2>${L('شاهدتها مؤخرًا','Your browsing history')}</h2></div><div class="rail">${recent.map(railItem).join('')}</div></section>`:''}
   ${deals.length?`<section class="panel" id="dealsP"><div class="ph"><h2>${L('عروض اليوم','Today’s Deals')}</h2><button class="lnk" data-act="dealsAll">${L('شاهد كل العروض','See all deals')}</button></div>
     <div class="rail">${deals.map(p=>`<button class="deal" data-open="${p.id}"><div class="im">${pimg(p)}</div><div class="tags"><span class="off">${L('خصم','-')} ${num(pct(p))}٪</span><span class="lim">${L('عرض','Deal')}</span></div>${priceHTML(p)}<div class="clamp2" style="font-size:13px">${pname(p)}</div></button>`).join('')}</div></section>`:''}
   ${stores.length?`<section class="panel"><div class="ph"><h2>${L('تسوّق من المتاجر','Shop by store')}</h2><button class="lnk" data-act="stores">${L('كل المتاجر','See all stores')}</button></div>
     <div class="rail">${stores.map(s=>{const r=storeRating(s.id);return`<button class="stile" data-store="${s.id}">${logo(s,60)}<b>${sname(s)}</b>${r.n?`<span class="stars" style="font-size:12px">${num(r.avg)} ★ <small>(${num(r.n)})</small></span>`:`<span class="muted" style="font-size:12px">${L('متجر جديد','New store')}</span>`}<span class="muted" style="font-size:12px">${num(storeProds(s.id).length)} ${L('منتج','products')}</span></button>`;}).join('')}</div></section>`:''}
   ${adsRail()}
   <section class="panel"><div class="ph"><h2>${L('اخترناها لك','Picked for you')}</h2></div><div class="grid">${top.slice(0,40).map(card).join('')}</div></section>
   </div>`;
}
/* ───────── advertising banners (run by NILE+ from the dashboard) ───────── */
const runningBanners=place=>D.banners.filter(b=>b.on&&b.place===place&&b.from<=Date.now()&&b.to>Date.now());
const bannerImg=(b,eager)=>`<img src="${IMG(b.img)}" alt="${esc(b.t||b.by||L('إعلان','Advertisement'))}" ${eager?'':'loading="lazy"'} decoding="async">`;
function bannerHero(B){
  S.slide%=B.length;
  return`<section class="hero bhero" aria-label="${L('إعلانات','Advertisements')}">${B.map((b,i)=>`<button class="slide" aria-hidden="${i!==S.slide}" data-banner="${b.id}">${bannerImg(b,i===0)}<span class="adtag">${L('إعلان','Ad')}</span></button>`).join('')}
   ${B.length>1?`<button class="arrow prev" data-act="prev" aria-label="${L('السابق','previous')}">‹</button><button class="arrow next" data-act="next" aria-label="${L('التالي','next')}">›</button>
   <div class="dots">${B.map((b,i)=>`<i class="${i===S.slide?'on':''}"></i>`).join('')}</div>`:''}</section>`;
}
function midBanners(){
  const B=runningBanners('mid').slice(0,2);
  return B.length?`<section class="mbanners n${B.length}">${B.map(b=>`<button class="mbn" data-banner="${b.id}">${bannerImg(b)}<span class="adtag">${L('إعلان','Ad')}</span></button>`).join('')}</section>`:'';
}
function openBanner(id){
  const b=D.banners.find(x=>x.id===id);if(!b)return;
  if(ME.sb)ME.sb.rpc('banner_click',{p_id:id}).then(()=>{},()=>{});
  const [k,v]=b.link.split(/:(.+)/);
  if(k==='p'&&isUuid(v))go('product',{pid:v,img:0});else if(k==='s'&&isUuid(v))go('store',{sid:v,stab:'home'});else if(k==='ad'&&isUuid(v))go('ad',{adId:v,img:0});
  else if(/^https:\/\//.test(b.link))window.open(b.link,'_blank','noopener');
}
function heroHTML(){
  const B=runningBanners('hero');if(B.length)return bannerHero(B);

  const SL=[['s1',L('عروض الموسم','Season deals'),L('خصومات على الإلكترونيات','Deals on electronics'),L('سماعات، مكبرات صوت وأجهزة ذكية','Headphones, speakers and smart devices'),'🎧','c:electronics'],
   ['s2',L('المتاجر','Stores'),L('تسوّق من متاجر قطرية','Shop Qatari stores'),L('كل متجر له صفحة وتقييمات حقيقية من المشترين','Every store has its own page and real buyer reviews'),'🏬','stores'],
   ['s3',L('المنزل','Home'),L('جدّد بيتك بأسعار أقل','Refresh your home for less'),L('إضاءة، أكواب وأدوات يومية','Lighting, cups and everyday essentials'),'🛋️','c:home']];
  return `<section class="hero">${SL.map(([cl,k,h,p,e,a],i)=>`<div class="slide ${cl}" aria-hidden="${i!==S.slide}" data-act="${a}"><div class="txt"><span class="kick">${k}</span><h1>${h}</h1><p>${p}</p></div><div class="art">${e}</div></div>`).join('')}
   <button class="arrow prev" data-act="prev" aria-label="${L('السابق','previous')}" style="color:${S.slide===2?'#111':'#fff'}">‹</button><button class="arrow next" data-act="next" aria-label="${L('التالي','next')}" style="color:${S.slide===2?'#111':'#fff'}">›</button></section>`;
}
const railItem=x=>`<button class="deal" data-open="${x.id}"><div class="im">${pimg(x)}</div><div class="clamp2" style="font-size:13px">${pname(x)}</div>${rateRow(x.id,true)}${priceHTML(x)}</button>`;

/* ───────── results ───────── */
function hay(p){const s=store(p.s);return `${p.ar} ${p.en} ${cname(p.c)} ${CATS[p.c].join(' ')} ${s?s.ar+' '+s.en:''} ${p.sub.join(' ')} ${p.model}`.toLowerCase();}
function filtered(){
  const q=S.q.toLowerCase().trim(),words=q.split(/\s+/).filter(Boolean);
  let l=allProds().filter(p=>(S.cat==='all'||p.c===S.cat)&&(!words.length||words.every(w=>hay(p).includes(w)))
   &&(!S.fav||ME.doc.wish.includes(p.id))&&(!S.minR||ratingOf(p.id).avg>=S.minR)&&(!S.storeF||p.s===S.storeF)&&(!S.dealsOnly||p.o)&&(!S.fastOnly||delivery(p).next.ok||delivery(p).same.ok));
  if(S.price){const[a,b]=S.price.split('-').map(Number);l=l.filter(p=>p.p>=a&&p.p<=b);}
  const so={low:(a,b)=>a.p-b.p,high:(a,b)=>b.p-a.p,rate:(a,b)=>ratingOf(b.id).avg-ratingOf(a.id).avg,new:(a,b)=>b.createdAt-a.createdAt,feat:(a,b)=>(b.sold-a.sold)||(b.createdAt-a.createdAt)}[S.sort]||((a,b)=>0);
  return l.sort(so);
}
function vResults(){
  const l=filtered();
  const title=S.fav?L('قائمة الأمنيات','Your wish list'):S.dealsOnly?L('عروض اليوم','Today’s Deals'):S.q?`"${esc(S.q)}"`:cname(S.cat);
  const f=(lab,act,on)=>`<button data-act="${act}" aria-pressed="${on}">${lab}</button>`;
  const prices=[['0-100',L('حتى ١٠٠','Up to 100')],['100-250',L('١٠٠ إلى ٢٥٠','100 to 250')],['250-99999',L('٢٥٠ فأكثر','250 & above')]];
  const stores=Object.values(D.stores).filter(s=>storeLive(s)&&storeProds(s.id).length);
  return`<div class="resbar"><div class="wrap"><span class="tn">${L(`${num(l.length)} نتيجة لـ`,`${l.length} results for`)} <b class="redc">${title}</b></span>
    <label>${L('ترتيب حسب:','Sort by:')} <select id="sort">${[['feat',L('الأكثر مبيعًا','Best selling')],['low',L('السعر: من الأقل','Price: low to high')],['high',L('السعر: من الأعلى','Price: high to low')],['rate',L('متوسط التقييم','Avg. rating')],['new',L('الأحدث','Newest')]].map(([k,t])=>`<option value="${k}" ${S.sort===k?'selected':''}>${t}</option>`).join('')}</select></label></div></div>
   <div class="wrap res">
    <aside class="side-f">
     <div><h4>${L('التوصيل','Delivery')}</h4>${f('⚡ '+L('توصيل اليوم أو غدًا','Today or tomorrow'),'fast',S.fastOnly)}${f(L('عروض فقط','Deals only'),'dealsOnly',S.dealsOnly)}</div>
     <div><h4>${L('القسم','Department')}</h4>${Object.keys(CATS).map(k=>f(cname(k),'c:'+k,S.cat===k)).join('')}</div>
     <div><h4>${L('تقييم العملاء','Customer reviews')}</h4>${[4,3].map(r=>f(`<span class="stars">${stars(r)}</span> ${L('فأعلى','& up')}`,'minR:'+r,S.minR===r)).join('')}${S.minR?f(L('مسح','Clear'),'minR:0',false):''}</div>
     <div><h4>${L('السعر','Price')} (${cur()})</h4>${prices.map(([k,t])=>f(t,'price:'+k,S.price===k)).join('')}${S.price?f(L('مسح','Clear'),'price:',false):''}</div>
     ${stores.length?`<div><h4>${L('المتجر','Store')}</h4>${stores.map(s=>f(sname(s),'storeF:'+s.id,S.storeF===s.id)).join('')}${S.storeF?f(L('كل المتاجر','All stores'),'storeF:',false):''}</div>`:''}
    </aside>
    <section style="min-width:0">
     <div class="mchips">${[['fast','⚡ '+L('اليوم/غدًا','Fast'),S.fastOnly],['dealsOnly',L('عروض','Deals'),S.dealsOnly],['minR:'+(S.minR?0:4),'★ '+num(4)+'+',S.minR===4],['price:'+(S.price?'':'0-100'),L('حتى ١٠٠','≤100'),!!S.price]].map(([a,t,on])=>`<button class="chip" data-act="${a}" aria-pressed="${on}">${t}</button>`).join('')}
      ${Object.keys(CATS).map(k=>`<button class="chip" data-act="c:${k}" aria-pressed="${S.cat===k}">${cname(k)}</button>`).join('')}</div>
     <div style="background:var(--white);padding:14px;margin-top:10px"><div class="grid">${l.length?l.map(card).join(''):`<div class="empty">${S.fav?L('قائمة أمنياتك فاضية. اضغط ♡ على أي منتج تبي ترجع له.','Your wish list is empty. Tap ♡ on any product to save it.'):L('لا توجد منتجات مطابقة. جرّب تغيير الفلاتر.','No results. Try changing the filters.')}</div>`}</div></div>
    </section></div>`;
}

/* ───────── product page ───────── */
function vProduct(){
  const p=prod(S.pid);
  if(!p||!visible(p))return`<div class="wrap"><section class="panel empty-m"><h2>${L('المنتج غير متوفر','This product isn’t available')}</h2><p class="muted">${L('يمكن البائع حذفه أو أوقف عرضه.','The seller may have removed or paused it.')}</p><button class="btn red" style="width:auto" data-act="home">${L('تابع التسوق','Continue shopping')}</button></section></div>`;
  const st=store(p.s),dl=delivery(p),vi=Math.min(S.vsel[p.id]??0,p.v.o.length-1),vo=p.v.o[vi];
  const imgs=p.imgs.length?p.imgs.map((id,i)=>[i]):[[0]];
  const low=p.stock<=5,out=p.stock<1;
  const rr=ratingOf(p.id),srr=storeRating(p.s);
  // bought together: real co-purchase counts kept on each product
  const fbtIds=Object.entries(p.co||{}).filter(([id,n])=>Number(n)>0&&visible(prod(id))).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]);
  const fbt=fbtIds.length?[p,...fbtIds.map(prod)]:[];
  const fbtSum=fbt.reduce((s,x)=>s+x.p,0);
  const others=p.model?allProds().filter(x=>x.id!==p.id&&x.s!==p.s&&x.model&&x.model.toLowerCase()===p.model.toLowerCase()):[];
  const revs=Object.values(D.reviews).filter(r=>r.pid===p.id&&(!S.revF||r.r===S.revF)).sort((a,b)=>(b.hv.length-a.hv.length)||(b.at-a.at));
  const qa=Object.values(D.questions).filter(q=>q.pid===p.id).sort((a,b)=>(b.ans.length-a.ans.length)||(b.at-a.at));
  const rank=bestIn(p);
  const fav=ME.doc.wish.includes(p.id);
  const rows=[[L('العلامة / المتجر','Brand / store'),sname(st)],[L('رقم الموديل','Model number'),esc(p.model)],[tx(p.v.t),tx([vo.ar,vo.en])],[L('الأبعاد','Dimensions'),tx(p.dim)],[L('الوزن','Weight'),esc(p.w)],[L('الخامة','Material'),tx(p.mat)],
    [L('الضمان','Warranty'),p.war?L(`${p.war>1?num(p.war)+' سنوات':'سنة واحدة'} من المتجر`,`${p.war} year${p.war>1?'s':''} from the store`):L('لا يوجد','None')],[L('بلد المنشأ','Country of origin'),tx(p.org)]].filter(r=>r[1]&&r[1]!=='');
  const rows2=[[L('رقم المنتج في نيل +','NILE+ item number'),'NP-'+esc(p.id.toUpperCase().slice(0,8))],[L('تاريخ أول توفر','Date first available'),p.createdAt?new Date(p.createdAt).toLocaleDateString(S.ar?'ar-EG':'en-GB',{day:'numeric',month:'long',year:'numeric'}):''],
    [L('ترتيب الأكثر مبيعًا','Best Sellers Rank'),rank?L(`#${num(rank)} في ${cname(p.c)}`,`#${rank} in ${cname(p.c)}`):L('لا مبيعات بعد','No sales yet')],[L('تقييم العملاء','Customer reviews'),rr.n?`${num(rr.avg)} ${stars(rr.avg)} (${num(rr.n)})`:L('لا تقييمات بعد','No ratings yet')],
    [L('الشحن من','Ships from'),ful(st)?L('مستودع نيل +، الدوحة','NILE+ warehouse, Doha'):`${sname(st)}، ${cityName(cityOf(st&&st.city))}`],[L('المخزون','Stock'),num(p.stock)]].filter(r=>r[1]);
  const c=city(),stt=S2();
  const regionRows=CITIES.map(ct=>{const st2=ct.min+1,en2=ct.max+1;return`<tr class="${ct.k===S.city?'cur':''}"><td>${cityName(ct)}${ct.k===S.city?' 📍':''}</td>
    <td>${L(`${num(st2)}–${num(en2)} أيام`,`${st2}–${en2} days`)} · ${p.p>=stt.freeOver?L('مجاني','FREE'):money(stt.std)}</td>
    <td>${ct.min===1&&!dl.heavy?L(`غدًا · ${money(stt.next)}`,`Tomorrow · ${money(stt.next)}`):'—'}</td>
    <td>${ct.same&&p.same&&!dl.heavy?L(`قبل ١٢ ظهرًا · ${money(stt.same)}`,`Before 12 pm · ${money(stt.same)}`):'—'}</td></tr>`;}).join('');
  const qMax=Math.min(10,p.stock);
  const canRev=deliveredFor(p.id).length>0;
  return`<div class="pdp-wrap"><div class="wrap">
   <nav class="crumb"><button class="lnk" data-act="c:${p.c}">${cname(p.c)}</button>${p.sub[0]||p.sub[1]?`›<span>${tx(p.sub)}</span>`:''}</nav>
   <div class="pdp">
    <div class="gal">
      ${p.imgs.length>1?`<div class="thumbs">${p.imgs.map((id,i)=>`<button data-img="${i}" aria-pressed="${S.img===i}" aria-label="${L('صورة','Image')} ${num(i+1)}"><img src="${IMG(id)}" alt="" loading="lazy"></button>`).join('')}</div>`:''}
      <div class="mainim">${pimg(p,Math.min(S.img,Math.max(0,p.imgs.length-1)),true)}${p.imgs.length?'':`<small>${L('لم يرفع البائع صورًا بعد','The seller hasn’t added photos yet')}</small>`}</div>
    </div>
    <div style="min-width:0">
      <button class="lnk" data-store="${p.s}" style="font-size:13.5px">${L(`زيارة متجر ${sname(st)}`,`Visit the ${sname(st)} Store`)}</button>
      <h1 class="ptitle">${pname(p)}</h1>
      <div class="rrow">${rr.n?`<b class="tn">${num(rr.avg)}</b><span class="stars">${stars(rr.avg)}</span><button class="lnk tn" data-act="toReviews">${L(`${num(rr.n)} تقييم`,`${rr.n} ratings`)}</button>`:`<button class="lnk" data-act="toReviews">${L('لا تقييمات بعد','No ratings yet')}</button>`}<span class="muted">|</span><button class="lnk" data-act="toQA">${qa.length?L(`${num(qa.length)} سؤال`,`${qa.length} questions`):L('اسأل عن المنتج','Ask a question')}</button></div>
      ${p.sold?`<div class="bought" style="margin-top:4px">${soldTxt(p.sold)}</div>`:''}
      ${isBest(p)?`<div class="bsb"><span>${L('#١ الأكثر مبيعًا','#1 Best Seller')}</span><span class="lnk">${L('في ','in ')}${cname(p.c)}</span></div>`:''}
      <hr class="s">
      ${p.o?`<div class="lim" style="margin-bottom:4px">${L('عرض','Deal')}</div>`:''}
      <div class="pbig">${p.o?`<span class="disc tn">-${num(pct(p))}٪</span>`:''}<span class="whole">${num(p.p)}</span><span class="cur">${cur()}</span></div>
      ${p.o?`<div class="listp">${L('السعر السابق:','List price:')} <s class="tn">${money(p.o)}</s></div>`:''}
      <div class="listp">${L('الأسعار في قطر لا تشمل ضريبة قيمة مضافة.','No VAT applies in Qatar.')}</div>
      ${p.cpn?`<label class="cbox"><span class="ct">${L('كوبون','Coupon')}</span><input type="checkbox" id="cpn" ${ME.doc.cpns.includes(p.id)?'checked':''} style="accent-color:var(--red)"> ${ME.doc.cpns.includes(p.id)?`<span class="okc">${L(`تم تطبيق كوبون ${money(p.cpn)} عند الدفع`,`${money(p.cpn)} coupon applied at checkout`)}</span>`:L(`فعّل كوبون بقيمة ${money(p.cpn)}`,`Apply ${money(p.cpn)} coupon`)}</label>`:''}
      ${p.v.o.length>1||(p.v.o[0]&&p.v.o[0].ar!=='قياسي')?`<div class="vars"><div class="lab">${tx(p.v.t)}: <b>${tx([vo.ar,vo.en])}</b></div>
        <div class="opts">${p.v.o.map((o,i)=>`<button class="opt" data-var="${i}" aria-pressed="${vi===i}">${o.hex?`<span class="sw" style="background:${o.hex}"></span>`:''}${tx([o.ar,o.en])}</button>`).join('')}</div></div>`:''}
      <div class="feats">
        <div><i>↩️</i>${L(`إرجاع خلال ${num(st?st.ret:15)} يوم`,`${st?st.ret:15}-day returns`)}</div>
        <div><i>🔒</i>${L('دفع عند الاستلام','Pay on delivery')}</div>
        <div><i>🚚</i>${ful(st)?L('يشحنه نيل +','Shipped by NILE+'):L('يشحنه البائع','Seller-shipped')}</div>
        <div><i>🛡️</i>${p.war?L(`ضمان ${p.war>1?num(p.war)+' سنوات':'سنة'}`,`${p.war}-yr warranty`):L('بدون ضمان','No warranty')}</div>
        <div><i>💵</i>${p.cod?L('نقدًا أو بالبطاقة','Cash or card'):L('بطاقة عند الاستلام','Card on delivery')}</div>
      </div>
      ${p.b.length?`<hr class="s"><div class="about"><h3>${L('حول هذا المنتج','About this item')}</h3><ul>${p.b.map(x=>`<li>${tx(x)}</li>`).join('')}</ul></div>`:''}
    </div>
    <aside class="bb">
      <div class="pbig"><span class="whole" style="font-size:28px">${num(p.p)}</span><span class="cur">${cur()}</span></div>
      ${out?'':`<div class="dl">${dl.std.fee?L(`توصيل <b>${money(dl.std.fee)}</b>`,`<b>${money(dl.std.fee)}</b> delivery`):L('<b>توصيل مجاني</b>','<b>FREE delivery</b>')} ${fmtD(dl.std.from)}${+dl.std.to!==+dl.std.from?' – '+fmtShort(dl.std.to):''}${dl.std.fee?`<div class="muted" style="font-size:12.5px">${L(`مجاني للطلبات فوق ${money(stt.freeOver)}`,`FREE on orders over ${money(stt.freeOver)}`)}</div>`:''}</div>
      ${dl.same.ok?`<div class="dl">${L('أو <b>توصيل اليوم</b>','Or <b>same-day delivery</b>')} ${L('بـ','for')} ${money(stt.same)}. ${L('اطلب خلال','Order within')} <b class="okc">${cutoff()}</b></div>`:dl.next.ok?`<div class="dl">${L('أو أسرع توصيل <b>غدًا</b>','Or fastest delivery <b>tomorrow</b>')} ${fmtShort(dl.next.d)} ${L('بـ','for')} ${money(stt.next)}. ${L('اطلب خلال','Order within')} <b class="okc">${cutoff()}</b></div>`:''}`}
      <button class="lnk loc" data-act="city">📍 ${L(`التوصيل إلى ${cityName(c)}، قطر — تغيير`,`Deliver to ${cityName(c)}, Qatar — change`)}</button>
      <div class="stk ${out||low?'redc':'okc'}">${out?L('نفدت الكمية حاليًا','Currently out of stock'):low?L(`باقي ${num(p.stock)} فقط - اطلب قريبًا`,`Only ${p.stock} left in stock - order soon`):L('متوفر','In stock')}</div>
      ${st&&st.sample?`<div class="note" style="margin:0">${demoTag(st)} ${L('متجر تجريبي للعرض فقط، ما يستقبل طلبات.','A sample store for display only. It takes no orders.')}</div>`:''}
      ${out||(st&&st.sample)?'':`<label>${L('الكمية:','Qty:')} <select id="pq">${Array.from({length:qMax},(_,i)=>`<option value="${i+1}" ${S.qty===i+1?'selected':''}>${num(i+1)}</option>`).join('')}</select></label>
      <button class="btn red" data-addq="${p.id}">${L('أضف إلى السلة','Add to cart')}</button>
      <button class="btn blk" data-buy="${p.id}">${L('اشترِ الآن','Buy now')}</button>`}
      <dl class="kv">
        <dt>${L('الشحن من','Ships from')}</dt><dd>${ful(st)?'NILE+':sname(st)}</dd>
        <dt>${L('البائع','Sold by')}</dt><dd><button class="lnk" data-store="${p.s}">${sname(st)}</button>${verified(st)?' ✔':''}</dd>
        <dt>${L('الإرجاع','Returns')}</dt><dd>${L(`مؤهل للإرجاع خلال ${num(st?st.ret:15)} يوم من الاستلام`,`Eligible for return within ${st?st.ret:15} days of receipt`)}</dd>
        <dt>${L('الدفع','Payment')}</dt><dd>${L('عند الاستلام، بعد ما تشوف الطلب','On delivery, after you see your order')}</dd>
      </dl>
      <label class="chk"><input type="checkbox" id="gift" ${S.gift?'checked':''}> ${L(`أضف تغليف هدية (+${money(stt.gift)})`,`Add a gift wrap (+${money(stt.gift)})`)}</label>
      <hr class="s" style="margin:4px 0">
      <button class="btn out" data-fav="${p.id}">${fav?'♥ '+L('في قائمة الأمنيات','In your wish list'):L('أضف إلى قائمة الأمنيات','Add to wish list')}</button>
      ${others.length?`<button class="lnk" data-act="toOffers" style="font-size:13px">${L(`عروض أخرى من ${num(others.length)} بائع ابتداءً من ${money(Math.min(...others.map(o=>o.p)))}`,`Other sellers: ${others.length} from ${money(Math.min(...others.map(o=>o.p)))}`)}</button>`:''}
      ${isMine(p.owner)?`<button class="btn out" data-edit="${p.id}">✎ ${L('تعديل المنتج','Edit product')}</button>`:''}
    </aside>
   </div>

   ${fbt.length>1?`<section class="sec2"><h2>${L('يُشترى معه عادةً','Frequently bought together')}</h2>
    <div class="fbt">${fbt.map((x,i)=>`${i?'<span class="plus">+</span>':''}<div class="it"><button class="im" data-open="${x.id}">${pimg(x)}</button><span class="clamp2">${i===0?`<b>${L('هذا المنتج: ','This item: ')}</b>`:''}${pname(x)}</span><b class="tn">${money(x.p)}</b></div>`).join('')}
     <div class="sum"><div>${L('السعر الإجمالي:','Total price:')} <b class="redc tn" style="font-size:18px">${money(fbtSum)}</b></div><button class="btn red" data-fbt="${fbt.map(x=>x.id).join(',')}">${L(`أضف الـ${num(fbt.length)} إلى السلة`,`Add all ${fbt.length} to cart`)}</button></div></div></section>`:''}

   ${others.length?`<section class="sec2" id="offersS"><h2>${L('عروض أخرى على نيل +','Other sellers on NILE+')}</h2>
     ${[p,...others].map(x=>{const s2=store(x.s),r2=storeRating(x.s);return`<div class="offer"><div><div class="pp tn">${money(x.p)}</div><div class="muted" style="font-size:12.5px">${ful(s2)?L('يشحنه نيل +','Shipped by NILE+'):L('يشحنه البائع','Seller-shipped')} · ${x.stock?L(`المخزون ${num(x.stock)}`,`${x.stock} in stock`):L('نفدت','Out of stock')}</div></div>
       <div style="font-size:13px">${L('البائع:','Sold by:')} <button class="lnk" data-store="${x.s}">${sname(s2)}</button>${r2.n?`<div class="stars" style="font-size:12px">${stars(r2.avg)} <small>${num(r2.pos)}٪ ${L('تقييم إيجابي','positive')}</small></div>`:''}</div>
       ${x.id===p.id?`<span class="muted" style="font-size:12px">${L('هذا العرض','This offer')}</span>`:`<button class="btn red" style="width:auto" data-open="${x.id}">${L('شوف العرض','View offer')}</button>`}</div>`;}).join('')}</section>`:''}

   ${rows.length||rows2.length?`<section class="sec2"><h2>${L('معلومات المنتج','Product information')}</h2>
    <div class="two"><div><h3>${L('التفاصيل الفنية','Technical details')}</h3><div class="tbl-wrap"><table class="spec">${rows.map(([a,b])=>`<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</table></div></div>
     <div><h3>${L('معلومات إضافية','Additional information')}</h3><div class="tbl-wrap"><table class="spec">${rows2.map(([a,b])=>`<tr><th>${a}</th><td>${b}</td></tr>`).join('')}</table></div></div></div></section>`:''}

   <section class="sec2"><h2>${L('الشحن والتوصيل','Shipping & delivery')}</h2>
    <div class="tbl-wrap"><table class="shipt"><tr><th>${L('المنطقة','Area')}</th><th>${L('توصيل عادي','Standard')}</th><th>${L('توصيل غدًا','Next day')}</th><th>${L('توصيل اليوم','Same day')}</th></tr>${regionRows}</table></div>
    <div class="note">${L(`التوصيل العادي مجاني للطلبات فوق ${money(stt.freeOver)}، وتحتها ${money(stt.std)}. طلبات توصيل الغد تُستقبل حتى ١٠ مساءً، وتوصيل اليوم داخل الدوحة للطلبات قبل ١٢ ظهرًا. الدفع عند الاستلام برسوم ${money(stt.cod)}، نقدًا${p.cod?' أو':' غير متاح لهذا المنتج، ويُقبل'} بالبطاقة عبر جهاز المندوب. التوصيل من السبت إلى الخميس، ٩ صباحًا – ١٠ مساءً، ويتصل بك المندوب قبل الوصول.`,
      `Standard delivery is FREE over ${money(stt.freeOver)}, otherwise ${money(stt.std)}. Next-day orders are accepted until 10 pm; same-day delivery in Doha for orders before 12 pm. Pay on delivery for ${money(stt.cod)}: ${p.cod?'cash or':'cash isn’t accepted for this item, only'} card on the courier’s terminal. Deliveries run Saturday–Thursday, 9 am – 10 pm, and the courier calls before arriving.`)}</div>
    ${dl.heavy?`<div class="note">${L('منتج ثقيل: يضاف يوم إضافي على مدة التوصيل، والتوصيل حتى باب المنزل في الدور الأرضي.','Heavy item: one extra day is added to delivery, delivered to the ground floor.')}</div>`:''}</section>

   <section class="sec2"><h2>${L('الإرجاع والضمان','Returns & warranty')}</h2>
    <div class="two"><div><h3>${L('سياسة الإرجاع','Return policy')}</h3><ul style="margin:0;padding-inline-start:20px;display:flex;flex-direction:column;gap:6px">
      <li>${L(`إرجاع خلال ${num(st?st.ret:15)} يوم من تاريخ الاستلام، من صفحة الطلب.`,`Return within ${st?st.ret:15} days of delivery, from the order page.`)}</li>
      <li>${L('يجب أن يكون المنتج بحالته الأصلية ومع العلبة وكل الملحقات.','Item must be in original condition with box and accessories.')}</li>
      <li>${L('بعد ما يستلم المتجر المرتجع، يرجع لك المبلغ ويتحدّث الطلب عندك.','Once the store receives the return, it refunds you and your order updates.')}</li>
      ${p.c==='beauty'?`<li>${L('منتجات العناية لا تُرجع بعد فتحها لأسباب صحية.','Opened beauty products cannot be returned for hygiene reasons.')}</li>`:''}</ul></div>
     <div><h3>${L('الضمان','Warranty')}</h3><p style="margin:0">${p.war?L(`ضمان ${p.war>1?num(p.war)+' سنوات':'سنة'} من ${sname(st)} ضد عيوب التصنيع. يشمل الإصلاح أو الاستبدال، ولا يشمل الكسر أو سوء الاستخدام.`,`${p.war}-year warranty from ${sname(st)} against manufacturing defects, covering repair or replacement but not damage or misuse.`):L('هذا المنتج لا يشمله ضمان، لكن يمكنك إرجاعه حسب سياسة الإرجاع.','No warranty on this item, but it can be returned under the return policy.')}</p></div></div></section>

   ${st?`<section class="sec2"><h2>${L('من المتجر','From the store')}</h2>
    <div class="storecard">${logo(st,64)}<div style="flex:1;min-width:200px"><b style="font-size:17px">${sname(st)}</b> ${verified(st)?vbadge():''} ${samplePill(st)}
      ${srr.n?`<div class="stars" style="font-size:13px">${stars(srr.avg)} <small>${L(`${num(srr.pos)}٪ تقييم إيجابي · ${num(srr.n)} تقييم`,`${srr.pos}% positive · ${srr.n} ratings`)}</small></div>`:`<div class="muted" style="font-size:12.5px">${L('ما فيه تقييمات للمتجر بعد','No store ratings yet')}</div>`}
      <div class="muted" style="font-size:13px">${tx(st.d)}</div>
      <div class="muted" style="font-size:12.5px;margin-top:4px">${L(`يرد ${RESP.find(r=>r[0]===st.resp)[1]} · على نيل + منذ ${num(st.since)}`,`Responds ${RESP.find(r=>r[0]===st.resp)[2]} · On NILE+ since ${st.since}`)}</div></div>
      <div style="display:flex;flex-direction:column;gap:8px;min-width:150px"><button class="btn blk" data-store="${st.id}">${L('زيارة المتجر','Visit store')}</button><button class="btn out" data-follow="${st.id}">${following(st.id)?'✓ '+L('تتابعه','Following'):L('متابعة','Follow')}</button>${isMine(st.owner)?'':`<button class="btn out" data-chat="${st.id}" data-pid="${p.id}">${L('راسل البائع','Message seller')}</button>`}</div></div></section>`:''}

   <section class="sec2"><h2>${L('منتجات مرتبطة','Related products')}</h2><div class="rail">${allProds().filter(x=>x.id!==p.id&&(x.c===p.c||x.s===p.s)).concat(allProds().filter(x=>x.c!==p.c&&x.s!==p.s)).slice(0,10).map(railItem).join('')||`<span class="muted">${L('ما فيه منتجات أخرى بعد.','No other products yet.')}</span>`}</div></section>

   <section class="sec2" id="revS"><div class="revs">
    <div><h2 style="font-size:21px;margin:0">${L('تقييمات العملاء','Customer reviews')}</h2>
      ${rr.n?`<div class="rrow" style="margin-top:6px"><span class="stars" style="font-size:18px">${stars(rr.avg)}</span><b>${L(`${num(rr.avg)} من ٥`,`${rr.avg} out of 5`)}</b></div>
      <div class="muted tn">${L(`${num(rr.n)} تقييم`,`${rr.n} ratings`)}</div>
      <div class="hist">${rr.dist.map((v,i)=>`<button data-revf="${5-i}" aria-pressed="${S.revF===5-i}"><span>${L(`${num(5-i)} نجوم`,`${5-i} star`)}</span><span class="b"><i style="width:${v}%"></i></span><span class="tn">${num(v)}٪</span></button>`).join('')}</div>
      ${S.revF?`<button class="lnk" data-revf="0" style="margin-top:8px">${L('عرض كل التقييمات','Show all reviews')}</button>`:''}`:`<p class="muted">${L('ما أحد قيّم هذا المنتج للحين.','No one has reviewed this product yet.')}</p>`}
      <hr class="s"><h3 style="font-size:16px;margin:0 0 4px">${L('قيّم هذا المنتج','Review this product')}</h3><p class="muted" style="margin:0 0 10px;font-size:13px">${canRev?L('شارك رأيك مع العملاء الآخرين','Share your thoughts with other customers'):L('تقدر تقيّم بعد ما يوصلك طلب فيه هذا المنتج، عشان كل التقييمات من مشترين حقيقيين.','You can review once an order with this item is delivered, so every review comes from a real buyer.')}</p>
      ${canRev?`<button class="btn out" data-act="writeRev">${myReview(p.id)?L('عدّل تقييمك','Edit your review'):L('اكتب تقييمك','Write a customer review')}</button>`:''}</div>
    <div><h3 style="font-size:17px;margin:0 0 4px">${L('أحدث التقييمات','Top reviews')}</h3>
      ${revs.length?revs.map(r=>`<div class="rev"><div class="who"><span class="av">👤</span>${who(r.by)}</div>
        <h4><span class="stars">${stars(r.r)}</span> ${esc(r.t)}</h4>
        <div class="meta">${L(`بتاريخ ${fmtShort(new Date(r.at))}`,`Reviewed on ${fmtShort(new Date(r.at))}`)}</div>
        <div class="meta">${r.vl[0]||r.vl[1]?`${tx(p.v.t)}: ${tx(r.vl)} | `:''}<span class="vp">${L('شراء موثّق','Verified Purchase')}</span></div>
        <p dir="auto">${esc(r.b)}</p>
        ${r.reply?`<div class="reply"><b>${L('رد البائع:','Seller’s reply:')}</b> ${esc(r.reply)}</div>`:''}
        <div class="helpful"><span class="tn">${r.hv.length?L(`${num(r.hv.length)} شخص وجدوا هذا مفيدًا`,`${r.hv.length} people found this helpful`):''}</span>${r.by!==ME.uid?`<button data-help="${r.id}">${r.hv.includes(ME.uid)?'✓ '+L('شكرًا لك','Thank you'):L('مفيد','Helpful')}</button>`:''}${isMine(st&&st.owner)?`<button class="lnk" data-reply="${r.id}">${r.reply?L('عدّل ردك','Edit reply'):L('رد على التقييم','Reply')}</button>`:''}<button class="lnk" data-report="review:${r.id}">${L('إبلاغ','Report')}</button></div></div>`).join(''):`<p class="muted">${rr.n?L('لا توجد تقييمات بهذا العدد من النجوم.','No reviews with this rating.'):''}</p>`}</div></div></section>

   <section class="sec2" id="qaS"><h2>${L('أسئلة وأجوبة العملاء','Customer questions & answers')}</h2>
    ${qa.length?qa.map(q=>`<div class="qa"><b>${L('سؤال:','Q:')}</b><div><b>${esc(q.q)}</b><div class="muted" style="font-size:12px">${who(q.by)} · ${ago(q.at)}</div></div>
      <span>${L('جواب:','A:')}</span><div>${q.ans.length?q.ans.map(a=>`<div class="ans">${esc(a.t)}<div class="muted" style="font-size:12px">${a.seller?L(`من ${sname(st)}`,`By ${sname(st)}`):who(a.by)} · ${ago(a.at)}</div></div>`).join(''):`<span class="muted">${L('ما فيه جواب للحين.','No answer yet.')}</span>`}
      <button class="lnk" data-answer="${q.id}" style="font-size:12.5px">${L('أجب على السؤال','Answer this question')}</button></div></div>`).join(''):`<p class="muted">${L('ما فيه أسئلة للحين. اسأل البائع أو العملاء عن أي تفصيل.','No questions yet. Ask the seller or other customers about any detail.')}</p>`}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn out" style="width:auto" data-act="ask">${L('اطرح سؤالًا','Ask a question')}</button><button class="btn out" style="width:auto" data-report="product:${p.id}">${L('إبلاغ عن المنتج','Report this product')}</button></div></section>
  </div></div>`;
}

/* ───────── stores ───────── */
function vStores(){
  const list=Object.values(D.stores).filter(s=>storeLive(s)&&(S.storeCat==='all'||storeProds(s.id).some(p=>p.c===S.storeCat))).sort((a,b)=>storeProds(b.id).length-storeProds(a.id).length);
  return`<div class="wrap"><section class="panel"><div class="ph"><h2>${L('المتاجر على نيل +','Stores on NILE+')}</h2><span class="muted">${L(`${num(list.length)} متجر`,`${list.length} stores`)}</span></div>
   <p class="muted" style="margin:-4px 0 12px">${L('كل متجر له صفحة خاصة فيها منتجاته وتقييماته وسياسة الشحن والإرجاع. علامة «بائع موثّق» تعني إن إدارة نيل + تحققت من سجله التجاري.','Every store has its own page with products, ratings and shipping and return policies. “Verified seller” means NILE+ checked its commercial registration.')}</p>
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">${Object.keys(CATS).map(k=>`<button class="chip" data-scat="${k}" aria-pressed="${S.storeCat===k}">${cname(k)}</button>`).join('')}</div>
   ${list.length?`<div class="sgrid">${list.map(s=>{const pc=storeProds(s.id),r=storeRating(s.id);return`<button class="scard" data-store="${s.id}">
     <div class="tp">${logo(s,54)}<div style="min-width:0"><b style="font-size:16px">${sname(s)}</b><div>${verified(s)?vbadge():`<span class="muted" style="font-size:11.5px">${L('لم يُوثّق بعد','Not verified yet')}</span>`} ${samplePill(s)}</div>
     ${r.n?`<div class="stars" style="font-size:12.5px">${stars(r.avg)} <small>(${num(r.n)})</small></div>`:''}</div></div>
     <div class="muted clamp2" style="font-size:13px">${tx(s.d)}</div>
     <div class="sstats"><div><b>${r.n?num(r.pos)+'٪':'—'}</b>${L('إيجابي','positive')}</div><div><b>${num(followers(s.id))}</b>${L('متابع','followers')}</div><div><b>${num(pc.length)}</b>${L('منتج','products')}</div></div>
     <div style="display:flex;gap:6px;flex-wrap:wrap;font-size:12px">${ful(s)?`${nbadge} ${L('يشحنه نيل +','Shipped by NILE+')}`:`<span class="muted">🚚 ${L('يشحنه البائع','Seller-shipped')}</span>`} <span class="muted">· 📍 ${cityName(cityOf(s.city))}</span></div>
     <div style="display:flex;gap:4px">${pc.slice(0,4).map(p=>`<span class="mini">${pimg(p)}</span>`).join('')}</div>
   </button>`;}).join('')}</div>`:`<div class="empty">${L('ما فيه متاجر في هذا القسم للحين.','No stores in this department yet.')}</div>`}
   <div class="note" style="margin-top:16px">${L('عندك منتجات تبي تبيعها؟ افتح متجرك على نيل + واوصل لعملاء في كل قطر.','Have products to sell? Open your store on NILE+ and reach customers across Qatar.')} <button class="lnk" data-act="sell">${L('ابدأ البيع','Start selling')}</button></div>
  </section></div>`;
}
function vStore(){
  const s=store(S.sid);
  if(!s||!storeLive(s))return`<div class="wrap"><section class="panel empty-m"><h2>${L('المتجر غير متاح','This store isn’t available')}</h2><button class="btn red" style="width:auto" data-act="stores">${L('كل المتاجر','All stores')}</button></section></div>`;
  const pc=storeProds(s.id),ct=cityOf(s.city),r=storeRating(s.id),tab=S.stab;
  const tabs=[['home',L('الرئيسية','Home')],['all',L(`كل المنتجات (${num(pc.length)})`,`All products (${pc.length})`)],['reviews',L('تقييمات المتجر','Store ratings')],['about',L('عن المتجر','About')]];
  let body='';
  if(tab==='home'){const deals=pc.filter(p=>p.o);
    body=`${deals.length?`<section class="panel"><div class="ph"><h2>${L('عروض المتجر','Store deals')}</h2></div><div class="grid">${deals.map(card).join('')}</div></section>`:''}
     <section class="panel"><div class="ph"><h2>${L('الأكثر مبيعًا في المتجر','Store best sellers')}</h2></div>${pc.length?`<div class="grid">${[...pc].sort((a,b)=>b.sold-a.sold).map(card).join('')}</div>`:`<p class="muted">${L('ما عرض المتجر منتجات للحين.','This store hasn’t listed products yet.')}</p>`}</section>`;}
  if(tab==='all')body=`<section class="panel">${pc.length?`<div class="grid">${pc.map(card).join('')}</div>`:`<p class="muted">${L('ما عرض المتجر منتجات للحين.','This store hasn’t listed products yet.')}</p>`}</section>`;
  if(tab==='reviews'){const rs=Object.values(D.reviews).filter(x=>x.s===s.id).sort((a,b)=>b.at-a.at);
    body=`<section class="panel"><div class="revs"><div>${r.n?`<div class="rrow"><span class="stars" style="font-size:18px">${stars(r.avg)}</span><b>${L(`${num(r.avg)} من ٥`,`${r.avg} out of 5`)}</b></div>
      <div class="muted tn">${L(`${num(r.n)} تقييم · ${num(r.pos)}٪ إيجابي`,`${r.n} ratings · ${r.pos}% positive`)}</div>
      <div class="hist">${r.dist.map((v,i)=>`<button><span>${L(`${num(5-i)} نجوم`,`${5-i} star`)}</span><span class="b"><i style="width:${v}%"></i></span><span class="tn">${num(v)}٪</span></button>`).join('')}</div>`:`<p class="muted">${L('ما فيه تقييمات للحين. التقييمات تجي من المشترين بعد ما توصلهم طلباتهم.','No ratings yet. Ratings come from buyers after their orders arrive.')}</p>`}</div>
      <div>${rs.map(x=>{const pp=prod(x.pid);return`<div class="rev"><span class="stars">${stars(x.r)}</span> <b>${esc(x.t)}</b><p dir="auto">${esc(x.b)}</p><div class="meta">${who(x.by)} · ${fmtShort(new Date(x.at))}${pp?` · <button class="lnk" data-open="${pp.id}">${pname(pp)}</button>`:''}</div></div>`;}).join('')}</div></div></section>`;}
  if(tab==='about')body=`<section class="panel"><div class="two">
     <div><h3>${L('عن المتجر','About the store')}</h3><p style="margin:0 0 10px">${tx(s.d)}</p>
      <dl class="kv" style="font-size:13.5px"><dt>${L('الموقع','Location')}</dt><dd>${cityName(ct)}، ${L('قطر','Qatar')}</dd><dt>${L('على نيل + منذ','On NILE+ since')}</dt><dd>${num(s.since)}</dd>
      <dt>${L('وقت الرد','Response time')}</dt><dd>${tx(RESP.find(x=>x[0]===s.resp).slice(1))}</dd><dt>${L('السجل التجاري','Commercial reg.')}</dt><dd>${verified(s)?L('تم التحقق ✔','Verified ✔'):s.cr?L('قيد المراجعة','Under review'):L('غير مضاف','Not provided')}</dd>
      ${s.phone?`<dt>${L('رقم التواصل','Contact')}</dt><dd class="tn sel" dir="ltr" style="text-align:start">${esc(s.phone)}</dd>`:''}</dl></div>
     <div><h3>${L('سياسة الشحن','Shipping policy')}</h3><p style="margin:0 0 10px">${ful(s)?L('منتجات هذا المتجر مخزّنة في مستودع نيل + بالدوحة، ويتم شحنها بخدمة نيل + مع توصيل غدًا وتوصيل اليوم داخل الدوحة.','This store’s items are stored in the NILE+ warehouse in Doha and ship with NILE+ delivery, including next-day and same-day in Doha.'):L(`يشحن المتجر الطلبات بنفسه من ${cityName(ct)} خلال ٢٤ ساعة من الطلب، والتوصيل خلال ٢–٤ أيام حسب المنطقة.`,`The store ships orders itself from ${cityName(ct)} within 24 hours; delivery takes 2–4 days by area.`)}</p>
      <h3>${L('سياسة الإرجاع','Return policy')}</h3><p style="margin:0">${L(`إرجاع خلال ${num(s.ret)} يوم من الاستلام، تطلبه من صفحة الطلب.`,`Return within ${s.ret} days of delivery, requested from the order page.`)}</p></div></div></section>`;
  const r0=r.n?`<span class="stars">${stars(r.avg)} <small>(${num(r.n)})</small></span>`:`<span class="muted">${L('متجر جديد','New store')}</span>`;
  return`<div class="shero" style="background:linear-gradient(120deg,var(--black) 0%,#3a0a0d 55%,${s.bg} 100%)"><div class="wrap" style="height:100%;display:flex;align-items:center"><div style="max-width:520px"><div class="kick" style="background:var(--red)">${L('متجر على نيل +','Store on NILE+')}</div><h2 style="font-size:clamp(22px,4vw,34px);margin:8px 0 0">${esc((S.ar?s.d[0]||s.d[1]:s.d[1]||s.d[0]).split(/[.،,]/)[0].slice(0,80))}</h2></div></div><span class="big-e">${s.e}</span></div>
   <div class="shead"><div class="wrap">${logo(s,92)}<div style="min-width:0"><h1>${sname(s)}</h1><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:13px">${verified(s)?vbadge():''}${samplePill(s)}${r0}<span class="muted">${L(`${num(followers(s.id))} متابع`,`${followers(s.id)} followers`)}</span></div></div>
    <div class="acts">${isMine(s.owner)?`<button class="btn blk" style="width:auto" data-act="sell">${L('إدارة المتجر','Manage store')}</button>`:`<button class="btn ${following(s.id)?'out':'red'}" style="width:auto" data-follow="${s.id}">${following(s.id)?'✓ '+L('تتابعه','Following'):'+ '+L('متابعة','Follow')}</button><button class="btn out" style="width:auto" data-chat="${s.id}">${L('تواصل مع البائع','Contact seller')}</button>`}<button class="btn out" style="width:auto" data-report="store:${s.id}">${L('إبلاغ','Report')}</button></div></div></div>
   <div class="tabs"><div class="wrap" style="display:flex;gap:4px">${tabs.map(([k,l])=>`<button data-stab="${k}" aria-selected="${tab===k}">${l}</button>`).join('')}</div></div>
   <div class="wrap"><div class="kpis"><div><b>${r.n?num(r.pos)+'٪':'—'}</b>${L('تقييم إيجابي','positive ratings')}</div><div><b>${tx(RESP.find(x=>x[0]===s.resp).slice(1))}</b>${L('وقت الرد','response time')}</div><div><b>${num(s.ret)} ${L('يوم','days')}</b>${L('للإرجاع','to return')}</div><div><b>${ful(s)?'NILE+':L('البائع','Seller')}</b>${L('جهة الشحن','ships via')}</div><div><b>${num(pc.reduce((a,p)=>a+p.sold,0))}</b>${L('قطعة مباعة','units sold')}</div></div>${body}</div>`;
}

/* ───────── checkout ───────── */
function checkoutCalc(){
  const st=S2();
  const items=cartLines().map(c=>({c,p:lineP(c)})).filter(x=>x.p&&visible(x.p));
  const sub=items.reduce((s,x)=>s+x.p.p*x.c.q,0),cp=items.reduce((s,x)=>s+(x.p.cpn&&ME.doc.cpns.includes(x.p.id)?x.p.cpn*x.c.q:0),0),c=city();
  const anyHeavy=items.some(x=>heavyP(x.p)),allSame=items.every(x=>x.p.same),anyNoCash=items.some(x=>!x.p.cod);
  const d=delivery(null,sub);
  const opts=[{k:'std',fee:sub>=st.freeOver?0:st.std,ok:true,when:`${fmtD(d.std.from)} – ${fmtShort(addDays(c.max+1+(anyHeavy?1:0)))}`,lab:L('توصيل عادي','Standard delivery')},
    {k:'next',fee:st.next,ok:c.min===1&&!anyHeavy,when:fmtD(d.next.d),lab:L('توصيل غدًا','Next-day delivery')},
    {k:'same',fee:st.same,ok:c.same&&new Date().getHours()<12&&!anyHeavy&&allSame,when:L('اليوم قبل ١٠ مساءً','Today by 10 pm'),lab:L('توصيل اليوم','Same-day delivery')}];
  if(!(opts.find(o=>o.k===S.speed)||{}).ok)S.speed='std';
  if(anyNoCash&&S.pay==='cod')S.pay='cardod';
  const sp=opts.find(o=>o.k===S.speed),gift=S.gift?st.gift:0,codf=st.cod;
  const groups={};items.forEach(x=>{(groups[x.p.s]=groups[x.p.s]||[]).push(x);});
  return{items,sub,cp,opts,sp,gift,cod:codf,anyNoCash,groups,total:Math.max(0,sub-cp)+sp.fee+gift+codf};
}
const addrLine=a=>L(`${esc(a.name)} · <span dir="ltr">${esc(a.phone)}</span><br>منطقة ${esc(a.zone)}، شارع ${esc(a.street)}، مبنى ${esc(a.bldg)}${a.unit?`، ${esc(a.unit)}`:''}<br>${cityName(cityOf(a.city))}، قطر${a.note?`<br><span class="muted">${esc(a.note)}</span>`:''}`,
  `${esc(a.name)} · <span dir="ltr">${esc(a.phone)}</span><br>Zone ${esc(a.zone)}, Street ${esc(a.street)}, Building ${esc(a.bldg)}${a.unit?`, ${esc(a.unit)}`:''}<br>${cityName(cityOf(a.city))}, Qatar${a.note?`<br><span class="muted">${esc(a.note)}</span>`:''}`);
function vCheckout(){
  if(!count())return`<div class="wrap"><section class="panel" style="text-align:center"><h2>${L('سلتك فارغة','Your cart is empty')}</h2><button class="btn red" style="width:auto" data-act="home">${L('تابع التسوق','Continue shopping')}</button></section></div>`;
  const k=checkoutCalc(),addrs=ME.doc.addrs;
  if(!S.addr||!addrs.some(a=>a.id===S.addr))S.addr=(addrs.find(a=>a.def)||addrs[0]||{}).id||null;
  const ro=!canWrite();
  return`<div class="wrap"><div class="co"><div>
   ${ro?`<div class="note" style="margin:0 0 14px">${L('سجّل دخولك عشان تأكد الطلب. سلتك تبقى محفوظة.','Sign in to place your order. Your cart stays saved.')} <button class="lnk" data-act="signin">${L('تسجيل الدخول','Sign in')}</button></div>`:''}
   <div class="step"><h2><i>١</i>${L('عنوان التوصيل','Delivery address')}</h2>
     ${addrs.length?addrs.map(a=>`<label class="rc"><input type="radio" name="addr" value="${a.id}" ${S.addr===a.id?'checked':''}><div class="rt addr">${addrLine(a)}</div></label>`).join(''):`<p class="muted" style="margin:0 0 8px">${L('أضف عنوانك بأرقام اللوحة الزرقاء (المنطقة والشارع والمبنى).','Add your address using the blue plate numbers (zone, street and building).')}</p>`}
     <button class="btn out" style="width:auto" data-act="addAddr">+ ${L('إضافة عنوان جديد','Add a new address')}</button></div>
   <div class="step"><h2><i>٢</i>${L('سرعة التوصيل','Delivery speed')}</h2>
     ${k.opts.map(o=>`<label class="rc ${o.ok?'':'dis'}"><input type="radio" name="speed" value="${o.k}" ${S.speed===o.k?'checked':''} ${o.ok?'':'disabled'}><div class="rt"><b>${o.lab}</b><div class="muted" style="font-size:13px">${o.ok?o.when:L('غير متاح لهذا الطلب أو منطقتك أو الوقت الحالي','Not available for this order, your area or right now')}</div></div><span class="rp tn">${o.fee?money(o.fee):L('مجاني','FREE')}</span></label>`).join('')}</div>
   <div class="step"><h2><i>٣</i>${L('طريقة الدفع','Payment method')}</h2>
     ${[['cod',L('نقدًا عند الاستلام','Cash on delivery'),L(`تدفع للمندوب نقدًا · رسوم ${money(k.cod)}`,`Pay the courier in cash · ${money(k.cod)} fee`),!k.anyNoCash],['cardod',L('بطاقة عند الاستلام','Card on delivery'),L(`المندوب معه جهاز دفع للبطاقات · رسوم ${money(k.cod)}`,`The courier brings a card terminal · ${money(k.cod)} fee`),true]]
      .map(([v,t,d,ok])=>`<label class="rc ${ok?'':'dis'}"><input type="radio" name="pay" value="${v}" ${S.pay===v?'checked':''} ${ok?'':'disabled'}><div class="rt"><b>${t}</b><div class="muted" style="font-size:13px">${ok?d:L('غير متاح لأن أحد المنتجات ما يقبل الدفع النقدي','Unavailable: an item doesn’t accept cash')}</div></div></label>`).join('')}
     <p class="muted" style="font-size:12.5px;margin:4px 0 0">${L('ما تدفع شيء الحين. تدفع لما يوصلك الطلب وتشوفه.','You pay nothing now. You pay when the order arrives and you’ve seen it.')}</p></div>
   <div class="step"><h2><i>٤</i>${L('راجع المنتجات','Review items')}</h2>
     ${Object.entries(k.groups).map(([sid,xs])=>{const st=store(sid);return`<div class="grp"><div class="muted" style="font-size:12.5px">${L('شحنة من','Shipment from')} <b>${sname(st)}</b> · ${ful(st)?L('يشحنه نيل +','Shipped by NILE+'):L('يشحنه البائع','Seller-shipped')}</div>
      ${xs.map(({c,p})=>`<div class="oi"><span class="e">${pimg(p)}</span><div style="flex:1;min-width:0;font-size:13px"><b class="clamp2">${pname(p)}</b>
       <div class="muted">${tx(p.v.t)}: ${tx([p.v.o[c.v]?.ar,p.v.o[c.v]?.en])} · ${L('الكمية','Qty')}: ${num(c.q)}${p.stock<c.q?` · <b class="redc">${L(`المتوفر ${num(p.stock)} بس`,`Only ${p.stock} left`)}</b>`:''}</div></div><b class="tn">${money(p.p*c.q)}</b></div>`).join('')}</div>`;}).join('')}
     <label class="chk" style="margin-top:8px"><input type="checkbox" id="gift2" ${S.gift?'checked':''}> ${L(`تغليف الطلب كهدية (+${money(S2().gift)})`,`Gift-wrap this order (+${money(S2().gift)})`)}</label>
     <div class="fld" style="margin-top:10px"><label for="onote">${L('ملاحظة للمتجر (اختياري)','Note for the store (optional)')}</label><input class="inp" id="onote" maxlength="200" value="${esc(S.note||'')}"></div></div>
  </div>
  <aside class="osum"><button class="btn red" data-act="place" ${S.busy||(!ro&&!S.addr)?'disabled':''}>${S.busy?L('جاري تأكيد الطلب…','Placing your order…'):L('تأكيد الطلب','Place your order')}</button>
   ${!S.addr?`<p class="err" style="margin:0">${L('أضف عنوان التوصيل أول.','Add a delivery address first.')}</p>`:''}
   ${S.err?`<p class="err" role="alert" style="margin:0">${esc(S.err)}</p>`:''}
   <p class="muted" style="font-size:12px;margin:0">${L('بتأكيد الطلب أنت توافق على سياسة الإرجاع والتوصيل في نيل +.','By placing your order you agree to the NILE+ returns and delivery policy.')}</p>
   <h3 style="margin:6px 0 2px;font-size:17px">${L('ملخص الطلب','Order summary')}</h3>
   <div class="ln"><span>${L(`المنتجات (${num(count())})`,`Items (${count()})`)}</span><span>${money(k.sub)}</span></div>
   <div class="ln"><span>${L('التوصيل','Delivery')}</span><span>${k.sp.fee?money(k.sp.fee):L('مجاني','FREE')}</span></div>
   ${k.cp?`<div class="ln okc"><span>${L('الكوبونات','Coupons')}</span><span>-${money(k.cp)}</span></div>`:''}
   ${k.gift?`<div class="ln"><span>${L('تغليف هدية','Gift wrap')}</span><span>${money(k.gift)}</span></div>`:''}
   <div class="ln"><span>${L('رسوم الدفع عند الاستلام','Pay-on-delivery fee')}</span><span>${money(k.cod)}</span></div>
   <div class="ln tot"><span>${L('الإجمالي','Order total')}</span><span>${money(k.total)}</span></div>
   ${Object.keys(k.groups).length>1?`<p class="muted" style="font-size:12px;margin:0">${L(`طلبك يوصل في ${num(Object.keys(k.groups).length)} شحنات من متاجر مختلفة. رسوم التوصيل والدفع تنحسب مرة وحدة.`,`Your order arrives in ${Object.keys(k.groups).length} shipments from different stores. Delivery and payment fees are charged once.`)}</p>`:''}
  </aside></div></div>`;
}
// place the order: the server checks prices, stock and fees and writes one order per shop
async function placeOrder(){
  if(!guard()||S.busy)return;
  const k=checkoutCalc(),addr=ME.doc.addrs.find(a=>a.id===S.addr);
  if(!addr){S.err=L('أضف عنوان التوصيل أول.','Add a delivery address first.');return render(true);}
  if(!k.items.length)return;
  S.busy=true;S.err='';render(true);
  try{
    const r=await rpc('place_order',{p_items:k.items.map(({c,p})=>({pid:p.id,v:c.v,q:c.q,c:!!(p.cpn&&ME.doc.cpns.includes(p.id))})),
      p_addr:{name:addr.name,phone:addr.phone,zone:addr.zone,street:addr.street,bldg:addr.bldg,unit:addr.unit,city:addr.city,note:addr.note},
      p_speed:k.sp.k,p_pay:S.pay,p_gift:!!S.gift,p_note:str(S.note,200)});
    const bought=new Set(k.items.map(x=>x.p.id));
    ME.doc.cart=ME.doc.cart.filter(c=>c.later||!bought.has(c.pid));
    ME.doc.cpns=ME.doc.cpns.filter(id=>!bought.has(id));
    saveMe();
    S.busy=false;S.gift=false;S.note='';S.lastGroup=r&&r.grp;
    await loadMine();loadCatalog();
    go('done');
  }catch(e){S.busy=false;S.err=dbErr(e);render(true);}
}
function vDone(){
  const os=Object.values(D.myOrders).filter(o=>o.grp===S.lastGroup).sort((a,b)=>a.createdAt-b.createdAt);
  return`<div class="wrap"><section class="panel"><h2 class="okc" style="margin:0 0 6px">✓ ${L('تم تأكيد طلبك، شكرًا لك!','Order placed, thank you!')}</h2>
   <p style="margin:0 0 12px">${L('المتجر وصله طلبك الحين. تقدر تتابع كل خطوة من «طلباتك»، ويوصلك تنبيه أول ما يتجهّز ويُشحن.','The store has your order now. Follow every step in “Your orders”; you’ll get a notification when it’s packed and shipped.')}</p>
   ${os.length?os.map(orderCard).join(''):`<p class="muted">${L('جاري تحميل الطلب…','Loading your order…')}</p>`}
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn red" style="width:auto" data-act="orders">${L('عرض كل الطلبات','View all orders')}</button><button class="btn out" style="width:auto" data-act="home">${L('تابع التسوق','Continue shopping')}</button></div></section></div>`;
}

/* ───────── orders ───────── */
function tracker(o){
  if(o.status==='cancelled')return `<div class="note">${L('تم إلغاء هذا الطلب.','This order was cancelled.')}${o.reason?' '+esc(o.reason):''}</div>`;
  const idx=['return_req','returned','refunded','return_rej'].includes(o.status)?4:STEP_KEYS.indexOf(o.status);
  const at=k=>{const e=o.tl.find(x=>x.s===k);return e?fmtShort(new Date(e.at)):'';};
  return`<div class="tracker">${STEP_KEYS.map((s,i)=>`<div class="${i<=idx?'on':''}"><i>${i<=idx?'✓':num(i+1)}</i>${tx(ST[s])}<small class="muted">${at(s)}</small></div>`).join('')}</div>`;
}
const etaTxt=o=>o.status==='delivered'||['return_req','returned','refunded','return_rej'].includes(o.status)?tx(ST[o.status]):o.status==='cancelled'?tx(ST.cancelled):L(`الوصول المتوقع: ${fmtD(new Date(o.eta))}`,`Arriving: ${fmtD(new Date(o.eta))}`);
function orderCard(o){
  const st=store(o.s);
  return`<div class="ocard"><div class="oh"><div>${L('تاريخ الطلب','Order placed')}<b>${fmtShort(new Date(o.createdAt))}</b></div><div>${L('الإجمالي','Total')}<b class="tn">${money(o.total)}</b></div><div>${L('التوصيل إلى','Ship to')}<b>${esc(o.addr.name)}</b></div><div style="margin-inline-start:auto">${L('رقم الطلب','Order #')}<b class="tn" dir="ltr">${esc(o.no)}</b></div></div>
  <div class="ob"><div class="orow"><b style="font-size:17px">${etaTxt(o)}</b>${statusPill(o.status)}</div>
   ${o.trk&&o.trk.no?`<div class="muted" style="font-size:13px">${L('شركة الشحن:','Carrier:')} ${tx(CARRIERS.find(c=>c[0]===o.trk.c).slice(1))} · ${L('رقم التتبع:','Tracking #:')} <span class="tn sel" dir="ltr">${esc(o.trk.no)}</span></div>`:''}
   ${tracker(o)}
   ${o.items.map(it=>{const p=prod(it.pid);return`<div class="oi"><span class="e">${imgOf(it.img,it.e)}</span><div style="flex:1;min-width:0;font-size:13px">${p?`<button class="lnk clamp2" data-open="${p.id}">${tx([it.ar,it.en])}</button>`:`<b class="clamp2">${tx([it.ar,it.en])}</b>`}<div class="muted">${L('البائع:','Sold by:')} ${sname(st)} · ${L('الكمية','Qty')}: ${num(it.q)}</div></div>${p&&visible(p)?`<button class="btn out" style="width:auto;height:34px;font-size:13px" data-add="${p.id}">${L('اشترِ مرة ثانية','Buy it again')}</button>`:''}</div>`;}).join('')}
   <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn blk" style="width:auto" data-order="${o.id}">${L('تفاصيل الطلب','Order details')}</button></div></div></div>`;
}
function vOrders(){
  const all=Object.values(D.myOrders).sort((a,b)=>b.createdAt-a.createdAt);
  const tabs=[['all',L('الكل','All')],['open',L('الجارية','Open')],['done',L('المستلمة','Delivered')],['cancelled',L('الملغاة','Cancelled')],['ret',L('المرتجعات','Returns')]];
  const f={all:()=>true,open:o=>['placed','packed','shipped','out'].includes(o.status),done:o=>o.status==='delivered',cancelled:o=>o.status==='cancelled',ret:o=>['return_req','returned','refunded','return_rej'].includes(o.status)}[S.ordTab]||(()=>true);
  const list=all.filter(f);
  if(!ME.uid)return`<div class="wrap"><section class="panel" style="text-align:center"><p>${L('سجّل دخولك عشان تشوف طلباتك.','Sign in to see your orders.')}</p><button class="btn red" style="width:auto" data-act="signin">${L('تسجيل الدخول','Sign in')}</button></section></div>`;
  return`<div class="wrap"><section style="margin-top:16px"><h2 style="font-size:24px;margin:0 0 12px">${L('طلباتك','Your orders')}</h2>
  <div class="tabs" style="margin-bottom:14px">${tabs.map(([k,l])=>`<button data-otab="${k}" aria-selected="${S.ordTab===k}">${l} <span class="muted">(${num(all.filter({all:()=>true,open:o=>['placed','packed','shipped','out'].includes(o.status),done:o=>o.status==='delivered',cancelled:o=>o.status==='cancelled',ret:o=>['return_req','returned','refunded','return_rej'].includes(o.status)}[k]).length)})</span></button>`).join('')}</div>
  ${list.length?list.map(orderCard).join(''):`<div class="panel" style="text-align:center"><p>${all.length?L('ما فيه طلبات هنا.','No orders here.'):L('ما عندك طلبات للحين. أي طلب تأكده يظهر هنا مع تتبع الشحنة.','No orders yet. Orders you place appear here with shipment tracking.')}</p><button class="btn red" style="width:auto" data-act="home">${L('ابدأ التسوق','Start shopping')}</button></div>`}</section></div>`;
}
const tlRow=e=>`<li><b>${tx(ST[e.s])}</b> <span class="muted">${fmtFull(e.at)} · ${e.by==='buyer'?L('العميل','Customer'):e.by==='admin'?L('إدارة نيل +','NILE+ team'):L('المتجر','Store')}</span>${e.note?`<div class="muted">${esc(e.note)}</div>`:''}</li>`;
function vOrder(){
  const o=D.myOrders[S.oid]||D.sellOrders[S.oid]||D.allOrders[S.oid];
  if(!o)return`<div class="wrap"><section class="panel"><p class="muted">${L('جاري تحميل الطلب…','Loading the order…')}</p></section></div>`;
  const st=store(o.s),buyer=o.buyer===ME.uid,seller=isMine(o.sowner),retDays=st?st.ret:15;
  const delAt=(o.tl.find(e=>e.s==='delivered')||{}).at||0,retOk=o.status==='delivered'&&delAt&&Date.now()-delAt<retDays*864e5;
  const acts=[];
  if(buyer){
    if(['placed','packed'].includes(o.status))acts.push(`<button class="btn out" data-ocancel="${o.id}">${L('إلغاء الطلب','Cancel order')}</button>`);
    if(retOk)acts.push(`<button class="btn out" data-oreturn="${o.id}">${L('إرجاع منتج','Return items')}</button>`);
    if(st&&!isMine(st.owner))acts.push(`<button class="btn out" data-chat="${o.s}">${L('راسل المتجر','Message the store')}</button>`);
    acts.push(`<button class="btn out" data-report="order:${o.id}">${L('عندك مشكلة؟','Problem with order?')}</button>`);
  }
  return`<div class="wrap"><section style="margin-top:16px">
   <button class="lnk" data-act="${seller&&!buyer?'sell':'orders'}">‹ ${seller&&!buyer?L('مركز البائع','Seller Center'):L('طلباتك','Your orders')}</button>
   <h2 style="font-size:22px;margin:8px 0 4px">${L('تفاصيل الطلب','Order details')}</h2>
   <div class="muted" style="font-size:13px">${L('تاريخ الطلب','Ordered on')} ${fmtFull(o.createdAt)} · ${L('رقم الطلب','Order #')} <span class="tn sel" dir="ltr">${esc(o.no)}</span></div>
   <div class="co" style="margin-top:12px"><div>
    <div class="step"><div class="orow"><b style="font-size:18px">${etaTxt(o)}</b>${statusPill(o.status)}</div>
     ${o.trk&&o.trk.no?`<div class="muted" style="font-size:13px">${L('شركة الشحن:','Carrier:')} ${tx(CARRIERS.find(c=>c[0]===o.trk.c).slice(1))} · ${L('رقم التتبع:','Tracking #:')} <span class="tn sel" dir="ltr">${esc(o.trk.no)}</span></div>`:''}
     ${tracker(o)}
     ${o.status==='return_req'?`<div class="note">${L('طلبت إرجاع المنتجات. المتجر يراجع الطلب.','You asked to return the items. The store is reviewing it.')}${o.reason?' '+esc(o.reason):''}</div>`:''}
     ${o.status==='refunded'?`<div class="note okc">${L(`تم رد ${money(o.total-o.fees.del-o.fees.cod)} لك.`,`${money(o.total-o.fees.del-o.fees.cod)} was refunded to you.`)}</div>`:''}
     ${o.status==='return_rej'?`<div class="note">${L('رفض المتجر الإرجاع.','The store declined the return.')} ${o.reason?esc(o.reason):''}</div>`:''}
    </div>
    <div class="step"><h2>${L('المنتجات','Items')}</h2>
     ${o.items.map(it=>{const p=prod(it.pid),mine=myReview(it.pid);return`<div class="oi"><span class="e">${imgOf(it.img,it.e)}</span><div style="flex:1;min-width:0;font-size:13px">${p?`<button class="lnk clamp2" data-open="${p.id}">${tx([it.ar,it.en])}</button>`:`<b>${tx([it.ar,it.en])}</b>`}
       <div class="muted">${it.vl[0]||it.vl[1]?tx(it.vl)+' · ':''}${L('الكمية','Qty')}: ${num(it.q)} · ${money(it.p)}${it.cpn?` · ${L('كوبون','coupon')} -${money(it.cpn*it.q)}`:''}</div>
       ${buyer&&['delivered','return_rej'].includes(o.status)&&p?`<button class="lnk" data-revp="${p.id}" style="font-size:12.5px">${mine?L('عدّل تقييمك','Edit your review'):L('قيّم المنتج','Review this item')}</button>`:''}</div>
       <b class="tn">${money(it.p*it.q)}</b></div>`;}).join('')}</div>
    <div class="step"><h2>${L('سجل الطلب','Order history')}</h2><ul class="tl">${[...o.tl].reverse().map(tlRow).join('')}</ul></div>
   </div>
   <aside class="osum">
    <h3 style="margin:0;font-size:16px">${L('عنوان التوصيل','Delivery address')}</h3><div class="addr" style="font-size:13.5px">${addrLine(o.addr)}</div>
    <h3 style="margin:8px 0 0;font-size:16px">${L('الدفع','Payment')}</h3><div style="font-size:13.5px">${o.pay==='cod'?L('نقدًا عند الاستلام','Cash on delivery'):L('بطاقة عند الاستلام','Card on delivery')}</div>
    <div class="ln"><span>${L('المنتجات','Items')}</span><span>${money(o.sub)}</span></div>
    ${o.cpn?`<div class="ln okc"><span>${L('الكوبونات','Coupons')}</span><span>-${money(o.cpn)}</span></div>`:''}
    ${o.fees.del?`<div class="ln"><span>${L('التوصيل','Delivery')}</span><span>${money(o.fees.del)}</span></div>`:''}
    ${o.fees.gift?`<div class="ln"><span>${L('تغليف هدية','Gift wrap')}</span><span>${money(o.fees.gift)}</span></div>`:''}
    ${o.fees.cod?`<div class="ln"><span>${L('رسوم الدفع عند الاستلام','Pay-on-delivery fee')}</span><span>${money(o.fees.cod)}</span></div>`:''}
    <div class="ln tot"><span>${L('الإجمالي','Total')}</span><span>${money(o.total)}</span></div>
    ${o.note?`<div class="note" style="margin:0">${L('ملاحظتك:','Your note:')} ${esc(o.note)}</div>`:''}
    <div style="display:flex;flex-direction:column;gap:8px">${acts.join('')}</div>
   </aside></div></section></div>`;
}
// moving an order along; the server checks who may do what and returns stock when needed
async function orderUpdate(o,status,note,extra={},role='buyer',from){
  if(!guard())return false;
  try{
    await rpc('order_action',{p_id:o.id,p_action:status,p_note:str(note,300),p_carrier:extra&&extra.trk?extra.trk.c:null,p_tracking:extra&&extra.trk?extra.trk.no:null});
    await loadMine();loadCatalog();
    return true;
  }catch(e){toast(dbErr(e),true);loadMine();return false;}
}
async function restock(){} // the server puts stock back on cancel and return

/* ───────── account ───────── */
function vAccount(){
  const ms=myStores(),na=alerts().length;
  const unread=[...Object.values(D.thrB).filter(t=>t.msgs.some(m=>m.seller&&m.at>t.seenB)),...Object.values(D.thrS).filter(t=>t.msgs.some(m=>!m.seller&&m.at>t.seenS))].length;
  const tiles=[['orders','📦',L('طلباتك','Your orders'),L('تتبع، ألغِ أو أرجع طلب، أو اشترِ مرة ثانية','Track, cancel, return or buy again'),Object.values(D.myOrders).filter(o=>['placed','packed','shipped','out'].includes(o.status)).length],
    ['addrs','📍',L('عناوينك','Your addresses'),L('عناوين التوصيل المحفوظة','Saved delivery addresses'),0],
    ['wish','♡',L('قائمة الأمنيات','Your wish list'),L('المنتجات اللي حفظتها','Products you saved'),ME.doc.wish.length],
    ['inbox','💬',L('الرسائل','Messages'),L('محادثاتك مع المتاجر والعملاء','Chats with stores and customers'),unread],
    ['notifs','🔔',L('التنبيهات','Notifications'),L('كل جديد عن طلباتك ورسائلك','Updates on your orders and messages'),na],
    ['sell','🏬',ms.length?L('مركز البائع','Seller Center'):L('ابدأ البيع','Start selling'),ms.length?L('الطلبات والمنتجات والأسئلة','Orders, products and questions'):L('افتح متجرك على نيل +','Open your store on NILE+'),Object.values(D.sellOrders).filter(o=>o.status==='placed'||o.status==='return_req').length]];
  tiles.splice(5,0,['myads','🏷️',L('إعلاناتي','My ads'),L(`أعلن عن أي غرض بـ${num(S2().adFee)} ريال لمدة ${num(S2().adDays)} يوم`,`List any item for ${S2().adFee} QAR for ${S2().adDays} days`),D.adPays.filter(x=>x.status==='rejected').length]);
  if(ME.owner)tiles.push(['admin','🛡️',L('لوحة التحكم','Dashboard'),L('الشركات، الإعلانات، الطلبات، الأرباح والإعدادات','Companies, ads, orders, earnings and settings'),0]);
  return`<div class="wrap"><section style="margin-top:16px"><h2 style="font-size:24px;margin:0 0 4px">${L('حسابك','Your account')}</h2>
   ${ME.uid?`<p class="muted" style="margin:0 0 14px">${L('مسجّل دخول باسم','Signed in as')} <b><span data-uid="${esc(ME.uid)}">${esc(ME.name||'')}</span></b> · <span dir="ltr">${esc(ME.email)}</span>${ME.owner?` · ${L('مالك نيل +','NILE+ owner')}`:''} · <button class="lnk" data-act="signout">${L('تسجيل الخروج','Sign out')}</button></p>`
     :`<div class="panel" style="margin:0 0 14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center"><span style="flex:1;min-width:200px">${L('سجّل دخولك عشان تشتري، تتابع طلباتك، تفتح متجر أو تعلن عن غرض.','Sign in to buy, track orders, open a shop or post an ad.')}</span><button class="btn red" style="width:auto" data-act="signin">${L('تسجيل الدخول','Sign in')}</button><button class="btn out" style="width:auto" data-act="signup">${L('حساب جديد','Create account')}</button></div>`}
   <div class="acct">${tiles.map(([a,ic,t,d,n])=>`<button class="atile" data-act="${a}"><span class="aic">${ic}</span><span style="min-width:0"><b>${t}${n?` <span class="cnt">${num(n)}</span>`:''}</b><span class="muted">${d}</span></span></button>`).join('')}</div>
   <div class="panel"><h3 style="margin:0 0 8px;font-size:16px">${L('المتاجر اللي تتابعها','Stores you follow')}</h3>${(()=>{const fs=Object.values(D.follows).filter(f=>f.by===ME.uid).map(f=>store(f.s)).filter(storeLive);return fs.length?`<div class="rail">${fs.map(s=>`<button class="stile" data-store="${s.id}">${logo(s,48)}<b>${sname(s)}</b></button>`).join('')}</div>`:`<p class="muted" style="margin:0">${L('تابع متجر عشان تلقاه هنا بسرعة.','Follow a store to find it here quickly.')}</p>`;})()}</div>
  </section></div>`;
}
function vAddrs(){
  const a=ME.doc.addrs;
  return`<div class="wrap"><section style="margin-top:16px"><button class="lnk" data-act="account">‹ ${L('حسابك','Your account')}</button><h2 style="font-size:24px;margin:8px 0 12px">${L('عناوينك','Your addresses')}</h2>
   <div class="acct"><button class="atile addnew" data-act="addAddr"><span class="aic">+</span><b>${L('إضافة عنوان','Add address')}</b></button>
   ${a.map(x=>`<div class="atile" style="cursor:default"><div style="min-width:0;flex:1">${x.def?`<span class="spl" style="margin-bottom:6px">${L('الافتراضي','Default')}</span>`:''}<div class="addr" style="font-size:13.5px">${addrLine(x)}</div>
     <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap"><button class="lnk" data-eaddr="${x.id}">${L('تعديل','Edit')}</button><button class="lnk" data-daddr="${x.id}">${L('حذف','Remove')}</button>${x.def?'':`<button class="lnk" data-defaddr="${x.id}">${L('اجعله الافتراضي','Set as default')}</button>`}</div></div></div>`).join('')}</div></section></div>`;
}

/* ───────── messages ───────── */
// a buyer's chat with a shop, if there is one
const threadId=(sid,buyer)=>{const t=Object.values({...D.thrB,...D.thrS}).find(x=>x.s===sid&&x.buyer===buyer);return t?t.id:null;};
function threadList(){
  const b=Object.values(D.thrB).map(t=>({t,role:'b'})),s=Object.values(D.thrS).filter(t=>!D.thrB[t.id]).map(t=>({t,role:'s'}));
  return [...b,...s].filter(x=>x.t.msgs.length).sort((a,b)=>b.t.lastAt-a.t.lastAt);
}
// who is on the other side of a chat: a shop, or the person behind an ad
function chatWith(t,role){
  if(t.ad){const a=D.ads[t.ad];
    return {icon:`<span class="slogo" style="width:40px;height:40px;background:#555;font-size:18px">${a?a.e:'🏷️'}</span>`,name:role==='b'?who(t.sowner,L('صاحب الإعلان','Ad owner')):who(t.buyer),
      sub:a?L(`إعلان: ${esc(a.t)}`,`Ad: ${esc(a.t)}`):L('إعلان','Ad')};}
  const st=store(t.s);
  return role==='b'?{icon:logo(st,40),name:sname(st),sub:''}:{icon:`<span class="slogo" style="width:40px;height:40px;background:#555;font-size:18px">👤</span>`,name:who(t.buyer),sub:sname(st)};
}
function vInbox(){
  const l=threadList();
  return`<div class="wrap"><section style="margin-top:16px"><button class="lnk" data-act="account">‹ ${L('حسابك','Your account')}</button><h2 style="font-size:24px;margin:8px 0 12px">${L('الرسائل','Messages')}</h2>
   ${l.length?`<div class="panel" style="padding:0">${l.map(({t,role})=>{const c=chatWith(t,role),last=t.msgs[t.msgs.length-1],un=role==='b'?t.msgs.some(m=>m.seller&&m.at>t.seenB):t.msgs.some(m=>!m.seller&&m.at>t.seenS);
     return`<button class="thr ${un?'un':''}" data-thread="${t.id}">${c.icon}<span style="min-width:0;flex:1"><b>${c.name}</b>${c.sub?` <span class="muted" style="font-size:12px">· ${c.sub}</span>`:''}<span class="muted clamp1">${last.seller===(role==='b')?'':L('أنت: ','You: ')}${esc(last.t)}</span></span><span class="muted" style="font-size:12px">${ago(t.lastAt)}</span></button>`;}).join('')}</div>`
   :`<div class="panel" style="text-align:center"><p>${L('ما عندك رسائل. تقدر تراسل أي متجر أو صاحب إعلان من صفحته.','No messages. You can message any store or ad owner from their page.')}</p></div>`}</section></div>`;
}
function vThread(){
  const t=D.thrB[S.tid]||D.thrS[S.tid];
  if(!t)return`<div class="wrap"><section class="panel"><p class="muted">${L('جاري التحميل…','Loading…')}</p></section></div>`;
  const st=store(t.s),asSeller=t.sowner===ME.uid&&t.buyer!==ME.uid,p=t.pid?prod(t.pid):null,a=t.ad?D.ads[t.ad]:null,c=chatWith(t,asSeller?'s':'b');
  const head=t.ad?`${c.icon}<div><b>${c.name}</b><div class="muted" style="font-size:12.5px">${c.sub}</div></div>`
    :asSeller?`<span class="slogo" style="width:44px;height:44px;background:#555;font-size:20px">👤</span><div><b>${who(t.buyer)}</b><div class="muted" style="font-size:12.5px">${L('عميل يراسل','A customer messaging')} ${sname(st)}</div></div>`
    :`${logo(st,44)}<div><b>${sname(st)}</b><div class="muted" style="font-size:12.5px">${L(`يرد عادةً ${RESP.find(r=>r[0]===(st&&st.resp||'3h'))[1]}`,`Usually responds ${RESP.find(r=>r[0]===(st&&st.resp||'3h'))[2]}`)}</div></div>`;
  return`<div class="wrap"><section style="margin-top:16px;max-width:760px">
   <button class="lnk" data-act="inbox">‹ ${L('الرسائل','Messages')}</button>
   <div class="thead">${head}</div>
   ${p?`<button class="pctx" data-open="${p.id}"><span class="e">${pimg(p)}</span><span class="clamp2">${pname(p)}</span><b class="tn">${money(p.p)}</b></button>`:''}
   ${a?`<button class="pctx" data-adopen="${a.id}"><span class="e">${adImg(a)}</span><span class="clamp2">${esc(a.t)}</span><b class="tn">${money(a.p)}</b></button>`:''}
   <div class="msgs" id="msgs">${t.msgs.length?t.msgs.map(m=>`<div class="msg ${(m.seller===asSeller)?'me':''}"><div dir="auto">${esc(m.t)}</div><small>${fmtFull(m.at)}</small></div>`).join(''):`<p class="muted" style="text-align:center">${t.ad?L('اكتب سؤالك لصاحب الإعلان.','Write your question to the ad owner.'):L('اكتب سؤالك للمتجر. الرد يوصلك هنا.','Write your question to the store. The reply arrives here.')}</p>`}</div>
   <form class="composer" id="cform"><textarea class="inp" id="cmsg" rows="2" maxlength="2000" placeholder="${L('اكتب رسالتك…','Write a message…')}" aria-label="${L('رسالتك','Your message')}">${esc(S.draft||'')}</textarea><button class="btn red" style="width:auto" type="submit">${L('إرسال','Send')}</button></form>
   <p class="muted" style="font-size:12px">${t.ad?L('للأمان: قابل البائع في مكان عام، وافحص الغرض قبل ما تدفع. نيل + ما يستلم فلوس إعلانات الأفراد.','Stay safe: meet in a public place and check the item before paying. NILE+ doesn’t handle payment for individual ads.'):L('للأمان: لا تحوّل فلوس قبل ما يوصلك الطلب. الدفع في نيل + عند الاستلام.','Stay safe: never send money before your order arrives. On NILE+ you pay on delivery.')}</p>
  </section></div>`;
}
async function sendMsg(text){
  if(!guard())return;
  text=String(text||'').trim().slice(0,2000);if(!text)return;
  const t=D.thrB[S.tid]||D.thrS[S.tid];if(!t)return;
  try{await rpc('send_message',{p_thread:t.id,p_body:text});S.draft='';await loadMine();}
  catch(e){toast(dbErr(e),true);}
}
async function openChat(sid,pid){
  if(!guard())return;
  const st=store(sid);if(!st)return;
  if(isMine(st.owner)){toast(L('هذا متجرك.','This is your store.'),true);return;}
  try{const tid=await rpc('open_thread',{p_shop:sid,p_ad:null,p_product:isUuid(pid)?pid:null});await loadMine();go('thread',{tid,draft:''});}
  catch(e){toast(dbErr(e),true);}
}
async function openAdChat(aid){
  if(!guard())return;
  const a=D.ads[aid];if(!a)return;
  if(a.uid===ME.uid){toast(L('هذا إعلانك.','This is your ad.'),true);return;}
  if(a.demo){toast(dbErr({message:'demo'}),true);return;}
  try{const tid=await rpc('open_thread',{p_shop:null,p_ad:aid,p_product:null});await loadMine();go('thread',{tid,draft:''});}
  catch(e){toast(dbErr(e),true);}
}
async function markThreadSeen(){
  const t=D.thrB[S.tid]||D.thrS[S.tid];if(!t||!canWrite())return;
  const asSeller=t.sowner===ME.uid&&t.buyer!==ME.uid,last=t.msgs.length?t.msgs[t.msgs.length-1].at:0;
  if(!last||(asSeller?t.seenS:t.seenB)>=last)return;
  if(asSeller)t.seenS=Date.now();else t.seenB=Date.now();
  try{await rpc('mark_seen',{p_thread:t.id});}catch(e){}
}

/* ───────── seller center ───────── */
const fld=(id,label,inner,wide,hint)=>`<div class="fld${wide?' wide':''}"><label for="${id}">${label}</label>${inner}${hint?`<span class="hint">${hint}</span>`:''}</div>`;
const inp=(id,val,attrs='')=>`<input class="inp" id="${id}" value="${esc(val??'')}" ${attrs}>`;
const area=(id,val,attrs='')=>`<textarea class="inp ta" id="${id}" ${attrs}>${esc(val??'')}</textarea>`;
const sel=(id,opts,val)=>`<select class="inp" id="${id}">${opts.map(([k,t])=>`<option value="${esc(k)}" ${String(k)===String(val)?'selected':''}>${t}</option>`).join('')}</select>`;
const V=id=>{const e=document.getElementById(id);return e?e.value.trim():'';};
const C=id=>{const e=document.getElementById(id);return !!(e&&e.checked);};

function storeForm(s){
  s=s||{ar:'',en:'',lg:['',''],bg:PALETTE[0],e:'🏬',d:['',''],city:'doha',ret:15,resp:'3h',phone:''};
  return`<div class="form">
   ${fld('sf_ar',L('اسم المتجر بالعربي','Store name in Arabic'),inp('sf_ar',s.ar,'maxlength="40" required'))}
   ${fld('sf_en',L('اسم المتجر بالإنجليزي','Store name in English'),inp('sf_en',s.en,'maxlength="40" dir="ltr"'))}
   ${fld('sf_lg',L('حرف الشعار (عربي)','Logo letter (Arabic)'),inp('sf_lg',s.lg[0],'maxlength="2"'))}
   ${fld('sf_lge',L('حرف الشعار (إنجليزي)','Logo letter (English)'),inp('sf_lge',s.lg[1],'maxlength="2" dir="ltr"'))}
   <div class="fld wide"><span class="flab">${L('لون المتجر','Store colour')}</span><div class="swatches">${PALETTE.map(c=>`<label class="swatch" style="background:${c}"><input type="radio" name="sf_bg" value="${c}" ${s.bg===c?'checked':''}><span class="vh">${c}</span></label>`).join('')}</div></div>
   <div class="fld wide"><span class="flab">${L('رمز المتجر','Store icon')}</span><div class="emos">${EMOJIS.map(x=>`<label class="emopick"><input type="radio" name="sf_e" value="${x}" ${s.e===x?'checked':''}><span>${x}</span></label>`).join('')}</div></div>
   ${fld('sf_d',L('وصف المتجر بالعربي','Store description in Arabic'),area('sf_d',s.d[0],'maxlength="500"'),true,L('وش تبيع، ومن وين، وكيف تخدم العملاء.','What you sell, where from, and how you serve customers.'))}
   ${fld('sf_de',L('وصف المتجر بالإنجليزي','Store description in English'),area('sf_de',s.d[1],'maxlength="500" dir="ltr"'),true)}
   ${fld('sf_city',L('مقر المتجر','Store location'),sel('sf_city',CITIES.map(c=>[c.k,cityName(c)]),s.city))}
   ${fld('sf_ret',L('مدة الإرجاع','Return window'),sel('sf_ret',RETS.map(n=>[n,L(`${num(n)} يوم`,`${n} days`)]),s.ret))}
   ${fld('sf_resp',L('وقت الرد على الرسائل','Message response time'),sel('sf_resp',RESP.map(r=>[r[0],S.ar?r[1]:r[2]]),s.resp))}
   ${fld('sf_phone',L('رقم التواصل','Contact number'),inp('sf_phone',s.phone,'maxlength="16" dir="ltr" inputmode="tel" placeholder="+974 5555 1234"'))}
  </div>`;
}
function readStoreForm(){
  const ar=V('sf_ar'),en=V('sf_en');
  if(!ar&&!en)return {err:L('اكتب اسم المتجر.','Enter the store name.')};
  const bg=(document.querySelector('input[name="sf_bg"]:checked')||{}).value,e=(document.querySelector('input[name="sf_e"]:checked')||{}).value;
  return {ar:ar.slice(0,40),en:en.slice(0,40),lg:[(V('sf_lg')||ar.charAt(0)||en.charAt(0)).slice(0,2),(V('sf_lge')||en.charAt(0)||ar.charAt(0)).slice(0,2)],
    bg:PALETTE.includes(bg)?bg:PALETTE[0],e:EMOJIS.includes(e)?e:'🏬',d:[V('sf_d').slice(0,500),V('sf_de').slice(0,500)],city:V('sf_city'),ret:Number(V('sf_ret'))||15,resp:V('sf_resp')||'3h',
    phone:V('sf_phone').replace(/[^\d+ ]/g,'').slice(0,16)};
}
/* the rules a company accepts when it registers (shown again on its status page) */
function termsHTML(){
  const st=S2();
  return`<ol class="terms">
   <li>${L(`نيل + يستلم قيمة كل طلب من العميل عند التوصيل (نقدًا أو بالبطاقة).`,`NILE+ collects each order’s payment from the customer on delivery (cash or card).`)}</li>
   <li>${L(`عمولة نيل + <b>${num(st.comm)}٪</b> من قيمة المنتجات في كل طلب، بعد خصم الكوبونات.`,`NILE+ keeps a <b>${st.comm}%</b> commission on the item value of every order, after coupons.`)}</li>
   <li>${L('رسوم التوصيل والدفع عند الاستلام وتغليف الهدية تكون لنيل +.','Delivery, pay-on-delivery and gift-wrap fees go to NILE+.')}</li>
   <li>${L('يتحوّل صافي مبيعاتك لحساب شركتك بعد ما تخلص مدة الإرجاع للطلب.','Your net sales are transferred to your company once each order’s return window ends.')}</li>
   <li>${L('تجهّز الطلب خلال ٢٤ ساعة، وتلتزم بصحة المنتجات والأسعار والمخزون وبمدة الإرجاع اللي تحددها.','You prepare orders within 24 hours and keep products, prices, stock and your return window accurate.')}</li>
   <li>${L('يحق لنيل + إخفاء أي منتج مخالف أو إيقاف المتجر عند تكرار المخالفات أو الشكاوى.','NILE+ may hide any product that breaks the rules, or suspend the shop after repeated violations or complaints.')}</li>
   <li>${L('ما يتفعّل المتجر إلا بعد ما تراجع إدارة نيل + السجل التجاري وتوافق.','The shop goes live only after NILE+ reviews the commercial registration and approves it.')}</li></ol>`;
}
function companyFields(x){
  x=x||{};
  return`<div class="form">
   ${fld('rg_cr',L('رقم السجل التجاري','Commercial registration no.'),inp('rg_cr',x.cr,'maxlength="20" dir="ltr" inputmode="numeric" required'))}
   ${fld('rg_act',L('النشاط التجاري (كما في السجل)','Business activity (as on the registration)'),inp('rg_act',x.activity,'maxlength="120" required'))}
   ${fld('rg_mgr',L('اسم المدير المخوّل بالتوقيع','Authorised manager’s name'),inp('rg_mgr',x.manager,'maxlength="80" required autocomplete="name"'))}
   ${fld('rg_phone',L('رقم التواصل','Contact number'),inp('rg_phone',x.phone,'maxlength="16" dir="ltr" inputmode="tel" placeholder="5555 1234" required'))}
   ${fld('rg_email',L('البريد الإلكتروني (اختياري)','Email (optional)'),inp('rg_email',x.email,'maxlength="120" dir="ltr" type="email" autocomplete="email"'))}
   ${fld('rg_file',L('صورة أو ملف السجل التجاري','Commercial registration (photo or PDF)'),`<input class="inp" id="rg_file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp">`,false,L('PDF أو صورة، حتى ١٠ ميجا. ما يشوفه إلا إدارة نيل +.','PDF or photo, up to 10 MB. Only NILE+ can see it.'))}
  </div>`;
}
function vJoin(){
  const st=S2(),back=myStores().length?`<button class="lnk" data-act="cancelNewStore">‹ ${L('رجوع لمتجرك','Back to your store')}</button>`:'';
  if(S.joinAs==='company')return`<div class="wrap"><section class="panel sellhero">${back||`<button class="lnk" data-join="">‹ ${L('رجوع','Back')}</button>`}
    <h2>${L('تسجيل شركة أو مؤسسة','Register a company')}</h2>
    <p class="muted" style="margin:0 0 14px">${L('للشركات الصغيرة والمتوسطة اللي عندها سجل تجاري في قطر. تراجع إدارة نيل + طلبك، ويوصلك الرد هنا.','For small and medium businesses with a Qatar commercial registration. NILE+ reviews your request and the answer appears here.')}</p>
    <form id="regForm" class="keep" novalidate>
     <h3 class="h3">${L('١. بيانات الشركة','1. Company details')}</h3>${companyFields()}
     <h3 class="h3" style="margin-top:18px">${L('٢. صفحة المتجر','2. Store page')}</h3>${storeForm()}
     <h3 class="h3" style="margin-top:18px">${L('٣. شروط البيع في نيل +','3. NILE+ seller terms')}</h3>${termsHTML()}
     <label class="chk" style="margin-top:8px"><input type="checkbox" id="rg_terms"> ${L('قرأت شروط البيع في نيل + وأوافق عليها نيابة عن الشركة.','I have read and accept the NILE+ seller terms on behalf of the company.')}</label>
     <div style="margin-top:14px"><button class="btn red" style="width:auto" type="submit">${L('أرسل طلب التسجيل','Submit registration')}</button></div>
    </form></section></div>`;
  return`<div class="wrap"><section class="panel sellhero">${back}<h2>${L('بِع على نيل +','Sell on NILE+')}</h2>
   <p class="muted" style="margin:0 0 14px">${L('اختر الطريقة اللي تناسبك:','Choose what fits you:')}</p>
   <div class="join">
    <div class="jcard"><span class="aic">🏢</span><h3>${L('شركة أو مؤسسة','Company')}</h3>
     <ul class="ticks"><li>${L('متجر كامل باسم شركتك وصفحة خاصة','A full store under your company name with its own page')}</li><li>${L('بيع بالسلة والدفع عند الاستلام، ونيل + يستلم المبلغ','Cart checkout with pay on delivery; NILE+ collects the money')}</li>
      <li>${L(`عمولة ${num(st.comm)}٪ على المبيعات فقط`,`${st.comm}% commission on sales only`)}</li><li>${L('يتطلب سجل تجاري وموافقة الإدارة','Needs a commercial registration and NILE+ approval')}</li></ul>
     <button class="btn red" data-join="company">${L('سجّل شركتك','Register your company')}</button></div>
    <div class="jcard"><span class="aic">🙋</span><h3>${L('فرد','Individual')}</h3>
     <ul class="ticks"><li>${L('أعلن عن غرض تبي تبيعه، جديد أو مستعمل','List an item you want to sell, new or used')}</li><li>${L(`${num(st.adFee)} ريال فقط للإعلان لمدة ${num(st.adDays)} يوم`,`Only ${st.adFee} QAR per ad for ${st.adDays} days`)}</li>
      <li>${L('بدون عمولة على البيع','No commission on the sale')}</li><li>${L('المشتري يراسلك أو يتصل فيك مباشرة','Buyers message or call you directly')}</li></ul>
     <button class="btn blk" data-act="postad">${L('أعلن عن غرض','Post an ad')}</button></div>
   </div></section></div>`;
}
function vShopStatus(s){
  const st={pending:['⏳',L('طلبك قيد المراجعة','Your request is under review'),L('إدارة نيل + تراجع السجل التجاري وبيانات الشركة. يوصلك الرد هنا عادةً خلال يومي عمل.','NILE+ is reviewing your commercial registration and company details. The answer usually appears here within two working days.')],
    rejected:['✖',L('ما تمت الموافقة على الطلب','Your request wasn’t approved'),L('صحّح البيانات تحت وأرسل الطلب مرة ثانية.','Fix the details below and send the request again.')],
    suspended:['⛔',L('المتجر موقوف','The shop is suspended'),L('منتجاتك مخفية عن العملاء الحين. تواصل مع إدارة نيل +.','Your products are hidden from customers for now. Contact NILE+.')]}[s.status];
  return`<div class="wrap"><section class="panel sellhero"><div class="sellhead" style="padding:0">${logo(s,56)}<div><div class="muted" style="font-size:12.5px">${L('مركز البائع','Seller Center')}</div><h2 style="margin:0">${sname(s)}</h2></div></div>
   <div class="stbox st-${s.status}"><b>${st[0]} ${st[1]}</b><p style="margin:4px 0 0">${st[2]}</p>${s.note?`<p style="margin:6px 0 0"><b>${L('ملاحظة الإدارة:','Note from NILE+:')}</b> ${esc(s.note)}</p>`:''}</div>
   <dl class="kv" style="font-size:13.5px;margin-top:12px"><dt>${L('السجل التجاري','Commercial reg.')}</dt><dd dir="ltr" style="text-align:start">${esc(s.cr)}</dd><dt>${L('النشاط','Activity')}</dt><dd>${esc(s.activity)}</dd><dt>${L('العمولة','Commission')}</dt><dd>${num(s.comm)}٪</dd><dt>${L('تاريخ الطلب','Submitted')}</dt><dd>${fmtFull(s.createdAt)}</dd></dl>
   ${s.status==='rejected'?`<form id="resubForm" class="keep" data-sid="${s.id}" novalidate style="margin-top:16px"><h3 class="h3">${L('صحّح البيانات وأرسل مرة ثانية','Fix the details and resend')}</h3>${companyFields({cr:s.cr,activity:s.activity})}<p class="hint">${L('ارفع السجل مرة ثانية لو كان الملف هو سبب الرفض.','Upload the registration again if the file was the problem.')}</p><div style="margin-top:12px"><button class="btn red" style="width:auto" type="submit">${L('أعد إرسال الطلب','Resend request')}</button></div></form>`:''}
   <h3 class="h3" style="margin-top:18px">${L('شروط البيع اللي وافقت عليها','The seller terms you accepted')}</h3>${termsHTML()}
   ${myStores().length>1?`<label class="muted" style="font-size:13px">${L('المتجر:','Store:')} <select class="inp" id="mysid" style="width:auto;min-height:34px">${myStores().map(x=>`<option value="${x.id}" ${x.id===s.id?'selected':''}>${sname(x)}</option>`).join('')}</select></label>`:''}
  </section></div>`;
}
function vSell(){
  if(!ME.uid)return`<div class="wrap"><section class="panel" style="text-align:center"><h2>${L('بِع على نيل +','Sell on NILE+')}</h2><p>${L('سجّل دخولك عشان تسجّل شركتك أو تعلن عن غرض.','Sign in to register your company or post an ad.')}</p><button class="btn red" style="width:auto" data-act="signin">${L('تسجيل الدخول','Sign in')}</button> <button class="btn out" style="width:auto" data-act="signup">${L('حساب جديد','Create account')}</button></section></div>`;
  const s=S.makeStore?null:curStore();
  if(!s)return vJoin();
  if(s.status!=='approved')return vShopStatus(s);
  const all=myStores();
  const os=Object.values(D.sellOrders).filter(o=>o.s===s.id).sort((a,b)=>b.createdAt-a.createdAt);
  const ps=Object.values(D.products).filter(p=>p.s===s.id).sort((a,b)=>b.createdAt-a.createdAt);
  const qs=Object.values(D.questions).filter(q=>q.s===s.id).sort((a,b)=>(a.ans.length-b.ans.length)||(b.at-a.at));
  const ths=Object.values(D.thrS).filter(t=>t.s===s.id&&t.msgs.length).sort((a,b)=>b.lastAt-a.lastAt);
  const newN=os.filter(o=>o.status==='placed').length,retN=os.filter(o=>o.status==='return_req').length,qN=qs.filter(q=>!q.ans.some(a=>a.seller)).length;
  const unread=ths.filter(t=>t.msgs.some(m=>!m.seller&&m.at>t.seenS)).length;
  const tabs=[['home',L('نظرة عامة','Overview')],['money',L('الأرباح','Earnings')],['orders',L('الطلبات','Orders')+(newN+retN?` (${num(newN+retN)})`:'')],['products',L('المنتجات','Products')+` (${num(ps.length)})`],['qa',L('الأسئلة','Questions')+(qN?` (${num(qN)})`:'')],['msgs',L('الرسائل','Messages')+(unread?` (${num(unread)})`:'')],['settings',L('إعدادات المتجر','Store settings')]];
  let body='';
  if(S.sellTab==='home'){
    const m0=new Date();m0.setDate(1);m0.setHours(0,0,0,0);
    const live=os.filter(o=>!['cancelled','refunded','returned'].includes(o.status));
    const month=live.filter(o=>o.createdAt>=m0.getTime());
    const rev=month.reduce((a,o)=>a+o.sub-o.cpn,0),units=ps.reduce((a,p)=>a+p.sold,0),r=storeRating(s.id);
    const low=ps.filter(p=>p.active&&p.stock<=5).sort((a,b)=>a.stock-b.stock);
    const toShip=os.filter(o=>['placed','packed'].includes(o.status));
    body=`<div class="kpis"><div><b>${num(newN)}</b>${L('طلبات جديدة','New orders')}</div><div><b>${num(toShip.length)}</b>${L('تنتظر الشحن','To ship')}</div><div><b>${money(rev)}</b>${L('مبيعات هالشهر','Sales this month')}</div><div><b>${num(units)}</b>${L('قطعة مباعة','Units sold')}</div><div><b>${r.n?num(r.avg)+' ★':'—'}</b>${L(`تقييم المتجر (${num(r.n)})`,`Store rating (${r.n})`)}</div><div><b>${num(followers(s.id))}</b>${L('متابع','Followers')}</div></div>
     <div class="note">${L(`عمولة نيل + على متجرك ${num(s.comm)}٪. نيل + يستلم قيمة الطلبات من العملاء ويحوّل لك صافيك بعد مدة الإرجاع.`,`Your NILE+ commission is ${s.comm}%. NILE+ collects order payments and transfers your net after the return window.`)} <button class="lnk" data-stab2="money">${L('شوف أرباحك','See your earnings')}</button></div>
     <div class="two" style="margin-top:14px"><div class="panel" style="margin:0"><h3 style="margin:0 0 8px;font-size:16px">${L('تحتاج تتصرف','Needs your action')}</h3>
      ${toShip.length||retN||qN||unread?`<ul class="todo">${toShip.length?`<li><button class="lnk" data-stab2="orders" data-of="new">${L(`${num(toShip.length)} طلب ينتظر التجهيز أو الشحن`,`${toShip.length} orders to pack or ship`)}</button></li>`:''}${retN?`<li><button class="lnk" data-stab2="orders" data-of="ret">${L(`${num(retN)} طلب إرجاع`,`${retN} return requests`)}</button></li>`:''}${qN?`<li><button class="lnk" data-stab2="qa">${L(`${num(qN)} سؤال بدون جواب`,`${qN} unanswered questions`)}</button></li>`:''}${unread?`<li><button class="lnk" data-stab2="msgs">${L(`${num(unread)} محادثة جديدة`,`${unread} new chats`)}</button></li>`:''}</ul>`:`<p class="muted" style="margin:0">${L('كل شي تمام. ما فيه شي ينتظرك.','All caught up.')}</p>`}</div>
      <div class="panel" style="margin:0"><h3 style="margin:0 0 8px;font-size:16px">${L('مخزون قليل','Low stock')}</h3>${low.length?low.slice(0,8).map(p=>`<div class="lrow"><span class="clamp1">${pname(p)}</span><b class="${p.stock?'':'redc'}">${p.stock?num(p.stock):L('نفد','Out')}</b><button class="lnk" data-edit="${p.id}">${L('تعديل','Edit')}</button></div>`).join(''):`<p class="muted" style="margin:0">${L('مخزون كل المنتجات كافي.','All products are well stocked.')}</p>`}</div></div>`;
  }
  if(S.sellTab==='orders'){
    const F=[['new',L('جديدة','New'),o=>o.status==='placed'],['packed',L('مجهّزة','Packed'),o=>o.status==='packed'],['ship',L('في الطريق','On the way'),o=>['shipped','out'].includes(o.status)],['done',L('تم التوصيل','Delivered'),o=>o.status==='delivered'],['ret',L('المرتجعات','Returns'),o=>['return_req','returned','refunded','return_rej'].includes(o.status)],['cancelled',L('ملغاة','Cancelled'),o=>o.status==='cancelled'],['all',L('الكل','All'),()=>true]];
    const cur=F.find(f=>f[0]===S.ordF)||F[0],list=os.filter(cur[2]);
    body=`<div class="chips">${F.map(f=>`<button class="chip" data-of="${f[0]}" aria-pressed="${S.ordF===f[0]}">${f[1]} (${num(os.filter(f[2]).length)})</button>`).join('')}</div>
     ${list.length?list.map(o=>sellerOrderCard(o)).join(''):`<div class="panel" style="text-align:center"><p class="muted">${os.length?L('ما فيه طلبات هنا.','No orders here.'):L('أول طلب يوصلك يظهر هنا، ويوصلك تنبيه.','Your first order shows up here with a notification.')}</p></div>`}`;
  }
  if(S.sellTab==='products'){
    body=`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px"><button class="btn red" style="width:auto" data-edit="new">+ ${L('أضف منتج','Add a product')}</button><span class="muted" style="font-size:13px">${L('المنتجات الموقوفة ما تظهر للعملاء.','Paused products are hidden from customers.')}</span></div>
     ${ps.length?`<div class="tbl-wrap"><table class="adm"><tr><th>${L('المنتج','Product')}</th><th>${L('السعر','Price')}</th><th>${L('المخزون','Stock')}</th><th>${L('المبيعات','Sold')}</th><th>${L('التقييم','Rating')}</th><th>${L('الحالة','Status')}</th><th></th></tr>
     ${ps.map(p=>{const r=ratingOf(p.id),hid=modP(p.id).hidden;return`<tr><td><div class="tp2"><span class="e">${pimg(p)}</span><span class="clamp2">${pname(p)}</span></div></td><td class="tn">${money(p.p)}</td><td class="tn ${p.stock<=5?'redc':''}">${num(p.stock)}</td><td class="tn">${num(p.sold)}</td><td class="tn">${r.n?num(r.avg)+' ★ ('+num(r.n)+')':'—'}</td>
      <td>${p.mod!=='approved'?modPill(p)+(p.modWhy.length?`<div class="muted clamp2" style="font-size:11.5px;max-width:220px" dir="auto">${esc(p.modWhy[0])}</div>`:''):hid?`<span class="stp st-cancelled">${L('أخفته الإدارة','Hidden by NILE+')}</span>`:p.active?`<span class="stp st-delivered">${L('معروض','Live')}</span>`:`<span class="stp st-placed">${L('موقوف','Paused')}</span>`}</td>
      <td><div class="acts2"><button class="lnk" data-edit="${p.id}">${L('تعديل','Edit')}</button><button class="lnk" data-ptoggle="${p.id}">${p.active?L('إيقاف','Pause'):L('عرض','Publish')}</button>${visible(p)?`<button class="lnk" data-open="${p.id}">${L('شوفه','View')}</button>`:''}</div></td></tr>`;}).join('')}</table></div>`
     :`<div class="panel" style="text-align:center"><p>${L('ما أضفت منتجات للحين.','You haven’t added products yet.')}</p><button class="btn red" style="width:auto" data-edit="new">+ ${L('أضف أول منتج','Add your first product')}</button></div>`}`;
  }
  if(S.sellTab==='qa'){
    body=qs.length?qs.map(q=>{const p=prod(q.pid),mine=q.ans.find(a=>a.seller);return`<div class="panel" style="margin-top:10px"><div class="muted" style="font-size:12.5px">${p?`<button class="lnk" data-open="${p.id}">${pname(p)}</button>`:''} · ${who(q.by)} · ${ago(q.at)}</div><b>${esc(q.q)}</b>
      ${q.ans.map(a=>`<div class="ans">${esc(a.t)}<div class="muted" style="font-size:12px">${a.seller?L('ردك','Your answer'):who(a.by)} · ${ago(a.at)}</div></div>`).join('')}
      ${mine?'':`<form class="ansf" data-ansq="${q.id}"><input class="inp" id="qa_${q.id}" maxlength="1500" placeholder="${L('اكتب جوابك…','Write your answer…')}"><button class="btn red" style="width:auto" type="submit">${L('أجب','Answer')}</button></form>`}</div>`;}).join(''):`<div class="panel" style="text-align:center"><p class="muted">${L('ما فيه أسئلة على منتجاتك للحين.','No questions on your products yet.')}</p></div>`;
  }
  if(S.sellTab==='msgs'){
    body=ths.length?`<div class="panel" style="padding:0">${ths.map(t=>{const last=t.msgs[t.msgs.length-1],un=t.msgs.some(m=>!m.seller&&m.at>t.seenS);return`<button class="thr ${un?'un':''}" data-thread="${t.id}"><span class="slogo" style="width:40px;height:40px;background:#555;font-size:18px">👤</span><span style="min-width:0;flex:1"><b>${who(t.buyer)}</b><span class="muted clamp1">${last.seller?L('أنت: ','You: '):''}${esc(last.t)}</span></span><span class="muted" style="font-size:12px">${ago(t.lastAt)}</span></button>`;}).join('')}</div>`
      :`<div class="panel" style="text-align:center"><p class="muted">${L('رسائل العملاء لمتجرك تظهر هنا.','Customer messages to your store show up here.')}</p></div>`;
  }
  if(S.sellTab==='money')body=vMoney(s,os,ps);
  if(S.sellTab==='settings'){
    body=`<form id="editStore" class="panel keep">${storeForm(s)}${S.err?`<p class="err" role="alert">${esc(S.err)}</p>`:''}<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn red" style="width:auto" type="submit" ${S.busy?'disabled':''}>${L('حفظ التغييرات','Save changes')}</button><button class="btn out" style="width:auto" type="button" data-store="${s.id}">${L('شوف صفحة المتجر','View store page')}</button></div></form>`;
  }
  return`<div class="wrap"><section style="margin-top:16px">
   <div class="sellhead">${logo(s,56)}<div style="min-width:0;flex:1"><div class="muted" style="font-size:12.5px">${L('مركز البائع','Seller Center')}</div><h2 style="margin:0;font-size:22px">${sname(s)}</h2><div style="font-size:12.5px">${verified(s)?vbadge():`<span class="muted">${L('لم يُوثّق بعد','Not verified yet')}</span>`} ${samplePill(s)} ${modS(s.id).hidden?`<span class="stp st-cancelled">${L('أخفته الإدارة','Hidden by NILE+')}</span>`:''}</div></div>
    ${all.length>1?`<label class="muted" style="font-size:13px">${L('المتجر:','Store:')} <select class="inp" id="mysid" style="width:auto;min-height:34px">${all.map(x=>`<option value="${x.id}" ${x.id===s.id?'selected':''}>${sname(x)}</option>`).join('')}</select></label>`:''}
    <button class="btn out" style="width:auto" data-act="newStore">+ ${L('متجر آخر','Another store')}</button></div>
   <div class="tabs" style="margin:12px 0 14px">${tabs.map(([k,l])=>`<button data-stab2="${k}" aria-selected="${S.sellTab===k}">${l}</button>`).join('')}</div>
   ${body}</section></div>`;
}
function sellerOrderCard(o){
  const a=o.addr,nx={placed:['packed',L('تأكيد وتجهيز الطلب','Confirm & pack')],packed:['ship',L('شحن الطلب','Ship order')],shipped:['out',L('خرج للتوصيل','Out for delivery')],out:['delivered',L('تم التوصيل','Mark delivered')],returned:['refunded',L('تم رد المبلغ','Mark refunded')]}[o.status];
  return`<div class="ocard"><div class="oh"><div>${L('الطلب','Order')}<b class="tn" dir="ltr">${esc(o.no)}</b></div><div>${L('التاريخ','Date')}<b>${fmtFull(o.createdAt)}</b></div><div>${L('قيمة المنتجات','Items value')}<b class="tn">${money(o.sub-o.cpn)}</b></div><div>${L('يحصّل المندوب','Courier collects')}<b class="tn">${money(o.total)}</b></div><div style="margin-inline-start:auto">${statusPill(o.status)}</div></div>
   <div class="ob"><div class="two"><div>${o.items.map(it=>`<div class="oi"><span class="e">${imgOf(it.img,it.e)}</span><div style="flex:1;min-width:0;font-size:13px"><b class="clamp2">${tx([it.ar,it.en])}</b><div class="muted">${it.vl[0]||it.vl[1]?tx(it.vl)+' · ':''}${L('الكمية','Qty')}: ${num(it.q)} · ${money(it.p)}</div></div></div>`).join('')}</div>
    <div style="font-size:13.5px"><b>${L('التوصيل إلى','Deliver to')}</b><div class="addr sel">${addrLine(a)}</div>
     <div class="muted" style="margin-top:6px">${({std:L('توصيل عادي','Standard'),next:L('توصيل غدًا','Next day'),same:L('توصيل اليوم','Same day')})[o.speed]} · ${o.pay==='cod'?L('نقدًا عند الاستلام','Cash on delivery'):L('بطاقة عند الاستلام','Card on delivery')}${o.gift?' · 🎁 '+L('تغليف هدية','Gift wrap'):''}</div>
     ${o.note?`<div class="note" style="margin-top:6px">${L('ملاحظة العميل:','Customer note:')} ${esc(o.note)}</div>`:''}
     ${o.trk&&o.trk.no?`<div class="muted" style="margin-top:6px">${tx(CARRIERS.find(c=>c[0]===o.trk.c).slice(1))} · <span dir="ltr" class="sel">${esc(o.trk.no)}</span></div>`:''}
     ${o.status==='return_req'?`<div class="note" style="margin-top:6px">${L('سبب الإرجاع:','Return reason:')} ${esc(o.reason)}</div>`:''}</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
     ${nx?`<button class="btn red" style="width:auto" data-sstep="${o.id}" data-to="${nx[0]}">${nx[1]}</button>`:''}
     ${o.status==='return_req'?`<button class="btn red" style="width:auto" data-sstep="${o.id}" data-to="returned">${L('استلمت المرتجع','Return received')}</button><button class="btn out" style="width:auto" data-sstep="${o.id}" data-to="return_rej">${L('رفض الإرجاع','Decline return')}</button>`:''}
     ${['placed','packed'].includes(o.status)?`<button class="btn out" style="width:auto" data-scancel="${o.id}">${L('إلغاء الطلب','Cancel order')}</button>`:''}
     <button class="btn out" style="width:auto" data-copyaddr="${o.id}">${L('نسخ بيانات الشحنة','Copy shipping label')}</button>
     <button class="btn out" style="width:auto" data-order="${o.id}">${L('السجل','History')}</button>
     ${threadId(o.s,o.buyer)?`<button class="btn out" style="width:auto" data-thread="${threadId(o.s,o.buyer)}">${L('راسل العميل','Message customer')}</button>`:''}
    </div></div></div>`;
}
async function sellerStep(o,to,note,extra){
  const ok=await orderUpdate(o,to,note,extra||{},isMine(o.sowner)?'seller':'admin',FLOW[to]);
  if(!ok)return;
  toast(tx(ST[to]));
}

/* ───────── product editor ───────── */
let ED=null; // the product being edited
function startEdit(pid){
  const s=curStore();if(!s)return go('sell');
  if(pid==='new'){if(s.status!=='approved')return go('sell');ED={id:'',isNew:true,s:s.id,owner:s.owner,c:'electronics',sub:['',''],e:'📦',imgs:[],p:'',o:'',stock:1,cpn:'',same:true,cod:true,ar:'',en:'',model:'',w:'',kg:'',dim:['',''],mat:['',''],war:1,org:['',''],v:{t:['اللون','Colour'],o:[{ar:'',en:'',hex:''}]},b:[['',''],['',''],['','']],active:true};}
  else{const p=prod(pid);if(!p||!isMine(p.owner))return;ED=JSON.parse(JSON.stringify(p));ED.isNew=false;if(!ED.b.length)ED.b=[['','']];ED.cost=ME.doc.costs[pid]??'';}
  S.err='';go('edit');
}
function vEdit(){
  const e=ED;if(!e)return vSell();
  return`<div class="wrap"><section style="margin-top:16px"><button class="lnk" data-act="sell">‹ ${L('مركز البائع','Seller Center')}</button>
   <h2 style="font-size:22px;margin:8px 0 12px">${e.isNew?L('أضف منتج','Add a product'):L('تعديل المنتج','Edit product')}</h2>
   ${e.isNew?`<div class="note" style="margin:0 0 12px">${L('كل منتج يمر على مراجعة آلية قبل ما يظهر للعملاء: اسم واضح يذكر العلامة والنوع، سعر واقعي، وصور للمنتج نفسه.','Every product is reviewed automatically before customers see it: a clear name with brand and type, a realistic price, and photos of the product itself.')}</div>`:modBox(e,'product')}
   <form id="pform" class="form-cols">
    <div class="panel" style="margin:0"><h3 class="h3">${L('الأساسيات','Basics')}</h3><div class="form">
     ${fld('pe_ar',L('اسم المنتج بالعربي','Product name in Arabic'),inp('pe_ar',e.ar,'maxlength="200"'),true,L('اكتب العلامة والنوع وأهم ميزة، مثل: «سماعات صوت تك برو لاسلكية عازلة للضوضاء».','Brand, type and key feature, e.g. “SawtTech Pro wireless noise-cancelling headphones”.'))}
     ${fld('pe_en',L('اسم المنتج بالإنجليزي','Product name in English'),inp('pe_en',e.en,'maxlength="200" dir="ltr"'),true)}
     ${fld('pe_c',L('القسم','Department'),sel('pe_c',Object.keys(CATS).filter(k=>k!=='all').map(k=>[k,cname(k)]),e.c))}
     ${fld('pe_sub',L('الفئة (مثل: سماعات الرأس)','Category (e.g. Headphones)'),inp('pe_sub',e.sub[0],'maxlength="50"'))}
     ${fld('pe_sube',L('الفئة بالإنجليزي','Category in English'),inp('pe_sube',e.sub[1],'maxlength="50" dir="ltr"'))}
     ${fld('pe_model',L('رقم الموديل','Model number'),inp('pe_model',e.model,'maxlength="50" dir="ltr"'),false,L('نفس الموديل عند متاجر ثانية يظهر في «عروض أخرى».','The same model from other stores shows under “Other sellers”.'))}
    </div></div>
    <div class="panel" style="margin:0"><h3 class="h3">${L('الصور','Photos')}</h3>
     <div class="upl">${e.imgs.map((id,i)=>`<div class="ph"><img src="${IMG(id)}" alt=""><button type="button" data-rmimg="${i}" aria-label="${L('حذف الصورة','Remove photo')}">×</button>${i?`<button type="button" class="mv" data-firstimg="${i}">${L('رئيسية','Main')}</button>`:`<span class="mainb">${L('الرئيسية','Main')}</span>`}</div>`).join('')}
      ${e.imgs.length<8?(ME.uid?`<label class="ph add"><input type="file" id="pimgs" accept="image/*" multiple hidden><span>+<br><small>${L('أضف صور','Add photos')}</small></span></label>`:''):''}</div>
     ${ME.uid?`<p class="hint">${L('حتى ٨ صور. أول صورة هي اللي تظهر في البحث. نصغّرها تلقائيًا.','Up to 8 photos. The first shows in search. We resize them automatically.')}</p>`:`<p class="hint">${L('رفع الصور غير متاح لك في هذي الصفحة، فبيظهر رمز المنتج بدالها.','Photo upload isn’t available to you on this page, so the product icon shows instead.')}</p>`}
     ${S.uploading?`<p class="muted">${L('جاري رفع الصور…','Uploading photos…')}</p>`:''}
     <div class="fld" style="margin-top:8px"><span class="flab">${L('رمز يظهر لو ما فيه صورة','Icon shown when there’s no photo')}</span><div class="emos">${EMOJIS.map(x=>`<label class="emopick"><input type="radio" name="pe_e" value="${x}" ${e.e===x?'checked':''}><span>${x}</span></label>`).join('')}</div></div></div>
    <div class="panel" style="margin:0"><h3 class="h3">${L('السعر والمخزون','Price & stock')}</h3><div class="form">
     ${fld('pe_p',L('السعر (ر.ق)','Price (QAR)'),inp('pe_p',e.p,'type="number" min="1" step="0.5" inputmode="decimal"'))}
     ${fld('pe_o',L('السعر قبل الخصم (اختياري)','Price before discount (optional)'),inp('pe_o',e.o||'','type="number" min="0" step="0.5" inputmode="decimal"'),false,L('يظهر الخصم لو كان أعلى من السعر.','Shows a discount when higher than the price.'))}
     ${fld('pe_stock',L('الكمية المتوفرة','Quantity in stock'),inp('pe_stock',e.stock,'type="number" min="0" step="1" inputmode="numeric"'))}
     ${fld('pe_cost',L('سعر التكلفة عليك (اختياري)','Your cost per unit (optional)'),inp('pe_cost',e.cost||'','type="number" min="0" step="0.5" inputmode="decimal"'),false,L('خاص فيك، ما يشوفه العملاء. نحسب منه ربحك في «الأرباح».','Private to you, never shown to customers. Used to work out your profit in “Earnings”.'))}
     ${fld('pe_cpn',L('كوبون خصم بالريال (اختياري)','Coupon in QAR (optional)'),inp('pe_cpn',e.cpn||'','type="number" min="0" step="1" inputmode="numeric"'),false,L('العميل يفعّله من صفحة المنتج.','Customers apply it on the product page.'))}
    </div>
     <label class="chk" style="margin-top:10px"><input type="checkbox" id="pe_cod" ${e.cod?'checked':''}> ${L('يقبل الدفع نقدًا عند الاستلام','Accepts cash on delivery')}</label>
     <label class="chk" style="margin-top:6px"><input type="checkbox" id="pe_same" ${e.same?'checked':''}> ${L('ينفع لتوصيل اليوم داخل الدوحة','Eligible for same-day delivery in Doha')}</label>
     <label class="chk" style="margin-top:6px"><input type="checkbox" id="pe_active" ${e.active?'checked':''}> ${L('اعرضه للعملاء','Show it to customers')}</label></div>
    <div class="panel" style="margin:0"><h3 class="h3">${L('الخيارات (اللون، المقاس…)','Options (colour, size…)')}</h3><div class="form">
     ${fld('pe_vt',L('اسم الخيار','Option name'),inp('pe_vt',e.v.t[0],'maxlength="20" placeholder="اللون"'))}${fld('pe_vte',L('بالإنجليزي','In English'),inp('pe_vte',e.v.t[1],'maxlength="20" dir="ltr" placeholder="Colour"'))}</div>
     <div class="vrows">${e.v.o.map((o,i)=>`<div class="vrow"><input class="inp" id="pv_a${i}" value="${esc(o.ar)}" maxlength="30" placeholder="${L('أسود','أسود')}" aria-label="${L('الخيار بالعربي','Option in Arabic')}"><input class="inp" id="pv_e${i}" value="${esc(o.en)}" maxlength="30" dir="ltr" placeholder="Black" aria-label="${L('الخيار بالإنجليزي','Option in English')}"><input type="color" id="pv_h${i}" value="${o.hex||'#111111'}" aria-label="${L('لون العيّنة','Swatch colour')}"><label class="chk"><input type="checkbox" id="pv_x${i}" ${o.hex?'checked':''}>${L('لون','swatch')}</label><button type="button" class="lnk" data-rmv="${i}">${L('حذف','Remove')}</button></div>`).join('')}</div>
     ${e.v.o.length<16?`<button type="button" class="lnk" data-act="addVar">+ ${L('خيار آخر','Another option')}</button>`:''}
     <p class="hint">${L('اتركها فاضية لو المنتج له نوع واحد.','Leave empty if the product has one version.')}</p></div>
    <div class="panel" style="margin:0"><h3 class="h3">${L('حول هذا المنتج','About this item')}</h3>
     <div class="vrows">${e.b.map((b,i)=>`<div class="brow"><textarea class="inp" id="pb_a${i}" maxlength="240" rows="2" placeholder="${L('ميزة بالعربي','Feature in Arabic')}">${esc(b[0])}</textarea><textarea class="inp" id="pb_e${i}" maxlength="240" rows="2" dir="ltr" placeholder="Feature in English">${esc(b[1])}</textarea><button type="button" class="lnk" data-rmb="${i}">${L('حذف','Remove')}</button></div>`).join('')}</div>
     ${e.b.length<8?`<button type="button" class="lnk" data-act="addBul">+ ${L('ميزة أخرى','Another feature')}</button>`:''}</div>
    <div class="panel" style="margin:0"><h3 class="h3">${L('التفاصيل الفنية','Technical details')}</h3><div class="form">
     ${fld('pe_w',L('الوزن (مثل 250 g)','Weight (e.g. 250 g)'),inp('pe_w',e.w,'maxlength="20" dir="ltr"'))}
     ${fld('pe_kg',L('الوزن بالكيلو للشحن','Shipping weight in kg'),inp('pe_kg',e.kg||'','type="number" min="0" step="0.1" inputmode="decimal"'),false,L('١٠ كجم فأكثر يُعتبر منتج ثقيل ويزيد يوم على التوصيل.','10 kg or more counts as heavy and adds a delivery day.'))}
     ${fld('pe_dim',L('الأبعاد','Dimensions'),inp('pe_dim',e.dim[0],'maxlength="50"'))}${fld('pe_dime',L('الأبعاد بالإنجليزي','Dimensions in English'),inp('pe_dime',e.dim[1],'maxlength="50" dir="ltr"'))}
     ${fld('pe_mat',L('الخامة','Material'),inp('pe_mat',e.mat[0],'maxlength="60"'))}${fld('pe_mate',L('الخامة بالإنجليزي','Material in English'),inp('pe_mate',e.mat[1],'maxlength="60" dir="ltr"'))}
     ${fld('pe_war',L('الضمان','Warranty'),sel('pe_war',[[0,L('بدون ضمان','None')],[1,L('سنة','1 year')],[2,L('سنتين','2 years')],[3,L('٣ سنوات','3 years')],[5,L('٥ سنوات','5 years')]],e.war))}
     ${fld('pe_org',L('بلد المنشأ','Country of origin'),inp('pe_org',e.org[0],'maxlength="30"'))}${fld('pe_orge',L('بلد المنشأ بالإنجليزي','Country of origin in English'),inp('pe_orge',e.org[1],'maxlength="30" dir="ltr"'))}
    </div></div>
    ${S.err?`<p class="err" role="alert">${esc(S.err)}</p>`:''}
    <div class="savebar"><button class="btn red" style="width:auto" type="submit" ${S.busy||S.uploading?'disabled':''}>${S.busy?L('جاري الحفظ…','Saving…'):e.isNew?L('انشر المنتج','Publish product'):L('حفظ التغييرات','Save changes')}</button>${e.isNew?'':`<button class="btn out" style="width:auto" type="button" data-pdel="${e.id}">${L('حذف المنتج','Delete product')}</button>`}</div>
   </form></section></div>`;
}
// keep what's typed when the form re-renders (adding a row, uploading a photo)
function grabEdit(){
  const e=ED;if(!e||!document.getElementById('pform'))return;
  e.ar=V('pe_ar');e.en=V('pe_en');e.c=V('pe_c')||e.c;e.sub=[V('pe_sub'),V('pe_sube')];e.model=V('pe_model');
  e.p=V('pe_p');e.o=V('pe_o');e.stock=V('pe_stock');e.cpn=V('pe_cpn');e.cost=V('pe_cost');e.cod=C('pe_cod');e.same=C('pe_same');e.active=C('pe_active');
  const em=document.querySelector('input[name="pe_e"]:checked');if(em)e.e=em.value;
  e.v.t=[V('pe_vt'),V('pe_vte')];
  e.v.o=e.v.o.map((o,i)=>({ar:V('pv_a'+i),en:V('pv_e'+i),hex:C('pv_x'+i)?V('pv_h'+i):''}));
  e.b=e.b.map((b,i)=>[V('pb_a'+i),V('pb_e'+i)]);
  e.w=V('pe_w');e.kg=V('pe_kg');e.dim=[V('pe_dim'),V('pe_dime')];e.mat=[V('pe_mat'),V('pe_mate')];e.war=Number(V('pe_war'))||0;e.org=[V('pe_org'),V('pe_orge')];
}
async function saveEdit(){
  if(!guard())return;
  grabEdit();const e=ED;
  const p=Number(e.p),o=Number(e.o)||0,stock=Math.floor(Number(e.stock)),cpn=Number(e.cpn)||0;
  if(!e.ar&&!e.en)return fail(L('اكتب اسم المنتج.','Enter the product name.'));
  if(!(p>0))return fail(L('اكتب سعر أكبر من صفر.','Enter a price above zero.'));
  if(!(stock>=0))return fail(L('اكتب الكمية المتوفرة (صفر أو أكثر).','Enter the stock (zero or more).'));
  if(cpn&&cpn>=p)return fail(L('قيمة الكوبون لازم تكون أقل من السعر.','The coupon must be less than the price.'));
  const opts=e.v.o.filter(x=>x.ar||x.en).map(x=>({ar:x.ar.slice(0,30),en:x.en.slice(0,30),hex:/^#[0-9a-fA-F]{6}$/.test(x.hex)?x.hex:''}));
  const body={s:e.s,owner:e.owner,c:e.c,sub:[e.sub[0].slice(0,50),e.sub[1].slice(0,50)],e:EMOJIS.includes(e.e)?e.e:'📦',imgs:e.imgs.filter(okAsset).slice(0,8),
    p:Math.round(p*100)/100,o:o>p?Math.round(o*100)/100:0,stock,cpn:Math.round(cpn),same:!!e.same,cod:!!e.cod,ar:e.ar.slice(0,200),en:e.en.slice(0,200),model:e.model.slice(0,50),
    w:e.w.slice(0,20),kg:Math.max(0,Number(e.kg)||0),dim:e.dim,mat:e.mat,war:e.war,org:e.org,v:{t:opts.length?e.v.t:['',''],o:opts},b:e.b.filter(x=>x[0]||x[1]).map(x=>[x[0].slice(0,240),x[1].slice(0,240)]),active:!!e.active};
  const row={shop_id:e.s,category:body.c,sub_ar:body.sub[0],sub_en:body.sub[1],emoji:body.e,images:body.imgs,price:body.p,list_price:body.o,coupon:body.cpn,stock,
    same_day:body.same,cod:body.cod,title_ar:body.ar,title_en:body.en,model:body.model,weight:body.w,kg:body.kg,dims:body.dim,material:body.mat,warranty:body.war,origin:body.org,
    options:body.v,bullets:body.b,active:body.active};
  S.busy=true;S.err='';render(true);
  try{
    let id=e.id;
    if(e.isNew){const {data,error}=await ME.sb.from('products').insert(row).select('id').single();if(error)throw error;id=data.id;}
    else{const {error}=await ME.sb.from('products').update(row).eq('id',e.id);if(error)throw error;}
    S.busy=false;toast(e.isNew?L('انتشر المنتج','Product published'):L('انحفظت التغييرات','Changes saved'));
    const cost=Number(e.cost);if(cost>0)ME.doc.costs={...ME.doc.costs,[id]:Math.round(cost*100)/100};else if(ME.doc.costs[id]!==undefined){const c={...ME.doc.costs};delete c[id];ME.doc.costs=c;}saveMe();
    ED=null;await loadCatalog();S.sellTab='products';go('sell');
  }catch(x){S.busy=false;fail(dbErr(x));}
}
function fail(m){S.err=m;render(true);const e=document.querySelector('.err[role=alert]');if(e)e.scrollIntoView({block:'center'});}
// resize photos before uploading so pages stay fast
function shrink(file){return new Promise(res=>{
  if(!/^image\//.test(file.type)||file.type==='image/svg+xml')return res(null);
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{const max=1400,k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
    const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);c.toBlob(b=>res(b),'image/jpeg',.86);};
  img.onerror=()=>{URL.revokeObjectURL(url);res(null);};img.src=url;});}
// photos go to storage under the person's own folder; the product keeps the path
async function uploadPhoto(blob){
  const path=`${ME.uid}/${crypto.randomUUID()}.jpg`;
  const {error}=await ME.sb.storage.from('photos').upload(path,blob,{contentType:'image/jpeg',cacheControl:'31536000',upsert:false});
  if(error)throw error;return path;
}
async function uploadImgs(files,target){
  const T=target||ED;if(!ME.uid||!T)return;
  if(T===ED)grabEdit();else if(typeof grabAd==='function')grabAd();
  S.uploading=true;render(true);
  let bad=0;
  for(const f of [...files].slice(0,8-T.imgs.length)){
    const b=await shrink(f);if(!b){bad++;continue;}
    try{T.imgs.push(await uploadPhoto(b));}catch(e){bad++;}
  }
  S.uploading=false;render(true);
  if(bad)toast(L(`ما انرفعت ${num(bad)} صورة. جرّب صور JPG أو PNG أصغر من ٣ ميجا.`,`${bad} photo(s) didn’t upload. Try JPG or PNG under 3 MB.`),true);
}

/* ───────── seller earnings ───────── */
// what one order means in money for its store: the customer pays for the items, NILE+ keeps its
// commission (at the rate in force when the order was placed), and the seller's own cost comes off last
function orderMoney(o){
  const sales=Math.max(0,o.sub-o.cpn),rate=o.rate>=0?o.rate:S2().comm,comm=Math.round(sales*rate)/100;
  let cost=0,missing=0;o.items.forEach(i=>{const c=ME.doc.costs[i.pid];if(c>0)cost+=c*i.q;else missing++;});
  return {sales,rate,comm,net:sales-comm,cost,missing,profit:sales-comm-cost};
}
// where the money stands: still travelling, held during the return window, or due to the seller
function moneyState(o,st){
  if(['cancelled','returned','refunded'].includes(o.status))return 'lost';
  if(['placed','packed','shipped','out'].includes(o.status))return 'transit';
  if(o.status==='return_req')return 'held';
  const del=(o.tl.find(e=>e.s==='delivered')||{}).at||o.updatedAt;
  return Date.now()-del<(st?st.ret:15)*864e5&&o.status!=='return_rej'?'held':'due';
}
const MSTATE={transit:['في الطريق','On the way','st-shipped'],held:['محجوز لين تخلص مدة الإرجاع','Held during the return window','st-placed'],due:['مستحق لك','Due to you','st-delivered'],lost:['ملغي أو مرتجع','Cancelled or returned','st-cancelled']};
function vMoney(s,os,ps){
  const per=S.mPer||'month',now=new Date(),day=864e5;
  const from={month:new Date(now.getFullYear(),now.getMonth(),1).getTime(),'30':Date.now()-30*day,year:new Date(now.getFullYear(),0,1).getTime(),all:0}[per];
  const inPer=os.filter(o=>o.createdAt>=from);
  const counted=inPer.filter(o=>moneyState(o,s)!=='lost').map(o=>({o,m:orderMoney(o)}));
  const sum=k=>counted.reduce((a,x)=>a+x.m[k],0);
  const sales=sum('sales'),comm=sum('comm'),net=sum('net'),cost=sum('cost'),profit=sum('profit');
  const units=counted.reduce((a,x)=>a+x.o.items.reduce((b,i)=>b+i.q,0),0);
  const lost=inPer.filter(o=>moneyState(o,s)==='lost');
  // balances are all-time: where every order's money stands today
  const bal={transit:0,held:0,due:0};os.forEach(o=>{const k=moneyState(o,s);if(bal[k]!==undefined)bal[k]+=orderMoney(o).net;});
  // chart: days for a month, months for longer periods
  const daily=per==='month'||per==='30';let buckets=[];
  if(daily){const start=new Date(from);start.setHours(0,0,0,0);for(let t=start.getTime();t<=Date.now();t+=day)buckets.push({k:new Date(t).toDateString(),lab:new Date(t).getDate(),v:0,n:0});}
  else{const first=per==='year'?new Date(now.getFullYear(),0,1):new Date(Math.min(...os.map(o=>o.createdAt),Date.now()));let y=first.getFullYear(),m=first.getMonth();
    while((y<now.getFullYear()||(y===now.getFullYear()&&m<=now.getMonth()))&&buckets.length<36){buckets.push({k:y+'-'+m,lab:new Date(y,m,1).toLocaleDateString(S.ar?'ar-EG':'en-GB',{month:'short'}),v:0,n:0});if(++m>11){m=0;y++;}}}
  counted.forEach(({o,m})=>{const d=new Date(o.createdAt),b=buckets.find(x=>x.k===(daily?d.toDateString():d.getFullYear()+'-'+d.getMonth()));if(b){b.v+=m.net;b.n+=m.sales;}});
  const top=Math.max(1,...buckets.map(b=>b.n));
  // per product, over the same orders
  const byP={};counted.forEach(({o,m})=>o.items.forEach(i=>{const x=byP[i.pid]=byP[i.pid]||{pid:i.pid,name:[i.ar,i.en],q:0,sales:0,comm:0,cost:0,hasCost:ME.doc.costs[i.pid]>0};
    const v=(i.p-i.cpn)*i.q,c=Math.round(v*m.rate)/100;x.q+=i.q;x.sales+=v;x.comm+=c;x.cost+=(ME.doc.costs[i.pid]||0)*i.q;}));
  const rows=Object.values(byP).sort((a,b)=>b.sales-a.sales);
  const noCost=rows.filter(r=>!r.hasCost);
  const rate=s.comm;
  const paid=D.payouts.filter(x=>x.s===s.id).reduce((t,x)=>t+x.amount,0);
  return`<div class="chips">${[['month',L('هالشهر','This month')],['30',L('آخر ٣٠ يوم','Last 30 days')],['year',L('هالسنة','This year')],['all',L('من البداية','All time')]].map(([k,t])=>`<button class="chip" data-mper="${k}" aria-pressed="${per===k}">${t}</button>`).join('')}</div>
   <div class="kpis money">
    <div><b>${money(sales)}</b>${L('المبيعات','Sales')}</div>
    <div><b class="redc">−${money(comm)}</b>${L('عمولة نيل +','NILE+ commission')}</div>
    <div class="hi"><b>${money(net)}</b>${L('صافي لك','Your net')}</div>
    <div><b>${cost?'−'+money(cost):'—'}</b>${L('تكلفة البضاعة','Cost of goods')}</div>
    <div class="hi"><b class="${profit<0?'redc':'okc'}">${money(profit)}</b>${L('ربحك','Your profit')}</div>
    <div><b>${num(counted.length)}</b>${L('طلبات','Orders')}</div>
    <div><b>${num(units)}</b>${L('قطعة مباعة','Units sold')}</div>
    <div><b>${counted.length?money(sales/counted.length):'—'}</b>${L('متوسط الطلب','Average order')}</div>
   </div>
   ${noCost.length?`<div class="note">${L(`أضف «سعر التكلفة» لـ${num(noCost.length)} منتج عشان يطلع ربحك صح. الحين محسوب كأن تكلفتها صفر:`,`Add a “cost per unit” to ${noCost.length} product(s) so your profit is right. They count as zero cost for now:`)} ${noCost.slice(0,5).map(r=>{const p=prod(r.pid);return p&&isMine(p.owner)?`<button class="lnk" data-edit="${p.id}">${tx(r.name)}</button>`:`<span>${tx(r.name)}</span>`;}).join('، ')}</div>`:''}
   <section class="panel"><div class="ph"><h2 style="font-size:17px">${L('صافي المبيعات','Net sales')} ${daily?L('باليوم','by day'):L('بالشهر','by month')}</h2><span class="muted" style="font-size:12.5px">${L('العمود كامل = المبيعات، الجزء الغامق = صافيك','Full bar = sales, dark part = your net')}</span></div>
    ${counted.length?`<div class="chart" role="img" aria-label="${L('رسم المبيعات','Sales chart')}">${buckets.map((b,i)=>`<div class="bc" title="${esc(String(b.lab))}: ${money(b.n)} · ${L('صافي','net')} ${money(b.v)}"><div class="bar" style="height:${b.n/top*100}%"><i style="height:${b.n?b.v/b.n*100:0}%"></i></div><small>${daily&&buckets.length>12&&i%3?'':esc(String(typeof b.lab==='number'?num(b.lab):b.lab))}</small></div>`).join('')}</div>`:`<p class="muted" style="margin:0">${L('ما فيه مبيعات في هالفترة.','No sales in this period.')}</p>`}</section>
   <div class="two" style="margin-top:14px">
    <section class="panel" style="margin:0"><h3 class="h3">${L('وين وصلت فلوسك','Where your money stands')}</h3>
     <div class="lrow"><span>🚚 ${L('طلبات في الطريق','Orders on the way')}</span><b class="tn">${money(bal.transit)}</b></div>
     <div class="lrow"><span>⏳ ${L('محجوز لين تخلص مدة الإرجاع','Held during the return window')}</span><b class="tn">${money(bal.held)}</b></div>
     <div class="lrow"><span>✅ ${L('صار مستحق (بعد مدة الإرجاع)','Earned (after the return window)')}</span><b class="tn">${money(bal.due)}</b></div>
     <div class="lrow"><span>🏦 ${L('حوّلته لك نيل +','Transferred to you by NILE+')}</span><b class="tn">−${money(paid)}</b></div>
     <div class="lrow" style="font-size:15px"><span><b>${L('رصيدك اللي ينتظر التحويل','Your balance awaiting transfer')}</b></span><b class="tn okc">${money(Math.max(0,bal.due-paid))}</b></div>
     ${D.payouts.some(x=>x.s===s.id)?`<details style="margin-top:8px"><summary class="lnk">${L('سجل التحويلات','Transfer history')}</summary>${D.payouts.filter(x=>x.s===s.id).map(x=>`<div class="lrow"><span>${fmtFull(x.at)}${x.ref?` · <span dir="ltr">${esc(x.ref)}</span>`:''}</span><b class="tn">${money(x.amount)}</b></div>`).join('')}</details>`:''}
     <p class="muted" style="font-size:12.5px;margin:8px 0 0">${L(`نيل + يستلم المبلغ من العميل، ويخصم عمولته (${num(rate)}٪)، ويحوّل لك الصافي بعد ما تخلص مدة الإرجاع (${num(s.ret)} يوم). رسوم التوصيل والدفع عند الاستلام والتغليف لنيل + وما تدخل في حسابك.`,`NILE+ collects from the customer, keeps its commission (${rate}%) and transfers your net once the ${s.ret}-day return window ends. Delivery, pay-on-delivery and gift-wrap fees go to NILE+ and aren’t part of your earnings.`)}</p></section>
    <section class="panel" style="margin:0"><h3 class="h3">${L('في هالفترة','In this period')}</h3>
     <div class="lrow"><span>${L('طلبات ملغاة أو مرتجعة','Cancelled or returned orders')}</span><b class="tn">${num(lost.length)}</b></div>
     <div class="lrow"><span>${L('قيمتها','Their value')}</span><b class="tn">${money(lost.reduce((a,o)=>a+orderMoney(o).sales,0))}</b></div>
     <div class="lrow"><span>${L('هامش ربحك','Your profit margin')}</span><b class="tn">${sales?num(Math.round(profit/sales*1000)/10)+'٪':'—'}</b></div>
     <div class="lrow"><span>${L('المنتجات المعروضة','Products listed')}</span><b class="tn">${num(ps.filter(visible).length)}</b></div></section></div>
   <section class="panel"><h3 class="h3">${L('الأرباح حسب المنتج','Earnings by product')}</h3>
    ${rows.length?`<div class="tbl-wrap"><table class="adm"><tr><th>${L('المنتج','Product')}</th><th>${L('القطع','Units')}</th><th>${L('المبيعات','Sales')}</th><th>${L('العمولة','Commission')}</th><th>${L('الصافي','Net')}</th><th>${L('التكلفة','Cost')}</th><th>${L('الربح','Profit')}</th></tr>
     ${rows.map(r=>{const pr=r.sales-r.comm-r.cost;return`<tr><td>${prod(r.pid)?`<button class="lnk clamp2" data-open="${r.pid}">${tx(r.name)}</button>`:tx(r.name)}</td><td class="tn">${num(r.q)}</td><td class="tn">${money(r.sales)}</td><td class="tn">${money(r.comm)}</td><td class="tn">${money(r.sales-r.comm)}</td><td class="tn">${r.hasCost?money(r.cost):'—'}</td><td class="tn ${pr<0?'redc':''}"><b>${money(pr)}</b></td></tr>`;}).join('')}</table></div>`:`<p class="muted" style="margin:0">${L('ما فيه مبيعات في هالفترة.','No sales in this period.')}</p>`}</section>
   <section class="panel"><h3 class="h3">${L('الطلبات','Orders')}</h3>
    ${inPer.length?`<div class="tbl-wrap"><table class="adm"><tr><th>${L('الطلب','Order')}</th><th>${L('التاريخ','Date')}</th><th>${L('المبيعات','Sales')}</th><th>${L('العمولة','Commission')}</th><th>${L('صافي لك','Your net')}</th><th>${L('حالة المبلغ','Money')}</th></tr>
     ${inPer.slice(0,100).map(o=>{const m=orderMoney(o),k=moneyState(o,s),st=MSTATE[k];return`<tr><td><button class="lnk tn" data-order="${o.id}" dir="ltr">${esc(o.no)}</button></td><td>${fmtFull(o.createdAt)}</td><td class="tn">${money(m.sales)}</td><td class="tn">${money(m.comm)} <small class="muted">(${num(m.rate)}٪)</small></td><td class="tn"><b>${k==='lost'?'—':money(m.net)}</b></td><td><span class="stp ${st[2]}">${S.ar?st[0]:st[1]}</span></td></tr>`;}).join('')}</table></div>`:`<p class="muted" style="margin:0">${L('ما فيه طلبات في هالفترة.','No orders in this period.')}</p>`}</section>`;
}

/* ───────── NILE+ owner dashboard ─────────
   Only accounts in the admins table get data here; the database refuses everyone else. */
const AD_={shops:{},priv:{},orders:{},ads:{},pays:[],payouts:[],reports:[],users:[],docs:{},banners:[],loaded:false};
const AS={tab:'home',ordF:'all',adF:'pending',shopF:'all',q:'',detail:'',per:'month'};

/* ───── loading ───── */
async function aLoad(){
  const sb=ME.sb;
  try{
    const [sh,pv,pr,od,ad,pa,po,rp,rv,st]=await Promise.all([
      q(sb.from('shops').select('*').order('created_at',{ascending:false}).limit(1000)),q(sb.from('shop_private').select('*').limit(1000)),
      q(sb.from('products').select('*').limit(2000)),q(sb.from('orders').select('*').order('created_at',{ascending:false}).limit(2000)),
      q(sb.from('ads').select('*').order('created_at',{ascending:false}).limit(1000)),q(sb.from('ad_payments').select('*').order('created_at',{ascending:false}).limit(2000)),
      q(sb.from('payouts').select('*').order('created_at',{ascending:false}).limit(2000)),q(sb.from('reports').select('*').order('created_at',{ascending:false}).limit(1000)),
      q(sb.from('reviews').select('*').limit(2000)),q(sb.from('settings').select('*').eq('id',1))]);
    intoMap(D.stores,sh.map(normS));AD_.shops=D.stores;
    AD_.priv=Object.fromEntries(pv.map(x=>[x.shop_id,{manager:str(x.manager_name,80),phone:str(x.contact_phone,16),email:str(x.contact_email,120),file:x.cr_file}]));
    intoMap(D.products,pr.map(normP));Object.values(D.products).forEach(p=>{p.owner=(D.stores[p.s]||{}).owner||'';});
    intoMap(AD_.orders,od.map(normO));
    intoMap(D.ads,ad.map(normA));
    AD_.pays=pa.map(p=>({id:p.id,ad:p.ad_id,uid:p.user_id,kind:p.kind,amount:nn(p.amount),days:p.days,method:p.method,ref:str(p.reference,80),status:p.status,note:str(p.note,300),at:ts(p.created_at),dec:ts(p.decided_at)}));
    AD_.payouts=po.map(p=>({id:p.id,s:p.shop_id,amount:nn(p.amount),ref:str(p.reference,80),note:str(p.note,300),at:ts(p.created_at)}));
    AD_.reports=rp.map(r=>({id:r.id,by:r.user_id,kind:r.kind,ref:r.ref,reason:r.reason,note:str(r.note,600),status:r.status,at:ts(r.created_at)}));
    intoMap(D.reviews,rv.map(normR));
    const s=st[0]||{};
    AD_.set=s;D.settings={freeOver:nn(s.free_over,0,1e4),std:nn(s.fee_std,0,1e4),next:nn(s.fee_next,0,1e4),same:nn(s.fee_same,0,1e4),cod:nn(s.fee_cod,0,1e4),gift:nn(s.fee_gift,0,1e4),
      comm:nn(s.comm,0,50),adFee:nn(s.ad_fee,0,1e4),adDays:Math.floor(nn(s.ad_days,1,365)),payInfo:str(s.pay_info,1000),reviewMin:Math.floor(nn(s.review_minutes,0,1440))};
    // signed links to the registration documents, valid for an hour
    const paths=Object.values(AD_.priv).map(x=>x.file).filter(Boolean);
    if(paths.length){const {data}=await sb.storage.from('cr-docs').createSignedUrls(paths,3600);(data||[]).forEach(d=>{if(d.signedUrl)AD_.docs[d.path]=d.signedUrl;});}
    try{const bn=await q(sb.from('banners').select('*').order('created_at',{ascending:false}).limit(500));AD_.banners=bn.map(b=>({id:b.id,t:str(b.title,120),by:str(b.advertiser,120),img:b.image,link:str(b.link,500),place:b.placement,from:ts(b.starts_at),to:ts(b.ends_at),on:!!b.active,sort:b.sort,price:nn(b.price),clicks:b.clicks|0,at:ts(b.created_at)}));}catch(e){AD_.banners=[];}
    try{const {data}=await sb.rpc('admin_ai_status');AD_.ai=data||{};}catch(e){AD_.ai={};}
    try{const {data}=await sb.rpc('admin_users');AD_.users=data||[];(data||[]).forEach(u=>{if(u.full_name)NAMES[u.id]=u.full_name;});}catch(e){}
    AD_.loaded=true;
  }catch(e){console.warn('[NILE+ admin]',e);toast(dbErr(e),true);}
  render();
}
let aT=0;const aReload=()=>{clearTimeout(aT);aT=setTimeout(aLoad,400);};

/* ───── money ───── */
const shopOrders=sid=>Object.values(AD_.orders).filter(o=>o.s===sid);
function shopBalance(s){
  const b={sales:0,comm:0,transit:0,held:0,due:0,paid:0};
  shopOrders(s.id).forEach(o=>{const k=moneyState(o,s);if(k==='lost')return;const m=orderMoney(o);b.sales+=m.sales;b.comm+=m.comm;b[k]+=m.net;});
  b.paid=AD_.payouts.filter(p=>p.s===s.id).reduce((a,p)=>a+p.amount,0);
  b.owed=Math.max(0,b.due-b.paid);
  return b;
}
function siteIncome(){
  let comm=0,fees=0,gmv=0,n=0;
  Object.values(AD_.orders).forEach(o=>{if(['cancelled','returned','refunded'].includes(o.status))return;n++;gmv+=o.total;comm+=orderMoney(o).comm;fees+=o.fees.del+o.fees.cod+o.fees.gift;});
  const ads=AD_.pays.filter(p=>p.status==='confirmed').reduce((a,p)=>a+p.amount,0),bnr=AD_.banners.reduce((a,b)=>a+b.price,0);
  return {gmv,comm,fees,ads,bnr,n,total:comm+fees+ads+bnr};
}
const userOf=id=>AD_.users.find(u=>u.id===id)||{};
const uname=id=>{const u=userOf(id);return `<span>${esc(u.full_name||'—')}</span>${u.email?`<div class="muted" style="font-size:12px" dir="ltr">${esc(u.email)}</div>`:''}`;};
const shopStatus=s=>`<span class="stp ${{pending:'st-placed',approved:'st-delivered',rejected:'st-cancelled',suspended:'st-return_req'}[s.status]}">${{pending:L('قيد المراجعة','Pending'),approved:L('معتمد','Approved'),rejected:L('مرفوض','Rejected'),suspended:L('موقوف','Suspended')}[s.status]}</span>`;

/* ───── sample data and new orders ───── */
const demoCount=()=>({shops:Object.values(AD_.shops).filter(s=>s.sample).length,ads:Object.values(D.ads).filter(a=>a.demo).length,orders:Object.values(AD_.orders).filter(o=>(store(o.s)||{}).sample).length});
function demoNote(){
  const c=demoCount();if(!c.shops&&!c.ads)return'';
  return`<div class="note demo-note"><div style="flex:1;min-width:220px"><b>${L('فيه بيانات تجريبية في الموقع','There is sample data on the site')}</b> ${demoTag({demo:1})}
    <div class="muted" style="font-size:12.5px">${L(`${num(c.shops)} متاجر، ${num(c.orders)} طلب، ${num(c.ads)} إعلان أفراد، عشان تشوف كيف تشتغل اللوحة. عليها علامة «تجريبي» وما تستقبل طلبات ولا رسائل من العملاء. احذفها قبل الإطلاق.`,`${c.shops} shops, ${c.orders} orders and ${c.ads} individual ads so you can see how the dashboard works. They’re marked “Sample” and take no orders or messages. Delete them before launch.`)}</div></div>
   <button class="btn out" style="width:auto" data-aact="cleardemo">🗑 ${L('احذف البيانات التجريبية','Delete sample data')}</button></div>`;
}
const newOrders=()=>Object.values(AD_.orders).filter(o=>o.status==='placed').sort((a,b)=>b.createdAt-a.createdAt);
const accBtns=o=>`<div class="acts2"><button class="btn red" style="width:auto;height:32px;font-size:13px" data-oacc="${o.id}">✓ ${L('اقبل','Accept')}</button><button class="btn out" style="width:auto;height:32px;font-size:13px" data-orej="${o.id}">✖ ${L('ارفض','Reject')}</button></div>`;
function newOrdersPanel(){
  const l=newOrders();if(!l.length)return'';
  return`<section class="panel"><div class="orow"><h3 class="h3" style="margin:0">🛎 ${L('طلبات جديدة تنتظر قبولك','New orders waiting for you')} <span class="cnt">${num(l.length)}</span></h3>${l.length>8?`<button class="lnk" data-aordgo="new">${L('كلها','See all')}</button>`:''}</div>
   <p class="muted" style="font-size:12.5px;margin:4px 0 8px">${L('«اقبل» يأكد الطلب ويبدأ تجهيزه. «ارفض» يلغيه ويرجع المخزون، والسبب يوصل للعميل.','“Accept” confirms the order so it gets prepared. “Reject” cancels it, puts the stock back and tells the customer why.')}</p>
   ${l.slice(0,8).map(o=>`<div class="payrow"><div style="flex:1;min-width:200px"><b class="tn" dir="ltr">${esc(o.no)}</b> <span class="muted" style="font-size:12px">· ${ago(o.createdAt)}</span>
     <div style="font-size:13px">${sname(store(o.s))} ${demoTag(store(o.s))}</div><div style="font-size:12.5px">${itemsTxt(o)}</div>
     <div class="muted" style="font-size:12px">${esc(o.addr.name)} · ${cityName(cityOf(o.addr.city))} · ${o.pay==='cardod'?L('بطاقة عند الاستلام','Card on delivery'):L('نقدًا','Cash')}</div></div>
    <b class="tn" style="font-size:16px">${money(o.total)}</b>${accBtns(o)}</div>`).join('')}</section>`;
}

/* ───── pages ───── */

/* ───── completed vs not-completed orders ───── */
// done = the customer received and kept it; open = still on its way; ret = returned or being returned; cancelled = never delivered
const OB_=()=>[['done',L('تمّت','Completed'),'✅',o=>['delivered','return_rej'].includes(o.status)],['open',L('جارية','In progress'),'🚚',o=>['placed','packed','shipped','out'].includes(o.status)],
  ['ret',L('مرتجعة','Returned'),'↩️',o=>['return_req','returned','refunded'].includes(o.status)],['cancelled',L('ملغاة','Cancelled'),'✖',o=>o.status==='cancelled']];
const PER_=()=>[['today',L('اليوم','Today')],['7',L('آخر ٧ أيام','Last 7 days')],['month',L('هالشهر','This month')],['all',L('من البداية','All time')]];
function perFrom(){const n=new Date();return {today:new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime(),'7':Date.now()-7*864e5,month:new Date(n.getFullYear(),n.getMonth(),1).getTime(),all:0}[AS.per]??0;}
const perOrders=()=>Object.values(AD_.orders).filter(o=>o.createdAt>=perFrom());
// cancelled and returned orders earn no commission or fees
function sumOf(l){return l.reduce((a,o)=>{const m=orderMoney(o),lost=['cancelled','return_req','returned','refunded'].includes(o.status);a.n++;a.total+=o.total;a.sales+=m.sales;if(!lost){a.comm+=m.comm;a.fees+=o.fees.del+o.fees.cod+o.fees.gift;}return a;},{n:0,total:0,sales:0,comm:0,fees:0});}
const perChips=()=>`<div class="chips" style="margin:0 0 10px">${PER_().map(([k,t])=>`<button class="chip" data-per="${k}" aria-pressed="${AS.per===k}">${t}</button>`).join('')}</div>`;
function ordersSummary(){
  const l=perOrders(),b=Object.fromEntries(OB_().map(([k,,,f])=>[k,sumOf(l.filter(f))])),not=sumOf(l.filter(o=>!OB_()[0][3](o))),closed=b.done.n+b.ret.n+b.cancelled.n;
  return`<section class="panel"><div class="orow"><h3 class="h3" style="margin:0">${L('حسبة الطلبات','Orders tally')}</h3><span class="muted" style="font-size:12.5px">${L(`${num(l.length)} طلب`,`${l.length} orders`)}</span></div>
   <div style="margin-top:8px">${perChips()}</div>
   <div class="obig"><button class="ob ok" data-aordgo="done"><span>${OB_()[0][2]} ${OB_()[0][1]}</span><b>${num(b.done.n)}</b><small>${money(b.done.total)}</small></button>
    <button class="ob no" data-aordgo="notdone"><span>⏳ ${L('لم تتم','Not completed')}</span><b>${num(not.n)}</b><small>${money(not.total)}</small></button></div>
   <div class="tbl-wrap" style="margin-top:10px"><table class="adm"><tr><th>${L('الحالة','Status')}</th><th>${L('العدد','Count')}</th><th>${L('قيمة الطلبات','Order value')}</th><th>${L('قيمة المنتجات','Items value')}</th><th>${L('عمولتك','Your commission')}</th><th>${L('رسوم التوصيل والدفع','Delivery & payment fees')}</th></tr>
    ${OB_().map(([k,t,ic])=>{const x=b[k],act=k==='done',exp=k==='open';return`<tr class="clk" data-aordgo="${k}"><td>${ic} ${t}</td><td class="tn"><b>${num(x.n)}</b></td><td class="tn">${money(x.total)}</td><td class="tn">${money(x.sales)}</td>
     <td class="tn">${act?`<b class="okc">${money(x.comm)}</b>`:exp?`<span class="muted">${money(x.comm)} ${L('متوقعة','expected')}</span>`:`<span class="muted">—</span>`}</td><td class="tn">${act?money(x.fees):exp?`<span class="muted">${money(x.fees)}</span>`:'—'}</td></tr>`;}).join('')}
    <tr class="totrow"><td>${L('الكل','All')}</td><td class="tn">${num(l.length)}</td><td class="tn">${money(sumOf(l).total)}</td><td class="tn">${money(sumOf(l).sales)}</td><td></td><td></td></tr></table></div>
   <p class="muted" style="font-size:12.5px;margin:8px 0 0">${closed?L(`نسبة الإتمام: ${num(Math.round(b.done.n/closed*100))}٪ من الطلبات المنتهية وصلت للعميل وما رجعت.`,`Completion rate: ${Math.round(b.done.n/closed*100)}% of finished orders were delivered and kept.`):L('ما فيه طلبات منتهية في هالفترة.','No finished orders in this period.')}
    ${L(' الطلبات الملغاة والمرتجعة ما عليها عمولة ولا رسوم.',' Cancelled and returned orders carry no commission or fees.')}</p></section>`;
}
function aHome(){
  const inc=siteIncome(),pend=Object.values(AD_.shops).filter(s=>s.status==='pending'),pays=AD_.pays.filter(p=>p.status==='pending'),reps=AD_.reports.filter(r=>r.status==='open');
  const owed=Object.values(AD_.shops).reduce((a,s)=>a+shopBalance(s).owed,0);
  const live=Object.values(D.ads).filter(adLive).length;
  return`${demoNote()}<div class="kpis"><div class="hi"><b>${money(inc.total)}</b>${L('دخل نيل +','NILE+ income')}</div><button class="kbtn" data-kdet="comm"><b>${money(inc.comm)}</b>${L('عمولات المتاجر','Shop commissions')}<small>${L('التفاصيل ‹','Details ›')}</small></button><div><b>${money(inc.fees)}</b>${L('رسوم التوصيل والدفع','Delivery & payment fees')}</div><button class="kbtn" data-kdet="ads"><b>${money(inc.ads)}</b>${L('رسوم إعلانات الأفراد','Individual ad fees')}<small>${L('التفاصيل ‹','Details ›')}</small></button><button class="kbtn" data-atab="banners"><b>${money(inc.bnr)}</b>${L('البانرات الإعلانية','Advertising banners')}<small>${L('التفاصيل ‹','Details ›')}</small></button>
    <div><b>${money(inc.gmv)}</b>${L('قيمة الطلبات','Order value')}</div><div><b>${num(inc.n)}</b>${L('طلبات قائمة ومكتملة','Active & completed orders')}</div><button class="kbtn" data-kdet="owed"><b class="${owed?'redc':''}">${money(owed)}</b>${L('مستحق للمتاجر الحين','Owed to shops now')}<small>${L('التفاصيل ‹','Details ›')}</small></button>
    <div><b>${num(Object.values(AD_.shops).filter(s=>s.status==='approved').length)}</b>${L('متاجر معتمدة','Approved shops')}</div><div><b>${num(live)}</b>${L('إعلانات أفراد ظاهرة','Live individual ads')}</div><div><b>${num(AD_.users.length)}</b>${L('مستخدمين','Users')}</div></div>
   ${newOrdersPanel()}
   ${ordersSummary()}
   <div class="two">
    <section class="panel" style="margin:0"><h3 class="h3">${L('يحتاج قرارك','Needs your decision')}</h3>
     ${pend.length||pays.length||reps.length||owed||newOrders().length?`<ul class="todo">${newOrders().length?`<li><button class="lnk" data-aordgo="new">${L(`${num(newOrders().length)} طلب جديد ينتظر قبولك`,`${newOrders().length} new orders to accept`)}</button></li>`:''}${pend.length?`<li><button class="lnk" data-atab="apps">${L(`${num(pend.length)} طلب تسجيل شركة`,`${pend.length} company registrations`)}</button></li>`:''}
      ${pays.length?`<li><button class="lnk" data-atab="ads">${L(`${num(pays.length)} دفعة إعلان تنتظر التأكيد`,`${pays.length} ad payments to confirm`)}</button></li>`:''}
      ${reps.length?`<li><button class="lnk" data-atab="reports">${L(`${num(reps.length)} بلاغ مفتوح`,`${reps.length} open reports`)}</button></li>`:''}
      ${revN()?`<li><button class="lnk" data-atab="review">${L(`${num(revN())} منشور ينتظر قرارك في المراجعة`,`${revN()} posts waiting for your review decision`)}</button></li>`:''}
      ${owed?`<li><button class="lnk" data-kdet="owed">${L(`${money(owed)} مستحقة للمتاجر وتنتظر التحويل`,`${money(owed)} owed to shops, awaiting transfer`)}</button></li>`:''}</ul>`:`<p class="muted" style="margin:0">${L('كل شي تمام.','All caught up.')}</p>`}</section>
    <section class="panel" style="margin:0"><h3 class="h3">${L('آخر الطلبات','Latest orders')}</h3>${Object.values(AD_.orders).slice(0,8).map(o=>`<div class="lrow"><span class="tn" dir="ltr">${esc(o.no)}</span><span>${sname(store(o.s))}</span><span class="tn">${money(o.total)}</span>${statusPill(o.status)}</div>`).join('')||`<p class="muted" style="margin:0">${L('ما فيه طلبات للحين.','No orders yet.')}</p>`}</section></div>`;
}
function aApps(){
  const l=Object.values(AD_.shops).filter(s=>s.status==='pending'||(AS.shopF==='all'&&s.status==='rejected')).sort((a,b)=>(a.status==='pending'?-1:1)-(b.status==='pending'?-1:1)||a.createdAt-b.createdAt);
  return l.length?l.map(s=>{const p=AD_.priv[s.id]||{},doc=p.file&&AD_.docs[p.file];
    return`<section class="panel appcard"><div class="orow"><div style="display:flex;gap:10px;align-items:center">${logo(s,48)}<div><b style="font-size:17px">${sname(s)}</b> ${demoTag(s)}<div class="muted" style="font-size:12.5px">${L('قدّم','Submitted')} ${fmtFull(s.createdAt)}</div></div></div>${shopStatus(s)}</div>
     <div class="two" style="margin-top:12px"><dl class="kv" style="font-size:14px"><dt>${L('السجل التجاري','Commercial reg.')}</dt><dd dir="ltr" style="text-align:start" class="sel"><b>${esc(s.cr)}</b></dd><dt>${L('النشاط التجاري','Activity')}</dt><dd>${esc(s.activity)}</dd>
       <dt>${L('المدير المخوّل','Authorised manager')}</dt><dd class="sel">${esc(p.manager||'—')}</dd><dt>${L('رقم التواصل','Contact number')}</dt><dd dir="ltr" style="text-align:start" class="sel">${esc(p.phone||'—')}</dd>
       <dt>${L('البريد','Email')}</dt><dd dir="ltr" style="text-align:start" class="sel">${esc(p.email||'—')}</dd><dt>${L('حساب المسجّل','Account')}</dt><dd>${uname(s.owner)}</dd>
       <dt>${L('المدينة','City')}</dt><dd>${cityName(cityOf(s.city))}</dd><dt>${L('مدة الإرجاع','Return window')}</dt><dd>${L(`${num(s.ret)} يوم`,`${s.ret} days`)}</dd><dt>${L('وافق على الشروط','Accepted terms')}</dt><dd>✓</dd></dl>
      <div>${doc?`<a class="btn out" style="display:inline-grid;place-items:center;width:auto;text-decoration:none" href="${esc(doc)}" target="_blank" rel="noopener">📄 ${L('افتح السجل التجاري','Open the registration document')}</a>`:`<span class="muted">${L('ما فيه ملف.','No file.')}</span>`}
       <p class="muted" style="font-size:12.5px">${tx(s.d)}</p>${s.note?`<div class="note">${L('سبب الرفض السابق:','Earlier rejection reason:')} ${esc(s.note)}</div>`:''}</div></div>
     ${s.status==='pending'?`<div class="decide"><label class="fld" style="max-width:160px"><span class="flab">${L('العمولة ٪','Commission %')}</span><input class="inp" id="cm_${s.id}" type="number" min="0" max="50" step="0.5" value="${s.comm}"></label>
      <button class="btn red" style="width:auto" data-approve="${s.id}">✓ ${L('اعتمد المتجر','Approve shop')}</button>
      <input class="inp" id="rj_${s.id}" maxlength="500" placeholder="${L('سبب الرفض (يوصل للشركة)','Rejection reason (sent to the company)')}" style="flex:1;min-width:200px">
      <button class="btn out" style="width:auto" data-reject="${s.id}">✖ ${L('ارفض','Reject')}</button></div>`:''}</section>`;}).join('')
   :`<div class="panel" style="text-align:center"><p class="muted">${L('ما فيه طلبات تسجيل تنتظر.','No registrations waiting.')}</p></div>`;
}
function aShops(){
  const l=Object.values(AD_.shops).filter(s=>s.status!=='pending'&&s.status!=='rejected');
  return l.length?`<div class="tbl-wrap"><table class="adm"><tr><th>${L('المتجر','Shop')}</th><th>${L('الحالة','Status')}</th><th>${L('العمولة ٪','Commission %')}</th><th>${L('المبيعات','Sales')}</th><th>${L('عمولتنا','Our commission')}</th><th>${L('في الطريق/محجوز','In transit/held')}</th><th>${L('مستحق لهم','Owed to them')}</th><th>${L('موثّق','Verified')}</th><th>${L('يشحنه نيل +','NILE+ ships')}</th><th></th></tr>
   ${l.map(s=>{const b=shopBalance(s),p=AD_.priv[s.id]||{};return`<tr><td><div class="tp2">${logo(s,30)}<div><a href="index.html?s=${s.id}" target="_blank" rel="noopener">${sname(s)}</a> ${demoTag(s)}<div class="muted" style="font-size:12px">${esc(p.manager||'')} · <span dir="ltr">${esc(p.phone||'')}</span></div></div></div></td>
    <td>${shopStatus(s)}</td><td><input class="inp" style="width:80px;min-height:32px" type="number" min="0" max="50" step="0.5" value="${s.comm}" data-scomm="${s.id}" aria-label="${L('العمولة','Commission')}"></td>
    <td class="tn">${money(b.sales)}</td><td class="tn">${money(b.comm)}</td><td class="tn">${money(b.transit+b.held)}</td><td class="tn ${b.owed?'redc':''}"><b>${money(b.owed)}</b></td>
    <td><label class="chk"><input type="checkbox" data-sflag="${s.id}" data-k="verified" ${s.ver?'checked':''} aria-label="${L('موثّق','Verified')}"></label></td>
    <td><label class="chk"><input type="checkbox" data-sflag="${s.id}" data-k="fulfilled" ${s.ful?'checked':''} aria-label="${L('يشحنه نيل +','NILE+ ships')}"></label></td>
    <td><div class="acts2">${b.owed?`<button class="lnk" data-payout="${s.id}">${L('سجّل تحويل','Record transfer')}</button>`:''}${s.status==='approved'?`<button class="lnk" data-suspend="${s.id}">${L('أوقف','Suspend')}</button>`:`<button class="lnk" data-reactivate="${s.id}">${L('فعّل','Reactivate')}</button>`}</div></td></tr>`;}).join('')}</table></div>
   <p class="muted" style="font-size:12.5px">${L('«مستحق لهم» = صافي الطلبات اللي خلصت مدة إرجاعها، ناقص التحويلات المسجّلة. تغيير العمولة ينطبق على الطلبات الجديدة فقط.','“Owed to them” = net of orders past their return window, minus recorded transfers. Commission changes apply to new orders only.')}</p>`
   :`<div class="panel" style="text-align:center"><p class="muted">${L('ما فيه متاجر معتمدة للحين.','No approved shops yet.')}</p></div>`;
}
function aAds(){
  const pend=AD_.pays.filter(p=>p.status==='pending');
  const all=Object.values(D.ads).sort((a,b)=>b.createdAt-a.createdAt);
  return`<section class="panel"><h3 class="h3">${L('دفعات تنتظر التأكيد','Payments to confirm')} (${num(pend.length)})</h3>
   <p class="muted" style="font-size:12.5px;margin:0 0 8px">${L(`تأكد إن المبلغ وصلك قبل التأكيد. بعد التأكيد يظهر الإعلان ${num(S2().adDays)} يوم.`,`Check the money arrived before confirming. Once confirmed the ad shows for ${S2().adDays} days.`)}</p>
   ${pend.length?pend.map(p=>{const a=D.ads[p.ad]||{};return`<div class="payrow"><div style="flex:1;min-width:220px">${pBadge('inl')}<b dir="auto">${esc(a.t||'—')}</b> ${demoTag(a)} <span class="muted">· ${money(a.p||0)}</span><div class="muted" style="font-size:12.5px">${uname(p.uid)}</div></div>
     <div><b class="tn">${money(p.amount)}</b><div class="muted" style="font-size:12.5px">${{transfer:L('تحويل بنكي','Bank transfer'),cash:L('نقدًا','Cash'),other:L('أخرى','Other')}[p.method]} · <span dir="ltr" class="sel">${esc(p.ref||'—')}</span> · ${ago(p.at)}${p.kind==='renew'?' · '+L('تجديد','Renewal'):''}</div></div>
     <div class="acts2"><a class="lnk" href="index.html?ad=${p.ad}" target="_blank" rel="noopener">${L('شوف الإعلان','View ad')}</a><button class="btn red" style="width:auto" data-payok="${p.id}">✓ ${L('وصل المبلغ','Payment received')}</button>
      <input class="inp" id="pn_${p.id}" maxlength="300" placeholder="${L('سبب الرفض','Reason')}" style="width:160px"><button class="btn out" style="width:auto" data-payno="${p.id}">✖ ${L('ما وصل','Not received')}</button></div></div>`;}).join(''):`<p class="muted" style="margin:0">${L('ما فيه دفعات تنتظر.','No payments waiting.')}</p>`}</section>
   <section class="panel"><h3 class="h3">${L('كل الإعلانات','All ads')}</h3>${all.length?`<div class="tbl-wrap"><table class="adm"><tr><th>${L('الإعلان','Ad')}</th><th>${L('صاحبه','Owner')}</th><th>${L('السعر','Price')}</th><th>${L('الحالة','Status')}</th><th>${L('ظاهر لين','Live until')}</th><th></th></tr>
    ${all.map(a=>`<tr><td><a href="index.html?ad=${a.id}" target="_blank" rel="noopener" dir="auto">${esc(a.t)}</a> ${demoTag(a)}</td><td>${uname(a.uid)}</td><td class="tn">${money(a.p)}</td><td>${adLive(a)?`<span class="stp st-delivered">${L('ظاهر','Live')}</span>`:`<span class="stp st-placed">${esc({awaiting_payment:L('ينتظر الدفع','Awaiting payment'),live:L('منتهي','Expired'),sold:L('انباع','Sold'),removed:L('محذوف','Removed'),rejected:L('مرفوض','Rejected')}[a.status]||a.status)}</span>`}</td>
     <td>${a.until?fmtFull(a.until):'—'}</td><td>${['live','awaiting_payment'].includes(a.status)?`<button class="lnk" data-adkill="${a.id}">${L('احذف','Remove')}</button>`:''}</td></tr>`).join('')}</table></div>`:`<p class="muted" style="margin:0">${L('ما فيه إعلانات.','No ads.')}</p>`}</section>`;
}
const NEXT={placed:['packed','cancelled'],packed:['shipped','cancelled'],shipped:['out','delivered'],out:['delivered'],return_req:['returned','return_rej'],returned:['refunded']};
function aOrders(){
  const F=[['all',L('الكل','All'),()=>true],['new',L('جديدة تنتظر قبولك','New, to accept'),o=>o.status==='placed'],...OB_().map(([k,t,,f])=>[k,t,f]),['notdone',L('لم تتم','Not completed'),o=>!OB_()[0][3](o)]];
  const os=perOrders(),f=(F.find(x=>x[0]===AS.ordF)||F[0])[2],l=os.filter(f).sort((a,b)=>b.createdAt-a.createdAt),t=sumOf(l);
  return`${perChips()}<div class="chips">${F.map(x=>`<button class="chip" data-aordf="${x[0]}" aria-pressed="${AS.ordF===x[0]}">${x[1]} (${num(os.filter(x[2]).length)})</button>`).join('')}</div>
   <div class="kpis" style="margin-top:0"><div><b>${num(t.n)}</b>${L('طلب','orders')}</div><div><b>${money(t.total)}</b>${L('قيمة الطلبات','Order value')}</div><div><b>${money(t.sales)}</b>${L('قيمة المنتجات','Items value')}</div><div><b>${money(t.comm)}</b>${L('العمولة','Commission')}</div></div>
   ${l.length?`<div class="tbl-wrap"><table class="adm"><tr><th>${L('الطلب','Order')}</th><th>${L('التاريخ','Date')}</th><th>${L('المتجر','Shop')}</th><th>${L('العميل','Customer')}</th><th>${L('المبلغ','Amount')}</th><th>${L('عمولتنا','Our commission')}</th><th>${L('الحالة','Status')}</th><th>${L('إجراء','Action')}</th></tr>
   ${l.slice(0,300).map(o=>`<tr><td class="tn" dir="ltr">${esc(o.no)}</td><td>${fmtFull(o.createdAt)}</td><td>${sname(store(o.s))} ${demoTag(store(o.s))}</td><td>${esc(o.addr.name)}<div class="muted" style="font-size:12px" dir="ltr">${esc(o.addr.phone)}</div></td><td class="tn">${money(o.total)}</td><td class="tn">${money(orderMoney(o).comm)}</td><td>${statusPill(o.status)}</td>
    <td>${o.status==='placed'?accBtns(o):NEXT[o.status]?`<div class="acts2"><select class="inp" id="na_${o.id}" style="width:auto;min-height:32px">${NEXT[o.status].map(k=>`<option value="${k}">${tx(ST[k])}</option>`).join('')}</select><button class="lnk" data-oact="${o.id}">${L('نفّذ','Apply')}</button></div>`:''}</td></tr>`).join('')}</table></div>`:`<div class="panel" style="text-align:center"><p class="muted">${L('ما فيه طلبات هنا.','No orders here.')}</p></div>`}`;
}
function aProducts(){
  const l=Object.values(D.products).sort((a,b)=>b.createdAt-a.createdAt);
  return l.length?`<div class="tbl-wrap"><table class="adm"><tr><th>${L('المنتج','Product')}</th><th>${L('المتجر','Shop')}</th><th>${L('السعر','Price')}</th><th>${L('المخزون','Stock')}</th><th>${L('المبيعات','Sold')}</th><th>${L('البلاغات','Reports')}</th><th>${L('ظاهر','Visible')}</th></tr>
   ${l.map(p=>{const n=AD_.reports.filter(r=>r.ref===p.id).length;return`<tr><td><div class="tp2"><span class="e">${pimg(p)}</span><a class="clamp2" href="index.html?p=${p.id}" target="_blank" rel="noopener">${pname(p)}</a></div></td><td>${sname(store(p.s))} ${demoTag(store(p.s))}</td><td class="tn">${money(p.p)}</td><td class="tn">${num(p.stock)}</td><td class="tn">${num(p.sold)}</td><td class="tn ${n?'redc':''}">${num(n)}</td>
    <td><label class="chk"><input type="checkbox" data-phide="${p.id}" ${p.hidden?'':'checked'} aria-label="${L('ظاهر','Visible')}: ${pname(p)}"></label></td></tr>`;}).join('')}</table></div>`:`<div class="panel" style="text-align:center"><p class="muted">${L('ما فيه منتجات.','No products.')}</p></div>`;
}
function aReports(){
  const R=Object.fromEntries(REP_R);
  return AD_.reports.length?AD_.reports.map(r=>{const link={product:`index.html?p=${r.ref}`,shop:`index.html?s=${r.ref}`,ad:`index.html?ad=${r.ref}`}[r.kind];
    return`<div class="panel" style="margin-top:10px"><div class="orow"><b>${R[r.reason]?tx(R[r.reason]):esc(r.reason)}</b><span class="stp ${r.status==='open'?'st-return_req':'st-delivered'}">${r.status==='open'?L('مفتوح','Open'):L('تمت المعالجة','Handled')}</span></div>
     <div class="muted" style="font-size:12.5px">${({product:L('منتج','Product'),shop:L('متجر','Shop'),review:L('تقييم','Review'),order:L('طلب','Order'),ad:L('إعلان','Ad'),question:L('سؤال','Question')})[r.kind]||esc(r.kind)} · ${link?`<a href="${link}" target="_blank" rel="noopener">${L('افتح','Open')}</a>`:`<span dir="ltr">${esc(r.ref)}</span>`} · ${uname(r.by)} · ${ago(r.at)}</div>
     ${r.note?`<p dir="auto">${esc(r.note)}</p>`:''}
     <div class="acts2">${r.kind==='review'&&D.reviews[r.ref]?`<button class="lnk" data-revdel="${r.ref}">${L('احذف التقييم','Delete review')}</button>`:''}${r.kind==='product'&&D.products[r.ref]?`<button class="lnk" data-phide2="${r.ref}">${D.products[r.ref].hidden?L('أظهر المنتج','Unhide product'):L('أخفِ المنتج','Hide product')}</button>`:''}${r.kind==='ad'&&D.ads[r.ref]&&adLive(D.ads[r.ref])?`<button class="lnk" data-adkill="${r.ref}">${L('احذف الإعلان','Remove ad')}</button>`:''}
      <button class="lnk" data-repdone="${r.id}">${r.status==='open'?L('تمت المعالجة','Mark handled'):L('أعد فتحه','Reopen')}</button></div></div>`;}).join(''):`<div class="panel" style="text-align:center"><p class="muted">${L('ما فيه بلاغات.','No reports.')}</p></div>`;
}
function aUsers(){
  const q=AS.q.toLowerCase(),l=AD_.users.filter(u=>!q||(u.email||'').toLowerCase().includes(q)||(u.full_name||'').toLowerCase().includes(q)||(u.phone||'').includes(q));
  return`<input class="inp" id="uq" value="${esc(AS.q)}" placeholder="${L('ابحث بالاسم أو البريد أو الرقم','Search by name, email or number')}" style="max-width:360px;margin-bottom:10px">
   <div class="tbl-wrap"><table class="adm"><tr><th>${L('الاسم','Name')}</th><th>${L('البريد','Email')}</th><th>${L('الجوال','Mobile')}</th><th>${L('تاريخ التسجيل','Joined')}</th><th>${L('متاجر','Shops')}</th><th>${L('إعلانات','Ads')}</th><th>${L('طلبات','Orders')}</th><th></th></tr>
   ${l.slice(0,500).map(u=>`<tr><td>${esc(u.full_name||'—')}</td><td dir="ltr" class="sel">${esc(u.email)}</td><td dir="ltr" class="sel">${esc(u.phone||'')}</td><td>${fmtFull(ts(u.created_at))}</td><td class="tn">${num(Object.values(AD_.shops).filter(s=>s.owner===u.id).length)}</td><td class="tn">${num(Object.values(D.ads).filter(a=>a.uid===u.id).length)}</td><td class="tn">${num(Object.values(AD_.orders).filter(o=>o.buyer===u.id).length)}</td>
    <td>${u.id===ME.uid?`<span class="muted">${L('أنت','You')}</span>`:`<button class="lnk ${u.banned?'':'redc'}" data-ban="${u.id}" data-v="${u.banned?'0':'1'}">${u.banned?L('ألغِ الإيقاف','Unban'):L('أوقف الحساب','Suspend account')}</button>`}</td></tr>`).join('')}</table></div>`;
}
function aSettings(){
  const s=AD_.set||{},f=(id,label,val,attrs,hint)=>fld(id,label,inp(id,val,attrs),false,hint);
  return`<form id="setForm" class="panel keep"><h3 class="h3">${L('الشركات','Companies')}</h3><div class="form">
    ${f('st_comm',L('العمولة الافتراضية للشركات الجديدة (٪)','Default commission for new companies (%)'),s.comm,'type="number" min="0" max="50" step="0.5"',L('تقدر تغيّر عمولة أي متجر لحاله من «المتاجر».','You can change any shop’s own rate under “Shops”.'))}</div>
   <h3 class="h3" style="margin-top:16px">${L('إعلانات الأفراد','Individual ads')}</h3><div class="form">
    ${f('st_adfee',L('رسوم الإعلان (ر.ق)','Ad fee (QAR)'),s.ad_fee,'type="number" min="0" step="1"')}${f('st_addays',L('مدة الإعلان (يوم)','Ad duration (days)'),s.ad_days,'type="number" min="1" max="365" step="1"')}
    ${fld('st_payinfo',L('طريقة الدفع اللي تظهر للأفراد','Payment instructions shown to individuals'),area('st_payinfo',s.pay_info,'maxlength="1000" placeholder="'+L('مثال: حوّل ١٥ ريال على حساب نيل + رقم IBAN ... واكتب رقم العملية.','e.g. Transfer 15 QAR to NILE+ IBAN ... and enter the reference.')+'"'),true)}</div>
   <h3 class="h3" style="margin-top:16px">${L('المراجعة قبل النشر','Review before publishing')}</h3><div class="form">
    ${f('st_review',L('مدة تعليق إعلان الفرد قبل ما يظهر (دقيقة)','How long individual ads are held before showing (minutes)'),s.review_minutes??20,'type="number" min="0" max="1440" step="1"',L('منتجات الشركات تنزل أول ما تعدّي المراجعة.','Company products go live as soon as they pass review.'))}</div>
   <h3 class="h3" style="margin-top:16px">${L('التوصيل والدفع عند الاستلام','Delivery & pay on delivery')}</h3><div class="form">
    ${f('st_free',L('التوصيل مجاني فوق (ر.ق)','Free delivery over (QAR)'),s.free_over,'type="number" min="0" step="1"')}${f('st_std',L('التوصيل العادي','Standard'),s.fee_std,'type="number" min="0" step="1"')}
    ${f('st_next',L('توصيل الغد','Next day'),s.fee_next,'type="number" min="0" step="1"')}${f('st_same',L('توصيل اليوم','Same day'),s.fee_same,'type="number" min="0" step="1"')}
    ${f('st_cod',L('رسوم الدفع عند الاستلام','Pay-on-delivery fee'),s.fee_cod,'type="number" min="0" step="1"')}${f('st_gift',L('تغليف الهدية','Gift wrap'),s.fee_gift,'type="number" min="0" step="1"')}</div>
   <div style="margin-top:14px"><button class="btn red" style="width:auto" type="submit">${L('احفظ الإعدادات','Save settings')}</button></div></form>
  <section class="panel"><h3 class="h3">${L('المراجعة الآلية بالذكاء الاصطناعي (Claude)','Automatic AI review (Claude)')}</h3>
   ${(AD_.ai||{}).has_key?`<p class="okc" style="margin:0 0 8px">✓ ${L(`شغّالة. المفتاح المحفوظ ينتهي بـ ${esc(AD_.ai.key_end||'')}`,`On. The saved key ends in ${esc(AD_.ai.key_end||'')}`)}</p>`:`<p class="redc" style="margin:0 0 8px">${L('مو شغّالة للحين.','Not on yet.')}</p>`}
   <p class="muted" style="font-size:13px;margin:0 0 10px">${L('سوّ مفتاح API من console.anthropic.com (Settings ← API Keys) والصقه هنا. المفتاح ينحفظ في قاعدة البيانات في مكان سري، وما يقدر أحد يقراه من الموقع ولا حتى أنت.','Create an API key at console.anthropic.com (Settings → API Keys) and paste it here. It is stored in a private place in the database that nobody can read from the site, not even you.')}</p>
   <div class="ansf"><input class="inp" id="ai_key" type="password" autocomplete="off" dir="ltr" placeholder="sk-ant-..."><button class="btn red" style="width:auto" data-aikey="set">${L('احفظ المفتاح','Save key')}</button>${(AD_.ai||{}).has_key?`<button class="btn out" style="width:auto" data-aikey="clear">${L('شيل المفتاح','Remove key')}</button>`:''}</div></section>`;
}


/* ───── the details behind the figures ───── */
const itemsTxt=o=>o.items.map(i=>`${esc(S.ar?i.ar||i.en:i.en||i.ar)} × ${num(i.q)}`).join('<br>');
const back=()=>`<button class="lnk" data-kdet="">‹ ${L('رجوع للنظرة العامة','Back to overview')}</button>`;
function aDetAds(){
  const l=AD_.pays.filter(p=>p.status==='confirmed').sort((a,b)=>(b.dec||b.at)-(a.dec||a.at)),tot=l.reduce((a,p)=>a+p.amount,0),pend=AD_.pays.filter(p=>p.status==='pending');
  return`${back()}<h3 class="h3" style="margin-top:10px">${L('رسوم إعلانات الأفراد','Individual ad fees')} · ${money(tot)}</h3>
   <p class="muted" style="font-size:13px;margin:0 0 10px">${L(`${num(l.length)} دفعة مؤكدة. ${pend.length?`وفيه ${num(pend.length)} دفعة تنتظر تأكيدك.`:''}`,`${l.length} confirmed payments.${pend.length?` ${pend.length} waiting for you.`:''}`)}</p>
   ${l.length?`<div class="tbl-wrap"><table class="adm"><tr><th>${L('تاريخ التأكيد','Confirmed')}</th><th>${L('الإعلان','Ad')}</th><th>${L('صاحبه','Owner')}</th><th>${L('النوع','Type')}</th><th>${L('طريقة الدفع','Method')}</th><th>${L('المرجع','Reference')}</th><th>${L('المدة','Days')}</th><th>${L('المبلغ','Amount')}</th></tr>
    ${l.map(p=>{const a=D.ads[p.ad]||{};return`<tr><td>${fmtFull(p.dec||p.at)}</td><td dir="auto">${a.t?`<a href="index.html?ad=${p.ad}" target="_blank" rel="noopener">${esc(a.t)}</a>`:'—'}</td><td>${uname(p.uid)}</td><td>${p.kind==='renew'?L('تجديد','Renewal'):L('جديد','New')}</td><td>${{transfer:L('تحويل','Transfer'),cash:L('نقدًا','Cash'),other:L('أخرى','Other')}[p.method]}</td><td dir="ltr" class="sel">${esc(p.ref||'—')}</td><td class="tn">${num(p.days)}</td><td class="tn"><b>${money(p.amount)}</b></td></tr>`;}).join('')}
    <tr class="totrow"><td colspan="7">${L('الإجمالي','Total')}</td><td class="tn">${money(tot)}</td></tr></table></div>`:`<p class="muted">${L('ما فيه دفعات مؤكدة للحين.','No confirmed payments yet.')}</p>`}`;
}
function aDetComm(){
  const l=Object.values(AD_.orders).filter(o=>!['cancelled','returned','refunded'].includes(o.status)).map(o=>({o,m:orderMoney(o)}));
  const T=k=>l.reduce((a,x)=>a+x.m[k],0);
  return`${back()}<h3 class="h3" style="margin-top:10px">${L('عمولات المتاجر','Shop commissions')} · ${money(T('comm'))}</h3>
   <p class="muted" style="font-size:13px;margin:0 0 10px">${L('لكل طلب: قيمة المنتجات اللي دفعها العميل (بعد الكوبون)، ونسبة عمولة المتجر وقت الطلب، وعمولتك منه. رسوم التوصيل والدفع منفصلة عنها.','Per order: what the customer paid for the items (after coupons), the shop’s commission rate at the time, and your cut. Delivery and payment fees are separate.')}</p>
   ${l.length?`<div class="tbl-wrap"><table class="adm"><tr><th>${L('الطلب','Order')}</th><th>${L('التاريخ','Date')}</th><th>${L('المتجر','Shop')}</th><th>${L('المنتجات','Items')}</th><th>${L('المبلغ الأصلي','Original amount')}</th><th>${L('النسبة','Rate')}</th><th>${L('عمولتك','Your commission')}</th><th>${L('الحالة','Status')}</th></tr>
    ${l.map(({o,m})=>`<tr><td class="tn" dir="ltr">${esc(o.no)}</td><td>${fmtFull(o.createdAt)}</td><td>${sname(store(o.s))}</td><td style="font-size:12.5px">${itemsTxt(o)}</td><td class="tn">${money(m.sales)}</td><td class="tn">${num(m.rate)}٪</td><td class="tn"><b>${money(m.comm)}</b></td><td>${statusPill(o.status)}</td></tr>`).join('')}
    <tr class="totrow"><td colspan="4">${L('الإجمالي','Total')}</td><td class="tn">${money(T('sales'))}</td><td></td><td class="tn">${money(T('comm'))}</td><td></td></tr></table></div>`:`<p class="muted">${L('ما فيه طلبات للحين.','No orders yet.')}</p>`}`;
}
function aDetOwed(){
  const shops=Object.values(AD_.shops).map(s=>{const os=shopOrders(s.id).filter(o=>moneyState(o,s)==='due').map(o=>({o,m:orderMoney(o)}));return {s,os,b:shopBalance(s)};}).filter(x=>x.os.length||x.b.paid);
  const all=shops.reduce((a,x)=>a+x.b.owed,0);
  return`${back()}<h3 class="h3" style="margin-top:10px">${L('مستحق للمتاجر الحين','Owed to shops now')} · ${money(all)}</h3>
   <p class="muted" style="font-size:13px;margin:0 0 10px">${L('الطلبات اللي وصلت وخلصت مدة إرجاعها. لكل سلعة: المبلغ الكامل، نسبتك، وكم تحوّل للمتجر. الطلبات اللي للحين في مدة الإرجاع ما تنحسب هنا.','Orders delivered and past their return window. For each item: the full amount, your rate, and what you pay the shop. Orders still inside the return window aren’t counted here.')}</p>
   ${shops.length?shops.map(({s,os,b})=>{const p=AD_.priv[s.id]||{},sub=os.reduce((a,x)=>a+x.m.net,0);
    return`<section class="panel" style="margin-top:10px"><div class="orow"><div class="tp2">${logo(s,34)}<div><b>${sname(s)}</b><div class="muted" style="font-size:12px">${esc(p.manager||'')} · <span dir="ltr" class="sel">${esc(p.phone||'')}</span></div></div></div>
      <div style="text-align:end"><div class="muted" style="font-size:12px">${L('تحوّل له الحين','Pay them now')}</div><b class="tn ${b.owed?'redc':''}" style="font-size:18px">${money(b.owed)}</b></div></div>
     <div class="tbl-wrap" style="margin-top:8px"><table class="adm"><tr><th>${L('الطلب','Order')}</th><th>${L('السلعة','Item')}</th><th>${L('الكمية','Qty')}</th><th>${L('المبلغ الكامل','Full amount')}</th><th>${L('نسبتك','Your rate')}</th><th>${L('عمولتك','Your commission')}</th><th>${L('للمتجر','To the shop')}</th></tr>
      ${os.map(({o,m})=>o.items.map((i,k)=>{const full=(i.p-i.cpn)*i.q,c=Math.round(full*m.rate)/100;return`<tr>${k?'<td></td>':`<td class="tn" dir="ltr" rowspan="1">${esc(o.no)}</td>`}<td dir="auto">${esc(S.ar?i.ar||i.en:i.en||i.ar)}</td><td class="tn">${num(i.q)}</td><td class="tn">${money(full)}</td><td class="tn">${num(m.rate)}٪</td><td class="tn">${money(c)}</td><td class="tn"><b>${money(full-c)}</b></td></tr>`;}).join('')).join('')}
      <tr class="totrow"><td colspan="3">${L('مجموع المستحق','Total earned')}</td><td class="tn">${money(os.reduce((a,x)=>a+x.m.sales,0))}</td><td></td><td class="tn">${money(os.reduce((a,x)=>a+x.m.comm,0))}</td><td class="tn">${money(sub)}</td></tr>
      ${b.paid?`<tr><td colspan="6">${L('ناقص اللي حوّلته له قبل','Minus what you already transferred')}</td><td class="tn">−${money(b.paid)}</td></tr>`:''}
      <tr class="totrow"><td colspan="6">${L('الباقي تحوّله الحين','Left to transfer now')}</td><td class="tn redc">${money(b.owed)}</td></tr></table></div>
     ${b.owed?`<button class="btn red" style="width:auto;margin-top:10px" data-payout="${s.id}">${L('سجّل التحويل','Record transfer')}</button>`:''}
     ${b.held+b.transit?`<p class="muted" style="font-size:12.5px;margin:8px 0 0">${L(`وفيه ${money(b.held+b.transit)} للحين في الطريق أو في مدة الإرجاع.`,`Another ${money(b.held+b.transit)} is still in transit or inside the return window.`)}</p>`:''}</section>`;}).join('')
   :`<div class="panel" style="text-align:center"><p class="muted">${L('ما فيه مبالغ مستحقة للمتاجر الحين.','Nothing owed to shops right now.')}</p></div>`}`;
}

/* ───── review before publishing ───── */
const revItems=()=>[...Object.values(D.ads).filter(a=>['pending','flagged'].includes(a.mod)&&['awaiting_payment','live'].includes(a.status)).map(a=>({k:'ad',x:a})),
  ...Object.values(D.products).filter(p=>['pending','flagged'].includes(p.mod)).map(p=>({k:'product',x:p}))];
const revN=()=>revItems().filter(i=>i.x.mod==='flagged').length;
function aReview(){
  const ai=AD_.ai||{},l=revItems().sort((a,b)=>(a.x.mod==='flagged'?-1:1)-(b.x.mod==='flagged'?-1:1));
  const recent=[...Object.values(D.ads).filter(a=>a.mod==='approved').map(a=>({k:'ad',x:a})),...Object.values(D.products).filter(p=>p.mod==='approved').map(p=>({k:'product',x:p}))].sort((a,b)=>b.x.createdAt-a.x.createdAt).slice(0,15);
  const card=({k,x})=>{const ad=k==='ad',title=ad?esc(x.t):pname(x),imgs=x.imgs.slice(0,4),link=ad?`index.html?ad=${x.id}`:`index.html?p=${x.id}`;
    return`<section class="panel revcard ${x.mod}"><div class="orow"><div>${ad?pBadge('inl'):''}<span class="stp ${ad?'st-placed':'st-packed'}">${ad?L('إعلان فرد (حساب شخصي)','Individual ad (personal account)'):L('منتج شركة','Company product')}</span> ${demoTag(ad?x:store(x.s))} ${x.mod==='flagged'?`<span class="stp st-return_req">⚠ ${L('الذكاء الاصطناعي عنده ملاحظات','AI has concerns')}</span>`:`<span class="stp st-placed">🔍 ${L('ينتظر الفحص الآلي','Waiting for AI check')}</span>`}</div><span class="muted" style="font-size:12px">${ago(x.createdAt)}</span></div>
     <div style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap"><div class="revimgs">${imgs.length?imgs.map(i=>`<a href="${IMG(i)}" target="_blank" rel="noopener"><img src="${IMG(i)}" alt=""></a>`).join(''):`<span class="emo" style="font-size:44px">${x.e}</span>`}</div>
      <div style="flex:1;min-width:220px"><b dir="auto" style="font-size:16px">${title}</b><div class="tn" style="font-size:17px">${money(x.p)}${!ad&&x.o?` <s class="muted">${money(x.o)}</s>`:''}</div>
       <div class="muted" style="font-size:12.5px">${ad?`${L('صاحب الحساب:','Account owner:')} ${uname(x.uid)} · ${x.cond==='new'?L('جديد','New'):L('مستعمل','Used')} · ${cityName(cityOf(x.city))}`:`${sname(store(x.s))}`}</div>
       ${ad&&x.d?`<p dir="auto" style="white-space:pre-wrap;font-size:13.5px;margin:6px 0">${esc(x.d)}</p>`:''}
       ${x.modWhy.length?`<div class="modbox m-flagged"><b>${L('ملاحظات المراجعة:','Review notes:')}</b><ul>${x.modWhy.map(r=>`<li dir="auto">${esc(r)}</li>`).join('')}</ul></div>`:''}
       ${ad&&x.status==='awaiting_payment'?`<p class="muted" style="font-size:12.5px;margin:4px 0">${L('ودفعته للحين ما تأكدت.','Its payment isn’t confirmed yet.')}</p>`:''}</div></div>
     <div class="decide"><a class="lnk" href="${link}" target="_blank" rel="noopener">${L('افتحه','Open')}</a>
      <button class="btn red" style="width:auto" data-mod="${k}:${x.id}:approve">✓ ${L('اعتمده','Approve')}</button>
      <input class="inp" id="mn_${x.id}" maxlength="300" placeholder="${L('سبب الرفض (يوصل لصاحبه)','Reason (sent to the owner)')}" style="flex:1;min-width:180px">
      <button class="btn out" style="width:auto" data-mod="${k}:${x.id}:reject">✖ ${L('ارفضه','Reject')}</button>
      ${ai.has_key?`<button class="lnk" data-mod="${k}:${x.id}:recheck">↻ ${L('أعد الفحص','Re-check')}</button>`:''}</div></section>`;};
  return`${ai.has_key?`<div class="note" style="margin:0 0 10px">${L(`المراجعة الآلية شغّالة (${esc(ai.model||'')}). المنشورات السليمة تنزل تلقائيًا، واللي عليها ملاحظات تنتظر قرارك هنا. إعلانات الأفراد تتعلّق ${num(S2().reviewMin)} دقيقة قبل ما تظهر حتى لو كانت سليمة.`,`Automatic review is on (${esc(ai.model||'')}). Clean posts go live automatically; posts with concerns wait for you here. Individual ads are held ${S2().reviewMin} minutes before showing even when clean.`)}</div>`
     :`<div class="modbox m-flagged" style="margin:0 0 10px"><b>${L('المراجعة الآلية مو شغّالة: ما فيه مفتاح Anthropic.','Automatic review is off: no Anthropic key.')}</b> ${L('كل منشور جديد بينتظر قرارك هنا لين تضيف المفتاح من','Every new post waits for your decision here until you add the key in')} <button class="lnk" data-atab="settings">${L('الإعدادات','Settings')}</button>.</div>`}
   ${l.length?l.map(card).join(''):`<div class="panel" style="text-align:center"><p class="muted">${L('ما فيه منشورات تنتظر.','Nothing waiting.')}</p></div>`}
   ${recent.length?`<h3 class="h3" style="margin-top:18px">${L('آخر ما اعتُمد (للمتابعة)','Recently approved (to keep an eye on)')}</h3><div class="tbl-wrap"><table class="adm">${recent.map(({k,x})=>`<tr><td>${k==='ad'?L('إعلان','Ad'):L('منتج','Product')}</td><td dir="auto"><a href="${k==='ad'?`index.html?ad=${x.id}`:`index.html?p=${x.id}`}" target="_blank" rel="noopener">${k==='ad'?esc(x.t):pname(x)}</a></td><td class="tn">${money(x.p)}</td><td>${ago(x.createdAt)}</td><td><button class="lnk redc" data-mod="${k}:${x.id}:reject">${L('ارفضه','Reject')}</button></td></tr>`).join('')}</table></div>`:''}`;
}

/* ───── advertising banners ───── */
function formErr(f,m){let e=f.querySelector('p.err.fe');if(!e){e=document.createElement('p');e.className='err fe';e.setAttribute('role','alert');f.appendChild(e);}e.textContent=m;e.scrollIntoView({block:'center'});}
// a link pasted from the site becomes an in-site link; anything else must be https
function parseLink(v){
  v=(v||'').trim();if(!v)return '';
  try{const u=new URL(v);const q=u.searchParams;
    if(/(^|\.)nileplus\.github\.io$/.test(u.hostname)||u.hostname===location.hostname){if(isUuid(q.get('p')))return 'p:'+q.get('p');if(isUuid(q.get('s')))return 's:'+q.get('s');if(isUuid(q.get('ad')))return 'ad:'+q.get('ad');}
    return u.protocol==='https:'?u.href.slice(0,500):null;}catch(e){return null;}
}
const linkTxt=l=>{if(!l)return L('بدون رابط','No link');const [k,v]=l.split(/:(.+)/);if(k==='p'){const p=D.products[v];return L('منتج: ','Product: ')+(p?pname(p):'—');}
  if(k==='s'){const x=store(v);return L('متجر: ','Shop: ')+(x?sname(x):'—');}if(k==='ad'){const a=D.ads[v];return L('إعلان: ','Ad: ')+(a?esc(a.t):'—');}return`<span dir="ltr">${esc(l.replace(/^https:\/\//,'').slice(0,40))}</span>`;};
const bState=b=>!b.on?['st-cancelled',L('موقوف','Off')]:b.from>Date.now()?['st-placed',L('مجدول','Scheduled')]:b.to<=Date.now()?['st-cancelled',L('انتهى','Ended')]:['st-delivered',L('يعرض الحين','Running')];
const dIn=t=>new Date(t-new Date(t).getTimezoneOffset()*6e4).toISOString().slice(0,10);
function aBanners(){
  const l=AD_.banners,run=l.filter(b=>bState(b)[1]===L('يعرض الحين','Running')),tot=l.reduce((a,b)=>a+b.price,0),cl=l.reduce((a,b)=>a+b.clicks,0);
  return`<div class="kpis" style="margin-top:0"><div><b>${num(run.length)}</b>${L('يعرض الحين','Running now')}</div><div><b>${money(tot)}</b>${L('دخل البانرات','Banner income')}</div><div><b>${num(cl)}</b>${L('ضغطات','Clicks')}</div></div>
  <form id="bnForm" class="panel keep" novalidate><h3 class="h3">${L('أضف بانر','Add a banner')}</h3>
   <div class="form">
    ${fld('bn_file',L('صورة البانر','Banner image'),`<input class="inp" id="bn_file" type="file" accept="image/jpeg,image/png,image/webp">`,true,L('الكبير فوق: مقاس ١٥٠٠×٥٠٠ تقريبًا. البانر بين الأقسام: ٨٠٠×٣٠٠. تحت ٣ ميجا.','Top banner: about 1500×500. Between sections: 800×300. Under 3 MB.'))}
    ${fld('bn_place',L('المكان','Placement'),sel('bn_place',[['hero',L('الكبير أعلى الصفحة الرئيسية','Large, top of the home page')],['mid',L('بين أقسام الصفحة الرئيسية','Between home page sections')]],'hero'))}
    ${fld('bn_by',L('المعلن (اسم الشركة)','Advertiser (company name)'),inp('bn_by','','maxlength="120"'))}
    ${fld('bn_t',L('عنوان داخلي (للتعريف فقط)','Internal title (for you only)'),inp('bn_t','','maxlength="120"'))}
    ${fld('bn_link',L('الرابط عند الضغط (اختياري)','Link when clicked (optional)'),inp('bn_link','','maxlength="500" dir="ltr" placeholder="https://nileplus.github.io/?p=..."'),true,L('انسخ رابط أي منتج أو متجر أو إعلان من الموقع والصقه هنا، أو رابط خارجي يبدأ بـ https://','Paste a product, shop or ad link copied from the site, or an outside link starting with https://'))}
    ${fld('bn_from',L('يبدأ من','Starts'),inp('bn_from',dIn(Date.now()),'type="date"'))}
    ${fld('bn_to',L('ينتهي في','Ends'),inp('bn_to',dIn(Date.now()+30*864e5),'type="date"'))}
    ${fld('bn_price',L('المبلغ اللي دفعه المعلن (ر.ق)','Amount the advertiser paid (QAR)'),inp('bn_price','0','type="number" min="0" step="1"'),false,L('صفر لو البانر لعروضك أنت.','Zero if it’s your own promotion.'))}
    ${fld('bn_sort',L('الترتيب','Order'),inp('bn_sort','0','type="number" step="1"'),false,L('الأصغر يطلع أول.','Lower shows first.'))}
   </div><div style="margin-top:12px"><button class="btn red" style="width:auto" type="submit">${L('انشر البانر','Publish banner')}</button></div></form>
  <section class="panel"><h3 class="h3">${L('البانرات','Banners')}</h3>
   ${l.length?`<div class="tbl-wrap"><table class="adm"><tr><th>${L('البانر','Banner')}</th><th>${L('المعلن','Advertiser')}</th><th>${L('المكان','Placement')}</th><th>${L('الرابط','Link')}</th><th>${L('المدة','Period')}</th><th>${L('الحالة','Status')}</th><th>${L('ضغطات','Clicks')}</th><th>${L('المبلغ','Amount')}</th><th></th></tr>
    ${l.map(b=>{const [c,t]=bState(b);return`<tr><td><a href="${IMG(b.img)}" target="_blank" rel="noopener"><img class="bthumb" src="${IMG(b.img)}" alt=""></a><div class="muted" style="font-size:12px">${esc(b.t)}</div></td><td>${esc(b.by||'—')}</td><td>${b.place==='hero'?L('أعلى الصفحة','Top'):L('بين الأقسام','Middle')}</td><td style="font-size:12.5px">${linkTxt(b.link)}</td>
     <td style="font-size:12.5px">${fmtShort(new Date(b.from))} – ${fmtShort(new Date(b.to))}</td><td><span class="stp ${c}">${t}</span></td><td class="tn">${num(b.clicks)}</td><td class="tn">${money(b.price)}</td>
     <td><div class="acts2"><button class="lnk" data-bnon="${b.id}">${b.on?L('أوقف','Turn off'):L('شغّل','Turn on')}</button><button class="lnk redc" data-bndel="${b.id}">${L('احذف','Delete')}</button></div></td></tr>`;}).join('')}</table></div>`
    :`<p class="muted" style="margin:0">${L('ما فيه بانرات للحين. لما تضيف بانر كبير، يحل محل الصور اللي أعلى الصفحة الرئيسية.','No banners yet. Once you add a large banner it replaces the pictures at the top of the home page.')}</p>`}</section>`;
}
async function saveBanner(f){
  const file=($('#bn_file').files||[])[0],link=parseLink($('#bn_link').value),from=new Date($('#bn_from').value+'T00:00:00'),to=new Date($('#bn_to').value+'T23:59:59');
  if(!file)return formErr(f,L('اختر صورة البانر.','Choose the banner image.'));
  if(!/^image\/(jpeg|png|webp)$/.test(file.type))return formErr(f,L('الصورة لازم تكون JPG أو PNG أو WEBP.','The image must be JPG, PNG or WEBP.'));
  if(file.size>3*1024*1024)return formErr(f,L('الصورة أكبر من ٣ ميجا.','The image is over 3 MB.'));
  if(link===null)return formErr(f,L('الرابط لازم يكون من الموقع أو يبدأ بـ https://','The link must be from the site or start with https://'));
  if(!(to>from))return formErr(f,L('تاريخ النهاية لازم يكون بعد البداية.','The end date must be after the start.'));
  const b=f.querySelector('[type=submit]');b.disabled=true;
  try{
    const path=`${ME.uid}/${crypto.randomUUID()}.${file.type.split('/')[1].replace('jpeg','jpg')}`;
    const up=await ME.sb.storage.from('photos').upload(path,file,{contentType:file.type,cacheControl:'31536000'});if(up.error)throw up.error;
    const r=await ME.sb.from('banners').insert({image:path,placement:$('#bn_place').value,advertiser:$('#bn_by').value.trim(),title:$('#bn_t').value.trim(),link,starts_at:from.toISOString(),ends_at:to.toISOString(),
      price:Math.max(0,Number($('#bn_price').value)||0),sort:Math.round(Number($('#bn_sort').value)||0)});
    if(r.error)throw r.error;
    S.dirty=false;toast(L('انتشر البانر','Banner published'));aLoad();
  }catch(e){b.disabled=false;formErr(f,dbErr(e));}
}
/* ───── shell ───── */
function render(){
  const v=$('#view');document.documentElement.dir=S.ar?'rtl':'ltr';document.documentElement.lang=S.ar?'ar':'en';
  $('#lang').textContent=S.ar?'EN':'عربي';
  if(!ME.ready){v.innerHTML=`<div class="wrap"><section class="panel"><p class="muted">${L('جاري التحميل…','Loading…')}</p></section></div>`;return;}
  if(!ME.uid){v.innerHTML=`<div class="wrap"><section class="panel" style="max-width:440px;margin-inline:auto"><h2 style="margin-top:0">${L('لوحة تحكم نيل +','NILE+ dashboard')}</h2>
    <form id="loginForm" novalidate><div class="form">${fld('lg_email',L('البريد الإلكتروني','Email'),inp('lg_email','','type="email" dir="ltr" autocomplete="email"'),true)}${fld('lg_pw',L('كلمة المرور','Password'),inp('lg_pw','','type="password" dir="ltr" autocomplete="current-password"'),true)}</div>
    <p class="err" id="lgerr" hidden></p><button class="btn red" type="submit" style="margin-top:12px">${L('تسجيل الدخول','Sign in')}</button></form>
    <p class="muted" style="font-size:12.5px">${L('ما عندك حساب؟ سجّل من','No account? Sign up on')} <a href="index.html">${L('الموقع','the site')}</a> ${L('أول.','first.')}</p></section></div>`;return;}
  if(!ME.owner){v.innerHTML=`<div class="wrap"><section class="panel" style="max-width:520px;margin-inline:auto"><h2 style="margin-top:0">${L('هذي الصفحة لمالك نيل + فقط','This page is for the NILE+ owner only')}</h2>
    <p class="muted">${L('لو أنت المالك وهذي أول مرة، اكتب رمز الإعداد اللي وصلك عشان يصير حسابك هو مالك لوحة التحكم. الرمز يشتغل مرة وحدة بس.','If you’re the owner and this is the first time, enter the setup code you were given to make this account the dashboard owner. The code works once.')}</p>
    <form id="claimForm" novalidate><div class="form">${fld('cl_code',L('رمز الإعداد','Setup code'),inp('cl_code','','dir="ltr" autocomplete="off" placeholder="XXXX-XXXX-XXXX"'),true)}</div><p class="err" id="clerr" hidden></p><button class="btn red" type="submit" style="margin-top:12px">${L('فعّل لوحة التحكم','Activate dashboard')}</button></form>
    <p class="muted" style="font-size:12.5px">${L('مسجّل باسم','Signed in as')} <span dir="ltr">${esc(ME.email)}</span> · <button class="lnk" data-aact="signout">${L('خروج','Sign out')}</button></p></section></div>`;return;}
  const pend=Object.values(AD_.shops).filter(s=>s.status==='pending').length,pays=AD_.pays.filter(p=>p.status==='pending').length,reps=AD_.reports.filter(r=>r.status==='open').length;
  const tabs=[['home',L('نظرة عامة','Overview')],['apps',L('طلبات الشركات','Company requests')+(pend?` (${num(pend)})`:'')],['shops',L('المتاجر والتحويلات','Shops & transfers')],['review',L('المراجعة','Review')+(revN()?` (${num(revN())})`:'')],['ads',L('إعلانات الأفراد','Individual ads')+(pays?` (${num(pays)})`:'')],
    ['orders',L('الطلبات','Orders')+(newOrders().length?` (${num(newOrders().length)})`:'')],['products',L('المنتجات','Products')],['banners',L('البانرات','Banners')],['reports',L('البلاغات','Reports')+(reps?` (${num(reps)})`:'')],['users',L('المستخدمين','Users')],['settings',L('الإعدادات','Settings')]];
  const body=AS.detail?{ads:aDetAds,comm:aDetComm,owed:aDetOwed}[AS.detail]:{home:aHome,banners:aBanners,review:aReview,apps:aApps,shops:aShops,ads:aAds,orders:aOrders,products:aProducts,reports:aReports,users:aUsers,settings:aSettings}[AS.tab]||aHome;
  v.innerHTML=`<div class="wrap"><section style="margin-top:16px"><div class="orow"><h2 style="font-size:24px;margin:0">${L('لوحة تحكم نيل +','NILE+ dashboard')}</h2><span class="muted" style="font-size:13px"><span dir="ltr">${esc(ME.email)}</span> · <button class="lnk" data-aact="reload">↻ ${L('تحديث','Refresh')}</button> · <button class="lnk" data-aact="signout">${L('خروج','Sign out')}</button></span></div>
   <div class="tabs" style="margin:12px 0 14px">${tabs.map(([k,l])=>`<button data-atab="${k}" aria-selected="${AS.tab===k}">${l}</button>`).join('')}</div>
   ${AD_.loaded?body():`<p class="muted">${L('جاري التحميل…','Loading…')}</p>`}</section></div>`;
  names();
}

/* ───── actions ───── */
async function act(fn,ok){try{await fn();if(ok)toast(ok);await aLoad();}catch(e){toast(dbErr(e),true);}}
document.addEventListener('click',e=>{
  const g=s=>e.target.closest(s);let el;
  if(el=g('[data-atab]')){AS.tab=el.dataset.atab;AS.detail='';render();scrollTo({top:0});return;}
  if(el=g('[data-kdet]')){AS.detail=el.dataset.kdet;if(!AS.detail)AS.tab='home';render();scrollTo({top:0});return;}
  if(el=g('[data-mod]')){const [k,id,d]=el.dataset.mod.split(':'),n=($('#mn_'+id)||{}).value||'';if(d==='reject'&&!n.trim())return toast(L('اكتب سبب الرفض.','Enter the reason.'),true);
    return act(()=>rpc('admin_moderate',{p_kind:k,p_id:id,p_decision:d,p_note:n.trim()}),{approve:L('اعتمدته، وبيظهر للعملاء','Approved; customers will see it'),reject:L('رفضته، والسبب وصل لصاحبه','Rejected; the owner sees the reason'),recheck:L('رجع للفحص الآلي','Sent back for automatic review')}[d]);}
  if(el=g('[data-bnon]')){const b=AD_.banners.find(x=>x.id===el.dataset.bnon);return act(async()=>{const r=await ME.sb.from('banners').update({active:!b.on}).eq('id',b.id);if(r.error)throw r.error;},b.on?L('انوقف البانر','Banner turned off'):L('اشتغل البانر','Banner turned on'));}
  if(el=g('[data-bndel]')){const id=el.dataset.bndel;return aModal(L('حذف البانر؟','Delete this banner?'),`<p class="muted">${L('ينشال من الموقع وتنحذف أرقامه.','It comes off the site and its numbers are deleted.')}</p>`,L('احذف','Delete'),async()=>{const r=await ME.sb.from('banners').delete().eq('id',id);if(r.error)throw r.error;});}
  if(el=g('[data-aikey]')){const v=el.dataset.aikey==='clear'?'':$('#ai_key').value.trim();if(el.dataset.aikey!=='clear'&&!/^sk-ant-/.test(v))return toast(L('المفتاح يبدأ بـ sk-ant-','The key starts with sk-ant-'),true);
    return act(()=>rpc('admin_set_ai_key',{p_key:v}),v?L('انحفظ المفتاح، والمراجعة الآلية بدأت','Key saved; automatic review started'):L('انشال المفتاح','Key removed'));}
  if(el=g('[data-aordf]')){AS.ordF=el.dataset.aordf;render();return;}
  if(el=g('[data-aordgo]')){AS.ordF=el.dataset.aordgo;AS.tab='orders';AS.detail='';render();scrollTo({top:0});return;}
  if(el=g('[data-per]')){AS.per=el.dataset.per;render();return;}
  if(el=g('[data-approve]')){const id=el.dataset.approve,c=Number($('#cm_'+id).value);if(!(c>=0&&c<=50))return toast(L('العمولة من ٠ إلى ٥٠.','Commission must be 0 to 50.'),true);
    return act(()=>rpc('admin_shop_decide',{p_shop:id,p_decision:'approve',p_note:'',p_commission:c}),L('اعتمدت المتجر. يقدر يضيف منتجاته الحين.','Shop approved. It can list products now.'));}
  if(el=g('[data-reject]')){const id=el.dataset.reject,n=$('#rj_'+id).value.trim();if(!n)return toast(L('اكتب سبب الرفض.','Enter the reason.'),true);
    return act(()=>rpc('admin_shop_decide',{p_shop:id,p_decision:'reject',p_note:n,p_commission:null}),L('انرفض الطلب، والسبب وصل للشركة.','Request rejected; the reason was sent to the company.'));}
  if(el=g('[data-suspend]')){const id=el.dataset.suspend;return act(()=>rpc('admin_shop_decide',{p_shop:id,p_decision:'suspend',p_note:L('موقوف من إدارة نيل +','Suspended by NILE+'),p_commission:null}),L('انوقف المتجر','Shop suspended'));}
  if(el=g('[data-reactivate]')){const id=el.dataset.reactivate;return act(()=>rpc('admin_shop_decide',{p_shop:id,p_decision:'reactivate',p_note:'',p_commission:null}),L('رجع المتجر','Shop reactivated'));}
  if(el=g('[data-payout]')){const s=store(el.dataset.payout),b=shopBalance(s);return aModal(L(`تحويل لـ${sname(s)}`,`Transfer to ${sname(s)}`),`<p class="muted">${L(`المستحق الحين ${money(b.owed)}. سجّل هنا بعد ما تحوّل له فعلًا.`,`Owed now: ${money(b.owed)}. Record it here after you actually transfer.`)}</p>
      <div class="form">${fld('po_amt',L('المبلغ (ر.ق)','Amount (QAR)'),inp('po_amt',Math.round(b.owed*100)/100,'type="number" min="0.01" step="0.01"'))}${fld('po_ref',L('رقم التحويل','Transfer reference'),inp('po_ref','','maxlength="80" dir="ltr"'))}${fld('po_note',L('ملاحظة','Note'),inp('po_note','','maxlength="300"'),true)}</div>`,
      L('سجّل التحويل','Record transfer'),async()=>{const a=Number($('#po_amt').value);if(!(a>0))throw {message:L('اكتب المبلغ.','Enter the amount.')};await rpc('record_payout',{p_shop:s.id,p_amount:a,p_reference:$('#po_ref').value.trim(),p_note:$('#po_note').value.trim()});});}
  if(el=g('[data-payok]')){const id=el.dataset.payok;return act(()=>rpc('admin_ad_payment',{p_payment:id,p_approve:true,p_note:''}),L('تأكد الدفع ونزل الإعلان','Payment confirmed; the ad is live'));}
  if(el=g('[data-payno]')){const id=el.dataset.payno,n=$('#pn_'+id).value.trim();if(!n)return toast(L('اكتب السبب.','Enter the reason.'),true);return act(()=>rpc('admin_ad_payment',{p_payment:id,p_approve:false,p_note:n}),L('انرفضت الدفعة','Payment rejected'));}
  if(el=g('[data-adkill]')){const id=el.dataset.adkill;return act(async()=>{const r=await ME.sb.from('ads').update({status:'removed',status_note:L('حذفته إدارة نيل +','Removed by NILE+')}).eq('id',id);if(r.error)throw r.error;},L('انحذف الإعلان','Ad removed'));}
  if(el=g('[data-oacc]')){const id=el.dataset.oacc;return act(()=>rpc('order_action',{p_id:id,p_action:'packed',p_note:'',p_carrier:null,p_tracking:null}),L('قبلت الطلب، وصار قيد التجهيز','Order accepted; it’s being prepared'));}
  if(el=g('[data-orej]')){const id=el.dataset.orej;return aModal(L('رفض الطلب','Reject the order'),`<p class="muted">${L('ينلغي الطلب ويرجع المخزون، والسبب يوصل للعميل.','The order is cancelled, the stock goes back and the customer sees the reason.')}</p>${fld('ox_n',L('السبب','Reason'),inp('ox_n','','maxlength="300"'),true)}`,L('ارفض الطلب','Reject order'),
    ()=>{const n=$('#ox_n').value.trim();if(!n)throw {message:L('اكتب السبب.','Enter the reason.')};return rpc('order_action',{p_id:id,p_action:'cancelled',p_note:n,p_carrier:null,p_tracking:null});});}
  if(el=g('[data-oact]')){const id=el.dataset.oact,to=$('#na_'+id).value;const needs=['cancelled','return_rej'].includes(to);
    if(to==='shipped')return aModal(L('شحن الطلب','Ship the order'),`<div class="form">${fld('sh_c',L('شركة الشحن','Carrier'),sel('sh_c',CARRIERS.map(c=>[c[0],S.ar?c[1]:c[2]]),'nile'))}${fld('sh_n',L('رقم التتبع','Tracking number'),inp('sh_n','','maxlength="40" dir="ltr"'))}</div>`,L('تأكيد','Confirm'),
      ()=>rpc('order_action',{p_id:id,p_action:'shipped',p_note:'',p_carrier:$('#sh_c').value,p_tracking:$('#sh_n').value.trim()}));
    if(needs)return aModal(tx(ST[to]),fld('ox_n',L('السبب','Reason'),inp('ox_n','','maxlength="300"'),true),L('تأكيد','Confirm'),()=>rpc('order_action',{p_id:id,p_action:to,p_note:$('#ox_n').value.trim(),p_carrier:null,p_tracking:null}));
    return act(()=>rpc('order_action',{p_id:id,p_action:to,p_note:'',p_carrier:null,p_tracking:null}),tx(ST[to]));}
  if(el=g('[data-phide2]')){const p=D.products[el.dataset.phide2];return act(async()=>{const r=await ME.sb.from('products').update({hidden:!p.hidden}).eq('id',p.id);if(r.error)throw r.error;},L('انحفظ','Saved'));}
  if(el=g('[data-revdel]')){const id=el.dataset.revdel;return act(async()=>{const r=await ME.sb.from('reviews').delete().eq('id',id);if(r.error)throw r.error;},L('انحذف التقييم','Review deleted'));}
  if(el=g('[data-repdone]')){const r=AD_.reports.find(x=>x.id===el.dataset.repdone);return act(async()=>{const x=await ME.sb.from('reports').update({status:r.status==='open'?'done':'open'}).eq('id',r.id);if(x.error)throw x.error;});}
  if(el=g('[data-ban]')){const id=el.dataset.ban,v=el.dataset.v==='1';return act(async()=>{const r=await ME.sb.from('profiles').update({banned:v}).eq('id',id);if(r.error)throw r.error;},v?L('انوقف الحساب','Account suspended'):L('رجع الحساب','Account restored'));}
  if(el=g('[data-mclose]')){aHide();return;}
  if(el=g('[data-mok]')){const fn=aModal.fn;if(!fn)return;el.disabled=true;Promise.resolve().then(fn).then(()=>{aHide();toast(L('تم','Done'));aLoad();},x=>{el.disabled=false;const e=$('#merr');e.textContent=x&&x.message&&!/^[a-z_:]+/.test(x.message)?x.message:dbErr(x);e.hidden=false;});return;}
  if(el=g('[data-aact]')){const a=el.dataset.aact;
    if(a==='cleardemo'){const c=demoCount();return aModal(L('حذف البيانات التجريبية؟','Delete the sample data?'),`<p class="muted">${L(`ينحذف كل شي عليه علامة «تجريبي»: ${num(c.shops)} متاجر ومنتجاتها، ${num(c.orders)} طلب، ${num(c.ads)} إعلان، وحسابات العملاء التجريبيين. بياناتك الحقيقية ما تنلمس. ما تقدر ترجعها بعد الحذف.`,`Everything marked “Sample” is deleted: ${c.shops} shops and their products, ${c.orders} orders, ${c.ads} ads and the sample customer accounts. Your real data isn’t touched. This can’t be undone.`)}</p>`,L('احذفها','Delete it'),()=>rpc('admin_clear_demo'));}
    if(a==='signout')ME.sb.auth.signOut();if(a==='reload')aLoad();return;}
  if(e.target.id==='scrim')aHide();
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.sflag){const id=t.dataset.sflag,k=t.dataset.k;act(async()=>{const r=await ME.sb.from('shops').update({[k]:t.checked}).eq('id',id);if(r.error)throw r.error;},L('انحفظ','Saved'));}
  if(t.dataset.scomm){const id=t.dataset.scomm,v=Number(t.value);if(!(v>=0&&v<=50))return toast(L('العمولة من ٠ إلى ٥٠.','Commission must be 0 to 50.'),true);act(async()=>{const r=await ME.sb.from('shops').update({commission:v}).eq('id',id);if(r.error)throw r.error;},L('تغيّرت العمولة للطلبات الجديدة','Commission changed for new orders'));}
  if(t.dataset.phide){const id=t.dataset.phide;act(async()=>{const r=await ME.sb.from('products').update({hidden:!t.checked}).eq('id',id);if(r.error)throw r.error;},L('انحفظ','Saved'));}
});
document.addEventListener('input',e=>{if(e.target.id==='uq'){AS.q=e.target.value;const p=e.target.selectionStart;render();const i=$('#uq');i.focus();i.setSelectionRange(p,p);}});
document.addEventListener('submit',async e=>{
  e.preventDefault();const f=e.target;
  if(f.id==='loginForm'){const {error}=await ME.sb.auth.signInWithPassword({email:$('#lg_email').value.trim(),password:$('#lg_pw').value});if(error){const x=$('#lgerr');x.textContent=L('البريد أو كلمة المرور غير صحيحة.','Wrong email or password.');x.hidden=false;}return;}
  if(f.id==='claimForm'){try{await rpc('claim_admin',{p_code:$('#cl_code').value.trim().toUpperCase()});ME.owner=true;toast(L('صار حسابك مالك لوحة التحكم','This account now owns the dashboard'));aLoad();}catch(x){const m=$('#clerr');m.textContent=dbErr(x);m.hidden=false;}return;}
  if(f.id==='bnForm')return saveBanner(f);
  if(f.id==='setForm'){const n=id=>Number($('#'+id).value);
    const row={review_minutes:Math.round(n('st_review')),comm:n('st_comm'),ad_fee:n('st_adfee'),ad_days:Math.round(n('st_addays')),free_over:n('st_free'),fee_std:n('st_std'),fee_next:n('st_next'),fee_same:n('st_same'),fee_cod:n('st_cod'),fee_gift:n('st_gift'),pay_info:$('#st_payinfo').value.trim().slice(0,1000),updated_at:new Date().toISOString()};
    if(Object.entries(row).some(([k,v])=>typeof v==='number'&&!(v>=0)))return toast(L('تأكد من الأرقام.','Check the numbers.'),true);
    act(async()=>{const r=await ME.sb.from('settings').update(row).eq('id',1);if(r.error)throw r.error;},L('انحفظت الإعدادات','Settings saved'));}
});
function aModal(title,body,ok,fn){aModal.fn=fn;const s=$('#sheet');s.className='sheet dlg';s.innerHTML=`<h3 class="dh">${title}</h3><div>${body}</div><p class="err" id="merr" hidden></p><div class="dacts"><button class="btn red" data-mok>${ok}</button><button class="btn out" data-mclose>${L('تراجع','Cancel')}</button></div>`;s.hidden=false;$('#scrim').hidden=false;}
function aHide(){aModal.fn=null;$('#sheet').hidden=true;$('#scrim').hidden=true;}
$('#lang').onclick=()=>{S.ar=!S.ar;LS.set('nileplus.lang',S.ar?'ar':'en');render();};
if(LS.get('nileplus.lang')==='en')S.ar=false;

(async function(){
  render();
  if(!window.supabase||!SB_URL){$('#view').innerHTML='<div class="wrap"><p>Configuration missing.</p></div>';return;}
  ME.sb=window.supabase.createClient(SB_URL,CFG.key,{auth:{persistSession:true,autoRefreshToken:true}});
  const set=async session=>{
    ME.uid=session&&session.user?session.user.id:null;ME.email=session&&session.user?session.user.email:'';ME.ready=true;
    ME.owner=false;if(ME.uid){const {data}=await ME.sb.rpc('is_admin');ME.owner=!!data;}
    if(ME.chan){ME.sb.removeChannel(ME.chan);ME.chan=null;}
    if(ME.owner){aLoad();ME.chan=ME.sb.channel('np-admin').on('postgres_changes',{event:'*',schema:'public',table:'orders'},aReload).on('postgres_changes',{event:'*',schema:'public',table:'ad_payments'},aReload).subscribe();}
    render();
  };
  const {data}=await ME.sb.auth.getSession();await set(data.session);
  ME.sb.auth.onAuthStateChange((ev,session)=>{if(ev==='SIGNED_IN'||ev==='SIGNED_OUT')setTimeout(()=>set(session),0);});
  setInterval(()=>{if(ME.owner&&!document.hidden)aLoad();},120000);
})();
