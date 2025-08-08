# DealGenie - Dynamic E-commerce Pricing Engine

DealGenie is an AI-driven dynamic pricing system that optimizes product prices in real-time based on market factors, demand trends, inventory levels, and competitive analysis. Built with FastAPI backend and Next.js frontend, it provides comprehensive pricing analytics and automated price adjustments.

## 🖼️ Application Screenshots

![using integrated ai to get suggestion to get assistance in buying](https://github.com/user-attachments/assets/f2097915-e953-47a2-b4dc-f11c98a2c75e)
![phones_store_page](https://github.com/user-attachments/assets/bb3742c8-0467-4a01-8c53-37753be4ee3c)
![login-menu](https://github.com/user-attachments/assets/50057314-2c79-4e0f-ab0b-1797b686c197)
![login_page](https://github.com/user-attachments/assets/08dc8d51-96c9-4316-a59d-848761e5d3f5)
![laptop store page](https://github.com/user-attachments/assets/c768593f-ccd5-41d2-bb77-dd3adfa8b957)
![heaphones_store_page](https://github.com/user-attachments/assets/fb917e48-cbb3-46cf-bea0-c75757cfe726)
![competittive pricing from our website](https://github.com/user-attachments/assets/d905c64e-8a0d-492e-8814-71a82b7d235e)
![cmdline of ingressing live price data](https://github.com/user-attachments/assets/00456fc6-99c1-416a-b368-ab5a1fecf22b)
![admin page](https://github.com/user-attachments/assets/c16c3764-9a29-4164-8b3a-89a8b12f203e)
![4000+ data taken and stored in csv format for easy visibility ](https://github.com/user-attachments/assets/51bdff80-6708-46fa-b5ef-8e2546c42bb3)
![phone_store_page](https://github.com/user-attachments/assets/a7ebadea-af97-4b97-8950-c5167ebf6403)
![headphones_stores_page](https://github.com/user-attachments/assets/35138a3c-b25f-45dd-8e07-8c2d34be28ff)
![speakers store page](https://github.com/user-attachments/assets/6e1c33cb-70f7-449a-beea-bfa10008fc0d)
![product page](https://github.com/user-attachments/assets/5e6eb2fb-dfaa-4b57-b469-5835a8568a98)
![profile page with cart and logout button](https://github.com/user-attachments/assets/a5299a54-594c-46be-a487-fe19a8cffa4f)
![watches store page](https://github.com/user-attachments/assets/74d91e9f-699c-42c7-8ccb-5a6a242f6991)

## 🚀 Features

### Core Dynamic Pricing Engine
- **Real-time Price Optimization**: Automated price calculations based on multiple market factors
- **Multi-strategy Pricing**: Support for aggressive, premium, and balanced pricing strategies
- **Demand-based Adjustments**: Dynamic pricing based on demand scores and market positioning
- **Inventory-aware Pricing**: Automatic price adjustments based on stock levels
- **Time-based Optimization**: Price adjustments for peak hours and seasonal trends

### Data Ingestion & Management
- **External API Integration**: Automated data collection from PriceAPI (Google Shopping)
- **Fallback Data System**: Robust fallback mechanisms when external APIs are unavailable
- **Periodic Data Updates**: Automated hourly product data ingestion
- **Multiple Product Categories**: Support for phones, laptops, headphones, speakers, smart watches
- **Configurable Retry Logic**: Exponential backoff for API failures

### Advanced Analytics
- **Pricing Performance**: Track price changes, savings, and market competitiveness
- **Inventory Analytics**: Monitor stock levels, low stock alerts, and inventory trends
- **Category-wise Insights**: Detailed analytics by product category
- **Revenue Optimization**: Calculate potential savings and revenue improvements
- **Real-time Dashboards**: Live updates on pricing performance

### A/B Testing Framework
- **Strategy Testing**: Compare different pricing strategies side-by-side
- **Performance Metrics**: Track conversion rates, revenue per strategy
- **Statistical Analysis**: Basic significance testing for A/B experiments
- **Custom Test Duration**: Configurable test periods with automatic completion
- **Traffic Splitting**: Configurable traffic allocation between strategies

### Inventory Management
- **Real-time Stock Tracking**: Monitor inventory levels across all products
- **Low Stock Alerts**: Automatic alerts for products running low
- **Inventory-based Pricing**: Price adjustments triggered by stock changes
- **Bulk Inventory Updates**: Mass inventory updates with automatic price recalculation

## 🛠 Technology Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **Pandas**: Data processing and analysis
- **Uvicorn**: ASGI server for production deployment
- **Pydantic**: Data validation and settings management
- **CSV Storage**: Lightweight data persistence (scalable to databases)

### Frontend
- **Next.js 15**: React-based web framework
- **Tailwind CSS**: Utility-first CSS framework
- **React Components**: Modular UI components
- **Responsive Design**: Mobile-first responsive interface

### External Integrations
- **PriceAPI**: Google Shopping data integration
- **Configurable APIs**: Easy integration with other price comparison services

## 📋 API Endpoints

### Product Data Management
```
POST /ingest_product
- Ingest product data from external APIs
- Body: {"product_name": "phone"}
- Returns: Product count and ingestion status

GET /analytics
- Comprehensive pricing analytics
- Returns: Product summaries, savings calculations

GET /analytics/performance
- Performance analytics by category
- Returns: Trends, competitiveness metrics

POST /product_by_id
- Get detailed product specifications
- Body: {"id": "product_id"}
```

### Dynamic Pricing
```
GET /competitive_price/{product_id}?strategy={strategy}
- Get dynamic price for specific product
- Strategies: default, aggressive, premium
- Returns: Optimized price with factor breakdown

POST /update_prices?strategy={strategy}&category={category}
- Bulk price updates for products
- Returns: Updated product list with new prices

POST /product/{product_id}/update_price
- Manual price override for specific product
- Body: {"new_price": 1000, "reason": "promotion"}
```

### Inventory Management
```
GET /inventory/status?category={category}
- Get inventory status and alerts
- Returns: Stock levels, low stock warnings

POST /inventory/{product_id}/update
- Update inventory for specific product
- Body: new_inventory (integer)
- Triggers automatic price recalculation
```

### A/B Testing
```
POST /ab_test/create
- Create new A/B test
- Body: Test configuration with strategies

GET /ab_test/active
- Get all active A/B tests

POST /ab_test/{test_id}/record
- Record test events (views, conversions)

GET /ab_test/{test_id}/results
- Get A/B test results and analysis
```

### Admin Configuration
```
GET /admin/discount_params
- Get current pricing configuration

POST /admin/discount_params
- Update pricing parameters
- Body: {"max_discount": 0.3, "min_discount": 0.05}
```

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
pip install pandas requests

# Optional: Set environment variables
export PRICEAPI_TOKEN="your_api_token"

# Start the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Server starts on http://localhost:3003
```

### Configuration
The system uses configurable parameters stored in `backend/app/config.json`:

```json
{
  "max_discount": 0.3,
  "min_discount": 0.05,
  "enable_periodic_ingestion": true,
  "ingestion_interval": 3600,
  "retry_attempts": 3,
  "retry_delay": 2.0
}
```

## 🎯 Pricing Algorithms

### Dynamic Pricing Formula
```
final_price = competitor_price × (1 - adjusted_discount)

adjusted_discount = base_discount ÷ (inventory_factor × demand_factor × time_factor)
```

### Pricing Factors

#### 1. **Base Discount Calculation**
- Normalized position in product ranking
- Strategy-specific discount ranges:
  - **Aggressive**: 10-40% discount range
  - **Premium**: 2-15% discount range
  - **Default**: 5-30% discount range

#### 2. **Inventory Factor**
- **Low Stock (< 10 units)**: +10% price increase
- **High Stock (> 200 units)**: -5% price decrease
- **Normal Stock**: No adjustment

#### 3. **Demand Factor**
- **High Demand (score > 2.0)**: +5% price increase
- **Low Demand (score < 0.5)**: -10% price decrease
- **Normal Demand**: No adjustment

#### 4. **Time Factor**
- **Peak Hours (6-10 PM)**: +2% price increase
- **Low Activity (2-6 AM)**: -2% price decrease
- **Regular Hours**: No adjustment

### Demand Scoring Algorithm
```python
demand_score = position_score × price_score × time_factor

# Position Score: Higher search ranking = higher demand
position_score = max(0.3, 2.0 - (search_position × 0.1))

# Price Score: Category-specific sweet spots
# Phones: 15k-30k range gets 1.5x multiplier
# Laptops: 40k-80k range gets 1.4x multiplier
```

## 📊 Analytics & Reporting

### Pricing Analytics
- **Total Products**: Count of products under management
- **Average Prices**: Competitor vs. our pricing comparison
- **Potential Savings**: Revenue optimization opportunities
- **Price Ranges**: Min/max price analysis
- **Category Distribution**: Product count by category

### Performance Metrics
- **Conversion Rates**: Track pricing strategy effectiveness
- **Revenue Per Product**: Average revenue by category
- **Inventory Turnover**: Stock movement analysis
- **Price Competitiveness**: Market positioning metrics

### A/B Test Analytics
- **Conversion Rate Comparison**: Strategy A vs. Strategy B
- **Revenue Impact**: Financial performance of each strategy
- **Statistical Significance**: Confidence in test results
- **Traffic Distribution**: Actual vs. intended traffic split

## 🔧 Advanced Configuration

### Environment Variables
```bash
PRICEAPI_TOKEN=your_api_token          # External API authentication
DATABASE_URL=sqlite:///pricing.db      # Database connection (future)
REDIS_URL=redis://localhost:6379       # Caching (future)
LOG_LEVEL=INFO                         # Logging level
```

### Custom Pricing Strategies
Add new strategies by extending the `calculate_dynamic_price` function:

```python
# Example: Clearance strategy
elif pricing_strategy == 'clearance':
    base_discount = calculate_discount(disc, max_disc, min_disc,
                                     max_discount=0.7, min_discount=0.3)
```

### Product Category Configuration
Extend `PRODUCTS_TO_TRACK` for new categories:

```python
PRODUCTS_TO_TRACK = [
    'phone', 'laptop', 'headphones', 'speakers', 
    'smart watches', 'tablets', 'gaming'  # Add new categories
]
```

## 🚨 Error Handling & Resilience

### Network Failure Recovery
- **Retry Logic**: Exponential backoff with configurable attempts
- **Fallback Data**: Sample product data when APIs are unavailable
- **Graceful Degradation**: System continues operating with cached data

### Data Validation
- **Price Bounds**: Automatic validation of price ranges
- **Inventory Limits**: Prevent negative or unrealistic inventory values
- **Input Sanitization**: Protect against malformed requests

### Monitoring & Logging
- **Request Logging**: All API calls are logged with timestamps
- **Error Tracking**: Detailed error messages and stack traces
- **Performance Monitoring**: Response time tracking

## 🔄 Future Enhancements

### Database Integration
- Migration from CSV to PostgreSQL/MySQL
- Real-time data synchronization
- Advanced querying capabilities

### Machine Learning
- Predictive demand forecasting
- Customer behavior analysis
- Automated strategy optimization

### External Integrations
- E-commerce platform APIs (Shopify, WooCommerce)
- Payment gateway integration
- Customer management systems

### Advanced Analytics
- Customer lifetime value analysis
- Seasonal trend prediction
- Competitor price monitoring

## 📈 Performance Optimization

### Caching Strategy
- Redis integration for frequent queries
- In-memory caching for price calculations
- CDN integration for static assets

### Scalability
- Horizontal scaling with load balancers
- Database sharding for large datasets
- Microservices architecture migration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@dealgenie.com
- Documentation: [Wiki](https://github.com/TabasKo0/DealGenie/wiki)

---

Built with ❤️ by the DealGenie Team
