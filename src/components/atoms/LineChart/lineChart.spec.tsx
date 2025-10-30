import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import LineChart from './lineChart';

// ===================================================================
// 1. MOCK DO REACT-CHARTJS-2
// ===================================================================

// Capturamos as props que o componente Line recebe
let capturedProps: any = {};

vi.mock('react-chartjs-2', () => ({
  Line: (props: any) => {
    capturedProps = props;
    return <div data-testid="mock-line-chart">Mock Line Chart</div>;
  },
}));

// ===================================================================
// 2. TESTES
// ===================================================================

describe('LineChart (Unit Component)', () => {
  beforeEach(() => {
    capturedProps = {};
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------
  // TESTE 1 — Renderização básica
  // ---------------------------------------------------------------
  test('should render the LineChart component correctly', () => {
    // Arrange
    const chartData = [
      { label: 'Series A', data: [10, 20, 30], color: '#ff0000' },
      { label: 'Series B', data: [5, 15, 25], color: '#00ff00' },
    ];

    // Act
    render(<LineChart chartData={chartData} />);

    // Assert
    const chartElement = screen.getByTestId('mock-line-chart');
    expect(chartElement).toBeInTheDocument();
    expect(chartElement).toHaveTextContent('Mock Line Chart');
  });

  // ---------------------------------------------------------------
  // TESTE 2 — Deve passar os dados corretamente para o Line
  // ---------------------------------------------------------------
  test('should pass correct data props to Line', () => {
    // Arrange
    const chartData = [
      { label: 'Revenue', data: [100, 200, 300], color: '#123456' },
    ];
    const labelsX = ['Jan', 'Feb', 'Mar'];

    // Act
    render(<LineChart chartData={chartData} labelsX={labelsX} />);

    // Assert
    expect(capturedProps.data.labels).toEqual(labelsX);
    expect(capturedProps.data.datasets).toHaveLength(1);
    expect(capturedProps.data.datasets[0]).toMatchObject({
      label: 'Revenue',
      data: [100, 200, 300],
      borderColor: ['#123456'],
      pointBackgroundColor: ['#123456'],
      borderWidth: 2,
      fill: false,
    });
  });

  // ---------------------------------------------------------------
  // TESTE 3 — Deve aplicar classes corretamente (twMerge)
  // ---------------------------------------------------------------
  test('should merge and apply custom className', () => {
    // Arrange
    const chartData = [{ label: 'Test', data: [1, 2, 3], color: '#000' }];

    // Act
    render(<LineChart chartData={chartData} className="my-custom-class" />);

    // Assert
    const container = screen.getByTestId('mock-line-chart').parentElement;
    expect(container?.className).toContain('h-full');
    expect(container?.className).toContain('w-full');
    expect(container?.className).toContain('my-custom-class');
  });

  // ---------------------------------------------------------------
  // TESTE 4 — Deve conter opções de configuração esperadas
  // ---------------------------------------------------------------
  test('should include chart options with expected configuration', () => {
    // Arrange
    const chartData = [{ label: 'Sales', data: [1, 2, 3], color: '#000' }];

    // Act
    render(<LineChart chartData={chartData} />);

    // Assert
    expect(capturedProps.options.responsive).toBe(true);
    expect(capturedProps.options.maintainAspectRatio).toBe(false);

    // Verifica que a legenda foi desabilitada
    expect(capturedProps.options.plugins.legend.display).toBe(false);

    // Verifica presença de configurações de escalas
    expect(capturedProps.options.scales.x.display).toBe(true);
    expect(capturedProps.options.scales.y.grid.display).toBe(true);
  });
});
