export function normalizeCareerDirections(payload) {
  const result = payload?.result || payload;
  if (!Array.isArray(result?.directions) || result.directions.length !== 5) {
    throw new Error('Career directions must include exactly five ranked recommendations.');
  }

  const directions = result.directions.map((direction, index) => {
    if (
      direction.rank !== index + 1 ||
      typeof direction.title !== 'string' ||
      !direction.title.trim() ||
      !['High', 'Medium', 'Low'].includes(direction.match) ||
      typeof direction.interestFit !== 'string' ||
      typeof direction.evidence !== 'string' ||
      !direction.evidence.trim()
    ) {
      throw new Error(`Career direction ${index + 1} is missing its rank, match, reason, or evidence.`);
    }
    return {
      ...direction,
      title: direction.title.trim(),
      interestFit: direction.interestFit.trim(),
      evidence: direction.evidence.trim(),
    };
  });

  if (!Array.isArray(result.exploreMore) || result.exploreMore.length !== 15) {
    throw new Error('Career directions must include 15 additional paths to explore.');
  }
  const exploreMore = result.exploreMore.map((title) => {
    if (typeof title !== 'string' || !title.trim()) {
      throw new Error('An additional career direction has an invalid title.');
    }
    return title.trim();
  });

  return {
    directions,
    exploreMore,
    rankingBasis: Array.isArray(result.rankingBasis) ? result.rankingBasis : [],
    baziNote: String(result.baziNote || ''),
    isDemo: result.isDemo === true,
  };
}
