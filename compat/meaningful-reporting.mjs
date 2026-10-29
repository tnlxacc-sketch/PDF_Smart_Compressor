import {readFileSync, writeFileSync} from 'node:fs';
const appPath='src/app.mjs';
const htmlPath='src/index.html';
function swap(text, from, to, label) {
  if (!text.includes(from)) throw new Error('V3 source mismatch: '+label);
  return text.replace(from,to);
}
let app=readFileSync(appPath,'utf8');
app=swap(app,'    const saving = ((file.size - output.length) / file.size) * 100;',
"    const savedBytes = file.size - output.length;\n    const saving = (savedBytes / file.size) * 100;\n    const meaningfulSaving = saving >= 1.0;",'threshold');
app=swap(app,"    $('saving').textContent = saving > 0 ? saving.toFixed(1)+'%' : saving < 0 ? 'ไฟล์ใหญ่ขึ้น '+Math.abs(saving).toFixed(1)+'%' : '0%';",
"    $('saving').textContent = saving > 0 ? (saving < 0.1 ? saving.toFixed(3) : saving.toFixed(1))+'%' : saving < 0 ? 'ไฟล์ใหญ่ขึ้น '+Math.abs(saving).toFixed(2)+'%' : '0%';\n    $('savingDetail').textContent = savedBytes > 0 ? 'ลดลงจริง '+savedBytes.toLocaleString('en-US')+' ไบต์' : savedBytes < 0 ? 'ไฟล์ใหญ่ขึ้น '+(-savedBytes).toLocaleString('en-US')+' ไบต์' : 'ขนาดไม่เปลี่ยนแปลง';",'result detail');
app=swap(app,"    $('savingLine').classList.toggle('no-save', saving <= 0);","    $('savingLine').classList.toggle('no-save', !meaningfulSaving);",'result style');
app=swap(app,"    $('resultBadge').classList.toggle('no-save', saving <= 0);","    $('resultBadge').classList.toggle('no-save', !meaningfulSaving);",'badge style');
app=swap(app,"    $('resultBadge').textContent = saving > 0 ? 'ตรวจผ่าน' : 'ไม่ลดขนาด';","    $('resultBadge').textContent = meaningfulSaving ? 'บีบอัดสำเร็จ' : 'ตรวจผ่าน แต่บีบอัดไม่ได้ผล';",'badge');
app=swap(app,'    if (output.length >= file.size) {','    if (!meaningfulSaving) {','download policy');
app=swap(app,"      $('dlMessage').textContent = 'ไฟล์ใหม่ไม่เล็กลง จึงไม่เปิดให้ดาวน์โหลดไฟล์ที่ผ่านการปรับ กรุณาใช้ต้นฉบับ';","      $('dlMessage').textContent = 'ไฟล์นี้ไม่ลดขนาดอย่างมีนัยสำคัญด้วยวิธีรักษาข้อความและพิกเซลภาพเดิม โปรดใช้ต้นฉบับ หากเป็น PDF สแกน รูปภาพอาจถูกบีบอัดไว้แล้ว';",'explanation');
writeFileSync(appPath,app);
let html=readFileSync(htmlPath,'utf8');
html=swap(html,'<div id="savingLine" class="saving">ขนาดลดลง <b id="saving">—</b></div>','<div id="savingLine" class="saving">ผลการลดขนาด <b id="saving">—</b></div><p id="savingDetail" class="checks"></p>','HTML comparison');
writeFileSync(htmlPath,html);
console.log('V3 truthful reporting patch installed; saving >=1% is required to download');
let smoke=readFileSync('tests/smoke.mjs','utf8');
smoke=swap(smoke,String.raw`assert.match(js,/output\.length >= file\.size/);`,`assert.match(js,/meaningfulSaving/);
assert.match(js,/saving >= 1\.0/);`,'security smoke test');
writeFileSync('tests/smoke.mjs',smoke);
