import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, vi, beforeEach } from "vitest";
import ConfirmationModal from "./confirmationModal";

vi.mock("@molecules/TransitionModal/transitionModal", () => ({
  default: ({ isOpen, setIsOpen, children }: any) => {
    return isOpen ? (
      <div data-testid="mock-transition-modal">
        <button onClick={() => setIsOpen(false)}>CloseModal</button>
        {children}
      </div>
    ) : null;
  }
}));

vi.mock("@atoms/Button/button", () => ({
  default: ({ onClick, children, loading }: any) => (
    <button data-testid="mock-button" onClick={onClick} disabled={loading}>
      {children}
    </button>
  )
}));

describe("ConfirmationModal Integration Test", () => {
  const mockOnConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Teste 1
  test("should render modal with title, description and buttons", async () => {
    // Arrange
    render(
      <ConfirmationModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        title="Confirmação"
        description="Deseja continuar?"
      />
    );

    // Act & Assert
    const modal = screen.getByTestId("mock-transition-modal");
    expect(modal).toBeInTheDocument();

    expect(screen.getByText("Confirmação")).toBeInTheDocument();
    expect(screen.getByText("Deseja continuar?")).toBeInTheDocument();

    const buttons = screen.getAllByTestId("mock-button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("Cancelar");
    expect(buttons[1]).toHaveTextContent("Confirmar");
  });

  // Teste 2
  test("should call onConfirm when Confirmar button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ConfirmationModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        title="Confirmação"
        description="Deseja continuar?"
      />
    );

    const confirmButton = screen.getAllByTestId("mock-button")[1];
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  // Teste 3
  test("should call onOpenChange when Cancelar button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ConfirmationModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        title="Confirmação"
        description="Deseja continuar?"
      />
    );

    const cancelButton = screen.getAllByTestId("mock-button")[0];
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  // Teste 4
  test("Confirmar button should be disabled when loading", () => {
    render(
      <ConfirmationModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
        title="Confirmação"
        description="Deseja continuar?"
        confirmIsLoading={true}
      />
    );

    const confirmButton = screen.getAllByTestId("mock-button")[1];
    expect(confirmButton).toBeDisabled();
  });
});
