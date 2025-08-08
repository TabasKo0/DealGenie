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
PRICEAPI_TOKEN = "ZEKPINXEAXPSLUPFCDLLQNRPBVWVYPULTOBEUUABFEDOCCCCIMSNWXKNLSZASHUA"

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
    "min_discount": 0.05
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

@app.on_event("startup")
def start_periodic_ingest():
    import threading
    t = threading.Thread(target=periodic_ingest, daemon=True)
    t.start()

# --- Models ---
class ProductIngestRequest(BaseModel):
    product_name: str

# --- Ingest product using PriceAPI ---
@app.post('/ingest_product')
def ingest_product(data: ProductIngestRequest):
    product_name = data.product_name

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
