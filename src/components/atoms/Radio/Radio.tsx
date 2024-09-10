import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RadioProps } from "./types";

const Radio = ({
  orientation = "horizontal",
  onValueChange,
  value,
  options
}: RadioProps) => {
  return (
    <RadioGroup
      orientation={orientation}
      value={value}
      onValueChange={onValueChange}
      className={orientation === "horizontal" ? "flex gap-4" : "flex flex-col"}
    >
      {options.map((option, index) => {
        return (
          <div className="flex items-center space-x-2" key={index}>
            <RadioGroupItem value={option.value} id={option.id} />
            <p>{option.text}</p>
          </div>
        );
      })}
    </RadioGroup>
  );
};

export default Radio;
