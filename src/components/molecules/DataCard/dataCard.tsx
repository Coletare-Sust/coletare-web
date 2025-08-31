import { DataCardProps } from "./types";
import Image from "next/image";

const DataCard = ({ title, description, image }: DataCardProps) => {
  return (
    <div className="flex h-full w-full max-w-[254px] flex-col items-center justify-center gap-4 rounded-lg bg-[#FFFEFF] px-4 py-6">
      <h3 className="text-sm font-medium text-greenBlue-1000">{title}</h3>
      <div className="text-center">
        {description ? (
          <p className="text-3xl font-bold text-greenAqua-1000">
            {description}
          </p>
        ) : (
          <p className="text-sm font-light italic text-greenDark-800">
            Esses dados ainda não foram computados!
          </p>
        )}
        {/** eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          src={image}
          width={255}
          height={255}
          alt={`Imagem sobre: ${title}`}
        />
      </div>
    </div>
  );
};

export default DataCard;
