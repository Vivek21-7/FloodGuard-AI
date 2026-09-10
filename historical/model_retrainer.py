import sys
import os
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from historical.historical_dataset_builder import generate_historical_dataset

FEATURE_NAMES = [
    'rainfall_1d', 'rainfall_7d', 'rainfall_30d',
    'soil_moisture_l1', 'soil_moisture_l2',
    'river_level', 'river_discharge',
    'elevation', 'slope', 'aspect', 'ndvi',
    'temperature_c', 'humidity_percent', 'wind_speed_kmh',
    'vegetation_index', 'distance_to_river', 'urban_density'
]

def train_and_save_model(dataset_path="historical/dataset_1967_2023.csv",
                         model_output="historical/floodguard_model_v2.pkl",
                         scaler_output="historical/floodguard_scaler_v2.pkl"):
    """
    Trains baseline Random Forest model on 17 features and exports trained artifacts.
    """
    if not os.path.exists(dataset_path):
        print("Dataset missing, generating dataset...")
        df = generate_historical_dataset(dataset_path)
    else:
        df = pd.read_csv(dataset_path)
        
    X = df[FEATURE_NAMES]
    y = df['is_flood']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    
    print("==========================================")
    print("MODEL RETRAINING COMPLETE")
    print("==========================================")
    print(f"Accuracy: {acc*100:.2f}%")
    print(f"ROC-AUC:  {auc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    os.makedirs(os.path.dirname(model_output), exist_ok=True)
    joblib.dump(model, model_output)
    joblib.dump(scaler, scaler_output)
    
    # Also save copy in root for quick API loading if needed
    joblib.dump(model, 'floodguard_model_v2.pkl')
    joblib.dump(scaler, 'floodguard_scaler_v2.pkl')
    
    print(f"[OK] Saved model artifact -> {model_output}")
    print(f"[OK] Saved scaler artifact -> {scaler_output}")
    
    return model, scaler

if __name__ == "__main__":
    train_and_save_model()
