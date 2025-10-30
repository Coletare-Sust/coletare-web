import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi, beforeEach } from "vitest";
import RadioDropdown from "./radioDropdown";

// ===================================================================
// 1. MOCKS DOS COMPONENTES FILHOS
// ===================================================================

// Variáveis para capturar props
let capturedDropdownProps: any = {};
let capturedRadioProps: any = {};

// Mock dos componentes do dropdown
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: (props: any) => {
    capturedDropdownProps = props;
    return (
      <div
        data-testid="mock-dropdown"
        data-open={props.open}
        onClick={() => props.onOpenChange && props.onOpenChange(!props.open)}
      >
        {props.children}
      </div>
    );
  },
  DropdownMenuTrigger: (props: any) => (
    <button data-testid="mock-trigger" className={props.className} {...props}>
      {props.children}
    </button>
  ),
  DropdownMenuContent: (props: any) => (
    <div data-testid="mock-content">{props.children}</div>
  ),
  DropdownMenuItem: (props: any) => (
    <div data-testid="mock-item">{props.children}</div>
  ),
}));

// Mock do componente Radio
vi.mock("../Radio/Radio", () => ({
  __esModule: true,
  default: (props: any) => {
    capturedRadioProps = props;
    return (
      <div data-testid="mock-radio">
        {props.options.map((opt: any) => (
          <p key={opt.id}>{opt.text}</p>
        ))}
      </div>
    );
  },
}));

// ===================================================================
// 2. TESTES
// ===================================================================

describe("RadioDropdown component", () => {
  const mockSetActive = vi.fn();
  const mockOnOpenChange = vi.fn();
  const mockOptions = ["Option A", "Option B", "Option C"];

  beforeEach(() => {
    vi.clearAllMocks();
    capturedDropdownProps = {};
    capturedRadioProps = {};
  });

  // Teste 1
  test("should render correctly with default props", () => {
    render(
      <RadioDropdown
        options={mockOptions}
        active="option a"
        setActive={mockSetActive}
      >
        <span>Trigger content</span>
      </RadioDropdown>
    );

    expect(screen.getByTestId("mock-dropdown")).toBeInTheDocument();
    expect(screen.getByTestId("mock-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("mock-content")).toBeInTheDocument();
    expect(screen.getByTestId("mock-item")).toBeInTheDocument();
    expect(screen.getByTestId("mock-radio")).toBeInTheDocument();
  });

  // Teste 2
  test("should call onOpenChange when trigger is clicked", async () => {
    const user = userEvent.setup();

    render(
      <RadioDropdown
        options={mockOptions}
        open={false}
        onOpenChange={mockOnOpenChange}
        active="option a"
        setActive={mockSetActive}
      >
        <span>Trigger</span>
      </RadioDropdown>
    );

    const dropdown = screen.getByTestId("mock-dropdown");
    await user.click(dropdown);

    expect(mockOnOpenChange).toHaveBeenCalledWith(true);
  });

  // Teste 3
  test("should pass correct props to Radio component", () => {
    render(
      <RadioDropdown
        options={mockOptions}
        active="option b"
        setActive={mockSetActive}
      >
        <span>Child</span>
      </RadioDropdown>
    );

    expect(capturedRadioProps.orientation).toBe("vertical");
    expect(capturedRadioProps.value).toBe("option b");
    expect(typeof capturedRadioProps.onValueChange).toBe("function");

    // Confirma que o mapeamento das opções está correto
    expect(capturedRadioProps.options).toEqual([
      { id: "0", text: "Option A", value: "option a" },
      { id: "1", text: "Option B", value: "option b" },
      { id: "2", text: "Option C", value: "option c" },
    ]);
  });

  // Teste 4
  test("should apply disabled styles when disabled is true", () => {
    render(
      <RadioDropdown
        options={mockOptions}
        disabled
        active="option a"
        setActive={mockSetActive}
      >
        <span>Trigger</span>
      </RadioDropdown>
    );

    const trigger = screen.getByTestId("mock-trigger");
    expect(trigger.className).toContain("cursor-not-allowed");
    expect(trigger.className).toContain("opacity-60");
  });

  // Teste 5
  test("should apply custom className when provided", () => {
    render(
      <RadioDropdown
        options={mockOptions}
        active="option a"
        setActive={mockSetActive}
        className="custom-class"
      >
        <span>Trigger</span>
      </RadioDropdown>
    );

    const trigger = screen.getByTestId("mock-trigger");
    expect(trigger.className).toContain("custom-class");
  });
});
