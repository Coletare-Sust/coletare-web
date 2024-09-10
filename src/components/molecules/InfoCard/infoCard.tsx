import { InfoCardProps } from "./types";

const InfoCard = ({ infos }: InfoCardProps) => {
  return (
    <div className="rounded-lg border border-greenBlue-1000">
      {infos.map((info, index) => {
        return (
          <div
            key={index}
            className="grid w-full max-w-[425px] grid-cols-2 items-center gap-20 border-b border-greenBlue-1000 p-4 last:border-b-0"
          >
            <span className="text-xl font-medium text-greenBlue-1000">
              {info.label}
            </span>
            <span className="line-clamp-4 text-greenDark-1000">
              {info.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default InfoCard;
