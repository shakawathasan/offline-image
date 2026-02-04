// --- Base91 Encode/Decode ---
const ENCODING="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~\"";
const table={};for(let i=0;i<ENCODING.length;i++)table[ENCODING[i]]=i;

const b91Encode=(data)=>{
  let n=0,b=0,out='';
  for(let i=0;i<data.length;i++){
    b|=data[i]<<n;n+=8;
    while(n>13){
      let v=b&8191;if(v>88){b>>=13;n-=13}else{v=b&16383;b>>=14;n-=14;}
      out+=ENCODING[v%91]+ENCODING[Math.floor(v/91)];
    }
  }
  if(n){out+=ENCODING[b%91];if(n>7||b>90)out+=ENCODING[Math.floor(b/91)];}
  return out;
}

const b91Decode=(str)=>{
  let b=0,n=0,out=[];
  for(let i=0;i<str.length;i++){
    let c=table[str[i]];if(c===undefined)continue;
    b|=c<<n;n+=i%2===0?13:14;
    while(n>=8){out.push(b&255);b>>=8;n-=8;}
  }
  return new Uint8Array(out);
}

// --- Step 1: Encode Full Binary ---
let fullBinaryData=null;
document.getElementById('encodeFullBtn').addEventListener('click',()=>{
  const f=document.getElementById('upload').files[0];if(!f)return alert("Select image");
  const r=new FileReader();
  r.onload=e=>{
    const data=new Uint8Array(e.target.result);
    const compressed=pako.deflate(data,{level:9});
    const fullBinary=b91Encode(compressed);
    fullBinaryData=fullBinary; // save for step 2
    document.getElementById('fullBinary').value=fullBinary;
    alert("Full binary generated!");
  };
  r.readAsArrayBuffer(f);
});

// --- Step 2: Convert Full Binary → Multi-Part Short Codes ---
document.getElementById('toShortBtn').addEventListener('click',()=>{
  if(!fullBinaryData)return alert("Generate full binary first");

  const binaryUint8=b91Decode(fullBinaryData);
  const doubleCompressed=pako.deflate(binaryUint8,{level:9});
  const short=b91Encode(doubleCompressed);

  // Split into multiple parts (~5000 chars per part)
  const partSize=5000;
  let parts=[];
  for(let i=0;i<short.length;i+=partSize) parts.push(short.slice(i,i+partSize));

  document.getElementById('shortCodes').value=parts.join('\n');
  alert("Short codes generated! Copy and share each part as needed.");
});

// --- Step 3: Decode Multi-Part Short Codes ---
document.getElementById('decodeBtn').addEventListener('click',()=>{
  const input=document.getElementById('decodeInput').value.trim();
  if(!input)return alert("Paste short codes here");

  try {
    // Auto-join multiple parts
    const short= input.split(/\r?\n/).join('');
    const compressed=b91Decode(short);
    const full=pako.inflate(compressed);
    const imgData=pako.inflate(full);
    document.getElementById('output').src=URL.createObjectURL(new Blob([imgData],{type:'image/png'}));
  } catch(e) {
    console.error(e);
    alert("Invalid code or corrupted data!");
  }
});
