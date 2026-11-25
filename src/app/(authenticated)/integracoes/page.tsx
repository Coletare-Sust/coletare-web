"use client";

import React, { useState } from "react";

import Title from "@atoms/Title/title";
import Button from "@atoms/Button/button";
import LoadingComponent from "@atoms/Loading/loading";
import Dropdown from "@atoms/Dropdown/dropdown";
import { AccordionChildren } from "@atoms/Accordion/accordion";
import InputField from "@molecules/InputField/inputField";
import ConfirmationModal from "@molecules/ConfirmationModal/confirmationModal";
import TransitionModal from "@molecules/TransitionModal/transitionModal";
import { wrapper } from "@/common/constants/wrapper";
import { errorToast, successToast } from "@/hooks/useAppToast";
import useAllCities from "@/hooks/queries/useAllCities";
import {
  useApiKeys,
  useCreateIntegrationClient,
  useIntegrationClients,
  useIssueApiKey,
  useRevokeApiKey,
  useRotateApiKey,
  useUpdateIntegrationClient
} from "@/hooks/queries/integrations/useIntegrations";
import type {
  IntegrationClient,
  IntegrationEnvironment,
  IssuedApiKey
} from "@/store/services/integrations";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const splitList = (value: string) =>
  value
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR") : "—";

const KEY_STATUS: Record<
  string,
  { label: string; variant: "success" | "destructive" | "neutral" }
> = {
  ACTIVE: { label: "Ativa", variant: "success" },
  EXPIRED: { label: "Expirada", variant: "neutral" },
  REVOKED: { label: "Revogada", variant: "destructive" }
};

const ENVIRONMENT_LABELS: Record<IntegrationEnvironment, string> = {
  LIVE: "LIVE (dados reais)",
  TEST: "TEST (sandbox, dados fictícios)"
};

/** Pede confirmação antes de uma ação destrutiva (usa o ConfirmationModal da página). */
type AskConfirm = (
  title: string,
  description: string,
  onConfirm: () => Promise<void>,
  destructive?: boolean
) => void;

// ---------- Modal "copie agora, não será exibida novamente" ----------

const RevealKeyDialog = ({
  issued,
  onClose
}: {
  issued: IssuedApiKey | null;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued.apiKey);
      setCopied(true);
    } catch {
      errorToast("Não foi possível copiar. Selecione e copie manualmente.");
    }
  }

  function close() {
    setCopied(false);
    onClose();
  }

  return (
    <TransitionModal
      isOpen={Boolean(issued)}
      setIsOpen={() => undefined}
      // Fechar sem querer perderia a key para sempre: só o botão fecha.
      dismissible={false}
      title="Chave de API emitida"
      description="Copie agora: esta chave não será exibida novamente. Se perdê-la, será preciso emitir outra."
    >
      <code
        data-testid="issued-api-key"
        className="mt-4 block break-all rounded-lg border border-greenBlue-800 bg-greenBebe-200 p-3 text-sm"
      >
        {issued?.apiKey}
      </code>

      <div className="mt-4 flex gap-3">
        <Button
          variant={copied ? "primary" : "outline"}
          className="w-fit"
          onClick={copy}
        >
          {copied ? "Copiada!" : "Copiar chave"}
        </Button>
        <Button className="w-fit" onClick={close}>
          Já guardei a chave
        </Button>
      </div>
    </TransitionModal>
  );
};

// ---------- Keys de um parceiro ----------

const ClientKeys = ({
  client,
  onIssued,
  askConfirm
}: {
  client: IntegrationClient;
  onIssued: (issued: IssuedApiKey) => void;
  askConfirm: AskConfirm;
}) => {
  const { data: keys, isLoading } = useApiKeys(client.id);
  const { mutateAsync: issue, isLoading: issuing } = useIssueApiKey(client.id);
  const { mutateAsync: rotate } = useRotateApiKey(client.id);
  const { mutateAsync: revoke } = useRevokeApiKey(client.id);

  async function handleIssue() {
    try {
      onIssued(await issue(undefined));
    } catch (err: any) {
      errorToast(err?.message || "Não foi possível emitir a chave.");
    }
  }

  const handleRotate = (keyId: string) =>
    askConfirm(
      "Rotacionar chave",
      "Rotacionar emite uma chave nova; a atual continua valendo só durante o período de transição.",
      async () => {
        try {
          onIssued(await rotate(keyId));
        } catch (err: any) {
          errorToast(err?.message || "Não foi possível rotacionar a chave.");
        }
      }
    );

  const handleRevoke = (keyId: string) =>
    askConfirm(
      "Revogar chave",
      "A revogação é imediata: quem usa esta chave perde o acesso.",
      async () => {
        try {
          await revoke(keyId);
          successToast("Chave revogada.");
        } catch (err: any) {
          errorToast(err?.message || "Não foi possível revogar a chave.");
        }
      },
      true
    );

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-greenDark-800">Chaves de API</p>
        <Button
          className="h-fit w-fit"
          loading={issuing}
          disabled={client.status !== "ACTIVE"}
          onClick={handleIssue}
        >
          Emitir chave
        </Button>
      </div>

      {isLoading ? (
        <LoadingComponent />
      ) : !keys?.length ? (
        <p className="text-greenDark-800">Nenhuma chave emitida.</p>
      ) : (
        <ul className="space-y-2">
          {keys.map((key) => (
            <li
              key={key.keyId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-greenBlue-400 bg-white-1000 p-3 text-sm text-greenDark-800"
            >
              <div className="space-y-1">
                <p className="flex items-center gap-2 font-mono">
                  {key.prefix}…{key.last4}
                  <Badge variant={KEY_STATUS[key.status]?.variant ?? "neutral"}>
                    {KEY_STATUS[key.status]?.label ?? key.status}
                  </Badge>
                </p>
                <p>
                  Expira em {formatDate(key.expiresAt)} · último uso{" "}
                  {formatDate(key.lastUsedAt)}
                </p>
              </div>
              {key.status === "ACTIVE" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-fit w-fit"
                    onClick={() => handleRotate(key.keyId)}
                  >
                    Rotacionar
                  </Button>
                  <Button
                    variant="destructive"
                    className="h-fit w-fit"
                    onClick={() => handleRevoke(key.keyId)}
                  >
                    Revogar
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ---------- Formulário de novo parceiro ----------

const NewClientForm = ({ onDone }: { onDone: () => void }) => {
  const { data: cities } = useAllCities();
  const { mutateAsync: create, isLoading } = useCreateIntegrationClient();

  const [name, setName] = useState("");
  const [emails, setEmails] = useState("");
  const [ips, setIps] = useState("");
  const [environment, setEnvironment] =
    useState<IntegrationEnvironment>("LIVE");
  const [cityIds, setCityIds] = useState<string[]>([]);

  function toggleCity(id: string, checked: boolean) {
    setCityIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const ownerEmails = splitList(emails);
    if (!name.trim() || ownerEmails.length === 0 || cityIds.length === 0) {
      return errorToast(
        "Informe nome, e-mail do responsável e ao menos uma cidade."
      );
    }
    try {
      await create({
        name: name.trim(),
        ownerEmails,
        allowedCityIds: cityIds,
        scopes: ["BIOMASS_READ"],
        environment,
        ipAllowlist: splitList(ips)
      });
      successToast("Integração cadastrada. Agora emita a chave.");
      onDone();
    } catch (err: any) {
      errorToast(err?.message || "Não foi possível cadastrar a integração.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-10 flex max-w-2xl flex-col gap-4 rounded-lg border border-greenBlue-400 bg-white-1000 p-6"
    >
      <InputField
        label="Nome do parceiro"
        placeholder="Digite o nome do parceiro"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <InputField
        label="E-mails dos responsáveis (recebem os avisos de expiração)"
        placeholder="a@parceiro.com, b@parceiro.com"
        name="ownerEmails"
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
      />
      <InputField
        label="IPs ou CIDRs permitidos (opcional, IPv4)"
        placeholder="203.0.113.10, 198.51.100.0/24"
        name="ipAllowlist"
        value={ips}
        onChange={(e) => setIps(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <label className="font-medium text-greenDark-800">
          Ambiente (não muda depois)
        </label>
        <Dropdown
          className="w-full sm:w-full"
          value={ENVIRONMENT_LABELS[environment]}
          options={(
            Object.entries(ENVIRONMENT_LABELS) as [
              IntegrationEnvironment,
              string
            ][]
          ).map(([value, label]) => ({
            label,
            onClick: () => setEnvironment(value)
          }))}
        />
      </div>

      <fieldset>
        <legend className="mb-2 font-medium text-greenDark-800">
          Cidades liberadas
        </legend>
        <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {(cities ?? []).map((city) => (
            <div key={city.id} className="flex items-center gap-2">
              <Checkbox
                id={`city-${city.id}`}
                checked={cityIds.includes(city.id)}
                onCheckedChange={(checked) =>
                  toggleCity(city.id, checked === true)
                }
              />
              <label
                htmlFor={`city-${city.id}`}
                className="cursor-pointer text-greenDark-800"
              >
                {city.name}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-3">
        <Button buttonType="submit" className="w-fit" loading={isLoading}>
          Cadastrar integração
        </Button>
        <Button
          variant="outline"
          buttonType="button"
          className="w-fit"
          onClick={onDone}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};

// ---------- Página ----------

const IntegracoesPage = () => {
  const { data: clients, isLoading } = useIntegrationClients();
  const { data: cities } = useAllCities();
  const { mutateAsync: updateClient } = useUpdateIntegrationClient();

  const [showForm, setShowForm] = useState(false);
  const [openItem, setOpenItem] = useState("");
  // A key completa fica só neste estado local (nunca no cache persistido).
  const [issued, setIssued] = useState<IssuedApiKey | null>(null);
  const [pending, setPending] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    destructive?: boolean;
  } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const askConfirm: AskConfirm = (title, description, onConfirm, destructive) =>
    setPending({ title, description, onConfirm, destructive });

  async function runPending() {
    if (!pending) return;
    setConfirming(true);
    try {
      await pending.onConfirm();
    } finally {
      setConfirming(false);
      setPending(null);
    }
  }

  const cityName = (id: string) =>
    cities?.find((city) => city.id === id)?.name ?? id;

  async function changeStatus(client: IntegrationClient) {
    const suspending = client.status === "ACTIVE";
    try {
      await updateClient({
        clientId: client.id,
        input: { status: suspending ? "SUSPENDED" : "ACTIVE" }
      });
      successToast(
        suspending ? "Integração suspensa." : "Integração reativada."
      );
    } catch (err: any) {
      errorToast(err?.message || "Não foi possível alterar o status.");
    }
  }

  function toggleStatus(client: IntegrationClient) {
    if (client.status === "ACTIVE") {
      askConfirm(
        "Suspender integração",
        "Suspender bloqueia todas as chaves deste parceiro.",
        () => changeStatus(client),
        true
      );
    } else {
      changeStatus(client);
    }
  }

  return (
    <div style={wrapper} className="py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 sm:mb-14">
        <Title>Integrações</Title>
        {!showForm && (
          <Button className="w-fit" onClick={() => setShowForm(true)}>
            Nova integração
          </Button>
        )}
      </div>

      {showForm && <NewClientForm onDone={() => setShowForm(false)} />}

      {isLoading ? (
        <LoadingComponent />
      ) : !clients?.length ? (
        <p className="text-lg font-medium text-greenDark-800">
          Nenhuma integração cadastrada.
        </p>
      ) : (
        <AccordionChildren
          openItem={openItem}
          setOpenItem={setOpenItem}
          items={clients.map((client) => ({
            title: client.name,
            properties: [
              {
                prop: "Ambiente",
                answer: (
                  <Badge
                    variant={
                      client.environment === "LIVE" ? "default" : "warning"
                    }
                  >
                    {client.environment}
                  </Badge>
                )
              },
              {
                prop: "Situação",
                answer: (
                  <Badge
                    variant={
                      client.status === "ACTIVE" ? "success" : "destructive"
                    }
                  >
                    {client.status === "ACTIVE" ? "Ativa" : "Suspensa"}
                  </Badge>
                )
              }
            ],
            children: (
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1 text-greenDark-800">
                    <p>
                      <strong>Responsáveis:</strong>{" "}
                      {client.ownerEmails.join(", ")}
                    </p>
                    <p>
                      <strong>Cidades:</strong>{" "}
                      {client.allowedCityIds.map(cityName).join(", ")}
                    </p>
                    <p>
                      <strong>IPs permitidos:</strong>{" "}
                      {client.ipAllowlist.length
                        ? client.ipAllowlist.join(", ")
                        : "qualquer"}
                    </p>
                  </div>
                  <Button
                    variant={
                      client.status === "ACTIVE" ? "destructive" : "primary"
                    }
                    className="h-fit w-fit"
                    onClick={() => toggleStatus(client)}
                  >
                    {client.status === "ACTIVE" ? "Suspender" : "Reativar"}
                  </Button>
                </div>

                <ClientKeys
                  client={client}
                  onIssued={setIssued}
                  askConfirm={askConfirm}
                />
              </div>
            )
          }))}
          itemClassName="mb-4"
          triggerClassName={`
            bg-white-1000 border border-greenBlue-400
            py-4 px-4
            grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center
            rounded-lg
            data-[state=open]:rounded-b-none
            data-[state=open]:border-b-0
            transition-all
          `}
          contentClassName="bg-white-800 border border-greenBlue-400 border-t-0 py-8 px-6 rounded-b-lg"
        />
      )}

      <RevealKeyDialog issued={issued} onClose={() => setIssued(null)} />

      <ConfirmationModal
        isOpen={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        onConfirm={runPending}
        confirmIsLoading={confirming}
        title={pending?.title ?? ""}
        description={pending?.description ?? ""}
        destructive={pending?.destructive}
      />
    </div>
  );
};

export default IntegracoesPage;
