import matplotlib.pyplot as plt

# Sample team data
team1 = {
    'seasonOver55Num_overall': 4,
    'seasonOver45Num_overall': 4,
    'seasonOver35Num_overall': 12,
    'seasonOver25Num_overall': 17,
    'seasonOver15Num_overall': 29,
    'seasonOver05Num_overall': 36
}

team2 = {
    'seasonOver55Num_overall': 8,
    'seasonOver45Num_overall': 12,
    'seasonOver35Num_overall': 18,
    'seasonOver25Num_overall': 22,
    'seasonOver15Num_overall': 30,
    'seasonOver05Num_overall': 34
}

# Extract threshold labels
thresholds = [key.replace('seasonOver', '').replace('Num_overall', '') for key in team1.keys()]

team1_values = list(team1.values())
team2_values = list(team2.values())

x = range(len(thresholds))
bar_width = 0.35

# Plot
plt.figure(figsize=(10, 6))
plt.plot(thresholds, team1_values, marker='o', label='Team 1')
plt.plot(thresholds, team2_values, marker='o', label='Team 2')


# Labels
plt.xlabel('Over X.5 Goals')
plt.ylabel('Number of Matches')
plt.title('Season Goal Thresholds Comparison')
plt.xticks(x, [f'Over {t[0]}.{t[1]} Goals' for t in thresholds])
plt.legend()
plt.grid(axis='y', linestyle='--', alpha=0.5)

plt.tight_layout()
plt.show()
