import React, { Fragment } from "react";
import BackgroundWrapper from "@atoms/BackgroudWrapper/backgroundWrapper";

import { InfoTableProps } from "./types";
import InfoRow from "./InfoRow/infoRow";

const InfoTable = ({ data }: InfoTableProps) => {
  const sortedData =
    data &&
    [...data].sort((a, b) => {
      if (a.isResolved && !b.isResolved) {
        return 1;
      } else if (!a.isResolved && b.isResolved) {
        return -1;
      } else {
        return 0;
      }
    });
  return (
    <BackgroundWrapper className="space-y-3 bg-white-800 px-3 py-4 sm:px-8 sm:py-6 lg:space-y-2">
      {!sortedData || sortedData?.length === 0 ? (
        <p className="text-center"> Sem resultados! </p>
      ) : (
        sortedData?.map((item, key) => (
          <Fragment key={key}>
            <InfoRow data={item} />
          </Fragment>
        ))
      )}
    </BackgroundWrapper>
  );
};

export default InfoTable;
