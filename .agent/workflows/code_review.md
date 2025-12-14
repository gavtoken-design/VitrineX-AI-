---
description: "Auditoria completa de código – lint, tipos, dependências, arquivos órfãos"
---

1. Instalar dependências de desenvolvimento (se ainda não existirem)
// turbo
   run_command:
     CommandLine: "npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier > logs/install.log 2>&1"
     Cwd: "c:\\Users\\Jeanc\\OneDrive\\Área de Trabalho\\VITRINIX-AI-main"
     SafeToAutoRun: true
     WaitMsBeforeAsync: 5000

2. Executar ESLint com correções automáticas
// turbo
   run_command:
     CommandLine: "npx eslint \"src/**/*.ts\" \"src/**/*.tsx\" --fix > logs/eslint.log 2>&1"
     Cwd: "c:\\Users\\Jeanc\\OneDrive\\Área de Trabalho\\VITRINIX-AI-main"
     SafeToAutoRun: true
     WaitMsBeforeAsync: 5000

3. Verificar tipos TypeScript (sem gerar arquivos)
   run_command:
     CommandLine: "npx tsc --noEmit > logs/tsc.log 2>&1"
     Cwd: "c:\\Users\\Jeanc\\OneDrive\\Área de Trabalho\\VITRINIX-AI-main"
     SafeToAutoRun: false
     WaitMsBeforeAsync: 10000

4. Listar arquivos não importados (potencialmente órfãos)
   // Usa o script Node abaixo
   run_command:
     CommandLine: "node scripts/find-orphan-files.cjs > logs/orphans.log 2>&1"
     Cwd: "c:\\Users\\Jeanc\\OneDrive\\Área de Trabalho\\VITRINIX-AI-main"
     SafeToAutoRun: false
     WaitMsBeforeAsync: 5000

5. Gerar relatório de dependências desatualizadas
   run_command:
     CommandLine: "npx npm-check-updates --json > logs/updates.json"
     Cwd: "c:\\Users\\Jeanc\\OneDrive\\Área de Trabalho\\VITRINIX-AI-main"
     SafeToAutoRun: false
     WaitMsBeforeAsync: 5000

6. Consolidar resultados em `code_review_report.md`
   // O script abaixo cria o relatório a partir da saída dos passos anteriores
   run_command:
     CommandLine: "node scripts/assemble-report.cjs"
     Cwd: "c:\\Users\\Jeanc\\OneDrive\\Área de Trabalho\\VITRINIX-AI-main"
     SafeToAutoRun: false
     WaitMsBeforeAsync: 5000
