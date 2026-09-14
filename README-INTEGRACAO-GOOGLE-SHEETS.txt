IFsaudavel — Integração da Avaliação com Google Sheets

1. Crie uma planilha Google para armazenar as respostas.
2. Na planilha, abra Extensões > Apps Script.
3. Apague o código existente e cole o conteúdo de google-apps-script.gs.
4. Salve o projeto.
5. Clique em Implantar > Nova implantação > Aplicativo da Web.
6. Execute o aplicativo como você (proprietário do script).
7. Em acesso, escolha a opção que permita que qualquer pessoa com o link acesse.
8. Clique em Implantar e copie a URL que termina em /exec.
9. Abra avaliacao.html e localize:
   const APPS_SCRIPT_URL = 'COLE_AQUI_A_URL_DO_SEU_APPS_SCRIPT';
10. Substitua o texto entre aspas pela URL /exec copiada.
11. Publique novamente os arquivos no GitHub Pages.

O Apps Script cria automaticamente a aba "Respostas" e registra cada avaliação em uma nova linha.

Observação: o site não pede nome, e-mail ou outros dados pessoais. A avaliação foi desenhada para coletar apenas opiniões sobre o projeto.
