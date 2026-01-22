import { GoogleGenerativeAI } from "@google/generative-ai";

export interface CVAnalysisResult {
  score: number;
    strengths: string[];
      weaknesses: string[];
        suggestions: string[];
          matchPercentage?: number;
          }

          export interface JobMatchResult {
            matchScore: number;
              reasoning: string;
                recommendations: string[];
                }

                // Initialize Gemini API
                const genAI = new GoogleGenerativeAI(
                  process.env.REACT_APP_GEMINI_API_KEY || ""
                );

                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                /**
                 * Analyzes a CV/Resume using Gemini AI
                  * @param cvText - The CV content as text
                   * @returns Analysis result with score and suggestions */
                   export async function analyzeCV(cvText: string): Promise<CVAnalysisResult> {
                     try {
                         const prompt = `Analyze this CV and provide:
                         1. A score from 0-100 based on market standards
                         2. Key strengths (list 3-5)
                         3. Weaknesses or areas to improve (list 3-5)
                         4. Specific suggestions to improve the CV

                         CV Content:
                         ${cvText}

                         Return as JSON with fields: score, strengths, weaknesses, suggestions`;

                             const result = await model.generateContent(prompt);
                                 const response = await result.response;
                                     const text = response.text();

                                         // Parse JSON response
                                             const jsonMatch = text.match(/\{[\s\S]*\}/);
                                                 if (!jsonMatch) {
                                                       throw new Error("Invalid response format");
                                                           }

                                                               return JSON.parse(jsonMatch[0]);
                                                                 } catch (error) {
                                                                     console.error("Error analyzing CV:", error);
                                                                         return {
                                                                               score: 0,
                                                                                     strengths: [],
                                                                                           weaknesses: ["Unable to analyze"],
                                                                                                 suggestions: ["Try again later"],
                                                                                                     };
                                                                                                       }
                                                                                                       }

                                                                                                       /**
                                                                                                        * Calculates SCOD score (Semantic CV Optimization Dimensioning)
                                                                                                         * @param analysis - The CV analysis result
                                                                                                         *  * @returns SCOD score (0-100)
                                                                                                          */
                                                                                                          export function calculateSCODScore(analysis: CVAnalysisResult): number {
                                                                                                              const baseScore = analysis.score;
                                                                                                                const strengthsBonus = Math.min(analysis.strengths.length * 5, 10);
                                                                                                                  const weaknessesDeduction = Math.max(analysis.weaknesses.length * 3, 15);

                                                                                                                    return Math.max(0, Math.min(100, baseScore + strengthsBonus - weaknessesDeduction));
                                                                                                                    }

                                                                                                                    /**
                                                                                                                     * Matches a CV against a job description
                                                                                                                     *  * @param cvText - The CV content
                                                                                                                      * @param jobDescription - The job description text
                                                                                                                       * @returns Match result with score and recommendations
                                                                                                                        */
                                                                                                                        export async function matchCVToJob(
                                                                                                                            cvText: string,
                                                                                                                              jobDescription: string
                                                                                                                              ): Promise<JobMatchResult> {
                                                                                                                                  try {
                                                                                                                                      const prompt = `Compare this CV against the job description and provide a match analysis:

                                                                                                                                      CV:
                                                                                                                                      ${cvText}

                                                                                                                                      Job Description:
                                                                                                                                      ${jobDescription}

                                                                                                                                      Provide:
                                                                                                                                      1. Match score from 0-100
                                                                                                                                      2. Reasoning (2-3 sentences)
                                                                                                                                      3. Top 3 recommendations to improve match

                                                                                                                                      Return as JSON with fields: matchScore, reasoning, recommendations`;

                                                                                                                                          const result = await model.generateContent(prompt);
                                                                                                                                              const response = await result.response;
                                                                                                                                                  const text = response.text();

                                                                                                                                                      const jsonMatch = text.match(/\{[\s\S]*\}/);
                                                                                                                                                          if (!jsonMatch) {
                                                                                                                                                                  throw new Error("Invalid response format");
                                                                                                                                                                      }

                                                                                                                                                                          return JSON.parse(jsonMatch[0]);
                                                                                                                                  } catch (error) {
                                                                                                                                        console.error("Error matching CV to job:", error);
                                                                                                                                            return {
                                                                                                                                                    matchScore: 0,
                                                                                                                                                          reasoning: "Unable to analyze match",
                                                                                                                                                                recommendations: ["Try again later"],
                                                                                                                                                                    };
                                                                                                                                                                      }
                                                                                                                                                                      }

                                                                                                                                                                      /**
                                                                                                                                                                       * Generates optimized CV suggestions using AI
                                                                                                                                                                       *  * @param cvText - Original CV content
                                                                                                                                                                        * @param targetRole - Desired job role * @returns Suggested improvements
                                                                                                                                                                         */
                                                                                                                                                                         export async function generateCVSuggestions(
                                                                                                                                                                            cvText: string,
                                                                                                                                                                              targetRole: string
                                                                                                                                                                              ): Promise<string[]> {
                                                                                                                                                                                try {
                                                                                                                                                                                    const prompt = `You are a professional CV writer. Given this CV and target role, provide specific, actionable suggestions to optimize it.

                                                                                                                                                                                    Current CV:
                                                                                                                                                                                    ${cvText}

                                                                                                                                                                                    Target Role: ${targetRole}

                                                                                                                                                                                    Provide 5 specific improvements that would increase chances of being selected for this role.
                                                                                                                                                                                    Return as JSON with field: suggestions (array of strings)`;

                                                                                                                                                                                        const result = await model.generateContent(prompt);
                                                                                                                                                                                            const response = await result.response;
                                                                                                                                                                                                const text = response.text();

                                                                                                                                                                                                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                                                                                                                                                                                                        if (!jsonMatch) {
                                                                                                                                                                                                              return [];
                                                                                                                                                                                                                  }

                                                                                                                                                                                                                      const parsed = JSON.parse(jsonMatch[0]);
                                                                                                                                                                                                                          return parsed.suggestions || [];
                                                                                                                                                                                                                            } catch (error) {
                                                                                                                                                                                                                                  console.error("Error generating suggestions:", error);
                                                                                                                                                                                                                                      return [];
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                        
                                                                                                                                                                                                                            }
                                                                                                                                                                         )
                                                                                                                                  }
                                                                                                                                                          }
                                                                                                                              }
                                                                                                                        )
                                                                                                          }