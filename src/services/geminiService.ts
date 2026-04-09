import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

/**
 * Analyzes a CV/Resume using Gemini AI
 */
export async function analyzeCV(cvText: string): Promise<CVAnalysisResult> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro',
      contents: `Analyze this CV and provide:
        1. A score from 0-100 based on market standards
        2. Key strengths (list 3-5)
        3. Weaknesses or areas to improve (list 3-5)
        4. Specific suggestions to improve the CV

        CV Content:
        ${cvText}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as CVAnalysisResult;
    }
    throw new Error('Empty response from AI');
  } catch (error) {
    console.error('Error analyzing CV:', error);
    return {
      score: 0,
      strengths: [],
      weaknesses: ['Unable to analyze'],
      suggestions: ['Try again later'],
    };
  }
}

/**
 * Matches a CV against a job description
 */
export async function matchCVToJob(
  cvText: string,
  jobDescription: string
): Promise<JobMatchResult> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro',
      contents: `Compare this CV against the job description.

        CV:
        ${cvText}

        Job Description:
        ${jobDescription}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            reasoning: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as JobMatchResult;
    }
    throw new Error('Empty response from AI');
  } catch (error) {
    console.error('Error matching CV to job:', error);
    return {
      matchScore: 0,
      reasoning: 'Unable to analyze match',
      recommendations: ['Try again later'],
    };
  }
}

/**
 * Generates optimized CV suggestions using AI
 */
export async function generateCVSuggestions(cvText: string, targetRole: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash',
      contents: `You are a professional CV writer. Given this CV and target role, provide specific, actionable suggestions to optimize it.

        Current CV:
        ${cvText}

        Target Role: ${targetRole}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      return parsed.suggestions || [];
    }
    return [];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}
