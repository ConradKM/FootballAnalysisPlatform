// app/match/[matchId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { use } from 'react';
import Image from "next/image";
import CornersTab from "./components/tabs/CornersTab";
import RadarChart from "./components/charts/RadarChart";
import GeneralTab from "./components/tabs/GeneralTab";

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
  params: { matchId: string };
}

export default function MatchPage({ params }: Props) {
  const [matchId, setMatchID] = useState<string | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState("General");

  useEffect(() => {
    if (params?.matchId) {
      setMatchID(params.matchId);
    }
  }, [params]);


  useEffect(() => {
    async function fetchMatch() {
      const res = await fetch(`http://localhost:8000/match/${matchId}`);
      const data = await res.json();
      setMatch(data);
      console.log(data)
    }
    fetchMatch();
  }, [matchId]);

  if (!match) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex flex-col items-center px-6 py-12">
      {/* Match Header */}
      <div className="flex items-center justify-center gap-16 mb-8">
        {/* Home Team */}
        <div className="flex flex-col items-center text-center">
          <Image
            src={match.homeTeamLogo}
            alt={match.homeTeamName}
            width={100}
            height={100}
          />
          <h2 className="text-xl font-bold mt-3">{match.homeTeamName}</h2>
        </div>

        {/* Date */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-lg text-gray-600">{match.date}</span>
          <h1 className="text-2xl font-bold text-black my-2">VS</h1>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center text-center">
          <Image
            src={match.awayTeamLogo}
            alt={match.awayTeamName}
            width={100}
            height={100}
          />
          <h2 className="text-xl font-bold mt-3">{match.awayTeamName}</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-4/5 mx-auto">
        <div className="flex border-b mb-6">
          {["General", "Corners", "Cards"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center font-semibold ${
                activeTab === tab
                  ? "border-b-4 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "General" && match && <GeneralTab match={match} />}
          {activeTab === "Corners" && match && <CornersTab match={match} /> }
          {activeTab === "Cards" && (
            <p className="text-gray-600">🟨 Card statistics here... <RadarChart
  data={{ Corners: 8, Goals: 3, Cards: 2 }}
  label="Arsenal"
  centerImage="https://cdn.footystats.org/img/teams/england-arsenal-fc.png"
/>
</p>
          )}
        </div>
      </div>

    </div>
  );
}
