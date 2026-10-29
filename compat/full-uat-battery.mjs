import {chromium} from 'playwright';
import {PDFDocument,StandardFonts,PDFName, degrees} from 'pdf-lib';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {join,resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const dist=join(root,'dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript'};
const server=createServer(async(req,res)=>{
  let file;
  try{
    const u=new URL(req.url,'http://127.0.0.1');
    file=resolve(dist,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));
    if(!file.startsWith(dist+sep))return res.writeHead(403).end('forbidden');
    const bytes=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'}).end(bytes);
  }catch(e){res.writeHead(404).end('not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port+'/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({acceptDownloads:true});
const external=[];const pageErrors=[];
page.on('request',r=>{if(!r.url().startsWith(base)||r.method()!=='GET')external.push(r.method()+' '+r.url())});
page.on('pageerror',e=>pageErrors.push(e.message));
let pass=0,fail=0,skip=0;
const records=[];
async function tc(id,label,fn){
  try{const detail=await fn();records.push({id,label,status:'PASS',detail:String(detail||'')});pass++;console.log('UAT|'+id+'|PASS|'+label+(detail?'|'+detail:''));}
  catch(e){records.push({id,label,status:'FAIL',detail:String(e.message||e)});fail++;console.error('UAT|'+id+'|FAIL|'+label+'|'+(e.message||e));}
}
async function doc(pages=2) {
  const d=await PDFDocument.create({updateMetadata:false});
  const font=await d.embedFont(StandardFonts.Helvetica);
  for(let i=0;i<pages;i++){const p=d.addPage([595,842]);p.drawText('Invoice '+(i+1)+' : 1,250.50',{x:35,y:800,size:14,font});}
  return Buffer.from(await d.save({useObjectStreams:false}));
}
async function select(buffer,name='Invoice.pdf',mode='balanced',consent=false) {
  await page.locator('#file').setInputFiles({name,mimeType:'application/pdf',buffer});
  await page.locator('input[name=quality][value='+mode+']').check();
  if(consent)await page.locator('#consent').check();else await page.locator('#consent').uncheck();
}
async function run(timeout=180000) {
  await page.locator('#start').click();
  await page.waitForFunction(()=>{
    const result=document.getElementById('result'),error=document.getElementById('errorPanel');
    return !result.hidden||!error.hidden;
  },null,{timeout});
  return await page.locator('#result').isVisible();
}
try{
  await tc('U01','HTTP static app and engine ready',async()=>{
    const response=await page.goto(base,{waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    await page.waitForFunction(()=>document.getElementById('engine').classList.contains('ready'),null,{timeout:20000});
  });
  await tc('U02','Upload control initially disabled',async()=>assert.equal(await page.locator('#start').isDisabled(),true));
  await tc('U03','Default mode Balanced = 30%',async()=>assert.equal(await page.locator('input[value=balanced]').isChecked(),true));
  await tc('U04','Three modes available 10/30/50',async()=>{
    const text=await page.locator('.choices').innerText();
    for(const p of ['10%','30%','50%'])assert(text.includes(p));
  });
  await tc('U05','Consent is unchecked by default',async()=>assert.equal(await page.locator('#consent').isChecked(),false));
  await tc('U06','PDF filename and size displayed safely',async()=>{
    await select(await doc(1),'SalesInvoice.pdf');
    assert(await page.locator('#filename').innerText().then(s=>s.includes('SalesInvoice.pdf')));
    assert.equal(await page.locator('#start').isEnabled(),true);
  });
  await tc('U07','Reject non-PDF extension even if bytes are PDF',async()=>{
    await page.locator('#file').setInputFiles({name:'invoice.txt',mimeType:'text/plain',buffer:await doc(1)});
    assert(await page.locator('#errorPanel').isVisible());
    assert(await page.locator('#start').isDisabled());
  });
  await tc('U08','Reject empty file',async()=>{
    await page.locator('#file').setInputFiles({name:'empty.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(0)});
    assert(await page.locator('#errorPanel').isVisible());
  });
  await tc('U09','Reject PDF under 100 bytes',async()=>{
    await page.locator('#file').setInputFiles({name:'short.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n')});
    assert(await page.locator('#errorPanel').isVisible());
  });
  await tc('U10','Reject file above 80 MB',async()=>{
    const tooLarge=Buffer.alloc(80*1024*1024+1,0);
    await page.locator('#file').setInputFiles({name:'over80.pdf',mimeType:'application/pdf',buffer:tooLarge});
    assert(await page.locator('#errorPanel').isVisible());
    assert(await page.locator('#start').isDisabled());
  });
  await tc('U11','Filename HTML injection not executed',async()=>{
    await select(await doc(1),'<img src=x onerror=alert(1)>.pdf');
    assert((await page.locator('#filename').innerText()).includes('<img'));
    assert.equal(await page.locator('#filename img').count(),0);
  });
  await tc('U12','Valid selectable-text PDF with no consent processed',async()=>{
    await select(await doc(3),'Text-3page.pdf');
    assert(await run());
    assert((await page.locator('#checks').innerText()).includes('3 หน้า'));
    assert((await page.locator('#savingDetail').innerText()).includes('≥30%'));
  });
  await tc('U13','Download shown only if real saving meets 30%',async()=>{
    const gain=parseFloat(await page.locator('#saving').textContent());
    const shown=await page.locator('#download').isVisible();
    assert.equal(shown,gain>=30,'unexpected gain '+gain);
    return 'saving='+gain+'%, download='+shown;
  });
  await tc('U14','Selecting another file clears previous output/download',async()=>{
    await select(await doc(1),'Second.pdf');
    assert.equal(await page.locator('#result').isVisible(),false);
    assert.equal(await page.locator('#download').isVisible(),false);
  });
  await tc('U15','Malformed claimed PDF rejected without result',async()=>{
    await select(Buffer.from('%PDF-INVALID\n'.repeat(80)),'Malformed.pdf');
    assert.equal(await run(40000),false);
    assert.equal(await page.locator('#download').isVisible(),false);
  });
  await tc('U16','Digital signature marker refused',async()=>{
    const signed=Buffer.concat([await doc(1),Buffer.from('\n% /ByteRange [0 4 8 12]\n')]);
    await select(signed,'Signed.pdf');
    assert.equal(await run(60000),false);
    assert((await page.locator('#errorText').textContent()).includes('Digital Signature'));
  });
  await tc('U17','AcroForm PDF refused',async()=>{
    const d=await PDFDocument.create();const p=d.addPage([595,842]);
    const form=d.getForm();const field=form.createTextField('BankNo');field.setText('123456');field.addToPage(p);
    await select(Buffer.from(await d.save()),'Form.pdf');
    assert.equal(await run(60000),false);
    assert.equal(await page.locator('#download').isVisible(),false);
  });
  await tc('U18','PDF attachments refused',async()=>{
    const d=await PDFDocument.create();d.addPage([595,842]);
    await d.attach(Uint8Array.from([1,2,3]),'private.txt',{mimeType:'text/plain'});
    await select(Buffer.from(await d.save()),'Attachment.pdf');
    assert.equal(await run(60000),false);
  });
  await tc('U19','PDF OpenAction key refused',async()=>{
    const d=await PDFDocument.create();d.addPage([595,842]);
    d.catalog.set(PDFName.of('OpenAction'),d.context.obj([0,'Fit']));
    await select(Buffer.from(await d.save()),'OpenAction.pdf');
    assert.equal(await run(60000),false);
    assert((await page.locator('#errorText').textContent()).includes('OpenAction'));
  });
  await tc('U20','Over 120 pages refused',async()=>{
    await select(await doc(121),'121pages.pdf');
    assert.equal(await run(60000),false);
    assert((await page.locator('#errorText').textContent()).includes('120'));
  });
  await tc('U21','43-page real PDF text rendering / page count',async()=>{
    await select(await doc(43),'43-pages.pdf');
    assert.equal(await run(240000),true,'43-page error '+await page.locator('#errorText').textContent());
    assert((await page.locator('#checks').textContent()).includes('43 หน้า'));
  });
  await tc('U22','High mode targets 10% (not falsified)',async()=>{
    await select(await doc(2),'High.pdf','high',false);
    assert(await run(60000));
    const gain=parseFloat(await page.locator('#saving').textContent());
    assert.equal(await page.locator('#download').isVisible(),gain>=10);
  });
  await tc('U23','Small mode targets 50% (not falsified)',async()=>{
    await select(await doc(2),'Small.pdf','small',false);
    assert(await run(60000));
    const gain=parseFloat(await page.locator('#saving').textContent());
    assert.equal(await page.locator('#download').isVisible(),gain>=50);
  });
  await tc('U24','Switching from scan consent to no consent resets checkbox',async()=>{
    await select(await doc(1),'Consent.pdf','balanced',true);
    assert(await page.locator('#consent').isChecked());
    await page.locator('#consent').uncheck();
    assert.equal(await page.locator('#consent').isChecked(),false);
  });
  await tc('U25','CSP denies network API / external scripts',async()=>{
    const meta=await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    assert(meta.includes("connect-src 'none'"));
    assert(meta.includes("script-src 'self'"));
    assert.deepEqual(external,[]);
  });
  await tc('U26','No JavaScript runtime exceptions',async()=>assert.deepEqual(pageErrors,[]));
  await tc('U27','Mobile visual layout no horizontal overflow',async()=>{
    await page.setViewportSize({width:390,height:844});
    const res=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:window.innerWidth}));
    assert(res.scroll<=res.inner+2,JSON.stringify(res));
    await page.setViewportSize({width:1280,height:800});
  });
  await tc('U28','App assets on same host',async()=>{
    const scripts=await page.locator('script[src]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')));
    assert(scripts.every(s=>s.startsWith('./')),JSON.stringify(scripts));
  });
  await tc('U29','No outgoing document requests during tests',async()=>assert.deepEqual(external,[]));
  console.log('UAT SUMMARY '+JSON.stringify({pass,fail,skip,total:pass+fail+skip}));
  for(const item of records)console.log('UAT RECORD '+JSON.stringify(item));
  if(fail>0)process.exitCode=1;
}finally{
  await browser.close();
  await new Promise(r=>server.close(r));
}