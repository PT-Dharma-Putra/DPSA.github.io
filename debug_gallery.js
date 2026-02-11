
const fs = require('fs');
const path = require('path');

const projectFolderName = "LUMINOR PURWOKERTO";
const cwd = process.cwd();
console.log("CWD:", cwd);

const galleryPath = path.join(cwd, 'public', 'images', 'project', projectFolderName);
console.log("Looking for:", galleryPath);

try {
  if (fs.existsSync(galleryPath)) {
    console.log("Directory exists.");
    const files = fs.readdirSync(galleryPath);
    console.log("Files found:", files);
     const gallery = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      })
      .map(file => `/images/project/${projectFolderName}/${file}`);
    console.log("Gallery URLs:", gallery);
  } else {
    console.log("Directory does NOT exist.");
  }
} catch (e) {
  console.error("Error:", e);
}
