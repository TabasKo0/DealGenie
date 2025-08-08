import pytest
import json
from unittest.mock import patch, mock_open
from app.main import (
    calculate_dynamic_price, 
    calculate_discount,
    get_ab_test_variant
)

class TestPricingAlgorithms:
    """Test pricing calculation algorithms"""
    
    def test_calculate_discount(self):
        """Test discount calculation"""
        # Test basic discount calculation
        discount = calculate_discount(0.1, 1.0, 0.0)
        assert isinstance(discount, float)
        assert 0.0 <= discount <= 1.0
        
        # Test with specific values
        discount = calculate_discount(0.5, 1.0, 0.0)
        assert discount >= 0.0
        
    def test_calculate_dynamic_price_basic(self):
        """Test basic dynamic price calculation"""
        product_data = {
            'competitor_price': 1000,
            'inventory': 100,
            'demand_score': 1.0,
            'disc': 0.1
        }
        
        with patch('app.main.config', {
            'max_discount': 0.3,
            'min_discount': 0.05,
            'demand_multiplier': 1.2,
            'inventory_threshold': 50,
            'price_elasticity': 0.8,
            'seasonal_factor': 1.0
        }):
            result = calculate_dynamic_price(product_data)
            
            assert isinstance(result, dict)
            assert 'original_price' in result
            assert 'final_price' in result
            assert 'discount_amount' in result
            assert 'discount_percentage' in result
            
            assert result['original_price'] == 1000
            assert isinstance(result['final_price'], (int, float))
            assert result['final_price'] > 0
    
    def test_calculate_dynamic_price_with_ab_test(self):
        """Test dynamic price calculation with A/B testing"""
        product_data = {
            'competitor_price': 1000,
            'inventory': 100,
            'demand_score': 1.0,
            'disc': 0.1
        }
        
        with patch('app.main.config', {
            'max_discount': 0.3,
            'min_discount': 0.05,
            'demand_multiplier': 1.2,
            'inventory_threshold': 50,
            'price_elasticity': 0.8,
            'seasonal_factor': 1.0
        }):
            with patch('app.main.get_ab_test_variant', return_value='variant_a'):
                result_a = calculate_dynamic_price(product_data, user_id="user123")
                
            with patch('app.main.get_ab_test_variant', return_value='variant_b'):
                result_b = calculate_dynamic_price(product_data, user_id="user123")
                
            # Different variants should potentially give different prices
            assert isinstance(result_a, dict)
            assert isinstance(result_b, dict)
            assert result_a['final_price'] > 0
            assert result_b['final_price'] > 0
    
    def test_low_inventory_pricing(self):
        """Test pricing with low inventory"""
        product_data = {
            'competitor_price': 1000,
            'inventory': 30,  # Low inventory
            'demand_score': 1.0,
            'disc': 0.1
        }
        
        with patch('app.main.config', {
            'inventory_threshold': 50,
            'demand_multiplier': 1.2,
            'seasonal_factor': 1.0
        }):
            result = calculate_dynamic_price(product_data)
            
            # Low inventory should increase price
            assert result['final_price'] > 0
            assert isinstance(result['final_price'], (int, float))
    
    def test_high_inventory_pricing(self):
        """Test pricing with high inventory"""
        product_data = {
            'competitor_price': 1000,
            'inventory': 250,  # High inventory
            'demand_score': 1.0,
            'disc': 0.1
        }
        
        with patch('app.main.config', {
            'inventory_threshold': 50,
            'demand_multiplier': 1.2,
            'seasonal_factor': 1.0
        }):
            result = calculate_dynamic_price(product_data)
            
            # High inventory should potentially decrease price
            assert result['final_price'] > 0
            assert isinstance(result['final_price'], (int, float))
    
    def test_edge_cases(self):
        """Test edge cases in pricing algorithms"""
        # Test with zero competitor price
        product_data = {
            'competitor_price': 0,
            'inventory': 100,
            'demand_score': 1.0,
            'disc': 0.0
        }
        
        with patch('app.main.config', {}):
            result = calculate_dynamic_price(product_data)
            assert isinstance(result, dict)
            assert result['original_price'] == 0
            assert result['final_price'] >= 0
        
        # Test with very high demand
        product_data = {
            'competitor_price': 1000,
            'inventory': 100,
            'demand_score': 5.0,  # Very high demand
            'disc': 0.1
        }
        
        with patch('app.main.config', {'demand_multiplier': 1.2}):
            result = calculate_dynamic_price(product_data)
            assert result['final_price'] > 0