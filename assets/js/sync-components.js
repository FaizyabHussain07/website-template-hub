const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '../../components-library');
const DATA_FILE = path.join(__dirname, '../../data', 'components.json');

// Ensure directory exists
if (!fs.existsSync(COMPONENTS_DIR)) {
    console.error(`❌ Components directory not found at: ${COMPONENTS_DIR}`);
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
    console.log('🚀 Starting Component Sync...');

    const files = getAllFiles(COMPONENTS_DIR);
    console.log(`Found ${files.length} component files.`);

    const componentsData = files.map(filePath => {
        // Relative path for "file" property (e.g., components-library/buttons/primary/v1.html)
        // We want paths relative to the project root or accessible from pages/library.html
        // library.html is in /pages/, so we need ../components-library/...
        // But v2.js handles relative paths. Let's start with project-root relative: components-library/...

        const relativePath = path.relative(path.join(__dirname, '../../'), filePath).replace(/\\/g, '/');

        // Extract ID and Category from path
        // path: components-library/buttons/primary/v1.html
        // category: buttons
        // name: from file content or folder structure

        const pathParts = relativePath.split('/');
        // [ 'components-library', 'buttons', 'primary', 'v1.html' ]

        let category = 'General';
        if (pathParts.length > 2) {
            category = pathParts[1]; // 'buttons'
        }

        let name = 'Component';
        let description = '';

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const titleMatch = content.match(/<title>(.*?)<\/title>/i);
            const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
            const catMatch = content.match(/<meta\s+name=["']category["']\s+content=["'](.*?)["']/i);

            if (titleMatch) name = titleMatch[1].replace(' | Web Templates Hub', '').trim();
            if (descMatch) description = descMatch[1].trim();
            if (catMatch) category = catMatch[1].trim();
        } catch (e) {
            console.error(`⚠️ Could not read content for ${relativePath}`);
        }

        // Fallback name if no title
        if (name === 'Component' && pathParts.length >= 4) {
            // e.g. Primary Button v1
            name = `${pathParts[2].charAt(0).toUpperCase() + pathParts[2].slice(1)} ${pathParts[3].replace('.html', '')}`;
        }

        return {
            id: path.basename(filePath, '.html'), // v1
            name: name,
            category: category,
            description: description,
            file: relativePath,
            preview: null, // No screenshot generation yet
            tech: ["HTML", "Tailwind"]
        };
    });

    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(componentsData, null, 4));
        console.log(`✅ Sync Complete! ${componentsData.length} components processed.`);
        console.log(`Saved to: ${DATA_FILE}`);
    } catch (err) {
        console.error('❌ Failed to write components.json:', err);
    }
}

sync();
