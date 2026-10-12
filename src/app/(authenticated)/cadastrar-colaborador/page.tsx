"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import Button from "@atoms/Button/button";
import InputField from "@molecules/InputField/inputField";
import RegisterVehiclesCollaborators from "@organisms/RegisterVehiclesCollaborators/registerVehiclesCollaborators";
import ImageUploadInput from "@molecules/ImageUploadInput/imageUploadInput";
import { createUser, updateUserDoc } from "@/store/services/user";
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
      if (isEdit) {
        // Edição: atualiza name e cpf via PUT /user/{id}
        return await updateUserDoc(id as string, {
          name: formData.name,
          cpf: formData.cpf
        });
      }

      // Cadastro novo: cria colaborador via POST /auth/register/employee
      return await createUser(
        {
          name: formData.name,
          cpf: formData.cpf,
          role: "employee",
          cityId: user?.id as string,
          email: null,
          image: null,
          supportEmail: null,
          facilitatorName: null,
          color: null,
          consume: null,
          emission: null,
          carPlate: null,
          fullAddress: null,
          latitude: null,
          longitude: null,
          calcData: {
            fuel: null,
            landfillDelivery: null,
            initialDate: null as any
          },
          createdAt: null as any,
          updatedAt: null as any
        },
        imageFile
      );
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
        errorToast(error?.message || "Erro ao processar a operação.");
      }
    }
  );

  const handleSubmitForm = async (formData: registerCollaborator) => {
    // O erro já é exibido em onError.
    await mutation.mutateAsync(formData).catch(() => undefined);
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
