import { DataCardProps } from "./types";

const DataCard = ({ data, title }: DataCardProps) => {
  return (
    <div className="flex h-full w-full max-w-[254px] flex-col items-center justify-center gap-4 rounded-lg bg-[#FFFEFF] px-4 py-6">
      <h3 className="text-sm font-medium text-greenBlue-1000">{title}</h3>
      <div className="text-center">
        {data ? (
          <p className="text-3xl font-bold text-greenAqua-1000">{data}</p>
        ) : (
          <p className="text-sm font-light italic text-greenDark-800">
            Esses dados ainda não foram computados!
          </p>
        )}
      </div>
    </div>
  );
};

export default DataCard;
