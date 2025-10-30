import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DataCarousel from "./dataCarousel";

vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: any) => <div data-testid="carousel">{children}</div>,
  CarouselContent: ({ children }: any) => <div>{children}</div>,
  CarouselItem: ({ children }: any) => <div>{children}</div>,
  CarouselNext: () => <button>Next</button>,
  CarouselPrevious: () => <button>Previous</button>
}));

describe("DataCarousel Component", () => {
  const cardsInfo = [
    { title: "Card 1", data: 10 },
    { title: "Card 2", data: 20 },
    { title: "Card 3", data: null }
  ];

  // Teste 1
  test("renders all cards with correct data", () => {
    render(<DataCarousel cardsInfo={cardsInfo} />);

    cardsInfo.forEach((card) => {
      expect(screen.getByText(card.title)).toBeInTheDocument();
    });

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(
      screen.getByText("Esses dados ainda não foram computados!")
    ).toBeInTheDocument();
  });

  // Teste 2
  test("renders navigation buttons", () => {
    render(<DataCarousel cardsInfo={cardsInfo} />);
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
  });
});
