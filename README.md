
<div align="center">
  <img src="public/icon.svg" alt="VitrineX AI Logo" width="100" height="100" />

  # VitrineX AI
  
  **Sua Agência de Marketing Movida por Inteligência Artificial**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

  <p align="center">
    O VitrineX AI é uma plataforma completa de automação de marketing projetada para transformar a maneira como pequenas e médias empresas criam conteúdo. Desde a geração de textos persuasivos até a criação de imagens visuais impressionantes e agendamento de postagens,  tudo potencializado pela API do Google Gemini.
  </p>
</div>

---

## 🚀 Sobre o Projeto

O **VitrineX AI** combate o bloqueio criativo e a falta de tempo de empreendedores e profissionais de marketing. A aplicação serve como um assistente inteligente "All-in-One" que não apenas sugere ideias, mas executa a criação de ativos digitais completos.

Recentemente atualizado para funcionar como um **PWA (Progressive Web App)**, permitindo uma experiência nativa em dispositivos móveis, com instalação direta e funcionamento offline aprimorado.

## ✨ Funcionalidades Principais

*   **🤖 Gerador de Conteúdo Inteligente**: Crie legendas para Instagram, artigos de blog, e-mails de vendas e roteiros para vídeos em segundos.
*   **🎨 Creative Studio**: Gere imagens exclusivas usando prompts de IA. Inclui **Modelos Sazonais** (Natal, Ano Novo, Black Friday) para criação rápida.
*   **📈 Caçador de Tendências (Trend Hunter)**: Descubra o que está em alta no seu nicho ou região e receba sugestões instantâneas de conteúdo para surfar na onda.
*   **📅 Smart Scheduler**: Um calendário visual para organizar e planejar suas publicações futuras (simulação local).
*   **📱 Experiência Mobile First (PWA)**: Instale o aplicativo no seu celular iOS ou Android. Interface otimizada com barra de navegação inferior e performance nativa.
*   **🗂️ Biblioteca de Conteúdo**: Salve e organize todos os seus criativos gerados em um só lugar.

## 🛠️ Tecnologias Utilizadas

*   **Frontend**: React.js com TypeScript
*   **Build Tool**: Vite
*   **Estilização**: Tailwind CSS (Design System Moderno & Responsivo)
*   **IA / LLM**: Google Gemini API (`gemini-pro`, `gemini-pro-vision`)
*   **Gerenciamento de Estado**: Zustand & TanStack Query
*   **PWA**: Vite PWA Plugin
*   **Backend/Dados**:
    *   Arquitetura preparada para Backend Serverless.
    *   Atualmente operando com **Mock Services** e **Local Storage** para total privacidade e facilidade de teste sem configuração de servidor complexa.

## 🏁 Como Executar Localmente

Siga estes passos para rodar o VitrineX AI na sua máquina:

### Pré-requisitos
*   Node.js (v18 ou superior)
*   NPM ou Yarn

### Instalação

1.  **Clone o repositório**
    ```bash
    git clone https://github.com/seu-usuario/vitrinex-ai.git
    cd vitrinex-ai
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Configuração da API (Opcional)**
    *   O projeto pode rodar com uma chave de teste ou você pode inserir sua própria chave do Google Gemini.
    *   Crie um arquivo `.env` na raiz se desejar configurar variáveis persistentes:
        ```env
        VITE_GEMINI_API_KEY=sua_chave_aqui
        ```
    *   *Nota: A aplicação também permite inserir a chave diretamente via interface nas configurações.*

4.  **Inicie o Servidor de Desenvolvimento**
    ```bash
    npm run dev
    ```

5.  **Acesse a Aplicação**
    *   Abra `http://localhost:3000` (ou a porta indicada no terminal).

## 📱 Instalação PWA (Mobile)

Para testar a experiência mobile:
1.  Acesse a aplicação pelo navegador do seu celular (conectado à mesma rede Wi-Fi, usando o IP da sua máquina ex: `http://192.168.x.x:3000`).
2.  Toque em **"Adicionar à Tela de Início"** ou **"Instalar App"** no menu do navegador.
3.  O VitrineX AI funcionará como um aplicativo nativo.

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Se você tem uma ideia de melhoria ou nova funcionalidade:

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`).
3.  Commit suas mudanças (`git commit -m 'Adicionando Nova Feature'`).
4.  Push para a Branch (`git push origin feature/NovaFeature`).
5.  Abra um Pull Request.

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---
<div align="center">
  <sub>Desenvolvido com 💜 por Jean (VitrineX)</sub>
</div>
