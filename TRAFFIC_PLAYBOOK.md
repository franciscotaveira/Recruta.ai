# Traffic Playbook — Meta Ads + LinkedIn Sales Navigator

Scripts prontos para ativar tráfego pago (B2C + B2B).

---

## 🎯 META ADS — CANDIDATOS (B2C)

### Objetivo
R$49 por diagnóstico/reformulação. Cash now.

### Públicos-Alvo (Layering)

**Público 1: Pain Point Claro**
- Idade: 25-40
- Interesse: Emprego, carreira, currículo
- Comportamento: Visitou site de carreiras nos últimos 30 dias
- Exclusão: Já converteu

**Público 2: Interest Lookalike**
- LinkedIn: Connections de "recruiter", "RH", "talent"
- Cargos: Qualquer um que procura emprego
- LTV alto

**Público 3: Retargeting**
- Visitou landing page, não converteu
- Gap de 3-7 dias
- Mensagem: "Lembrou seu currículo?"

---

### 3 Criativos (Rotação)

#### Criativo 1: DOR + PROVA

**Headline (28 char max)**:
```
Seu currículo está sendo ignorado?
```

**Primary Text (125 char max)**:
```
75% dos currículos são rejeitados por ATS antes de um humano ler.
A IA rescr eve o seu em 10 minutos, alinhado à vaga que você quer.
```

**Description (30 char max)**:
```
Começar agora — R$49
```

**CTA Button**:
```
Fazer Diagnóstico
```

**Landing**:
```
https://recruta.ai/candidate/diagnostic?utm_source=meta&utm_campaign=pain1
```

---

#### Criativo 2: CLAREZA (SEM PROMESSA DE VAGA)

**Headline**:
```
Currículo que passa em ATS
```

**Primary Text**:
```
Você não compra vagas. Você compra competitividade.

Diagnóstico + reescrita alinhada à vaga que você quer.
Exporte e use em qualquer lugar.

R$49, 1 diagnóstico completo.
```

**CTA**:
```
Ver como funciona
```

---

#### Criativo 3: URGÊNCIA + PROVA SOCIAL

**Headline**:
```
Transforme seu currículo em 10min
```

**Primary Text**:
```
"Fiz o diagnóstico e já recebi 3 entrevistas no mês seguinte."
— Ana C., Coordenadora de Projetos

Começa com diagnóstico IA + sugestões específicas.
```

**CTA**:
```
Começar diagnóstico
```

---

### Budget + Estrutura

```
Campaign: Recruta.AI - Candidatos
Budget: R$ 1.000/semana (inicial)

Ad Set 1: Público 1 (Pain)
  - Budget: R$ 400
    - Bid: Lowest Cost (or Target CPA R$50)
      - Conversão: ViewContent → Purchase

      Ad Set 2: Público 2 (LLA)
        - Budget: R$ 300
          - Bid: CPA Target R$40
            
            Ad Set 3: Retargeting
              - Budget: R$ 300
                - Audiência: Landing page visitors 3-7 dias
                  - Mensagem: "Abandonou seu currículo?"
                  ```

                  ---

                  ### Pixel + Events

                  ```javascript
                  // No checkout/after purchase:

                  window.fbq('track', 'Purchase', {
                    value: 49.00,
                      currency: 'BRL',
                        content_name: 'Diagnóstico + Reformulação',
                          content_category: 'resume_service'
                          });

                          // No landing:
                          window.fbq('track', 'ViewContent');

                          // No checkout start:
                          window.fbq('track', 'InitiateCheckout');
                          ```

                          ---

                          ### Monitoramento (Diário)

                          | Métrica | Objetivo | Ação se falhar |
                          |---------|----------|-------|
                          | CPM | < R$ 40 | ↑ Público novo ou ↓ Creative |
                          | CTR | > 1% | ↑ Urgência no headline |
                          | CPC | < R$ 5 | ↑ Landing quality score |
                          | Conv Rate | > 2% | A/B test preço (R$29 vs R$49) |
                          | ROAS | > 2x | ↑ Bid ou Pause low performers |
                          | CPA | < R$ 50 | Scale winner ad set |

                          ---

                          ## 💼 LINKEDIN SALES NAVIGATOR — RH (B2B)

                          ### 30-Day Cadência (Manual)

                          **ICP**:
                          - Título: HR, Recruiter, Talent Acquisition, People Ops, RH Manager
                          - Empresa: 50-5.000+ employees
                          - Indústria: Varejo, Logística, Indústria, Serviços, Tech

                          ---

                          ### Dia 1: Conexão

                          **Mensagem**:
                          ```
                          Olá [Nome],

                          Encontrei seu perfil e vi que vocês recebem bastante CV.

                          Estou lançando um sistema onde vocês pagam POR candidato ativado 
                          (não por licença). Reduz tempo de triagem e reativa base morta.

                          Quer ver em 10 minutos? Sem compromisso.

                          Abraços,
                          [Seu nome]
                          ```

                          **Meta**: 50 conexões/dia

                          ---

                          ### Dia 3: Dor + KPI

                          **Mensagem**:
                          ```
                          Oi [Nome],

                          Achei legal nossa conversa. Deixa eu ser direto:

                          **Probleminha que vi em 80% dos RHs que falei:**
                          - Tempo de triagem levando 3-4 semanas
                          - 60% do budget em ferramentas (LinkedIn, ATS, +)
                          - Base morta de candidatos não ativada

                          **A solução que estamos rodando:**
                          - Importa base (CSV) → candidatos ficam INATIVOS
                          - Você ativa conforme precisa (1 crédito = 1 candidato)
                          - Reduz custo por contratação em ~40%

                          Quer um teste? 20 créditos de graça (R$399 normalmente).

                          Abraços
                          ```

                          ---

                          ### Dia 5: Social Proof + Demo

                          **Mensagem**:
                          ```
                          [Nome],

                          Rápido update: 12 empresas já testaram em janeiro.
                          Resultado: triagem 50% mais rápida + economia real.

                          Temos um video demo de 3min se quiser conferir:
                          [Link interno]

                          Ou: Agenda uma call de 10min? (Sexta 14h?)

                          Sem aperto,
                          [Seu nome]
                          ```

                          ---

                          ### Dia 7: Close + Urgência

                          **Mensagem**:
                          ```
                          [Nome],

                          Última mensagem! 😅

                          Sei que ficou no radar, mas 20 créditos grátis expiram segunda.

                          Se quiser validar com sua base, é agora.

                          Link direto (sem cadastro):
                          [Checkout link com cupom 20 credits free]

                          Se não couber agora, blz. Fico à disposição!

                          Abraços,
                          [Seu nome]
                          ```

                          ---

                          ### Métricas LinkedIn (Acompanhamento)

                          | Métrica | Meta | Status |
                          |---------|------|--------|
                          | Conexões aceitas | 40/50 | ✓ |
                          | Message opens | 70% | ✓ |
                          | Cliques em link | 10+ | ⚠ |
                          | Vendas qualificadas | 3-5 | ❌ |
                          | Deals fechados | 1-2 | ❓ |

                          ---

                          ## 📊 30-DAY FUNNEL TARGET

                          ```
                          Meta Ads (B2C)
                          ├─ Impressões: 50.000
                          ├─ Cliques: 2.500 (CTR 5%)
                          ├─ Landing visits: 2.500
                          ├─ Conversões: 50 (Conv 2%)
                          ├─ Revenue: R$ 2.450
                          └─ CAC: R$ 49

                          LinkedIn (B2B)
                          ├─ Mensagens enviadas: 1.500 (50/dia)
                          ├─ Responses: 450 (30%)
                          ├─ Demos booked: 15 (3%)
                          ├─ Deals won: 2-3
                          ├─ ARR: R$ 800-1.200
                          └─ CAC: ~R$ 500 (tempo seu)

                          ---

                          TOTAL MÊS 1:
                          ├─ Revenue B2C: ~R$ 2.500
                          ├─ Revenue B2B: ~R$ 1.000
                          ├─ Total: ~R$ 3.500
                          ├─ Ad spend: R$ 4.000 (Meta)
                          ├─ Loss: -R$ 500 (esperado MVP)
                          └─ Aprendizado: Inestimável
                          ```

                          ---

                          ## 🎬 QUICK START (HOJE)

                          1. **Crie Ad Account Meta** (5 min)
                             - Business Manager → Ads Manager
                                - Pixel ID: [INSIRA SEU]
                                   - Landing: recruta.ai/candidate/diagnostic

                                   2. **Setup LinkedIn** (5 min)
                                      - Ativa Sales Navigator (trial 1 mês R$49)
                                         - Copia essa cadência em um .txt
                                            - Agenda 30 min/dia para outreach

                                            3. **Comece tráfego Meta** (10 min)
                                               - Import Criativo 1 (Pain)
                                                  - Budget: R$ 400/dia
                                                     - Público: Pain interest
                                                        - Deixa rodar 48h antes de otimizar

                                                        4. **Comece LinkedIn** (Manual)
                                                           - 50 conexões dia 1 (use People search)
                                                              - Dia 3: Start messaging tier

                                                              ---

                                                              ## 🚨 RED FLAGS (PAUSE IMEDIATAMENTE)

                                                              - [ ] CPA > R$ 100 (mais caro que produto)
                                                              - [ ] Conv rate < 0,5% (copy quebrada)
                                                              - [ ] Chargeback > 5% (produto não entrega)
                                                              - [ ] Feedback: "Não tinha vaga lá" (voltar a copy)
                                                              - [ ] LinkedIn: Muitos "not interested" (ICP errado)

                                                              ---

                                                              ## ✅ CHECKPOINTS SEMANA 1

                                                              - [ ] Meta: 50+ conversões (R$49 cada)
                                                              - [ ] Meta: Chargeback < 3%
                                                              - [ ] LinkedIn: 10 responses qualificadas
                                                              - [ ] Landing: Page load time < 2s
                                                              - [ ] Copy: Ninguém mencionou "vagas" como expectativa errada
                                                              - [ ] Email: Triggers estão sendo logados

                                                              Se tudo ✓ → Scale 3x Semana 2
                                                              Se algo ✗ → Adjust, não pause

                                                              ---

                                                              ## 💡 DICAS PRO

                                                              1. **Meta**: Comece com lowest cost bid. Quando dados suficientes (50 conversões), muda para CPA target.

                                                              2. **LinkedIn**: Não spam. 10-15 mensagens/dia é sustainable. Qualidade > quantidade.

                                                              3. **Copy**: Mude 1 coisa por vez. Não refaça tudo. Senão não sabe o que funcionou.

                                                              4. **Produto**: Melhor marketing é produto bom. Se chargeback alto, volta às validações.

                                                              5. **Timing**: Segunda é melhor para Meta (pessoal procura emprego). Terça-Quarta para LinkedIn (melhor acessibilidade RH).

                                                              