import fs from 'node:fs';
const catalog=JSON.parse(fs.readFileSync('notes-solutions/catalog.json','utf8'));
const template=fs.readFileSync('notes-solutions/template.html','utf8');
const routes=['',...catalog.courses.flatMap(c=>[c.slug,...c.chapters.flatMap(ch=>ch.exercises.map(ex=>c.slug+'/'+ex.slug))]),'fm-discrete/4a'];
for(const route of routes){const dir='notes-solutions'+(route?'/'+route:'');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/index.html',template);}
if(!fs.existsSync('404.html'))fs.writeFileSync('404.html',template);

