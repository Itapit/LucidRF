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


def save_plot(filename_slug, machine_id=None, nb_id=None, fig_id=None, subfolder=None, timestamp=True, watermark=True):
    """
    Saves the current matplotlib figure using the path defined in config.py.
    
    Args:
        filename_slug (str): Descriptive name (e.g., 'sensitivity_vs_type').
        machine_id (str): Machine identifier (e.g., 'A' or 'B').
        nb_id (str): Notebook ID (e.g., '40').
        fig_id (str): The figure number in the notebook (e.g., '05').
        subfolder (str): Optional folder inside 'figures/'.
        timestamp (bool): Append timestamp to filename.
        watermark (bool): Add 'Figure X.Y' text to the image corner.
    """
    if not SAVE_FIGURES:
        print(f"[Info] Saving skipped for: {filename_slug} (SAVE_FIGURES=False)")
        return

    # Determine base path
    if subfolder:
        save_dir = FIGURES_DIR / subfolder
    elif machine_id:
        save_dir = FIGURES_DIR / f"Machine_{machine_id}"
    else:
        save_dir = FIGURES_DIR
    
    os.makedirs(save_dir, exist_ok=True)

    name_parts = []


    if machine_id and nb_id and fig_id:
        name_parts.append(f"{machine_id}_NB{nb_id}_Fig{fig_id}")
        
    name_parts.append(filename_slug)

    if timestamp:
        time_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        name_parts.append(time_str)

    clean_name = "_".join(name_parts)
    
    if not clean_name.endswith('.png'):
        clean_name += ".png"
        
    filepath = save_dir / clean_name

    if watermark and machine_id and nb_id and fig_id:
        # Puts text "Figure 40_05" in bottom-right corner
        label_text = f"{machine_id}_NB{nb_id}_Fig{fig_id}"
        plt.figtext(0.99, 0.01, label_text, ha='right', va='bottom', 
                    fontsize=10, color='gray', style='italic', weight='bold')
    
    plt.savefig(filepath, dpi=300, bbox_inches='tight')
    print(f"Saved figure: {filepath.name}")