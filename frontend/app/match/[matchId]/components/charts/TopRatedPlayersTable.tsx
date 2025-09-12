"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Player {
  id: number;
  name: string;
  team: string; // matches Match.homeTeamId or Match.awayTeamId
  position: string;
  goals: number;
  assists: number;
  clean_sheets: number;
  image: string;
  rating: number;
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

interface TopRatedPlayersTableProps {
  match: Match;
  mode?: string;
  topN?: number;
  ascending?: boolean;
}

export default function TopRatedPlayersTable({
  match,
  mode = "overall",
  topN = 5,
  ascending = false,
}: TopRatedPlayersTableProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const res = await axios.get<Player[]>("http://localhost:8000/playerEngine/get_top_rated_players", {
          params: { match_id: match.id, mode, top_n: topN, ascending },
        });
        setPlayers(res.data);
      } catch (err) {
        console.error("Failed to fetch top rated players:", err);
      } finally {
        setLoading(false);
      }
    };

    if (match?.id) {
      fetchPlayers();
    }
  }, [match, mode, topN, ascending]);

  if (loading) return <p className="text-gray-500">Loading top players...</p>;
  if (players.length === 0) return <p className="text-gray-500">No players found.</p>;

  return (
    <div className="w-full overflow-x-auto shadow-md">
      <table className="w-full border-collapse text-m">
        <thead>
          <tr className="bg-gray-100 text-gray-700 font-semibold text-left">
            <th className="px-4 py-2 text-center">Team</th>
            <th className="px-4 py-2 text-center">Player</th>
            <th className="px-4 py-2 text-center">Pos</th>
            <th className="px-4 py-2 text-center">Goals</th>
            <th className="px-4 py-2 text-center">Assists</th>
            <th className="px-4 py-2 text-center">Clean Sheets</th>
            <th className="px-4 py-2 text-center">Rating</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const isHome = player.team === match.homeTeamId;
            const rowColor = isHome
              ? "bg-[rgba(89,203,255,0.25)]" // home → light blue
              : "bg-[rgba(255,119,74,0.25)]"; // away → orange
            const teamLogo = isHome ? match.homeTeamLogo : match.awayTeamLogo;

            return (
              <tr
                key={player.id}
                className={`${rowColor} hover:opacity-90 transition`}
              >
                {/* 🔹 Team logo column */}
                <td className="margin:auto px-4 py-3">
                  <img
                    src={teamLogo}
                    alt={isHome ? match.homeTeamName : match.awayTeamName}
                    className="w-8 h-8 object-contain"
                  />
                </td>

                {/* 🔹 Player info */}
                <td className="px-4 py-3 text-center">
                  <span className=" font-medium">{player.name}</span>
                </td>
                <td className="px-4 py-3 text-center">{player.position}</td>
                <td className="px-4 py-3 text-center">{player.goals ?? "-"}</td>
                <td className="px-4 py-3 text-center">{player.assists ?? "-"}</td>
                <td className="px-4 py-3 text-center">{player.clean_sheets ?? "-"}</td>
                <td className="px-4 py-3 font-semibold text-center">
                  {player.rating.toFixed(5)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
