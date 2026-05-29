"use client";

import { Timestamp } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 } from "uuid";
import { useState } from "react";

import Button from "@atoms/Button/button";
import InputField from "@molecules/InputField/inputField";
import RegisterVehiclesCollaborators from "@organisms/RegisterVehiclesCollaborators/registerVehiclesCollaborators";
import ImageUploadInput from "@molecules/ImageUploadInput/imageUploadInput";
import { createUser, updateUserDoc, updateUser } from "@/store/services/user"; // Importado updateUser também
import registerCollaboratorFormSchema from "@/validations/registerCollaborator";
import { successToast, errorToast } from "@/hooks/useAppToast";
import useProfile from "@/hooks/queries/useProfile";
import useAuth from "@/hooks/useAuth";

type registerCollaborator = z.infer<typeof registerCollaboratorFormSchema>;

const CadastrarVeiculoPage = () => {
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);
  const isEdit = useSearchParams().get("isEdit");
  const id = useSearchParams().get("id");
  const router = useRouter();
  const { data: collaboratorData } = useProfile(id as string);

  const [imageFile, setImageFile] = useState<File | null>(null);

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
          name: collaboratorData?.name || "",
          cpf: collaboratorData?.cpf || ""
        }
      : {
          name: "",
          cpf: ""
        }
  });

  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (formData: registerCollaborator) => {
      // Se for edição, usamos o id existente, se não, um v4()
      const currentId = isEdit ? (id as string) : v4();

      const payload: any = {
        ...formData,
        id: currentId,
        role: "employee",
        cityId: user?.id as string,
        updatedAt: Timestamp.now()
      };

      if (!isEdit) {
        // Campos obrigatórios apenas para novos usuários
        payload.color = null;
        payload.createdAt = Timestamp.now();
        payload.facilitatorName = null;
        payload.fullAddress = null;
        payload.latitude = null;
        payload.longitude = null;
        payload.emission = null;
        payload.consume = null;
        payload.supportEmail = null;
        payload.email = null;
        payload.carPlate = null;
        payload.calcData = {
          initialDate: Timestamp.now(),
          landfillDelivery: null,
          fuel: null
        };
      }

      // 1. Se tem imagem nova, usamos o serviço 'createUser' porque ele já faz o
      // Upload no Storage + vinculação no Banco automaticamente.
      if (imageFile) {
        return await createUser(payload, imageFile);
      }

      // 2. Se não tem imagem nova e é edição, usamos o update comum
      if (isEdit) {
        return await updateUserDoc(currentId, payload);
      }

      // 3. Se é novo cadastro sem imagem
      return await createUser(payload, null as any);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["collaborators"]);
        if (isEdit) queryClient.invalidateQueries(["profile", id]);

        successToast(
          isEdit ? "Colaborador atualizado!" : "Colaborador cadastrado!"
        );
        router.push("/veiculos-colaboradores");
        reset();
      },
      onError: (error: any) => {
        console.error("Erro na mutation:", error);
        errorToast("Erro ao processar a operação.");
      }
    }
  );

  const handleSubmitForm = async (formData: registerCollaborator) => {
    await mutation.mutateAsync(formData);
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
          <div className="flex w-full flex-row items-start justify-between gap-24">
            <div className="flex shrink-0 flex-col items-center">
              <ImageUploadInput
                defaultImage={collaboratorData?.image}
                onImageCropped={(blob) => {
                  // Criamos o arquivo File com um nome único
                  const file = new File([blob], `profile_${Date.now()}.jpg`, {
                    type: "image/jpeg"
                  });
                  setImageFile(file);
                }}
              />
              <p className="mt-2 text-center text-xs font-medium text-gray-500">
                Foto de Perfil
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-4">
              <div className="w-3/5">
                <InputField
                  label="Nome do colaborador"
                  placeholder="Digite o nome do colaborador"
                  name="name"
                  formErrors={errors}
                  formRegister={register}
                />
              </div>

              <div className="w-3/5">
                <InputField
                  label="Documento de identificação"
                  name="cpf"
                  placeholder="Digite o CPF do colaborador"
                  formErrors={errors}
                  formRegister={register}
                  mask="999.999.999-99"
                />
              </div>

              <Button
                buttonType="submit"
                className="mt-4 self-start px-12"
                loading={isSubmitting}
              >
                {isEdit ? "Editar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </form>
      </RegisterVehiclesCollaborators>
    </div>
  );
};

export default CadastrarVeiculoPage;
