"use client";

import { useEffect, useState } from "react";
import BarChart from "../charts/BarChart";

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

export default function CornersTab({ match }: Props) {
  const [homeData, setHomeData] = useState<Record<string, number> | null>(null);
  const [awayData, setAwayData] = useState<Record<string, number> | null>(null);
  const [over, setOver] = useState<boolean>(false); // toggle between normal / over

  useEffect(() => {
    async function fetchCorners() {
      if (!match) return;

      // Fetch home corners
      const homeRes = await fetch(
        `http://localhost:8000/grouped_stats?stat=over_corners&mode=home&team_id=${match.homeTeamId}&percentage=false&over=${over}`
      );
      const homeJson = await homeRes.json();
      setHomeData(homeJson);

      // Fetch away corners
      const awayRes = await fetch(
        `http://localhost:8000/grouped_stats?stat=over_corners&mode=away&team_id=${match.awayTeamId}&percentage=false&over=${over}`
      );
      const awayJson = await awayRes.json();
      setAwayData(awayJson);
    }

    fetchCorners();
  }, [match, over]);

  if (!homeData || !awayData) {
    return <p className="text-gray-600 text-center">📊 Loading corner stats...</p>;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Over Toggle */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setOver(false)}
          className={`px-4 py-2 rounded ${
            !over ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => setOver(true)}
          className={`px-4 py-2 rounded ${
            over ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Over
        </button>
      </div>

      <div className="flex gap-6 w-full">
        {/* Home Team */}
        <div className="flex-1">
          <h3 className="text-center font-semibold mb-3">{match.homeTeamName}</h3>
          {over ? <BarChart data={homeData} /> : <BarChart data={homeData} />}
        </div>

        {/* Away Team */}
        <div className="flex-1">
          <h3 className="text-center font-semibold mb-3">{match.awayTeamName}</h3>
          {over ? <BarChart data={awayData} /> : <BarChart data={awayData} />}
        </div>
      </div>
    </div>
  );
}
