import {readFileSync,writeFileSync} from 'node:fs';
const path='tests/real-browser.mjs';
let content=readFileSync(path,'utf8');
const anchor="  const signature = Buffer.concat([source,Buffer.from(";
if(!content.includes(anchor))throw new Error('UAT browser test injection anchor absent');
content=content.replace(anchor,readFileSync('compat/uat-tests.fragment','utf8')+anchor);
writeFileSync(path,content);
console.log('Installed end-to-end privacy-safe UAT Mode regression');