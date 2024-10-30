import json
import os
import glob

# Specify the directory containing the JSON files
directory = 'data\\'

# Get a list of all JSON files in the directory
files = glob.glob(os.path.join(directory, '*-*_*.json'))

# Initialize an empty list to hold all the attendance data
all_data = []

# Loop over each file
for filename in files:
    with open(filename, 'r') as f:
        # Load the JSON data from the file
        data = json.load(f)
        # Add the data to the list
        all_data.append(data)

# Write the combined data to a new JSON file
with open('combined.json', 'w') as f:
    json.dump(all_data, f)