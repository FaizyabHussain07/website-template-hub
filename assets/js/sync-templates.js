const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEMPLATES_DIR = path.join(__dirname, 'templates-library');
const ZIPS_DIR = path.join(__dirname, 'zips');
const DATA_FILE = path.join(__dirname, 'data', 'templates.json');

// Ensure directories exist
if (!fs.existsSync(ZIPS_DIR)) fs.mkdirSync(ZIPS_DIR);

function sync() {
    console.log('🚀 Starting Template Sync...');

    const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.html'));
    let templatesData = [];

    // Load existing data to preserve custom fields if any
    try {
        if (fs.existsSync(DATA_FILE)) {
            templatesData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (e) {
        console.log('⚠️ Could not parse existing templates.json, creating new.');
    }

    const updatedData = files.map(filename => {
        const id = filename.replace('.html', '');
        const zipName = `${id}.zip`;
        const zipPath = path.join(ZIPS_DIR, zipName);
        const filePath = path.join(TEMPLATES_DIR, filename);

        // 1. Create ZIP if it doesn't exist
        if (!fs.existsSync(zipPath)) {
            console.log(`📦 Creating ZIP for ${id}...`);
            try {
                // Use relative paths to avoid Windows "C:" drive interpretation error in tar
                execSync(`tar -acf "zips/${zipName}" -C "templates-library" "${filename}"`);
            } catch (err) {
                console.error(`❌ Failed to create ZIP for ${id}:`, err.message);
            }
        }

        // 2. Extract metadata from HTML content
        let htmlName = null;
        let htmlCategory = null;
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const titleMatch = content.match(/<title>(.*?)<\/title>/i);
            const categoryMatch = content.match(/<meta\s+name=["']category["']\s+content=["'](.*?)["']/i);

            if (titleMatch) htmlName = titleMatch[1].replace(' | Web Templates Hub', '').trim();
            if (categoryMatch) htmlCategory = categoryMatch[1].trim();
        } catch (e) {
            console.error(`⚠️ Could not read content for ${filename}`);
        }

        // 3. Extract industry from filename
        const parts = id.split('-');
        const rawIndustry = parts[0];
        const industry = rawIndustry.charAt(0).toUpperCase() + rawIndustry.slice(1);

        // Find existing entry or create new
        const existing = templatesData.find(t => t.id === id);

        if (existing) {
            // Update existing entry with HTML data if available
            if (htmlName) existing.name = htmlName;
            if (htmlCategory) existing.category = htmlCategory;
            // Ensure URLs are correct
            existing.zipUrl = `zips/${zipName}`;
            existing.previewUrl = `templates-library/${filename}`;
            return existing;
        }

        return {
            id: id,
            name: htmlName || `${industry} Template ${parts[1] || ''}`.trim(),
            industry: industry,
            category: htmlCategory || "Landing Page",
            tech: ["HTML", "Tailwind", "JS"],
            previewUrl: `templates-library/${filename}`,
            zipUrl: `zips/${zipName}`,
            thumbnail: `assets/images/${id}.png` // Placeholder path
        };
    });

    // 3. Keep any manual entries that might not have a file (optional)
    // For now we only keep what exists in the library

    fs.writeFileSync(DATA_FILE, JSON.stringify(updatedData, null, 2));
    console.log(`✅ Sync Complete! ${updatedData.length} templates processed.`);
}

sync();
