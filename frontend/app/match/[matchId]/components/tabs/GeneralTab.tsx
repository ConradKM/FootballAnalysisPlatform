"use client";

import { useEffect, useState } from "react";
import RadarChart from "../charts/RadarChart";
import MatchStatsTable from "../charts/MatchStatsTable";

interface Match {
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamName: string;
  awayTeamLogo: string;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
}

interface Props {
  match: Match;
}

export default function GeneralTab({ match }: Props) {
  const [homeData, setHomeData] = useState<Record<string, number> | null>(null);
  const [awayData, setAwayData] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    async function fetchRadarStats() {
      if (!match || !match.homeTeamId || !match.awayTeamId) return;

      try {
        // Fetch home radar stats
        const homeRes = await fetch(
          `http://localhost:8000/leagueEngine/team_matchradarchart?team_id=${match.homeTeamId}&mode=home`
        );
        const homeJson = await homeRes.json();
        console.log("Fetched home data:", homeJson.rankings);
        setHomeData(homeJson.rankings);

        // Fetch away radar stats
        const awayRes = await fetch(
          `http://localhost:8000/leagueEngine/team_matchradarchart?team_id=${match.awayTeamId}&mode=away`
        );
        const awayJson = await awayRes.json();
        console.log("Fetched away data:", awayJson.rankings);
        setAwayData(awayJson.rankings);
      } catch (error) {
        console.error("Error fetching radar stats:", error);
      }
    }

    fetchRadarStats();
  }, [match]);

  // 🔍 Log fresh updates only when state changes
  useEffect(() => {
    if (homeData) console.log("Updated homeData state:", homeData);
  }, [homeData]);

  useEffect(() => {
    if (awayData) console.log("Updated awayData state:", awayData);
  }, [awayData]);

  console.log(homeData);
  console.log(awayData);


  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex gap-6 w-full">
        {/* Combined Radar Chart for Home & Away */}
        <div className="flex-1 flex flex-col items-center">
          <h3 className="text-center font-semibold mb-3">{match.homeTeamName} vs {match.awayTeamName}</h3>
          {homeData && awayData ? (
            <RadarChart
              datasets={[
                {
                  label: match.homeTeamName,
                  data: homeData,
                },
                {
                  label: match.awayTeamName,
                  data: awayData,
                },
              ]}
              centerImage={match.awayTeamLogo}
              reverseAxis={true}
              minRank={1}
            />
          ) : (
            <p className="text-gray-500">Loading team data...</p>
          )}

          <MatchStatsTable
            homeTeam="Arsenal"
            awayTeam="Chelsea"
            homeData={{
              rawdata: {
                Attacking: 42,
                Defending: 59,
                Control: 80,
              },
              rankings: {
                Attacking: 3,
                Defending: 2,
                Control: 3,
              },
              isNegativeRanked: {
                Attacking: false,
                Defending: true,
                Control: false,
              },
            }}
            awayData={{
              rawdata: {
                Attacking: 55,
                Defending: 45,
                Control: 70,
              },
              rankings: {
                Attacking: 5,
                Defending: 6,
                Control: 7,
              },
              isNegativeRanked: {
                Attacking: false,
                Defending: true,
                Control: false,
              },
            }}
          />

        </div>
      </div>
    </div>
  );

}
