# Sistema de Avaliação — Prova de Prototipação no Figma

Ferramenta de avaliação da prova prática de prototipação no Figma das **Competições Senac** (modalidade Aplicações Web e Mobile), Senac Serra / ES.

**Site:** https://guipetav.github.io/avaliacao-prova-figma/

## O que faz

- Cadastro de **1 a 3 avaliadores** — funciona com um avaliador só
- Cadastro dos **competidores** (nome, turma, serviço criado, links do arquivo e do protótipo)
- Ficha com **21 critérios** avaliados em escala **0 / 1 / 2** (não fez, fez em parte, fez)
- Nota final de 0 a 100, calculada como a média das fichas preenchidas
- Penalidades por atraso na entrega e por uso de template
- Ranking com nota por bloco e observações de cada avaliador
- Exportar e importar os dados em JSON
- **Planilha do Google como banco compartilhado** — os três avaliadores veem a mesma base (veja `COMO-CONECTAR.md`)

## Como a nota é composta

| Bloco | Conteúdo | Pontos |
|---|---|---|
| A | Usabilidade — 10 heurísticas de Nielsen | 50 |
| B | Uso do Figma — componentes, estilos, Auto Layout, protótipo | 20 |
| C | Entrega — seções obrigatórias, versão mobile, prazo | 10 |
| D | Pitch de até 10 minutos — avaliado ao vivo | 20 |

## Como usar

Abra o site, cadastre os avaliadores na primeira tela e escolha quem está usando o computador.

Para que os três avaliadores compartilhem a mesma base, conecte uma planilha do Google seguindo o guia [COMO-CONECTAR.md](COMO-CONECTAR.md). Sem planilha, cada navegador guarda os próprios dados e a consolidação é feita com **Exportar dados** e **Importar dados**.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O sistema inteiro, em um arquivo só |
| `apps-script.gs` | Script que transforma uma planilha do Google em banco de dados |
| `COMO-CONECTAR.md` | Passo a passo da configuração da planilha |

## Licença

Uso educacional. Guilherme Peterlini Tavares — Senac Serra / ES.
