import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { AccordionChildren } from './accordion'; 
import { AccordionChildrenProps } from './types';

vi.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children, onValueChange, value }: any) => (
    <div data-testid="accordion-wrapper" data-open-item={value} onClick={() => onValueChange && onValueChange()}>
      {children}
    </div>
  ),
  AccordionItem: ({ children, value, className }: any) => (
    <div data-testid="accordion-item" data-value={value} className={className}>
      {children}
    </div>
  ),
  AccordionTrigger: ({ children, className }: any) => (
    <button className={className}>{children}</button>
  ),
  AccordionContent: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

const mockItems: AccordionChildrenProps['items'] = [
  {
    title: 'Title 1',
    properties: [{ prop: 'Prop A', answer: 'Answer A' }],
    children: <div>Content for item 1</div>,
  },
  {
    title: 'Title 2',
    properties: [{ prop: 'Prop B', answer: 'Answer B' }],
    children: <div>Content for item 2</div>,
  },
];

describe('AccordionChildren (Unit Component)', () => {
  // AAA -> Arrange, Act, Assert
  // Teste 1
  test('should renderize titles and properties for itens', () => {
    // Arrange
    render(<AccordionChildren items={mockItems} />);

    // Assert
    expect(screen.getByRole('heading', { name: 'Title 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Title 2' })).toBeInTheDocument();
    expect(screen.getByText('Prop A')).toBeInTheDocument();
    expect(screen.getByText('Answer A')).toBeInTheDocument();
  });

  // Teste 2
  test('On click in a trigger, should call setOPenItem correctly', () => {
    // Arrange
    const setOpenItemMock = vi.fn();
    render(<AccordionChildren items={mockItems} setOpenItem={setOpenItemMock} />);
    
    const firstTrigger = screen.getByRole('button', { name: /Title 1/ });
    // Act
    fireEvent.click(firstTrigger);
    // Assert
    expect(setOpenItemMock).toHaveBeenCalled();
  });

  // Teste 3
  test('should renderize the item content when select the OpenItem', () => {
    // Arrange
    render(<AccordionChildren items={mockItems} openItem="item-0 " />);

    // Assert
    expect(screen.getByText('Content for item 1')).toBeInTheDocument();
    
  });

  // Teste 4
  test('should apply the correct class to title when isRoute is True', () => {
    // Arrange
    render(<AccordionChildren items={mockItems} isRoute={true} />);

    // Assert
    const title = screen.getByRole('heading', { name: 'Title 1' });
    expect(title).toHaveClass('w-[90%]');
    expect(title).not.toHaveClass('w-[300px]');
  });

  // Teste 5
  test('should apply the personality class on item', () => {
    // Arrange
    render(<AccordionChildren items={mockItems} itemClassName="custom-item-class" />);

    // Assert
    const items = screen.getAllByTestId('accordion-item');
    expect(items[0]).toHaveClass('custom-item-class');
  });
});