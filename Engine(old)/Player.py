import requests
api_url = "https://api.football-data-api.com/player-stats?key=test85g57&referee_id=393"
response = requests.get(api_url)
data = response.json()
print(data)