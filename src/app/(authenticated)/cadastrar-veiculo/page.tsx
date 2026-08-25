"use client";

import { Timestamp } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import RegisterVehicleFormSchema from "@/validations/registerVehicle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 } from "uuid";

import Button from "@atoms/Button/button";
import InputField from "@molecules/InputField/inputField";
import RegisterVehiclesCollaborators from "@organisms/RegisterVehiclesCollaborators/registerVehiclesCollaborators";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import { successToast, errorToast } from "@/hooks/useAppToast";
import { updateUserDoc } from "@/store/services/user";
import { registerVehicle } from "@/store/services/auth";
import EditVehicleFormSchema from "@/validations/editVehicle";

type RegisterVehicleForm = z.infer<typeof RegisterVehicleFormSchema>;
type EditVehicleForm = z.infer<typeof EditVehicleFormSchema>;

const CadastrarVeiculoPage = () => {
  const { userUid, createUserWithInternalService } = useAuth();
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
  } = useForm<RegisterVehicleForm>({
    mode: "all",
    criteriaMode: "all",
    resolver: zodResolver(RegisterVehicleFormSchema)
  });

  const {
    handleSubmit: handleSubmitEdit,
    register: registerEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit }
  } = useForm<EditVehicleForm>({
    mode: "all",
    criteriaMode: "all",
    resolver: zodResolver(EditVehicleFormSchema),
    values: isEdit
      ? {
          name: data?.name || "",
          carPlate: data?.carPlate || "",
          emission: data?.emission || "",
          consume: data?.consume || ""
        }
      : {
          name: "",
          carPlate: "",
          emission: "",
          consume: ""
        }
  });

  const formRegister = isEdit ? registerEdit : register;
  const formErrors = isEdit ? errorsEdit : errors;
  const formIsSubmitting = isEdit ? isSubmittingEdit : isSubmitting;

  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (formData: RegisterVehicleForm) => {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        cityId: user?.id as string,
        carPlate: formData.carPlate,
        consume: parseFloat(formData.consume),
        emission: parseFloat(formData.emission)
      };
      return await registerVehicle(payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["vehicles"]);
        successToast("Veículo cadastrado com sucesso!");
        reset();
        router.push("/veiculos");
      },
      onError: (err: any) => {
        errorToast("Erro ao cadastrar veículo.");
      }
    }
  );

  const mutationUpdate = useMutation(
    async (data: EditVehicleForm) => {
      return await updateUserDoc(id as string, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["vehicles"]);
        queryClient.invalidateQueries(["profile", id]);
        successToast("Veículo atualizado com sucesso!");
        router.push("/veiculos-colaboradores");
      }
    }
  );

  const handleSubmitForm = async (data: RegisterVehicleForm) => {
    await mutation.mutateAsync(data);
  };

  const handleSubmitFormEdit = async (data: EditVehicleForm) => {
    await mutationUpdate.mutateAsync(data);
  };

  return (
    <div>
      <RegisterVehiclesCollaborators type="vehicle" isEdit={isEdit === "true"}>
        <form
          className="flex flex-col justify-center gap-4"
          onSubmit={
            isEdit
              ? handleSubmitEdit(handleSubmitFormEdit)
              : handleSubmit(handleSubmitForm)
          }
        >
          <InputField
            label="Nome do veículo"
            placeholder="Digite o nome do veículo"
            name="name"
            formRegister={formRegister}
            formErrors={formErrors}
          />
          <InputField
            label="Placa"
            placeholder="Digite a placa"
            name="carPlate"
            formRegister={formRegister}
            formErrors={formErrors}
            mask="***-****"
          />
          <InputField
            label="Emissão (kgCO2eq/L)"
            placeholder="Digite a emissão"
            name="emission"
            formRegister={formRegister}
            formErrors={formErrors}
          />
          <InputField
            label="Consumo (L/km)"
            placeholder="Digite o consumo"
            name="consume"
            formRegister={formRegister}
            formErrors={formErrors}
          />
          {!isEdit && (
            <>
              <InputField
                label="Criar login"
                placeholder="Digite o email"
                name="email"
                formRegister={formRegister}
                formErrors={formErrors}
              />
              <InputField
                label="Senha"
                placeholder="Digite a senha"
                name="password"
                formRegister={formRegister}
                formErrors={formErrors}
                type="password"
              />
              <InputField
                label="Confirmar senha"
                placeholder="Digite a senha novamente"
                name="confirmPassword"
                formRegister={formRegister}
                formErrors={formErrors}
                type="password"
              />
            </>
          )}
          <Button
            buttonType="submit"
            className="mt-4 self-center"
            loading={formIsSubmitting}
          >
            {isEdit ? "Editar" : "Cadastrar"}
          </Button>
        </form>
      </RegisterVehiclesCollaborators>
    </div>
  );
};

export default CadastrarVeiculoPage;
