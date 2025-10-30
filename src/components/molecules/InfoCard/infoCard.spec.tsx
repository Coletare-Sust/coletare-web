import React from "react";
import { render, screen } from "@testing-library/react";
import InfoCard from "./infoCard";

describe("InfoCard Component", () => {
  test("renders all info labels and values", () => {
    const mockInfos = [
      { label: "Nome", value: "Ricardo" },
      { label: "Cidade", value: "João Pessoa" },
    ];

    render(<InfoCard infos={mockInfos} />);

    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Ricardo")).toBeInTheDocument();
    expect(screen.getByText("Cidade")).toBeInTheDocument();
    expect(screen.getByText("João Pessoa")).toBeInTheDocument();
  });
  
  test("renders nothing when infos is empty", () => {
    render(<InfoCard infos={[]} />);
    expect(screen.queryByText(/.+/)).toBeNull();
  });

});
