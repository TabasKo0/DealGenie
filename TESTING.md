# Testing Infrastructure

This document describes the comprehensive testing infrastructure implemented for DealGenie.

## Overview

The project now includes comprehensive testing infrastructure for both backend and frontend components, addressing the requirement mentioned in the main README for "comprehensive testing required."

## Backend Testing

### Framework: pytest
- **Location**: `backend/tests/`
- **Configuration**: `backend/pytest.ini`
- **Test Count**: 22 tests

### Running Backend Tests
```bash
cd backend
pip install -r requirements.txt
python -m pytest tests/ -v
```

### Test Categories
1. **API Tests** (`test_api.py`): Tests all API endpoints
2. **Business Logic Tests** (`test_business_logic.py`): Tests core business functions
3. **Pricing Algorithm Tests** (`test_pricing.py`): Tests dynamic pricing calculations

## Frontend Testing

### Framework: Jest + React Testing Library
- **Location**: `frontend/__tests__/`
- **Configuration**: `frontend/jest.config.js`, `frontend/jest.setup.js`
- **Test Count**: 8 tests

### Running Frontend Tests
```bash
cd frontend
npm install
npm test
```

### Test Categories
1. **Component Tests**: Tests React component rendering and interactions
2. **Integration Tests**: Tests API calls and user interactions

## CI/CD Pipeline

### GitHub Actions Workflow
- **File**: `.github/workflows/ci.yml`
- **Triggers**: Push/PR to main or develop branches

### Pipeline Jobs
1. **Backend Tests**: Runs pytest with Python 3.12
2. **Frontend Tests**: Runs Jest with Node.js 18
3. **Integration Tests**: Starts backend server and tests integration

### Running Locally
```bash
# Backend tests
cd backend && python -m pytest tests/ -v

# Frontend tests  
cd frontend && npm test -- --watchAll=false

# Both
npm run test # (if added to root package.json)
```

## Test Coverage

### Backend Coverage (22 tests)
- ✅ All major API endpoints
- ✅ Configuration management
- ✅ A/B testing functionality  
- ✅ Dynamic pricing algorithms
- ✅ Data loading and processing

### Frontend Coverage (8 tests)
- ✅ Component rendering
- ✅ User interactions
- ✅ Form submissions
- ✅ API integration

## Development Workflow

1. **Before making changes**: Run existing tests to ensure they pass
2. **After making changes**: Run tests again to ensure no regressions
3. **For new features**: Add corresponding tests
4. **Before submitting PR**: Ensure all tests pass in CI/CD

## Test Commands Summary

```bash
# Backend only
cd backend && python -m pytest tests/ -v

# Frontend only  
cd frontend && npm test -- --watchAll=false

# With coverage
cd backend && python -m pytest tests/ --coverage
cd frontend && npm test -- --coverage
```

This testing infrastructure ensures code quality, prevents regressions, and provides confidence in the DealGenie codebase.