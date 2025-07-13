from typing import Dict, Optional, Union, Any
from Team import Team  # Make sure your Team class is in team.py or adjust import

class League:
    def __init__(self, name: str, seasonID: int, stats: Optional[dict] = None):
        self.__name = name
        self.__seasonID = seasonID
        self.__teams: Dict[int, Team] = {}
        self.__stats = stats or {}

    def add_team(self, team: Team):
        self.__teams[team.id] = team

    def get_team(self, team_id: int) -> Team:
        return self.__teams.get(team_id)

    def get_all_teams(self) -> Dict[int, Team]:
        return self.__teams

    @property
    def name(self) -> str:
        return self.__name

    @property
    def season(self) -> int:
        return self.__seasonID
    
    @property
    def stats(self) -> int:
        return self.__stats
    
    def get_stats(self, key: Optional[str] = None) -> Union[dict, Any]:
        if key:
            return self.__stats.get(key)
        return self.__stats

    

    def __repr__(self):
        return f"<League {self.__name} {self.__seasonID} with {len(self.__teams)} teams>"