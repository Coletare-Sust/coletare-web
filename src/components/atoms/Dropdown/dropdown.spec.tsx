import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Dropdown from './dropdown';
import { DropdownProps } from './types';

vi.mock('lucide-react', () => ({
  ChevronDown: () => <span>▼</span>,
}));

describe('Dropdown (Behavior Test)', () => {
  const mockOptions: DropdownProps['options'] = [
    { label: 'Editar', onClick: vi.fn() },
    { label: 'Excluir', onClick: vi.fn() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should display the initial value and be closed', () => {
    render(<Dropdown value="Ações" options={mockOptions} />);
    
    // Assert
    const trigger = screen.getByText(/Ações/i).parentElement;
    expect(trigger).toBeInTheDocument();
    
    expect(screen.queryByRole('menuitem', { name: 'Editar' })).not.toBeInTheDocument();
  });
});