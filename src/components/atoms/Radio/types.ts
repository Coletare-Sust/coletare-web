export interface RadioProps {
  orientation?: "horizontal" | "vertical";
  value: string;
  onValueChange: (value: string) => void;
  options: {
    value: string;
    id: string;
    text: string;
  }[];
}
