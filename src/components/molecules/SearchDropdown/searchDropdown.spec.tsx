import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { SearchDropdown } from "./searchDropdown";

const options = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
];

describe("SearchDropdown", () => {
  // Teste 1
  test("renders placeholder when no value is selected", () => {
    const setValue = vi.fn();
    render(
      <SearchDropdown
        placeholder="Select an option"
        value=""
        setValue={setValue}
        options={options}
      />
    );

    expect(screen.getByText("Select an option")).toBeInTheDocument();
  });
  
  // Teste 2
  test("renders selected value label", () => {
    const setValue = vi.fn();
    render(
      <SearchDropdown
        placeholder="Select an option"
        value="2"
        setValue={setValue}
        options={options}
      />
    );

    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  // Teste 3
  test("opens dropdown and selects an option", () => {
    const setValue = vi.fn();
    render(
      <SearchDropdown
        placeholder="Select an option"
        value=""
        setValue={setValue}
        options={options}
      />
    );

    const button = screen.getByRole("combobox");
    fireEvent.click(button);
    const option = screen.getByText("Option 1");
    fireEvent.click(option);

    expect(setValue).toHaveBeenCalledWith("1");
  });

});
