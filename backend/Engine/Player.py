from typing import Dict, Optional, Union, Any

class Player:
    def __init__(self, id: int, name: str, stats_footy: Dict):
        self.__id = id
        self.__name = name
        self.__stats_footy = stats_footy
        self.__team_id = stats_footy.get("club_team_id")

    @property
    def id(self) -> int:
        return self.__id

    @property
    def name(self) -> str:
        return self.__name

    @property
    def stats_footy(self) -> Dict:
        return self.__stats_footy
    
    @property
    def team_id(self) -> Optional[int]:
        return self.__stats_footy.get("club_team_id")

    def get_stats(self, key: Optional[str] = None) -> Union[dict, Any]:
        if key:
            return self.__stats_footy.get(key)
        return self.__stats_footy
    
    @property
    def image(self) -> Optional[str]:
        return self.__convert_player_url(self.__stats_footy.get("url")) if self.__stats_footy.get("url") else None

    def __repr__(self):
        return f"<Player {self.__name} (ID: {self.__id})>"

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data.get("id"),
            name=data.get("known_as"),
            stats_footy=data,
            team_id=data.get("club_team_id")
        )
    
    def __convert_player_url(self, url: str) -> str:
        base = "https://cdn.footystats.org/img/players/"
        path = url.replace("https://footystats.org/players/", "").replace("/", "-")
        return f"{base}{path}.png"


        

