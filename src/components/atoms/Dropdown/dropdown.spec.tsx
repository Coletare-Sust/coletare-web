import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Dropdown from './dropdown';
import { DropdownProps } from './types';

// O mock do ícone não é mais essencial para a busca, mas o mantemos
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
    
    // Assert: Busca o texto e garante que seu container (o gatilho) está na tela
    const trigger = screen.getByText(/Ações/i).parentElement;
    expect(trigger).toBeInTheDocument();
    
    expect(screen.queryByRole('menuitem', { name: 'Editar' })).not.toBeInTheDocument();
  });

  test('should show options when the user clicks the trigger', async () => {
    const user = userEvent.setup();
    render(<Dropdown value="Ações" options={mockOptions} />);
    
    // Act: Busca o gatilho pelo texto e clica nele
    const trigger = screen.getByText(/Ações/i).parentElement!;
    await user.click(trigger);

    // Assert
    expect(await screen.findByRole('menuitem', { name: 'Editar' })).toBeVisible();
    expect(await screen.findByRole('menuitem', { name: 'Excluir' })).toBeVisible();
  });

  test('should call the correct function when the user clicks an option', async () => {
    const user = userEvent.setup();
    render(<Dropdown value="Ações" options={mockOptions} />);
    
    // Act
    const trigger = screen.getByText(/Ações/i).parentElement!;
    await user.click(trigger); // Abre o menu
    await user.click(await screen.findByRole('menuitem', { name: 'Excluir' }));

    // Assert
    expect(mockOptions[1].onClick).toHaveBeenCalledTimes(1);
    expect(mockOptions[0].onClick).not.toHaveBeenCalled();
  });

  test('should be disabled and not open the menu when disabled prop is true', async () => {
    const user = userEvent.setup();
    render(<Dropdown value="Ações" options={mockOptions} disabled={true} />);

    // Assert: Busca o gatilho pelo texto e verifica se está desabilitado
    const trigger = screen.getByText(/Ações/i).parentElement!;
    expect(trigger).toHaveAttribute('disabled');

    // Act: Tenta clicar
    await user.click(trigger);

    // Assert: O menu não deve abrir
    expect(screen.queryByRole('menuitem', { name: 'Editar' })).not.toBeInTheDocument();
  });
});