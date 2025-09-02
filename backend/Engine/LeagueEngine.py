from Engine.FootyStatsAPI import FootyStatsAPI
from Engine.League import League
from typing import Dict, List
import json
import re
import os
import sys
import yaml

class LeagueEngine():
    def __init__(self,league : League):
        self.__league = league
    
    def get_stats_team(self,team_id, stat=None):
        return self.__league.get_team(team_id).get_stats(stat)
    
    def get_stats_player(self,player_id,stat=None):
        return self.__league.get_player(player_id).get_stats(stat)

    def get_grouped_stats_team(
        self, 
        stat: str, 
        team_id: int, 
        mode: str, 
        percentage: bool = False,
        over: bool = True
    ) -> Dict[str, int]:
        # 1. Load grouped patterns from config
        config_path = os.path.join(os.path.dirname(__file__), "config.yaml")
        with open(config_path, "r") as f:
            data = yaml.safe_load(f)
            grouped_data_json = data["grouped_data"]

        with open(grouped_data_json, "r") as f:
            patterns = json.load(f)

        pattern = patterns.get(stat)
        if not pattern:
            raise ValueError(f"Stat group '{stat}' not found in database")

        valid_modes = {"home", "away", "overall"}
        if mode not in valid_modes:
            raise ValueError(f"Invalid mode: {mode}")

        if percentage:
            pattern = f"{pattern}Percentage_{mode}"
        else:
            pattern = f"{pattern}_{mode}"

        # 2. Fetch team stats
        try:
            full_stats = self.__league.get_team(team_id).get_stats()
        except AttributeError:
            raise AttributeError(f"Team ID {team_id} is None or has no stats")

        # 3. Match keys by regex
        grouped_stats = {
            key: value
            for key, value in full_stats.items()
            if re.match(pattern, key)
        }

        if not grouped_stats:
            raise AttributeError(f"Your {pattern} is not in team stats")

        # 4. If over=True or percentage=True, return original grouped data
        if over or percentage:
            return grouped_stats

        # 5. Convert overs data into exact counts
        # Get total matches played
        matches_played = full_stats.get(f"seasonMatchesPlayed_{mode}", sum(grouped_stats.values()))

        # Sort keys ascending by number of corners (extract number from key)
        keys_sorted = sorted(
            grouped_stats.keys(),
            key=lambda k: int(re.search(r"over(\d+)", k).group(1))
        )

        actual_counts = {}
        for i, key in enumerate(keys_sorted):
            # Convert over65 -> 6, over75 -> 7, etc.
            number = int(re.search(r"over(\d+)", key).group(1)) // 10
            value = grouped_stats[key]

            if i == 0:
                # first value = number of matches with X and below
                actual_counts[number] = matches_played - value
            elif i == len(keys_sorted) - 1:
                # last value, keep as is (14+)
                actual_counts[number] = value
            else:
                # middle values: matches with exactly X corners
                prev_key = keys_sorted[i - 1]
                prev_value = grouped_stats[prev_key]
                actual_counts[number] = prev_value - value

        return actual_counts

    
    def __calculate_grouped_chances(self, for_team_id: int, for_team_group_data: Dict[str, int], against_team: int, against_team_group_data: Dict[str, int]) -> List[Dict[str, int]]:
        grouped_chances = []

        # Match pattern: base + _home or _away
        pattern = re.compile(r"(.+?)_(home|away)$")

        # Extract base keys from both sets
        for_keys = {pattern.match(k).group(1): k for k in for_team_group_data if pattern.match(k)}
        against_keys = {pattern.match(k).group(1): k for k in against_team_group_data if pattern.match(k)}

        # Find all base stat keys in both
        shared_base_keys = set(for_keys.keys()) & set(against_keys.keys())

        for base_key in sorted(shared_base_keys):
            for_key = for_keys[base_key]
            against_key = against_keys[base_key]

            for_value = for_team_group_data.get(for_key)
            against_value = against_team_group_data.get(against_key)

            if for_value is not None and against_value is not None:
                combined_chance = (for_value + against_value) // 2

                grouped_chances.append({
                    "stat": base_key,
                    "for_value": for_value,
                    "against_value": against_value,
                    "combined_chance": combined_chance
                })

        return grouped_chances
    
    def stats_difference(self, stat:str, entityA_id:int, entityB_id:int = -1) -> float:
        if entityB_id == -1:
            difference = self.__league.get_stats(stat) - self.__league.get_team(entityA_id).get_stats(stat)
        else:
            difference = self.__league.get_team(entityB_id).get_stats(stat) - self.__league.get_team(entityA_id).get_stats(stat)
        
        return difference
        
    def compare_grouped_chances(self, stat: str, home_team_id : int, away_team_id: int):
        home_stats = self.get_grouped_stats_team(stat,home_team_id,"home",True)
        away_stats = self.get_grouped_stats_team(stat,away_team_id,"away",True)
        return(self.__calculate_grouped_chances(home_team_id,home_stats,away_team_id,away_stats))
    
    def compare_team_to_league(self, stat: str, team_id: int, negative_ranking: bool = False) -> int:
        # Get the team's stat value
        team = self.__league.get_team(team_id)
        team_stat = team.get_stats(stat)

        if team_stat is None:
            return -1  # Team has no stat

        # Gather all teams with their stat values
        teams = self.__league.get_all_teams()  # Dict[int, Team]
        stats = []
        for tid, t in teams.items():
            try:
                value = t.get_stats(stat)
                if value is not None:  # filter out missing stats
                    stats.append((tid, value))
            except KeyError:
                continue  # Skip if the stat doesn't exist

        if not stats:
            return -1  # No stats found at all

        # Sort teams by stat (ascending if negative_ranking, descending otherwise)
        stats.sort(key=lambda x: x[1], reverse=not negative_ranking)

        # Find the rank of the given team
        for idx, (tid, value) in enumerate(stats, start=1):
            if tid == team_id:
                return idx

        # If not found (shouldn't happen unless missing stat), return -1
        return -1





    

        
        
