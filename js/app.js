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
const EMOJIS=['🎧','🔊','⌚','📱','💻','📷','🎮','👟','🎒','👜','👗','🕶️','💍','💡','🛋️','☕','🍳','🧴','✨','💄','🏋️','🥤','⚽','🚲','🧸','📚','🎁','📦'];
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
  ads:{},adPays:[],payouts:[],loaded:{stores:false,products:false}};
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
    comm:nn(r.commission,0,50),ver:!!r.verified,ful:!!r.fulfilled,sample:false,createdAt:ts(r.created_at)};
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
    active:r.active!==false,hidden:!!r.hidden,sold:Math.floor(nn(r.sold,0,1e9)),co:r.co&&typeof r.co==='object'?r.co:{},sample:false,createdAt:ts(r.created_at)};
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
  status:r.status,note:str(r.status_note,500),until:ts(r.paid_until),createdAt:ts(r.created_at)});
const adLive=a=>a&&a.status==='live'&&a.until>Date.now();

/* ───────── what belongs to whom ───────── */
const isMine=owner=>!!owner&&!!ME.uid&&owner===ME.uid;
const store=id=>D.stores[id]||null;
const prod=id=>D.products[id]||null;
const modS=id=>{const s=store(id);return s?{hidden:s.status==='suspended',ver:s.ver,ful:s.ful}:{};};
const modP=id=>{const p=prod(id);return p?{hidden:p.hidden}:{};};
const storeLive=s=>!!s&&s.status==='approved';
const visible=p=>!!p&&p.active&&!p.hidden&&storeLive(store(p.s))&&p.p>0;
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
    const [st,sh,pr,rv,qs,an,fo,ads]=await Promise.all([
      q(sb.from('settings').select('*').eq('id',1)),q(sb.from('shops').select('*').limit(1000)),q(sb.from('products').select('*').order('created_at',{ascending:false}).limit(1000)),
      q(sb.from('reviews').select('*').limit(1000)),q(sb.from('questions').select('*').order('created_at',{ascending:false}).limit(1000)),q(sb.from('answers').select('*').order('created_at').limit(3000)),
      q(sb.from('follows').select('shop_id,user_id').limit(5000)),q(sb.from('ads').select('*').order('created_at',{ascending:false}).limit(500))]);
    const s=st[0]||{};
    D.settings={freeOver:nn(s.free_over,0,1e4),std:nn(s.fee_std,0,1e4),next:nn(s.fee_next,0,1e4),same:nn(s.fee_same,0,1e4),cod:nn(s.fee_cod,0,1e4),gift:nn(s.fee_gift,0,1e4),
      comm:nn(s.comm,0,50),adFee:nn(s.ad_fee,0,1e4),adDays:Math.floor(nn(s.ad_days,1,365)),payInfo:str(s.pay_info,1000),termsV:s.terms_version||1};
    if(!st[0])D.settings={...DEF};
    intoMap(D.stores,sh.map(normS));
    intoMap(D.products,pr.map(normP));
    Object.values(D.products).forEach(p=>{p.owner=(D.stores[p.s]||{}).owner||'';});
    intoMap(D.reviews,rv.map(normR));
    const byQ={};an.forEach(a=>{(byQ[a.question_id]=byQ[a.question_id]||[]).push({by:a.user_id,t:str(a.body,1500),at:ts(a.created_at),seller:!!a.is_seller});});
    intoMap(D.questions,qs.map(x=>({id:x.id,pid:x.product_id,s:x.shop_id,by:x.user_id,q:str(x.body,600),at:ts(x.created_at),ans:byQ[x.id]||[]})));
    intoMap(D.follows,fo.map(f=>({id:f.shop_id+'_'+f.user_id,s:f.shop_id,by:f.user_id})));
    intoMap(D.ads,ads.map(normA));
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
    sign_in:L('سجّل دخولك أول.','Sign in first.'),state:L('حالته تغيّرت. شوف آخر تحديث.','Its status has changed. See the latest update.'),gone:L('ما عاد موجود.','It no longer exists.')};
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
     <div class="by muted">${L('من','by')} <button class="lnk" data-store="${p.s}">${sname(st)}</button></div>
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

/* ───────── home ───────── */
function emptyMarket(){
  const loading=ME.live&&!(D.loaded.products&&D.loaded.stores);
  return `<div class="wrap"><section class="panel empty-m">${loading?`<p class="muted">${L('جاري تحميل المتجر…','Loading the store…')}</p>`:
   `<h2>${L('ما فيه منتجات معروضة للحين','No products listed yet')}</h2><p class="muted">${L('أول متجر يفتح وينشر منتجاته يظهر هنا لكل اللي يفتحون نيل +.','The first store to open and list products shows up here for everyone on NILE+.')}</p>
    <button class="btn red" style="width:auto" data-act="newStore">${L('سجّل شركتك','Register your company')}</button> <button class="btn out" style="width:auto" data-act="postad">${L('أعلن عن غرض','Post an ad')}</button>`}</section></div>`;
}
function vHome(){
  const ps=allProds();
  if(!ps.length)return heroHTML()+emptyMarket()+`<div class="wrap">${adsRail()}</div>`;
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
   ${recent.length?`<section class="panel"><div class="ph"><h2>${L('شاهدتها مؤخرًا','Your browsing history')}</h2></div><div class="rail">${recent.map(railItem).join('')}</div></section>`:''}
   ${deals.length?`<section class="panel" id="dealsP"><div class="ph"><h2>${L('عروض اليوم','Today’s Deals')}</h2><button class="lnk" data-act="dealsAll">${L('شاهد كل العروض','See all deals')}</button></div>
     <div class="rail">${deals.map(p=>`<button class="deal" data-open="${p.id}"><div class="im">${pimg(p)}</div><div class="tags"><span class="off">${L('خصم','-')} ${num(pct(p))}٪</span><span class="lim">${L('عرض','Deal')}</span></div>${priceHTML(p)}<div class="clamp2" style="font-size:13px">${pname(p)}</div></button>`).join('')}</div></section>`:''}
   ${stores.length?`<section class="panel"><div class="ph"><h2>${L('تسوّق من المتاجر','Shop by store')}</h2><button class="lnk" data-act="stores">${L('كل المتاجر','See all stores')}</button></div>
     <div class="rail">${stores.map(s=>{const r=storeRating(s.id);return`<button class="stile" data-store="${s.id}">${logo(s,60)}<b>${sname(s)}</b>${r.n?`<span class="stars" style="font-size:12px">${num(r.avg)} ★ <small>(${num(r.n)})</small></span>`:`<span class="muted" style="font-size:12px">${L('متجر جديد','New store')}</span>`}<span class="muted" style="font-size:12px">${num(storeProds(s.id).length)} ${L('منتج','products')}</span></button>`;}).join('')}</div></section>`:''}
   ${adsRail()}
   <section class="panel"><div class="ph"><h2>${L('اخترناها لك','Picked for you')}</h2></div><div class="grid">${top.slice(0,40).map(card).join('')}</div></section>
   </div>`;
}
function heroHTML(){
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
      ${out?'':`<label>${L('الكمية:','Qty:')} <select id="pq">${Array.from({length:qMax},(_,i)=>`<option value="${i+1}" ${S.qty===i+1?'selected':''}>${num(i+1)}</option>`).join('')}</select></label>
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
      <td>${hid?`<span class="stp st-cancelled">${L('أخفته الإدارة','Hidden by NILE+')}</span>`:p.active?`<span class="stp st-delivered">${L('معروض','Live')}</span>`:`<span class="stp st-placed">${L('موقوف','Paused')}</span>`}</td>
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

/* ───────── individual ads: one item, a flat fee, no commission ───────── */
const adImg=(a,i=0)=>a&&a.imgs[i]?`<img src="${IMG(a.imgs[i])}" alt="${esc(a.t)}" loading="lazy" decoding="async">`:`<span class="emo" aria-hidden="true">${a?a.e:'🏷️'}</span>`;
const adCat=k=>(ADCATS[k]||ADCATS.other)[S.ar?0:1];
const condTxt=c=>c==='new'?L('جديد','New'):L('مستعمل','Used');
const liveAds=()=>Object.values(D.ads).filter(adLive).sort((a,b)=>b.createdAt-a.createdAt);
const daysLeft=a=>Math.max(0,Math.ceil((a.until-Date.now())/864e5));
function adCard(a){
  return`<article class="prod adcard"><button class="im" data-adopen="${a.id}" aria-label="${esc(a.t)}">${adImg(a)}<span class="best" style="background:var(--black)">${condTxt(a.cond)}</span></button>
   <div class="bd"><button class="nm clamp2" data-adopen="${a.id}">${esc(a.t)}</button>
    <div class="price"><span class="whole">${num(a.p)}</span><span class="cur">${cur()}</span></div>
    <div class="ship">📍 ${cityName(cityOf(a.city))} · ${ago(a.createdAt)}</div>
    <div class="by muted">${adCat(a.c)} · ${L('إعلان فرد','Individual ad')}</div></div></article>`;
}
function adsRail(){
  const l=liveAds().slice(0,12);if(!l.length)return'';
  return`<section class="panel"><div class="ph"><h2>${L('إعلانات الأفراد','Classifieds from individuals')}</h2><button class="lnk" data-act="ads">${L('كل الإعلانات','See all ads')}</button><button class="lnk" data-act="postad">+ ${L('أعلن عن غرضك','Post your item')}</button></div>
   <div class="rail">${l.map(a=>`<button class="deal" data-adopen="${a.id}"><div class="im">${adImg(a)}</div><div class="clamp2" style="font-size:13px">${esc(a.t)}</div><div class="price"><span class="whole" style="font-size:20px">${num(a.p)}</span><span class="cur">${cur()}</span></div><div class="muted" style="font-size:12px">📍 ${cityName(cityOf(a.city))} · ${condTxt(a.cond)}</div></button>`).join('')}</div></section>`;
}
function vAds(){
  const q=S.adQ.toLowerCase().trim(),words=q.split(/\s+/).filter(Boolean);
  const l=liveAds().filter(a=>(S.adCat==='all'||a.c===S.adCat)&&(!words.length||words.every(w=>(a.t+' '+a.d).toLowerCase().includes(w))));
  return`<div class="wrap"><section class="panel"><div class="ph"><h2>${L('إعلانات الأفراد','Classifieds from individuals')}</h2><span class="muted">${L(`${num(l.length)} إعلان`,`${l.length} ads`)}</span>
    <button class="btn red" style="width:auto;margin-inline-start:auto" data-act="postad">+ ${L(`أعلن عن غرضك بـ${num(S2().adFee)} ريال`,`Post your item for ${S2().adFee} QAR`)}</button></div>
   <p class="muted" style="margin:-4px 0 12px">${L('أغراض يبيعها أفراد مباشرة. تتفق مع البائع على السعر والاستلام، ونيل + ما يستلم فلوس هالإعلانات.','Items sold directly by individuals. You agree price and pickup with the seller; NILE+ doesn’t handle payment for these ads.')}</p>
   <form id="adsearch" class="search" style="max-width:520px;margin-bottom:12px;border:1px solid var(--line)"><input id="adq" type="search" value="${esc(S.adQ)}" placeholder="${L('ابحث في الإعلانات','Search ads')}" aria-label="${L('ابحث في الإعلانات','Search ads')}"><button type="submit" aria-label="search">🔍</button></form>
   <div class="chips"><button class="chip" data-adcat="all" aria-pressed="${S.adCat==='all'}">${L('الكل','All')}</button>${Object.keys(ADCATS).map(k=>`<button class="chip" data-adcat="${k}" aria-pressed="${S.adCat===k}">${adCat(k)}</button>`).join('')}</div>
   ${l.length?`<div class="grid">${l.map(adCard).join('')}</div>`:`<div class="empty">${L('ما فيه إعلانات هنا للحين.','No ads here yet.')}</div>`}</section></div>`;
}
function vAd(){
  const a=D.ads[S.adId];
  if(!a||(!adLive(a)&&a.uid!==ME.uid&&!ME.owner))return`<div class="wrap"><section class="panel empty-m"><h2>${L('الإعلان غير متاح','This ad isn’t available')}</h2><p class="muted">${L('يمكن انتهت مدته أو انباع.','It may have expired or been sold.')}</p><button class="btn red" style="width:auto" data-act="ads">${L('كل الإعلانات','All ads')}</button></section></div>`;
  const mine=a.uid===ME.uid,i=Math.min(S.img,Math.max(0,a.imgs.length-1));
  return`<div class="pdp-wrap"><div class="wrap">
   <nav class="crumb"><button class="lnk" data-act="ads">${L('إعلانات الأفراد','Classifieds')}</button>›<button class="lnk" data-adcat="${a.c}">${adCat(a.c)}</button></nav>
   <div class="pdp" style="grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) 290px">
    <div class="gal">${a.imgs.length>1?`<div class="thumbs">${a.imgs.map((x,k)=>`<button data-img="${k}" aria-pressed="${i===k}" aria-label="${L('صورة','Image')} ${num(k+1)}"><img src="${IMG(x)}" alt="" loading="lazy"></button>`).join('')}</div>`:''}
     <div class="mainim">${adImg(a,i)}</div></div>
    <div style="min-width:0"><span class="spl">${L('إعلان فرد','Individual ad')}</span>
     <h1 class="ptitle" dir="auto">${esc(a.t)}</h1>
     <div class="pbig"><span class="whole">${num(a.p)}</span><span class="cur">${cur()}</span></div>
     <dl class="kv" style="font-size:13.5px;margin-top:12px"><dt>${L('الحالة','Condition')}</dt><dd>${condTxt(a.cond)}</dd><dt>${L('القسم','Category')}</dt><dd>${adCat(a.c)}</dd><dt>${L('المكان','Location')}</dt><dd>${cityName(cityOf(a.city))}، ${L('قطر','Qatar')}</dd><dt>${L('تاريخ النشر','Posted')}</dt><dd>${fmtFull(a.createdAt)}</dd></dl>
     ${a.d?`<hr class="s"><h3 style="font-size:16px;margin:0 0 6px">${L('الوصف','Description')}</h3><p style="white-space:pre-wrap;margin:0" dir="auto">${esc(a.d)}</p>`:''}</div>
    <aside class="bb"><div class="muted" style="font-size:12.5px">${L('البائع','Seller')}</div><b style="font-size:16px">${who(a.uid,L('صاحب الإعلان','Ad owner'))}</b>
     ${a.showPhone&&a.phone?`<div style="font-size:18px" class="tn sel" dir="ltr">${esc(a.phone)}</div><button class="btn out" data-copy="${esc(a.phone)}">${L('انسخ الرقم','Copy number')}</button>`:''}
     ${mine?`<button class="btn blk" data-act="myads">${L('إدارة إعلاناتي','Manage my ads')}</button>`:`<button class="btn red" data-adchat="${a.id}">${L('راسل البائع','Message seller')}</button>`}
     <div class="note" style="margin:0">${L('للأمان: قابل البائع في مكان عام، وافحص الغرض قبل ما تدفع، ولا تحوّل فلوس مقدمًا.','Stay safe: meet in a public place, check the item before paying, and never pay in advance.')}</div>
     ${mine?'':`<button class="lnk" data-report="ad:${a.id}" style="font-size:13px">${L('إبلاغ عن الإعلان','Report this ad')}</button>`}</aside>
   </div>
   ${liveAds().filter(x=>x.id!==a.id&&x.c===a.c).length?`<section class="sec2"><h2>${L('إعلانات مشابهة','Similar ads')}</h2><div class="grid">${liveAds().filter(x=>x.id!==a.id&&x.c===a.c).slice(0,8).map(adCard).join('')}</div></section>`:''}
  </div></div>`;
}

/* posting an ad */
let AD=null;
const newAd=()=>({c:'electronics',t:'',d:'',p:'',cond:'used',city:S.city,phone:ME.doc.phone||'',show:true,e:'📦',imgs:[],method:'transfer',ref:''});
function startAd(){if(!guard())return;AD=newAd();S.err='';go('postad');}
function grabAd(){
  if(!AD||!document.getElementById('adForm'))return;
  AD.c=V('ad_c')||AD.c;AD.t=V('ad_t');AD.d=V('ad_d');AD.p=V('ad_p');AD.cond=V('ad_cond')||AD.cond;AD.city=V('ad_city')||AD.city;
  AD.phone=V('ad_phone');AD.show=C('ad_show');AD.method=V('ad_m')||AD.method;AD.ref=V('ad_ref');
  const em=document.querySelector('input[name="ad_e"]:checked');if(em)AD.e=em.value;
}
function payBox(method,ref){
  const st=S2();
  return`<div class="paybox"><div class="orow"><b>${L('رسوم الإعلان','Ad fee')}</b><b class="tn" style="font-size:20px">${money(st.adFee)}</b></div>
   <p class="muted" style="margin:4px 0 8px;font-size:13px">${L(`يظهر إعلانك ${num(st.adDays)} يوم بعد ما تأكد إدارة نيل + استلام المبلغ، وتقدر تجدّده بنفس الرسوم.`,`Your ad shows for ${st.adDays} days once NILE+ confirms the payment, and you can renew it for the same fee.`)}</p>
   <div class="note" style="margin:0 0 10px;white-space:pre-wrap">${st.payInfo?esc(st.payInfo):L('إدارة نيل + بتتواصل معك على رقمك لتأكيد طريقة الدفع.','NILE+ will contact you on your number to arrange payment.')}</div>
   <div class="form">${fld('ad_m',L('طريقة الدفع','Payment method'),sel('ad_m',[['transfer',L('تحويل بنكي','Bank transfer')],['cash',L('نقدًا','Cash')],['other',L('طريقة ثانية','Other')]],method))}
    ${fld('ad_ref',L('رقم العملية أو اسم المحوّل','Transfer reference or sender name'),inp('ad_ref',ref,'maxlength="80"'),false,L('يساعد الإدارة تتأكد من دفعتك بسرعة.','Helps NILE+ match your payment quickly.'))}</div></div>`;
}
function vPostAd(){
  if(!ME.uid)return vSell();
  if(!AD)AD=newAd();
  const a=AD||{};
  return`<div class="wrap"><section class="panel sellhero" style="max-width:900px"><button class="lnk" data-act="myads">‹ ${L('إعلاناتي','My ads')}</button>
   <h2>${L('أعلن عن غرضك','Post your item')}</h2>
   <form id="adForm" novalidate>
    <div class="form">
     ${fld('ad_t',L('عنوان الإعلان','Ad title'),inp('ad_t',a.t,'maxlength="120" required placeholder="'+L('مثل: آيفون ١٤ برو ٢٥٦ جيجا','e.g. iPhone 14 Pro 256 GB')+'"'),true)}
     ${fld('ad_c',L('القسم','Category'),sel('ad_c',Object.keys(ADCATS).map(k=>[k,adCat(k)]),a.c))}
     ${fld('ad_p',L('السعر (ر.ق)','Price (QAR)'),inp('ad_p',a.p,'type="number" min="0" step="1" inputmode="decimal" required'))}
     ${fld('ad_cond',L('حالة الغرض','Condition'),sel('ad_cond',[['used',L('مستعمل','Used')],['new',L('جديد','New')]],a.cond))}
     ${fld('ad_city',L('المكان','Location'),sel('ad_city',CITIES.map(c=>[c.k,cityName(c)]),a.city))}
     ${fld('ad_d',L('الوصف','Description'),area('ad_d',a.d,'maxlength="3000" placeholder="'+L('الحالة، العمر، سبب البيع، وأي ملحقات معه.','Condition, age, why you’re selling, and what comes with it.')+'"'),true)}
     ${fld('ad_phone',L('رقم التواصل','Contact number'),inp('ad_phone',a.phone,'maxlength="16" dir="ltr" inputmode="tel" placeholder="5555 1234"'))}
     <div class="fld"><span class="flab">&nbsp;</span><label class="chk"><input type="checkbox" id="ad_show" ${a.show?'checked':''}> ${L('اعرض رقمي في الإعلان','Show my number on the ad')}</label></div>
    </div>
    <h3 class="h3" style="margin-top:16px">${L('الصور','Photos')}</h3>
    <div class="upl">${a.imgs.map((id,i)=>`<div class="ph"><img src="${IMG(id)}" alt=""><button type="button" data-rmadimg="${i}" aria-label="${L('حذف الصورة','Remove photo')}">×</button></div>`).join('')}
     ${a.imgs.length<8?`<label class="ph add"><input type="file" id="adimgs" accept="image/*" multiple hidden><span>+<br><small>${L('أضف صور','Add photos')}</small></span></label>`:''}</div>
    ${S.uploading?`<p class="muted">${L('جاري رفع الصور…','Uploading photos…')}</p>`:''}
    <div class="fld" style="margin-top:8px"><span class="flab">${L('رمز يظهر لو ما فيه صورة','Icon shown when there’s no photo')}</span><div class="emos">${EMOJIS.map(x=>`<label class="emopick"><input type="radio" name="ad_e" value="${x}" ${a.e===x?'checked':''}><span>${x}</span></label>`).join('')}</div></div>
    <h3 class="h3" style="margin-top:16px">${L('الدفع','Payment')}</h3>
    ${S2().adFee?payBox(a.method,a.ref):`<div class="note">${L('نشر الإعلانات مجاني حاليًا.','Posting ads is free for now.')}</div>`}
    ${S.err?`<p class="err" role="alert">${esc(S.err)}</p>`:''}
    <div style="margin-top:14px"><button class="btn red" style="width:auto" type="submit" ${S.busy||S.uploading?'disabled':''}>${S.busy?L('جاري الإرسال…','Sending…'):S2().adFee?L(`أرسل الإعلان (${money(S2().adFee)})`,`Submit ad (${money(S2().adFee)})`):L('انشر الإعلان','Publish ad')}</button></div>
   </form></section></div>`;
}
async function submitAd(){
  if(!guard())return;grabAd();const a=AD;
  const price=Number(a.p);
  const bad=m=>{S.err=m;render(true);const e=document.querySelector('.err[role=alert]');if(e)e.scrollIntoView({block:'center'});};
  if(a.t.length<3)return bad(L('اكتب عنوان واضح للإعلان.','Write a clear title.'));
  if(!(price>=0)||a.p==='')return bad(L('اكتب السعر.','Enter the price.'));
  const phone=a.phone.replace(/[^\d+ ]/g,'').slice(0,16);
  if(!phone&&a.show)return bad(L('اكتب رقم التواصل، أو ألغِ عرض الرقم.','Enter a contact number, or untick showing it.'));
  S.busy=true;S.err='';render(true);
  try{
    await rpc('create_ad',{p:{category:a.c,title:a.t.slice(0,120),description:a.d.slice(0,3000),price:Math.round(price),condition:a.cond,city:a.city,contact_phone:phone,show_phone:a.show,emoji:a.e,images:a.imgs},
      p_method:a.method,p_reference:a.ref.slice(0,80)});
    if(phone&&!ME.doc.phone){ME.doc.phone=phone;saveMe();}
    S.busy=false;AD=null;await Promise.all([loadCatalog(),loadMine()]);
    toast(S2().adFee?L('وصل إعلانك. ينزل أول ما تأكد الإدارة الدفع.','Ad received. It goes live once NILE+ confirms the payment.'):L('انتشر إعلانك','Your ad is live'));
    go('myads');
  }catch(e){S.busy=false;bad(dbErr(e));}
}
function vMyAds(){
  if(!ME.uid)return vSell();
  const l=Object.values(D.ads).filter(a=>a.uid===ME.uid).sort((a,b)=>b.createdAt-a.createdAt);
  const pay=a=>D.adPays.filter(x=>x.ad===a.id).sort((x,y)=>y.at-x.at)[0];
  const state=a=>{
    if(a.status==='sold')return['st-delivered',L('انباع','Sold')];
    if(a.status==='removed')return['st-cancelled',L('محذوف','Removed')];
    if(a.status==='rejected')return['st-cancelled',L('مرفوض','Rejected')];
    if(a.status==='live'&&a.until>Date.now())return['st-delivered',L(`ظاهر · باقي ${num(daysLeft(a))} يوم`,`Live · ${daysLeft(a)} days left`)];
    if(a.status==='live')return['st-cancelled',L('انتهت مدته','Expired')];
    const p=pay(a);return p&&p.status==='rejected'?['st-return_req',L('الدفع ما تأكد','Payment not confirmed')]:['st-placed',L('ينتظر تأكيد الدفع','Waiting for payment confirmation')];
  };
  return`<div class="wrap"><section style="margin-top:16px"><button class="lnk" data-act="account">‹ ${L('حسابك','Your account')}</button>
   <div class="orow" style="margin:8px 0 12px"><h2 style="font-size:24px;margin:0">${L('إعلاناتي','My ads')}</h2><button class="btn red" style="width:auto" data-act="postad">+ ${L('إعلان جديد','New ad')}</button></div>
   ${l.length?l.map(a=>{const [cls,txt]=state(a),p=pay(a),pend=p&&p.status==='pending',exp=a.status==='live'&&a.until<=Date.now(),open=['awaiting_payment','live'].includes(a.status);
    return`<div class="ocard"><div class="ob" style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap">
     <button class="mini" style="width:72px;height:72px;font-size:34px;border:0;cursor:pointer" data-adopen="${a.id}">${adImg(a)}</button>
     <div style="flex:1;min-width:200px"><b dir="auto">${esc(a.t)}</b><div class="tn">${money(a.p)}</div><div style="margin-top:4px"><span class="stp ${cls}">${txt}</span></div>
      ${p&&p.status==='rejected'&&p.note?`<div class="note" style="margin-top:6px">${L('ملاحظة الإدارة:','Note from NILE+:')} ${esc(p.note)}</div>`:''}
      ${a.note?`<div class="note" style="margin-top:6px">${esc(a.note)}</div>`:''}
      ${pend?`<div class="muted" style="font-size:12.5px;margin-top:6px">${L(`دفعة ${money(p.amount)} وصلت للإدارة ${ago(p.at)}، وتنتظر التأكيد.`,`A ${money(p.amount)} payment reached NILE+ ${ago(p.at)} and is awaiting confirmation.`)}</div>`:''}</div>
     <div class="acts2">${open&&!pend&&(exp||a.status==='awaiting_payment'||daysLeft(a)<=7)?`<button class="btn red" style="width:auto" data-adrenew="${a.id}">${a.status==='awaiting_payment'?L('أرسل الدفع مرة ثانية','Send payment again'):L(`جدّد (${money(S2().adFee)})`,`Renew (${money(S2().adFee)})`)}</button>`:''}
      ${a.status==='live'&&!exp?`<button class="btn out" style="width:auto" data-adsold="${a.id}">${L('انباع','Mark sold')}</button>`:''}
      ${open?`<button class="btn out" style="width:auto" data-adremove="${a.id}">${L('احذف الإعلان','Remove ad')}</button>`:''}</div>
    </div></div>`;}).join(''):`<div class="panel" style="text-align:center"><p>${L(`ما عندك إعلانات. أعلن عن أي غرض بـ${num(S2().adFee)} ريال.`,`No ads yet. List any item for ${S2().adFee} QAR.`)}</p><button class="btn red" style="width:auto" data-act="postad">${L('أعلن عن غرضك','Post your item')}</button></div>`}
  </section></div>`;
}
function renewSheet(aid){
  if(!guard())return;
  formSheet(L('دفع رسوم الإعلان','Pay the ad fee'),payBox('transfer',''),L('أرسل','Send'),async f=>{
    await rpc('renew_ad',{p_ad:aid,p_method:f.querySelector('#ad_m').value,p_reference:f.querySelector('#ad_ref').value.trim().slice(0,80)});
    await loadMine();toast(L('وصلت الدفعة للإدارة. ينتظر التأكيد.','Payment sent to NILE+ for confirmation.'));
  });
}
async function setAdStatus(aid,status){
  try{const {error}=await ME.sb.from('ads').update({status}).eq('id',aid);if(error)throw error;await loadCatalog();toast(status==='sold'?L('مبروك البيع!','Congrats on the sale!'):L('انحذف الإعلان','Ad removed'));}
  catch(e){toast(dbErr(e),true);}
}

/* ───────── signing in ───────── */
function openAuth(mode){
  const m=mode||'in';
  const t={in:L('تسجيل الدخول','Sign in'),up:L('حساب جديد','Create account'),reset:L('نسيت كلمة المرور','Forgot password'),newpw:L('كلمة مرور جديدة','New password')}[m];
  const body={in:`${fld('au_email',L('البريد الإلكتروني','Email'),inp('au_email','','type="email" dir="ltr" autocomplete="email" required'),true)}${fld('au_pw',L('كلمة المرور','Password'),inp('au_pw','','type="password" dir="ltr" autocomplete="current-password" required'),true)}`,
    up:`${fld('au_name',L('الاسم الكامل','Full name'),inp('au_name','','maxlength="80" autocomplete="name" required'),true)}${fld('au_phone',L('رقم الجوال','Mobile number'),inp('au_phone','','maxlength="16" dir="ltr" inputmode="tel" autocomplete="tel" placeholder="5555 1234"'),true)}
        ${fld('au_email',L('البريد الإلكتروني','Email'),inp('au_email','','type="email" dir="ltr" autocomplete="email" required'),true)}${fld('au_pw',L('كلمة المرور (٨ أحرف على الأقل)','Password (8+ characters)'),inp('au_pw','','type="password" dir="ltr" autocomplete="new-password" minlength="8" required'),true)}`,
    reset:fld('au_email',L('البريد الإلكتروني','Email'),inp('au_email','','type="email" dir="ltr" autocomplete="email" required'),true),
    newpw:fld('au_pw',L('كلمة المرور الجديدة','New password'),inp('au_pw','','type="password" dir="ltr" autocomplete="new-password" minlength="8" required'),true)}[m];
  formSheet(t,`<div class="form">${body}</div>
    ${m==='in'?`<div class="authlinks"><button type="button" class="lnk" data-auth="up">${L('ما عندك حساب؟ سجّل الحين','No account? Create one')}</button><button type="button" class="lnk" data-auth="reset">${L('نسيت كلمة المرور؟','Forgot password?')}</button></div>`:''}
    ${m==='up'?`<div class="authlinks"><button type="button" class="lnk" data-auth="in">${L('عندك حساب؟ سجّل دخولك','Have an account? Sign in')}</button></div>`:''}`,t,async f=>{
    const g=k=>{const e=f.querySelector('#'+k);return e?e.value.trim():'';},email=g('au_email'),pw=f.querySelector('#au_pw')?f.querySelector('#au_pw').value:'';
    const A=ME.sb.auth;
    if(m!=='newpw'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return L('اكتب بريد إلكتروني صحيح.','Enter a valid email.');
    if(m==='in'){const {error}=await A.signInWithPassword({email,password:pw});if(error)return /confirm/i.test(error.message)?L('أكّد بريدك الإلكتروني أول من الرسالة اللي وصلتك.','Confirm your email first using the message we sent.'):L('البريد أو كلمة المرور غير صحيحة.','Wrong email or password.');toast(L('أهلًا فيك!','Welcome back!'));return;}
    if(m==='up'){const name=g('au_name'),phone=g('au_phone').replace(/[^\d+]/g,'');
      if(name.length<2)return L('اكتب اسمك.','Enter your name.');if(pw.length<8)return L('كلمة المرور لازم ٨ أحرف على الأقل.','The password needs 8 or more characters.');
      const {data,error}=await A.signUp({email,password:pw,options:{data:{full_name:name,phone},emailRedirectTo:location.origin+location.pathname}});
      if(error)return /registered|exists/i.test(error.message)?L('هذا البريد مسجّل. سجّل دخولك.','This email is already registered. Sign in.'):/password/i.test(error.message)?L('اختر كلمة مرور أقوى.','Choose a stronger password.'):L('ما قدرنا ننشئ الحساب. حاول بعد شوي.','Couldn’t create the account. Try again shortly.');
      if(!data.session){setTimeout(()=>dlg(L('تأكد من بريدك','Check your email'),L(`أرسلنا رابط تأكيد إلى ${esc(email)}. افتحه وبعدها سجّل دخولك.`,`We sent a confirmation link to ${esc(email)}. Open it, then sign in.`)),50);}
      else toast(L('انفتح حسابك. أهلًا فيك!','Your account is ready. Welcome!'));return;}
    if(m==='reset'){const {error}=await A.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)return L('ما قدرنا نرسل الرابط. حاول بعد شوي.','Couldn’t send the link. Try again shortly.');setTimeout(()=>dlg(L('تأكد من بريدك','Check your email'),L('لو البريد مسجّل عندنا، بيوصلك رابط لتغيير كلمة المرور.','If that email is registered, a link to reset your password is on its way.')),50);return;}
    if(m==='newpw'){if(pw.length<8)return L('كلمة المرور لازم ٨ أحرف على الأقل.','The password needs 8 or more characters.');const {error}=await A.updateUser({password:pw});if(error)return dbErr(error);toast(L('تغيّرت كلمة المرور','Password changed'));}
  });
}

/* ───────── company registration ───────── */
function readCompany(f){
  const g=k=>{const e=f.querySelector('#'+k);return e?e.value.trim():'';};
  return {cr:g('rg_cr').toUpperCase().replace(/\s/g,''),act:g('rg_act'),mgr:g('rg_mgr'),phone:g('rg_phone').replace(/[^\d+ ]/g,''),email:g('rg_email'),file:(f.querySelector('#rg_file')||{}).files?.[0]||null};
}
function checkCompany(c,needFile){
  if(!/^[0-9A-Z-]{3,20}$/.test(c.cr))return L('اكتب رقم السجل التجاري (أرقام وحروف إنجليزية فقط).','Enter the commercial registration number (digits and Latin letters only).');
  if(c.act.length<2)return L('اكتب النشاط التجاري.','Enter the business activity.');
  if(c.mgr.length<2)return L('اكتب اسم المدير المخوّل.','Enter the authorised manager’s name.');
  if(!/^[0-9+ ]{8,16}$/.test(c.phone))return L('اكتب رقم تواصل صحيح.','Enter a valid contact number.');
  if(c.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))return L('البريد الإلكتروني غير صحيح.','The email isn’t valid.');
  if(needFile&&!c.file)return L('ارفع صورة أو ملف السجل التجاري.','Upload the commercial registration file.');
  if(c.file&&c.file.size>10*1024*1024)return L('حجم الملف أكبر من ١٠ ميجا.','The file is larger than 10 MB.');
  if(c.file&&!/^(application\/pdf|image\/(jpeg|png|webp))$/.test(c.file.type))return L('الملف لازم يكون PDF أو صورة.','The file must be a PDF or an image.');
  return '';
}
async function uploadCR(file){
  const ext={'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type]||'bin';
  const path=`${ME.uid}/${crypto.randomUUID()}.${ext}`;
  const {error}=await ME.sb.storage.from('cr-docs').upload(path,file,{contentType:file.type,upsert:false});
  if(error)throw error;return path;
}
async function submitRegistration(f){
  if(!guard())return;
  const c=readCompany(f),d=readStoreForm();
  const err=checkCompany(c,true)||d.err||(!f.querySelector('#rg_terms').checked?L('لازم توافق على شروط البيع.','You need to accept the seller terms.'):'');
  if(err)return formErr(f,err);
  const b=f.querySelector('[type=submit]');b.disabled=true;b.textContent=L('جاري الإرسال…','Sending…');
  try{
    const path=await uploadCR(c.file);
    const id=await rpc('register_shop',{p:{name_ar:d.ar||d.en,name_en:d.en,logo_ar:d.lg[0],logo_en:d.lg[1],color:d.bg,emoji:d.e,about_ar:d.d[0],about_en:d.d[1],city:d.city,ret_days:d.ret,resp:d.resp,
      public_phone:d.phone,cr_number:c.cr,activity:c.act,manager_name:c.mgr,contact_phone:c.phone,contact_email:c.email,cr_file:path,accept_terms:true}});
    S.mySid=id;S.makeStore=false;S.joinAs='';S.dirty=false;
    await loadCatalog();toast(L('وصل طلبك. بنراجعه ونرد عليك هنا.','Request received. We’ll review it and reply here.'));go('sell');
  }catch(e){b.disabled=false;b.textContent=L('أرسل طلب التسجيل','Submit registration');formErr(f,dbErr(e));}
}
async function submitResubmit(f){
  if(!guard())return;
  const c=readCompany(f),err=checkCompany(c,false);if(err)return formErr(f,err);
  const b=f.querySelector('[type=submit]');b.disabled=true;
  try{
    const p={cr_number:c.cr,activity:c.act,manager_name:c.mgr,contact_phone:c.phone,contact_email:c.email};
    if(c.file)p.cr_file=await uploadCR(c.file);
    await rpc('resubmit_shop',{p_shop:f.dataset.sid,p});S.dirty=false;
    await loadCatalog();toast(L('انرسل طلبك مرة ثانية.','Your request was sent again.'));go('sell');
  }catch(e){b.disabled=false;formErr(f,dbErr(e));}
}

// shareable links: index.html?p=<product> ?s=<shop> ?ad=<ad> ?o=<order>
function deepLink(){
  const u=new URLSearchParams(location.search),p=u.get('p'),s=u.get('s'),a=u.get('ad'),o=u.get('o');
  if(isUuid(p))go('product',{pid:p,img:0});else if(isUuid(s))go('store',{sid:s,stab:'home'});else if(isUuid(a))go('ad',{adId:a,img:0});else if(isUuid(o))go('order',{oid:o});
}

/* ───────── order status rules: which step can follow which ───────── */
const FLOW={packed:['placed'],shipped:['packed'],out:['shipped'],delivered:['shipped','out'],returned:['return_req'],return_rej:['return_req'],refunded:['returned'],cancelled:['placed','packed'],return_req:['delivered']};

/* ───────── views ───────── */
const VIEWS={home:vHome,results:vResults,product:vProduct,stores:vStores,store:vStore,checkout:vCheckout,done:vDone,orders:vOrders,order:vOrder,account:vAccount,addrs:vAddrs,inbox:vInbox,thread:vThread,sell:vSell,edit:vEdit,ads:vAds,ad:vAd,postad:vPostAd,myads:vMyAds};
let softPending=false;
function render(keepScroll,soft){
  headerBits();
  if(soft){softPending=true;return;}
  softPending=false;
  if(S.view==='edit')grabEdit();
  if(S.view==='postad')grabAd();
  let html;
  try{html=(VIEWS[S.view]||vHome)();}
  catch(e){console.error('[NILE+]',e);html=`<div class="wrap"><section class="panel">${L('صار خطأ في عرض الصفحة.','Something went wrong showing this page.')} <button class="lnk" data-act="home">${L('الرئيسية','Home')}</button></section></div>`;}
  const chat=document.activeElement&&document.activeElement.id==='cmsg';
  $('#view').innerHTML=html;
  if(!$('#sheet').hidden&&mode==='cart')openCart(true);
  if(!keepScroll)scrollTo({top:0});
  if(S.view==='thread'){const m=$('#msgs');if(m)m.scrollTop=m.scrollHeight;if(!document.hidden)markThreadSeen();
    const c=$('#cmsg');if(c&&chat){c.focus();c.selectionStart=c.selectionEnd=c.value.length;}}
  names();
}
function go(view,patch={}){
  Object.assign(S,patch,{view});S.err='';S.dirty=false;hide();
  if(view==='product'&&S.pid&&ME.doc.recent[0]!==S.pid){ME.doc.recent=[S.pid,...ME.doc.recent.filter(x=>x!==S.pid)].slice(0,30);saveMe();}
  render();
}
const goCat=c=>go('results',{cat:c,fav:false,dealsOnly:false,q:''});

/* ───────── sheets and dialogs ───────── */
let mode='',PEND=null;
function show(cls,html,m='',keep){const s=$('#sheet'),top=s.scrollTop;mode=m;s.className='sheet '+cls;s.innerHTML=html;s.hidden=false;$('#scrim').hidden=false;s.scrollTop=keep?top:0;names(s);}
function hide(){$('#sheet').hidden=true;$('#scrim').hidden=true;mode='';PEND=null;}
const head=t=>`<div class="sh-head"><h3>${t}</h3><button class="x" data-act="close" aria-label="${L('إغلاق','Close')}">×</button></div>`;
function dlg(title,body){show('dlg',`<h3 class="dh">${title}</h3><div class="dbody">${body}</div><button class="btn red" data-act="close">${L('حسنًا','OK')}</button>`);}
function confirmBox(title,body,ok,fn){PEND=fn;show('dlg',`<h3 class="dh">${title}</h3><div class="dbody">${body}</div><div class="dacts"><button class="btn red" data-act="confirmOk">${ok}</button><button class="btn out" data-act="close">${L('تراجع','Cancel')}</button></div>`);}
function formSheet(title,inner,ok,fn){PEND=fn;show('dlg',`<form id="sform2" class="sform" novalidate><h3 class="dh">${title}</h3>${inner}<p class="err" id="ferr" role="alert" hidden></p><div class="dacts"><button class="btn red" type="submit">${ok}</button><button class="btn out" type="button" data-act="close">${L('تراجع','Cancel')}</button></div></form>`);}
async function submitSheet(f){
  if(!PEND||f.dataset.busy)return;
  const b=f.querySelector('[type=submit]');f.dataset.busy='1';b.disabled=true;
  let err;try{err=await PEND(f);}catch(e){err=e&&e.code==='gone'?L('ما عاد موجود.','It no longer exists.'):dbErr(e);}
  delete f.dataset.busy;b.disabled=false;
  if(err){const e=$('#ferr');if(e){e.textContent=err;e.hidden=false;}return;}
  if(!$('#sheet').hidden&&mode!=='cart')hide();
  render(true);
}
function reasonSheet(title,list,ok,fn){
  formSheet(title,`<div class="rlist">${list.map(([k,t],i)=>`<label class="rc"><input type="radio" name="rsn" value="${k}" ${i?'':'checked'}><div class="rt">${tx(t)}</div></label>`).join('')}</div>
   <div class="fld"><label for="rnote">${L('تفاصيل إضافية (اختياري)','More details (optional)')}</label><textarea class="inp ta" id="rnote" maxlength="300"></textarea></div>`,ok,async f=>{
    const k=(f.querySelector('input[name=rsn]:checked')||{}).value,r=list.find(x=>x[0]===k);
    if(!r)return L('اختر سبب.','Pick a reason.');
    const note=f.querySelector('#rnote').value.trim().slice(0,300),raw=S.ar?r[1][0]:r[1][1];
    return fn(k,raw+(note?' — '+note:''),note);
  });
}

/* cart */
function openCart(keep){
  const st=S2(),lines=ME.doc.cart.map((c,i)=>({c,i,p:prod(c.pid)})),now=lines.filter(x=>!x.c.later),lat=lines.filter(x=>x.c.later);
  const sub=subtotal(),left=Math.max(0,st.freeOver-sub);
  const row=({c,i,p})=>{
    if(!p||!visible(p))return`<div class="ci"><span class="e">📦</span><div class="t"><b>${L('منتج ما عاد متوفر','An item that’s no longer available')}</b><div class="row"><button class="lnk" data-rm="${i}">${L('حذف','Delete')}</button></div></div></div>`;
    const vo=p.v.o[c.v]||p.v.o[0];
    return`<div class="ci"><button class="e" data-open="${p.id}">${pimg(p)}</button><div class="t"><b class="clamp2">${pname(p)}</b>
     <span class="${p.stock<=5?'redc':'okc'}">${p.stock<1?L('نفدت الكمية','Out of stock'):p.stock<=5?L(`باقي ${num(p.stock)} فقط`,`Only ${p.stock} left`):L('متوفر','In stock')}</span>
     ${p.v.o.length>1||vo.ar!=='قياسي'?`<span class="muted">${tx(p.v.t)}: ${tx([vo.ar,vo.en])}</span>`:''}
     <span class="muted">${L('البائع:','Sold by:')} ${sname(store(p.s))}</span>
     ${p.cpn&&ME.doc.cpns.includes(p.id)?`<span class="okc">${L(`كوبون ${money(p.cpn)} مطبّق`,`${money(p.cpn)} coupon applied`)}</span>`:''}
     ${priceHTML(p)}
     <div class="row">${c.later?`<button class="lnk" data-tocart="${i}">${L('انقله إلى السلة','Move to cart')}</button>`:`<div class="qty"><button data-dec="${i}" aria-label="${L('أقل','Fewer')}">${c.q>1?'−':'🗑'}</button><span>${num(c.q)}</span><button data-inc="${i}" aria-label="${L('أكثر','More')}" ${c.q>=Math.min(99,p.stock)?'disabled':''}>+</button></div><button class="lnk" data-later="${i}">${L('احفظه لوقت لاحق','Save for later')}</button>`}<button class="lnk" data-rm="${i}">${L('حذف','Delete')}</button></div></div></div>`;};
  show('panelx',head(L('سلة التسوق','Shopping Cart'))+`<div class="sbody">
   ${now.length?`<div class="prog">${left?L(`أضف منتجات بقيمة <b>${money(left)}</b> للحصول على توصيل مجاني`,`Add <b>${money(left)}</b> more for FREE delivery`):'✓ '+L('طلبك مؤهل للتوصيل المجاني','Your order qualifies for FREE delivery')}<div class="bar"><i style="width:${Math.min(100,sub/Math.max(1,st.freeOver)*100)}%"></i></div></div>`:''}
   ${now.length?now.map(row).join(''):`<p style="text-align:center;padding:30px 0;font-size:16px">${L('سلة نيل + فارغة','Your NILE+ cart is empty')}</p>`}
   <div class="subt">${L(`المجموع الفرعي (${num(count())} منتجات):`,`Subtotal (${count()} items):`)} <b class="tn">${money(sub)}</b></div>
   <button class="btn red" data-act="toCheckout" ${now.length?'':'disabled'}>${L('إتمام الشراء','Proceed to checkout')}</button>
   ${lat.length?`<h4 style="margin:22px 0 4px;font-size:16px">${L(`محفوظ لوقت لاحق (${num(lat.length)})`,`Saved for later (${lat.length})`)}</h4>${lat.map(row).join('')}`:''}
   ${canWrite()?'':`<p class="muted" style="font-size:12px">${L('سلتك محفوظة على هذا الجهاز.','Your cart is saved on this device.')}</p>`}</div>`,'cart',keep);
}

/* menu, area, notifications, help */
function openMenu(){
  const sts=Object.values(D.stores).filter(s=>storeLive(s)&&storeProds(s.id).length).slice(0,12),b=(a,t)=>`<button data-act="${a}">${t}<span>›</span></button>`;
  show('side',`<div class="sh-head"><h3>👤 ${ME.uid?`<span data-uid="${esc(ME.uid)}">${L('حسابك','Your account')}</span>`:L('مرحبًا','Hello')}</h3><button class="x" data-act="close" aria-label="${L('إغلاق','Close')}">×</button></div>
  <div class="side-list"><h4>${L('الأكثر رواجًا','Trending')}</h4>${b('dealsAll',L('عروض اليوم','Today’s Deals'))}${b('bestsellers',L('الأكثر مبيعًا','Best Sellers'))}${b('stores',L('كل المتاجر','All stores'))}
  <h4>${L('تسوّق حسب القسم','Shop by department')}</h4>${Object.keys(CATS).filter(k=>k!=='all').map(k=>b('c:'+k,`${CATS[k][2]}  ${cname(k)}`)).join('')}
  ${sts.length?`<h4>${L('المتاجر','Stores')}</h4>${sts.map(s=>`<button data-store="${s.id}">${sname(s)}<span>›</span></button>`).join('')}`:''}
  <h4>${L('حسابك','Your account')}</h4>${b('orders',L('طلباتك','Your orders'))}${b('inbox',L('الرسائل','Messages'))}${b('notifs',L('التنبيهات','Notifications'))}${b('addrs',L('عناوينك','Your addresses'))}${b('wish',L('قائمة الأمنيات','Wish list'))}
  <h4>${L('إعلانات الأفراد','Classifieds')}</h4>${b('ads',L('تصفّح الإعلانات','Browse ads'))}${b('postad',L(`أعلن عن غرض (${num(S2().adFee)} ر.ق)`,`Post an ad (${S2().adFee} QAR)`))}${b('myads',L('إعلاناتي','My ads'))}
  <h4>${L('البيع','Selling')}</h4>${b('sell',myStores().length?L('مركز البائع','Seller Center'):L('سجّل شركتك','Register your company'))}${ME.owner?b('admin',L('لوحة التحكم','Dashboard')):''}
  ${ME.uid?b('signout',L('تسجيل الخروج','Sign out')):b('signin',L('تسجيل الدخول','Sign in'))}
  <h4>${L('المساعدة والإعدادات','Help & Settings')}</h4>${b('city','📍 '+cityName(city()))}${b('help',L('خدمة العملاء','Customer Service'))}${b('lang',S.ar?'English':'العربية')}</div>`);
}
function openCity(){show('dlg',`<h3 class="dh">${L('اختر منطقة التوصيل','Choose your delivery area')}</h3><p class="muted" style="margin:0;font-size:13px">${L('مواعيد التوصيل والأسعار تتغير حسب المنطقة.','Delivery dates and fees depend on your area.')}</p>
  <div class="citylist">${CITIES.map(c=>`<button data-city="${c.k}" aria-pressed="${S.city===c.k}"><span>${cityName(c)}</span><span class="muted" style="font-size:12.5px">${c.same?L('توصيل اليوم متاح','Same day'):c.min===1?L('توصيل غدًا','Next day'):L(`${num(c.min+1)}–${num(c.max+1)} أيام`,`${c.min+1}–${c.max+1} days`)}</span></button>`).join('')}</div>
  <button class="btn out" data-act="close">${L('تم','Done')}</button>`);}
function openNotifs(){
  const l=alerts().slice(0,40);
  const row=a=>{
    if(a.k==='m'){const st=store(a.th.s);return`<button class="nrow" data-thread="${a.th.id}"><b>💬 ${a.seller?L('رسالة من عميل','Message from a customer'):L(`رسالة من ${sname(st)}`,`Message from ${sname(st)}`)}</b><span class="muted clamp1">${esc(a.m.t)}</span><small class="muted">${ago(a.t)}</small></button>`;}
    const o=a.o,t=a.k==='s'?(a.e.s==='placed'?L('🛒 طلب جديد لمتجرك','🛒 New order for your store'):a.e.s==='cancelled'?L('العميل ألغى الطلب','The customer cancelled'):a.e.s==='return_req'?L('↩️ طلب إرجاع','↩️ Return request'):tx(ST[a.e.s])):`📦 ${tx(ST[a.e.s])}`;
    return`<button class="nrow" data-order="${o.id}"><b>${t}</b><span class="muted">${L('طلب','Order')} <span dir="ltr">${esc(o.no)}</span> · ${sname(store(o.s))}</span><small class="muted">${ago(a.t)}</small></button>`;};
  show('panelx',head(L('التنبيهات','Notifications'))+`<div class="sbody">${l.length?l.map(row).join(''):`<p class="muted" style="text-align:center;padding:30px 0">${L('ما فيه شي جديد.','Nothing new.')}</p>`}
   <div style="display:flex;gap:8px;margin-top:14px"><button class="btn out" data-act="orders">${L('طلباتك','Your orders')}</button><button class="btn out" data-act="inbox">${L('الرسائل','Messages')}</button></div></div>`,'notifs');
  const t=Date.now();ME.doc.seen={o:t,s:t,m:t};saveMe();headerBits();
}
const helpBox=()=>dlg(L('خدمة العملاء','Customer Service'),`<ul class="hl">
  <li>${L('<b>عن طلب:</b> افتح الطلب من «طلباتك» وراسل المتجر، أو اضغط «عندك مشكلة؟» توصل لإدارة نيل +.','<b>About an order:</b> open it in “Your orders” and message the store, or tap “Problem with order?” to reach the NILE+ team.')}</li>
  <li>${L('<b>الإلغاء:</b> تقدر تلغي الطلب قبل ما يُشحن.','<b>Cancelling:</b> you can cancel until the order ships.')}</li>
  <li>${L('<b>الإرجاع:</b> من صفحة الطلب خلال مدة إرجاع المتجر بعد الاستلام.','<b>Returns:</b> from the order page within the store’s return window after delivery.')}</li>
  <li>${L('<b>الدفع:</b> عند الاستلام فقط، نقدًا أو بالبطاقة. لا تحوّل فلوس قبل ما يوصلك الطلب.','<b>Payment:</b> on delivery only, cash or card. Never send money before your order arrives.')}</li></ul>`);

/* addresses */
function addrSheet(id){
  const a=ME.doc.addrs.find(x=>x.id===id)||{id:'',name:'',phone:'',zone:'',street:'',bldg:'',unit:'',city:S.city,note:'',def:!ME.doc.addrs.length};
  formSheet(id?L('تعديل العنوان','Edit address'):L('إضافة عنوان جديد','Add a new address'),`<p class="muted" style="font-size:12.5px;margin:0 0 10px">${L('اكتب الأرقام من اللوحة الزرقاء على مبناك.','Use the numbers on your building’s blue plate.')}</p><div class="form">
   ${fld('a_name',L('الاسم الكامل','Full name'),inp('a_name',a.name,'maxlength="80" autocomplete="name"'),true)}
   ${fld('a_phone',L('رقم الجوال','Mobile number'),inp('a_phone',a.phone,'maxlength="16" dir="ltr" inputmode="tel" autocomplete="tel" placeholder="5555 1234"'),true)}
   ${fld('a_zone',L('المنطقة','Zone'),inp('a_zone',a.zone,'maxlength="3" inputmode="numeric" dir="ltr"'))}
   ${fld('a_street',L('الشارع','Street'),inp('a_street',a.street,'maxlength="4" inputmode="numeric" dir="ltr"'))}
   ${fld('a_bldg',L('المبنى','Building'),inp('a_bldg',a.bldg,'maxlength="4" inputmode="numeric" dir="ltr"'))}
   ${fld('a_unit',L('الشقة أو الفيلا (اختياري)','Unit or villa (optional)'),inp('a_unit',a.unit,'maxlength="20"'))}
   ${fld('a_city',L('البلدية','Municipality'),sel('a_city',CITIES.map(c=>[c.k,cityName(c)]),a.city),true)}
   ${fld('a_note',L('ملاحظة للمندوب (اختياري)','Note for the courier (optional)'),inp('a_note',a.note,'maxlength="200"'),true)}</div>
   <label class="chk" style="margin-top:10px"><input type="checkbox" id="a_def" ${a.def?'checked':''}> ${L('اجعله عنواني الافتراضي','Make this my default address')}</label>`,L('احفظ العنوان','Save address'),async f=>{
    const g=k=>f.querySelector('#'+k).value.trim();
    const name=g('a_name'),phone=g('a_phone').replace(/[\s-]/g,'').replace(/^(\+974|00974)/,''),zone=g('a_zone'),street=g('a_street'),bldg=g('a_bldg');
    if(name.length<2)return L('اكتب الاسم.','Enter the name.');
    if(!/^[34567]\d{7}$/.test(phone))return L('اكتب رقم جوال قطري من ٨ أرقام.','Enter an 8-digit Qatar number.');
    if(!/^\d{1,3}$/.test(zone)||!/^\d{1,4}$/.test(street)||!/^\d{1,4}$/.test(bldg))return L('اكتب أرقام المنطقة والشارع والمبنى.','Enter the zone, street and building numbers.');
    const x={id:a.id||rid(),name,phone,zone,street,bldg,unit:g('a_unit'),city:cityOf(g('a_city')).k,note:g('a_note'),def:f.querySelector('#a_def').checked};
    let l=ME.doc.addrs.filter(y=>y.id!==x.id);if(x.def)l=l.map(y=>({...y,def:false}));l.push(x);if(!l.some(y=>y.def))l[0].def=true;
    ME.doc.addrs=l.slice(-12);S.addr=x.id;saveMe();toast(L('انحفظ العنوان','Address saved'));
  });
}

/* reviews, questions, replies, reports */
function reviewSheet(pid){
  if(!guard())return;
  const p=prod(pid),ords=deliveredFor(pid);
  if(!p||!ords.length)return toast(L('تقدر تقيّم بعد ما يوصلك الطلب.','You can review once your order is delivered.'),true);
  const mine=myReview(pid),o=ords[0],it=o.items.find(i=>i.pid===pid);
  formSheet(L('قيّم المنتج','Review this item'),`<div class="pctx"><span class="e">${pimg(p)}</span><span class="clamp2">${pname(p)}</span></div>
   <fieldset class="rstars"><legend>${L('تقييمك العام','Overall rating')}</legend>${[1,2,3,4,5].map(n=>`<label><input type="radio" name="rs" value="${n}" ${mine&&mine.r===n?'checked':''}><span aria-hidden="true">★</span><span class="vh">${num(n)}</span></label>`).join('')}</fieldset>
   <div class="fld"><label for="rvt">${L('عنوان التقييم','Headline')}</label><input class="inp" id="rvt" maxlength="120" value="${esc(mine?mine.t:'')}"></div>
   <div class="fld"><label for="rvb">${L('رأيك','Your review')}</label><textarea class="inp ta" id="rvb" maxlength="3000" placeholder="${L('وش عجبك أو ما عجبك؟','What did you like or dislike?')}">${esc(mine?mine.b:'')}</textarea></div>`,
   mine?L('حدّث التقييم','Update review'):L('انشر التقييم','Submit review'),async f=>{
    const r=Number((f.querySelector('input[name=rs]:checked')||{}).value),t=f.querySelector('#rvt').value.trim(),b=f.querySelector('#rvb').value.trim();
    if(!(r>=1&&r<=5))return L('اختر عدد النجوم.','Pick a star rating.');
    if(b.length<3)return L('اكتب رأيك.','Write your review.');
    await rpc('write_review',{p_product:pid,p_rating:r,p_title:t.slice(0,120),p_body:b.slice(0,3000)});await loadCatalog();
    toast(L('شكرًا! انتشر تقييمك.','Thanks! Your review is live.'));
  });
}
function askSheet(pid){
  if(!guard())return;const p=prod(pid);if(!p)return;
  formSheet(L('اطرح سؤالًا','Ask a question'),`<p class="muted" style="font-size:13px;margin:0 0 8px">${L('يظهر سؤالك في صفحة المنتج، ويجاوب عليه المتجر أو العملاء.','Your question shows on the product page; the store or other customers answer it.')}</p><div class="fld"><label for="askq">${L('سؤالك','Your question')}</label><textarea class="inp ta" id="askq" maxlength="600"></textarea></div>`,
   L('انشر السؤال','Post question'),async f=>{const q=f.querySelector('#askq').value.trim();if(q.length<5)return L('اكتب سؤالك بوضوح.','Write your question clearly.');
    await rpc('ask_question',{p_product:pid,p_body:q.slice(0,600)});await loadCatalog();toast(L('انتشر سؤالك','Question posted'));});
}
async function addAnswer(qid,t){
  await rpc('answer_question',{p_question:qid,p_body:t.slice(0,1500)});await loadCatalog();
}
function answerSheet(qid){
  if(!guard())return;const q=D.questions[qid];if(!q)return;
  formSheet(L('أجب على السؤال','Answer the question'),`<p style="margin:0 0 8px"><b>${esc(q.q)}</b></p><div class="fld"><label for="anst">${L('جوابك','Your answer')}</label><textarea class="inp ta" id="anst" maxlength="1500"></textarea></div>`,
   L('انشر الجواب','Post answer'),async f=>{const t=f.querySelector('#anst').value.trim();if(t.length<2)return L('اكتب جوابك.','Write your answer.');await addAnswer(qid,t);toast(L('انتشر جوابك','Answer posted'));});
}
function replySheet(rvid){
  if(!guard())return;const r=D.reviews[rvid];if(!r)return;
  formSheet(L('رد على التقييم','Reply to the review'),`<p class="muted" style="margin:0 0 8px">${esc(r.b).slice(0,300)}</p><div class="fld"><label for="rpt">${L('ردك يظهر تحت التقييم للجميع','Your reply shows under the review for everyone')}</label><textarea class="inp ta" id="rpt" maxlength="1500">${esc(r.reply)}</textarea></div>`,
   L('انشر الرد','Post reply'),async f=>{await rpc('review_reply',{p_review:rvid,p_reply:f.querySelector('#rpt').value.trim().slice(0,1500)});await loadCatalog();toast(L('انتشر ردك','Reply posted'));});
}
function reportSheet(kind,ref){
  if(!guard())return;
  reasonSheet(L('إبلاغ إدارة نيل +','Report to NILE+'),REP_R,L('أرسل البلاغ','Send report'),async(k,txt,note)=>{
    const {error}=await ME.sb.from('reports').insert({user_id:ME.uid,kind:kind==='store'?'shop':kind,ref:String(ref).slice(0,80),reason:k,note:str(note,600)});if(error)throw error;
    toast(L('وصل بلاغك. إدارة نيل + بتراجعه.','Report sent. The NILE+ team will review it.'));});
}
async function toggleHelpful(id){
  if(!guard())return;
  try{await rpc('review_helpful',{p_review:id});await loadCatalog();}catch(e){toast(dbErr(e),true);}
}
async function toggleFollow(sid){
  if(!guard())return;const on=following(sid);
  try{
    const r=on?await ME.sb.from('follows').delete().eq('shop_id',sid).eq('user_id',ME.uid):await ME.sb.from('follows').insert({shop_id:sid,user_id:ME.uid});
    if(r.error)throw r.error;await loadCatalog();
    toast(on?L('ألغيت المتابعة','Unfollowed'):L('تتابع هذا المتجر الحين','You’re following this store'));
  }catch(e){toast(dbErr(e),true);}
}

/* orders: buyer and seller steps */
function buyerCancel(o){
  reasonSheet(L('إلغاء الطلب','Cancel the order'),CANCEL_R,L('ألغِ الطلب','Cancel order'),async(k,txt)=>{
    if(await orderUpdate(o,'cancelled',txt,{reason:txt},'buyer',FLOW.cancelled)){toast(L('انلغى الطلب','Order cancelled'));}});
}
function buyerReturn(o){
  reasonSheet(L('إرجاع المنتجات','Return the items'),RET_R,L('أرسل طلب الإرجاع','Request return'),async(k,txt)=>{
    if(await orderUpdate(o,'return_req',txt,{reason:txt},'buyer',FLOW.return_req))toast(L('وصل طلب الإرجاع للمتجر','Return request sent to the store'));});
}
function sellerCancel(o){
  reasonSheet(L('إلغاء الطلب','Cancel the order'),SCANCEL_R,L('ألغِ الطلب','Cancel order'),async(k,txt)=>{await sellerStep(o,'cancelled',txt,{reason:txt});});
}
function shipSheet(o){
  formSheet(L('شحن الطلب','Ship the order'),`<p class="muted" style="font-size:13px;margin:0 0 8px">${L('اختر شركة الشحن واكتب رقم التتبع عشان يتابع العميل شحنته.','Pick the carrier and enter the tracking number so the customer can follow the shipment.')}</p><div class="form">
   ${fld('sh_c',L('شركة الشحن','Carrier'),sel('sh_c',CARRIERS.map(c=>[c[0],S.ar?c[1]:c[2]]),'nile'),true)}
   ${fld('sh_n',L('رقم التتبع','Tracking number'),inp('sh_n','','maxlength="40" dir="ltr"'),true,L('اختياري لو يوصله مندوب المتجر.','Optional when the store’s own driver delivers.'))}</div>`,
   L('تأكيد الشحن','Confirm shipment'),async f=>{const c=f.querySelector('#sh_c').value,no=f.querySelector('#sh_n').value.replace(/[^\w-]/g,'').slice(0,40);
    if(c!=='own'&&!no)return L('اكتب رقم التتبع.','Enter the tracking number.');await sellerStep(o,'shipped','',{trk:{c,no}});});
}
function declineReturn(o){
  formSheet(L('رفض الإرجاع','Decline the return'),`<div class="fld"><label for="rjn">${L('السبب يوصل للعميل','The customer sees the reason')}</label><textarea class="inp ta" id="rjn" maxlength="300"></textarea></div>`,L('ارفض الإرجاع','Decline return'),async f=>{
    const t=f.querySelector('#rjn').value.trim();if(t.length<4)return L('اكتب سبب واضح.','Write a clear reason.');await sellerStep(o,'return_rej',t,{reason:t});});
}
function findOrder(id){return D.sellOrders[id]||D.myOrders[id]||D.allOrders[id]||null;}
function labelText(o){const a=o.addr;return [`${L('طلب','Order')} ${o.no}`,a.name,`+974 ${a.phone}`,L(`منطقة ${a.zone}، شارع ${a.street}، مبنى ${a.bldg}`,`Zone ${a.zone}, Street ${a.street}, Building ${a.bldg}`)+(a.unit?`، ${a.unit}`:''),cityName(cityOf(a.city)),a.note,
  ...o.items.map(i=>`${i.q} × ${S.ar?i.ar||i.en:i.en||i.ar}`),`${L('يحصّل المندوب','Collect')}: ${o.total} QAR (${o.pay==='cod'?L('نقدًا','cash'):L('بطاقة','card')})`].filter(Boolean).join('\n');}

/* store forms */
function formErr(f,m){let e=f.querySelector('p.err.fe');if(!e){e=document.createElement('p');e.className='err fe';e.setAttribute('role','alert');f.appendChild(e);}e.textContent=m;e.scrollIntoView({block:'center'});}
async function submitStore(f){
  if(!guard())return;
  const d=readStoreForm();if(d.err)return formErr(f,d.err);
  const b=f.querySelector('[type=submit]');b.disabled=true;
  try{
    const s=curStore();
    const {error}=await ME.sb.from('shops').update({name_ar:d.ar||d.en,name_en:d.en,logo_ar:d.lg[0],logo_en:d.lg[1],color:d.bg,emoji:d.e,about_ar:d.d[0],about_en:d.d[1],
      city:cityOf(d.city).k,ret_days:d.ret,resp:d.resp,public_phone:d.phone}).eq('id',s.id);
    if(error)throw error;
    S.dirty=false;await loadCatalog();toast(L('انحفظت التغييرات','Changes saved'));render(true);
  }catch(e){b.disabled=false;formErr(f,dbErr(e));}
}

/* ───────── events ───────── */
document.addEventListener('click',e=>{
  const g=s=>e.target.closest(s);let el;
  if(e.target.id==='scrim'){hide();return;}
  if(el=g('[data-fav]')){const id=el.dataset.fav,w=ME.doc.wish,on=w.includes(id);ME.doc.wish=on?w.filter(x=>x!==id):[id,...w];saveMe();toast(on?L('انشال من قائمة الأمنيات','Removed from wish list'):L('انضاف لقائمة الأمنيات','Added to wish list'));render(true);return;}
  if(el=g('[data-add]')){add(el.dataset.add);return;}
  if(el=g('[data-addq]')){S.qty=+($('#pq')||{}).value||1;add(el.dataset.addq,S.qty);return;}
  if(el=g('[data-buy]')){if(addItem(el.dataset.buy,+($('#pq')||{}).value||1))go('checkout');return;}
  if(el=g('[data-fbt]')){el.dataset.fbt.split(',').forEach(id=>addItem(id,1));toast(L('انضافت المنتجات إلى السلة','Items added to cart'));render(true);return;}
  if(el=g('[data-inc]')){const c=ME.doc.cart[+el.dataset.inc],p=c&&prod(c.pid);if(p){c.q=Math.min(99,p.stock,c.q+1);saveMe();render(true);}return;}
  if(el=g('[data-dec]')){const i=+el.dataset.dec,c=ME.doc.cart[i];if(c){if(--c.q<=0)ME.doc.cart.splice(i,1);saveMe();render(true);}return;}
  if(el=g('[data-rm]')){ME.doc.cart.splice(+el.dataset.rm,1);saveMe();render(true);return;}
  if(el=g('[data-later]')){const c=ME.doc.cart[+el.dataset.later];if(c){c.later=true;saveMe();render(true);}return;}
  if(el=g('[data-tocart]')){const c=ME.doc.cart[+el.dataset.tocart];if(c){c.later=false;saveMe();render(true);}return;}
  if(el=g('[data-open]')){go('product',{pid:el.dataset.open,img:0,qty:1,revF:0,gift:false});return;}
  if(el=g('[data-store]')){go('store',{sid:el.dataset.store,stab:'home'});return;}
  if(el=g('[data-follow]')){toggleFollow(el.dataset.follow);return;}
  if(el=g('[data-chat]')){openChat(el.dataset.chat,el.dataset.pid);return;}
  if(el=g('[data-thread]')){go('thread',{tid:el.dataset.thread,draft:''});return;}
  if(el=g('[data-order]')){go('order',{oid:el.dataset.order});return;}
  if(el=g('[data-img]')){S.img=+el.dataset.img;render(true);return;}
  if(el=g('[data-var]')){S.vsel[S.pid]=+el.dataset.var;render(true);return;}
  if(el=g('[data-revf]')){S.revF=+el.dataset.revf;render(true);const r=$('#revS');if(r)r.scrollIntoView({block:'start'});return;}
  if(el=g('[data-help]')){toggleHelpful(el.dataset.help);return;}
  if(el=g('[data-reply]')){replySheet(el.dataset.reply);return;}
  if(el=g('[data-answer]')){answerSheet(el.dataset.answer);return;}
  if(el=g('[data-revp]')){reviewSheet(el.dataset.revp);return;}
  if(el=g('[data-report]')){const [k,...r]=el.dataset.report.split(':');reportSheet(k,r.join(':'));return;}
  if(el=g('[data-stab]')){S.stab=el.dataset.stab;render(true);return;}
  if(el=g('[data-scat]')){S.storeCat=el.dataset.scat;render(true);return;}
  if(el=g('[data-otab]')){S.ordTab=el.dataset.otab;render(true);return;}
  if(el=g('[data-city]')){S.city=el.dataset.city;ME.doc.city=S.city;saveMe();render(true);openCity();return;}
  if(el=g('[data-eaddr]')){addrSheet(el.dataset.eaddr);return;}
  if(el=g('[data-daddr]')){const id=el.dataset.daddr;confirmBox(L('حذف العنوان؟','Remove this address?'),'',L('احذف','Remove'),()=>{ME.doc.addrs=ME.doc.addrs.filter(a=>a.id!==id);if(ME.doc.addrs.length&&!ME.doc.addrs.some(a=>a.def))ME.doc.addrs[0].def=true;saveMe();});return;}
  if(el=g('[data-defaddr]')){ME.doc.addrs=ME.doc.addrs.map(a=>({...a,def:a.id===el.dataset.defaddr}));saveMe();render(true);return;}
  if(el=g('[data-ocancel]')){const o=findOrder(el.dataset.ocancel);if(o)buyerCancel(o);return;}
  if(el=g('[data-oreturn]')){const o=findOrder(el.dataset.oreturn);if(o)buyerReturn(o);return;}
  // seller center
  if(el=g('[data-stab2]')){S.sellTab=el.dataset.stab2;if(el.dataset.of)S.ordF=el.dataset.of;render(true);return;}
  if(el=g('[data-mper]')){S.mPer=el.dataset.mper;render(true);return;}
  if(el=g('[data-adopen]')){go('ad',{adId:el.dataset.adopen,img:0});return;}
  if(el=g('[data-adcat]')){go('ads',{adCat:el.dataset.adcat});return;}
  if(el=g('[data-adchat]')){openAdChat(el.dataset.adchat);return;}
  if(el=g('[data-adrenew]')){renewSheet(el.dataset.adrenew);return;}
  if(el=g('[data-adsold]')){const id=el.dataset.adsold;confirmBox(L('انباع الغرض؟','Item sold?'),L('ينشال الإعلان من الموقع.','The ad comes off the site.'),L('نعم، انباع','Yes, sold'),()=>setAdStatus(id,'sold'));return;}
  if(el=g('[data-adremove]')){const id=el.dataset.adremove;confirmBox(L('حذف الإعلان؟','Remove this ad?'),L('ينشال الإعلان من الموقع، والرسوم المدفوعة ما تسترد.','The ad comes off the site; fees already paid aren’t refunded.'),L('احذف','Remove'),()=>setAdStatus(id,'removed'));return;}
  if(el=g('[data-rmadimg]')){grabAd();AD.imgs.splice(+el.dataset.rmadimg,1);render(true);return;}
  if(el=g('[data-join]')){S.joinAs=el.dataset.join;S.dirty=false;render();scrollTo({top:0});return;}
  if(el=g('[data-auth]')){openAuth(el.dataset.auth);return;}
  if(el=g('[data-copy]')){const t=el.dataset.copy;try{navigator.clipboard.writeText(t).then(()=>toast(L('انسخ','Copied')),()=>toast(t));}catch(x){toast(t);}return;}
  if(el=g('[data-of]')){S.ordF=el.dataset.of;render(true);return;}
  if(el=g('[data-sstep]')){const o=findOrder(el.dataset.sstep),to=el.dataset.to;if(!o)return;
    if(to==='ship')shipSheet(o);else if(to==='return_rej')declineReturn(o);
    else if(to==='delivered')confirmBox(L('تأكيد التوصيل','Confirm delivery'),L('تأكد إن العميل استلم الطلب ودفع المبلغ.','Confirm the customer received the order and paid.'),L('تم التوصيل','Mark delivered'),()=>sellerStep(o,'delivered',''));
    else if(to==='refunded')confirmBox(L('تأكيد رد المبلغ','Confirm refund'),L(`رجّعت للعميل ${money(o.total-o.fees.del-o.fees.cod)}؟`,`Did you refund ${money(o.total-o.fees.del-o.fees.cod)} to the customer?`),L('نعم، رجّعته','Yes, refunded'),()=>sellerStep(o,'refunded',''));
    else sellerStep(o,to,'');return;}
  if(el=g('[data-scancel]')){const o=findOrder(el.dataset.scancel);if(o)sellerCancel(o);return;}
  if(el=g('[data-copyaddr]')){const o=findOrder(el.dataset.copyaddr);if(!o)return;const t=labelText(o);
    try{navigator.clipboard.writeText(t).then(()=>toast(L('انسخت بيانات الشحنة','Shipping label copied')),()=>dlg(L('بيانات الشحنة','Shipping label'),`<pre class="sel lbl">${esc(t)}</pre>`));}catch(x){dlg(L('بيانات الشحنة','Shipping label'),`<pre class="sel lbl">${esc(t)}</pre>`);}return;}
  if(el=g('[data-edit]')){startEdit(el.dataset.edit);return;}
  if(el=g('[data-ptoggle]')){const p=prod(el.dataset.ptoggle);if(p&&guard())ME.sb.from('products').update({active:!p.active}).eq('id',p.id).then(r=>{if(r.error)throw r.error;toast(p.active?L('انوقف عرض المنتج','Product paused'):L('المنتج معروض','Product is live'));loadCatalog();}).catch(x=>toast(dbErr(x),true));return;}
  if(el=g('[data-pdel]')){const id=el.dataset.pdel;confirmBox(L('حذف المنتج؟','Delete this product?'),L('ينشال من المتجر ومن نتائج البحث. الطلبات السابقة تبقى كما هي.','It leaves the store and search. Past orders stay as they are.'),L('احذف','Delete'),async()=>{try{const r=await ME.sb.from('products').delete().eq('id',id);if(r.error)throw r.error;await loadCatalog();ED=null;toast(L('انحذف المنتج','Product deleted'));go('sell',{sellTab:'products'});}catch(x){return dbErr(x);}});return;}
  if(el=g('[data-rmimg]')){grabEdit();ED.imgs.splice(+el.dataset.rmimg,1);render(true);return;}
  if(el=g('[data-firstimg]')){grabEdit();const i=+el.dataset.firstimg,[x]=ED.imgs.splice(i,1);ED.imgs.unshift(x);render(true);return;}
  if(el=g('[data-rmv]')){grabEdit();ED.v.o.splice(+el.dataset.rmv,1);render(true);return;}
  if(el=g('[data-rmb]')){grabEdit();ED.b.splice(+el.dataset.rmb,1);render(true);return;}
  // admin
  if(el=g('[data-act]')){const a=el.dataset.act;
    if(a.startsWith('c:'))return goCat(a.slice(2));
    if(a.startsWith('minR:')){S.minR=+a.slice(5);return render(true);}
    if(a.startsWith('price:')){S.price=a.slice(6);return render(true);}
    if(a.startsWith('storeF:')){S.storeF=a.slice(7);return render(true);}
    const scrollTo2=id=>{const x=$(id);if(x)x.scrollIntoView({behavior:'smooth'});};
    const A={close:hide,menu:openMenu,cart:()=>openCart(),city:openCity,notifs:openNotifs,help:helpBox,
      home:()=>go('home',{cat:'all',q:'',fav:false,dealsOnly:false,fastOnly:false,minR:0,price:'',storeF:''}),
      stores:()=>go('stores'),orders:()=>ME.uid?go('orders'):openAuth('in'),account:()=>go('account'),addrs:()=>go('addrs'),inbox:()=>go('inbox'),toCheckout:()=>go('checkout'),
      sell:()=>go('sell',{makeStore:false}),admin:()=>{location.href='admin.html';},newStore:()=>go('sell',{makeStore:true,joinAs:'company'}),
      ads:()=>go('ads',{adCat:'all'}),postad:startAd,myads:()=>go('myads'),signin:()=>openAuth('in'),signup:()=>openAuth('up'),
      signout:async()=>{await ME.sb.auth.signOut();toast(L('سجّلت خروجك','Signed out'));go('home');},cancelNewStore:()=>go('sell',{makeStore:false}),
      wish:()=>go('results',{fav:true,cat:'all',q:'',dealsOnly:false}),dealsAll:()=>go('results',{dealsOnly:true,cat:'all',q:'',fav:false}),
      deals:()=>go('results',{dealsOnly:true,cat:'all',q:'',fav:false}),bestsellers:()=>go('results',{sort:'feat',cat:'all',q:'',fav:false,dealsOnly:false}),
      fast:()=>{S.fastOnly=!S.fastOnly;render(true);},dealsOnly:()=>{S.dealsOnly=!S.dealsOnly;render(true);},
      writeRev:()=>reviewSheet(S.pid),ask:()=>askSheet(S.pid),addAddr:()=>addrSheet(),place:placeOrder,
      addVar:()=>{grabEdit();ED.v.o.push({ar:'',en:'',hex:''});render(true);},addBul:()=>{grabEdit();ED.b.push(['','']);render(true);},
      confirmOk:async()=>{const fn=PEND;if(!fn)return;const err=await fn();if(err)toast(err,true);else{hide();render(true);}},
      toReviews:()=>scrollTo2('#revS'),toQA:()=>scrollTo2('#qaS'),toOffers:()=>scrollTo2('#offersS'),
      lang:()=>{S.ar=!S.ar;LS.set('nileplus.lang',S.ar?'ar':'en');hide();render(true);},top:()=>scrollTo({top:0,behavior:'smooth'}),
      prev:()=>{S.slide=(S.slide+2)%3;render(true);},next:()=>{S.slide=(S.slide+1)%3;render(true);}};
    A[a]?.();}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='sort'){S.sort=t.value;render(true);}
  else if(t.id==='cpn'){const c=ME.doc.cpns;ME.doc.cpns=t.checked?[...new Set([...c,S.pid])]:c.filter(x=>x!==S.pid);saveMe();render(true);}
  else if(t.id==='gift'||t.id==='gift2'){S.gift=t.checked;render(true);}
  else if(t.id==='pq')S.qty=+t.value;
  else if(t.name==='speed'){S.speed=t.value;render(true);}
  else if(t.name==='pay'){S.pay=t.value;render(true);}
  else if(t.name==='addr'){S.addr=t.value;render(true);}
  else if(t.id==='mysid'){S.mySid=t.value;render(true);}
  else if(t.id==='pimgs'&&t.files&&t.files.length)uploadImgs(t.files);
  else if(t.id==='adimgs'&&t.files&&t.files.length)uploadImgs(t.files,AD);
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='onote')S.note=t.value;
  else if(t.id==='cmsg')S.draft=t.value;
  else if(t.closest&&t.closest('form.keep,#editStore'))S.dirty=true;
});
document.addEventListener('submit',e=>{
  e.preventDefault();const f=e.target;
  if(f.id==='sform')return go('results',{q:$('#q').value.trim(),cat:$('#scat').value||'all',fav:false,dealsOnly:false});
  if(f.id==='mform')return go('results',{q:$('#mq').value.trim(),cat:'all',fav:false,dealsOnly:false});
  if(f.id==='sform2')return submitSheet(f);
  if(f.id==='cform'){const v=$('#cmsg').value;$('#cmsg').value='';S.draft='';return sendMsg(v);}
  if(f.id==='regForm')return submitRegistration(f);
  if(f.id==='resubForm')return submitResubmit(f);
  if(f.id==='adForm')return submitAd();
  if(f.id==='adsearch')return go('ads',{adQ:$('#adq').value.trim()});
  if(f.id==='editStore')return submitStore(f);
  if(f.id==='pform')return saveEdit();
  if(f.dataset.ansq){const id=f.dataset.ansq,i=$('#qa_'+id),t=i?i.value.trim():'';if(!t)return;if(!guard())return;addAnswer(id,t).then(()=>toast(L('انتشر جوابك','Answer posted')),x=>toast(dbErr(x),true));}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')hide();
  if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.target.id==='cmsg'){e.preventDefault();$('#cform').requestSubmit();}
});
// data that arrived while someone was typing shows once they leave the field
document.addEventListener('focusout',()=>setTimeout(()=>{if(softPending&&!typing())render(true);},0));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S.view==='thread')markThreadSeen();});
$('#lang').onclick=()=>{S.ar=!S.ar;LS.set('nileplus.lang',S.ar?'ar':'en');render(true);};
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{if(S.view!=='home'||document.hidden||!$('#sheet').hidden)return;S.slide=(S.slide+1)%3;document.querySelectorAll('.slide').forEach((s,i)=>s.setAttribute('aria-hidden',i!==S.slide));document.querySelectorAll('.arrow').forEach(a=>a.style.color=S.slide===2?'#111':'#fff');},6000);
if(LS.get('nileplus.lang')==='en')S.ar=false;
boot();
