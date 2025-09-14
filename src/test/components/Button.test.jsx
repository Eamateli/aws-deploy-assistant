import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../../components/core/Button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-600') // Primary variant default
  })

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200')

    rerender(<Button variant="success">Success</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-green-600')
  })

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm')

    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-4', 'py-2', 'text-base')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('handles loading state correctly', () => {
    render(<Button loading>Loading</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('handles disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick} disabled>Disabled</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick} loading>Loading</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('supports keyboard navigation', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Press Enter</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard('{Enter}')
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('forwards additional props correctly', () => {
    render(
      <Button 
        data-testid="custom-button" 
        aria-label="Custom button"
        type="submit"
      >
        Submit
      </Button>
    )
    
    const button = screen.getByTestId('custom-button')
    expect(button).toHaveAttribute('aria-label', 'Custom button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('font-semibold') // Should still have base classes
  })

  it('renders with icon when provided', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>
    
    render(
      <Button icon={<TestIcon />}>
        With Icon
      </Button>
    )
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })

  it('renders icon-only button correctly', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>
    
    render(
      <Button icon={<TestIcon />} aria-label="Icon only button" />
    )
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByLabelText('Icon only button')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<Button>Accessible Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
    expect(button).not.toHaveAttribute('aria-disabled')
    
    // Test with disabled state
    const { rerender } = render(<Button disabled>Disabled Button</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  it('maintains focus styles for keyboard users', () => {
    render(<Button>Focus me</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2')
  })
})