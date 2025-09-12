"use client";

import { useEffect, useState } from "react";

interface PlayerEvent {
  event_type: string;
  event_time: string;
}

interface Player {
  player_id: number;
  name: string;
  shirt_number: number;
  player_events: PlayerEvent[];
}

interface Lineups {
  team_a: Player[];
  team_b: Player[];
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

interface LineupProps {
  match: Match;
}

const eventEmojiMap: Record<string, string> = {
  Yellow: "🟨",
  Goal: "⚽",
  Red: "🟥",
  Substitution: "🔄",
};

export default function MatchLineup({ match }: LineupProps) {
  const [lineups, setLineups] = useState<Lineups | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLineups = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/matchDetails/lineups?match_id=${match.id}`);
        const data: Lineups = await res.json();
        setLineups(data);
      } catch (err) {
        console.error("Failed to fetch lineups:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLineups();
  }, [match]);

  const renderEvents = (events: PlayerEvent[]) =>
    events.map((e, idx) => (
      <span key={idx} className="ml-1">
        {eventEmojiMap[e.event_type] || "❔"}
      </span>
    ));

  if (loading) return <p className="text-gray-500">Loading lineups...</p>;
  if (!lineups) return <p className="text-gray-500">No lineups found.</p>;

  return (
    <div className="w-full p-6 bg-gray-50">
      {/* Header with crests and names */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src={match.homeTeamLogo} alt={match.homeTeamName} className="w-12 h-12 object-contain" />
          <h2 className="font-bold text-xl">{match.homeTeamName}</h2>
        </div>
        <span className="text-gray-500 font-semibold">Lineups</span>
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-xl">{match.awayTeamName}</h2>
          <img src={match.awayTeamLogo} alt={match.awayTeamName} className="w-12 h-12 object-contain" />
        </div>
      </div>

      {/* Lineups */}
      <div className="flex justify-between gap-6">
        {/* Home Team */}
        <div className="flex-1 bg-white p-4 rounded-2xl shadow-md">
          <ul className="space-y-2">
            {lineups.team_a.map((player) => (
              <li key={player.player_id} className="flex justify-between items-center px-2">
                <span>#{player.shirt_number}</span>
                <span className="font-medium">{player.name}</span>
                <span>{renderEvents(player.player_events)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Away Team */}
        <div className="flex-1 bg-white p-4 rounded-2xl shadow-md">
          <ul className="space-y-2">
            {lineups.team_b.map((player) => (
              <li key={player.player_id} className="flex justify-between items-center px-2">
                <span>{renderEvents(player.player_events)}</span>
                <span className="font-medium">{player.name}</span>
                <span>#{player.shirt_number}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
