import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import Input from "./input";

let capturedProps: any = {};

vi.mock("react-input-mask", () => ({
  default: (props: any) => {
    capturedProps = props;

    const {
      mask,
      alwaysShowMask,
      maskPlaceholder,
      step,
      formRegister,
      ...validInputProps
    } = props;

    return <input data-testid="mock-input" {...validInputProps} />;
  },
}));

describe("Input component", () => {
  const mockOnChange = vi.fn();
  const mockOnBlur = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    capturedProps = {};
  });

//Teste 1
  test("should render and pass basic props correctly", () => {
    // Arrange
    render(
      <Input
        placeholder="Enter text"
        name="test-input"
        value="123"
      />
    );

    // Act
    const inputElement = screen.getByTestId("mock-input");

    // Assert
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute("placeholder", "Enter text");
    expect(inputElement).toHaveValue("123");
  });

  // Teste 2
  test("should call onChange when user types", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Input name="test" onChange={mockOnChange} />);
    const inputElement = screen.getByTestId("mock-input");

    // Act
    await user.type(inputElement, "abc");

    // Assert
    expect(mockOnChange).toHaveBeenCalledTimes(3);
  });

  // Teste 3
  test("should call onBlur when user clicks away", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Input name="test" onBlur={mockOnBlur} />);
    const inputElement = screen.getByTestId("mock-input");

    // Act
    await user.click(inputElement);
    await user.tab(); // desfoca o input

    // Assert
    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  // Teste 4
  test("should be disabled when disabled prop is true", () => {
    // Arrange
    render(<Input name="test" disabled />);
    const inputElement = screen.getByTestId("mock-input");

    // Assert
    expect(inputElement).toBeDisabled();
    expect(capturedProps.disabled).toBe(true);
  });

  // Teste 5
  test("should apply default and custom classes correctly", () => {
    // Arrange
    render(<Input name="test" className="my-custom-class" />);

    // Assert
    expect(capturedProps.className).toContain("border-greenDark-400");
    expect(capturedProps.className).toContain("my-custom-class");
  });
});
