from typing import Dict, Optional, Union, Any

class Player:
    def __init__(self, id: int, name: str, stats_footy: Dict):
        self.__id = id
        self.__name = name
        self.__stats_footy = stats_footy

    @property
    def id(self) -> int:
        return self.__id

    @property
    def name(self) -> str:
        return self.__name

    @property
    def stats_footy(self) -> Dict:
        return self.__stats_footy

    def get_stats(self, key: Optional[str] = None) -> Union[dict, Any]:
        if key:
            return self.__stats_footy.get(key)
        return self.__stats

    def __repr__(self):
        return f"<Player {self.__name} (ID: {self.__id})>"

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data.get("id"),
            name=data.get("known_as"),
            stats_footy=data
        )
