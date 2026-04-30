import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This script expects an environment variable OPENROUTER_API_KEY
// Example: OPENROUTER_API_KEY=sk-or-v1-xxx npx tsx scripts/generate-seo.ts
const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error('ERRO: OPENROUTER_API_KEY não encontrada no ambiente.');
  console.error('Como usar: OPENROUTER_API_KEY=sua_chave npx tsx scripts/generate-seo.ts');
  console.error('Dica: Você pode usar modelos gratuitos no OpenRouter (como o google/gemini-pro).');
  process.exit(1);
}

const TOTAL_POSTS_TARGET = 100;

const PROMPT_TEMPLATE = (existingTitles: string[]) => `Você é um copywriter de Elite e Especialista em SEO especializado em RH, Tecnologia, Vendas e Recrutamento.
Sua missão é criar 1 (um) artigo de blog inédito, persuasivo e educativo que será lido por Candidatos buscando emprego, Profissionais de RH, Empresários terceirizando atendimento/vendas ou Consultores de carreira.

REGRAS ESTritas:
1. O artigo DEVE ter pelo menos 2000 caracteres (um conteúdo denso e profundo de especialista).
2. O título DEVE ser inédito. Não repita os títulos abaixo:
${existingTitles.slice(-15).join('\n')}
3. Estruture com layout estratégico para leitura em tela (tags HTML semânticas como <h2>, <h3>, <p>, <ul>).
4. O artigo DEVE ser retornado EXCLUSIVAMENTE em formato JSON puro (sem \`\`\`json em volta), contendo exatamente esta estrutura:
{
  "title": "O título inédito criado por você",
  "slug": "url-amigavel-do-titulo",
  "category": "Escolha: 'Dicas de Carreira', 'Tecnologia & RH', 'Vendas & Atendimento' ou 'Para Empresas'",
  "excerpt": "Um resumo de 2 linhas focado em fisgar a atenção no Google.",
  "readTime": "Ex: 8 min",
  "image": "Uma URL do unsplash (ex: https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)",
  "cta": "Um call to action de 1 linha instigando o Diagnóstico Neural",
  "content": "O HTML do texto. Use as seguintes classes do Tailwind: class='text-3xl font-black mb-6 text-slate-900', class='text-2xl font-bold mb-4 text-slate-800', class='text-lg text-slate-600 mb-6 leading-relaxed'. Insira no MEIO do artigo uma <div class='bg-indigo-50 border border-indigo-100 rounded-xl p-8 my-10 text-center'> com uma tag <button> chamando para o 'Diagnóstico de Elite do Recruta.AI no WhatsApp'."
}

Atenção: O artigo é para o site "Recruta.AI", que usa IA para automatizar triagens de RH e dar diagnósticos de elite para candidatos e equipes comerciais. Retorne SOMENTE o JSON.
`;

async function generate() {
  const filePath = path.join(process.cwd(), 'public', 'blog-data.json');
  
  let existingPosts = [];
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    existingPosts = JSON.parse(data);
  } catch(e) {
    console.log('Criando novo arquivo public/blog-data.json...');
  }

  const currentCount = existingPosts.length;
  console.log(`Atualmente existem ${currentCount} artigos no site. A meta é ${TOTAL_POSTS_TARGET}.`);

  if (currentCount >= TOTAL_POSTS_TARGET) {
    console.log('🎉 Meta de 100 artigos alcançada!');
    return;
  }

  console.log(`Gerando artigo ${currentCount + 1} de ${TOTAL_POSTS_TARGET} usando a API...`);

  try {
    const existingTitles = existingPosts.map((p: any) => p.title);
    
    // Using a free/cheap high-quality model on OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'model': 'google/gemini-3-flash-preview',
        'messages': [{ role: 'user', content: PROMPT_TEMPLATE(existingTitles) }],
        temperature: 0.8
      })
    });

    const result = await response.json();
    if (result.error) {
      console.error('Erro da API:', result.error);
      return;
    }

    const content = result.choices[0].message.content;
    let cleanContent = content.trim();
    if (cleanContent.startsWith('\`\`\`json')) {
      cleanContent = cleanContent.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    }
    
    const postData = JSON.parse(cleanContent);
    postData.id = currentCount > 0 ? Math.max(...existingPosts.map((p: any) => p.id)) + 1 : 1;
    postData.date = new Date().toISOString().split('T')[0];
    postData.author = 'Equipe Recrutaria';

    existingPosts.push(postData);

    await fs.writeFile(filePath, JSON.stringify(existingPosts, null, 2), 'utf-8');
    console.log(`✅ Artigo salvo: "${postData.title}"`);
    console.log('Rode este script novamente (ou coloque em um loop) para gerar o próximo artigo.');
    
  } catch (error) {
    console.error('Falha ao processar o retorno da IA. O modelo pode não ter retornado JSON válido. Tentando novamente...', error);
  }
}

generate();
