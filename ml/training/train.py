import os
import json
import random
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASET_PATH = BASE_DIR / "ml" / "training" / "dataset.csv"
MODEL_SAVE_PATH = BASE_DIR / "ml" / "models" / "flood_model.pkl"
BACKEND_MODEL_PATH = BASE_DIR / "backend" / "app" / "ml" / "flood_model.pkl"
MODEL_INFO_PATH = BASE_DIR / "backend" / "app" / "ml" / "model_metrics.json"

FEATURE_COLUMNS = [
    "rainfall_1h_mm",
    "rainfall_3h_mm",
    "rainfall_6h_mm",
    "forecast_rainfall_next_3h_mm",
    "soil_moisture_0_10cm_percent",
    "soil_moisture_10_35cm_percent",
    "elevation_m",
    "slope_degrees",
    "water_level_m",
    "temperature_c",
    "humidity_percent",
    "wind_speed_kmh",
    "historical_event_density_nearby",
    "drainage_convergence_score"
]

def generate_synthetic_dataset(num_samples: int = 800) -> pd.DataFrame:
    """
    Generates realistic synthetic hydrometric and meteorological dataset 
    calibrated for Indian Himalayan flash floods (~30% flood, ~70% non-flood).
    """
    np.random.seed(42)
    random.seed(42)
    rows = []

    for _ in range(num_samples):
        # 30% chance of high monsoon trigger scenario
        is_monsoon_surge = (random.random() < 0.32)

        if is_monsoon_surge:
            # High intensity cloudburst / prolonged downpour
            r1 = np.random.uniform(25.0, 75.0)
            r3 = r1 + np.random.uniform(30.0, 90.0)
            r6 = r3 + np.random.uniform(40.0, 110.0)
            f3 = np.random.uniform(20.0, 60.0)
            sm0 = np.random.uniform(68.0, 98.0)
            sm1 = np.random.uniform(72.0, 96.0)
            slope = np.random.uniform(18.0, 48.0)
            water_lvl = np.random.uniform(2.5, 5.5)
            elevation = np.random.uniform(700.0, 2600.0)
            temp = np.random.uniform(18.0, 26.0)
            humidity = np.random.uniform(75.0, 98.0)
            wind = np.random.uniform(12.0, 32.0)
            hist_dens = np.random.uniform(0.4, 1.0)
            drainage_conv = np.random.uniform(0.65, 0.98)
        else:
            # Normal to moderate conditions
            r1 = np.random.uniform(0.0, 18.0)
            r3 = r1 + np.random.uniform(0.0, 25.0)
            r6 = r3 + np.random.uniform(0.0, 35.0)
            f3 = np.random.uniform(0.0, 20.0)
            sm0 = np.random.uniform(25.0, 65.0)
            sm1 = np.random.uniform(30.0, 68.0)
            slope = np.random.uniform(10.0, 35.0)
            water_lvl = np.random.uniform(0.5, 2.3)
            elevation = np.random.uniform(600.0, 2800.0)
            temp = np.random.uniform(14.0, 30.0)
            humidity = np.random.uniform(35.0, 75.0)
            wind = np.random.uniform(4.0, 18.0)
            hist_dens = np.random.uniform(0.05, 0.45)
            drainage_conv = np.random.uniform(0.2, 0.65)

        # Hydrological composite index for labeling ground truth
        runoff_factor = (r6 * 0.35) + (sm0 * 0.30) + (slope * 0.9) + (water_lvl * 15.0)
        flood_label = 1 if runoff_factor > 82.0 else 0

        rows.append({
            "rainfall_1h_mm": round(r1, 1),
            "rainfall_3h_mm": round(r3, 1),
            "rainfall_6h_mm": round(r6, 1),
            "forecast_rainfall_next_3h_mm": round(f3, 1),
            "soil_moisture_0_10cm_percent": round(sm0, 1),
            "soil_moisture_10_35cm_percent": round(sm1, 1),
            "elevation_m": round(elevation, 1),
            "slope_degrees": round(slope, 1),
            "water_level_m": round(water_lvl, 2),
            "temperature_c": round(temp, 1),
            "humidity_percent": round(humidity, 1),
            "wind_speed_kmh": round(wind, 1),
            "historical_event_density_nearby": round(hist_dens, 2),
            "drainage_convergence_score": round(drainage_conv, 2),
            "flood_event": flood_label
        })

    df = pd.DataFrame(rows)
    return df

def train():
    print("Generating synthetic hydrological training dataset...")
    df = generate_synthetic_dataset(900)
    DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATASET_PATH, index=False)
    print(f"Dataset saved to {DATASET_PATH} (Shape: {df.shape}, Floods: {df['flood_event'].sum()}/{len(df)})")

    X = df[FEATURE_COLUMNS]
    y = df["flood_event"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    print("Training Random Forest Classifier model...")
    model = RandomForestClassifier(
        n_estimators=120,
        max_depth=9,
        min_samples_split=4,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))

    print(f"Model Performance:")
    print(f"  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1 Score:  {f1:.4f}")

    # Save model artifacts
    MODEL_SAVE_PATH.parent.mkdir(parents=True, exist_ok=True)
    BACKEND_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, MODEL_SAVE_PATH)
    joblib.dump(model, BACKEND_MODEL_PATH)
    print(f"Saved trained model to {MODEL_SAVE_PATH} and {BACKEND_MODEL_PATH}")

    # Save metrics JSON
    metrics = {
        "model_type": "RandomForestClassifier",
        "features": FEATURE_COLUMNS,
        "accuracy": round(acc, 3),
        "precision": round(prec, 3),
        "recall": round(rec, 3),
        "f1_score": round(f1, 3),
        "n_estimators": 120,
        "training_samples": len(df),
        "training_data": "Synthetic Himalayan Mountain Hydrology Dataset",
        "note": "Prototype Random Forest classifier trained for high recall early warning on flash floods."
    }
    with open(MODEL_INFO_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved metrics info to {MODEL_INFO_PATH}")

if __name__ == "__main__":
    train()
