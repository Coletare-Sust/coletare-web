import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Radio from "./Radio";

// ===================================================================
// 1. MOCKS DOS COMPONENTES FILHOS
// ===================================================================

// Variáveis para capturar as props
let capturedGroupProps: any = {};
let capturedItemProps: any[] = [];

// Mock dos componentes de UI
vi.mock("@/components/ui/radio-group", () => ({
  RadioGroup: (props: any) => {
    capturedGroupProps = props;
    return (
      <div
        data-testid="mock-radio-group"
        data-orientation={props.orientation}
        className={props.className}
        onClick={() => props.onValueChange && props.onValueChange("mock-value")}
      >
        {props.children}
      </div>
    );
  },
  RadioGroupItem: (props: any) => {
    capturedItemProps.push(props);
    return <input type="radio" data-testid="mock-radio-item" {...props} />;
  },
}));


describe("Radio component", () => {
  const mockOnValueChange = vi.fn();
  const mockOptions = [
    { id: "opt1", value: "A", text: "Option A" },
    { id: "opt2", value: "B", text: "Option B" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    capturedGroupProps = {};
    capturedItemProps = [];
  });

  // Teste 1
  test("should render all radio options correctly", () => {
    // Arrange
    render(<Radio options={mockOptions} value="A" />);

    // Act
    const radios = screen.getAllByTestId("mock-radio-item");
    const labels = screen.getAllByText(/Option/);

    // Assert
    expect(radios).toHaveLength(2);
    expect(labels[0]).toHaveTextContent("Option A");
    expect(labels[1]).toHaveTextContent("Option B");
    expect(capturedItemProps[0].value).toBe("A");
    expect(capturedItemProps[1].value).toBe("B");
  });

  // Teste 2
  test("should call onValueChange when a value is selected", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Radio options={mockOptions} value="A" onValueChange={mockOnValueChange} />
    );

    const group = screen.getByTestId("mock-radio-group");

    // Act
    await user.click(group);

    // Assert
    expect(mockOnValueChange).toHaveBeenCalledWith("mock-value");
  });

  // Teste 3
  test("should apply horizontal orientation by default", () => {
    // Arrange
    render(<Radio options={mockOptions} value="A" />);

    // Act
    const group = screen.getByTestId("mock-radio-group");

    // Assert
    expect(capturedGroupProps.orientation).toBe("horizontal");
    expect(group).toHaveClass("flex gap-4");
  });

  // Teste 4
  test("should apply vertical orientation when specified", () => {
    // Arrange
    render(<Radio options={mockOptions} value="A" orientation="vertical" />);

    // Act
    const group = screen.getByTestId("mock-radio-group");

    // Assert
    expect(capturedGroupProps.orientation).toBe("vertical");
    expect(group).toHaveClass("flex flex-col");
  });

  // Teste 5
  test("should pass correct props to RadioGroup", () => {
    // Arrange
    render(
      <Radio
        options={mockOptions}
        value="B"
        onValueChange={mockOnValueChange}
      />
    );

    // Assert
    expect(capturedGroupProps.value).toBe("B");
    expect(typeof capturedGroupProps.onValueChange).toBe("function");
  });
});
