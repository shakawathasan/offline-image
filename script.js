function compressImage(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = e => img.src = e.target.result;

    img.onload = () => {
      let w = img.width;
      let h = img.height;

      const scale = Math.min(maxSize / w, maxSize / h, 1);
      w *= scale;
      h *= scale;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById("generateBtn").onclick = async () => {
  const file = document.getElementById("upload").files[0];
  if (!file) return alert("Select an image");

  const maxSize = Number(document.getElementById("maxSize").value);
  const quality = Number(document.getElementById("quality").value);

  const dataUrl = await compressImage(file, maxSize, quality);
  document.getElementById("dataUrl").value = dataUrl;

  document.getElementById("status").innerText =
    `Length: ${dataUrl.length} characters`;
};

document.getElementById("selectBtn").onclick = () => {
  const t = document.getElementById("dataUrl");
  t.focus();
  t.select();
};

document.getElementById("copyBtn").onclick = async () => {
  const t = document.getElementById("dataUrl");
  if (!t.value) return;

  try {
    await navigator.clipboard.writeText(t.value);
    document.getElementById("status").innerText = "Copied to clipboard ✅";
  } catch {
    t.select();
    document.execCommand("copy");
    document.getElementById("status").innerText = "Copied (fallback) ✅";
  }
};
