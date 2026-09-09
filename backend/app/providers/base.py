from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseWeatherProvider(ABC):
    @abstractmethod
    async def get_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch rainfall, temperature, humidity, wind."""
        pass

class BaseSoilProvider(ABC):
    @abstractmethod
    async def get_soil_moisture(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch root-zone soil saturation levels."""
        pass

class BaseTerrainProvider(ABC):
    @abstractmethod
    async def get_terrain(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch elevation, slope, and drainage indices."""
        pass

class BaseHydrologyProvider(ABC):
    @abstractmethod
    async def get_water_level(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch river stage and discharge rate."""
        pass
