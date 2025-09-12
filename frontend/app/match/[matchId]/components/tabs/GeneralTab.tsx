"use client";

import { useEffect, useState } from "react";
import RadarChart from "../charts/RadarChart";
import MatchStatsTable from "../charts/MatchStatsTable";

interface Match {
  id: number;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamName: string;
  awayTeamLogo: string;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
}

interface TeamData {
  rawData: Record<string, number | null>;
  rankings: Record<string, number | null>;
  isNegativeRanked: Record<string, boolean>;
}

interface MatchTableResponse {
  homeTeam: string;
  awayTeam: string;
  homeData: TeamData;
  awayData: TeamData;
}

interface Props {
  match: Match;
}

export default function GeneralTab({ match }: Props) {
  const [matchTable, setMatchTable] = useState<MatchTableResponse | null>(null);
  const [homeRadar, setHomeRadar] = useState<Record<string, number> | null>(null);
  const [awayRadar, setAwayRadar] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!match?.id) return;

      try {
        // 📊 Fetch Match Table (general stats)
        const tableRes = await fetch(
          `http://localhost:8000/leagueEngine/team_matchtable?match_id=${match.id}`
        );
        const tableJson: MatchTableResponse = await tableRes.json();
        setMatchTable(tableJson);
        console.log(tableJson);

        // 🎯 Fetch Radar stats separately
        const homeRes = await fetch(
          `http://localhost:8000/leagueEngine/team_matchradarchart?team_id=${match.homeTeamId}&mode=home`
        );
        const homeJson = await homeRes.json();
        setHomeRadar(homeJson.rankings);

        const awayRes = await fetch(
          `http://localhost:8000/leagueEngine/team_matchradarchart?team_id=${match.awayTeamId}&mode=away`
        );
        const awayJson = await awayRes.json();
        setAwayRadar(awayJson.rankings);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }

    fetchStats();
  }, [match]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex gap-6 w-full">
        {/* Box container */}
        <div className="flex gap-6 w-full bg-white p-4 rounded-2xl shadow-md">
          {/* 📊 Match Stats Table on the left */}
          <div className="flex-1">
            {matchTable ? (
              <MatchStatsTable
                homeTeam={matchTable.homeTeam}
                awayTeam={matchTable.awayTeam}
                homeData={matchTable.homeData}
                awayData={matchTable.awayData}
              />
            ) : (
              <p className="text-gray-500">Loading match stats...</p>
            )}
          </div>

          {/* 🎯 Radar Chart on the right */}
          <div className="flex-1 flex flex-col items-center">
            <h3 className="text-center font-semibold mb-3">
              {match.homeTeamName} vs {match.awayTeamName}
            </h3>
            {homeRadar && awayRadar ? (
              <RadarChart
                datasets={[
                  {
                    label: match.homeTeamName,
                    data: homeRadar,
                  },
                  {
                    label: match.awayTeamName,
                    data: awayRadar,
                  },
                ]}
                centerImage={match.awayTeamLogo}
                reverseAxis={true}
                minRank={1}
                colors={[ "89, 203, 255","255, 119, 74"]}
              />
            ) : (
              <p className="text-gray-500">Loading radar stats...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
