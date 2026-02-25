import pandas as pd
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_FILE = PROJECT_ROOT / 'data/raw/JamShield/iq-data/metadata-reference.csv'
OUTPUT_FILE = PROJECT_ROOT / 'data/processed/jamshield_metadata_clean.csv'

def clean_jamshield_metadata():
    print(f"Reading raw metadata from: {RAW_FILE}")
    
    # Read the file
    # We use header=1 because the first row in your CSV seems to be empty or metadata garbage
    df = pd.read_csv(RAW_FILE) 
    
    # --- CLEANING LOGIC ---
    
    # Rename Columns to Standard Names
    # Based on your CSV structure: 
    # Col 0: name, Col 1: tx, Col 2: rx, Col 3: jammer, Col 4: type, Col 5: power, Col 6: dist, Col 7: dur
    df.columns = ['filename', 'tx', 'rx', 'jammer_id', 'scenario', 'jamming_power', 'distance', 'duration']
    
    # Drop completely empty rows (Divider lines)
    df = df.dropna(how='all')
    
    # Forward Fill the Filename (Crucial!)
    # This copies "w1" down to the "Sine" and "Gauss" rows
    df['filename'] = df['filename'].fillna(method='ffill')
    
    # Standardize Scenario Names
    # Map "No", "Sin", "Gauss" to machine-readable keys
    df['scenario'] = df['scenario'].str.strip() # Remove spaces
    
    # Optional: Fill NaNs in other columns if needed (e.g. if 'tx' is missing)
    df = df.fillna(method='ffill')
    
    # Filter for Useful Rows Only (Optional)
    # If there are still garbage rows, we can filter by ensuring 'scenario' is valid
    valid_scenarios = ['No', 'Sin', 'Gauss', 'Sinusoid', 'Gaussian']
    df = df[df['scenario'].isin(valid_scenarios)]

    # ----------------------
    
    # Save
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_FILE, index=False)
    
    print(f"Success! Cleaned metadata saved to: {OUTPUT_FILE}")
    print(f"Rows: {len(df)}")
    print(df.head(6))

if __name__ == "__main__":
    clean_jamshield_metadata()