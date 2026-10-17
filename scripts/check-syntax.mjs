import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
function modules(directory){return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?modules(join(directory,entry.name)):entry.name.endsWith('.js')?[join(directory,entry.name)]:[]);}
const files=modules('src');
for(const file of files){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status||1);}
console.log(`Sintaxis correcta: ${files.length} módulos.`);
