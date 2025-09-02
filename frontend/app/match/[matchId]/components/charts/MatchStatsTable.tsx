import React from "react";

interface TeamData {
  rawdata: Record<string, number>;
  rankings: Record<string, number>;
  isNegativeRanked: Record<string, boolean>;
}

interface MatchStatsTableProps {
  homeTeam: string;
  awayTeam: string;
  homeData: TeamData;
  awayData: TeamData;
}

export default function MatchStatsTable({
  homeTeam,
  awayTeam,
  homeData,
  awayData,
}: MatchStatsTableProps) {
  const stats = Object.keys(homeData.rawdata);

  // Flip value if lower is better
  const getAdjusted = (value: number, isNegative: boolean) =>
    isNegative ? 100 - value : value;

  return (
    <div className="w-full bg-white shadow-md rounded-2xl p-6">
      <table className="w-full border-separate border-spacing-y-4">
        <thead>
          <tr>
            <th className="text-left text-lg font-semibold">{homeTeam}</th>
            <th className="text-center text-lg font-semibold">Stat</th>
            <th className="text-right text-lg font-semibold">{awayTeam}</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat) => {
            const homeValue = homeData.rawdata[stat];
            const awayValue = awayData.rawdata[stat];
            const isNegative = homeData.isNegativeRanked[stat];

            const homeRank = homeData.rankings[stat];
            const awayRank = awayData.rankings[stat];

            const homeAdj = getAdjusted(homeValue, isNegative);
            const awayAdj = getAdjusted(awayValue, isNegative);

            const total = homeAdj + awayAdj;
            const homePercent = total ? (homeAdj / total) * 100 : 50;
            const awayPercent = 100 - homePercent;

            return (
              <tr key={stat} className="align-top">
                {/* Home side */}
                <td className="pr-4 text-left">
                  <div className="text-xs text-gray-400">Rank {homeRank ?? "-"}</div>
                  <div className="text-lg font-semibold">{homeValue}</div>
                </td>

                {/* Stat + advantage bar */}
                <td className="px-4 w-1/2 text-center">
                  {/* Stat Name */}
                  <div className="text-sm font-semibold text-gray-700 mb-1">{stat}</div>

                  {/* Stat values */}
                  <div className="flex justify-between items-center mb-1 text-lg font-semibold">
                    <span className="text-blue-500">{homeValue}</span>
                    <span className="text-red-500">{awayValue}</span>
                  </div>

                  {/* Advantage Bar */}
                  <div className="relative w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-blue-500"
                      style={{ width: `${homePercent}%` }}
                    />
                    <div
                      className="absolute right-0 top-0 h-full bg-red-500"
                      style={{ width: `${awayPercent}%` }}
                    />
                  </div>
                </td>

                {/* Away side */}
                <td className="pl-4 text-right">
                  <div className="text-xs text-gray-400">Rank {awayRank ?? "-"}</div>
                  <div className="text-lg font-semibold">{awayValue}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
