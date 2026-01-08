import matplotlib.pyplot as plt
import os
from pathlib import Path
from config import FIGURES_DIR
from datetime import datetime

def save_plot(filename_slug, subfolder=None, prefix=None, timestamp=True):
    """
    Saves the current matplotlib figure using the path defined in config.py.
    
    Args:
        filename_slug (str): The descriptive name (e.g., 'correlation_matrix').
        subfolder (str, optional): A subfolder INSIDE the figures dir (e.g., 'experiment_1').
        prefix (str, optional): Notebook ID or identifier (e.g., '21'). 
                                Automatically adds an underscore.
    """
    # Determine base path
    if subfolder:
        save_dir = FIGURES_DIR / subfolder
    else:
        save_dir = FIGURES_DIR
    
    os.makedirs(save_dir, exist_ok=True)

    name_parts = []

    if prefix:
        name_parts.append(prefix)
        
    name_parts.append(filename_slug)

    if timestamp:
        time_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        name_parts.append(time_str)

    clean_name = "_".join(name_parts)
    
    if not clean_name.endswith('.png'):
        clean_name += ".png"
        
    filepath = save_dir / clean_name
    
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    print(f"Saved figure: {filepath.name}")