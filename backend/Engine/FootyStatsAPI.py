import requests
import yaml
from Engine.Team import Team
from Engine.League import League
from Engine.Player import Player
from Engine.Match import Match
import os
import pickle

class FootyStatsAPI():

    def __init__(self):
        config_path = os.path.join(os.path.dirname(__file__), "config.yaml")
        with open(config_path, "r") as f:
            data = yaml.safe_load(f)
            self.__key = data["api_key"]
            self.__base_url = data["base_url"]
            self.__player_dict_save_path = data["players_dict_savepath"]

    def __getData(self, url):
        response = requests.get(url)
        return response.json()

    def getLeagueID(self, league_name, season=None):
        season_id = None
        data = self.__getData(f"{self.__base_url}/league-list?key={self.__key}")
     
        league_data = None
        for league in data.get("data", []):
            if league.get("name") == league_name:
                league_data = league
                break

        if league_data:

            latest_season = max(league_data['season'], key=lambda s: s['year'])

            # Get the id of the latest season
            latest_season_id = latest_season['id']
            
            season_id = latest_season_id

        return season_id
    
    def getLeague(self, season_id, stats=True):
        # League Information
        data = self.__getData(f"{self.__base_url}/league-season?key={self.__key}&season_id={season_id}")
        league_data = data.get("data", [])
        league = League(league_data.get("name"), season_id, league_data)

        if not stats:
            data = self.__getData(f"{self.__base_url}/league-teams?key={self.__key}&season_id={season_id}")
        else:
            data = self.__getData(f"{self.__base_url}/league-teams?key={self.__key}&season_id={season_id}&include=stats")

        league.setPlayers(self.__getPlayersFromTeam(season_id))

        for team in data.get("data", []):
            new_team = Team.from_dict(team)
            league.add_team(new_team)
        
        league.setPlayers(self.__getPlayersFromTeam(season_id))
        league.set_matches(self.getMatches(season_id))
        
        return league
    
    def getMatches(self, season_id: int, gameweek: int = None):
        match_dict = {}
        page = 1

        while True:
            url = f"{self.__base_url}/league-matches?key={self.__key}&season_id={season_id}&page={page}"
            data = self.__getData(url)

            # Early exit on API failure
            if not data.get("success", False):
                print(f"Failed to fetch data for page {page}: {data.get('message')}")
                break

            for match_data in data.get("data", []):
                match_id = match_data.get("id")
                gw = int(match_data.get("game_week")) if match_data.get("game_week") else -1
                if match_id is not None and (gameweek is None or gw == gameweek):
                    match = Match(
                        id=match_id,
                        home_team_id=match_data.get("homeID"),
                        away_team_id=match_data.get("awayID"),
                        gameweek=int(match_data.get("game_week")) if match_data.get("game_week") else -1,
                        match_data=match_data
                    )
                    match_dict[match_id] = match

            # Pagination
            pager = data.get("pager", {})
            current_page = pager.get("current_page", page)
            max_page = pager.get("max_page", page)

            if current_page >= max_page:
                break

            page += 1

        return match_dict


    
    def __getPlayersFromTeam(self, season_id : int, team_id=-1):
        players_dict = {}
        page = 1

        while True:
            url = f"{self.__base_url}/league-players?key={self.__key}&season_id={season_id}&page={page}"
            data = self.__getData(url)

            # Early exit on API failure
            if not data.get("success", False):
                print(f"Failed to fetch data for page {page}: {data.get('message')}")
                break

            for player_data in data.get("data", []):
                player_id = player_data.get("id")
                if player_id is not None:
                    player = Player(
                        id=player_id,
                        name=player_data.get("known_as"),
                        stats_footy=player_data
                    )
                    if player_data.get("club_team_id") == team_id or team_id == -1:
                        players_dict[player_id] = player

            # Handle pagination
            pager = data.get("pager", {})
            current_page = pager.get("current_page", page)
            max_page = pager.get("max_page", page)

            if current_page >= max_page:
                break

            page += 1

        # Save or load players_dict
        if players_dict:
            self.__save_players_dict(players_dict)
        else:
            players_dict = self.__load_saved_players_dict()

        return players_dict

    
    def __load_saved_players_dict(self):
        if os.path.exists(self.__player_dict_save_path):
            with open(self.__player_dict_save_path, "rb") as f:
                return pickle.load(f)
        return {}

    def __save_players_dict(self,players_dict):
        with open(self.__player_dict_save_path, "wb") as f:
            pickle.dump(players_dict, f)

        
        



# id = 12325
# api = API()
# league = api.getLeague(12325, True)
# print(api.getMatches(12325))