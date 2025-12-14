const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
}

const srcDir = path.resolve(__dirname, '../src');
const allFiles = getAllFiles(srcDir);
const importedFiles = new Set();

// Add known entry points
importedFiles.add(path.join(srcDir, 'index.tsx'));
importedFiles.add(path.join(srcDir, 'main.tsx'));
importedFiles.add(path.join(srcDir, 'vite-env.d.ts'));

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Simple regex for imports
    const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
            // Resolve relative path
            try {
                const dir = path.dirname(file);
                const resolvedBase = path.resolve(dir, importPath);

                // Check exact match or extensions
                const candidates = [
                    resolvedBase,
                    resolvedBase + '.ts',
                    resolvedBase + '.tsx',
                    resolvedBase + '/index.ts',
                    resolvedBase + '/index.tsx'
                ];

                candidates.forEach(c => {
                    if (allFiles.some(f => f.toLowerCase() === c.toLowerCase())) { // Windows case-insensitive roughly
                        // Find the exact match in allFiles to add to set
                        const exact = allFiles.find(f => f.toLowerCase() === c.toLowerCase());
                        if (exact) importedFiles.add(exact);
                    }
                });

            } catch (e) { }
        }
    }

    // Dynamic imports
    const dynamicImportRegex = /import\(['"](.*?)['"]\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
        // Logic similar to above
        const importPath = match[1];
        if (importPath.startsWith('.')) {
            const dir = path.dirname(file);
            const resolvedBase = path.resolve(dir, importPath);
            const candidates = [resolvedBase, resolvedBase + '.ts', resolvedBase + '.tsx', resolvedBase + '/index.ts', resolvedBase + '/index.tsx'];
            candidates.forEach(c => {
                const exact = allFiles.find(f => f.toLowerCase() === c.toLowerCase());
                if (exact) importedFiles.add(exact);
            });
        }
    }
});

const orphans = allFiles.filter(f => !importedFiles.has(f));

if (orphans.length > 0) {
    console.log("Potential Orphans (files not imported by others):");
    orphans.forEach(f => console.log(path.relative(path.resolve(__dirname, '..'), f)));
} else {
    console.log("No obvious orphans found (check limited to relative imports).");
}
