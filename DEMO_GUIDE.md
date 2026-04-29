# Recruta.AI — Guia de Demonstração

## 🚀 2 minutos para rodar a demo completa

### Terminal 1 — Backend
```bash
cd server
npm install
npm run seed        # popula dados demo (5 vagas, 8 candidatos, 8 candidaturas)
npm run dev         # inicia em http://localhost:4000
```

### Terminal 2 — Frontend
```bash
npm install
npm run dev         # inicia em http://localhost:3000
```

---

## 🎬 Roteiro de Demonstração (5 min)

### Cena 1: Recrutador posta vaga (1 min)
1. Acesse `http://localhost:3000/login`
2. Entre como **Recrutador** com qualquer e-mail
3. Clique em **"Publicar Vaga"** (botão verde no topo)
4. Preencha: "Desenvolvedor Python", "SuaEmpresa", "Remoto"
5. Clique em **Publicar** → vaga aparece no painel

### Cena 2: Candidato analisa CV (1.5 min)
1. Abra aba anônima → `http://localhost:3000/login`
2. Entre como **Candidato** com qualquer e-mail
3. Cole um currículo no campo de texto
4. Clique em **"Analisar com IA"**
5. Veja o **Score SCPD** + sugestões da IA

### Cena 3: Candidato vê vagas e se candidata (1 min)
1. Role para baixo → veja as **5 vagas** publicadas (Nubank, TechCorp, etc.)
2. Clique em **"Candidatar-se"** em qualquer vaga
3. Veja o botão mudar para "✅ Candidatado"

### Cena 4: Recrutador vê candidaturas (1 min)
1. Volte à aba do Recrutador
2. Veja as vagas com **contagem de candidaturas**
3. Veja os **avatars dos candidatos** com score de match

### Cena 5: WhatsApp (bônus, 30s)
1. Clique no botão **"WhatsApp"** em qualquer vaga
2. Veja o modal de convite com telefone do candidato

---

## 📊 Dados Demo Incluídos

| Vaga | Empresa | Candidaturas |
|------|---------|-------------|
| Desenvolvedor Front-end Pleno | TechCorp Brasil | 2 (Ana 85%, Julia 45%) |
| Analista de Marketing Digital | GrowthLab | 2 (Francisco 78%, Camila 52%) |
| Gerente de Projetos — TI | InnovaTech Solutions | 2 (Carlos 90%, Roberto 72%) |
| Designer UX/UI Sênior | Nubank | 1 (Mariana 95%) |
| Analista de Dados Jr. | LogiFast | 1 (Pedro 60%) |

---

## 🔑 Credenciais

| Papel | userId | role |
|-------|--------|------|
| Recrutador | `demo_recruiter_1` | `recruiter` |
| Candidato | qualquer valor | `candidate` |

---

## 💡 Dica para Vendas

> *"Em 5 minutos você viu: recrutador posta vaga → candidato analisa CV com IA → candidato se candidata → recrutador vê tudo no painel. A Gupy não faz análise de CV. O LinkedIn não faz triagem por WhatsApp. Nós fazemos os dois."*
