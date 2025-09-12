"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface PenaltyTaker {
  id: number;
  name: string;
  team: string;
  image: string;
  penalties_taken: number;
  penalty_goals: number;
  penalty_conversion_rate: number;
  main_penalty_taker: boolean;
}

interface Match {
  id: string;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamName: string;
  awayTeamLogo: string;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
}

interface PenaltyTakersTableProps {
  match: Match;
}

export default function PenaltyTakersTable({ match }: PenaltyTakersTableProps) {
  const [players, setPlayers] = useState<PenaltyTaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const res = await axios.get<PenaltyTaker[]>(
          "http://localhost:8000/playerEngine/penalty_takers",
          { params: { match_id: match.id } }
        );
        setPlayers(res.data);
      } catch (err) {
        console.error("Failed to fetch penalty takers:", err);
      } finally {
        setLoading(false);
      }
    };

    if (match?.id) fetchPlayers();
  }, [match]);

  if (loading) return <p className="text-gray-500">Loading penalty takers...</p>;
  if (players.length === 0) return <p className="text-gray-500">No penalty takers found.</p>;

  return (
    <div className="w-full overflow-x-auto shadow-md">
      <table className="w-full border-collapse text-m">
        <thead>
          <tr className="bg-gray-100 text-gray-700 font-semibold text-left">
            <th className="px-4 py-2 text-center">Team</th>
            <th className="px-4 py-2 text-center">Player</th>
            <th className="px-4 py-2 text-center">Penalties Taken</th>
            <th className="px-4 py-2 text-center">Penalty Goals</th>
            <th className="px-4 py-2 text-center">Conversion Rate</th>
            <th className="px-4 py-2 text-center">Main Taker</th>
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
              <tr key={player.id} className={`${rowColor} hover:opacity-90 transition`}>
                {/* Team logo */}
                <td className="px-4 py-2 text-center">
                  <img
                    src={teamLogo}
                    alt={isHome ? match.homeTeamName : match.awayTeamName}
                    className="w-8 h-8 object-contain mx-auto"
                  />
                </td>

                {/* Player info */}
                <td className="px-4 py-2 text-center font-medium flex items-center ">
                  <span>{player.name}</span>
                </td>

                <td className="px-4 py-2 text-center">{player.penalties_taken}</td>
                <td className="px-4 py-2 text-center">{player.penalty_goals}</td>
                <td className="px-4 py-2 text-center">
                  {(player.penalty_conversion_rate * 100).toFixed(0)}%
                </td>
                <td className="px-4 py-2 text-center font-semibold">
                  {player.main_penalty_taker ? "⭐" : " "}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
