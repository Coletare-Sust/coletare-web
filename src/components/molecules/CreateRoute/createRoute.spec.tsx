import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreateRoute from "./createRoute";

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({ userUid: "mock-user" })
}));

vi.mock("@/hooks/queries/useProfile", () => ({
  default: () => ({ data: { id: "mock-profile" } })
}));

vi.mock("@/hooks/queries/useAllWithdrawalsRequests", () => ({
  default: () => ({ data: [] })
}));

vi.mock("@/hooks/queries/useRoute", () => ({
  default: () => ({ data: null, isLoading: false })
}));

vi.mock("@/store/services/route", () => ({
  createRoute: vi.fn(),
  updateRouteDoc: vi.fn()
}));

vi.mock("@/hooks/useAppToast", () => ({
  errorToast: vi.fn(),
  successToast: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    back: vi.fn()
  })
}));

vi.mock("@atoms/Title/title", () => ({
  default: ({ children }: any) => <div>{children}</div>
}));
vi.mock("@atoms/DayCheckbox/dayCheckbox", () => ({
  default: ({ name }: any) => <input data-testid={`day-${name}`} type="checkbox" />
}));
vi.mock("@atoms/Radio/Radio", () => ({
  default: ({ options, value, onValueChange }: any) => (
    <div>
      {options.map((opt: any) => (
        <button key={opt.id} onClick={() => onValueChange(opt.value)}>
          {opt.text}
        </button>
      ))}
      <span>{value}</span>
    </div>
  )
}));
vi.mock("@atoms/AdressInput/AdressInput", () => ({
  default: ({ value }: any) => <input data-testid="adress-input" value={value || ""} readOnly />
}));
vi.mock("@atoms/Button/button", () => ({
  default: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>
}));
vi.mock("@atoms/Dropdown/dropdown", () => ({
  default: ({ value }: any) => <div data-testid="dropdown">{value}</div>
}));
vi.mock("@atoms/FormError/formError", () => ({
  default: ({ children }: any) => <div>{children}</div>
}));
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />
}));
vi.mock("lucide-react", () => ({
  ListFilter: () => <div>FilterIcon</div>
}));

describe("CreateRoute Component", () => {
  const mockSetWaypoints = vi.fn();
  const mockSetInitialCenter = vi.fn();
  const mockSetCount = vi.fn();
  const mockSetAdresses = vi.fn();
  const mockHandleDeleteWaypoint = vi.fn();

  const defaultProps = {
    className: "",
    waypoints: [],
    setWaypoints: mockSetWaypoints,
    map: { panTo: vi.fn() },
    setInitialCenter: mockSetInitialCenter,
    count: 1,
    setCount: mockSetCount,
    adresses: [],
    handleDeleteWaypoint: mockHandleDeleteWaypoint,
    response: { routes: [{ overview_polyline: "mock-polyline" }] },
    isEdit: false,
    routeId: "",
    setAdresses: mockSetAdresses,
    isSpecial: false,
    activeSuggestions: [],
    setActiveSuggestions: vi.fn()
  };

  const renderWithQueryClient = (ui: React.ReactElement) => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Teste 1
  test("renders form fields and allows filling route name", () => {
    renderWithQueryClient(<CreateRoute {...defaultProps} />);
    
    const input = screen.getByPlaceholderText("Digite o nome para a rota");
    expect(input).toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: "Nova Rota" } });
    expect(input).toHaveValue("Nova Rota");
  });

  // Teste 2
  test("shows error if trying to create route without name", () => {
    renderWithQueryClient(<CreateRoute {...defaultProps} />);
    const button = screen.getByText("Finalizar");
    fireEvent.click(button);

    expect(screen.getByText("Nome da rota é obrigatório")).toBeInTheDocument();
  });
  
  // Teste 3
  test("renders radio buttons for period selection", () => {
    renderWithQueryClient(<CreateRoute {...defaultProps} />);
    expect(screen.getByText("Manhã")).toBeInTheDocument();
    expect(screen.getByText("Tarde")).toBeInTheDocument();
    expect(screen.getByText("Noite")).toBeInTheDocument();
  });

  // Teste 4
  test("renders address input", () => {
    renderWithQueryClient(<CreateRoute {...defaultProps} />);
    expect(screen.getByTestId("adress-input")).toBeInTheDocument();
  });

  // Teste 5
  test("renders dropdown for residue type", () => {
    renderWithQueryClient(<CreateRoute {...defaultProps} />);
    expect(screen.getByTestId("dropdown")).toHaveTextContent("Resíduo Comum");
  });
});
