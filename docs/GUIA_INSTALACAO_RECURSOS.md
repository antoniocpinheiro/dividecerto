# 📦 Guia de Instalação dos Recursos do NotebookLM

Este guia explica como integrar os materiais criados pelo NotebookLM ao projeto DivideCerto.

---

## 📂 Estrutura de Arquivos Final

```
dividecerto/
├── index.html
├── script.js
├── styles.css
├── manifest.json
├── service-worker.js
├── README.md  ← ATUALIZAR
├── docs/  ← CRIAR ESTA PASTA
│   ├── DivideCerto_Infografico.png  ← ~1.3 MB (GitHub)
│   ├── DivideCerto_Apresentacao.pdf  ← ~14 MB (GitHub)
│   └── PODCAST_TRANSCRIPT.md  ← Transcrição
├── icons/
│   └── icon-192.png
└── LINKS_EXTERNOS.md  ← Referência
```

**Arquivos grandes hospedados externamente:**
- 🎥 **Vídeo:** [YouTube](https://youtu.be/k9joMAI-4rU) (~32 MB)
- 🎙️ **Podcast:** [SoundCloud](https://on.soundcloud.com/gGJcff6LtReaiZgZBY) (~27 MB)

---

## 🚀 Passo a Passo

### **1. Criar pasta `docs/`**

```bash
mkdir docs
```

### **2. Adicionar apenas arquivos pequenos ao GitHub**

```bash
# Copie APENAS estes 2 arquivos para docs/:
cp DivideCerto_Infografico.png docs/
cp DivideCerto_Apresentacao.pdf docs/
cp PODCAST_TRANSCRIPT.md docs/
```

**⚠️ NÃO adicione ao Git:**
- ❌ DivideCerto_Video.mp4 (32 MB) → Já está no YouTube
- ❌ DivideCerto_Podcast.m4a (27 MB) → Já está no SoundCloud

### **3. Criar arquivo de referência dos links externos**

```bash
# Criar LINKS_EXTERNOS.md na raiz
cat > LINKS_EXTERNOS.md << 'EOF'
# 🔗 Links dos Recursos Externos

## Arquivos Hospedados Externamente

### 🎥 Vídeo Tutorial
- **Plataforma:** YouTube
- **URL:** https://youtu.be/k9joMAI-4rU
- **Tamanho original:** ~32 MB
- **Duração:** [duração do vídeo]

### 🎙️ Podcast Explicativo
- **Plataforma:** SoundCloud
- **URL:** https://on.soundcloud.com/gGJcff6LtReaiZgZBY
- **Tamanho original:** ~27 MB
- **Duração:** ~8 minutos

---

## Por que Externo?

GitHub limita uploads via web a **25 MB por arquivo**.
Hospedar em plataformas especializadas oferece:
- ✅ Melhor performance (CDN)
- ✅ Estatísticas de visualização
- ✅ Embed profissional
- ✅ Streaming otimizado
EOF
```

### **4. Atualizar README.md**

Adicione a seção "Recursos de Aprendizado" **ANTES** da seção "Tecnologia":

```markdown
[... conteúdo existente do README ...]

## 🎬 Recursos de Aprendizado

### 📊 Infográfico Completo

![DivideCerto - Como Funciona](docs/DivideCerto_Infografico.png)

### 🎙️ Podcast Explicativo (8 min)

**🎧 [Ouça no SoundCloud](https://on.soundcloud.com/gGJcff6LtReaiZgZBY)**

<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" 
src="https://w.soundcloud.com/player/?url=https%3A//on.soundcloud.com/gGJcff6LtReaiZgZBY&color=%23208090&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"></iframe>

**Destaques:**
- Por que a divisão 50/50 é injusta
- Diferença entre "Despesas CC" e "Pagamentos Individuais"
- O caso do mecânico explicado (R$ 1.000)
- Privacidade total: LocalStorage, sem servidores

📝 **[Ler Transcrição Completa](docs/PODCAST_TRANSCRIPT.md)**

### 🎥 Vídeo Tutorial

**▶️ [Assistir no YouTube](https://youtu.be/k9joMAI-4rU)**

[![Tutorial DivideCerto](https://img.youtube.com/vi/k9joMAI-4rU/maxresdefault.jpg)](https://youtu.be/k9joMAI-4rU)

### 📽️ Apresentação de Slides

**📊 [Baixar Apresentação (PDF)](docs/DivideCerto_Apresentacao.pdf)**

[... resto do README ...]
```

### **5. Expandir FAQ no README.md**

Adicione as novas perguntas (13-19) na seção FAQ existente.

*(Copie de FAQ_EXPANDIDA.md)*

### **6. Commit e push**

```bash
# Adicionar arquivos
git add docs/ README.md LINKS_EXTERNOS.md

# Verificar o que será commitado
git status

# Commit
git commit -m "docs: adiciona recursos visuais do NotebookLM

- Infográfico PNG (1.3 MB)
- Apresentação PDF (14 MB)
- Transcrição do podcast
- Links para vídeo (YouTube) e podcast (SoundCloud)
- FAQ expandida com 7 novas perguntas"

# Push
git push origin main
```

---

## 🎨 Opcional: Criar Aba "Recursos" no Site

### **Adicionar botão na navegação (index.html):**

```html
<div class="tabs">
    <!-- ... botões existentes ... -->
    <button class="tab" onclick="switchTab('recursos')">📚 Recursos</button>
    <button class="tab" onclick="switchTab('backup')">💾 Backup</button>
</div>
```

### **Criar conteúdo da aba:**

```html
<!-- Tab Recursos -->
<div id="recursos" class="tab-content">
    <div class="card">
        <h2 class="card-title">📚 Recursos de Aprendizado</h2>

        <div style="margin-bottom: 30px;">
            <h3 style="color: var(--primary-color); margin-bottom: 15px;">📊 Infográfico</h3>
            <img src="docs/DivideCerto_Infografico.png" 
                 alt="Infográfico DivideCerto" 
                 style="width: 100%; max-width: 800px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="margin-top: 10px; color: var(--text-secondary); font-size: 0.9rem;">
                Visualização completa: problema, solução e como funciona em 3 passos.
            </p>
        </div>

        <div style="margin-bottom: 30px;">
            <h3 style="color: var(--primary-color); margin-bottom: 15px;">🎙️ Podcast (8 min)</h3>
            <iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" 
                    src="https://w.soundcloud.com/player/?url=https%3A//on.soundcloud.com/gGJcff6LtReaiZgZBY&color=%23208090&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"></iframe>
            <p style="margin-top: 15px; color: var(--text-primary); line-height: 1.6;">
                Conversa detalhada sobre a filosofia do projeto, explicação passo a passo e impacto na relação.
            </p>
            <div style="margin-top: 15px;">
                <a href="docs/PODCAST_TRANSCRIPT.md" target="_blank" 
                   style="color: var(--primary-color); text-decoration: none; font-weight: 600;">
                    📝 Ler transcrição completa →
                </a>
            </div>
        </div>

        <div style="margin-bottom: 30px;">
            <h3 style="color: var(--primary-color); margin-bottom: 15px;">🎥 Vídeo Tutorial</h3>
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 10px;">
                <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                        src="https://www.youtube.com/embed/k9joMAI-4rU" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen></iframe>
            </div>
            <p style="margin-top: 15px; color: var(--text-primary); line-height: 1.6;">
                Vídeo narrado mostrando o passo a passo completo do sistema.
            </p>
        </div>

        <div style="margin-bottom: 30px;">
            <h3 style="color: var(--primary-color); margin-bottom: 15px;">📽️ Apresentação de Slides</h3>
            <a href="docs/DivideCerto_Apresentacao.pdf" target="_blank" class="btn btn-primary">
                📊 Baixar Apresentação (PDF - 14 MB)
            </a>
            <p style="margin-top: 15px; color: var(--text-secondary); font-size: 0.9rem;">
                Apresentação completa com exemplos práticos, diagramas e a lógica do sistema.
            </p>
        </div>

        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
                    padding: 20px; border-radius: 10px; border-left: 4px solid #0284c7;">
            <h3 style="color: #0c4a6e; margin: 0 0 10px 0;">💡 Dica</h3>
            <p style="margin: 0; color: #075985; line-height: 1.6;">
                Comece pelo <strong>infográfico</strong> para visão geral, 
                depois ouça o <strong>podcast</strong> para entender a filosofia, 
                e finalize com o <strong>vídeo</strong> para ver na prática!
            </p>
        </div>
    </div>
</div>
```

---

## ✅ Checklist de Verificação

- [ ] Pasta `docs/` criada
- [ ] Infográfico PNG adicionado (não JPG!)
- [ ] Apresentação PDF adicionada
- [ ] Transcrição do podcast adicionada
- [ ] LINKS_EXTERNOS.md criado (referência)
- [ ] Seção "Recursos" adicionada no README.md
- [ ] FAQ expandida (perguntas 13-19) no README.md
- [ ] Aba "Recursos" criada no index.html (opcional)
- [ ] Commit com mensagem descritiva
- [ ] Push para GitHub
- [ ] Verificar se infográfico aparece no README
- [ ] Testar embed do SoundCloud no README
- [ ] Testar thumbnail do YouTube (clicável)

---

## 📊 Arquivos no Repositório GitHub

| Arquivo | Tamanho | Localização |
|---------|---------|-------------|
| DivideCerto_Infografico.**png** | ~1.3 MB | `docs/` ✅ |
| DivideCerto_Apresentacao.pdf | ~14 MB | `docs/` ✅ |
| PODCAST_TRANSCRIPT.md | ~10 KB | `docs/` ✅ |
| LINKS_EXTERNOS.md | ~1 KB | raiz ✅ |

**Total no GitHub:** ~15 MB (OK!)

---

## 🌐 Arquivos Externos

| Recurso | Plataforma | Tamanho | URL |
|---------|-----------|---------|-----|
| Vídeo Tutorial | YouTube | ~32 MB | https://youtu.be/k9joMAI-4rU |
| Podcast | SoundCloud | ~27 MB | https://on.soundcloud.com/gGJcff6LtReaiZgZBY |

---

## 🎯 Resultado Final

Após seguir este guia, o projeto terá:

✅ **README.md enriquecido** com recursos visuais  
✅ **FAQ expandida** com 19 perguntas  
✅ **Podcast embedado** (SoundCloud)  
✅ **Vídeo embedado** (YouTube)  
✅ **Apresentação profissional** para download  
✅ **Infográfico visual** (.png corrigido)  
✅ **Transcrição completa** do podcast  

**Impacto:** Projeto muito mais **completo, profissional e didático**! 🚀

---

## 🆘 Troubleshooting

### Problema: "Imagem não aparece no README"
**Solução:** Verifique se o caminho está correto: `docs/DivideCerto_Infografico.png`

### Problema: "Embed do SoundCloud não funciona"
**Solução:** GitHub suporta iframes no README.md. Se não aparecer, deixe apenas o link.

### Problema: "Thumbnail do YouTube não aparece"
**Solução:** Use este formato:
```markdown
[![Título](https://img.youtube.com/vi/k9joMAI-4rU/maxresdefault.jpg)](https://youtu.be/k9joMAI-4rU)
```

---

**Tudo pronto! 🎉**
