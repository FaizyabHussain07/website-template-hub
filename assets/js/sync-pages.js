const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '../../pages-library');
const DATA_FILE = path.join(__dirname, '../../data', 'pages-library.json');

// Ensure directory exists
if (!fs.existsSync(PAGES_DIR)) {
    console.error(`❌ Pages directory not found at: ${PAGES_DIR}`);
    process.exit(1);
}

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.html')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function sync() {
    console.log('🚀 Starting Pages Sync...');

    const files = getAllFiles(PAGES_DIR);
    console.log(`Found ${files.length} page files.`);

    const pagesData = files.map(filePath => {
        const relativePath = path.relative(path.join(__dirname, '../../'), filePath).replace(/\\/g, '/');

        // Path example: pages-library/saas/landing/v1/index.html
        const pathParts = relativePath.split('/');

        const industry = pathParts[1] ? pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1) : 'General';
        const type = pathParts[2] ? pathParts[2].charAt(0).toUpperCase() + pathParts[2].slice(1) : 'Landing';
        const version = pathParts[3] || 'v1';

        let name = `${industry} ${type} Page`;
        let description = `A premium ${industry} ${type} page built with Tailwind CSS.`;

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const titleMatch = content.match(/<title>(.*?)<\/title>/i);
            const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);

            if (titleMatch) name = titleMatch[1].replace(' | Web Templates Hub', '').trim();
            if (descMatch) description = descMatch[1].trim();
        } catch (e) {
            console.error(`⚠️ Could not read content for ${relativePath}`);
        }

        // Create ID based on path (e.g., saas-landing-v1)
        const id = `${pathParts[1]}-${pathParts[2]}-${version}`.replace('.html', '').toLowerCase();

        return {
            id: id,
            title: name,
            name: name, // Consistency
            industry: industry,
            category: type,
            description: description,
            preview: `assets/previews/${id}.png`,
            previewUrl: relativePath,
            file: relativePath,
            zipUrl: `zips/pages/${id}.zip`, // Placeholder for zip automation
            tech: ["HTML", "Tailwind", "JS"]
        };
    });

    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(pagesData, null, 4));
        console.log(`✅ Sync Complete! ${pagesData.length} pages processed.`);
    } catch (err) {
        console.error('❌ Failed to write pages.json:', err);
    }
}

sync();
