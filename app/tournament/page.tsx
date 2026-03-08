import JukbangTournamentSystem from "@/components/JukbangTournamentSystem";

const applicants = [
  "김철수",
  "이영희",
  "박민수",
  "최지훈",
  "홍길동",
  "장동건",
  "이병헌",
  "정우성",
  "송강호",
  "하정우",
  "강동원",
  "유재석",
  "강호동",
  "박명수",
  "정준하",
  "조세호",
];

export default function Page() {
  return <JukbangTournamentSystem applicants={applicants} />;
}
