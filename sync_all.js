const { execSync } = require('child_process');
const path = require('path');

function runSync(scriptPath) {
    console.log(`\n=========================================`);
    console.log(`🏃 Running: ${path.basename(scriptPath)}`);
    console.log(`=========================================`);
    try {
        const output = execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    } catch (err) {
        console.error(`❌ Error running ${scriptPath}:`, err.message);
    }
}

const scripts = [
    path.join(__dirname, 'assets/js/sync-templates.js'),
    path.join(__dirname, 'assets/js/sync-components.js')
];

scripts.forEach(runSync);

console.log(`\n✨ All libraries synchronized successfully!`);
