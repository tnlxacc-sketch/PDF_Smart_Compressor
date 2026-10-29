/* PDF Smart Compressor V5 - privacy-preserving local UAT controls.
   Report contains NO file names, PDF bytes, text, images or hashes. */
const byId = (id) => document.getElementById(id);
const MODE_NAMES = {high:'คมชัดสูง',balanced:'สมดุล',small:'ไฟล์เล็ก'};
const CASES = [
 ['A01','ประเภท PDF','สแกนภาพทั้งหน้า'],['A02','ประเภท PDF','เอกสารที่มี Text Layer (SAP / Word / Excel)'],['A03','ประเภท PDF','เอกสาร OCR ค้นหาข้อความได้'],['A04','ประเภท PDF','เอกสารข้อความและภาพผสม'],['A05','ประเภท PDF','เอกสารไทย / แบบฟอร์มที่ใช้งานจริง'],
 ['B01','ลดขนาด','คมชัดสูง ลดได้ตามเป้าหมาย ≥10%'],['B02','ลดขนาด','สมดุล ลดได้ตามเป้าหมาย ≥30%'],['B03','ลดขนาด','ไฟล์เล็ก ลดได้ตามเป้าหมาย ≥50%'],['B04','ลดขนาด','ขนาด/เปอร์เซ็นต์ก่อน–หลังตรงกับไฟล์ที่เปิดได้จริง'],['B05','ลดขนาด','ความชัดตัวเลขยังอยู่ในเกณฑ์ยอมรับ'],
 ['C01','ข้อมูล','จำนวนหน้าและลำดับหน้าครบถ้วน'],['C02','ข้อมูล','จำนวนเงิน จุดทศนิยม และเลขเอกสารถูกต้อง'],['C03','ข้อมูล','ข้อความไทย/อังกฤษและตารางไม่สูญหาย'],['C04','ข้อมูล','ภาพประกอบ ตราประทับ ลายเซ็นภาพอ่านชัด'],['C05','ข้อมูล','Barcode/QR Code ยังสแกนได้ (ถ้ามี)'],
 ['D01','ความปลอดภัย','IT ตรวจ Network ไม่พบ PDF ถูกส่งออก'],['D02','ความปลอดภัย','ไม่พบ AI / API อัปโหลดเอกสาร'],['D03','ความปลอดภัย','ไม่มี PDF ต้นฉบับหรือผลลัพธ์ถูกเก็บภายนอก'],['D04','ความปลอดภัย','ตรวจสิทธิ์ GitHub และนโยบายเบราว์เซอร์'],
 ['E01','Google Sites','เลือกไฟล์ผ่าน Google Sites จริงได้'],['E02','Google Sites','ประมวลผลบน Google Sites จริงได้'],['E03','Google Sites','ดาวน์โหลดและเปิด PDF ผลลัพธ์ได้'],
 ['F01','ประสิทธิภาพ','ทดลองไฟล์ใหญ่ตามงานจริง'],['F02','ประสิทธิภาพ','ความเร็วและหน่วยความจำอยู่ในเกณฑ์บริษัท'],['F03','ประสิทธิภาพ','เมื่อผิดพลาดไม่ทำไฟล์เดิมเสีย/ไม่มีดาวน์โหลดผิด']
];
const REVIEW_LABELS = [
 ['pages','ตรวจครบทุกหน้าและลำดับหน้า'],['numbers','ตัวเลขยอดเงิน/วันที่/เลขเอกสารถูกต้อง'],['images','ภาพประกอบ/ตราประทับ/ลายเซ็นภาพอ่านชัด'],
 ['codes','Barcode / QR Code อ่านได้ (เลือกไม่มีถ้าไม่มี)'],['reader','ดาวน์โหลดและเปิดตรวจใน PDF Reader']
];
const state = {session:(typeof crypto.randomUUID==='function'?crypto.randomUUID():String(Date.now())),files:0,activeFile:0,runs:[],selected:-1,checklist:Object.fromEntries(CASES.map(c=>[c[0],'NOT_TESTED'])),security:'NOT_CHECKED'};
const allowed = new Set(['PASS','FAIL','NOT_TESTED','NA']);
const modeName = m => MODE_NAMES[m] || m;
const pct = n => n == null ? '—' : Number(n).toFixed(2)+'%';
const stateStr = s => ({PASS:'ผ่าน',FAIL:'ไม่ผ่าน',NOT_TESTED:'ยังไม่ตรวจ',NA:'ไม่มีรายการ'})[s]||s;
const cell = (text) => {const td=document.createElement('td');td.textContent=String(text);return td;};
const select = (id,includeNA=true) => {
  const s=document.createElement('select');s.id=id;s.setAttribute('aria-label',id);
  for(const [value,label] of [['NOT_TESTED','ยังไม่ตรวจ'],['PASS','ผ่าน'],['FAIL','ไม่ผ่าน'],...(includeNA?[['NA','ไม่มีรายการ/ไม่เกี่ยวข้อง']]:[])]) {
    const o=document.createElement('option');o.value=value;o.textContent=label;s.append(o);
  }return s;
};
function renderChecklist(){
  const body=byId('uatCaseRows');body.replaceChildren();
  for (const [id,group,label] of CASES) {
    const tr=document.createElement('tr');
    tr.append(cell(id),cell(group),cell(label));
    const td=document.createElement('td');const s=select('uatcase-'+id,true);
    s.value=state.checklist[id];s.addEventListener('change',()=>{state.checklist[id]=s.value;refreshSummary()});
    td.append(s);tr.append(td);body.append(tr);
  }
}
function renderReview() {
  const picker=byId('uatRunPicker');picker.replaceChildren();
  for(const [i,record] of state.runs.entries()){
    const o=document.createElement('option');o.value=String(i);
    o.textContent='ไฟล์ทดสอบ #'+record.sample+' · '+modeName(record.mode)+' · '+(record.status==='VALIDATED'?'ตรวจเครื่องผ่าน':'ประมวลผลถูกปฏิเสธ');
    picker.append(o);
  }
  if(state.selected>=state.runs.length)state.selected=state.runs.length-1;
  if(state.selected<0){byId('uatReview').hidden=true;return;}
  picker.value=String(state.selected);
  const r=state.runs[state.selected];
  byId('uatReview').hidden=false;
  byId('uatReviewTitle').textContent='ตรวจด้วยสายตา: ไฟล์ทดสอบ #'+r.sample+' / '+modeName(r.mode)+(r.targetMet?' — ถึงเป้าหมาย':' — ไม่ถึงเป้าหมาย');
  for(const [key] of REVIEW_LABELS) byId('uat-review-'+key).value=r.review[key];
}
function renderHistory(){
  const body=byId('uatRunRows');body.replaceChildren();
  for(const r of state.runs){
    const tr=document.createElement('tr');
    const checks=REVIEW_LABELS.map(([k])=>r.review[k]);
    const manualComplete=checks.every((v,i)=>v==='PASS'||(v==='NA'&&(i===2||i===3)));
    const manualFail=checks.includes('FAIL');
    const overall=r.status!=='VALIDATED'?'ปฏิเสธ':!r.targetMet?'ไม่ถึงเป้าหมาย':manualFail?'ตรวจไม่ผ่าน':manualComplete?'รอ IT/การรับรอง':'รอตรวจเอกสาร';
    for(const v of ['#'+r.sample,modeName(r.mode),r.originalBytes??'—',r.compressedBytes??'—',pct(r.savedPct),(r.targetMet?'ผ่าน':'ไม่ผ่าน'),overall])tr.append(cell(v));
    body.append(tr);
  }
}
function refreshSummary(){
  const total=CASES.length,pass=Object.values(state.checklist).filter(x=>x==='PASS').length,fail=Object.values(state.checklist).filter(x=>x==='FAIL').length;
  byId('uatSummary').textContent='ทดสอบ PDF '+state.files+' ไฟล์ · บันทึก '+state.runs.length+' ครั้ง · Business UAT '+pass+'/'+total+' ผ่าน · '+fail+' ไม่ผ่าน · Production: HOLD (ต้องมีผู้อนุมัติ)';
  byId('uatExportJson').disabled=state.runs.length===0;
  byId('uatExportCsv').disabled=state.runs.length===0;
}
function recordFinished(data) {
  const status=data?.status==='VALIDATED'?'VALIDATED':'REJECTED';
  const row={sample:state.activeFile||0,documentType:byId('uatDocType').value,
    mode:['high','balanced','small'].includes(data?.mode)?data.mode:'unknown',
    targetPercent:Number(data?.target)||null,originalBytes:Number.isFinite(data?.originalBytes)?data.originalBytes:null,
    compressedBytes:Number.isFinite(data?.compressedBytes)?data.compressedBytes:null,
    pages:Number.isFinite(data?.pages)?data.pages:null,savedPct:Number.isFinite(data?.savedPct)?data.savedPct:null,
    consent:!!data?.consent,lossy:!!data?.lossy,fullPageRaster:!!data?.fullPageRaster,
    optimizedImages:Number(data?.jpegImagesChanged)||0,processingMs:Number(data?.durationMs)||0,
    status,targetMet:status==='VALIDATED'&&data.targetMet===true,
    review:Object.fromEntries(REVIEW_LABELS.map(([k])=>[k,'NOT_TESTED']))};
  state.runs.push(row);state.selected=state.runs.length-1;
  renderReview();renderHistory();refreshSummary();
  byId('uatNotice').textContent='บันทึกผลอัตโนมัติแล้ว (เฉพาะตัวเลขสรุป ไม่บันทึกชื่อไฟล์หรือเนื้อหา PDF) กรุณาตรวจผลลัพธ์ใน PDF Reader';
}
function report(){
  return {
    format:'TNLX-PDF-UAT-LOCAL-v1',generatedAt:new Date().toISOString(),sessionId:state.session,
    productionApproval:'HOLD_PENDING_CORPORATE_REVIEW',automatedRegression:'SEE_GITHUB_ACTIONS_SEPARATELY',
    networkSecurity:'NOT_PROVEN_BY_THIS_REPORT',securityReviewerSelfDeclared:state.security,
    privacy:{pdfBytesIncluded:false,filenameIncluded:false,pdfTextIncluded:false,pdfImagesIncluded:false,contentHashesIncluded:false,reportGeneratedLocally:true,remoteUploadPerformedByUATMode:false},
    runs:state.runs.map(r=>({...r,review:{...r.review}})),
    businessCases:CASES.map(c=>({id:c[0],group:c[1],description:c[2],status:state.checklist[c[0]]})),
    summary:{businessPassed:Object.values(state.checklist).filter(v=>v==='PASS').length,businessTotal:CASES.length,completedModes:state.runs.length},
    caution:'Only local results and user-reported checks. A PDF may lose information from lossy downsampling. Manual and IT sign-off required.'
  };
}
function exportFile(name,content,mime){
  const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function csvCell(value){const s=String(value??'');return '"'+s.replaceAll('"','""')+'"';}
function exportCsv(){
  const data=report();const rows=[['ประเภท','ID','กลุ่ม/โหมด','ตัวอย่าง','ขนาดเดิม(Byte)','ขนาดใหม่(Byte)','ลด(%)','เป้าหมาย(%)','ผล','ตรวจหน้า','ตรวจตัวเลข','ตรวจภาพ','ตรวจ QR','เปิดใน Reader']];
  for(const r of data.runs)rows.push(['PDF',r.sample,r.mode,r.documentType,r.originalBytes,r.compressedBytes,r.savedPct?.toFixed(4),r.targetPercent,r.targetMet?'PASS':'FAIL',r.review.pages,r.review.numbers,r.review.images,r.review.codes,r.review.reader]);
  for(const c of data.businessCases)rows.push(['BUSINESS',c.id,c.group,c.description,'','','','',c.status,'','','','','']);
  rows.push(['SECURITY','IT',data.securityReviewerSelfDeclared,'ผลจากผู้ทดสอบ ไม่ใช่ผลตรวจ Network อัตโนมัติ','','','','',data.networkSecurity,'','','','','']);
  exportFile('PDF_UAT_LOCAL_'+new Date().toISOString().slice(0,10)+'.csv','\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');
}
function setup(){
  renderChecklist();
  const reviewRows=byId('uatReviewChecks');reviewRows.replaceChildren();
  for(const [key,label] of REVIEW_LABELS){
    const wrapper=document.createElement('label');wrapper.className='uat-review-item';
    const title=document.createElement('span');title.textContent=label;
    const s=select('uat-review-'+key,key==='images'||key==='codes');
    wrapper.append(title,s);reviewRows.append(wrapper);
  }
  byId('uatRunPicker').addEventListener('change',e=>{state.selected=Number(e.target.value);renderReview()});
  byId('uatSaveReview').addEventListener('click',()=>{
    if(state.selected<0)return;
    for(const [key] of REVIEW_LABELS)state.runs[state.selected].review[key]=byId('uat-review-'+key).value;
    renderHistory();refreshSummary();
    byId('uatNotice').textContent='บันทึกผลตรวจด้วยคนแล้ว (เฉพาะสถานะ Pass/Fail ไม่บันทึกเนื้อหา PDF)';
  });
  byId('uatSecurity').addEventListener('change',e=>{state.security=e.target.value;refreshSummary()});
  byId('uatExportJson').addEventListener('click',()=>exportFile('PDF_UAT_LOCAL_'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(report(),null,2),'application/json;charset=utf-8'));
  byId('uatExportCsv').addEventListener('click',exportCsv);
  byId('uatClear').addEventListener('click',()=>{
    if(!window.confirm('ล้างข้อมูลผล UAT ในหน่วยความจำทั้งหมด? ไฟล์ PDF ต้นฉบับในเครื่องจะไม่ถูกลบ'))return;
    state.session=typeof crypto.randomUUID==='function'?crypto.randomUUID():String(Date.now());
    state.files=0;state.activeFile=0;state.runs=[];state.selected=-1;
    state.checklist=Object.fromEntries(CASES.map(c=>[c[0],'NOT_TESTED']));
    state.security='NOT_CHECKED';byId('uatSecurity').value='NOT_CHECKED';
    byId('uatDocType').value='unknown';renderChecklist();renderReview();renderHistory();refreshSummary();
  });
  window.addEventListener('pdf-uat-file-changed',()=>{
    state.activeFile=++state.files;
    byId('uatDocType').value='unknown';
    refreshSummary();
  });
  window.addEventListener('pdf-uat-finished',event=>recordFinished(event.detail||{}));
  renderReview();renderHistory();refreshSummary();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();