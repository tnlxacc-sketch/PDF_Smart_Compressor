import {readFileSync,writeFileSync} from 'node:fs';
const file='tests/real-browser.mjs';
let s=readFileSync(file,'utf8');
const needle="  const signature = Buffer.concat([source,Buffer.from('\\n% /ByteRange [ 0 12 24 36 ]\\n')]);";
if(!s.includes(needle)) throw Error('V5 cannot locate signature-test insertion point');
const t=String.raw`
  // PNG/Flate scan: previously zero eligible JPEG images. Must exercise DPI fallback.
  const pngB64 = await page.evaluate(() => {
    const canvas=document.createElement('canvas');
    canvas.width=1100;canvas.height=1500;
    const c=canvas.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,1100,1500);
    for(let y=0;y<1500;y+=3)for(let x=0;x<1100;x+=3){
      const z=234+((x*13+y*7)%20);c.fillStyle='rgb('+z+','+z+','+z+')';c.fillRect(x,y,3,3);
    }
    c.fillStyle='#222';c.font='bold 27px sans-serif';c.fillText('SCAN PNG NO PDF TEXT',50,70);
    c.font='18px sans-serif';
    for(let i=0;i<42;i++)c.fillText('INVOICE '+i+' AMOUNT 1,250.50',50,110+i*31);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const pngDoc=await PDFDocument.create({updateMetadata:false});
  const pngImg=await pngDoc.embedPng(Buffer.from(pngB64,'base64'));
  for(let n=0;n<2;n++){const p=pngDoc.addPage([550,750]);p.drawImage(pngImg,{x:0,y:0,width:550,height:750});}
  const pngSource=Buffer.from(await pngDoc.save());
  await page.locator('input#file').setInputFiles({name:'PNG_Scan.pdf',mimeType:'application/pdf',buffer:pngSource});
  await page.locator('input[value="balanced"]').check();
  await page.locator('#consent').check();
  await page.locator('#start').click();
  await page.waitForFunction(()=>!document.getElementById('result').hidden || !document.getElementById('errorPanel').hidden,{timeout:150000});
  assert(await page.locator('#result').isVisible(),'V5 raster fallback failed: '+await page.locator('#errorText').textContent());
  const reason=await page.locator('#imageCount').textContent();
  assert(reason.includes('DPI'),'V5 never entered DPI fallback: '+reason);
  const gain=parseFloat(await page.locator('#saving').textContent());
  assert(gain>=30,'V5 expected 30%+ for synthetic PNG scan, got '+gain+'%');
  assert(await page.locator('#download').isVisible(),'V5 fallback result should be downloadable after checks');
  console.log('PASS V5 PNG/Flate scanned-only PDF fallback:',gain+'% savings');
`;
s=s.replace(needle,t+'\n'+needle);
writeFileSync(file,s);
console.log('Installed PNG scan browser test');