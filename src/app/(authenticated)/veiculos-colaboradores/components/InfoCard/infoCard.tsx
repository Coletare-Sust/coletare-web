import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import MoreDropdown from "@atoms/MoreDropdown/moreDropdown";
import ConfirmationModal from "@molecules/ConfirmationModal/confirmationModal";
import { successToast } from "@/hooks/useAppToast";
import useAuth from "@/hooks/useAuth";

import { InfoCardProps } from "./types";

const InfoCard = ({ title, values, id, type }: InfoCardProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { deleteUserAuth } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const mutationDelete = useMutation(
    async () => {
      console.log("id", id);
      return await deleteUserAuth(id);
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
      }
    }
  );

  const handleDelete = async () => {
    await mutationDelete.mutateAsync();
  };

  return (
    <div className="relative flex w-full items-center gap-10 rounded-lg border border-greenBlue-600 p-4">
      <p className="mr-10 w-44 text-xl font-medium text-greenBlue-1000">
        {title}
      </p>
      <div className=" flex w-2/3 gap-10">
        {values.map((value, index) => {
          return (
            <div className="flex flex-1 flex-col gap-6" key={index}>
              <p className="font-medium text-greenDark-1000">{value.label}</p>
              <p className="text-sm text-greenDark-1000">{value.content}</p>
            </div>
          );
        })}
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer">
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
