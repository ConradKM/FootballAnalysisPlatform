from typing import Optional, List, Union, Any

class Team():
    def __init__(
        self,
        id: int,
        name: str,
        cleanName: str,
        english_name: str,
        shortHand: str,
        country: str,
        continent: Optional[str],
        founded: str,
        image: str,
        flag_element: Optional[str],
        season: str,
        seasonClean: Optional[str],
        url: str,
        table_position: int,
        performance_rank: int,
        risk: int,
        season_format: str,
        competition_id: int,
        full_name: str,
        alt_names: Optional[List[str]] = None,
        official_sites: Optional[List[str]] = None,
        stats: Optional[dict] = None
    ):
        self.__id = id
        self.__name = name
        self.__cleanName = cleanName
        self.__english_name = english_name
        self.__shortHand = shortHand
        self.__country = country
        self.__continent = continent
        self.__founded = founded
        self.__image = image
        self.__flag_element = flag_element
        self.__season = season
        self.__seasonClean = seasonClean
        self.__url = url
        self.__table_position = table_position
        self.__performance_rank = performance_rank
        self.__risk = risk
        self.__season_format = season_format
        self.__competition_id = competition_id
        self.__full_name = full_name
        self.__alt_names = alt_names or []
        self.__official_sites = official_sites or []
        self.__stats = stats or {}
        self.__players = []

    # Property getters
    @property
    def id(self): return self.__id
    @property
    def name(self): return self.__name
    @property
    def cleanName(self): return self.__cleanName
    @property
    def english_name(self): return self.__english_name
    @property
    def shortHand(self): return self.__shortHand
    @property
    def country(self): return self.__country
    @property
    def continent(self): return self.__continent
    @property
    def founded(self): return self.__founded
    @property
    def image(self): return self.__image
    @property
    def flag_element(self): return self.__flag_element
    @property
    def season(self): return self.__season
    @property
    def seasonClean(self): return self.__seasonClean
    @property
    def url(self): return self.__url
    @property
    def table_position(self): return self.__table_position
    @property
    def performance_rank(self): return self.__performance_rank
    @property
    def risk(self): return self.__risk
    @property
    def season_format(self): return self.__season_format
    @property
    def competition_id(self): return self.__competition_id
    @property
    def full_name(self): return self.__full_name
    @property
    def alt_names(self): return self.__alt_names
    @property
    def official_sites(self): return self.__official_sites
    @property
    def stats(self): return self.__stats
    @property
    def players(self): return self.__players


    def get_stats(self, key: Optional[str] = None) -> Union[dict, Any]:
        if key:
            return self.__stats.get(key)
        return self.__stats

    def __repr__(self):
        return f"<Team {self.__name} ({self.__country})>"

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data.get('id'),
            name=data.get('name'),
            cleanName=data.get('cleanName'),
            english_name=data.get('english_name'),
            shortHand=data.get('shortHand'),
            country=data.get('country'),
            continent=data.get('continent'),
            founded=data.get('founded'),
            image=data.get('image'),
            flag_element=data.get('flag_element'),
            season=data.get('season'),
            seasonClean=data.get('seasonClean'),
            url=data.get('url'),
            table_position=data.get('table_position'),
            performance_rank=data.get('performance_rank'),
            risk=data.get('risk'),
            season_format=data.get('season_format'),
            competition_id=data.get('competition_id'),
            full_name=data.get('full_name'),
            alt_names=data.get('alt_names'),
            official_sites=data.get('official_sites'),
            stats=data.get('stats')
        )
