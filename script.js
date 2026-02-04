// Base85 encode/decode
function base85Encode(bytes) {
    let chars = [];
    let value = 0, count = 0;
    for (let b of bytes) {
        value = value * 256 + b;
        count++;
        if (count === 4) {
            for (let i = 4; i >= 0; i--) {
                chars.push(String.fromCharCode(Math.floor(value / (85**i)) % 85 + 33));
            }
            value = 0; count = 0;
        }
    }
    if (count > 0) {
        for (let i = count; i < 4; i++) value *= 256;
        for (let i = 4; i >= 0; i--) {
            chars.push(String.fromCharCode(Math.floor(value / (85**i)) % 85 + 33));
        }
    }
    return chars.join('');
}

function base85Decode(str) {
    let bytes = [];
    for (let i = 0; i < str.length; i += 5) {
        let chunk = str.slice(i, i+5);
        let value = 0;
        for (let j = 0; j < chunk.length; j++) {
            value = value * 85 + (chunk.charCodeAt(j)-33);
        }
        for (let j = 3; j >=0; j--) {
            bytes.push((value >> (8*j)) & 0xFF);
        }
    }
    return new Uint8Array(bytes);
}

// Compress and encode
document.getElementById('compressBtn').addEventListener('click', () => {
    const file = document.getElementById('upload').files[0];
    if (!file) return alert("Select an image first");
    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        const compressed = pako.deflate(new Uint8Array(arrayBuffer));
        const encoded = base85Encode(compressed);
        document.getElementById('compressed').value = encoded;
        alert("Compressed! Text size: " + encoded.length);
    };
    reader.readAsArrayBuffer(file);
});

// Decode and decompress
document.getElementById('decodeBtn').addEventListener('click', () => {
    const encoded = document.getElementById('compressed').value.trim();
    if (!encoded) return alert("Paste mini binary first");
    const compressed = base85Decode(encoded);
    const decompressed = pako.inflate(compressed);
    const blob = new Blob([decompressed], {type: 'image/png'});
    document.getElementById('output').src = URL.createObjectURL(blob);
});
