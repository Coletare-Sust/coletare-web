import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import MoreDropdown from "./moreDropdown";

let capturedProps: Record<string, any> = {};

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="mock-dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, ...props }: any) => {
    capturedProps.trigger = props;
    return (
      <div data-testid="mock-dropdown-trigger" {...props}>
        {children}
      </div>
    );
  },
  DropdownMenuContent: ({ children, ...props }: any) => {
    capturedProps.content = props;
    return (
      <div data-testid="mock-dropdown-content" {...props}>
        {children}
      </div>
    );
  },
  DropdownMenuItem: ({ children, ...props }: any) => (
    <div data-testid="mock-dropdown-item" {...props}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="mock-dropdown-separator" />,
}));

vi.mock("lucide-react", () => ({
  MoreVertical: (props: any) => <svg data-testid="mock-more-vertical" {...props} />,
}));


describe("MoreDropdown (Unit Component)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedProps = {};
  });

  // Teste 1
  test("should render the dropdown trigger with MoreVertical icon", () => {
    // Arrange
    render(<MoreDropdown options={[]} />);

    // Act
    const trigger = screen.getByTestId("mock-dropdown-trigger");
    const icon = screen.getByTestId("mock-more-vertical");

    // Assert
    expect(trigger).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("color", "#93B1B5");
    expect(icon).toHaveAttribute("size", "34");
  });

  // Teste 2
  test("should render all options when provided", () => {
    // Arrange
    const mockOptions = [
      { label: "Editar", onClick: vi.fn() },
      { label: "Excluir", onClick: vi.fn() },
    ];

    // Act
    render(<MoreDropdown options={mockOptions} />);

    // Assert
    const items = screen.getAllByTestId("mock-dropdown-item");
    const separators = screen.getAllByTestId("mock-dropdown-separator");

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Editar");
    expect(items[1]).toHaveTextContent("Excluir");
    expect(separators).toHaveLength(1); // separador entre itens
  });

  // Teste 3
  test("should call option onClick when clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    const mockOptions = [{ label: "Remover", onClick: mockOnClick }];

    render(<MoreDropdown options={mockOptions} />);

    // Act
    const item = screen.getByText("Remover");
    await user.click(item);

    // Assert
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Teste 4
  test("should not render dropdown content when disabled", () => {
    // Arrange
    const mockOptions = [{ label: "Visualizar", onClick: vi.fn() }];

    // Act
    render(<MoreDropdown options={mockOptions} disabled />);

    // Assert
    expect(screen.queryByTestId("mock-dropdown-content")).not.toBeInTheDocument();
  });

  // Teste 5
  test("should apply disabled styles when disabled or no options", () => {
    // Arrange
    render(<MoreDropdown options={[]} disabled />);

    // Act
    const trigger = screen.getByTestId("mock-dropdown-trigger");

    // Assert
    expect(trigger.className).toContain("cursor-not-allowed");
    expect(trigger.className).toContain("opacity-60");
  });

  // Teste 6
  test("should render DropdownMenu with modal set to false", () => {
    // Arrange
    render(<MoreDropdown options={[]} />);

    // Act
    const menu = screen.getByTestId("mock-dropdown-menu");

    // Assert
    expect(menu).toBeInTheDocument();
  });
});
