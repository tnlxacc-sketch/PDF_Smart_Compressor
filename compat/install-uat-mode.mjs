import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
function changed(text,from,to,label){
  if(!text.includes(from))throw new Error('UAT installer pattern absent: '+label);
  return text.replace(from,to);
}
let app=readFileSync('src/app.mjs','utf8');
app=changed(app,"function pick(file) {\n  if (inProgress) return;\n  releaseResult();",
  "function pick(file) {\n  if (inProgress) return;\n  releaseResult();\n  if (typeof window!=='undefined' && typeof window.dispatchEvent==='function' && typeof Event!=='undefined') window.dispatchEvent(new Event('pdf-uat-file-changed'));",'file pick');
app=changed(app,"  const file = chosen;\n  releaseResult();",
  "  const file = chosen;\n  const uatStartedAt=(typeof performance!=='undefined'?performance.now():Date.now());\n  releaseResult();",'timing');
const successEvent=[
"    if (typeof window!=='undefined' && typeof window.dispatchEvent==='function' && typeof CustomEvent!=='undefined') window.dispatchEvent(new CustomEvent('pdf-uat-finished',{detail:{",
"      status:'VALIDATED',mode,target:goal,originalBytes:file.size,compressedBytes:output.length,",
"      pages:oldPdf.numPages,savedPct:saving,consent,lossy,fullPageRaster,",
"      jpegImagesChanged:changed,durationMs:Math.round((typeof performance!=='undefined'?performance.now():Date.now())-uatStartedAt),targetMet:metTarget",
"    }}));"
].join('\n');
app=changed(app,"    $('result').hidden = false;",
  "    $('result').hidden = false;\n"+successEvent,'compression result');
const rejectEvent=[
"    if (typeof window!=='undefined' && typeof window.dispatchEvent==='function' && typeof CustomEvent!=='undefined') window.dispatchEvent(new CustomEvent('pdf-uat-finished',{detail:{",
"      status:'REJECTED',mode:document.querySelector('input[name=quality]:checked')?.value||'balanced',",
"      target:MODE_TARGET[document.querySelector('input[name=quality]:checked')?.value||'balanced'],",
"      originalBytes:file.size,compressedBytes:null,pages:null,savedPct:null,consent:$('consent').checked,",
"      lossy:false,fullPageRaster:false,jpegImagesChanged:0,",
"      durationMs:Math.round((typeof performance!=='undefined'?performance.now():Date.now())-uatStartedAt),targetMet:false",
"    }}));"
].join('\n');
app=changed(app,"    console.error('PDF processing refused:', err);",rejectEvent+"\n    console.error('PDF processing refused:', err);",'compression reject');
writeFileSync('src/app.mjs',app);
let html=readFileSync('src/index.html','utf8');
html=changed(html,'      <details class="details">',readFileSync('compat/uat-panel.html','utf8')+'      <details class="details">','UAT UI');
html=changed(html,'  <script type="module" src="./app.mjs"></script>',
  '  <script type="module" src="./app.mjs"></script>\n  <script type="module" src="./uat-mode.mjs"></script>','UAT script');
writeFileSync('src/index.html',html);
copyFileSync('compat/uat-mode.mjs','src/uat-mode.mjs');
let css=readFileSync('src/style.css','utf8');
css+='\n'+readFileSync('compat/uat-mode.css','utf8');writeFileSync('src/style.css',css);
let build=readFileSync('scripts/build.mjs','utf8');
build=changed(build,"['index.html','style.css','app.mjs']",
  "['index.html','style.css','app.mjs','uat-mode.mjs']",'asset copy');
build=changed(build,"['index.html','style.css','app.mjs','vendor/pdf-lib.min.js'",
  "['index.html','style.css','app.mjs','uat-mode.mjs','vendor/pdf-lib.min.js'",'integrity manifest');
writeFileSync('scripts/build.mjs',build);
console.log('UAT mode installed into V5 without modifying compression formulas');
