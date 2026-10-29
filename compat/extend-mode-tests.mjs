import {readFileSync,writeFileSync} from 'node:fs';
const path='tests/real-browser.mjs';
let source=readFileSync(path,'utf8');
const marker="  const signature = Buffer.concat([source,Buffer.from('\\n% /ByteRange [ 0 12 24 36 ]\\n')]);";
if (!source.includes(marker)) throw new Error('Missing scan fixture anchor');
const addition = [
  "  for (const [testMode,goal] of [['high',10],['small',50]]) {",
  "    await page.locator('input#file').setInputFiles({name:'Mode-'+testMode+'.pdf',mimeType:'application/pdf',buffer:scanSource});",
  "    await page.locator('input[value=\\\"'+testMode+'\\\"]').check();",
  "    await page.locator('#consent').check();",
  "    await page.locator('#start').click();",
  "    await page.waitForFunction(()=>!document.getElementById('result').hidden || !document.getElementById('errorPanel').hidden,{timeout:120000});",
  "    assert(await page.locator('#result').isVisible(),testMode+' scanned-PDF processing refused: '+await page.locator('#errorText').textContent());",
  "    assert((await page.locator('#savingDetail').textContent()).includes('≥'+goal+'%'),'Target label missing');",
  "    const value=parseFloat(await page.locator('#saving').textContent());",
  "    const permitted=await page.locator('#download').isVisible();",
  "    assert(permitted === (value>=goal),testMode+' download gating disagrees with actual result');",
  "    console.log('Mode '+testMode+': '+value+'% saved vs '+goal+'% target; download='+permitted);",
  "  }",
].join('\n');
source=source.replace(marker,addition+'\n'+marker);
writeFileSync(path,source);