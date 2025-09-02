from fastapi import FastAPI, Query
from typing import List, Dict, Optional
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from Engine.FootyStatsAPI import FootyStatsAPI

# Create FastAPI app
app = FastAPI()
footyapi = FootyStatsAPI()

# Load the league once (so it’s cached and reused)
league = footyapi.getLeague(season_id=12325)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from Engine.LeagueEngine import LeagueEngine
leagueEngine = LeagueEngine(league)

def process_mode(stat:str, mode:str = None):
    return f"{stat}_{mode}" if mode else f"{stat}_overall"


@app.get("/matches/{gameweek}")
def getMatches(gameweek: int) -> List[Dict]:
    matches = league.get_matches(gameweek=gameweek)

    response = []
    for match in matches.values():
        data = match.match_data
        date_str = datetime.fromtimestamp(data.get("date_unix")).strftime("%Y-%m-%d %H:%M")
        homeTeam = league.get_team(match.home_team_id)
        awayTeam = league.get_team(data.get("awayID"))
        


        response.append({
            "id": match.id,
            "homeTeamName": homeTeam.cleanName,
            "homeTeamLogo": f"https://cdn.footystats.org/img/{data.get('home_image')}",   # full URL
            "awayTeamLogo": f"https://cdn.footystats.org/img/{data.get('away_image')}",  # full URL
            "awayTeamName": awayTeam.cleanName,  
            "stadiumName": data.get("stadiumName"),
            "date": date_str,
            "href": f"/match/{match.id}",           # internal route for your frontend
        })

    return response

@app.get("/match/{matchId}")
def getMatch(matchId : int) -> Dict:
    match = league.get_match_by_id(matchId)
    data = match.match_data
    date_str = datetime.fromtimestamp(data.get("date_unix")).strftime("%Y-%m-%d %H:%M")
    homeTeam = league.get_team(match.home_team_id)
    awayTeam = league.get_team(data.get("awayID"))
    print(data.get("homeID"))
    print(data.get("awayID"))

    
    return {
        "id": match.id,
        "homeTeamName": homeTeam.cleanName,
        "homeTeamLogo": f"https://cdn.footystats.org/img/{data.get('home_image')}",   # full URL
        "awayTeamLogo": f"https://cdn.footystats.org/img/{data.get('away_image')}",  # full URL
        "awayTeamName": awayTeam.cleanName,  
        "stadiumName": data.get("stadiumName"),
        "date": date_str,
        "href": f"/match/{match.id}",
        "homeTeamId": data.get("homeID"),
        "awayTeamId": data.get("awayID"),
    }

@app.get("/league/team/{team_id}")
def getTeam(team_id : int) -> Dict:
    return league.get_team(team_id).get_stats()


@app.get("/grouped_stats")
def getGroupedStats_Team(
    stat: str,
    mode: str,
    team_id: int,
    percentage: Optional[bool] = Query(False), 
    over: Optional[bool] = Query(True)  # 👈 optional, defaults to False
) -> Dict:
    return leagueEngine.get_grouped_stats_team(stat, team_id, mode, percentage, over)

@app.get("/leagueEngine/team_matchradarchart")
def team_matchradarchart(
    team_id: int,
    mode: str = Query(None, description="overall, home, away")
) -> Dict:
    labels_to_attributes = {
        "Attacking": ["seasonScoredAVG", "xg_for_avg"],
        "Defending": ["seasonCS", "seasonConcededAVG", "xg_against_avg"],
        "Control": ["possessionAVG", "leadingAtHT"],
        "Efficiency": ["seasonPGG", "seasonGoalDifference"],
        "Set Pieces": ["cornersAVG", "fouls_recorded"]
    }

    # Stats where lower is better → negative_ranking=True
    negative_stats = {"seasonConcededAVG", "xg_against_avg", "risk"}

    try:
        team = league.get_team(team_id)
        rankings = {}

        all_teams = league.get_all_teams()  # dict[int, Team]

        for category, stats in labels_to_attributes.items():
            team_scores = {}

            # Calculate composite score per team
            for tid, t in all_teams.items():
                values = []
                for stat in stats:
                    processed_stat = f"{stat}_{mode}" if mode else f"{stat}_overall"
                    is_negative = stat in negative_stats
                    try:
                        rank_value = leagueEngine.compare_team_to_league(processed_stat, tid)
                        if rank_value is not None:
                            # Flip value if lower is better
                            values.append(-rank_value if is_negative else rank_value)
                    except Exception:
                        print(f"The stat {stat} has no endpoint")
                        continue

                # Average of available stats
                team_scores[tid] = sum(values) / len(values) if values else None

            # Sort teams descending → best = rank 1
            sorted_teams = [tid for tid, val in sorted(
                team_scores.items(),
                key=lambda x: (x[1] is None, x[1] if x[1] is not None else float('-inf'))
            )]

            # Get rank of requested team
            if team_id in sorted_teams:
                rankings[category] = sorted_teams.index(team_id) + 1  # 1-based
            else:
                rankings[category] = None

        return {
            "team": team.name,
            "rankings": rankings,
        }

    except Exception as e:
        return {"error": str(e)}
    

