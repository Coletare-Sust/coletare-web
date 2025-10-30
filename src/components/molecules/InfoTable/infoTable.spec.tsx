import React from "react";
import { render, screen } from "@testing-library/react";
import InfoTable from "./infoTable";

vi.mock("./InfoRow/infoRow", () => ({
  default: ({ data }: any) => (
    <div data-testid="info-row">{data.fullAddress}</div>
  ),
}));

describe("InfoTable Component", () => {
  // Teste 1  
  test("renders 'Sem resultados!' when data is empty or undefined", () => {
    const { rerender } = render(<InfoTable data={[]} />);
    expect(screen.getByText("Sem resultados!")).toBeInTheDocument();

    rerender(<InfoTable data={undefined} />);
    expect(screen.getByText("Sem resultados!")).toBeInTheDocument();
  });
  
  // Teste 2
  test("renders InfoRow for each item in data", () => {
    const mockData = [
      { fullAddress: "Rua 1", isResolved: false },
      { fullAddress: "Rua 2", isResolved: true },
    ];

    render(<InfoTable data={mockData} />);
    const rows = screen.getAllByTestId("info-row");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Rua 1");
    expect(rows[1]).toHaveTextContent("Rua 2");
  });

  // Teste 3
  test("sorts items with unresolved first", () => {
    const mockData = [
      { fullAddress: "Rua 1", isResolved: true },
      { fullAddress: "Rua 2", isResolved: false },
      { fullAddress: "Rua 3", isResolved: true },
    ];

    render(<InfoTable data={mockData} />);
    const rows = screen.getAllByTestId("info-row");
    expect(rows[0]).toHaveTextContent("Rua 2");
    expect(rows[1]).toHaveTextContent("Rua 1");
    expect(rows[2]).toHaveTextContent("Rua 3");
  });
});
