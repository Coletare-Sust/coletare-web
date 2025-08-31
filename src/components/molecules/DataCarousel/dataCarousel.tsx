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
    <Carousel className={twMerge("w-[75%]", className)}>
      <CarouselContent>
        {cardsInfo.map((card, index) => {
          return (
            <CarouselItem
              key={index}
              className={twMerge("basis-1/3", itemClassName)}
            >
              <DataCard
                title={card.title}
                description={card.description}
                image={card.image}
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default DataCarousel;
