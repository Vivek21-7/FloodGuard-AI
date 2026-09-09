from pathlib import Path
from ml.training.train import train as run_training

def execute_retrain():
    """Trigger model re-training."""
    return run_training()
