import { InfoCardProps } from "./types";

const InfoCard = ({ infos }: InfoCardProps) => {
  return (
    <div className="rounded-lg border border-greenBlue-1000">
      {infos.map((info, index) => {
        return (
          <div
            key={index}
            className="grid w-full grid-cols-1 items-center gap-1 border-b border-greenBlue-1000 p-4 last:border-b-0 sm:max-w-[425px] sm:grid-cols-2 sm:gap-6 lg:gap-20"
          >
            <span className="text-base font-medium text-greenBlue-1000 sm:text-xl">
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
