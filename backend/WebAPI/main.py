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
from Engine.PlayerEngine import PlayerEngine
leagueEngine = LeagueEngine(league)
playerEngine = PlayerEngine(league)

def process_mode(stat:str, mode:str = None):
    if stat == "risk":
        return "risk" 
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
        "Efficiency": ["seasonPPG", "seasonGoalDifference"],
        "Set Pieces": ["cornersAVG", "foulsAVG"],
        "Risk": ["risk"]
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

@app.get("/leagueEngine/team_matchtable")
def team_matchtable(match_id: int) -> Dict:
    match = league.get_match_by_id(match_id)
    home_team_id = match.home_team_id
    away_team_id = match.away_team_id
    home_team = league.get_team(home_team_id)
    away_team = league.get_team(away_team_id)

    negative_stats = {"seasonConcededAVG", "xg_against_avg", "risk"}

    # Display names → underlying stat key
    stats = {
        "Points Per Game": "seasonPPG",
        "Goals Per Game": "seasonScoredAVG",
        "Average XG For": "xg_for_avg",
        "Average XG Against": "xg_against_avg",
        "Goals Conceded Per Game": "seasonConcededAVG",
        "Clean Sheets": "seasonCS",
        "Possession %": "possessionAVG",
        "Corners Per Game": "cornersAVG",
        "Fouls Committed Per Game": "foulsAVG",
        "Risk": "risk"
    }

    def build_team_data(team_id: int, mode=None) -> Dict:
        rawdata = {}
        rankings = {}
        isNegativeRanked = {}

        for display_name, stat_key in stats.items():
            processed_stat = process_mode(stat_key, mode)
            print(f"Processing stat: {processed_stat} for team {team_id}")
            is_negative = stat_key in negative_stats


            try:
                # raw stat value from the team
                team_stats = league.get_team(team_id).get_stats()
                raw_val = team_stats.get(processed_stat)

                # league rank (1 = best, N = worst)
                rank = leagueEngine.compare_team_to_league(
                    processed_stat, team_id, negative_ranking=is_negative
                )

                rawdata[display_name] = raw_val
                rankings[display_name] = rank
                isNegativeRanked[display_name] = is_negative

            except Exception as e:
                print(f"Stat {stat_key} failed for team {team_id}: {e}")
                rawdata[display_name] = None
                rankings[display_name] = None
                isNegativeRanked[display_name] = is_negative

        return {
            "rawData": rawdata,
            "rankings": rankings,
            "isNegativeRanked": isNegativeRanked,
        }

    return {
        "homeTeamImage": home_team.cleanName,
        "awayTeamImage": away_team.cleanName,
        "homeData": build_team_data(home_team_id, "home"),
        "awayData": build_team_data(away_team_id, "away"),
    }

@app.get("/playerEngine/rank_players_by_stat")
def rank_players_by_stat(
    stat: str,
    team_id: Optional[int] = Query(None, description="Filter players who played in this match"),
    match_id: Optional[int] = Query(None, description="Filter players who played in this match"),
    mode: str = Query("overall", description="home, away, overall"),
    top_n: int = Query(10, description="Number of top players to return"),
    ascending: bool = Query(False, description="Sort order: False=desc, True=asc")
) -> List[Dict]:
    """
    Returns top N players ranked by a stat, including player info (id, name, image).
    """
    stat = process_mode(stat, mode)
    if team_id is None and match_id is None:
        try:
            # Rank players by stat
            ranked_players = playerEngine.rank_players_by_stat(stat, mode, top_n, ascending)

            # Add additional player info (image)
            result = []
            for player_info in ranked_players:
                player_id = player_info["id"]
                player = league.get_player(player_id)
                result.append({
                    "id": player.id,
                    "name": player.name,
                    "image": player.image,
                    **{k: v for k, v in player_info.items() if k != "id" and k != "name"}
                })

            return result

        except ValueError as ve:
            return {"error": str(ve)}
    elif team_id is not None and match_id is None:
        try:
            # Get match and both teams
            
            team = league.get_team(team_id)
            print(f"Found team: {team.name} with players: {team.players}")
            players = team.players
            if not players:
                return {"error": f"No players found for team ID {team_id}"}

            ranked = []
            for player_id in players:
                player = league.get_player(player_id)
                try:
                    stat_value = player.get_stats(stat)
                except Exception as e:
                    print(f"Error getting stat {stat} for player {player.name} (ID: {player.id}): {e}")
                    stat_value = None


                if stat_value is not None:
                    ranked.append({
                        "id": player.id,
                        "name": player.name,
                        "image": player.image,
                        "stat": stat_value
                    })

            # Sort by stat and return top N
            ranked.sort(key=lambda x: x["stat"], reverse=not ascending)
            return ranked[:top_n]

        except Exception as e:
            return {"error": str(e)}
    elif match_id is not None and team_id is None:
        try:
            match = league.get_match_by_id(match_id)
            if not match:
                return {"error": f"No match found with ID {match_id}"}

            home_team = league.get_team(match.home_team_id)
            away_team = league.get_team(match.away_team_id)

            all_players = home_team.players + away_team.players
            if not all_players:
                return {"error": f"No players found for match ID {match_id}"}

            ranked = []
            for player_id in all_players:
                player = league.get_player(player_id)
                try:
                    stat_value = player.get_stats(stat)
                except Exception as e:
                    print(f"Error getting stat {stat} for player {player.name} (ID: {player.id}): {e}")
                    stat_value = None

                if stat_value is not None:
                    ranked.append({
                        "id": player.id,
                        "name": player.name,
                        "image": player.image,
                        "stat": stat_value
                    })

            # Sort by stat and return top N
            ranked.sort(key=lambda x: x["stat"], reverse=not ascending)
            return ranked[:top_n]

        except Exception as e:
            return {"error": str(e)}
        
@app.get("/playerEngine/get_top_rated_players")
def get_top_rated_players(
    match_id: int,
    mode: str = Query("overall", description="home, away, overall"),
    top_n: int = Query(5, description="Number of top players to return"),
    ascending: bool = Query(False, description="Sort order: False=desc, True=asc")
) -> List[Dict]:
    """
    Returns top N players by rating for a specific match, including player info (id, name, image).
    """
    try:
        # Get top rated players for the match
        top_players = playerEngine.get_top_rated_players(match_id, mode, top_n, ascending)
        positions = {"Goalkeeper": "GK", "Defender": "DEF", "Midfielder": "MID", "Forward": "FWD"}
        # Add additional player info (image)
        match = league.get_match_by_id(match_id)
        home_team = league.get_team(match.home_team_id)
        away_team = league.get_team(match.away_team_id)
        result = []
        for player_info in top_players:
            player_id = player_info["id"]
            player_stats = league.get_player(player_id).get_stats()
            player = league.get_player(player_id)
            result.append({
                "id": player.id,
                "name": player.name,
                "team": home_team.id if player.team_id == home_team.id else away_team.id,
                "position": positions.get(player_stats.get("position")),
                "goals": player_stats.get(process_mode("goals")),
                "assists": player_stats.get(process_mode("assists")),
                "clean_sheets": player_stats.get(process_mode("clean_sheets")),
                "image": player.image,
                **{k: v for k, v in player_info.items() if k != "id" and k != "name"}
            })

        return result

    except ValueError as ve:
        return {"error": str(ve)}
    except Exception as e:
        return {"error": str(e)}

    
@app.get("/league/players/{player_id}")
def getPlayer(player_id : int) -> Dict:
    player = league.get_player(player_id)
    return {
        "id": player.id,
        "name": player.name,
        "image": player.image,
    }

@app.get("/playerEngine/penalty_takers")
def get_penalty_takers(match_id: int) -> List[Dict]:
    match = league.get_match_by_id(match_id)
    if not match:
        return {"error": f"No match found with ID {match_id}"}
    
    home_team = league.get_team(match.home_team_id)
    away_team = league.get_team(match.away_team_id)

    penalty_takers = []
    for team in [home_team, away_team]:
        # try:
            takers = playerEngine.penalty_takers(team.id)
            print(f"Penalty takers for team {team.name}: {takers}")
            for taker in takers:
                player = league.get_player(taker["id"])
                penalty_takers.append({
                    "id": player.id,
                    "name": player.name,
                    "team": player.team_id,
                    **{k: v for k, v in taker.items() if k != "id"}
                })
        # except Exception as e:
        #     print(f"Error fetching penalty takers for team {team.name}: {e}")
        #     continue
    penalty_takers_sorted = sorted(
        penalty_takers,
        key=lambda p: p.get("penalties_taken", 0),
        reverse=True
    )

    return penalty_takers_sorted

@app.get("/matchDetails/lineups")
def get_match_lineups(match_id: int) -> Dict:
    match_details = footyapi.getMatchDetails(match_id)
    lineups = match_details.get("lineups", {})

    # Define position order mapping
    position_map = {
        "Goalkeeper": "GK",
        "Defender": "DEF",
        "Midfielder": "MID",
        "Forward": "FWD"
    }
    position_order = ["GK", "DEF", "MID", "FWD"]

    # Process each team
    for team_key in ["team_a", "team_b"]:
        if team_key in lineups:
            enriched_players = []
            for player in lineups[team_key]:
                player_obj = league.get_player(player["player_id"])
                # Add name
                player["name"] = player_obj.name if player_obj else "Unknown"
                # Add position abbreviation
                raw_position = player_obj.get_stats("position") if player_obj else "Unknown"
                player["position"] = position_map.get(raw_position, "UNK")
                enriched_players.append(player)
            
            # Sort players by position order
            lineups[team_key] = sorted(
                enriched_players,
                key=lambda p: position_order.index(p["position"]) if p["position"] in position_order else 99
            )

    return lineups



