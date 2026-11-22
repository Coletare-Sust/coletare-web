import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import MoreDropdown from "@atoms/MoreDropdown/moreDropdown";
import ConfirmationModal from "@molecules/ConfirmationModal/confirmationModal";
import { errorToast, successToast } from "@/hooks/useAppToast";
import useAuth from "@/hooks/useAuth";

import { InfoCardProps } from "./types";

const InfoCard = ({ title, values, id, type }: InfoCardProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { deleteUserAuth } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const mutationDelete = useMutation(
    async () => {
      await deleteUserAuth(id);
    },
    {
      onSuccess: () => {
        if (type === "collaborator") {
          queryClient.invalidateQueries(["collaborators"]);
        } else if (type === "vehicle") {
          queryClient.invalidateQueries(["vehicles"]);
        }
        setIsDeleteModalOpen(false);
        successToast("Usuário deletado com sucesso");
      },
      onError: (err: Error) => {
        errorToast(err?.message || "Não foi possível excluir o usuário.");
      }
    }
  );

  const handleDelete = async () => {
    // O erro já é exibido em onError.
    await mutationDelete.mutateAsync().catch(() => undefined);
  };

  return (
    <div className="relative flex w-full flex-col gap-4 rounded-lg border border-greenBlue-600 p-4 pr-14 lg:flex-row lg:items-center lg:gap-10 lg:pr-4">
      <p className="text-lg font-medium text-greenBlue-1000 lg:mr-10 lg:w-44 lg:text-xl">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-4 lg:flex lg:w-2/3 lg:gap-10">
        {values.map((value, index) => {
          return (
            <div
              className="flex min-w-0 flex-1 flex-col gap-1 lg:gap-6"
              key={index}
            >
              <p className="font-medium text-greenDark-1000">{value.label}</p>
              <p className="text-sm text-greenDark-1000">{value.content}</p>
            </div>
          );
        })}
      </div>
      <div className="absolute right-4 top-4 cursor-pointer lg:top-1/2 lg:-translate-y-1/2">
        <MoreDropdown
          options={[
            {
              label: "Editar",
              onClick: () =>
                router.push(
                  `/cadastrar-${
                    type === "collaborator" ? "colaborador" : "veiculo"
                  }?isEdit=true&id=${id}`
                )
            },
            { label: "Excluir", onClick: () => setIsDeleteModalOpen(true) }
          ]}
        />
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title={`Tem certeza que deseja excluir esse ${
          type === "collaborator" ? "colaborador" : "veiculo"
        }?`}
        description="Essa ação não poderá ser desfeita."
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default InfoCard;
