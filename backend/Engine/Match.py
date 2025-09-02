from typing import Dict, Optional, Any, Union


class Match:
    def __init__(self, id: int, home_team_id: int, away_team_id: int, gameweek: int, match_data: Dict):
        self.__id = id
        self.__home_team_id = home_team_id
        self.__away_team_id = away_team_id
        self.__gameweek = gameweek
        self.__match_data = match_data

    @property
    def id(self) -> int:
        return self.__id

    @property
    def home_team_id(self) -> int:
        return self.__home_team_id

    @property
    def away_team_id(self) -> int:
        return self.__away_team_id

    @property
    def gameweek(self) -> int:
        return self.__gameweek

    @property
    def match_data(self) -> Dict:
        return self.__match_data

    def get_data(self, key: Optional[str] = None) -> Union[dict, Any]:
        if key:
            return self.__match_data.get(key)
        return self.__match_data

    def __repr__(self):
        return (f"<Match ID: {self.__id} | "
                f"Home: {self.__home_team_id} vs Away: {self.__away_team_id} | "
                f"GW: {self.__gameweek}>")

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data.get("id"),
            home_team_id=data.get("home_team_id"),
            away_team_id=data.get("away_team_id"),
            gameweek=data.get("gameweek"),
            match_data=data
        )
