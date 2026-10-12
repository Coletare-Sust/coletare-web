"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import Button from "@atoms/Button/button";
import Title from "@atoms/Title/title";
import InputField from "@molecules/InputField/inputField";
import ResetPasswordSchema from "@/validations/resetPassword";
import { confirmPasswordReset } from "@/store/services/auth";
import { errorToast } from "@/hooks/useAppToast";

type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;

const linkClassName =
  "text-sm font-medium text-greenBlue-1000 underline hover:opacity-80";

function ResetPasswordContent() {
  const token = useSearchParams().get("token") ?? "";
  const [done, setDone] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordForm>({
    mode: "all",
    criteriaMode: "all",
    resolver: zodResolver(ResetPasswordSchema)
  });

  const handleSubmitForm = async (data: ResetPasswordForm) => {
    try {
      await confirmPasswordReset(token, data.password);
      setDone(true);
    } catch {
      errorToast(
        "Não foi possível definir a senha. O link pode ter expirado ou já ter sido usado."
      );
    }
  };

  let content: React.ReactNode;

  if (!token) {
    content = (
      <>
        <p className="w-[300px] text-center text-sm text-greenDark-800">
          Link inválido. Use o link enviado por e-mail ou solicite uma nova
          redefinição de senha na tela de login.
        </p>
        <Link href="/" className={linkClassName}>
          Ir para o login
        </Link>
      </>
    );
  } else if (done) {
    content = (
      <>
        <p className="w-[300px] text-center text-sm text-greenDark-800">
          Senha definida com sucesso. Agora você já pode entrar com a nova
          senha.
        </p>
        <Link href="/" className={linkClassName}>
          Ir para o login
        </Link>
      </>
    );
  } else {
    content = (
      <>
        <div className="flex w-[300px] flex-col items-center gap-4">
          <InputField
            label="Nova senha"
            placeholder="Mínimo de 8 caracteres"
            name="password"
            type="password"
            formErrors={errors}
            formRegister={register}
            className="w-[300px]"
          />
          <InputField
            label="Confirmar senha"
            placeholder="Repita a nova senha"
            name="confirmPassword"
            type="password"
            formErrors={errors}
            formRegister={register}
            className="w-[300px]"
          />
        </div>
        <Button loading={isSubmitting}>Salvar senha</Button>
        <Link href="/" className={linkClassName}>
          Voltar para o login
        </Link>
      </>
    );
  }

  return (
    <form
      className="flex w-[400px] flex-col items-center gap-10 rounded-lg bg-white-800 py-10"
      onSubmit={handleSubmit(handleSubmitForm)}
    >
      <Image
        src={"/coletare-logo.png"}
        width={225}
        height={225}
        alt="Logo da Coletare"
      />
      <Title className="text-[28px]">Definir senha</Title>
      {content}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <Suspense fallback={null}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
