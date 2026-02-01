# 💰 DivideCerto

**Divida despesas de casal de forma proporcional à renda. Simples, justo e transparente.**

🔗 **Acesse:** [https://antoniocpinheiro.github.io/dividecerto/](https://antoniocpinheiro.github.io/dividecerto/)

---

## 🎯 **O Problema**

Você divide despesas com alguém, mas suas rendas são diferentes. Dividir meio a meio não é justo. Planilhas ficam confusas e desatualizadas.

## ✨ **A Solução**

DivideCerto calcula automaticamente quanto cada pessoa deve contribuir baseado na proporção de renda, gerencia parcelamentos, marca o que foi pago, e gera extratos detalhados.

---

## 🚀 **Como Funciona**

### **Passo 1: Configure sua Renda**
1. Vá na aba **💵 Renda**
2. Preencha nomes e salários de cada pessoa
3. (Opcional) Adicione auxílios (VA/VR)
4. Clique **Salvar Renda**

O sistema já calcula a proporção automaticamente!

---

### **Passo 2: Cadastre Despesas Compartilhadas**
1. Vá na aba **📋 Despesas CC**
2. Escolha o mês
3. Adicione despesas que saem da conta conjunta:
   - Aluguel, condomínio, luz, internet, etc.
4. Marque se é recorrente (todo mês) ou parcelado

**Dica:** Despesas CC são aquelas pagas pela conta corrente conjunta.

---

### **Passo 3: Cadastre Descontos Individuais**
1. Vá na aba **💳 Descontos**
2. Adicione gastos pessoais de cada um:
   - Cartão de crédito, empréstimos, plano de saúde, etc.
3. Escolha de quem é (Pessoa 1 ou Pessoa 2)

**Dica:** Descontos são valores que saem da conta individual de cada um.

---

### **Passo 4: Veja Quem Deve Quanto**
1. Vá na aba **🧮 Liquidação**
2. Veja instantaneamente:
   - Quanto cada um deve transferir (ou receber)
   - Explicação detalhada dos cálculos

---

### **Passo 5: Marque Como Pago**
1. Conforme for pagando, clique no ✓ ao lado de cada item
2. Itens pagos ficam verdes e menos destacados
3. Veja progresso: "5/8 pagos"

---

## 🎨 **Funcionalidades**

### **Básicas:**
- ✅ Divisão proporcional automática
- ✅ Despesas compartilhadas (Conta Corrente)
- ✅ Descontos individuais (Cartão/Empréstimo)
- ✅ Cálculo de liquidação (quem deve quanto)
- ✅ Extratos individualizados com explicação

### **Avançadas:**
- ✅ Recorrências (copia despesa por N meses)
- ✅ Parcelamentos (divide valor em N vezes)
- ✅ Status Pago/Pendente (confirmação visual)
- ✅ Categorias (alimentação, moradia, etc)
- ✅ Análise por categoria
- ✅ Histórico mês a mês
- ✅ Modo escuro 🌙
- ✅ Cálculo de dias úteis (para VA variável)
- ✅ Gestão de feriados

---

## 💡 **Conceitos Importantes**

### **Despesas CC (Conta Corrente)**
Gastos que saem da conta conjunta e são divididos proporcionalmente.

**Exemplos:** Aluguel, condomínio, luz, internet, supermercado conjunto.

---

### **Descontos**
Gastos pessoais que saem da conta individual de cada um.

**Exemplos:** Cartão de crédito pessoal, empréstimo, plano de saúde individual, academia.

---

### **Proporção de Renda**
Se Pessoa 1 ganha R$ 3.000 e Pessoa 2 ganha R$ 2.000:
- Total: R$ 5.000
- Proporção P1: 60% (3000/5000)
- Proporção P2: 40% (2000/5000)

Se as despesas totais forem R$ 2.000:
- P1 paga: R$ 1.200 (60%)
- P2 paga: R$ 800 (40%)

---

### **Liquidação**
Cálculo final que mostra quanto cada um deve transferir para a conta conjunta.

**Fórmula:**

Obrigação = (Despesas CC + Total Descontos - Saldo CC) × Proporção
Transferência = Obrigação - Seus Descontos

---

## 📱 **Instalação (PWA)**

### **Android:**
1. Abra no Chrome
2. Clique no banner "Adicionar à tela inicial"
3. Ou: Menu (⋮) → "Instalar app"

### **iPhone:**
1. Abra no Safari
2. Botão Compartilhar → "Adicionar à Tela de Início"

---

## 🔒 **Privacidade**

- ✅ **100% offline** - Funciona sem internet após primeiro acesso
- ✅ **Sem backend** - Não tem servidor guardando seus dados
- ✅ **Sem cadastro** - Não pedimos email ou senha
- ✅ **LocalStorage** - Dados ficam só no seu dispositivo
- ✅ **Sem analytics** - Não rastreamos você

**Backup:** Use a função "Exportar Dados" para fazer backup manual (JSON).

---

## ❓ **FAQ**

### **1. É realmente grátis?**
Sim! 100% gratuito e sem anúncios.

### **2. Precisa criar conta?**
Não! Sem cadastro, sem login.

### **3. Meus dados ficam onde?**
No seu próprio dispositivo (navegador). Não vão para nenhum servidor.

### **4. E se eu trocar de celular?**
Use a função "Exportar Dados" para fazer backup e "Importar" no novo dispositivo.

### **5. Funciona offline?**
Sim! Depois do primeiro acesso, funciona sem internet.

### **6. Posso usar com mais de 2 pessoas?**
Por enquanto só para 2 pessoas. Futura versão pode ter mais!

### **7. Tem app na Play Store/App Store?**
Ainda não, mas é um PWA - você pode instalar direto do navegador!

---

## 🛠️ **Tecnologia**

- **Frontend:** HTML5, CSS3, JavaScript ES6+
- **Storage:** LocalStorage (client-side)
- **Deployment:** GitHub Pages
- **PWA:** Service Worker + Web App Manifest

**Stack:** 100% vanilla JavaScript - zero dependências externas!

---

## 🤝 **Feedback**

Sua opinião é muito importante! 

📋 **Formulário:** [https://forms.gle/9an2bA2y3jhiAr6U7](https://forms.gle/9an2bA2y3jhiAr6U7)

---

## 📝 **Licença**

© 2026 DivideCerto - Todos os direitos reservados.

---

## 👨‍💻 **Desenvolvido por**

Antonio Pinheiro  
Porto Alegre, RS, Brasil

---

**Versão:** 20 PWA  
**Última atualização:** 01/02/2026

