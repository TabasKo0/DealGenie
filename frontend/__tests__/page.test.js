import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../src/app/page'
import '@testing-library/jest-dom'

// Mock the fetch function
global.fetch = jest.fn()

// Mock the toast functions
jest.mock('react-hot-toast', () => ({
  toast: {
    loading: jest.fn(),
    dismiss: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div>Toaster</div>,
}))

// Mock the Orb component
jest.mock('../src/app/Orb/orb.js', () => {
  return function MockOrb() {
    return <div data-testid="orb">Orb Component</div>
  }
})

describe('Home Page', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('renders login form elements', () => {
    render(<Home />)
    
    // Check for form elements using more specific selectors
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByText('🙏 Login')).toBeInTheDocument()
    expect(screen.getByText('👋Signup')).toBeInTheDocument()
  })

  it('updates username state when input changes', () => {
    render(<Home />)
    
    const usernameInput = screen.getByPlaceholderText('Username')
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    
    expect(usernameInput.value).toBe('testuser')
  })

  it('handles form submission', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue('User Created'),
    }
    fetch.mockResolvedValue(mockResponse)

    render(<Home />)
    
    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const signupButton = screen.getByText('👋Signup')

    // Fill in the form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })
    
    // Submit the form
    fireEvent.click(signupButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'testpass' }),
      })
    })
  })

  it('renders Orb component', () => {
    render(<Home />)
    
    expect(screen.getByTestId('orb')).toBeInTheDocument()
  })
})