from Engine.League import League
from typing import Dict, List

class PlayerEngine():
    def __init__(self,league : League):
        self.__league = league

    def process_mode(self, stat:str, mode:str = None):
        if stat == "risk":
            return "risk" 
        return f"{stat}_{mode}" if mode else f"{stat}_overall"
    
    def rank_players_by_stat(
        self, 
        stat: str, 
        mode: str = "overall", 
        top_n: int = 10, 
        ascending: bool = False
    ) -> List[Dict]:
        valid_modes = {"home", "away", "overall"}
        if mode not in valid_modes:
            raise ValueError(f"Invalid mode: {mode}")

        if stat == "risk":
            stat_key = "risk"
        else:
            stat_key = f"{stat}_{mode}"

        players_with_stat = [
            (player.id, player.name, player.get_stats(stat_key))
            for player in self.__league.get_players().values()
            if player.get_stats(stat_key) is not None
        ]

        sorted_players = sorted(
            players_with_stat, 
            key=lambda x: x[2], 
            reverse=not ascending
        )

        top_players = sorted_players[:top_n]

        return [
            {"id": pid, "name": name, stat_key: value}
            for pid, name, value in top_players
        ]
    
    def get_top_rated_players(
            self,
            match_id: int,
            mode: str = "overall",
            top_n: int = 5,
            ascending: bool = False
    ) -> List[Dict]:
        match = self.__league.get_match_by_id(match_id)
        if not match:
            raise ValueError(f"Match ID {match_id} not found")

        
        home_team = self.__league.get_team(match.home_team_id)
        away_team = self.__league.get_team(match.away_team_id)
        if not home_team or not away_team:
            raise ValueError("One or both teams not found in league")
        player_ids = home_team.players + away_team.players

        players_with_ratings = []
        for pid in player_ids:
            player = self.__league.get_player(pid)
            if player:
                rating = self.calculate_rating(pid, mode)
                if rating != -1 and player.get_stats("minutes_played_overall") > 900:
                    players_with_ratings.append((pid, player.name, rating))

        sorted_players = sorted(
            players_with_ratings,
            key=lambda x: x[2],
            reverse=not ascending
        )

        top_players = sorted_players[:top_n]

        return [
            {"id": pid, "name": name, "rating": value}
            for pid, name, value in top_players
        ]
    
    
    def calculate_rating(
            self,
            player_id: int,
            mode: str = "overall",
    ) -> float:
        stats = {
            "goals": 0.5,
            "assists": 0.5,
            "clean_sheets": 0.5
        }
        rating = 0
        for stat, weight in stats.items():
            stat_key = self.process_mode(stat, mode)
            value = self.__league.get_player(player_id).get_stats(stat_key)
            if stat == "clean_sheets" and  self.__league.get_player(player_id).get_stats("position") in ["Forward"]:
                value = 0.25 * weight
            elif stat == "clean_sheets" and  self.__league.get_player(player_id).get_stats("position") in ["Midfielder"]:
                value = 0.5 * weight
            elif value is not None:
                rating += value * weight
        
        rating = rating / self.__league.get_player(player_id).get_stats("minutes_played_overall") if self.__league.get_player(player_id).get_stats("minutes_played_overall") else -1
        return rating
    
    def penalty_takers(self, team_id: int) -> List[Dict]:
        team = self.__league.get_team(team_id)
        if not team:
            raise ValueError(f"Team ID {team_id} not found")

        # Filter players who have taken at least one penalty
        players = [
            self.__league.get_player(pid)
            for pid in team.players
            if self.__league.get_player(pid) and 
            (self.__league.get_player(pid).get_stats("penalty_goals") + 
                self.__league.get_player(pid).get_stats("penalty_misses")) > 0
        ]

        # Sort by total penalties taken
        players_sorted = sorted(
            players,
            key=lambda p: (p.get_stats("penalty_goals") + p.get_stats("penalty_misses")),
            reverse=True
        )

        if not players_sorted:
            return []

        # Determine the max penalties taken
        max_penalties = players_sorted[0].get_stats("penalty_goals") + players_sorted[0].get_stats("penalty_misses")

        # Return top 3 with a flag for main penalty taker
        top_players = players_sorted[:3]
        return [
            {
                "id": player.id,
                "name": player.name,
                "penalties_taken": player.get_stats("penalty_goals") + player.get_stats("penalty_misses"),
                "penalty_goals": player.get_stats("penalty_goals"),
                "penalty_conversion_rate": (player.get_stats("penalty_goals") / (player.get_stats("penalty_goals") + player.get_stats("penalty_misses"))),
                "main_penalty_taker": (player.get_stats("penalty_goals") + player.get_stats("penalty_misses") == max_penalties)
            }
            for player in top_players
        ]

            
        
            