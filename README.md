# DivideCerto

## Ajuste da V10 — total do dashboard e saldo da conta conjunta

A Visão Geral agora distingue claramente três valores no fechamento mensal:

- **Gastos**: soma dos lançamentos do mês;
- **Saldo CC**: saldo da conta conjunta daquele mês, preservando o sinal;
- **Valor a dividir**: `Gastos − Saldo CC`.

Assim, um saldo positivo reduz o que o casal precisa aportar e um saldo negativo aumenta o valor a dividir. Exemplo: R$ 16.093,90 de gastos com saldo CC de -R$ 101,00 resulta em **R$ 16.194,90 a dividir**.

Os filtros de pagador, categoria e tipo continuam servindo para analisar os gastos e gráficos. O fechamento financeiro mensal (gastos totais, saldo CC, valor a dividir e desembolsos efetivos) considera o mês completo.


**Divisão proporcional de despesas para casais, com histórico mensal, recorrências, planejamento e visão geral.**

🌐 **Aplicação:** https://antoniocpinheiro.github.io/dividecerto/  
💻 **Código-fonte:** https://github.com/antoniocpinheiro/dividecerto

---

## O que é o DivideCerto?

O **DivideCerto** é uma aplicação web criada para ajudar um casal a dividir as despesas comuns de forma **proporcional à renda líquida de cada pessoa**.

A ideia é simples: em vez de obrigar o casal a dividir tudo em 50/50, o sistema calcula quanto cada pessoa deveria assumir de acordo com a participação de sua renda na renda total do casal.

Além de fazer o acerto mensal, o DivideCerto mantém histórico de rendas e gastos, aceita pagamentos feitos individualmente ou pela conta conjunta, trabalha com despesas únicas, parceladas, contínuas e anuais e oferece uma visão geral com filtros, tabelas e gráficos.

O projeto é uma **PWA (Progressive Web App)** feita somente com HTML, CSS e JavaScript, sem framework e sem backend. Os dados ficam armazenados no navegador do usuário.

---

## Para que ele serve?

O DivideCerto responde principalmente a estas perguntas:

- Quanto cada pessoa representa da renda total do casal neste mês?
- Quanto cada pessoa deveria pagar das despesas comuns?
- Quanto cada um já pagou diretamente?
- Quanto foi pago pela conta conjunta?
- Existe saldo positivo ou negativo na conta conjunta?
- Quem precisa transferir dinheiro e quanto?
- Quanto efetivamente saiu do bolso de cada pessoa depois do acerto?
- Como os gastos e rendas evoluíram ao longo dos meses?
- Quais despesas já estão previstas para os meses seguintes?

> **Importante:** o DivideCerto foi pensado para registrar **despesas do casal**. Uma despesa estritamente pessoal, que não deva participar da divisão, normalmente não deve ser cadastrada como gasto do casal.

---

# Como funciona

## 1. Renda do casal

Cada pessoa informa sua **renda líquida mensal**.

A divisão é sempre proporcional à renda. Não existe opção 50/50 ou percentual manual.

Se as rendas forem:

- Pessoa 1: R$ 8.000,00
- Pessoa 2: R$ 6.000,00

A renda total é R$ 14.000,00 e a participação de cada pessoa será:

```text
Pessoa 1 = 8.000 / 14.000 = 57,14%
Pessoa 2 = 6.000 / 14.000 = 42,86%
```

Esses percentuais são usados para calcular a responsabilidade de cada pessoa naquele mês.

### A renda pode mudar mês a mês

A renda líquida não precisa ser igual todos os meses. Ao alterar uma renda, o usuário pode escolher:

- **Somente este mês** — cria uma exceção apenas no mês selecionado.
- **Este mês e os próximos** — o novo valor passa a valer daquele mês em diante.

Os meses anteriores não são alterados. Assim, o histórico da divisão permanece correto.

---

## 2. Gastos do casal

Cada gasto possui, no mínimo:

- descrição;
- valor;
- mês;
- quem pagou;
- categoria;
- tipo de lançamento.

### Quem pagou

Um gasto pode ter sido pago por:

- **Pessoa 1**;
- **Pessoa 2**;
- **Conta conjunta**.

A conta conjunta não é uma terceira pessoa na divisão. Ela é apenas uma forma pela qual despesas do casal podem ser pagas e um ponto de compensação no acerto.

### Categorias

Atualmente existem as categorias:

- Moradia
- Alimentação
- Transporte
- Saúde
- Educação
- Lazer
- Outros

As categorias podem ser usadas nos filtros do extrato e da Visão Geral.

---

# Tipos de lançamento

## Único

Usado para uma despesa que ocorre uma única vez.

Exemplos:

- compra eventual;
- conserto;
- consulta;
- jantar;
- gasto extraordinário.

---

## Período

Repete o mesmo gasto mensalmente por um intervalo definido.

É útil quando existe uma despesa temporária que se repete por alguns meses, mas não é um parcelamento.

O período pode ser planejado até **dezembro do próximo ano**.

---

## Parcelado

Cria automaticamente as parcelas mensais de uma compra.

Exemplo: uma compra em 4 parcelas gera:

```text
1/4
2/4
3/4
4/4
```

O sistema aceita atualmente parcelamentos de até **48 parcelas**.

As parcelas pertencem à mesma série. Se o **nome** da compra for alterado em uma parcela, o nome é sincronizado em toda a série.

Para alterações de valor, pagador ou categoria, é possível escolher o alcance da edição:

- somente esta ocorrência;
- esta ocorrência e as próximas;
- toda a série.

Isso permite corrigir uma parcela específica sem destruir o histórico das demais.

---

## Contínuo

Usado para uma despesa mensal sem data final conhecida.

Exemplos:

- condomínio;
- internet;
- mensalidade escolar;
- academia;
- assinatura;
- serviço recorrente.

O gasto é cadastrado uma única vez e passa a aparecer automaticamente nos meses seguintes.

### Gastos contínuos com valor variável

O valor pode ser ajustado sem alterar o passado.

Exemplo: condomínio normalmente em R$ 600,00.

- Agosto: R$ 600,00
- Setembro: R$ 590,00
- Outubro: R$ 620,00

Ao editar, existem duas possibilidades:

- **Somente este mês** — altera apenas aquela ocorrência.
- **Este mês e os próximos** — preserva os meses anteriores e passa a usar o novo valor dali em diante.

Uma ocorrência ajustada fica identificada no extrato, permitindo saber qual era o valor-base e qual foi o valor efetivo daquele mês.

Um gasto contínuo também pode ser encerrado. Depois do mês de encerramento ele deixa de aparecer.

---

## Anual

Usado para despesas que voltam uma vez por ano.

Exemplos:

- IPVA;
- IPTU pago à vista;
- seguro anual;
- anuidade;
- licenciamento;
- matrícula anual.

O lançamento reaparece automaticamente no mesmo mês dos anos seguintes.

Como o valor de uma despesa anual costuma variar, as ocorrências futuras ainda não ajustadas são tratadas como **valor previsto**, usando o último valor conhecido.

Ao editar um anual:

- **Somente esta ocorrência** altera apenas aquele ano;
- **Esta ocorrência e os próximos anos** cria um novo valor a partir daquele ponto.

Os anos anteriores permanecem intactos.

---

# Como são feitos os cálculos

## 1. Percentual de participação na renda

Para cada mês:

```text
Renda total = Renda Pessoa 1 + Renda Pessoa 2

Percentual Pessoa 1 = Renda Pessoa 1 / Renda total
Percentual Pessoa 2 = Renda Pessoa 2 / Renda total
```

A soma dos dois percentuais é 100%.

---

## 2. Total de gastos

O sistema soma todos os gastos do casal no mês, independentemente de quem tenha pago:

```text
Total de gastos =
  gastos pagos pela Pessoa 1
+ gastos pagos pela Pessoa 2
+ gastos pagos pela conta conjunta
```

---

## 3. Saldo da conta conjunta

O saldo da conta conjunta é informado **por mês** e pode ser positivo ou negativo.

### Saldo positivo

Representa dinheiro que já está disponível na conta conjunta e pode ser usado como crédito para reduzir o valor que o casal ainda precisa financiar.

Exemplo:

```text
Gastos do mês:                 R$ 16.000,00
Saldo positivo da conta:       R$    500,00
Valor líquido a dividir:       R$ 15.500,00
```

### Saldo negativo

Representa um déficit da conta conjunta que também precisa ser coberto pelo casal.

Exemplo:

```text
Gastos do mês:                 R$ 16.093,90
Saldo negativo da conta:      -R$    101,00
Valor líquido a dividir:       R$ 16.194,90
```

Em termos conceituais:

```text
Valor líquido a dividir = Total de gastos - Saldo da conta conjunta
```

Por isso, subtrair um saldo negativo equivale a somá-lo.

Um saldo positivo nunca faz o valor líquido a dividir ficar abaixo de zero.

> O saldo pertence somente ao mês selecionado. O DivideCerto não transporta automaticamente o saldo de um mês para o seguinte.

---

## 4. Parte proporcional de cada pessoa

Depois de encontrar o valor líquido a dividir:

```text
Parte da Pessoa 1 = Valor líquido × Percentual Pessoa 1
Parte da Pessoa 2 = Valor líquido × Percentual Pessoa 2
```

---

## 5. O que cada um já pagou

Os gastos pagos diretamente por cada pessoa são abatidos de sua responsabilidade:

```text
Saldo Pessoa 1 = Parte proporcional Pessoa 1 - Valor já pago pela Pessoa 1
Saldo Pessoa 2 = Parte proporcional Pessoa 2 - Valor já pago pela Pessoa 2
```

Se o saldo for positivo, a pessoa ainda precisa contribuir.

Se o saldo for negativo, ela pagou mais do que sua parte e deve receber a diferença no acerto.

Dependendo de como as despesas foram pagas, o sistema pode indicar:

- transferência direta entre as duas pessoas; ou
- aportes/devoluções pela conta conjunta.

---

## 6. Desembolso efetivo

A Visão Geral também mostra quanto **realmente saiu do bolso** de cada pessoa após o acerto.

O cálculo é:

```text
Desembolso efetivo =
  gastos pagos pessoalmente
+ transferências feitas no acerto
- valores recebidos no acerto
```

Exemplo:

```text
Pessoa 1 pagou diretamente:    R$ 8.456,89
Recebeu no acerto:             R$   191,49
Desembolso efetivo:            R$ 8.265,40
```

Esse indicador é diferente de simplesmente olhar quem passou o cartão ou pagou o boleto: ele mostra o custo efetivo de cada pessoa depois que a divisão proporcional foi equalizada.

---

# Extrato do mês

O extrato permite consultar os lançamentos do mês selecionado.

É possível filtrar por:

- pessoa que pagou;
- conta conjunta;
- categoria;
- texto da descrição.

O extrato mostra o número de lançamentos e o total correspondente ao filtro atual.

Também pode ser impresso.

---

# Status do mês

O Status do mês apresenta o fechamento financeiro daquele período, incluindo:

- total de gastos;
- quanto cada pessoa pagou diretamente;
- quanto foi pago pela conta conjunta;
- saldo positivo ou negativo da conta conjunta;
- valor líquido a dividir;
- renda de cada pessoa;
- proporção de cada pessoa;
- parte proporcional;
- acerto necessário;
- desembolso efetivo após o acerto.

Existe uma opção específica para **imprimir o status do mês**.

---

# Visão Geral / Dashboard

A Visão Geral permite analisar vários meses de uma só vez.

Os filtros disponíveis incluem:

- período inicial e final;
- quem pagou;
- categoria;
- tipo de lançamento.

O dashboard apresenta:

- total de gastos do período;
- média mensal;
- número de lançamentos;
- mês de maior gasto;
- desembolso acumulado de cada pessoa;
- gráfico de evolução mensal;
- gráfico por categoria;
- tabela mês a mês.

A tabela mensal mostra:

- total do mês;
- gastos pagos pela Pessoa 1;
- gastos pagos pela Pessoa 2;
- gastos pagos pela conta conjunta;
- desembolso efetivo da Pessoa 1;
- desembolso efetivo da Pessoa 2;
- renda de cada pessoa;
- proporção utilizada naquele mês.

### Uma particularidade importante dos filtros

Os filtros da Visão Geral afetam os **gastos, totais e gráficos do recorte**.

O **desembolso efetivo**, porém, continua usando o mês completo e o acerto final. Isso é proposital: se o desembolso fosse recalculado apenas com uma categoria filtrada, ele deixaria de representar quanto realmente saiu do bolso da pessoa naquele mês.

---

# Edição e preservação do histórico

Uma das regras centrais do DivideCerto é **não reescrever o passado sem necessidade**.

Por isso:

- rendas podem mudar somente no mês atual ou daquele mês em diante;
- gastos contínuos podem ter exceções mensais;
- recorrências anuais podem ter valores diferentes em cada ano;
- parcelamentos e repetições por período permitem escolher até onde uma alteração deve valer;
- o nome de um mesmo gasto é mantido consistente em toda a série.

Isso permite usar o sistema tanto para acompanhar o presente quanto para consultar meses anteriores sem que alterações atuais modifiquem os valores históricos.

---

# Valores monetários

Os campos de dinheiro aceitam formatos comuns no Brasil, inclusive ao colar valores de outros sistemas.

Exemplos aceitos:

```text
1.747,20
1747,20
1747.20
R$ 1.747,20
```

Na interface, os valores são apresentados no padrão brasileiro:

```text
R$ 1.747,20
```

---

# Onde os dados são armazenados?

O DivideCerto **não possui servidor de dados, conta de usuário ou banco de dados remoto**.

Os dados são gravados no `localStorage` do navegador.

Chave principal atual:

```text
dividecerto_easy_v1
```

A preferência de tema utiliza:

```text
dividecerto_theme
```

Isso significa que:

- os dados permanecem no navegador usado;
- outra máquina ou outro navegador não recebe os dados automaticamente;
- `localhost` e o site publicado no GitHub Pages possuem armazenamentos separados;
- limpar os dados do site/navegador pode apagar os registros locais.

Por isso, é recomendável fazer backups periódicos.

---

# Backup e restauração

Em **Opções avançadas e backup** é possível exportar todos os dados para um arquivo JSON.

O arquivo recebe um nome semelhante a:

```text
dividecerto-facil-2026-09-10.json
```

Esse arquivo contém a configuração, rendas, histórico, saldos e lançamentos.

A opção **Importar backup** carrega esse JSON novamente no sistema.

> Ao importar um backup válido, os dados ativos daquela instalação do navegador passam a ser os dados contidos no arquivo importado.

O backup também é a forma recomendada de levar os dados do teste local para a versão publicada, ou de um navegador/computador para outro.

---

# Compatibilidade com versões anteriores

O projeto mantém compatibilidade com os dados das versões recentes do DivideCerto Fácil usando a mesma estrutura principal de armazenamento.

Quando não existem dados da versão nova, o sistema também procura a chave da versão antiga:

```text
dividecerto_v20
```

Na migração automática:

- as rendas antigas são convertidas para a renda-base do casal;
- despesas antigas da conta compartilhada são importadas como pagas pela conta conjunta;
- pagamentos individuais são importados como pagos pela respectiva pessoa;
- o saldo antigo da conta conjunta é levado para o mês inicial quando disponível.

A migração cria os dados na estrutura atual sem apagar a chave antiga.

---

# PWA e funcionamento offline

O DivideCerto é uma **Progressive Web App**.

O `service-worker.js` mantém em cache os arquivos essenciais da aplicação para permitir funcionamento mesmo quando a conexão não está disponível, depois que o site já tiver sido carregado ao menos uma vez.

A estratégia atual tenta buscar a versão mais recente dos arquivos na rede e usa o cache como alternativa quando a rede falha.

Ao publicar uma nova versão, pode ser necessário fazer uma atualização forçada no navegador (`Ctrl+F5`) para garantir que todos os arquivos novos sejam carregados.

---

# Arquivos do projeto

O projeto é propositalmente pequeno e não possui etapa de compilação.

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da aplicação. Contém formulários, cards, extrato, status mensal, dashboard e elementos da interface. |
| `styles.css` | Aparência e layout. Controla cores, responsividade, uso de telas largas e estilos de impressão. |
| `script.js` | Coração da aplicação. Contém armazenamento, cálculos, rendas, gastos, recorrências, parcelamentos, filtros, dashboard, gráficos, edição, migração e backup. |
| `manifest.json` | Configuração da PWA: nome, idioma, cores, modo de exibição e página inicial. |
| `service-worker.js` | Gerencia o cache dos arquivos da aplicação e permite funcionamento offline/fallback quando não há rede. |
| `INICIAR.bat` | Atalho para testar o projeto localmente no Windows usando um servidor HTTP na porta 8000. Não é necessário para o GitHub Pages. |
| `README.md` | Esta documentação: explica o objetivo, funcionamento, cálculos, estrutura e forma de executar o projeto. |

---

# Arquitetura

A aplicação foi construída com tecnologias nativas do navegador:

```text
HTML
CSS
JavaScript puro (Vanilla JS)
Canvas 2D para os gráficos
localStorage para persistência
Service Worker + Web App Manifest para PWA
```

Não são utilizados:

- frameworks JavaScript;
- bibliotecas externas de gráficos;
- banco de dados;
- servidor de aplicação;
- API externa;
- processo de build.

Por isso, o projeto pode ser hospedado diretamente como site estático no GitHub Pages.

---

# Executar localmente

## Windows — forma rápida

Dê dois cliques em:

```text
INICIAR.bat
```

Ele abre o navegador em:

```text
http://localhost:8000
```

## Manualmente

Dentro da pasta do projeto, execute:

```powershell
python -m http.server 8000
```

ou, em instalações do Windows que usam o launcher do Python:

```powershell
py -m http.server 8000
```

Depois abra:

```text
http://localhost:8000
```

Para encerrar o servidor, pressione `Ctrl+C` no terminal.

> Abrir apenas o `index.html` com duplo clique não é o modo recomendado, porque recursos de PWA e Service Worker dependem de um contexto HTTP/HTTPS apropriado.

---

# Publicação no GitHub Pages

Como o projeto é totalmente estático, basta publicar os arquivos do projeto no repositório configurado para o GitHub Pages.

Aplicação atual:

https://antoniocpinheiro.github.io/dividecerto/

Repositório:

https://github.com/antoniocpinheiro/dividecerto

Os arquivos necessários para a aplicação publicada são:

```text
index.html
styles.css
script.js
manifest.json
service-worker.js
```

O `README.md` documenta o repositório e o `INICIAR.bat` existe apenas para facilitar testes locais no Windows.

---

# Ao criar uma nova versão

Como o projeto utiliza Service Worker, ao alterar arquivos da aplicação é recomendável também atualizar a identificação do cache em `service-worker.js`.

Exemplo:

```javascript
const CACHE_NAME = 'dividecerto-facil-v10';
```

Também existem parâmetros de versão no carregamento de CSS e JavaScript no `index.html`, por exemplo:

```html
<link rel="stylesheet" href="styles.css?v=10">
<script src="script.js?v=10"></script>
```

Ao criar uma nova versão, atualizar esses identificadores ajuda o navegador a buscar os arquivos novos em vez de reutilizar conteúdo antigo em cache.

---

# Versão documentada

Este README descreve o comportamento do **DivideCerto Fácil V10**.

Principais características consolidadas até esta versão:

- divisão sempre proporcional à renda mensal;
- histórico de renda sem alterar meses anteriores;
- saldo mensal positivo ou negativo da conta conjunta;
- gastos únicos;
- repetição por período;
- parcelamentos;
- gastos contínuos;
- recorrências anuais;
- edição com preservação de histórico;
- sincronização do nome de gastos pertencentes à mesma série;
- extrato mensal com filtros;
- impressão do extrato e do status mensal;
- dashboard com tabelas e gráficos;
- cálculo do desembolso efetivo de cada pessoa;
- entrada de valores no padrão monetário brasileiro;
- backup e restauração em JSON;
- funcionamento como PWA;
- migração de dados da estrutura antiga.

---

## Objetivo do projeto

O DivideCerto não pretende substituir um sistema bancário ou uma ferramenta completa de contabilidade doméstica. Seu foco é resolver bem um problema específico:

> **registrar os gastos comuns de um casal, preservar o histórico e calcular de forma transparente quanto cada pessoa deve assumir de acordo com sua renda.**

