import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import FilterBar from "./filterBar";

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  default: () => ({ userUid: "123" }),
}));

vi.mock("@/hooks/queries/useProfile", () => ({
  default: () => ({ data: { cityId: "city1" } }),
}));

vi.mock("@/hooks/queries/useAllCities", () => ({
  default: () => ({
    data: [
      { id: "city1", name: "Cidade 1" },
      { id: "city2", name: "Cidade 2" },
    ],
  }),
}));

vi.mock("@/hooks/queries/useAllRoutes", () => ({
  default: () => ({
    data: [
      { id: "route1", name: "Rota 1" },
      { id: "route2", name: "Rota 2" },
    ],
  }),
}));

vi.mock("@/hooks/queries/useAllCollectsByCity", () => ({
  default: () => ({
    data: [
      { id: "collect1", routeId: "route1", createdAt: Date.now(), mass: false },
    ],
  }),
}));

describe("FilterBar Component", () => {
  // Teste 1
  test("renders SearchDropdown button", () => {
    render(<FilterBar isAdmin={true} alwaysOpen={true} />);
    expect(screen.getByText("Pesquisar rota ...")).toBeInTheDocument();
  });

  // Teste 2
  test("renders DatePicker when route is selected", () => {
    render(<FilterBar isAdmin={true} alwaysOpen={true} />);
    expect(screen.getByText("Data")).toBeInTheDocument();
  });

});
