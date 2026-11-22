"use client";

import { useState } from "react";
import { z } from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import useAuth from "@hooks/useAuth";
import SignInFormSchema from "@/validations/signIn";
import LoadingComponent from "@atoms/Loading/loading";
import LoginRouteMap from "@organisms/LoginRouteMap";
import { errorToast } from "@/hooks/useAppToast";

type SignInForm = z.infer<typeof SignInFormSchema>;

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete: string;
  inputMode?: "email" | "text";
  error?: string;
  register: UseFormRegisterReturn;
  trailing?: React.ReactNode;
};

function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  error,
  register,
  trailing
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-medium text-[#FDFDF9]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-14 w-full rounded-2xl border-2 border-transparent bg-[#FDFDF9] px-4 text-base text-[#2F3D3B] outline-none transition-colors placeholder:text-[#7C8C8A] focus:border-[#C4E7E8] focus:ring-4 focus:ring-[#C4E7E8]/40 aria-[invalid=true]:border-[#FFB4A6]"
          {...register}
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-[#FFD9D2]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  const { loginWithInternalService, loading, redefinePassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-[#FDFDF9] lg:flex-row">
      {/* Área clara: logo, mensagem e a gota que cai na onda */}
      <section className="relative flex flex-col px-6 pt-8 lg:flex-1 lg:overflow-hidden lg:px-14 lg:pt-12 xl:px-20">
        <Image
          src="/coletare-logo.png"
          width={1200}
          height={320}
          priority
          alt="Coletapp"
          className="login-rise-lg relative z-10 h-auto w-52 lg:w-64"
        />

        <div className="relative z-10 mt-8 flex-1 pb-10 lg:mt-14 lg:flex-none lg:pb-0">
          <h1
            className="login-rise-lg max-w-[20ch] font-unbounded text-2xl font-semibold leading-[1.2] text-[#41524F] sm:text-3xl lg:max-w-[22ch] lg:text-4xl lg:leading-[1.15] xl:text-5xl"
            style={{ animationDelay: "0.15s" }}
          >
            Sistema inteligente de coleta de resíduos sólidos urbanos
          </h1>
          <p
            className="login-rise-lg mt-3 max-w-[30ch] text-base leading-relaxed text-[#41524F]/80 lg:mt-5 lg:max-w-[40ch] lg:text-lg"
            style={{ animationDelay: "0.3s" }}
          >
            Entre para acompanhar rotas, avisos e pedidos de retirada.
          </p>

          <span
            aria-hidden="true"
            className="login-drop absolute left-[80%] top-0 -z-10 h-5 w-5 -translate-x-1/2 rounded-full bg-[#14999D] lg:hidden"
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[48%] hidden lg:block"
        >
          <LoginRouteMap />
        </div>
      </section>

      {/* Onda (apenas mobile) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 64"
        preserveAspectRatio="none"
        className="relative z-10 -mb-px block h-16 w-full lg:hidden"
      >
        <path
          d="M0 20 C 80 44, 150 40, 210 22 S 330 -2, 400 18 V64 H0 Z"
          fill="#14999D"
        />
        <path
          d="M0 34 C 50 8, 120 8, 180 30 S 260 52, 320 36 S 380 14, 400 24 V64 H0 Z"
          fill="#0C6B70"
        />
        <ellipse
          className="login-ripple"
          cx="320"
          cy="36"
          rx="34"
          ry="5"
          fill="none"
          stroke="#C4E7E8"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          className="login-ripple login-ripple-late"
          cx="320"
          cy="36"
          rx="34"
          ry="5"
          fill="none"
          stroke="#C4E7E8"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Painel do formulário */}
      <section className="login-panel-in relative flex flex-1 flex-col justify-start bg-[#0C6B70] px-6 pb-10 pt-2 lg:min-w-[480px] lg:max-w-[640px] lg:flex-none lg:basis-[42%] lg:items-center lg:justify-center lg:px-16 lg:py-16">
        {/* borda ondulada (desktop) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 64 900"
          preserveAspectRatio="none"
          className="absolute inset-y-0 right-full hidden h-full w-16 lg:block"
        >
          <path
            d="M64 0 H38 C 6 130, 52 230, 24 360 S 2 580, 34 720 S 22 850, 30 900 H64 Z"
            fill="#14999D"
          />
          <path
            d="M64 0 H52 C 26 150, 58 250, 38 390 S 22 600, 46 740 S 40 860, 44 900 H64 Z"
            fill="#0C6B70"
          />
        </svg>

        {/* marca d'água: o balde da logo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
        >
          <svg
            viewBox="0 0 160 150"
            className="login-bin absolute -bottom-16 -right-20 w-[420px] rotate-[8deg]"
          >
            <path
              d="M14 8 H146 L124 142 H36 Z"
              fill="#FDFDF9"
              fillOpacity="0.07"
              stroke="#FDFDF9"
              strokeOpacity="0.07"
              strokeWidth="12"
              strokeLinejoin="round"
            />
            <path
              d="M80 30 V78 M62 62 L80 80 L98 62"
              fill="none"
              stroke="#0C6B70"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="80" cy="112" r="11" fill="#0C6B70" />
          </svg>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit(handleSubmitForm)}
          className="login-form-in relative mx-auto flex w-full max-w-md flex-col gap-5 lg:max-w-sm xl:max-w-md"
        >
          <h2 className="font-unbounded text-xl font-medium text-[#FDFDF9]">
            Entrar no painel
          </h2>

          <Field
            id="email"
            label="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="voce@prefeitura.gov.br"
            error={errors.email?.message && String(errors.email.message)}
            register={register("email")}
          />

          <Field
            id="password"
            label="Senha"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Digite sua senha"
            error={errors.password?.message && String(errors.password.message)}
            register={register("password")}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                className="absolute right-1 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-xl text-[#41524F] outline-none focus-visible:ring-4 focus-visible:ring-[#14999D]/50"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
          />

          <button
            type="button"
            onClick={() => {
              if (email) {
                redefinePassword(email);
              } else {
                errorToast("Preencha o campo de e-mail.");
              }
            }}
            className="hover:text-white -mt-2 self-start rounded text-[15px] text-[#C4E7E8] underline underline-offset-4 outline-none focus-visible:ring-4 focus-visible:ring-[#C4E7E8]/50"
          >
            Esqueci minha senha
          </button>

          <button
            type="submit"
            disabled={loading.loginWithInternalService}
            className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-[#FDFDF9] text-base font-semibold text-[#2F3D3B] outline-none transition-transform focus-visible:ring-4 focus-visible:ring-[#C4E7E8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading.loginWithInternalService ? (
              <LoadingComponent color="#0C6B70" size={22} />
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
