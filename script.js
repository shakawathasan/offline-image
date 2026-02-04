function resizeAndCompress(file, maxSize, quality) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = e => img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const type = file.type || 'image/png';
            const base64 = canvas.toDataURL(type, quality);
            resolve({ name: file.name, base64 });
        };
        img.onerror = err => reject(err);
        reader.readAsDataURL(file);
    });
}

document.getElementById('generateBtn').addEventListener('click', async () => {
    const file = document.getElementById('upload').files[0];
    if (!file) return alert("Select an image!");

    const maxSize = parseInt(document.getElementById('maxSize').value) || 200;
    const quality = parseFloat(document.getElementById('quality').value) || 0.6;

    try {
        const { base64 } = await resizeAndCompress(file, maxSize, quality);

        // Create HTML page content
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Offline Image</title>
</head>
<body>
<img src="${base64}" alt="Offline Image">
</body>
</html>
        `.trim();

        // Convert HTML to Base64
        const htmlBase64 = btoa(unescape(encodeURIComponent(html)));

        // Create final data URL
        const dataUrl = `data:text/html;base64,${htmlBase64}`;

        // Show in textarea
        const textarea = document.getElementById('dataUrl');
        textarea.value = dataUrl;

        alert("Data URL generated! Copy and paste it in Messenger/WhatsApp (works for tiny images).");

    } catch (err) {
        console.error(err);
        alert("Error generating Data URL");
    }
});
