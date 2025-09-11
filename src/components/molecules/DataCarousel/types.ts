export interface DataCarouselProps {
  cardsInfo: {
    title: string;
    description: string;
    image: string;
  }[];
  className?: string;
  itemClassName?: string;
}
