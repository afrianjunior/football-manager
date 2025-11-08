import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { AI_CONFIG, validateAIConfig } from './ai-config';

// Player data schema based on playerscheme.json
export interface FootballPlayer {
  player: {
    id?: string;
    name?: string;
    age?: number;
    date_of_birth?: string;
    nationality?: string;
    preferred_foot?: string;
    personality?: string;
    media_description?: string;
    reputation?: string;
    estimated_value_usd?: {
      min?: number;
      max?: number;
    };
    contract?: {
      club?: string;
      salary_per_year_usd?: number;
      expiry_date?: string;
    };
    height_cm?: number;
    weight_kg?: number;
    positions?: {
      primary?: string;
      roles?: string[];
    };
    fitness?: {
      overall_condition?: string;
      match_sharpness?: string;
      injury_risk?: string;
    };
    dynamics?: {
      influence?: string;
      group?: string;
      positives?: number;
      negatives?: number;
      status?: string;
    };
    plans?: {
      short_term?: string;
      long_term?: string;
    };
  };
  attributes: {
    technical?: Record<string, number>;
    mental?: Record<string, number>;
    physical?: Record<string, number>;
  };
  overall?: {
    average_technical?: number;
    average_mental?: number;
    average_physical?: number;
    total_overall?: number;
  };
  player_traits?: string[];
  goalkeeper_rating?: number;
  stats?: Record<string, unknown>;
  profile_summary?: {
    strengths?: string[];
    weaknesses?: string[];
    ideal_tactical_fit?: string;
  };
}

export async function extractPlayerDataFromScreenshot(imagePath: string): Promise<{
  success: boolean;
  data?: FootballPlayer;
  error?: string;
}> {
  // Validate AI configuration
  if (!validateAIConfig()) {
    return {
      success: false,
      error: 'OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable.'
    };
  }

  try {
    const result = await generateObject({
      model: createOpenAI({
        apiKey: AI_CONFIG.openai.apiKey,
      })('gpt-4o-mini'),
      schema: {
        type: 'object',
        properties: {
          player: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              age: { type: 'number' },
              date_of_birth: { type: 'string' },
              nationality: { type: 'string' },
              preferred_foot: { type: 'string' },
              personality: { type: 'string' },
              media_description: { type: 'string' },
              reputation: { type: 'string' },
              estimated_value_usd: {
                type: 'object',
                properties: {
                  min: { type: 'number' },
                  max: { type: 'number' }
                }
              },
              contract: {
                type: 'object',
                properties: {
                  club: { type: 'string' },
                  salary_per_year_usd: { type: 'number' },
                  expiry_date: { type: 'string' }
                }
              },
              height_cm: { type: 'number' },
              weight_kg: { type: 'number' },
              positions: {
                type: 'object',
                properties: {
                  primary: { type: 'string' },
                  roles: { type: 'array', items: { type: 'string' } }
                }
              },
              fitness: {
                type: 'object',
                properties: {
                  overall_condition: { type: 'string' },
                  match_sharpness: { type: 'string' },
                  injury_risk: { type: 'string' }
                }
              },
              dynamics: {
                type: 'object',
                properties: {
                  influence: { type: 'string' },
                  group: { type: 'string' },
                  positives: { type: 'number' },
                  negatives: { type: 'number' },
                  status: { type: 'string' }
                }
              },
              plans: {
                type: 'object',
                properties: {
                  short_term: { type: 'string' },
                  long_term: { type: 'string' }
                }
              }
            }
          },
          attributes: {
            type: 'object',
            properties: {
              technical: { type: 'object', additionalProperties: { type: 'number' } },
              mental: { type: 'object', additionalProperties: { type: 'number' } },
              physical: { type: 'object', additionalProperties: { type: 'number' } }
            }
          },
          overall: {
            type: 'object',
            properties: {
              average_technical: { type: 'number' },
              average_mental: { type: 'number' },
              average_physical: { type: 'number' },
              total_overall: { type: 'number' }
            }
          },
          player_traits: { type: 'array', items: { type: 'string' } },
          goalkeeper_rating: { type: 'number' },
          stats: { type: 'object', additionalProperties: true },
          profile_summary: {
            type: 'object',
            properties: {
              strengths: { type: 'array', items: { type: 'string' } },
              weaknesses: { type: 'array', items: { type: 'string' } },
              ideal_tactical_fit: { type: 'string' }
            }
          }
        },
        required: ['player', 'attributes', 'overall']
      },
      prompt: `A screenshot was taken and saved to: ${imagePath}. 

This screenshot likely contains Football Manager player data. Please analyze the image and extract player information according to the following schema:

REQUIRED FIELDS:
- player: Basic player information (name, age, nationality, etc.)
- attributes: Technical, mental, and physical attributes (0-100 scale)
- overall: Average attribute scores

OPTIONAL FIELDS:
- player_traits: Special playing characteristics
- goalkeeper_rating: GK-specific rating (if applicable)
- stats: Match statistics
- profile_summary: AI-generated strengths/weaknesses analysis

Extract as much information as possible from the screenshot. If certain fields cannot be determined, you may omit them, but ensure the required fields are populated with reasonable estimates based on typical Football Manager player profiles.

Return the data in the exact JSON schema format specified.`
    });

    return {
      success: true,
      data: result.object as FootballPlayer
    };
  } catch (error) {
    console.error('Error extracting player data:', error);
    return {
      success: false,
      error: 'Failed to extract player data. Please ensure your OpenAI API key is valid and the image contains Football Manager player information.'
    };
  }
}