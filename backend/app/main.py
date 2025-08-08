from fastapi import FastAPI, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import time
import requests
import math
import csv
import json
import pandas as pd
from datetime import datetime

# Constants
CSV_PATH = 'app/pricing.csv'
ID_COUNTER_PATH = 'app/id_counter.txt'
CONFIG_PATH = 'app/config.json'
AB_TESTS_PATH = 'app/ab_tests.json'
PRICEAPI_TOKEN = os.getenv("PRICEAPI_TOKEN", "ZEKPINXEAXPSLUPFCDLLQNRPBVWVYPULTOBEUUABFEDOCCCCIMSNWXKNLSZASHUA")

# Load CSV data (reload after each ingestion)
def load_df():
    if os.path.exists(CSV_PATH):
        return pd.read_csv(CSV_PATH)
    else:
        return pd.DataFrame()

df = load_df()

# Enhanced inventory simulation
def calculate_simulated_inventory(price, product_type):
    """Simulate inventory based on price and product type demand patterns"""
    base_inventory = 100
    price_factor = max(0.1, min(2.0, 10000 / max(price, 1000)))  # Higher inventory for lower prices
    
    # Product type modifiers
    type_modifiers = {
        'phone': 1.2,  # Higher demand
        'laptop': 0.8,  # Lower turnover
        'headphones': 1.5,  # High demand
        'speakers': 0.9,
        'smart watches': 1.1
    }
    
    type_modifier = type_modifiers.get(product_type.lower(), 1.0)
    
    # Add some randomness but with a seed based on price for consistency
    import random
    random.seed(int(price))
    random_factor = 0.8 + 0.4 * random.random()
    
    inventory = int(base_inventory * price_factor * type_modifier * random_factor)
    return max(1, min(inventory, 500))  # Ensure reasonable bounds

# Enhanced demand scoring
def calculate_demand_score(price, product_type, position):
    """Calculate demand score based on multiple factors"""
    # Base demand based on position in search results (higher position = higher demand)
    position_score = max(0.3, 2.0 - (position * 0.1))
    
    # Price-based demand (sweet spot around certain price ranges)
    price_score = 1.0
    if product_type.lower() == 'phone':
        # Phones: highest demand between 15k-30k
        if 15000 <= price <= 30000:
            price_score = 1.5
        elif price < 10000 or price > 50000:
            price_score = 0.7
    elif product_type.lower() == 'laptop':
        # Laptops: highest demand between 40k-80k
        if 40000 <= price <= 80000:
            price_score = 1.4
        elif price < 25000 or price > 120000:
            price_score = 0.6
    
    # Time-based factor (simulating seasonal/time trends)
    import time
    time_factor = 0.9 + 0.2 * math.sin(time.time() / 86400)  # Daily cycle
    
    final_score = position_score * price_score * time_factor
    return round(max(0.1, min(final_score, 3.0)), 2)  # Bounded between 0.1 and 3.0

# Fallback data generation when API fails
def generate_fallback_data(product_name):
    """Generate fallback sample data when external API is unavailable"""
    print(f"[Fallback] Generating fallback data for: {product_name}")
    
    # Sample fallback products by category
    fallback_products = {
        'phone': [
            ("Sample iPhone 14", 52000, "https://example.com/iphone.jpg"),
            ("Sample Samsung Galaxy", 25000, "https://example.com/samsung.jpg"),
            ("Sample OnePlus", 35000, "https://example.com/oneplus.jpg"),
        ],
        'laptop': [
            ("Sample MacBook Pro", 120000, "https://example.com/macbook.jpg"),
            ("Sample Dell XPS", 80000, "https://example.com/dell.jpg"),
            ("Sample HP Pavilion", 45000, "https://example.com/hp.jpg"),
        ],
        'headphones': [
            ("Sample Sony WH-1000XM4", 25000, "https://example.com/sony.jpg"),
            ("Sample Bose QuietComfort", 28000, "https://example.com/bose.jpg"),
            ("Sample Apple AirPods", 18000, "https://example.com/airpods.jpg"),
        ],
        'speakers': [
            ("Sample JBL Charge", 8000, "https://example.com/jbl.jpg"),
            ("Sample Bose SoundLink", 12000, "https://example.com/bosespeaker.jpg"),
            ("Sample Sony SRS", 6000, "https://example.com/sonyspeaker.jpg"),
        ],
        'smart watches': [
            ("Sample Apple Watch", 35000, "https://example.com/applewatch.jpg"),
            ("Sample Samsung Galaxy Watch", 25000, "https://example.com/samsungwatch.jpg"),
            ("Sample Fitbit Versa", 15000, "https://example.com/fitbit.jpg"),
        ]
    }
    
    products = fallback_products.get(product_name.lower(), [
        (f"Sample {product_name} Product 1", 20000, "https://example.com/product1.jpg"),
        (f"Sample {product_name} Product 2", 15000, "https://example.com/product2.jpg"),
        (f"Sample {product_name} Product 3", 30000, "https://example.com/product3.jpg"),
    ])
    
    count = 0
    with open(CSV_PATH, 'a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        for idx, (pname, price, img_url) in enumerate(products):
            competitor_price = float(price)
            our_price = competitor_price
            inventory = calculate_simulated_inventory(competitor_price, product_name)
            demand_score = calculate_demand_score(competitor_price, product_name, idx)
            ts = datetime.utcnow().isoformat()
            row_id = get_next_id()
            
            writer.writerow([
                product_name, idx, row_id, pname, competitor_price, our_price,
                inventory, demand_score, img_url, ts, f"https://example.com/product/{row_id}"
            ])
            count += 1
    
    # Reload df after ingestion
    global df
    df = load_df()
    
    return {
        "status": "success",
        "products_added": count,
        "source": "fallback",
        "message": "Used fallback data due to API unavailability"
    }

# Default discount config
default_config = {
    "max_discount": 0.3,
    "min_discount": 0.05,
    "enable_periodic_ingestion": True,
    "ingestion_interval": 3600,  # seconds
    "retry_attempts": 3,
    "retry_delay": 2.0  # seconds
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

config = load_config()

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
os.makedirs(os.path.dirname(AB_TESTS_PATH), exist_ok=True)
if not os.path.exists(CSV_PATH):
    with open(CSV_PATH, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'type', 'disc', 'id', 'product_name', 'competitor_price', 'our_price', 'inventory', 'demand_score', 'img_url', 'timestamp', 'url'
        ])
if not os.path.exists(ID_COUNTER_PATH):
    with open(ID_COUNTER_PATH, 'w') as f:
        f.write('1')
if not os.path.exists(AB_TESTS_PATH):
    with open(AB_TESTS_PATH, 'w') as f:
        json.dump({}, f)

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
        if not config.get("enable_periodic_ingestion", True):
            time.sleep(config.get("ingestion_interval", 3600))
            continue
            
        for pname in PRODUCTS_TO_TRACK:
            try:
                print(f"[Periodic Ingest] Ingesting: {pname}")
                # Make request with proper timeout and error handling
                response = requests.post(
                    "http://localhost:8000/ingest_product", 
                    json={"product_name": pname},
                    timeout=30
                )
                if response.status_code == 200:
                    print(f"[Periodic Ingest] Successfully ingested: {pname}")
                else:
                    print(f"[Periodic Ingest] Failed to ingest {pname}: {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"[Periodic Ingest] Network error for {pname}: {e}")
            except Exception as e:
                print(f"[Periodic Ingest] Unexpected error for {pname}: {e}")
        
        time.sleep(config.get("ingestion_interval", 3600))

@app.on_event("startup")
def start_periodic_ingest():
    import threading
    t = threading.Thread(target=periodic_ingest, daemon=True)
    t.start()

# --- Models ---
class ProductIngestRequest(BaseModel):
    product_name: str

class ABTestRequest(BaseModel):
    test_name: str
    strategy_a: dict  # pricing strategy A parameters
    strategy_b: dict  # pricing strategy B parameters
    duration_hours: int = 24
    traffic_split: float = 0.5  # 50-50 split by default

class PriceUpdateRequest(BaseModel):
    product_id: str
    new_price: float
    reason: str = "manual_update"

# --- Ingest product using PriceAPI ---
@app.post('/ingest_product')
def ingest_product(data: ProductIngestRequest):
    product_name = data.product_name
    
    # Retry mechanism with exponential backoff
    retry_attempts = config.get("retry_attempts", 3)
    retry_delay = config.get("retry_delay", 2.0)
    
    for attempt in range(retry_attempts):
        try:
            url = "https://api.priceapi.com/v2/jobs"
            payload = {
                "token": PRICEAPI_TOKEN,
                "country": "in",
                "source": "google_shopping",
                "topic": "search_results",
                "key": "term",
                "max_age": "43200",
                "max_pages": "9",
                "sort_by": "ranking_descending",
                "condition": "new",
                "values": product_name
            }

            resp = requests.post(url, data=payload, timeout=30)
            if not resp.ok:
                if attempt < retry_attempts - 1:
                    print(f"[Ingest] API request failed (attempt {attempt + 1}), retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # exponential backoff
                    continue
                else:
                    # Use fallback data if API fails
                    return generate_fallback_data(product_name)

            job = resp.json()
            job_id = job.get("job_id")
            if not job_id:
                if attempt < retry_attempts - 1:
                    print(f"[Ingest] No job_id received (attempt {attempt + 1}), retrying...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                else:
                    return generate_fallback_data(product_name)

            result_url = f"https://api.priceapi.com/v2/jobs/{job_id}/download.json?token={PRICEAPI_TOKEN}"
            
            # Poll for results with timeout
            for poll_attempt in range(30):
                try:
                    r = requests.get(result_url, timeout=10)
                    if r.status_code == 200 and r.headers.get("content-type", "").startswith("application/json"):
                        data = r.json()
                        if data.get("results"):
                            break
                except requests.exceptions.RequestException:
                    pass
                time.sleep(10)
            else:
                if attempt < retry_attempts - 1:
                    print(f"[Ingest] Timeout waiting for results (attempt {attempt + 1}), retrying...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                else:
                    return generate_fallback_data(product_name)

            results = data.get("results", [])
            if not results:
                if attempt < retry_attempts - 1:
                    print(f"[Ingest] No results received (attempt {attempt + 1}), retrying...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                else:
                    return generate_fallback_data(product_name)

            content = results[0].get("content", {})
            search_results = content.get("search_results", [])
            if not search_results:
                if attempt < retry_attempts - 1:
                    print(f"[Ingest] No search results (attempt {attempt + 1}), retrying...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                else:
                    return generate_fallback_data(product_name)

            # Process successful results
            count = 0
            with open(CSV_PATH, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                for prod in search_results:
                    pname = prod.get("name", f"Unknown {product_name}")
                    competitor_price = float(prod.get("min_price", 0))
                    img_url = prod.get("img_url", "")
                    url = prod.get("url", "")
                    our_price = competitor_price
                    
                    # Enhanced inventory simulation based on price and demand
                    inventory = calculate_simulated_inventory(competitor_price, product_name)
                    # Enhanced demand scoring
                    demand_score = calculate_demand_score(competitor_price, product_name, count)
                    
                    ts = datetime.utcnow().isoformat()
                    row_id = prod.get("id") or get_next_id()
                    
                    writer.writerow([
                        product_name, count, row_id, pname, competitor_price, our_price, 
                        inventory, demand_score, img_url, ts, url
                    ])
                    count += 1

            # Reload df after ingestion
            global df
            df = load_df()

            return {
                "status": "success",
                "products_added": count,
                "source": "api"
            }
            
        except requests.exceptions.RequestException as e:
            if attempt < retry_attempts - 1:
                print(f"[Ingest] Network error (attempt {attempt + 1}): {e}, retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            else:
                print(f"[Ingest] Final network error after {retry_attempts} attempts: {e}")
                return generate_fallback_data(product_name)
        except Exception as e:
            if attempt < retry_attempts - 1:
                print(f"[Ingest] Unexpected error (attempt {attempt + 1}): {e}, retrying...")
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            else:
                print(f"[Ingest] Final unexpected error after {retry_attempts} attempts: {e}")
                return generate_fallback_data(product_name)
    
    # Fallback if all attempts failed
    return generate_fallback_data(product_name)

# Analytics - read CSV rows with enhanced insights
@app.get('/analytics')
def get_analytics():
    global df
    df = load_df()
    
    if df.empty:
        return {
            'analytics': [],
            'summary': {
                'total_products': 0,
                'message': 'No data available'
            }
        }
    
    # Convert DataFrame to records for basic analytics
    analytics_data = df.to_dict('records')
    
    # Calculate summary statistics
    try:
        summary = {
            'total_products': len(df),
            'unique_categories': df['type'].nunique() if 'type' in df.columns else 0,
            'avg_competitor_price': float(df['competitor_price'].mean()) if 'competitor_price' in df.columns else 0,
            'avg_our_price': float(df['our_price'].mean()) if 'our_price' in df.columns else 0,
            'total_inventory': int(df['inventory'].sum()) if 'inventory' in df.columns else 0,
            'avg_demand_score': float(df['demand_score'].mean()) if 'demand_score' in df.columns else 0,
            'price_range': {
                'min': float(df['competitor_price'].min()) if 'competitor_price' in df.columns else 0,
                'max': float(df['competitor_price'].max()) if 'competitor_price' in df.columns else 0
            },
            'categories': df['type'].value_counts().to_dict() if 'type' in df.columns else {}
        }
        
        # Calculate potential savings from dynamic pricing
        if 'competitor_price' in df.columns and 'our_price' in df.columns:
            df['savings'] = df['competitor_price'] - df['our_price']
            summary['total_potential_savings'] = float(df['savings'].sum())
            summary['avg_savings_per_product'] = float(df['savings'].mean())
        
    except Exception as e:
        print(f"Error calculating summary: {e}")
        summary = {'error': 'Could not calculate summary statistics'}
    
    return {
        'analytics': analytics_data,
        'summary': summary
    }

# New endpoint for performance analytics
@app.get('/analytics/performance')
def get_performance_analytics():
    global df
    df = load_df()
    
    if df.empty:
        return {'error': 'No data available for performance analytics'}
    
    try:
        # Analyze price trends over time
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df_sorted = df.sort_values('timestamp')
        
        # Performance metrics by category
        performance_by_category = {}
        for category in df['type'].unique():
            cat_data = df[df['type'] == category]
            performance_by_category[category] = {
                'product_count': len(cat_data),
                'avg_price': float(cat_data['competitor_price'].mean()),
                'total_inventory': int(cat_data['inventory'].sum()),
                'avg_demand': float(cat_data['demand_score'].mean()),
                'price_competitiveness': float((cat_data['our_price'] / cat_data['competitor_price']).mean())
            }
        
        # Recent trends (last 24 hours if available)
        recent_cutoff = pd.Timestamp.now() - pd.Timedelta(days=1)
        recent_data = df_sorted[df_sorted['timestamp'] > recent_cutoff]
        
        trends = {
            'recent_products_added': len(recent_data),
            'recent_avg_price': float(recent_data['competitor_price'].mean()) if not recent_data.empty else 0,
            'price_change_trend': 'stable'  # Could be enhanced with more sophisticated analysis
        }
        
        return {
            'performance_by_category': performance_by_category,
            'trends': trends,
            'data_freshness': {
                'latest_update': df_sorted['timestamp'].max().isoformat() if not df_sorted.empty else None,
                'oldest_data': df_sorted['timestamp'].min().isoformat() if not df_sorted.empty else None,
                'total_updates': len(df_sorted)
            }
        }
        
    except Exception as e:
        return {'error': f'Error calculating performance analytics: {str(e)}'}

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

# A/B Testing functionality
def load_ab_tests():
    try:
        with open(AB_TESTS_PATH, 'r') as f:
            return json.load(f)
    except Exception:
        return {}

def save_ab_tests(tests):
    with open(AB_TESTS_PATH, 'w') as f:
        json.dump(tests, f, indent=2)

@app.post('/ab_test/create')
def create_ab_test(test_data: ABTestRequest):
    tests = load_ab_tests()
    
    test_id = f"test_{int(time.time())}"
    end_time = datetime.utcnow() + pd.Timedelta(hours=test_data.duration_hours)
    
    tests[test_id] = {
        'name': test_data.test_name,
        'strategy_a': test_data.strategy_a,
        'strategy_b': test_data.strategy_b,
        'traffic_split': test_data.traffic_split,
        'start_time': datetime.utcnow().isoformat(),
        'end_time': end_time.isoformat(),
        'status': 'active',
        'results': {
            'strategy_a': {'views': 0, 'conversions': 0, 'revenue': 0},
            'strategy_b': {'views': 0, 'conversions': 0, 'revenue': 0}
        }
    }
    
    save_ab_tests(tests)
    
    return {
        'status': 'success',
        'test_id': test_id,
        'message': f'A/B test "{test_data.test_name}" created successfully'
    }

@app.get('/ab_test/active')
def get_active_ab_tests():
    tests = load_ab_tests()
    current_time = datetime.utcnow()
    
    active_tests = {}
    for test_id, test_data in tests.items():
        end_time = datetime.fromisoformat(test_data['end_time'])
        if test_data['status'] == 'active' and current_time < end_time:
            active_tests[test_id] = test_data
        elif test_data['status'] == 'active' and current_time >= end_time:
            # Auto-expire tests
            tests[test_id]['status'] = 'completed'
    
    save_ab_tests(tests)
    return {'active_tests': active_tests}

@app.post('/ab_test/{test_id}/record')
def record_ab_test_event(test_id: str, event_data: dict = Body(...)):
    tests = load_ab_tests()
    
    if test_id not in tests:
        raise HTTPException(status_code=404, detail="Test not found")
    
    strategy = event_data.get('strategy', 'a')
    event_type = event_data.get('event_type', 'view')  # view, conversion
    value = event_data.get('value', 0)
    
    strategy_key = f'strategy_{strategy}'
    if strategy_key in tests[test_id]['results']:
        if event_type == 'view':
            tests[test_id]['results'][strategy_key]['views'] += 1
        elif event_type == 'conversion':
            tests[test_id]['results'][strategy_key]['conversions'] += 1
            tests[test_id]['results'][strategy_key]['revenue'] += value
    
    save_ab_tests(tests)
    return {'status': 'success', 'message': 'Event recorded'}

@app.get('/ab_test/{test_id}/results')
def get_ab_test_results(test_id: str):
    tests = load_ab_tests()
    
    if test_id not in tests:
        raise HTTPException(status_code=404, detail="Test not found")
    
    test_data = tests[test_id]
    results_a = test_data['results']['strategy_a']
    results_b = test_data['results']['strategy_b']
    
    # Calculate conversion rates and statistical significance
    conv_rate_a = results_a['conversions'] / max(results_a['views'], 1)
    conv_rate_b = results_b['conversions'] / max(results_b['views'], 1)
    
    avg_revenue_a = results_a['revenue'] / max(results_a['conversions'], 1)
    avg_revenue_b = results_b['revenue'] / max(results_b['conversions'], 1)
    
    # Simple statistical significance check (simplified)
    total_views = results_a['views'] + results_b['views']
    significance = 'insufficient_data' if total_views < 100 else 'needs_analysis'
    
    winner = 'a' if conv_rate_a > conv_rate_b else 'b'
    if abs(conv_rate_a - conv_rate_b) < 0.01:  # Less than 1% difference
        winner = 'tie'
    
    return {
        'test_data': test_data,
        'analysis': {
            'conversion_rate_a': round(conv_rate_a * 100, 2),
            'conversion_rate_b': round(conv_rate_b * 100, 2),
            'avg_revenue_a': round(avg_revenue_a, 2),
            'avg_revenue_b': round(avg_revenue_b, 2),
            'winner': winner,
            'statistical_significance': significance,
            'improvement': round(abs(conv_rate_a - conv_rate_b) * 100, 2)
        }
    }
# Enhanced discount calculation logic using dynamic config
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

# Advanced pricing algorithm with multiple factors
def calculate_dynamic_price(product_row, pricing_strategy='default'):
    """
    Calculate dynamic price based on multiple factors:
    - Competitor price
    - Inventory levels
    - Demand score
    - Time-based factors
    - Market positioning strategy
    """
    competitor_price = float(product_row['competitor_price'])
    inventory = int(product_row.get('inventory', 100))
    demand_score = float(product_row.get('demand_score', 1.0))
    
    # Base discount calculation
    disc = float(product_row['disc'])
    max_disc = config.get('max_discount', 0.3)
    min_disc = config.get('min_discount', 0.05)
    
    # Strategy-based pricing
    if pricing_strategy == 'aggressive':
        # More aggressive pricing for market penetration
        base_discount = calculate_discount(disc, max_disc, min_disc, 
                                         max_discount=0.4, min_discount=0.1)
    elif pricing_strategy == 'premium':
        # Premium positioning with smaller discounts
        base_discount = calculate_discount(disc, max_disc, min_disc,
                                         max_discount=0.15, min_discount=0.02)
    else:  # default
        base_discount = calculate_discount(disc, max_disc, min_disc)
    
    # Inventory-based adjustment
    inventory_factor = 1.0
    if inventory < 10:  # Low stock - increase price
        inventory_factor = 1.1
    elif inventory > 200:  # High stock - decrease price
        inventory_factor = 0.95
    
    # Demand-based adjustment
    demand_factor = 1.0
    if demand_score > 2.0:  # High demand - can charge more
        demand_factor = 1.05
    elif demand_score < 0.5:  # Low demand - need to discount more
        demand_factor = 0.9
    
    # Time-based factor (peak hours, seasonal trends, etc.)
    current_hour = datetime.utcnow().hour
    time_factor = 1.0
    if 18 <= current_hour <= 22:  # Peak shopping hours
        time_factor = 1.02
    elif 2 <= current_hour <= 6:  # Low activity hours
        time_factor = 0.98
    
    # Calculate final price
    final_discount = base_discount / (inventory_factor * demand_factor * time_factor)
    final_discount = max(0.01, min(final_discount, 0.5))  # Keep within reasonable bounds
    
    dynamic_price = competitor_price * (1 - final_discount)
    
    return {
        'price': round(dynamic_price, 2),
        'discount_applied': round(final_discount * 100, 2),
        'factors': {
            'base_discount': round(base_discount * 100, 2),
            'inventory_factor': inventory_factor,
            'demand_factor': demand_factor,
            'time_factor': time_factor
        }
    }

@app.get("/competitive_price/{product_id}")
def get_competitive_price(product_id: str, strategy: str = 'default'):
    global df
    df = load_df()  # reload fresh data each call
    product_row = df[df['id'].astype(str) == product_id]
    if product_row.empty:
        raise HTTPException(status_code=404, detail="Product not found")

    product = product_row.iloc[0]
    pricing_result = calculate_dynamic_price(product, strategy)
    
    return {
        "product_id": product_id,
        "competitor_price": float(product['competitor_price']),
        "our_price": pricing_result['price'],
        "discount_percentage": pricing_result['discount_applied'],
        "pricing_factors": pricing_result['factors'],
        "strategy_used": strategy,
        "last_updated": datetime.utcnow().isoformat()
    }

# Bulk pricing update endpoint
@app.post("/update_prices")
def update_bulk_prices(strategy: str = 'default', category: str = None):
    global df
    df = load_df()
    
    if df.empty:
        return {"error": "No products available for pricing update"}
    
    # Filter by category if specified
    if category:
        filtered_df = df[df['type'].str.lower() == category.lower()]
        if filtered_df.empty:
            return {"error": f"No products found in category: {category}"}
    else:
        filtered_df = df
    
    updated_products = []
    
    for _, product in filtered_df.iterrows():
        try:
            pricing_result = calculate_dynamic_price(product, strategy)
            
            # Update the our_price in the dataframe
            df.loc[df['id'] == product['id'], 'our_price'] = pricing_result['price']
            
            updated_products.append({
                'product_id': str(product['id']),
                'product_name': product.get('product_name', 'Unknown'),
                'old_price': float(product['our_price']),
                'new_price': pricing_result['price'],
                'discount_applied': pricing_result['discount_applied']
            })
            
        except Exception as e:
            print(f"Error updating price for product {product.get('id', 'unknown')}: {e}")
    
    # Save updated prices back to CSV
    try:
        df.to_csv(CSV_PATH, index=False)
        return {
            "status": "success",
            "strategy_used": strategy,
            "products_updated": len(updated_products),
            "category": category or "all",
            "updated_products": updated_products[:10],  # Return first 10 for brevity
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {"error": f"Failed to save updated prices: {e}"}

# Manual price update for specific product
@app.post("/product/{product_id}/update_price")
def update_product_price(product_id: str, update_data: PriceUpdateRequest):
    global df
    df = load_df()
    
    product_row = df[df['id'].astype(str) == product_id]
    if product_row.empty:
        raise HTTPException(status_code=404, detail="Product not found")
    
    old_price = float(product_row.iloc[0]['our_price'])
    
    # Update the price
    df.loc[df['id'].astype(str) == product_id, 'our_price'] = update_data.new_price
    
    # Log the price change
    price_change_log = {
        'product_id': product_id,
        'old_price': old_price,
        'new_price': update_data.new_price,
        'reason': update_data.reason,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    # Save updated dataframe
    try:
        df.to_csv(CSV_PATH, index=False)
        
        # Log price change (could be saved to a separate log file)
        print(f"Price updated: {price_change_log}")
        
        return {
            "status": "success",
            "message": "Price updated successfully",
            "change_log": price_change_log
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save price update: {e}")

# Inventory Management
@app.get("/inventory/status")
def get_inventory_status(category: str = None):
    global df
    df = load_df()
    
    if df.empty:
        return {"error": "No inventory data available"}
    
    if category:
        filtered_df = df[df['type'].str.lower() == category.lower()]
        if filtered_df.empty:
            return {"error": f"No inventory found for category: {category}"}
    else:
        filtered_df = df
    
    # Calculate inventory metrics
    inventory_metrics = {
        'total_products': len(filtered_df),
        'total_inventory': int(filtered_df['inventory'].sum()),
        'avg_inventory_per_product': round(filtered_df['inventory'].mean(), 1),
        'low_stock_products': len(filtered_df[filtered_df['inventory'] < 10]),
        'out_of_stock_products': len(filtered_df[filtered_df['inventory'] == 0]),
        'high_inventory_products': len(filtered_df[filtered_df['inventory'] > 200])
    }
    
    # Products by stock level
    low_stock = filtered_df[filtered_df['inventory'] < 10][
        ['id', 'product_name', 'inventory', 'our_price']
    ].to_dict('records')
    
    high_inventory = filtered_df[filtered_df['inventory'] > 200][
        ['id', 'product_name', 'inventory', 'our_price']
    ].to_dict('records')
    
    return {
        'category': category or 'all',
        'metrics': inventory_metrics,
        'alerts': {
            'low_stock_products': low_stock[:10],  # First 10
            'high_inventory_products': high_inventory[:10]
        },
        'timestamp': datetime.utcnow().isoformat()
    }

@app.post("/inventory/{product_id}/update")
def update_inventory(product_id: str, new_inventory: int = Body(..., embed=True)):
    global df
    df = load_df()
    
    product_row = df[df['id'].astype(str) == product_id]
    if product_row.empty:
        raise HTTPException(status_code=404, detail="Product not found")
    
    old_inventory = int(product_row.iloc[0]['inventory'])
    
    # Update inventory
    df.loc[df['id'].astype(str) == product_id, 'inventory'] = new_inventory
    
    # Save updated dataframe
    try:
        df.to_csv(CSV_PATH, index=False)
        
        # Trigger price update if inventory change is significant
        if abs(new_inventory - old_inventory) > 20:
            # Recalculate price based on new inventory
            updated_product = df[df['id'].astype(str) == product_id].iloc[0]
            pricing_result = calculate_dynamic_price(updated_product)
            df.loc[df['id'].astype(str) == product_id, 'our_price'] = pricing_result['price']
            df.to_csv(CSV_PATH, index=False)
            
            return {
                "status": "success",
                "message": "Inventory and price updated",
                "inventory_change": {
                    "old_inventory": old_inventory,
                    "new_inventory": new_inventory,
                    "difference": new_inventory - old_inventory
                },
                "price_update": {
                    "new_price": pricing_result['price'],
                    "factors": pricing_result['factors']
                }
            }
        else:
            return {
                "status": "success",
                "message": "Inventory updated",
                "inventory_change": {
                    "old_inventory": old_inventory,
                    "new_inventory": new_inventory,
                    "difference": new_inventory - old_inventory
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update inventory: {e}")
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
