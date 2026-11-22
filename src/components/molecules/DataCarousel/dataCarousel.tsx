import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

import DataCard from "../DataCard/dataCard";
import { DataCarouselProps } from "./types";
import { twMerge } from "tailwind-merge";

const DataCarousel = ({
  cardsInfo,
  className,
  itemClassName
}: DataCarouselProps) => {
  return (
    <Carousel className={twMerge("w-full px-0 sm:px-12 lg:w-[75%]", className)}>
      <CarouselContent>
        {cardsInfo.map((card, index) => {
          return (
            <CarouselItem
              key={index}
              className={twMerge(
                "basis-full sm:basis-1/2 lg:basis-1/3",
                itemClassName
              )}
            >
              <DataCard title={card.title} data={card.data} />
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:inline-flex" />
      <CarouselNext className="hidden sm:inline-flex" />
    </Carousel>
  );
};

export default DataCarousel;
