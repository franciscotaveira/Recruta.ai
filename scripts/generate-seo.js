// recruta.ai---recrutamento-inteligente/scripts/generate-seo.ts
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error("ERRO: OPENROUTER_API_KEY n\xE3o encontrada no ambiente.");
  console.error("Como usar: OPENROUTER_API_KEY=sua_chave npx tsx scripts/generate-seo.ts");
  console.error("Dica: Voc\xEA pode usar modelos gratuitos no OpenRouter (como o google/gemini-pro).");
  process.exit(1);
}
var TOTAL_POSTS_TARGET = 100;
var PROMPT_TEMPLATE = (existingTitles) => `Voc\xEA \xE9 um copywriter de Elite e Especialista em SEO especializado em RH, Tecnologia, Vendas e Recrutamento.
Sua miss\xE3o \xE9 criar 1 (um) artigo de blog in\xE9dito, persuasivo e educativo que ser\xE1 lido por Candidatos buscando emprego, Profissionais de RH, Empres\xE1rios terceirizando atendimento/vendas ou Consultores de carreira.

REGRAS ESTritas:
1. O artigo DEVE ter pelo menos 2000 caracteres (um conte\xFAdo denso e profundo de especialista).
2. O t\xEDtulo DEVE ser in\xE9dito. N\xE3o repita os t\xEDtulos abaixo:
${existingTitles.slice(-15).join("\n")}
3. Estruture com layout estrat\xE9gico para leitura em tela (tags HTML sem\xE2nticas como <h2>, <h3>, <p>, <ul>).
4. O artigo DEVE ser retornado EXCLUSIVAMENTE em formato JSON puro (sem \`\`\`json em volta), contendo exatamente esta estrutura:
{
  "title": "O t\xEDtulo in\xE9dito criado por voc\xEA",
  "slug": "url-amigavel-do-titulo",
  "category": "Escolha: 'Dicas de Carreira', 'Tecnologia & RH', 'Vendas & Atendimento' ou 'Para Empresas'",
  "excerpt": "Um resumo de 2 linhas focado em fisgar a aten\xE7\xE3o no Google.",
  "readTime": "Ex: 8 min",
  "image": "Uma URL do unsplash (ex: https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)",
  "cta": "Um call to action de 1 linha instigando o Diagn\xF3stico Neural",
  "content": "O HTML do texto. Use as seguintes classes do Tailwind: class='text-3xl font-black mb-6 text-slate-900', class='text-2xl font-bold mb-4 text-slate-800', class='text-lg text-slate-600 mb-6 leading-relaxed'. Insira no MEIO do artigo uma <div class='bg-indigo-50 border border-indigo-100 rounded-xl p-8 my-10 text-center'> com uma tag <button> chamando para o 'Diagn\xF3stico de Elite do Recruta.AI no WhatsApp'."
}

Aten\xE7\xE3o: O artigo \xE9 para o site "Recruta.AI", que usa IA para automatizar triagens de RH e dar diagn\xF3sticos de elite para candidatos e equipes comerciais. Retorne SOMENTE o JSON.
`;
async function generate() {
  const filePath = path.join(process.cwd(), "public", "blog-data.json");
  let existingPosts = [];
  try {
    const data = await fs.readFile(filePath, "utf-8");
    existingPosts = JSON.parse(data);
  } catch (e) {
    console.log("Criando novo arquivo public/blog-data.json...");
  }
  const currentCount = existingPosts.length;
  console.log(`Atualmente existem ${currentCount} artigos no site. A meta \xE9 ${TOTAL_POSTS_TARGET}.`);
  if (currentCount >= TOTAL_POSTS_TARGET) {
    console.log("\u{1F389} Meta de 100 artigos alcan\xE7ada!");
    return;
  }
  console.log(`Gerando artigo ${currentCount + 1} de ${TOTAL_POSTS_TARGET} usando a API...`);
  try {
    const existingTitles = existingPosts.map((p) => p.title);
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "user", content: PROMPT_TEMPLATE(existingTitles) }],
        temperature: 0.8
      })
    });
    const result = await response.json();
    if (result.error) {
      console.error("Erro da API:", result.error);
      return;
    }
    const content = result.choices[0].message.content;
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
    }
    const postData = JSON.parse(cleanContent);
    postData.id = currentCount > 0 ? Math.max(...existingPosts.map((p) => p.id)) + 1 : 1;
    postData.date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    postData.author = "Equipe Recrutaria";
    existingPosts.push(postData);
    await fs.writeFile(filePath, JSON.stringify(existingPosts, null, 2), "utf-8");
    console.log(`\u2705 Artigo salvo: "${postData.title}"`);
    console.log("Rode este script novamente (ou coloque em um loop) para gerar o pr\xF3ximo artigo.");
  } catch (error) {
    console.error("Falha ao processar o retorno da IA. O modelo pode n\xE3o ter retornado JSON v\xE1lido. Tentando novamente...", error);
  }
}
generate();
