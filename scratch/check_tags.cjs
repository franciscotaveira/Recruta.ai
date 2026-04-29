const fs = require('fs');
const content = fs.readFileSync('src/pages/admin/Dashboard.tsx', 'utf8');

let stack = [];
let line = 1;

for (let i = 0; i < content.length; i++) {
  if (content[i] === '\n') line++;
  
  if (content.substring(i, i + 1) === '<' && content[i + 1] !== '/' && content[i + 1] !== '!' && content[i+1] !== ' ') {
    let endOfTag = content.indexOf('>', i);
    if (endOfTag !== -1) {
      let tagContent = content.substring(i + 1, endOfTag).trim();
      let tagName = tagContent.split(/\s|>/)[0];
      
      if (tagContent.endsWith('/') || tagName.startsWith('input') || tagName.startsWith('img') || tagName.startsWith('br')) {
        // self closing or void
      } else {
        stack.push({ tag: tagName, line });
      }
      i = endOfTag;
    }
  } else if (content.substring(i, i + 2) === '</') {
    let endOfTag = content.indexOf('>', i);
    if (endOfTag !== -1) {
      let tagName = content.substring(i + 2, endOfTag).trim();
      let last = stack.pop();
      if (last && last.tag !== tagName && tagName !== '') {
        console.log(`Mismatch: found </${tagName}> at line ${line} but expected </${last.tag}> (opened at ${last.line})`);
      }
      i = endOfTag;
    }
  }
}

if (stack.length > 0) {
  console.log('Unclosed tags:');
  stack.forEach(s => console.log(`${s.tag} opened at line ${s.line}`));
} else {
  console.log('All tags matched!');
}
