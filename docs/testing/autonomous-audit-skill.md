# Skill: Auditoria Autônoma de UX (Recruta.AI)

Esta skill utiliza um agente de inteligência artificial com visão de navegador para validar a integridade do sistema do ponto de vista do usuário final.

## 🎯 Escopo da Auditoria
1.  **Acessibilidade**: Garantir que a Landing Page carrega sem erros críticos.
2.  **Integridade Visual**: Validar que o Dashboard de Recrutador renderiza os cards de métricas (mesmo se os dados forem zero).
3.  **Fluxo de Candidatura**: Verificar se o botão de "Candidatar" em uma vaga pública leva ao formulário correto.
4.  **Error Handling**: Observar como o sistema reage à falha de API (401/429) na interface.

## 🛠️ Instruções para o Agente (Prompt)
> "Navegue para app.recrutaria.com.br. Atue como um QA Especialista. Inspecione a Landing Page, clique em 'Ver Vagas', escolha uma vaga e tente iniciar o processo de candidatura. Em seguida, tente acessar a área de recrutador (se possível) e valide se os gráficos de conversão aparecem. Reporte qualquer erro de console ou de UI."

## 📊 Checkpoints de Sucesso
- [ ] Landing Page visível e responsiva.
- [ ] Lista de vagas carregando.
- [ ] Formulário de candidatura acessível.
- [ ] Dashboard de Recrutador com placeholders de carregamento ou dados.
