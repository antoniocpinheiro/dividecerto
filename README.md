# 💰 DivideCerto

> Sistema inteligente de divisão proporcional de despesas para casais

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/antoniocpinheiro/dividecerto?style=social)](https://github.com/antoniocpinheiro/dividecerto)
[![PWA](https://img.shields.io/badge/PWA-Ready-success)](https://antoniocpinheiro.github.io/dividecerto/)

**🔗 Acesse agora:** [https://antoniocpinheiro.github.io/dividecerto/](https://antoniocpinheiro.github.io/dividecerto/)

---

## 🎯 **Sobre o Projeto**

**DivideCerto** é uma aplicação web progressiva (PWA) que simplifica a divisão de despesas entre casais com rendas diferentes.

### **O Problema**

Dividir despesas "meio a meio" é injusto quando as rendas são diferentes. Planilhas são complexas e difíceis de manter.

### **A Solução**

Sistema automatizado que:
- ✅ Calcula divisão proporcional baseada em renda
- ✅ Registra quem pagou o quê (conta pessoal ou conjunta)
- ✅ Calcula automaticamente quem deve transferir quanto
- ✅ Funciona offline, dados 100% privados (no seu dispositivo)

---

## ✨ **Funcionalidades**

| Recurso | Descrição |
|---------|-----------|
| 💸 **Divisão Proporcional** | Calcula automaticamente baseado na renda de cada um |
| 🏦 **Despesas CC** | Controle de gastos que saem da conta compartilhada |
| 💳 **Pagamentos Individuais** | Registra despesas pagas em contas/cartões pessoais |
| 🧮 **Liquidação Automática** | Calcula quem deve transferir quanto (com explicação detalhada) |
| 📊 **Extratos Personalizados** | Veja seus gastos e obrigações mês a mês |
| 📈 **Análise por Categoria** | Gráficos de pizza mostrando distribuição de gastos |
| 📅 **Gestão de Feriados** | Cálculo automático de dias úteis (para VA/VR) |
| 📱 **PWA** | Instala no celular, funciona offline |
| 🔒 **Privacidade Total** | Dados salvos apenas no seu dispositivo |
| 💾 **Backup/Restore** | Exporta/importa dados em JSON |
| 🌙 **Modo Escuro** | Interface adaptável ao tema do sistema |

---

## 🚀 **Como Usar**

### **Passo 1: Configure as Rendas**

1. Acesse **💼 Renda**
2. Preencha:
   - Nome de cada pessoa
   - Salário mensal
   - Vale Alimentação (VA)
3. O sistema calcula automaticamente a **proporção** (ex: 60% / 40%)
4. Clique em **💾 Salvar Renda**

**💡 Dica:** O gráfico de pizza mostra visualmente a proporção de cada um.

---

### **Passo 2: Registre Despesas CC (Conta Compartilhada)**

1. Vá na aba **🏦 Despesas CC**
2. Adicione despesas que **saem da conta conjunta**:
   - Aluguel
   - Condomínio
   - Contas de consumo (se debitadas da conta conjunta)
   - Compras com cartão da conta conjunta

**💡 O que registrar aqui:**
- ✅ Qualquer gasto que sai da conta compartilhada (CEF/Nubank conjunto/etc)

**❌ O que NÃO registrar aqui:**
- Gastos pagos em conta/cartão pessoal → vai em "Pagamentos Individuais"

---

### **Passo 3: Cadastre Pagamentos Individuais**

1. Vá na aba **💳 Pagamentos Individuais**
2. Adicione **despesas compartilhadas** que foram pagas **integralmente** por uma pessoa na conta/cartão pessoal

**💡 O que são Pagamentos Individuais?**

São despesas do casal que **uma pessoa pagou sozinha** (100% do valor) na conta/cartão pessoal, mas que **deveriam ser divididas proporcionalmente** entre o casal.

**Por que acontece?**
- A pessoa estava com o carro e pagou o mecânico no cartão dela
- Só um tinha o cartão na mão e pagou o mercado
- A conta tem débito automático na conta pessoal de um dos dois

---

**📌 Exemplos práticos:**

| Situação | Valor | Como registrar |
|----------|-------|---------------|
| **Ela** pagou mecânico no cartão pessoal | R$ 1.000 | ✅ Pagamento Individual: **Ela** / R$ 1.000 |
| **Ele** pagou mercado no Pix da conta dele | R$ 500 | ✅ Pagamento Individual: **Ele** / R$ 500 |
| **Ela** pagou conta de luz (débito conta dela) | R$ 800 | ✅ Pagamento Individual: **Ela** / R$ 800 |
| **Ele** pagou condomínio (boleto conta dele) | R$ 2.000 | ✅ Pagamento Individual: **Ele** / R$ 2.000 |

---

**🧮 Como funciona o cálculo?**

**Cenário:**
- **Proporção de renda:** Ela 60% / Ele 40%
- **Ela pagou:** R$ 1.000 do mecânico no cartão pessoal

**O que acontece:**
1. Ela pagou **R$ 1.000** (100% do gasto)
2. Mas deveria pagar apenas **R$ 600** (60% de R$ 1.000)
3. Ele deveria pagar **R$ 400** (40% de R$ 1.000)

**Resultado na Liquidação:**
- Sistema desconta **R$ 600** do que ela deve (a parte dela já está paga)
- Sistema adiciona **R$ 400** ao que ele deve transferir (para reembolsá-la)
- **Ela recebe R$ 400 de volta** ✅

---

**⚠️ O QUE NÃO REGISTRAR AQUI:**

### ❌ **Gastos exclusivos de uma pessoa**

| Exemplo | Por quê? |
|---------|----------|
| Academia só dela | Não é gasto compartilhado |
| Roupas dele | Não é gasto compartilhado |
| Presente pessoal | Não é gasto compartilhado |
| Bar com amigos dele | Não é gasto compartilhado |

### ❌ **Despesas que já saíram da conta compartilhada (CC)**

| Exemplo | Onde registrar |
|---------|---------------|
| Aluguel debitado da conta conjunta | 🏦 **Despesas CC** |
| Luz debitada da conta conjunta | 🏦 **Despesas CC** |
| Condomínio pago pela conta conjunta | 🏦 **Despesas CC** |

---

**🎯 Regra de ouro:**

```
┌─────────────────────────────────────────────┐
│  Pagou 100% sozinho (conta/cartão pessoal)  │
│  de uma despesa compartilhada?              │
│                                             │
│  → Registra em 💳 Pagamentos Individuais    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Saiu da conta conjunta (CC)?               │
│                                             │
│  → Registra em 🏦 Despesas CC               │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Gasto só seu (não compartilhado)?          │
│                                             │
│  → NÃO registra em lugar nenhum            │
└─────────────────────────────────────────────┘
```

---

### **Passo 4: Veja Quem Deve Quanto**

1. Vá na aba **🧮 Liquidação**
2. Veja instantaneamente:
   - Quanto cada um deve transferir (ou receber)
   - Explicação detalhada dos cálculos passo a passo
   - Total de despesas compartilhadas
   - Proporção de cada um

**💡 Dica:** A explicação mostra exatamente como o valor foi calculado, deixando tudo transparente!

---

### **Passo 5: Marque Como Pago**

1. Conforme for pagando, clique no **✓** ao lado de cada item
2. Itens pagos ficam verdes e menos destacados
3. Veja o progresso: **"5/8 pagos"**

**💡 Dica:** Isso ajuda a controlar o que já foi quitado no mês.

---

## 💡 **Exemplos Práticos**

### **Cenário 1: Mecânico pago no cartão pessoal**

**Situação:**
- João e Maria dividem despesas 60% / 40%
- Maria pagou R$ 1.000 do mecânico no cartão pessoal dela

**Como registrar:**
1. Acesse **💳 Pagamentos Individuais**
2. Selecione **Maria**
3. Descrição: "Mecânico - Troca de pastilhas"
4. Valor: R$ 1.000,00
5. Categoria: Transporte
6. Marque como "Pago"

**Resultado na Liquidação:**
- Maria já pagou R$ 1.000
- Mas deveria pagar apenas R$ 600 (60%)
- João deve transferir R$ 400 para Maria (os 40% dele)

---

### **Cenário 2: Conta de luz no débito automático**

**Situação:**
- A conta de luz (R$ 250) sai no débito automático da conta pessoal de João

**Como registrar:**
1. Acesse **💳 Pagamentos Individuais**
2. Selecione **João**
3. Descrição: "Conta de Luz - Janeiro/2026"
4. Valor: R$ 250,00
5. Categoria: Moradia
6. Marque como "Pago"

**Resultado na Liquidação:**
- João já pagou R$ 250
- Mas deveria pagar apenas R$ 100 (40%)
- Maria deve transferir R$ 150 para João (os 60% dela)

---

### **Cenário 3: Mês completo (exemplo real)**

**Proporção:** Maria 60% / João 40%

**Despesas do mês:**
- R$ 2.000 - Aluguel (conta conjunta) → **Despesas CC**
- R$ 1.000 - Mecânico (cartão Maria) → **Pagamentos Individuais Maria**
- R$ 500 - Mercado (Pix João) → **Pagamentos Individuais João**
- R$ 800 - Luz (débito conta Maria) → **Pagamentos Individuais Maria**
- R$ 300 - Internet (conta conjunta) → **Despesas CC**

**Total:** R$ 4.600

**Liquidação:**

**Maria (60%):**
- Deveria pagar: R$ 2.760 (60% de R$ 4.600)
- Já pagou: R$ 1.800 (mecânico + luz)
- **Deve transferir: R$ 960 para conta conjunta**

**João (40%):**
- Deveria pagar: R$ 1.840 (40% de R$ 4.600)
- Já pagou: R$ 500 (mercado)
- **Deve transferir: R$ 1.340 para conta conjunta**

**Conta Conjunta:**
- Recebe de Maria: R$ 960
- Recebe de João: R$ 1.340
- Total recebido: R$ 2.300
- Já saiu: R$ 2.300 (aluguel + internet)
- **Saldo final: R$ 0** ✅

---

## ❓ **Perguntas Frequentes (FAQ)**

<details>
<summary><strong>1. Qual a diferença entre "Despesas CC" e "Pagamentos Individuais"?</strong></summary>

<br>

**Despesas CC (Conta Corrente):**
- Gastos que **saem da conta compartilhada** (CEF/CC)
- Exemplo: Aluguel debitado da conta conjunta

**Pagamentos Individuais:**
- Despesas compartilhadas que **uma pessoa pagou sozinha** (100%) na conta/cartão pessoal
- Exemplo: Ela pagou o mecânico (R$ 1.000) no cartão dela

**Resumo em tabela:**

| Tipo | De onde saiu? | Quem pagou? | Onde registrar? |
|------|--------------|-------------|-----------------|
| Aluguel | Conta conjunta | Conta conjunta | 🏦 Despesas CC |
| Mecânico | Cartão dela | Ela (100%) | 💳 Pagamentos Individuais dela |
| Mercado | Pix dele | Ele (100%) | 💳 Pagamentos Individuais dele |

</details>

<details>
<summary><strong>2. Devo registrar gastos só meus?</strong></summary>

<br>

**NÃO!** ❌

O sistema é para despesas **compartilhadas**.

| Gasto | Registrar? |
|-------|-----------|
| Mercado (casa toda) | ✅ SIM |
| Mecânico (carro do casal) | ✅ SIM |
| Contas da casa | ✅ SIM |
| Academia dela | ❌ NÃO |
| Roupas dele | ❌ NÃO |
| Presente pessoal | ❌ NÃO |
| Bar com amigos | ❌ NÃO |

</details>

<details>
<summary><strong>3. Por que preciso registrar Pagamentos Individuais?</strong></summary>

<br>

**Situação real:**

Você e seu parceiro dividem despesas **60% / 40%** (baseado na renda).

**Durante o mês:**
- Ela pagou R$ 1.000 do mecânico (cartão dela)
- Ele pagou R$ 500 do mercado (Pix dele)
- Ela pagou R$ 800 da luz (débito conta dela)

**❌ Sem registrar:**
- Ela gastou R$ 1.800 sozinha
- Ele gastou R$ 500 sozinho
- **INJUSTO!** Ela pagou muito mais.

**✅ Registrando corretamente:**

Sistema calcula:

**Ela (60%):**
- Pagou: R$ 1.800
- Deveria pagar: 60% de R$ 2.300 = R$ 1.380
- Pagou R$ 420 a mais → **Deve receber R$ 420**

**Ele (40%):**
- Pagou: R$ 500
- Deveria pagar: 40% de R$ 2.300 = R$ 920
- Pagou R$ 420 a menos → **Deve transferir R$ 420 para ela**

**Resultado:** Divisão justa! ✅

</details>

<details>
<summary><strong>4. Como funciona a liquidação?</strong></summary>

<br>

O sistema calcula automaticamente:

**1. Total de despesas compartilhadas:**
- Despesas CC (conta conjunta)
- Pagamentos Individuais (contas pessoais)

**2. Quanto cada um deveria pagar:**
- Baseado na proporção de renda (ex: 60% / 40%)

**3. Quanto cada um JÁ pagou:**
- Pagamentos Individuais registrados

**4. Diferença:**
- Quem pagou mais → recebe de volta
- Quem pagou menos → transfere a diferença

**5. Resultado:**
- Mostra quanto transferir (ou receber)
- Explicação passo a passo detalhada

</details>

<details>
<summary><strong>5. Posso usar para mais de 2 pessoas?</strong></summary>

<br>

Atualmente o sistema é otimizado para **casais** (2 pessoas).

Para 3+ pessoas, o cálculo proporcional fica mais complexo e não é suportado no momento.

</details>

<details>
<summary><strong>6. Meus dados são salvos em servidor?</strong></summary>

<br>

**NÃO!** ❌

Todos os dados ficam salvos **apenas no seu dispositivo** (LocalStorage do navegador).

✅ **Vantagens:**
- Privacidade total (ninguém tem acesso aos seus dados)
- Funciona offline
- Sem cadastro/login
- Sem custos de servidor

⚠️ **Cuidado:**
- Se limpar dados do navegador, perde tudo
- Dados não sincronizam entre dispositivos
- **Recomendação:** Exporte backup regularmente!

</details>

<details>
<summary><strong>7. Como faço backup dos dados?</strong></summary>

<br>

**Exportar:**
1. Vá na aba **⚙️ Configurações**
2. Clique em **"📥 Exportar Dados"**
3. Salve o arquivo `.json` em local seguro (Google Drive, Dropbox, etc)

**Importar:**
1. Vá na aba **⚙️ Configurações**
2. Clique em **"📤 Importar Dados"**
3. Selecione o arquivo `.json` salvo anteriormente

**📅 Recomendação:** Faça backup mensalmente ou sempre que mudar de dispositivo!

</details>

<details>
<summary><strong>8. Posso acessar de qualquer dispositivo?</strong></summary>

<br>

Sim, a aplicação funciona em qualquer dispositivo (celular, tablet, computador).

**MAS:** Os dados **NÃO sincronizam automaticamente** entre dispositivos.

**Opções:**

**A) Use sempre o mesmo dispositivo** (recomendado)
- Instale como PWA no celular
- Dados ficam salvos localmente

**B) Transfira dados manualmente**
- Exporte do dispositivo 1
- Importe no dispositivo 2

**C) Escolha um dispositivo "principal"**
- Use os outros apenas para consulta
- Faça alterações só no principal

</details>

<details>
<summary><strong>9. O que é "Saldo CC"?</strong></summary>

<br>

É o **saldo inicial** da conta compartilhada no início do mês.

**Exemplo 1 (saldo positivo):**
- Conta conjunta tem R$ 500 no dia 1º
- Durante o mês: R$ 2.000 de despesas
- Saldo final: R$ 500 - R$ 2.000 = -R$ 1.500
- Cada um deposita conforme proporção para zerar

**Exemplo 2 (saldo negativo):**
- Conta conjunta está -R$ 200 no dia 1º (gastaram mais que depositaram)
- Durante o mês: R$ 1.000 de despesas
- Total a cobrir: R$ 200 + R$ 1.000 = R$ 1.200
- Cada um deposita conforme proporção

**Dica:** Mantenha a conta conjunta sempre zerada no início do mês!

</details>

<details>
<summary><strong>10. Como instalar como aplicativo no celular?</strong></summary>

<br>

O DivideCerto é uma **PWA** (Progressive Web App), pode ser instalado como app!

**Android (Chrome):**
1. Acesse [https://antoniocpinheiro.github.io/dividecerto/](https://antoniocpinheiro.github.io/dividecerto/)
2. Toque no menu (3 pontos)
3. Selecione "Adicionar à tela inicial" ou "Instalar app"
4. Pronto! Ícone aparece na tela inicial

**iPhone (Safari):**
1. Acesse [https://antoniocpinheiro.github.io/dividecerto/](https://antoniocpinheiro.github.io/dividecerto/)
2. Toque no botão de compartilhar (quadrado com seta)
3. Selecione "Adicionar à Tela de Início"
4. Pronto! Ícone aparece na tela inicial

**Vantagens:**
- ✅ Funciona offline
- ✅ Abre como app nativo
- ✅ Não ocupa espaço (como app da loja)

</details>

<details>
<summary><strong>11. Posso usar para controlar despesas de roommates/amigos?</strong></summary>

<br>

Sim! Apesar de ser otimizado para casais, funciona para qualquer dupla que divide despesas:

- ✅ Amigos dividindo apartamento
- ✅ Irmãos morando juntos
- ✅ Colegas de trabalho dividindo despesas

Basta configurar as rendas e usar normalmente!

</details>

<details>
<summary><strong>12. Como reportar bugs ou sugerir melhorias?</strong></summary>

<br>

**Opção 1: GitHub Issues (recomendado)**
- Abra uma [Issue no GitHub](https://github.com/antoniocpinheiro/dividecerto/issues)
- Descreva o problema ou sugestão
- Inclua prints se possível

**Opção 2: Formulário de Feedback**
- Preencha o [formulário](https://forms.gle/9an2bA2y3jhiAr6U7)
- Leva apenas 2 minutos

**Opção 3: Pull Request**
- Fork o projeto
- Faça as melhorias
- Envie um PR

Toda contribuição é bem-vinda! 🙏

</details>

---

## 🛠️ **Tecnologia**

### **Stack**

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Storage:** LocalStorage (client-side)
- **Deployment:** GitHub Pages
- **PWA:** Service Worker + Web App Manifest

**100% vanilla JavaScript** - zero dependências externas! 🎯

### **Arquitetura**

```
dividecerto/
├── index.html          # Interface principal
├── script.js           # Lógica da aplicação
├── styles.css          # Estilos
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker (cache offline)
└── README.md          # Documentação
```

### **Recursos Técnicos**

- ✅ Responsive design (mobile-first)
- ✅ Dark mode automático
- ✅ LocalStorage para persistência
- ✅ PWA installable
- ✅ Offline-first
- ✅ Zero dependências
- ✅ < 50KB total (super leve!)

---

## 🤝 **Contribuindo**

Contribuições são muito bem-vindas! 🎉

### **Como contribuir:**

1. **Fork** o projeto
2. Crie uma **branch** para sua feature:
   ```bash
   git checkout -b feature/MinhaFeature
   ```
3. **Commit** suas mudanças:
   ```bash
   git commit -m 'Add: nova funcionalidade X'
   ```
4. **Push** para a branch:
   ```bash
   git push origin feature/MinhaFeature
   ```
5. Abra um **Pull Request**

### **Ideias de contribuição:**

- 🐛 Reportar bugs
- ✨ Sugerir novas funcionalidades
- 📝 Melhorar documentação
- 🎨 Melhorar UI/UX
- 🧪 Adicionar testes
- 🌐 Traduzir para outros idiomas

---

## 📄 **Licença**

Este projeto está sob a licença MIT.

Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 **Contato**

- **GitHub:** [@antoniocpinheiro](https://github.com/antoniocpinheiro)
- **Repositório:** [github.com/antoniocpinheiro/dividecerto](https://github.com/antoniocpinheiro/dividecerto)
- **Feedback:** [Formulário (2 min)](https://forms.gle/9an2bA2y3jhiAr6U7)

---

## 🙏 **Agradecimentos**

Obrigado a todos que testaram, deram feedback e contribuíram para melhorar o DivideCerto!

---

## ⭐ **Gostou do projeto?**

Se este projeto te ajudou, considere:
- ⭐ Dar uma estrela no GitHub
- 📢 Compartilhar com amigos
- 💬 Deixar feedback
- 🤝 Contribuir com código

---

<div align="center">

**Feito com ❤️ para facilitar a vida de casais**

[🏠 Voltar ao topo](#-dividecerto)

</div>
