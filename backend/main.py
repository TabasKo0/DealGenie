from fastapi import FastAPI, HTTPException, Body, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
import time
import requests
import math
import csv
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import threading
import logging
from typing import Dict, List, Optional
import hashlib
import uuid
import random

# Constants
CSV_PATH = 'app/pricing.csv'
ID_COUNTER_PATH = 'app/id_counter.txt'
CONFIG_PATH = 'app/config.json'
AB_TEST_PATH = 'app/ab_tests.json'
ANALYTICS_PATH = 'app/analytics.json'
PRICEAPI_TOKEN = "PBSMISHXBXFQRNGMLQCVJKCSMLIMXEQZVVNEMMUUDBAMNRMAMZOGVZWBDRJAZZHE"

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load CSV data (reload after each ingestion)
def load_df():
    if os.path.exists(CSV_PATH):
        return pd.read_csv(CSV_PATH)
    else:
        return pd.DataFrame()

df = load_df()

# Default discount config
default_config = {
    "max_discount": 0.3,
    "min_discount": 0.05,
    "demand_multiplier": 1.2,
    "inventory_threshold": 50,
    "price_elasticity": 0.8,
    "seasonal_factor": 1.0
}

def load_config():
    try:
        with open(CONFIG_PATH, 'r') as f:
            return json.load(f)
    except Exception:
        with open(CONFIG_PATH, 'w') as f:
            json.dump(default_config, f)
        return default_config

def save_config(config):
    with open(CONFIG_PATH, 'w') as f:
        json.dump(config, f)

# A/B Testing Functions
def load_ab_tests():
    """Load A/B tests from JSON file"""
    try:
        if os.path.exists(AB_TEST_PATH):
            with open(AB_TEST_PATH, 'r') as f:
                return json.load(f)
        return {}
    except Exception as e:
        logger.error(f"Error loading A/B tests: {e}")
        return {}

def save_ab_tests(tests):
    """Save A/B tests to JSON file"""
    try:
        with open(AB_TEST_PATH, 'w') as f:
            json.dump(tests, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving A/B tests: {e}")
        return False

def get_ab_test_variant(user_id: str, test_name: str) -> str:
    """Determine which variant a user should see"""
    tests = load_ab_tests()
    if test_name not in tests:
        return "control"
    
    test = tests[test_name]
    if not test.get("active", False):
        return "control"
    
    # Use hash for consistent assignment
    hash_input = f"{user_id}_{test_name}"
    hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
    if (hash_value % 100) < (test["traffic_split"] * 100):
        return "variant_a"
    return "variant_b"

def record_ab_test_event(user_id: str, test_name: str, variant: str, event_type: str, value: float = 0):
    """Record an A/B test event"""
    try:
        analytics = load_analytics()
        if "ab_test_events" not in analytics:
            analytics["ab_test_events"] = []
        
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "test_name": test_name,
            "variant": variant,
            "event_type": event_type,
            "value": value
        }
        analytics["ab_test_events"].append(event)
        save_analytics(analytics)
    except Exception as e:
        logger.error(f"Error recording A/B test event: {e}")

def load_analytics():
    """Load analytics data"""
    try:
        if os.path.exists(ANALYTICS_PATH):
            with open(ANALYTICS_PATH, 'r') as f:
                return json.load(f)
        return {"ab_test_events": [], "price_changes": [], "revenue_metrics": []}
    except Exception as e:
        logger.error(f"Error loading analytics: {e}")
        return {"ab_test_events": [], "price_changes": [], "revenue_metrics": []}

def save_analytics(analytics):
    """Save analytics data"""
    try:
        with open(ANALYTICS_PATH, 'w') as f:
            json.dump(analytics, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving analytics: {e}")
        return False

config = load_config()

# Enhanced pricing algorithms
def calculate_dynamic_price(product_data: dict, user_id: str = None) -> dict:
    """
    Advanced dynamic pricing with multiple factors
    """
    try:
        base_price = float(product_data.get('competitor_price', 0))
        inventory = int(product_data.get('inventory', 100))
        demand_score = float(product_data.get('demand_score', 1.0))
        
        # Base discount calculation
        disc = float(product_data.get('disc', 0))
        df = load_df()
        max_disc = df['disc'].max() if not df.empty else 1
        min_disc = df['disc'].min() if not df.empty else 0
        
        base_discount = calculate_discount(disc, max_disc, min_disc)
        
        # Inventory-based pricing
        inventory_factor = 1.0
        if inventory < config.get("inventory_threshold", 50):
            inventory_factor = 1.1  # Increase price when low inventory
        elif inventory > 200:
            inventory_factor = 0.95  # Decrease price when high inventory
        
        # Demand-based pricing
        demand_factor = 1.0 + (demand_score - 1.0) * config.get("demand_multiplier", 1.2)
        
        # Seasonal pricing (simplified)
        seasonal_factor = config.get("seasonal_factor", 1.0)
        
        # Time-based pricing (peak hours)
        current_hour = datetime.now().hour
        time_factor = 1.05 if 18 <= current_hour <= 22 else 1.0  # Peak evening hours
        
        # Calculate final price
        discount_factor = 1 - base_discount
        final_price = (base_price * discount_factor * inventory_factor * 
                      demand_factor * seasonal_factor * time_factor)
        
        # A/B testing for pricing strategy
        if user_id:
            variant = get_ab_test_variant(user_id, "pricing_strategy")
            if variant == "variant_a":
                final_price *= 0.98  # 2% more aggressive pricing
            elif variant == "variant_b":
                final_price *= 1.02  # 2% premium pricing
        
        return {
            "original_price": base_price,
            "final_price": round(final_price, 2),
            "discount_amount": round(base_price - final_price, 2),
            "discount_percentage": round((1 - final_price/base_price) * 100, 2),
            "factors_applied": {
                "base_discount": base_discount,
                "inventory_factor": inventory_factor,
                "demand_factor": demand_factor,
                "seasonal_factor": seasonal_factor,
                "time_factor": time_factor
            }
        }
    except Exception as e:
        logger.error(f"Error in dynamic pricing calculation: {e}")
        return {"error": str(e), "final_price": float(product_data.get('competitor_price', 0))}

def predict_demand(product_id: str, days: int = 7) -> dict:
    """
    Simple demand forecasting using historical data
    """
    try:
        analytics = load_analytics()
        events = analytics.get("ab_test_events", [])
        
        # Filter events for this product (simplified)
        product_events = [e for e in events if e.get("event_type") == "view" or e.get("event_type") == "purchase"]
        
        if not product_events:
            return {"forecast": [1.0] * days, "confidence": 0.5}
        
        # Simple trend analysis
        recent_events = [e for e in product_events if 
                        datetime.fromisoformat(e["timestamp"]) > datetime.utcnow() - timedelta(days=30)]
        
        base_demand = len(recent_events) / 30 if recent_events else 1.0
        
        # Generate forecast with some randomness
        forecast = []
        for i in range(days):
            trend_factor = 1.0 + (i * 0.02)  # Slight upward trend
            noise = random.uniform(0.9, 1.1)  # Random variation
            forecast.append(round(base_demand * trend_factor * noise, 2))
        
        return {
            "forecast": forecast,
            "confidence": 0.7,
            "base_demand": base_demand,
            "historical_events": len(recent_events)
        }
    except Exception as e:
        logger.error(f"Error in demand prediction: {e}")
        return {"forecast": [1.0] * days, "confidence": 0.5, "error": str(e)}

# FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Ensure directories and files
os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
if not os.path.exists(CSV_PATH):
    with open(CSV_PATH, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'type', 'disc', 'id', 'product_name', 'competitor_price', 'our_price', 'inventory', 'demand_score', 'img_url', 'timestamp', 'url'
        ])
if not os.path.exists(ID_COUNTER_PATH):
    with open(ID_COUNTER_PATH, 'w') as f:
        f.write('1')

def get_next_id():
    with open(ID_COUNTER_PATH, 'r+') as f:
        val = int(f.read().strip())
        f.seek(0)
        f.write(str(val+1))
        f.truncate()
    return val

# Root redirect to frontend index
@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")

# Periodic ingestion task (optional)
PRODUCTS_TO_TRACK = [
    'phone',
    'laptop',
    'headphones',
    'speakers',
    'smart watches'
]

def periodic_ingest():
    while True:
        for pname in PRODUCTS_TO_TRACK:
            try:
                print(f"[Periodic Ingest] Ingesting: {pname}")
                requests.post("http://localhost:8000/ingest_product", json={"product_name": pname})
            except Exception as e:
                print(f"[Periodic Ingest] Error for {pname}: {e}")
        time.sleep(3600)  # every hour


# --- Models ---
class ProductIngestRequest(BaseModel):
    product_name: str

class ABTestConfig(BaseModel):
    test_name: str
    strategy_a: Dict
    strategy_b: Dict
    traffic_split: float = Field(default=0.5, ge=0.1, le=0.9)
    duration_days: int = Field(default=7, ge=1, le=30)

class PriceUpdateRequest(BaseModel):
    product_id: str
    new_price: float = Field(gt=0)
    reason: str = ""

class InventoryUpdate(BaseModel):
    product_id: str
    quantity: int = Field(ge=0)

class DemandForecast(BaseModel):
    product_id: str
    forecast_days: int = Field(default=7, ge=1, le=30)

# --- Ingest product using PriceAPI ---
@app.post('/ingest_product')
def ingest_product(data: ProductIngestRequest):
    product_name = data.product_name

    url = "https://api.priceapi.com/v2/jobs"
    payload = {
        "token": PRICEAPI_TOKEN,
        "country": "in",
        "source": "amazon",
        "topic": "search_results",
        "key": "term",
        "max_age": "43200",
        "max_pages": "9",
        "sort_by": "ranking_descending",
        "condition": "new",
        "values": product_name
    }

    resp = requests.post(url, data=payload)
    if not resp.ok:
        raise HTTPException(status_code=500, detail="PriceAPI request failed")

    job = resp.json()
    job_id = job.get("job_id")
    if not job_id:
        raise HTTPException(status_code=500, detail="No job_id from PriceAPI")

    result_url = f"https://api.priceapi.com/v2/jobs/{job_id}/download.json?token={PRICEAPI_TOKEN}"
    for _ in range(30):
        r = requests.get(result_url)
        if r.status_code == 200 and r.headers.get("content-type", "").startswith("application/json"):
            data = r.json()
            if data.get("results"):
                break
        time.sleep(10)
    else:
        raise HTTPException(status_code=504, detail="Timeout waiting for PriceAPI results")

    results = data.get("results", [])
    if not results:
        raise HTTPException(status_code=404, detail="No results from PriceAPI")

    content = results[0].get("content", {})
    search_results = content.get("search_results", [])
    if not search_results:
        raise HTTPException(status_code=404, detail="No search_results from PriceAPI")

    count = 0
    with open(CSV_PATH, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for prod in search_results:
            pname = prod.get("name")
            competitor_price = float(prod.get("min_price", 0))
            img_url = prod.get("img_url")
            url = prod.get("url")
            our_price = competitor_price
            inventory = int(math.floor(100 * (0.5 + 0.5 * math.sin(time.time()))))
            demand_score = 1.0
            ts = datetime.utcnow().isoformat()
            row_id = prod.get("id") or get_next_id()
            # disc column set to count here (you can update as needed)
            writer.writerow([
                product_name, count, row_id, pname, competitor_price, our_price, inventory, demand_score, img_url, ts, url
            ])
            count += 1

    # Reload df after ingestion
    global df
    df = load_df()

    return {
        "status": "success",
        "products_added": count
    }

# Analytics - read CSV rows
@app.get('/analytics')
def get_analytics():
    with open(CSV_PATH, 'r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    return {'analytics': rows}

# Product by ID via PriceAPI specs topic
@app.post("/product_by_id")
def product_by_id(id: str = Body(..., embed=True)):
    create_job_url = "https://api.priceapi.com/v2/jobs"
    payload = {
        "token": PRICEAPI_TOKEN,
        "country": "in",
        "source": "google_shopping",
        "topic": "product_specs",
        "key": "id",
        "max_age": "43200",
        "values": id,
    }

    job_response = requests.post(create_job_url, data=payload)
    job_data = job_response.json()

    job_id = job_data.get("job_id")
    if not job_id:
        return {"error": "Job creation failed", "details": job_data}

    poll_url = f"https://api.priceapi.com/v2/jobs/{job_id}/download.json?token={PRICEAPI_TOKEN}"
    for _ in range(20):
        poll_response = requests.get(poll_url)
        poll_data = poll_response.json()
        if poll_response.status_code == 200 and poll_data.get("results"):
            return {"status": "success", "data": poll_data.get("results")[0]["content"]}
        time.sleep(1.5)

    return {"error": "Job did not finish in time", "job_id": job_id}

# Discount calculation logic using dynamic config
def calculate_discount(disc_value, max_disc, min_disc, max_discount=None, min_discount=None):
    max_discount = max_discount if max_discount is not None else config.get("max_discount", 0.3)
    min_discount = min_discount if min_discount is not None else config.get("min_discount", 0.05)

    if max_disc == min_disc:
        norm = 0
    else:
        norm = (disc_value - min_disc) / (max_disc - min_disc)
    reversed_norm = 1 - norm
    discount = min_discount + reversed_norm * (max_discount - min_discount)
    return discount

@app.get("/competitive_price/{product_id}")
def get_competitive_price(product_id: str):
    global df
    df = load_df()  # reload fresh data each call
    product_row = df[df['id'].astype(str) == product_id]
    if product_row.empty:
        raise HTTPException(status_code=404, detail="Product not found")

    product = product_row.iloc[0]
    competitor_price = float(product['competitor_price'])
    disc = float(product['disc'])
    max_disc = df['disc'].max()
    min_disc = df['disc'].min()

    discount_rate = calculate_discount(disc, max_disc, min_disc,
                                       max_discount=config.get("max_discount"),
                                       min_discount=config.get("min_discount"))
    competitive_price = competitor_price * (1 - discount_rate)

    return {"discounted_price": round(competitive_price, 2)}

# Admin API to get current discount params
@app.get("/admin/discount_params")
def get_discount_params():
    global config
    return config

# Admin API to update discount params
@app.post("/admin/discount_params")
def update_discount_params(params: dict = Body(...)):
    global config
    max_discount = params.get("max_discount")
    min_discount = params.get("min_discount")

    if max_discount is not None and min_discount is not None:
        if not (0 <= min_discount <= max_discount <= 1):
            return {"error": "Invalid discount values. Ensure 0 <= min_discount <= max_discount <= 1."}
        config["max_discount"] = max_discount
        config["min_discount"] = min_discount
        save_config(config)
        return {"status": "success", "config": config}
    else:
        return {"error": "Missing parameters."}

# === NEW ENHANCED API ENDPOINTS ===

# Enhanced pricing endpoint with user-specific pricing
@app.get("/enhanced_price/{product_id}")
def get_enhanced_price(product_id: str, user_id: Optional[str] = None):
    """Get enhanced dynamic pricing for a product"""
    try:
        global df
        df = load_df()
        product_row = df[df['id'].astype(str) == product_id]
        if product_row.empty:
            raise HTTPException(status_code=404, detail="Product not found")

        product = product_row.iloc[0].to_dict()
        pricing_result = calculate_dynamic_price(product, user_id)
        
        # Record analytics event
        if user_id:
            variant = get_ab_test_variant(user_id, "pricing_strategy")
            record_ab_test_event(user_id, "pricing_strategy", variant, "price_view", 
                                pricing_result.get("final_price", 0))
        
        return pricing_result
    except Exception as e:
        logger.error(f"Error in enhanced pricing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# A/B Testing Management
@app.post("/admin/ab_test")
def create_ab_test(test_config: ABTestConfig):
    """Create a new A/B test"""
    try:
        tests = load_ab_tests()
        test_id = test_config.test_name
        
        tests[test_id] = {
            "test_name": test_config.test_name,
            "strategy_a": test_config.strategy_a,
            "strategy_b": test_config.strategy_b,
            "traffic_split": test_config.traffic_split,
            "duration_days": test_config.duration_days,
            "created_at": datetime.utcnow().isoformat(),
            "active": True,
            "participants": 0,
            "conversions": {"variant_a": 0, "variant_b": 0}
        }
        
        save_ab_tests(tests)
        return {"status": "success", "test_id": test_id}
    except Exception as e:
        logger.error(f"Error creating A/B test: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/ab_tests")
def list_ab_tests():
    """List all A/B tests"""
    return {"tests": load_ab_tests()}

@app.post("/admin/ab_test/{test_name}/toggle")
def toggle_ab_test(test_name: str):
    """Toggle A/B test active status"""
    try:
        tests = load_ab_tests()
        if test_name not in tests:
            raise HTTPException(status_code=404, detail="Test not found")
        
        tests[test_name]["active"] = not tests[test_name]["active"]
        save_ab_tests(tests)
        return {"status": "success", "active": tests[test_name]["active"]}
    except Exception as e:
        logger.error(f"Error toggling A/B test: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Demand Forecasting
@app.post("/demand_forecast")
def get_demand_forecast(forecast_request: DemandForecast):
    """Get demand forecast for a product"""
    try:
        forecast = predict_demand(forecast_request.product_id, forecast_request.forecast_days)
        return {"status": "success", "forecast": forecast}
    except Exception as e:
        logger.error(f"Error in demand forecasting: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Inventory Management
@app.post("/admin/inventory/update")
def update_inventory(inventory_update: InventoryUpdate):
    """Update product inventory"""
    try:
        global df
        df = load_df()
        
        # Update inventory in CSV
        df.loc[df['id'].astype(str) == inventory_update.product_id, 'inventory'] = inventory_update.quantity
        df.to_csv(CSV_PATH, index=False)
        
        # Reload dataframe
        df = load_df()
        
        # Record analytics
        analytics = load_analytics()
        if "inventory_updates" not in analytics:
            analytics["inventory_updates"] = []
        
        analytics["inventory_updates"].append({
            "timestamp": datetime.utcnow().isoformat(),
            "product_id": inventory_update.product_id,
            "new_quantity": inventory_update.quantity
        })
        save_analytics(analytics)
        
        return {"status": "success", "updated_quantity": inventory_update.quantity}
    except Exception as e:
        logger.error(f"Error updating inventory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Price Update with Tracking
@app.post("/admin/price/update")
def update_price(price_update: PriceUpdateRequest):
    """Update product price with tracking"""
    try:
        global df
        df = load_df()
        
        # Get current price
        product_row = df[df['id'].astype(str) == price_update.product_id]
        if product_row.empty:
            raise HTTPException(status_code=404, detail="Product not found")
        
        old_price = float(product_row.iloc[0]['our_price'])
        
        # Update price in CSV
        df.loc[df['id'].astype(str) == price_update.product_id, 'our_price'] = price_update.new_price
        df.to_csv(CSV_PATH, index=False)
        
        # Reload dataframe
        df = load_df()
        
        # Record price change analytics
        analytics = load_analytics()
        if "price_changes" not in analytics:
            analytics["price_changes"] = []
        
        analytics["price_changes"].append({
            "timestamp": datetime.utcnow().isoformat(),
            "product_id": price_update.product_id,
            "old_price": old_price,
            "new_price": price_update.new_price,
            "reason": price_update.reason,
            "change_percentage": ((price_update.new_price - old_price) / old_price) * 100
        })
        save_analytics(analytics)
        
        return {
            "status": "success", 
            "old_price": old_price, 
            "new_price": price_update.new_price,
            "change_percentage": ((price_update.new_price - old_price) / old_price) * 100
        }
    except Exception as e:
        logger.error(f"Error updating price: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced Analytics
@app.get("/analytics/enhanced")
def get_enhanced_analytics():
    """Get comprehensive analytics dashboard data"""
    try:
        analytics = load_analytics()
        df = load_df()
        
        # Basic stats
        total_products = len(df) if not df.empty else 0
        avg_price = df['our_price'].mean() if not df.empty and 'our_price' in df.columns else 0
        total_inventory = df['inventory'].sum() if not df.empty and 'inventory' in df.columns else 0
        
        # Price change analysis
        price_changes = analytics.get("price_changes", [])
        recent_price_changes = len([pc for pc in price_changes if 
                                  datetime.fromisoformat(pc["timestamp"]) > datetime.utcnow() - timedelta(days=7)])
        
        # A/B test performance
        ab_events = analytics.get("ab_test_events", [])
        unique_users = len(set([event["user_id"] for event in ab_events]))
        
        # Revenue projections (simplified)
        if not df.empty and 'our_price' in df.columns and 'inventory' in df.columns:
            potential_revenue = (df['our_price'] * df['inventory'] * 0.1).sum()  # Assuming 10% sell-through
        else:
            potential_revenue = 0
        
        return {
            "status": "success",
            "summary": {
                "total_products": total_products,
                "average_price": round(avg_price, 2),
                "total_inventory": int(total_inventory),
                "recent_price_changes": recent_price_changes,
                "unique_ab_test_users": unique_users,
                "projected_weekly_revenue": round(potential_revenue, 2)
            },
            "price_changes": price_changes[-10:],  # Last 10 changes
            "ab_test_summary": {
                "total_events": len(ab_events),
                "recent_events": len([e for e in ab_events if 
                                    datetime.fromisoformat(e["timestamp"]) > datetime.utcnow() - timedelta(days=1)])
            },
            "inventory_alerts": {
                "low_stock_items": len(df[df['inventory'] < 20]) if not df.empty and 'inventory' in df.columns else 0,
                "out_of_stock": len(df[df['inventory'] == 0]) if not df.empty and 'inventory' in df.columns else 0
            }
        }
    except Exception as e:
        logger.error(f"Error in enhanced analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Performance Metrics
@app.get("/analytics/performance")
def get_performance_metrics():
    """Get system performance and optimization metrics"""
    try:
        analytics = load_analytics()
        df = load_df()
        
        # Calculate pricing effectiveness
        ab_events = analytics.get("ab_test_events", [])
        pricing_events = [e for e in ab_events if e.get("test_name") == "pricing_strategy"]
        
        variant_a_revenue = sum([e["value"] for e in pricing_events if e["variant"] == "variant_a" and e["event_type"] == "purchase"])
        variant_b_revenue = sum([e["value"] for e in pricing_events if e["variant"] == "variant_b" and e["event_type"] == "purchase"])
        
        # Inventory turnover rate (simplified)
        inventory_updates = analytics.get("inventory_updates", [])
        recent_updates = [u for u in inventory_updates if 
                         datetime.fromisoformat(u["timestamp"]) > datetime.utcnow() - timedelta(days=30)]
        
        return {
            "status": "success",
            "pricing_performance": {
                "variant_a_revenue": variant_a_revenue,
                "variant_b_revenue": variant_b_revenue,
                "better_variant": "A" if variant_a_revenue > variant_b_revenue else "B",
                "revenue_difference": abs(variant_a_revenue - variant_b_revenue)
            },
            "inventory_metrics": {
                "recent_updates": len(recent_updates),
                "avg_stock_level": df['inventory'].mean() if not df.empty and 'inventory' in df.columns else 0
            },
            "system_health": {
                "data_freshness": "Good" if len(df) > 0 else "Needs Update",
                "api_status": "Active",
                "last_ingestion": datetime.utcnow().isoformat()
            }
        }
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Market Analysis
@app.get("/analytics/market")
def get_market_analysis():
    """Get market analysis and competitive insights"""
    try:
        df = load_df()
        
        if df.empty:
            return {"status": "error", "message": "No market data available"}
        
        # Price distribution analysis
        price_stats = {
            "min_price": df['competitor_price'].min(),
            "max_price": df['competitor_price'].max(),
            "avg_price": df['competitor_price'].mean(),
            "median_price": df['competitor_price'].median()
        } if 'competitor_price' in df.columns else {}
        
        # Category analysis
        category_stats = df.groupby('type').agg({
            'competitor_price': ['mean', 'count'],
            'inventory': 'sum'
        }).round(2).to_dict() if 'type' in df.columns else {}
        
        # Competitive positioning
        competitive_advantage = 0
        if not df.empty and 'competitor_price' in df.columns and 'our_price' in df.columns:
            price_comparison = df['our_price'] / df['competitor_price']
            competitive_advantage = (price_comparison < 1).sum() / len(df) * 100
        
        return {
            "status": "success",
            "price_analysis": price_stats,
            "category_breakdown": category_stats,
            "competitive_metrics": {
                "products_below_market": f"{competitive_advantage:.1f}%",
                "total_products_analyzed": len(df),
                "market_coverage": "Electronics"
            },
            "recommendations": [
                "Monitor competitor pricing daily for optimal positioning",
                "Focus on high-demand categories for pricing optimization",
                "Implement dynamic pricing for peak sales periods"
            ]
        }
    except Exception as e:
        logger.error(f"Error in market analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))
