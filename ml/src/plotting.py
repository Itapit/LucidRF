import matplotlib.pyplot as plt
import os
from config import FIGURES_DIR, SAVE_FIGURES
from datetime import datetime
import seaborn as sns

def setup_plotting_style():
    """
    Configures the global plotting style for the entire project.
    Call this once at the start of your notebook.
    """
    # Set the theme (Seaborn handles matplotlib under the hood)
    sns.set_theme(
        style="whitegrid", 
        palette="deep",
        font_scale=1.2  
    )
    
    plt.rcParams['figure.figsize'] = (10, 6)  # Default size
    plt.rcParams['savefig.dpi'] = 300         # High-res saving
    
    print("Plotting style configured")

def save_plot(filename_slug, subfolder=None, prefix=None, timestamp=True):
    """
    Saves the current matplotlib figure using the path defined in config.py.
    
    Args:
        filename_slug (str): The descriptive name (e.g., 'correlation_matrix').
        subfolder (str, optional): A subfolder INSIDE the figures dir (e.g., 'experiment_1').
        prefix (str, optional): Notebook ID or identifier (e.g., '21'). 
                                Automatically adds an underscore.
    """
    if not SAVE_FIGURES:
        print(f"[Info] Saving skipped for: {filename_slug} (SAVE_FIGURES=False)")
        return

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