"use client";

import { Timestamp } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 } from "uuid";

import Button from "@atoms/Button/button";
import InputField from "@molecules/InputField/inputField";
import RegisterVehiclesCollaborators from "@organisms/RegisterVehiclesCollaborators/registerVehiclesCollaborators";
import { createUserDoc, updateUserDoc } from "@/store/services/user";
import registerCollaboratorFormSchema from "@/validations/registerCollaborator";
import { successToast } from "@/hooks/useAppToast";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";

type registerCollaborator = z.infer<typeof registerCollaboratorFormSchema>;

const CadastrarVeiculoPage = () => {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const isEdit = useSearchParams().get("isEdit");
  const id = useSearchParams().get("id");
  const router = useRouter();
  const { data } = useProfile(id as string);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<registerCollaborator>({
    mode: "all",
    criteriaMode: "all",
    resolver: zodResolver(registerCollaboratorFormSchema),
    values: isEdit
      ? {
          name: data?.name || "",
          cpf: data?.cpf || ""
        }
      : {
          name: "",
          cpf: ""
        }
  });

  const queryClient = useQueryClient();
  const mutation = useMutation(
    async (data: registerCollaborator) => {
      return await createUserDoc({
        ...data,
        id: v4(),
        color: null,
        createdAt: Timestamp.now(),
        facilitatorName: null,
        fullAddress: null,
        latitude: null,
        longitude: null,
        emission: null,
        consume: null,
        role: "employee",
        supportEmail: null,
        cityId: user?.id as string,
        updatedAt: Timestamp.now(),
        email: null,
        carPlate: null,
        image: null,
        calcData: {
          initialDate: Timestamp.now(),
          landfillDelivery: null,
          fuel: null
        }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["collaborators"]);
        successToast("Colaborador cadastrado com sucesso!");
        reset();
      }
    }
  );

  const mutationUpdate = useMutation(
    async (data: registerCollaborator) => {
      return await updateUserDoc(id as string, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["collaborators"]);
        queryClient.invalidateQueries(["profile", id]);
        successToast("Colaborador atualizado com sucesso!");
        router.push("/veiculos-colaboradores");
      }
    }
  );

  const handleSubmitForm = async (data: registerCollaborator) => {
    if (isEdit) {
      await mutationUpdate.mutateAsync(data);
      return;
    }
    await mutation.mutateAsync(data);
  };

  return (
    <div>
      <RegisterVehiclesCollaborators
        type="collaborator"
        isEdit={isEdit === "true"}
      >
        <form
          className="flex flex-col justify-center gap-4"
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          <InputField
            label="Nome do colaborador"
            placeholder="Digite o nome do colaborador"
            name="name"
            formErrors={errors}
            formRegister={register}
          />
          <InputField
            label="Documento de identificação"
            placeholder="Digite o CPF do colaborador"
            name="cpf"
            formErrors={errors}
            formRegister={register}
            mask="999.999.999-99"
          />
          <Button
            buttonType="submit"
            className="mt-4 self-center"
            loading={isSubmitting}
          >
            {isEdit ? "Editar" : "Cadastrar"}
          </Button>
        </form>
      </RegisterVehiclesCollaborators>
    </div>
  );
};

export default CadastrarVeiculoPage;
