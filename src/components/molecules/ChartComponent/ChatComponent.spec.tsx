import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import ChartComponent from "./ChartComponent";

vi.mock("@atoms/Dropdown/dropdown", () => ({
  default: (props: any) => {
    return (
      <button
        data-testid="mock-dropdown"
        onClick={() => props.options[0].onClick()}
      >
        {props.value}
      </button>
    );
  },
}));

vi.mock("@atoms/BarChart/barChart", () => ({
  default: (props: any) => <div data-testid="mock-barchart">BarChart</div>,
}));

vi.mock("@molecules/StackedChartLabels/StackedChartLabels", () => ({
  default: (props: any) => <div data-testid="mock-stackedchart">StackedChart</div>,
}));

vi.mock("@atoms/Subtitle/subtitle", () => ({
  default: (props: any) => <h2 data-testid="mock-subtitle">{props.children}</h2>,
}));


describe("ChartComponent (Integration)", () => {
  const mockDropdownOptions = [
    { label: "Option 1", onClick: vi.fn() },
    { label: "Option 2", onClick: vi.fn() },
  ];

  const mockBarChartData = {
    barLabel: "Sales",
    chartData: [10, 20, 30],
  };

  const mockStackedChartData = {
    chartData: [
      { label: "A", data: [1, 2, 3], color: "red" },
      { label: "B", data: [4, 5, 6], color: "blue" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Teste 1
  test("renders title, dropdown and charts correctly", () => {
    // Arrange
    render(
      <ChartComponent
        title="Dashboard"
        dropdownOptions={mockDropdownOptions}
        barChartData={mockBarChartData}
        stackedChartData={mockStackedChartData}
      />
    );

    // Assert
    expect(screen.getByTestId("mock-subtitle")).toHaveTextContent("Dashboard");
    expect(screen.getByTestId("mock-dropdown")).toHaveTextContent("Option 1");
    expect(screen.getByTestId("mock-barchart")).toBeInTheDocument();
    expect(screen.getByTestId("mock-stackedchart")).toBeInTheDocument();
  });

  // Teste 2
  test("dropdown interaction updates value and calls onClick", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <ChartComponent
        title="Dashboard"
        dropdownOptions={mockDropdownOptions}
        barChartData={mockBarChartData}
        stackedChartData={mockStackedChartData}
      />
    );

    const dropdown = screen.getByTestId("mock-dropdown");

    // Act
    await user.click(dropdown);

    // Assert
    expect(mockDropdownOptions[0].onClick).toHaveBeenCalled();
    expect(dropdown).toHaveTextContent("Option 1"); // value atual do estado
  });
});
