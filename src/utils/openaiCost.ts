// Prix approximatifs par 1K tokens (en euros)
const COST_PER_1K_TOKENS = {
  'gpt-3.5-turbo': {
    input: 0.0015,
    output: 0.002,
  },
  'gpt-3.5-turbo-16k': {
    input: 0.003,
    output: 0.004,
  },
};

// Estimation approximative des tokens basée sur les caractères
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

export const calculateCost = (
  model: string,
  inputTokens: number,
  outputTokens: number
): number => {
  const modelCost = COST_PER_1K_TOKENS[model as keyof typeof COST_PER_1K_TOKENS];
  if (!modelCost) return 0;

  const inputCost = (inputTokens / 1000) * modelCost.input;
  const outputCost = (outputTokens / 1000) * modelCost.output;

  return inputCost + outputCost;
};