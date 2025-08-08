import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from app.main import app
import tempfile
import os
import json
import pandas as pd

@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)

@pytest.fixture
def sample_product_data():
    """Sample product data for testing"""
    return {
        "type": "phone",
        "disc": 0,
        "id": "test123",
        "product_name": "Test iPhone",
        "competitor_price": 999,
        "our_price": 899,
        "inventory": 100,
        "demand_score": 1.2,
        "img_url": "http://example.com/image.jpg",
        "url": "http://example.com/product"
    }

@pytest.fixture
def temp_csv_file():
    """Create a temporary CSV file for testing"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write("type,disc,id,product_name,competitor_price,our_price,inventory,demand_score,img_url,timestamp,url\n")
        f.write("phone,0,12345,iPhone 15,999,899,50,1.2,http://example.com/image.jpg,2024-01-01T12:00:00,http://example.com/product\n")
        f.write("laptop,0,67890,MacBook Pro,1999,1799,30,1.1,http://example.com/laptop.jpg,2024-01-01T12:00:00,http://example.com/laptop\n")
    yield f.name
    os.unlink(f.name)

@pytest.fixture
def mock_config():
    """Mock configuration for testing"""
    return {
        "max_discount": 0.3,
        "min_discount": 0.05,
        "demand_multiplier": 1.2,
        "inventory_threshold": 50,
        "price_elasticity": 0.8,
        "seasonal_factor": 1.0
    }