import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import InfoRow from "./infoRow";

vi.mock("@hooks/queries/useOneUser", () => ({
  default: vi.fn(() => ({ data: { name: "Usuário Teste" } })),
}));

describe("InfoRow", () => {
  const baseData = {
    createdById: "123",
    createdAt: { seconds: 1700000000 },
    fullAddress: "Rua das Flores, 123",
    residueType: "Orgânico",
    onClick: vi.fn(),
  };

  // Teste 1
  test("renders correctly the main fields", () => {
    render(<InfoRow data={{ ...baseData, isResolved: false }} />);

    expect(screen.getByText("Aberto")).toBeInTheDocument();
    expect(screen.getByText("Rua das Flores, 123")).toBeInTheDocument();
    expect(screen.getByText("Usuário Teste")).toBeInTheDocument();
    expect(screen.getByText("Orgânico")).toBeInTheDocument();
  });

  // Teste 2
  test("show 'Fechado' when isResolved is true", () => {
    render(<InfoRow data={{ ...baseData, isResolved: true }} />);

    expect(screen.getByText("Fechado")).toBeInTheDocument();
  });

  // Teste 3
  test("calls onClick just when isResolved is false", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <InfoRow data={{ ...baseData, isResolved: false, onClick }} />
    );
    fireEvent.click(screen.getByText("Aberto"));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<InfoRow data={{ ...baseData, isResolved: true, onClick }} />);
    fireEvent.click(screen.getByText("Fechado"));
    expect(onClick).toHaveBeenCalledTimes(1); // continua 1
  });
});
