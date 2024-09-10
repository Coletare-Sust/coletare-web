"use client";

import Image from "next/image";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import useAuth from "@hooks/useAuth";
import Button from "@atoms/Button/button";
import SignInFormSchema from "@/validations/signIn";
import Title from "@atoms/Title/title";
import InputField from "@molecules/InputField/inputField";
import { errorToast } from "@/hooks/useAppToast";

type SignInForm = z.infer<typeof SignInFormSchema>;

export default function LoginPage() {
  const { loginWithInternalService, loading, redefinePassword } = useAuth();

  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch
  } = useForm<SignInForm>({
    mode: "all",
    criteriaMode: "all",
    resolver: zodResolver(SignInFormSchema)
  });

  const email = watch().email;

  const handleSubmitForm = async (data: SignInForm) => {
    const { error } = await loginWithInternalService(data.email, data.password);
    if (!error) {
      router.push("/dashboard");
    }
  };

  return (
    <main className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center">
        <Image
          src={"/coletare-logo.jpeg"}
          width={225}
          height={225}
          alt="Logo da Coletare"
        />
        <form
          className="flex w-[400px] flex-col items-center gap-10 rounded-lg  bg-white-800 py-10"
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          <Title className="text-[28px]">Bem vindo!</Title>
          <div className="flex w-[300px] flex-col items-center gap-4">
            <InputField
              label="Email"
              placeholder="Insira seu email"
              name="email"
              formErrors={errors}
              formRegister={register}
              className="w-[300px]"
            />
            <InputField
              label="Senha"
              placeholder="Insira sua senha"
              name="password"
              type="password"
              formErrors={errors}
              formRegister={register}
              className="w-[300px]"
            />

            <button
              type="button"
              onClick={() => {
                if (email) {
                  redefinePassword(email);
                } else {
                  errorToast("Preecha o campo de email.");
                }
              }}
              className="-mb-2 -mt-2 self-end text-xs hover:underline"
            >
              Redefinir senha?
            </button>
          </div>
          <Button loading={loading.loginWithInternalService}>Entrar</Button>
        </form>
      </div>
    </main>
  );
}
