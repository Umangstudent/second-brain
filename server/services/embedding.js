let pipeline;

async function getPipeline() {
  if (!pipeline) {
    const { pipeline: getTransformersPipeline } = await import('@xenova/transformers');
    pipeline = await getTransformersPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return pipeline;
}

const generateEmbedding = async (text, timeoutMs = 3500) => {
  try {
    if (!text || text.trim() === '') return null;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Embedding generation timed out')), timeoutMs)
    );

    const generatePromise = (async () => {
      const generate = await getPipeline();
      const output = await generate(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    })();

    return await Promise.race([generatePromise, timeoutPromise]);
  } catch (error) {
    console.error('Error generating embedding:', error.message || error);
    return null;
  }
};

const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

module.exports = { generateEmbedding, cosineSimilarity };
