from typing import Dict, Optional, Union, Any, List
from Engine.Team import Team  # Make sure your Team class is in team.py or adjust import
from Engine.Player import Player
from Engine.Match import Match

class League:
    def __init__(self, name: str, seasonID: int, stats: Optional[dict] = None):
        self.__name = name
        self.__seasonID = seasonID
        self.__teams: Dict[int, Team] = {}
        self.__players: Dict[int, Player] = {}
        self.__matches: Dict[int,Match] = {}
        self.__stats = stats or {}

    def add_team(self, team: Team):
        self.__teams[team.id] = team

    def get_team(self, team_id: int) -> Team:
        return self.__teams.get(team_id)
    
    def get_player(self, player_id: int) -> Player:
        return self.__players.get(player_id)

    def get_all_teams(self) -> Dict[int, Team]:
        return self.__teams
    
    def setPlayers(self, players):
        self.__players = players

    def get_players(self):
        return self.__players
    
    def set_matches(self, matches):
        self.__matches = matches
    
    def get_matches(self, gameweek: int = None):
        """Return all matches, or filter by gameweek if provided."""
        if gameweek is None:
            return self.__matches

        return {
            match_id: match
            for match_id, match in self.__matches.items()
            if match.gameweek == gameweek
        }

    def get_match_by_id(self, match_id: int) -> Match:
        """Return a single match by its ID, or None if not found."""
        return self.__matches.get(match_id)

    def print_all_teams(self):
        for team_id, team_obj in self.__teams.items():
            print(f"ID: {team_id} -> Team: {team_obj}")

    @property
    def name(self) -> str:
        return self.__name

    @property
    def id(self) -> int:
        return self.__seasonID
    
    @property
    def stats(self) -> int:
        return self.__stats
    
    def get_stats(self, key: Optional[str] = None) -> Union[dict, Any]:
        if key:
            return self.__stats.get(key)
        return self.__stats
    
    def compareTeamsbyStat(self, home_team: int, away_team: int, stat: str) -> dict:
        
        teamH = self.get_team(home_team)
        teamA = self.get_team(away_team)
        leagueAVG_home = self.get_stats(f"{stat}AVG_home")
        leagueAVG_away = self.get_stats(f"{stat}AVG_away")

        teamH_AVG = teamH.get_stats(f"{stat}AVG_home")
        teamA_AVG = teamA.get_stats(f"{stat}AVG_away")

        teamH_diff = teamH_AVG - leagueAVG_home
        teamA_diff = teamA_AVG - leagueAVG_away

        return {
            "home_team": {
                "id": home_team,
                "avg": teamH_AVG,
                "league_avg": leagueAVG_home,
                "difference": teamH_diff,
            },
            "away_team": {
                "id": away_team,
                "avg": teamA_AVG,
                "league_avg": leagueAVG_away,
                "difference": teamA_diff,
            },
            "stat": stat
        }



    

    def __repr__(self):
        return f"<League {self.__name} {self.__seasonID} with {len(self.__teams)} teams>"