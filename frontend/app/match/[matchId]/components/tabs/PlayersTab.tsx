"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DropdownPlayerTable from "../charts/DropdownPlayerTable";
import TopRatedPlayersTable from "../charts/TopRatedPlayersTable";
import PenaltyTakersTable from "../charts/PenaltyTakerTable";
import MatchLineup from "../charts/LineupTable";

interface Player {
  id: number;
  name: string;
  image: string;
  [stat: string]: string | number;
}

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

interface Props {
  match: Match;
}

export default function PlayerTab({ match }: Props) {
  const stats = ["Goals", "Assists"];
  const statMap: Record<string, string> = {
    Goals: "goals",
    Assists: "assists",
  };

  const [playersByStat, setPlayersByStat] = useState<Record<string, Player[]>>({});
  const [loadingByStat, setLoadingByStat] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPlayersForStat = async (stat: string) => {
      if (!match?.id) return;
      setLoadingByStat((prev) => ({ ...prev, [stat]: true }));

      try {
        const res = await axios.get("http://localhost:8000/playerEngine/rank_players_by_stat", {
          params: { stat: statMap[stat], mode: "overall", top_n: 10, match_id: match.id },
        });
        setPlayersByStat((prev) => ({ ...prev, [stat]: res.data }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingByStat((prev) => ({ ...prev, [stat]: false }));
      }
    };

    stats.forEach((stat) => fetchPlayersForStat(stat));
  }, [match]);

  return (
    <div>
        <MatchLineup match={match} />
    <div className="w-full flex flex-col lg:flex-row gap-6">
    <div className="lg:flex-1">
        <TopRatedPlayersTable
        match={match}
        mode="overall"
        topN={5}
        ascending={false}
        />
    </div>

    <div className="lg:flex-1">
        <PenaltyTakersTable match={match} />
    </div>
</div>
</div>

  );
}
