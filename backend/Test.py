from Engine.Team import Team
from Engine.League import League
from Engine.Player import Player
from Engine.Match import Match
from Engine.FootyStatsAPI import FootyStatsAPI

api = FootyStatsAPI()
print(api.getLeagueID("England Premier League"))
league = api.getLeague(12325)
print(league.get_team(151).get_stats())