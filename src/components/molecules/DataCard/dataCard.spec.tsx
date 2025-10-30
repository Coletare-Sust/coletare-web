import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DataCard from "./dataCard";

describe("DataCard Component", () => {
  const defaultProps = {
    title: "Título do Card",
    data: 42
  };

  // Teste 1
  test("renders title and data when data is provided", () => {
    render(<DataCard {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.data.toString())).toBeInTheDocument();
  });

  // Teste 2
  test("renders placeholder text when data is not provided", () => {
    render(<DataCard title="Outro Card" data={null} />);

    expect(screen.getByText("Outro Card")).toBeInTheDocument();
    expect(
      screen.getByText("Esses dados ainda não foram computados!")
    ).toBeInTheDocument();
  });
});
