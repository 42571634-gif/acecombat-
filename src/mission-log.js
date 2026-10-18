// Snapshots independientes del historial narrativo. Dos registros por misión y modo.
export function createMissionLog(indexedDB){
  const memory=new Map();let database=null,unavailable=!indexedDB;
  const ready=new Promise(resolve=>{
    if(!indexedDB){resolve();return;}
    try{
      const request=indexedDB.open('electrosphere.radio',1);
      request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('records'))request.result.createObjectStore('records',{keyPath:'key'});};
      request.onsuccess=()=>{database=request.result;database.onversionchange=()=>{database.close();database=null;unavailable=true;};resolve();};
      request.onerror=request.onblocked=()=>{unavailable=true;resolve();};
    }catch{unavailable=true;resolve();}
  });
  const copy=value=>structuredClone(value);
  async function transaction(mode,action){
    await ready;if(!database)return null;
    return new Promise(resolve=>{try{const tx=database.transaction('records',mode);let result=null;action(tx.objectStore('records'),value=>{result=value;});tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>{unavailable=true;resolve(null);};}catch{unavailable=true;resolve(null);}});
  }
  return {
    get persistent(){return Boolean(database)&&!unavailable;},
    async save(record){
      const snapshot=copy(record),prefix=`${record.mode}:${record.mission}:`;
      const entries=[{...snapshot,key:prefix+'attempt'},...(record.result==='victory'?[{...snapshot,key:prefix+'victory'}]:[])];
      for(const entry of entries)memory.set(entry.key,entry);
      await transaction('readwrite',store=>{for(const entry of entries)store.put(entry);});
      return !unavailable;
    },
    async list(mission,mode){
      const stored=await transaction('readonly',(store,done)=>{const request=store.getAll();request.onsuccess=()=>done(request.result);});
      for(const record of stored||[])if(!memory.has(record.key))memory.set(record.key,record);
      return [...memory.values()].filter(record=>(!mission||record.mission===mission)&&(!mode||record.mode===mode)).map(copy).sort((a,b)=>b.startedAt-a.startedAt);
    },
  };
}
