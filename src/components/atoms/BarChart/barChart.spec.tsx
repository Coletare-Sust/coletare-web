import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import BarChart from './barChart';

let capturedProps: any = {};
vi.mock('react-chartjs-2', () => ({
  Bar: (props: any) => {
    capturedProps = props;
    return <div data-testid="mock-bar-chart" />;
  },
}));

vi.mock('./generateColorsBarChart', () => ({
  generateColorsBarChart: () => ['mock-color-1', 'mock-color-2'],
}));

vi.mock('chartjs-plugin-datalabels', () => ({
  default: {},
}));

describe('BarChart (Unit Component)', () => {
  beforeEach(() => {
    capturedProps = {};
  });

  test('should pass correctly formatted data and options to the Bar component', () => {
    // Arrange
    const testProps = {
      barLabel: 'Vendas Mensais',
      chartData: [150, 200],
      labelsX: ['Janeiro', 'Fevereiro'],
    };

    // Act
    render(<BarChart {...testProps} />);

    // Assert
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    const { data } = capturedProps;
    expect(data.labels).toEqual(['Janeiro', 'Fevereiro']);
    expect(data.datasets).toHaveLength(1);
    expect(data.datasets[0].label).toBe('Vendas Mensais');
    expect(data.datasets[0].data).toEqual([150, 200]);
    expect(data.datasets[0].backgroundColor).toEqual(['mock-color-1', 'mock-color-2']);
    const { options } = capturedProps;
    expect(options.plugins.legend.display).toBe(false);
    expect(options.scales.x.grid.display).toBe(false);
    expect(options.scales.y.grid.display).toBe(true);
  });

  test('should use default month labels when labelsX is not provided', () => {
    // Arrange
    const testProps = {
      barLabel: 'Faturamento',
      chartData: [100],
    };

    // Act
    render(<BarChart {...testProps} />);

    // Assert
    const { data } = capturedProps;   
    expect(data.labels.length).toBe(12);
    expect(data.labels[0]).toBe('Jan'); 
  });
});