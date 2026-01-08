const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://web-template-hub.netlify.app';
const CONFIG = {
    templatesData: path.join(__dirname, '../../data/templates.json'),
    pagesDir: path.join(__dirname, '../..', 'pages'),
    legalDir: path.join(__dirname, '../..', 'legal'),
    outputFile: path.join(__dirname, '../..', 'sitemap.xml')
};

function generateSitemap() {
    console.log('🚀 Starting sitemap generation...');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/index.html</loc>
    <priority>1.0</priority>
  </url>`;

    // 1. Process Pages Directory
    if (fs.existsSync(CONFIG.pagesDir)) {
        const pages = fs.readdirSync(CONFIG.pagesDir).filter(file => file.endsWith('.html'));
        pages.forEach(page => {
            xml += `
  <url>
    <loc>${BASE_URL}/pages/${page}</loc>
    <priority>0.8</priority>
  </url>`;
        });
        console.log(`✅ Added ${pages.length} pages from /pages`);
    }

    // 2. Process Legal Directory
    if (fs.existsSync(CONFIG.legalDir)) {
        const legals = fs.readdirSync(CONFIG.legalDir).filter(file => file.endsWith('.html'));
        legals.forEach(legal => {
            xml += `
  <url>
    <loc>${BASE_URL}/legal/${legal}</loc>
    <priority>0.5</priority>
  </url>`;
        });
        console.log(`✅ Added ${legals.length} legal documents from /legal`);
    }

    // 3. Process Templates for Preview Pages
    if (fs.existsSync(CONFIG.templatesData)) {
        try {
            const data = JSON.parse(fs.readFileSync(CONFIG.templatesData, 'utf8'));
            data.forEach(template => {
                xml += `
  <url>
    <loc>${BASE_URL}/preview-page.html?id=${template.id}</loc>
    <priority>0.6</priority>
  </url>`;
            });
            console.log(`✅ Added ${data.length} template preview links`);
        } catch (err) {
            console.error('❌ Error parsing templates.json:', err);
        }
    }

    xml += '\n</urlset>';

    fs.writeFileSync(CONFIG.outputFile, xml);
    console.log(`✨ Sitemap successfully written to ${CONFIG.outputFile}`);
}

generateSitemap();
