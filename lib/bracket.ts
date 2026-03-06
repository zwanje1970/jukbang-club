/**
 * 대진표 엔진
 * 1경기 참가 인원: 2~5명, 각 경기 진출자: 1~3명
 * 예: 30강 → 5명×6조(각 조 2명 진출) → 3명×4조(각 조 1명) → 결승 4명
 */

export type RoundConfig = {
  groupSize: number;   // 한 조 인원
  advanceCount: number; // 조당 진출 인원
  groupCount: number;
};

export function computeRounds(totalParticipants: number): RoundConfig[] {
  const rounds: RoundConfig[] = [];
  let remaining = totalParticipants;

  // 예: 30 → 5*6, 진출 2*6=12 → 3*4, 진출 1*4=4 → 결승 4
  if (remaining <= 5) {
    rounds.push({ groupSize: remaining, advanceCount: 1, groupCount: 1 });
    return rounds;
  }

  // 1라운드: 5명×6조, 각 조 2명 진출 → 12명
  if (remaining === 30) {
    rounds.push({ groupSize: 5, advanceCount: 2, groupCount: 6 });
    remaining = 12;
  }
  // 2라운드: 3명×4조, 각 조 1명 진출 → 4명
  if (remaining === 12) {
    rounds.push({ groupSize: 3, advanceCount: 1, groupCount: 4 });
    remaining = 4;
  }
  // 결승: 4명
  if (remaining === 4) {
    rounds.push({ groupSize: 4, advanceCount: 1, groupCount: 1 });
    return rounds;
  }

  // 일반화: 남은 인원에 맞춰 조 편성
  if (remaining >= 4 && remaining <= 6) {
    rounds.push({ groupSize: remaining, advanceCount: 1, groupCount: 1 });
  } else if (remaining > 6) {
    const groupSize = Math.min(5, Math.ceil(remaining / 2));
    const groupCount = Math.floor(remaining / groupSize);
    const advanceCount = Math.min(2, Math.max(1, Math.floor(groupSize / 2)));
    rounds.push({ groupSize, advanceCount, groupCount });
  }
  return rounds;
}

export function totalPrizePool(
  entryFee: number,
  maxParticipants: number,
  operatingFee: number
): number {
  return entryFee * maxParticipants - operatingFee * maxParticipants;
}
