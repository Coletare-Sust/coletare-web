import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DayCheckbox from './dayCheckbox';
import { DayCheckboxProps } from './types';

vi.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon" />,
}));

describe('DayCheckbox (Unit Component)', () => {
  const mockSetDays = vi.fn();
  const mockSetError = vi.fn();

  const defaultProps: DayCheckboxProps = {
    name: 'day-1',
    label: 'Segunda-feira',
    days: [false, false, false, false, false, false, false], 
    position: 0, 
    setDays: mockSetDays,
    setError: mockSetError,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Teste 1
  test('should render the label and in an unchecked state', () => {
    // Arrange and Act
    render(<DayCheckbox {...defaultProps} />);

    // Assert
    const labelElement = screen.getByText('Segunda-feira');
    expect(labelElement).toBeInTheDocument();
    expect(screen.queryByTestId('check-icon')).toBeNull();

    const inputElement = screen.getByLabelText('Segunda-feira');
    expect(inputElement).not.toBeChecked();
  });

  // Teste 2
  test('should render in a checked state and show the check icon', () => {
    // Arrange and Act
    const checkedProps = {
      ...defaultProps,
      days: [true, false, false, false, false, false, false],
    };
    render(<DayCheckbox {...checkedProps} />);

    // Assert
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    const inputElement = screen.getByLabelText('Segunda-feira');
    expect(inputElement).toBeChecked();
  });

  // Teste 3
  test('should call setDays and setError when clicked to check', () => {
    // Arrange
    render(<DayCheckbox {...defaultProps} />);
    const labelElement = screen.getByText('Segunda-feira');

    // Act
    fireEvent.click(labelElement);

    // Assert
    expect(mockSetError).toHaveBeenCalledTimes(1);
    expect(mockSetError).toHaveBeenCalledWith("");
    const expectedArray = [true, false, false, false, false, false, false];
    expect(mockSetDays).toHaveBeenCalledTimes(1);
    expect(mockSetDays).toHaveBeenCalledWith(expectedArray);
  });

  // Teste 4
  test('should call setDays to uncheck when clicked', () => {
    // Arrange
    const checkedProps = {
      ...defaultProps,
      days: [true, false, false, false, false, false, false],
    };
    render(<DayCheckbox {...checkedProps} />);
    const labelElement = screen.getByText('Segunda-feira');

    // Act
    fireEvent.click(labelElement);

    // Assert
    const expectedArray = [false, false, false, false, false, false, false];
    expect(mockSetDays).toHaveBeenCalledTimes(1);
    expect(mockSetDays).toHaveBeenCalledWith(expectedArray);
  });
});