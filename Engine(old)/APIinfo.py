import requests
import yaml
from Team import Team
from League import League

class API():

    def __init__(self):
        with open("./config.yaml", "r") as f:
            data = yaml.safe_load(f)
            self.__key = data["api_key"]
            self.__base_url = data["base_url"]

    def __getData(self, url):
        response = requests.get(url)
        return response.json()

    def getLeagueID(self, league_name, season=None):
        season_id = None
        data = self.__getData(f"{self.__base_url}/league-list?key={self.__key}")
     
        print(data)
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

        if stats:
            data = self.__getData(f"{self.__base_url}/league-teams?key={self.__key}&season_id={season_id}")
        else:
            data = self.__getData(f"{self.__base_url}/league-teams?key={self.__key}&season_id={season_id}&include=stats")


        for team in data.get("data", []):
            new_team = Team.from_dict(team)
            league.add_team(new_team)

        return league
    
    def getPlayersFromTeam(self, season_id, team_id):
        data = self.__getData(f"{self.__base_url}/league-player?key={self.__key}&season_id={season_id}")
        
        



id = 12325
api = API()
print(api.getLeague(12325, True))
