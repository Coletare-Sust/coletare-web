import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import DatePicker from "./datePicker";

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: any) => (
    <button onClick={() => onSelect(new Date("2025-10-30"))}>Select Date</button>
  )
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>
}));

describe("DatePicker Component", () => {
  // Teste 1
  test("renders placeholder text when date is null", () => {
    const setDate = vi.fn();
    render(<DatePicker date={null} setDate={setDate} />);
    expect(screen.getByText("Selecione uma data")).toBeInTheDocument();
  });

  // Teste 2
  test("renders formatted date when date is provided", () => {
    const testDate = new Date("2025-10-30T12:00:00"); // horário no meio do dia
    render(<DatePicker date={testDate} setDate={vi.fn()} />);
    const formattedDate = testDate.toLocaleDateString("pt-BR"); // "30/10/2025"
    const button = screen.getByText((content) =>
      content.includes(formattedDate)
  );
    expect(button).toBeInTheDocument();
  });


  // Teste 3
  test("calls setDate when a new date is selected", () => {
    const setDate = vi.fn();
    render(<DatePicker date={null} setDate={setDate} />);
    fireEvent.click(screen.getByText("Select Date"));
    expect(setDate).toHaveBeenCalledWith(new Date("2025-10-30"));
  });

  // Teste 4
  test("disables button when disabled prop is true", () => {
    const setDate = vi.fn();
    render(<DatePicker date={null} setDate={setDate} disabled />);
    const button = screen.getByText("Selecione uma data").closest("button");
    expect(button).toBeDisabled();
  });

});
