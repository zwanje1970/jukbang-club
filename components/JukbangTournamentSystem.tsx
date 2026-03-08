"use client";

import { useRef, useState, useEffect } from "react";

/* =================================
   타입
================================= */

type GroupResult = { name: string; advance: boolean };
type Group = {
  id: number;
  players: string[];
  results: GroupResult[];
};
type Round = Group[];

/* =================================
   랜덤 셔플
================================= */

function shuffle(players: string[]): string[] {
  const arr = [...players];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/* =================================
   최적 조 계산
================================= */

function calculateGroupCount(playerCount: number): number {
  for (let g = Math.floor(playerCount / 3); g >= 2; g--) {
    const size = Math.ceil(playerCount / g);
    if (size <= 6) return g;
  }
  return 2;
}

/* =================================
   조 생성
================================= */

function createGroups(players: string[], groupCount: number): Group[] {
  const shuffled = shuffle(players);
  const playerCount = players.length;
  const count = Math.max(1, Math.min(groupCount, playerCount));
  const base = Math.floor(playerCount / count);
  const remain = playerCount % count;
  const groups: Group[] = [];
  let index = 0;

  for (let i = 0; i < count; i++) {
    let size = base;
    if (i < remain) size++;
    groups.push({
      id: i + 1,
      players: shuffled.slice(index, index + size),
      results: [],
    });
    index += size;
  }
  return groups;
}

/* =================================
   다음 라운드 계산
================================= */

function calculateNextPlayers(groups: Group[]): string[] {
  const winners: string[] = [];
  groups.forEach((group) => {
    const pass = group.results.filter((r) => r.advance).map((r) => r.name);
    winners.push(...pass);
  });
  return winners;
}

/* =================================
   라운드 생성
================================= */

function createRound(players: string[], groupCount: number): Round {
  const groups = createGroups(players, groupCount);
  return groups.map((g) => ({
    ...g,
    results: g.players.map((p) => ({ name: p, advance: false })),
  }));
}

/** 불참자 제외: rounds에서 allowed에 없는 이름을 제거하고, 빈 조/라운드는 제거 */
function filterRoundsByAllowed(rounds: Round[], allowed: Set<string>): Round[] {
  return rounds
    .map((round) =>
      round
        .map((g) => ({
          ...g,
          players: g.players.filter((p) => allowed.has(p)),
          results: g.results.filter((r) => allowed.has(r.name)),
        }))
        .filter((g) => g.players.length > 0)
    )
    .filter((round) => round.length > 0);
}

/* =================================
   메인 컴포넌트
================================= */

type RoundType = "PRELIMINARY" | "SEMI" | "FINAL";

function getRoundForPlayer(name: string, rounds: Round[]): RoundType {
  for (let ri = rounds.length - 1; ri >= 0; ri--) {
    const round = rounds[ri];
    for (const g of round) {
      const idx = g.players.indexOf(name);
      if (idx === -1) continue;
      const advance = g.results[idx]?.advance ?? false;
      if (ri === 2) return "FINAL";
      if (ri === 1) return advance ? "FINAL" : "SEMI";
      if (ri === 0) return advance ? "SEMI" : "PRELIMINARY";
    }
  }
  return "PRELIMINARY";
}

function computeRoundsByPlayer(players: string[], rounds: Round[]): Record<string, RoundType> {
  const map: Record<string, RoundType> = {};
  players.forEach((name) => {
    map[name] = getRoundForPlayer(name, rounds);
  });
  return map;
}

const BRACKET_STORAGE_KEY = "jukbang_bracket";

function loadBracket(competitionId: string): { rounds: Round[]; currentRound: number; finished: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${BRACKET_STORAGE_KEY}_${competitionId}`);
    if (!raw) return null;
    const data = JSON.parse(raw) as { rounds: Round[]; currentRound: number; finished: boolean };
    if (!data.rounds?.length || typeof data.currentRound !== "number" || typeof data.finished !== "boolean")
      return null;
    return data;
  } catch {
    return null;
  }
}

function saveBracket(competitionId: string, rounds: Round[], currentRound: number, finished: boolean) {
  if (typeof window === "undefined" || !rounds.length) return;
  try {
    localStorage.setItem(
      `${BRACKET_STORAGE_KEY}_${competitionId}`,
      JSON.stringify({ rounds, currentRound, finished })
    );
  } catch (e) {
    console.warn("대진표 저장 실패:", e);
  }
}

function isValidBracket(data: unknown): data is { rounds: Round[]; currentRound: number; finished: boolean } {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.rounds) || d.rounds.length === 0) return false;
  if (typeof d.currentRound !== "number" || typeof d.finished !== "boolean") return false;
  return true;
}

type Props = {
  applicants: string[];
  competitionId?: string;
  initialBracket?: { rounds: unknown[]; currentRound: number; finished: boolean } | null;
  isClosed?: boolean;
  /** 결과 페이지 등에서 대진표만 읽기 전용으로 표시 */
  displayOnly?: boolean;
};

export default function JukbangTournamentSystem({ applicants, competitionId, initialBracket, isClosed = false, displayOnly = false }: Props) {
  const [players, setPlayers] = useState<string[]>(applicants);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (displayOnly && initialBracket && isValidBracket(initialBracket)) {
      const allowed = new Set(applicants);
      const rawRounds = initialBracket.rounds as Round[];
      const filtered = filterRoundsByAllowed(rawRounds, allowed);
      setRounds(filtered.length > 0 ? filtered : []);
      setPlayers(applicants);
    }
  }, [displayOnly, initialBracket, applicants]);

  useEffect(() => {
    if (displayOnly || !competitionId) return;
    const fromServer = initialBracket && isValidBracket(initialBracket) ? initialBracket : null;
    const fromStorage = loadBracket(competitionId);
    const saved = fromServer ?? fromStorage;
    const allowed = new Set(applicants);
    if (saved) {
      const rawRounds = saved.rounds as Round[];
      const filtered = filterRoundsByAllowed(rawRounds, allowed);
      setRounds(filtered.length > 0 ? filtered : []);
      setCurrentRound(Math.min(saved.currentRound, Math.max(0, filtered.length - 1)));
      setFinished(filtered.length >= 3 ? saved.finished : false);
      setPlayers(applicants);
    } else {
      setRounds([]);
      setCurrentRound(0);
      setFinished(false);
      setPlayers(applicants);
    }
  }, [competitionId, applicants]);

  useEffect(() => {
    if (displayOnly || !competitionId || rounds.length === 0 || isClosed) return;
    saveBracket(competitionId, rounds, currentRound, finished);
  }, [displayOnly, competitionId, rounds, currentRound, finished, isClosed]);

  useEffect(() => {
    if (displayOnly || !competitionId || rounds.length === 0 || isClosed) return;
    const timer = setTimeout(() => {
      fetch(`/api/admin/competitions/${competitionId}/bracket`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rounds, currentRound, finished }),
      }).catch((err) => console.error("대진표 서버 저장 실패:", err));
    }, 600);
    return () => clearTimeout(timer);
  }, [displayOnly, competitionId, rounds, currentRound, finished]);

  useEffect(() => {
    if (displayOnly || !competitionId || rounds.length === 0 || isClosed) return;
    const timer = setTimeout(() => {
      const roundsByPlayer = computeRoundsByPlayer(players, rounds);
      fetch(`/api/admin/competitions/${competitionId}/rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rounds: roundsByPlayer }),
      }).catch((err) => console.error("진출 라운드 반영 실패:", err));
    }, 800);
    return () => clearTimeout(timer);
  }, [competitionId, players, rounds, isClosed]);

  useEffect(() => {
    if (rounds.length === 0) return;
    setCurrentRound((c) => Math.min(c, Math.max(0, rounds.length - 1)));
    if (rounds.length < 3) setFinished(false);
  }, [rounds.length]);

  const defaultPrelim = applicants.length > 0 ? calculateGroupCount(applicants.length) : 2;
  const [groupCountPrelim, setGroupCountPrelim] = useState<number>(defaultPrelim);
  const [groupCountSemi, setGroupCountSemi] = useState<number>(2);
  const groupCountPrelimRef = useRef(groupCountPrelim);
  const groupCountSemiRef = useRef(groupCountSemi);
  const [showPrelimConfirm, setShowPrelimConfirm] = useState(false);
  const [showSemiConfirm, setShowSemiConfirm] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  groupCountPrelimRef.current = groupCountPrelim;
  groupCountSemiRef.current = groupCountSemi;

  function generateTournament() {
    const count = Math.max(1, Math.min(groupCountPrelimRef.current, players.length));
    const round = createRound(players, count);
    setRounds([round]);
    setCurrentRound(0);
    setFinished(false);
  }

  function handlePrelimCreate() {
    if (rounds.length > 0) {
      setShowPrelimConfirm(true);
      return;
    }
    generateTournament();
  }

  function confirmPrelimRecreate() {
    setShowPrelimConfirm(false);
    generateTournament();
  }

  const hasAnyAdvanceChecked = rounds.length > 0 && rounds[0].some((g) => g.results.some((r) => r.advance));
  const prelimLocked = rounds.length >= 2 || hasAnyAdvanceChecked;

  function handleSemiCreate() {
    if (rounds.length >= 2) {
      setShowSemiConfirm(true);
      return;
    }
    if (rounds.length === 1 && hasAnyAdvanceChecked) {
      nextRound();
    }
  }

  function confirmSemiRecreate() {
    setShowSemiConfirm(false);
    const nextPlayers = calculateNextPlayers(rounds[0]);
    if (nextPlayers.length === 0) return;
    const semiCount = Math.max(1, Math.min(groupCountSemiRef.current, nextPlayers.length));
    const newSemi = createRound(nextPlayers, semiCount);
    setRounds([rounds[0], newSemi]);
    setCurrentRound(1);
  }

  const semiRoundForFinal =
    rounds.length === 2 ? rounds[1] : rounds.length >= 3 && !(rounds[rounds.length - 1].length === 1) ? rounds[rounds.length - 1] : null;
  const hasAdvanceInSemi = semiRoundForFinal?.some((g) => g.results.some((r) => r.advance)) ?? false;
  const finalLocked = finished;

  function createFinalRound() {
    const semiRound = rounds.length === 2 ? rounds[1] : rounds[rounds.length - 1];
    const nextPlayers = calculateNextPlayers(semiRound);
    if (nextPlayers.length === 0) return;
    const finalRound: Round = [
      {
        id: 1,
        players: nextPlayers,
        results: nextPlayers.map((p) => ({ name: p, advance: false })),
      },
    ];
    setRounds((prev) => [...prev, finalRound]);
    setCurrentRound(rounds.length);
  }

  const hasFinalRound = rounds.length >= 3 && rounds[rounds.length - 1].length === 1;

  function handleFinalCreate() {
    if (hasFinalRound) {
      setShowFinalConfirm(true);
      return;
    }
    const semiRound = rounds.length === 2 ? rounds[1] : rounds[rounds.length - 1];
    const hasAdvance = semiRound.some((g) => g.results.some((r) => r.advance));
    if (hasAdvance) {
      createFinalRound();
    }
  }

  function confirmFinalRecreate() {
    setShowFinalConfirm(false);
    const semiRound = rounds[rounds.length - 2];
    const nextPlayers = calculateNextPlayers(semiRound);
    if (nextPlayers.length === 0) return;
    const finalRound: Round = [
      {
        id: 1,
        players: nextPlayers,
        results: nextPlayers.map((p) => ({ name: p, advance: false })),
      },
    ];
    setRounds((prev) => [...prev.slice(0, -1), finalRound]);
    setCurrentRound(rounds.length - 1);
  }

  /** 진출 체크 변경. 해당 라운드에서 진출이 모두 해제되면 그 다음 라운드(들)는 제거됨. */
  function setAdvance(roundIndex: number, groupIndex: number, playerIndex: number, checked: boolean) {
    setRounds((prev) => {
      const next = prev.map((r, rIdx) =>
        rIdx !== roundIndex
          ? r
          : r.map((gr, gIdx) =>
              gIdx !== groupIndex
                ? gr
                : {
                    ...gr,
                    results: gr.results.map((res, i) =>
                      i === playerIndex ? { ...res, advance: checked } : res
                    ),
                  }
            )
      );
      const editedRound = next[roundIndex];
      const hasAnyAdvance = editedRound?.some((g) => g.results.some((r) => r.advance)) ?? false;
      if (!hasAnyAdvance && next.length > roundIndex + 1) {
        return next.slice(0, roundIndex + 1);
      }
      return next;
    });
  }

  function goToPreviousRound() {
    setCurrentRound((c) => Math.max(0, c - 1));
  }

  const hasAnyAdvanceInCurrentRound =
    rounds.length > 0 &&
    currentRound < rounds.length &&
    rounds[currentRound].some((g) => g.results.some((r) => r.advance));

  const showResetAdvanceButton = rounds.length >= 1;

  function nextRound() {
    const groups = rounds[currentRound];
    const nextPlayers = calculateNextPlayers(groups);
    if (nextPlayers.length === 0) return;

    const semiCount = Math.max(1, Math.min(groupCountSemiRef.current, nextPlayers.length));
    if (currentRound === 1 && nextPlayers.length <= 6) {
      setRounds((prev) => [
        ...prev,
        [
          {
            id: 1,
            players: nextPlayers,
            results: nextPlayers.map((p) => ({ name: p, advance: false })),
          },
        ],
      ]);
      setFinished(true);
      setCurrentRound((c) => c + 1);
      return;
    }

    const newRound = createRound(nextPlayers, semiCount);
    setRounds((prev) => [...prev, newRound]);
    setCurrentRound((c) => c + 1);
  }

  const GROUP_COLORS = [
    "bg-amber-50 border-amber-300",
    "bg-sky-50 border-sky-300",
    "bg-emerald-50 border-emerald-300",
    "bg-violet-50 border-violet-300",
    "bg-rose-50 border-rose-300",
    "bg-teal-50 border-teal-300",
    "bg-orange-50 border-orange-300",
    "bg-indigo-50 border-indigo-300",
  ];

  function getRoundLabel(roundIndex: number): string {
    if (roundIndex === 0) return "예선";
    if (roundIndex === 1) return "준결승";
    return "결승";
  }

  return (
    <div className="p-6">
      {!displayOnly && (
        <>
          <h1 className="mb-4 text-2xl font-bold text-gray-800">자동대진표(랜덤배정)</h1>
          <div className="mb-4 text-gray-600">참가자 수: {players.length}명 (불참 제외)</div>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            {isClosed && (
              <p className="w-full text-sm font-medium text-amber-700">종료된 대회입니다. 대진표를 수정할 수 없습니다.</p>
            )}
            <label className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-700">예선 조 개수</span>
          <input
            type="number"
            min={1}
            max={Math.max(players.length, 1)}
            value={groupCountPrelim}
            onChange={(e) => setGroupCountPrelim(Math.max(1, parseInt(e.target.value, 10) || 1))}
            disabled={isClosed}
            className="w-12 rounded border border-gray-300 px-1.5 py-1 text-center text-sm disabled:bg-gray-100 disabled:opacity-70"
          />
        </label>
        <label className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-700">준결승 조 개수</span>
          <input
            type="number"
            min={1}
            max={Math.max(players.length, 1)}
            value={groupCountSemi}
            onChange={(e) => setGroupCountSemi(Math.max(1, parseInt(e.target.value, 10) || 1))}
            disabled={isClosed}
            className="w-12 rounded border border-gray-300 px-1.5 py-1 text-center text-sm disabled:bg-gray-100 disabled:opacity-70"
          />
        </label>
        <button
          type="button"
          onClick={handlePrelimCreate}
          disabled={prelimLocked || isClosed}
          className={`rounded px-4 py-2 text-white ${
            prelimLocked || isClosed
              ? "cursor-not-allowed bg-gray-400 text-gray-200"
              : "bg-amber-600 hover:bg-amber-700"
          }`}
        >
          예선전 생성
        </button>
        <button
          type="button"
          onClick={handleSemiCreate}
          disabled={rounds.length >= 3 || (rounds.length === 1 && !hasAnyAdvanceChecked) || (rounds.length === 2 && hasAdvanceInSemi) || isClosed}
          className={`rounded px-4 py-2 text-white ${
            rounds.length >= 3 || (rounds.length === 1 && !hasAnyAdvanceChecked) || (rounds.length === 2 && hasAdvanceInSemi) || isClosed
              ? "cursor-not-allowed bg-gray-400 text-gray-200"
              : "bg-amber-600 hover:bg-amber-700"
          }`}
        >
          준결승 생성
        </button>
        <button
          type="button"
          onClick={handleFinalCreate}
          disabled={finalLocked || hasFinalRound || (!hasFinalRound && !hasAdvanceInSemi) || isClosed}
          className={`rounded px-4 py-2 text-white ${
            finalLocked || hasFinalRound || (!hasFinalRound && !hasAdvanceInSemi) || isClosed
              ? "cursor-not-allowed bg-gray-400 text-gray-200"
              : "bg-amber-600 hover:bg-amber-700"
          }`}
        >
          결승 생성
        </button>
        {!isClosed && showResetAdvanceButton && (
          <button
            type="button"
            onClick={goToPreviousRound}
            className="rounded border border-gray-500 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            선택수정
          </button>
        )}
          </div>

          <div className="mb-6 border-t-2 border-gray-500" aria-hidden />
        </>
      )}

      {rounds.length > 0 && (() => {
        const ROW_MIN_PX = 20; // 최소 줄 높이 (내용에 따라 자동 증가)
        const GAP_PX = 4;
        const GROUP_GAP_PX = 4;
        const GROUP_GAP_ROWS = 1;

        const LABEL_ROW_PX = ROW_MIN_PX;

        function buildRoundRowStructure(round: Round, labelRowPerGroup = false) {
          const heights: number[] = [];
          const groupStarts: number[] = [];
          let rowIndex = 0;
          round.forEach((g, gi) => {
            groupStarts[gi] = rowIndex;
            if (labelRowPerGroup) {
              heights.push(LABEL_ROW_PX);
              rowIndex++;
              heights.push(GAP_PX);
              rowIndex++;
            }
            g.players.forEach((_, pi) => {
              heights.push(ROW_MIN_PX);
              rowIndex++;
              if (pi < g.players.length - 1) {
                heights.push(GAP_PX);
                rowIndex++;
              }
            });
            if (gi < round.length - 1) {
              for (let r = 0; r < GROUP_GAP_ROWS; r++) heights.push(GROUP_GAP_PX);
              rowIndex += GROUP_GAP_ROWS;
            }
          });
          return { heights, groupStarts, totalRows: rowIndex };
        }

        const round0 = rounds[0];
        const r0 = buildRoundRowStructure(round0, true);
        const round0GroupStarts = r0.groupStarts;
        const totalRowsRound0 = r0.totalRows;

        const r1 = rounds.length > 1 ? buildRoundRowStructure(rounds[1], true) : { heights: [] as number[], groupStarts: [] as number[], totalRows: 0 };
        const r2 = rounds.length > 2 ? buildRoundRowStructure(rounds[2], true) : { heights: [] as number[], groupStarts: [] as number[], totalRows: 0 };

        // 왼쪽 예선, 가운데 준결승, 오른쪽 결승 — 세 단계 모두 상단 정렬
        const totalRows = Math.max(totalRowsRound0, r1.totalRows, r2.totalRows);
        const rowHeights: number[] = Array(totalRows).fill(ROW_MIN_PX);
        for (let i = 0; i < totalRows; i++) {
          rowHeights[i] = Math.max(
            r0.heights[i] ?? ROW_MIN_PX,
            r1.heights[i] ?? ROW_MIN_PX,
            r2.heights[i] ?? ROW_MIN_PX
          );
        }
        const rowTemplate = rowHeights.map((h) => `minmax(${h}px, auto)`).join(" ");

        const displayOrder = rounds.length >= 3 ? [0, 1, 2] : rounds.length === 2 ? [0, 1] : [0];
        const startRowByRound = [0, 0, 0];
        const groupStartsByRound = [round0GroupStarts, r1.groupStarts, r2.groupStarts];

        const ROUND_COL_WIDTH = "minmax(min-content, 180px)";
        return (
          <div className="overflow-x-auto pb-8">
            <div
              className="inline-grid min-w-0 gap-x-12 gap-y-0"
              style={{
                gridTemplateColumns: displayOrder.map(() => ROUND_COL_WIDTH).join(" "),
                gridTemplateRows: rowTemplate,
              }}
            >
              {displayOrder.flatMap((ri, colIndex) => {
                const round = rounds[ri];
                if (!round) return [];
                const startRow = startRowByRound[ri];
                const groupStarts = groupStartsByRound[ri];
                const roundColumn = colIndex + 1;
                const getLabel = (gi: number) => {
                  if (ri === 0) return `예선${gi + 1}조`;
                  if (ri === 1) return `준결${gi + 1}조`;
                  return round.length === 1 ? "결승" : `결승${gi + 1}조`;
                };
                return round.map((group, gi) => {
                  const colorClass = GROUP_COLORS[gi % GROUP_COLORS.length];
                  const rowSpan = 2 * group.players.length + 1;
                  const groupRow = startRow + groupStarts[gi] + 1;
                  const showAdvance = !displayOnly && !finished && (rounds.length <= 2 ? ri < rounds.length : ri < rounds.length - 1);
                  const advanceEditable = ri === currentRound && !finished && !isClosed;
                  return (
                    <div
                      key={`${ri}-${gi}`}
                      className={`flex flex-col rounded border-2 overflow-hidden ${colorClass}`}
                      style={{
                        gridRow: `${groupRow} / span ${rowSpan}`,
                        gridColumn: roundColumn,
                      }}
                    >
                      <div className="border-b border-gray-200 bg-white/60 px-2 py-1 text-sm font-semibold text-amber-600">
                        {getLabel(gi)}
                      </div>
                      <div className="flex flex-1 flex-col">
                        {group.players.map((player, pi) => (
                          <div
                            key={pi}
                            className={`flex items-center justify-start gap-2 border-b border-gray-200/80 px-2 py-1.5 last:border-b-0 ${colorClass}`}
                          >
                            {showAdvance ? (
                              <label className={`flex shrink-0 ${advanceEditable ? "cursor-pointer" : ""}`}>
                                <input
                                  type="checkbox"
                                  checked={group.results[pi]?.advance ?? false}
                                  onChange={advanceEditable ? (e) => setAdvance(ri, gi, pi, e.target.checked) : undefined}
                                  disabled={!advanceEditable}
                                  aria-label="진출"
                                  className="h-4 w-4 rounded border-gray-400 text-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-0 disabled:opacity-50"
                                />
                              </label>
                            ) : null}
                            <span className="truncate text-sm font-medium text-gray-800">{player}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </div>
        );
      })()}

      {!displayOnly && showPrelimConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowPrelimConfirm(false)}
        >
          <div
            className="mx-4 rounded-xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 text-gray-800">다시 생성하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPrelimConfirm(false)}
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmPrelimRecreate}
                className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {!displayOnly && showSemiConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowSemiConfirm(false)}
        >
          <div
            className="mx-4 rounded-xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 text-gray-800">다시 생성하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSemiConfirm(false)}
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmSemiRecreate}
                className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {!displayOnly && showFinalConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowFinalConfirm(false)}
        >
          <div
            className="mx-4 rounded-xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 text-gray-800">다시 생성하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFinalConfirm(false)}
                className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmFinalRecreate}
                className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
