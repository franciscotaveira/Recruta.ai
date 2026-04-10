# Arquitetura Recruta.AI - Análise de Refatoração

## 📊 Situação Atual vs Desejada

### Problemas Identificados (Fios Soltos)

1. **Sem Backend Real** - Tudo é frontend, sem persistência de dados
2. **Gemini AI Desconectado** - Integração declarada mas não operacional
3. **B2C/B2B Misturado** - Toggle switch não implementado
4. **Componentes Órfãos** - CreditAlert, BillingForm sem funcionalidade
5. **Design System Inconsistente** - Material UI + Tailwind misturados
6. **Autenticação Ausente** - Sem sistema de login real
7. **Sem Tratamento de Erros** - Falhas da IA não gerenciadas
8. **Roteamento Incompleto** - React Router sem guards

---

## ✅ Solução Implementada

### 1. **Serviço Gemini (services/geminiService.ts)**

Conecta a IA diretamente aos componentes:

```typescript
- analyzeCV(cvText) → CVAnalysisResult
- calculateSCODScore(analysis) → number (0-100)
- matchCVToJob(cv, jobDesc) → JobMatchResult
- generateCVSuggestions(cv, role) → string[]
```

**O que resolve**: CV analysis, scoring automático, matching

### 2. **Contexto de Autenticação (contexts/AuthContext.tsx)**

Gerencia estado de usuário e roles:

```typescript
- Tipos: User | null
- Roles: "candidate" | "recruiter"
- Métodos: login(), logout(), switchRole()
- Persistência: localStorage
```

**O que resolve**: Toggle B2C↔B2B, autenticação básica

### 3. **Contexto de Dados (contexts/DataContext.tsx)**

Cache local de candidatos, vagas e análises:

```typescript
- Candidates: [ {id, name, email, cv, scod, analysis} ]
- Jobs: [ {id, title, description, company} ]
- Analyses: [ {id, candidateId, result} ]
```

**O que resolve**: Gerenciamento de estado, validação local

### 4. **Estrutura de Pastas**

```
Recruta.ai/
├── services/
│   └── geminiService.ts       ← IA integrada
├── contexts/
│   ├── AuthContext.tsx        ← Usuários + Roles
│   └── DataContext.tsx        ← Cache de dados
├── api/
│   └── mockServer.ts          ← [PRÓXIMO] Endpoints simulados
├── components/                ← Existentes
├── pages/                     ← Existentes
└── ARCHITECTURE.md            ← Este arquivo
```

---

## 🔄 Fluxo de Dados Agora

```
LoginPage
  ↓ (email, password, role)
  AuthContext.login()
    ↓
    User = { id, email, role: "candidate" ou "recruiter" }
      ↓ (acesso a localStorage + contextos)
      CandidateDashboard   OU   RecruiterDashboard  ↓
      useAuth() + useData()
        ↓
        Componentes acessam:
          - User data
            - Cached candidates/jobs
              ↓
              AnalysisComponent
                ↓
                geminiService.analyzeCV(cv)
                  ↓
                  DataContext.addAnalysis()
                    ↓
                    UI atualiza com resultados
                    ```

                    ---

                    ## 🎯 Próximos Passos Críticos

                    ### Fase 1: Backend Básico (1-2 dias)
                    - [ ] Criar `api/mockServer.ts` com endpoints:
                      - `POST /api/auth/login` → JWT token
                        - `POST /api/candidates` → Save CV
                          - `GET /api/candidates/:id` → Fetch analysis
                            - `POST /api/jobs` → Create/list jobs
                              
                              ### Fase 2: Integrar App.tsx (1 dia)
                              - [ ] Wrapp App com `AuthProvider` + `DataProvider`
                              - [ ] Setup React Router com guards
                              - [ ] Criar `PrivateRoute` component

                              ### Fase 3: Implementar UI com Contextos (2-3 dias)
                              - [ ] LoginPage usa `useAuth()`
                              - [ ] Dashboard usa `useData()`
                              - [ ] AnalysisCard usa `geminiService`
                              - [ ] Tratamento de erros com try/catch

                              ### Fase 4: Design System Unificado (1 dia)
                              - [ ] Remover Material UI
                              - [ ] Usar APENAS shadcn/ui
                              - [ ] Criar `design-tokens.ts`

                              ### Fase 5: Deployment (1 dia)
                              - [ ] Deploy no Google Cloud Run
                              - [ ] Configurar variáveis de ambiente
                              - [ ] Setup CI/CD com GitHub Actions

                              ---

                              ## 📋 Checklist de Verificação

                              Quando implementar, validar:

                              - [ ] Autenticação funciona (login/logout preserva contexto)
                              - [ ] Toggle B2C↔B2B muda interface
                              - [ ] CV analysis mostra score SCOD
                              - [ ] Componentes órfãos desaparecem ou se conectam
                              - [ ] Erros da IA tratados gracefully
                              - [ ] localStorage salva e recupera dados
                              - [ ] UI consistente com shadcn/ui apenas

                              ---

                              ## 💡 Padrões Usados

                              - **Context API** - Estado global (Auth, Data)
                              - **React Hooks** - Custom hooks (useAuth, useData)
                              - **TypeScript Strict** - Interfaces bem definidas
                              - **Async/Await** - Chamadas Gemini non-blocking
                              - **Error Boundaries** - Tratamento de exceções (próximo)
                              - **Tailwind + shadcn** - UI components reusáveis

                              ---

                              ## 🚀 Comando para Iniciar

                              ```bash
                              npm install
                              npm run dev
                              # Abrirá em http://localhost:5173
                              ```

                              **Todas as funcionalidades acima já estão estruturadas no código.**
                              **Próximo: implementar os endpoints e conectar ao App.tsx**
                              