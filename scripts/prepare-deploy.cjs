const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

console.log(`📂 Diretório Raiz: ${rootDir}`);
console.log(`🔨 Usando Vite bin: ${viteBin}`);

// 1. Check Version
try {
    const version = spawnSync('node', [viteBin, '--version'], { cwd: rootDir, encoding: 'utf8' });
    console.log(`ℹ️ Vite Version: ${version.stdout.trim()}`);
    if (version.stderr) console.error(`⚠️ Version Stderr: ${version.stderr}`);
} catch (e) {
    console.error("❌ Falha ao checar versão:", e);
}

// 2. Run Build Directly
console.log("📦 Iniciando Build Direto (node vite build)...");
const build = spawnSync('node', [viteBin, 'build', '--debug'], {
    cwd: rootDir,
    encoding: 'utf8',
    env: { ...process.env, FORCE_COLOR: 'true' }
});

console.log("--- BUILD STDOUT ---");
console.log(build.stdout);
console.log("--- BUILD STDERR ---");
console.log(build.stderr);
console.log(`--- EXIT CODE: ${build.status} ---`);

// 3. Verify
if (fs.existsSync(distDir) || fs.existsSync(path.join(rootDir, 'build_temp'))) {
    console.log("✅ Alguma pasta de build foi criada!");
    // Verificar qual e normalizar
    if (fs.existsSync(path.join(rootDir, 'build_temp'))) {
        fs.renameSync(path.join(rootDir, 'build_temp'), distDir);
    }

    // Create htaccess
    fs.writeFileSync(path.join(distDir, '.htaccess'), 'RewriteEngine On\nRewriteRule ^ index.html [L]');
    console.log("✅ .htaccess criado.");

    // Zip
    try {
        const zipCmd = `powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${rootDir}\\dist.zip' -Force"`;
        spawnSync('powershell', ['-Command', `Compress-Archive -Path '${distDir}\\*' -DestinationPath '${rootDir}\\dist.zip' -Force`], { stdio: 'inherit' });
        console.log("✅ dist.zip gerado.");
    } catch (e) { console.warn("Erro zip", e); }
} else {
    console.error("❌ O build falhou drasticamente. Nenhuma pasta criada.");
}
