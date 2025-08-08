import pytest
import pandas as pd
import numpy as np
from unittest.mock import patch, MagicMock
from app.main import load_df, load_config, save_config, get_ab_test_variant

class TestBusinessLogic:
    """Test core business logic and data processing"""
    
    def test_load_config_default(self):
        """Test loading default configuration"""
        with patch('app.main.os.path.exists', return_value=False), \
             patch('builtins.open', create=True), \
             patch('app.main.json.dump'):
            config = load_config()
            assert "max_discount" in config
            assert "min_discount" in config
            assert config["max_discount"] == 0.3
            assert config["min_discount"] == 0.05
    
    def test_save_config(self, mock_config):
        """Test saving configuration"""
        with patch('builtins.open', create=True), \
             patch('app.main.json.dump') as mock_dump:
            save_config(mock_config)
            mock_dump.assert_called_once()
    
    def test_ab_test_variant_assignment(self):
        """Test A/B test variant assignment"""
        with patch('app.main.load_ab_tests', return_value={
            "test1": {"active": True, "traffic_split": 0.5}
        }):
            variant1 = get_ab_test_variant("user123", "test1")
            variant2 = get_ab_test_variant("user123", "test1")
            # Same user should get same variant
            assert variant1 == variant2
            
            # Test inactive test
            with patch('app.main.load_ab_tests', return_value={
                "test1": {"active": False, "traffic_split": 0.5}
            }):
                variant = get_ab_test_variant("user123", "test1")
                assert variant == "control"
    
    def test_load_df_empty(self):
        """Test loading empty DataFrame when no CSV exists"""
        with patch('app.main.os.path.exists', return_value=False):
            df = load_df()
            assert isinstance(df, pd.DataFrame)
            assert df.empty
    
    def test_load_df_with_data(self, temp_csv_file):
        """Test loading DataFrame with actual CSV data"""
        with patch('app.main.CSV_PATH', temp_csv_file):
            df = load_df()
            assert isinstance(df, pd.DataFrame)
            assert not df.empty
            assert len(df) == 2  # Should have 2 test rows
            assert 'product_name' in df.columns
            assert 'competitor_price' in df.columns