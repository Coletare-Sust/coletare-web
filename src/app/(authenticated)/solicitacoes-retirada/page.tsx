import { wrapper } from "@/common/constants/wrapper";

import MainSolicitation from "./components/MainSolicitation";
import AllSolicitations from "./components/AllSolicitations";

const SolicitacaoRetirada = () => {
  return (
    <section style={wrapper}>
      <MainSolicitation />
      <AllSolicitations />
    </section>
  );
};

export default SolicitacaoRetirada;
