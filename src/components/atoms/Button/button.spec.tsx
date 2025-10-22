import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Button from './button'; 

vi.mock('@atoms/Loading/loading', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('Button (Unit Component)', () => {

  // AAA -> Arrange, Act, Assert
  // Teste 1
  test('should renderize the children text', () => {
    // Arrange
    const buttonText = 'Click Me';

    // Act
    render(<Button>{buttonText}</Button>);

    // Assert
    const buttonElement = screen.getByRole('button', { name: buttonText });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveTextContent(buttonText);
  });

  // Teste 2
  test('should call the function onClick when clicked', () => {
    // Arrange
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Test Click</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Test Click' });

    // Act
    fireEvent.click(buttonElement); 

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Teste 3
  test('should desability the button when a prop disabled is True', () => {
    // Arrange
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Disabled Button</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Disabled Button' });

    // Act
    fireEvent.click(buttonElement); 

    // Assert
    expect(buttonElement).toBeDisabled(); 
    expect(handleClick).not.toHaveBeenCalled(); 
  });

  // Teste 4
test('should show the loading spinner and desbilited the button when loading is true', () => {
    // Arrange
    render(<Button loading>Loading Button</Button>);
    
    // Act & Assert

    const buttonElement = screen.getByRole('button');
    const loadingSpinner = screen.getByTestId('loading-spinner');
    const buttonText = screen.queryByText('Loading Button');
    
    expect(buttonText).toBeNull();
    expect(loadingSpinner).toBeInTheDocument();
    expect(buttonElement).toBeDisabled();
  });

  // Teste 5
  test('must show the alertNumber when is required', () => {
    // Arrange
    const alertNum = 5;
    render(<Button alertNumber={alertNum}>Button with Alert</Button>);
    
    // Act & Assert
    const alertSpan = screen.getByText(String(alertNum)); 
    expect(alertSpan).toBeInTheDocument();
    expect(alertSpan).toHaveClass('absolute');
  });

  // Teste 6
  test('apply personalities classes from className', () => {
    // Arrange
    const customClass = 'bg-red-500 text-lg';
    render(<Button className={customClass}>Custom Button</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Custom Button' });

    // Assert
    expect(buttonElement).toHaveClass('bg-red-500');
    expect(buttonElement).toHaveClass('text-lg');
  });

  // Teste 7
  test('apply personalities classes to intern text from className', () => {
    // Arrange
    const customTextClass = 'font-bold text-blue-500';
    render(<Button classNameText={customTextClass}>Styled Text</Button>);
    
    // Assert
    const textWrapper = screen.getByText('Styled Text').closest('div'); 
    expect(textWrapper).toHaveClass('font-bold');
    expect(textWrapper).toHaveClass('text-blue-500');
  });
});