# Conectar a planilha do Google

Sem planilha, cada avaliador guarda as fichas no próprio navegador. Com a planilha, os três veem a mesma base e o ranking sai completo. São dez minutos de configuração, feitos **uma vez só** por quem organiza a prova.

## 1. Crie a planilha

Abra [sheets.new](https://sheets.new) e dê um nome, por exemplo `Prova de Figma — Competições Senac`. Não precisa criar aba nem cabeçalho: o script faz isso sozinho.

## 2. Cole o script

Na planilha, vá em **Extensões → Apps Script**. Apague o conteúdo que aparece e cole todo o arquivo `apps-script.gs` deste repositório. Salve com o ícone de disquete.

## 3. Publique como aplicativo da web

Ainda no Apps Script, clique em **Implantar → Nova implantação**.

- Em **Tipo**, escolha **App da Web**.
- Em **Executar como**, deixe **Eu** (sua conta).
- Em **Quem pode acessar**, escolha **Qualquer pessoa**.
- Clique em **Implantar** e autorize o acesso quando o Google pedir. Na tela de aviso, use **Avançado → Acessar (não seguro)** — o aviso aparece porque o script é seu e não passou por revisão do Google.

Copie o endereço que termina em `/exec`. É esse que o site precisa.

> **Quem pode acessar: qualquer pessoa** significa que quem tiver o endereço consegue ler e gravar as notas. O endereço é longo e não fica público em lugar nenhum, mas trate-o como uma senha: mande só para os avaliadores.

## 4. Conecte o site

Abra <https://guipetav.github.io/avaliacao-prova-figma/>, vá na aba **Ajustes**, cole o endereço no campo **Planilha compartilhada** e clique em **Conectar**. No topo da tela deve aparecer a etiqueta verde `planilha` com o horário da última sincronização.

Repita esse passo no computador de cada avaliador. Só isso — a partir daí todos compartilham a mesma base.

## 5. Confira na planilha

Depois da primeira ficha salva, três abas aparecem sozinhas:

- **Competidores** — a lista com links, penalidades e quantas fichas cada um já recebeu
- **Notas** — uma linha por avaliador, com os 21 critérios, os pontos e a observação
- **Ranking** — a classificação final com a nota por bloco

Uma quarta aba, `_dados`, fica oculta: é onde o sistema guarda tudo. Não edite essa aba à mão.

## Como as notas se juntam

Cada avaliador só edita a própria ficha, então o script mescla por competidor e por avaliador — ninguém sobrescreve o trabalho de ninguém, mesmo que salvem ao mesmo tempo. Competidores e avaliadores removidos ficam registrados e não voltam quando outro computador sincroniza.

## Se der errado

**"Não consegui falar com a planilha"** — verifique se o endereço termina em `/exec` e se a implantação está com **Quem pode acessar: qualquer pessoa**.

**Mudei o script e nada mudou** — toda alteração exige uma nova implantação: **Implantar → Gerenciar implantações → ícone de lápis → Versão: Nova versão → Implantar**. O endereço continua o mesmo.

**Quero começar do zero** — apague o conteúdo da célula A1 da aba `_dados`.

**Sem internet no dia da prova** — desconecte a planilha em Ajustes e trabalhe local. Depois cada avaliador exporta o JSON em Resultados e você importa tudo em um computador só.
