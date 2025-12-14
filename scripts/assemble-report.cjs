const fs = require('fs');
const path = require('path');

const reportPath = path.resolve(__dirname, '../code_review_report.md');
const logsDir = path.resolve(__dirname, '../logs');

let report = "# Code Review Report\n\nGenerated on " + new Date().toISOString() + "\n\n";

const files = {
    'ESLint Issues': 'eslint.log',
    'TypeScript Errors': 'tsc.log',
    'Orphan Files': 'orphans.log',
    'Dependency Updates': 'updates.json',
    'Install Logs': 'install.log'
};

for (const [section, file] of Object.entries(files)) {
    report += `## ${section}\n\n`;
    const logFile = path.join(logsDir, file);
    if (fs.existsSync(logFile)) {
        try {
            const content = fs.readFileSync(logFile, 'utf8');
            if (content.trim().length === 0) {
                report += "_No output (Clean)_.\n\n";
            } else {
                report += "```\n" + content.substring(0, 5000) + (content.length > 5000 ? "\n... (truncated)" : "") + "\n```\n\n";
            }
        } catch (e) {
            report += "Error reading log.\n\n";
        }
    } else {
        report += "_Log file not found._\n\n";
    }
}

fs.writeFileSync(reportPath, report);
console.log("Report generated at " + reportPath);
