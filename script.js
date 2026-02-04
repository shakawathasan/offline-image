document.getElementById('generateBtn').addEventListener('click', () => {
    const file = document.getElementById('upload').files[0];
    if (!file) return alert("Select an image first!");

    const reader = new FileReader();
    reader.onload = e => {
        const base64 = e.target.result; // already includes data:image/png;base64,...

        // Optional: show Base64 preview
        document.getElementById('preview').value = base64;

        // Create offline HTML content
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Offline Image</title>
</head>
<body>
<h2>Offline Image</h2>
<img src="${base64}" alt="Offline Image">
</body>
</html>
`;

        // Create blob and download link
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.getElementById('downloadLink');
        link.href = url;
        link.style.display = 'inline-block';
        link.innerText = "Download HTML File";
    };

    reader.readAsDataURL(file); // converts image to Base64 automatically
});
