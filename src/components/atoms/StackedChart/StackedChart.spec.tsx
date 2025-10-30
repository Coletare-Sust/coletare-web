import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import StackedChart from "./StackedChart";

let capturedProps: any = {};

vi.mock("react-chartjs-2", () => ({
  Bar: (props: any) => {
    capturedProps = props;
    return <div data-testid="mock-bar-chart">Mock Bar Chart</div>;
  },
}));

vi.mock("chartjs-plugin-datalabels", () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe("StackedChart (Unit Component)", () => {
  beforeEach(() => {
    capturedProps = {};
    vi.clearAllMocks();
  });

  // Teste 1
  test("should render the StackedChart component correctly", () => {
    // Arrange
    const chartData = [
      { label: "A", data: [10, 20, 30], color: "#ff0000" },
      { label: "B", data: [5, 15, 25], color: "#00ff00" },
    ];

    // Act
    render(<StackedChart chartData={chartData} />);

    // Assert
    const chartElement = screen.getByTestId("mock-bar-chart");
    expect(chartElement).toBeInTheDocument();
    expect(chartElement).toHaveTextContent("Mock Bar Chart");
  });

  // Teste 2
  test("should pass correct chart data and datalabels to Bar", () => {
    // Arrange
    const chartData = [
      { label: "Series 1", data: [10, 20], color: "#111" },
      { label: "Series 2", data: [5, 15], color: "#222" },
    ];
    const labelsX = ["Jan", "Feb"];

    // Act
    render(<StackedChart chartData={chartData} labelsX={labelsX} barThickness={60} />);

    // Assert
    expect(capturedProps.data.labels).toEqual(labelsX);
    expect(capturedProps.data.datasets).toHaveLength(2);
    expect(capturedProps.data.datasets[0]).toMatchObject({
      label: "Series 1",
      data: [10, 20],
      backgroundColor: "#111",
      barThickness: 60,
      stack: "1",
    });

    const datasetWithLabels = capturedProps.data.datasets[1].datalabels;
    expect(datasetWithLabels).toMatchObject({
      display: true,
      anchor: "end",
      align: "top",
    });
    expect(typeof datasetWithLabels.formatter).toBe("function");
  });

  // Teste 3
  test("should merge and apply default + custom classes", () => {
    // Arrange
    const chartData = [{ label: "X", data: [1, 2], color: "#000" }];

    // Act
    render(<StackedChart chartData={chartData} className="extra-class" />);

    // Assert
    const container = screen.getByTestId("mock-bar-chart").parentElement;
    expect(container?.className).toContain("h-full");
    expect(container?.className).toContain("w-full");
    expect(container?.className).toContain("extra-class");
  });

  // Teste 4
  test("should include correct chart options and plugins", () => {
    // Arrange
    const chartData = [{ label: "Sales", data: [1, 2, 3], color: "#000" }];

    // Act
    render(<StackedChart chartData={chartData} />);

    // Assert
    expect(capturedProps.options.responsive).toBe(true);
    expect(capturedProps.options.maintainAspectRatio).toBe(false);
    expect(capturedProps.options.plugins.legend.display).toBe(false);
    expect(capturedProps.options.scales.x.display).toBe(true);
    expect(capturedProps.options.scales.y.grid.display).toBe(true);
    expect(capturedProps.plugins).toHaveLength(1);
  });

  // Teste 5
  test("should use default monthsArray labels when labelsX is not provided", () => {
    // Arrange
    const chartData = [{ label: "Default Test", data: [1, 2, 3], color: "#123" }];

    // Act
    render(<StackedChart chartData={chartData} />);

    // Assert
    expect(capturedProps.data.labels).toBeDefined();
    expect(Array.isArray(capturedProps.data.labels)).toBe(true);
    expect(capturedProps.data.labels.length).toBeGreaterThan(0);
  });
});
