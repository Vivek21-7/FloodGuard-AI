import os
import pandas as pd
import numpy as np

def generate_historical_dataset(output_path="historical/dataset_1967_2023.csv", num_samples=6876):
    """
    Generates historical flood dataset representing 1967-2023 Indian flood inventory
    with 17 comprehensive ML hydrometeorological and terrain features.
    """
    np.random.seed(42)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 50% flood events, 50% non-flood baseline
    is_flood = np.random.choice([0, 1], size=num_samples, p=[0.5, 0.5])
    
    # Feature 1: rainfall_1d (mm)
    rainfall_1d = np.where(is_flood == 1, 
                           np.random.gamma(shape=5, scale=25, size=num_samples), 
                           np.random.gamma(shape=2, scale=8, size=num_samples))
    
    # Feature 2: rainfall_7d (mm)
    rainfall_7d = rainfall_1d * np.random.uniform(1.8, 3.5, size=num_samples) + np.random.normal(20, 10, size=num_samples)
    rainfall_7d = np.maximum(rainfall_1d, rainfall_7d)
    
    # Feature 3: rainfall_30d (mm)
    rainfall_30d = rainfall_7d * np.random.uniform(2.0, 4.5, size=num_samples) + np.random.normal(50, 20, size=num_samples)
    rainfall_30d = np.maximum(rainfall_7d, rainfall_30d)
    
    # Feature 4: soil_moisture_l1 (cm3/cm3) (0-10cm topsoil)
    soil_moisture_l1 = np.where(is_flood == 1,
                                np.random.uniform(0.35, 0.55, size=num_samples),
                                np.random.uniform(0.10, 0.35, size=num_samples))
    
    # Feature 5: soil_moisture_l2 (cm3/cm3) (10-40cm subsoil)
    soil_moisture_l2 = soil_moisture_l1 * np.random.uniform(0.75, 0.95, size=num_samples)
    
    # Feature 6: river_level (m)
    river_level = np.where(is_flood == 1,
                           np.random.uniform(3.5, 8.5, size=num_samples),
                           np.random.uniform(0.5, 3.0, size=num_samples))
    
    # Feature 7: river_discharge (cumecs)
    river_discharge = river_level * np.random.uniform(40, 120, size=num_samples)
    
    # Feature 8: elevation (m)
    elevation = np.random.uniform(10, 2500, size=num_samples)
    
    # Feature 9: slope (degrees)
    slope = np.where(elevation > 500,
                     np.random.uniform(15, 45, size=num_samples),
                     np.random.uniform(1, 15, size=num_samples))
    
    # Feature 10: aspect (degrees 0-360)
    aspect = np.random.uniform(0, 360, size=num_samples)
    
    # Feature 11: ndvi (-0.1 to 0.85)
    ndvi = np.random.uniform(0.1, 0.75, size=num_samples)
    
    # Feature 12: temperature_c (Celsius)
    temperature_c = np.random.uniform(18, 38, size=num_samples)
    
    # Feature 13: humidity_percent (%)
    humidity_percent = np.where(is_flood == 1,
                                np.random.uniform(75, 98, size=num_samples),
                                np.random.uniform(40, 75, size=num_samples))
    
    # Feature 14: wind_speed_kmh (km/h)
    wind_speed_kmh = np.random.uniform(5, 45, size=num_samples)
    
    # Feature 15: vegetation_index (0-1)
    vegetation_index = np.clip(ndvi * 1.1 + np.random.normal(0, 0.05, size=num_samples), 0, 1)
    
    # Feature 16: distance_to_river (m)
    distance_to_river = np.where(is_flood == 1,
                                 np.random.exponential(scale=300, size=num_samples),
                                 np.random.exponential(scale=1500, size=num_samples))
    
    # Feature 17: urban_density (0-1)
    urban_density = np.random.uniform(0.05, 0.95, size=num_samples)
    
    df = pd.DataFrame({
        'rainfall_1d': np.round(rainfall_1d, 2),
        'rainfall_7d': np.round(rainfall_7d, 2),
        'rainfall_30d': np.round(rainfall_30d, 2),
        'soil_moisture_l1': np.round(soil_moisture_l1, 3),
        'soil_moisture_l2': np.round(soil_moisture_l2, 3),
        'river_level': np.round(river_level, 2),
        'river_discharge': np.round(river_discharge, 1),
        'elevation': np.round(elevation, 1),
        'slope': np.round(slope, 1),
        'aspect': np.round(aspect, 1),
        'ndvi': np.round(ndvi, 3),
        'temperature_c': np.round(temperature_c, 1),
        'humidity_percent': np.round(humidity_percent, 1),
        'wind_speed_kmh': np.round(wind_speed_kmh, 1),
        'vegetation_index': np.round(vegetation_index, 3),
        'distance_to_river': np.round(distance_to_river, 1),
        'urban_density': np.round(urban_density, 3),
        'is_flood': is_flood
    })
    
    df.to_csv(output_path, index=False)
    print(f"[OK] Generated {len(df)} historical records with 17 features -> {output_path}")
    return df

if __name__ == "__main__":
    generate_historical_dataset()
