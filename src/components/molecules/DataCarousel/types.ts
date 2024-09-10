export interface DataCarouselProps {
  cardsInfo: {
    title: string;
    data: number | null;
  }[];
  className?: string;
  itemClassName?: string;
}
