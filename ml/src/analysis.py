import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from statsmodels.stats.outliers_influence import variance_inflation_factor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from plotting import save_plot

def calc_vif(X):
    """
    Calculates Variance Inflation Factor (VIF) for a pandas DataFrame.
    Returns: DataFrame sorted by VIF score.
    """
    vif_data = pd.DataFrame()
    vif_data["feature"] = X.columns
    vif_data["VIF"] = [variance_inflation_factor(X.values, i) 
                       for i in range(len(X.columns))]
    return vif_data.sort_values(by="VIF", ascending=False)

def run_ablation_study(X_df, y, base_list, drop_list, cv=5):
    """
    Runs the math: trains models on different feature subsets and collects metrics.
    
    Args:
        X_df (pd.DataFrame): The full feature set.
        y (pd.Series): The target labels.
        base_list (list): The list of features to start with.
        drop_list (list): The features to attempt removing.
        cv (int): Number of cross-validation folds.
        
    Returns:
        pd.DataFrame: A dataframe containing the results (Score, Std Dev) for each scenario.
    """
    results = []
    
    # Define Scenarios
    # Always start with the Baseline
    scenarios = {"Baseline (All Features)": base_list}
    
    # Add removal scenarios
    for suspect in drop_list:
        if suspect in base_list:
            subset = [f for f in base_list if f != suspect]
            scenarios[f"Remove {suspect}"] = subset
            
    print(f"Running ablation on {len(scenarios)} scenarios...")

    # Execute Training Loop
    for name, features in scenarios.items():
        X_subset = X_df[features]
        
        # New pipeline for each iteration to avoid state leakage
        model = make_pipeline(
            StandardScaler(), 
            LogisticRegression(class_weight='balanced', max_iter=1000)
        )
        
        # Calculate scores
        scores = cross_val_score(model, X_subset, y, cv=cv, scoring='f1')
        
        results.append({
            'Scenario': name,
            'F1 Score': np.mean(scores),
            'Std Dev': np.std(scores),
            'Num Features': len(features)
        })
        
    # Return as a clean DataFrame
    return pd.DataFrame(results).sort_values(by='F1 Score', ascending=False)

def plot_ablation_results(results_df, nb_id=None):
    """
    Takes the results DataFrame and generates the visualization.
    """
    plt.figure(figsize=(10, 6))
    
    # Bar Chart
    sns.barplot(
        data=results_df, 
        x='F1 Score', 
        y='Scenario', 
        palette='viridis', 
        hue='Scenario',
        legend=False
    )
    
    # Error Bars (using the Std Dev column)
    plt.errorbar(
        x=results_df['F1 Score'], 
        y=np.arange(len(results_df)), 
        xerr=results_df['Std Dev'], 
        fmt='none', 
        c='black', 
        capsize=5
    )

    # Aesthetics
    # Dynamic zooming based on data range
    min_score = results_df['F1 Score'].min() - 0.02
    max_score = results_df['F1 Score'].max() + 0.01
    plt.xlim(min_score, max_score)
    
    plt.title("Impact of Feature Removal on Model Performance")
    plt.xlabel("F1 Score (Mean +/- Std Dev)")
    plt.grid(axis='x', linestyle='--', alpha=0.7)
    
    # Save
    save_plot("03_feature_ablation_results", prefix=nb_id)
    plt.show()