"use client";

import React, { useState } from "react";

import Title from "@atoms/Title/title";
import Button from "@atoms/Button/button";
import LoadingComponent from "@atoms/Loading/loading";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const inputClass =
  "h-10 w-full rounded-lg border border-greenBlue-800 bg-greenBebe-200 px-3 text-greenBlue-1000";

const splitList = (value: string) =>
  value
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const KEY_STATUS: Record<
  string,
  { label: string; variant: "success" | "destructive" | "neutral" }
> = {
  ACTIVE: { label: "Ativa", variant: "success" },
  EXPIRED: { label: "Expirada", variant: "neutral" },
  REVOKED: { label: "Revogada", variant: "destructive" }
};

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR") : "—";

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
    <Dialog open={Boolean(issued)} onOpenChange={() => undefined}>
      <DialogContent
        // Fechar sem querer perderia a key para sempre: só o botão fecha.
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Chave de API emitida</DialogTitle>
          <DialogDescription>
            Copie agora: esta chave não será exibida novamente. Se perdê-la,
            será preciso emitir outra.
          </DialogDescription>
        </DialogHeader>

        <code
          data-testid="issued-api-key"
          className="block break-all rounded-lg border border-greenBlue-800 bg-greenBebe-200 p-3 text-sm"
        >
          {issued?.apiKey}
        </code>

        <div className="flex gap-3">
          <Button className="w-fit" onClick={copy}>
            {copied ? "Copiada!" : "Copiar chave"}
          </Button>
          <Button className="w-fit" onClick={close}>
            Já guardei a chave
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ---------- Keys de um parceiro ----------

const ClientKeys = ({
  client,
  onIssued
}: {
  client: IntegrationClient;
  onIssued: (issued: IssuedApiKey) => void;
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

  async function handleRotate(keyId: string) {
    if (
      !confirm(
        "Rotacionar emite uma chave nova; a atual continua valendo só durante o período de transição. Continuar?"
      )
    ) {
      return;
    }
    try {
      onIssued(await rotate(keyId));
    } catch (err: any) {
      errorToast(err?.message || "Não foi possível rotacionar a chave.");
    }
  }

  async function handleRevoke(keyId: string) {
    if (!confirm("Revogar agora? Quem usa esta chave perde o acesso.")) return;
    try {
      await revoke(keyId);
      successToast("Chave revogada.");
    } catch (err: any) {
      errorToast(err?.message || "Não foi possível revogar a chave.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
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
              <div>
                <p className="font-mono">
                  {key.prefix}…{key.last4}{" "}
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
                    className="h-fit w-fit"
                    onClick={() => handleRotate(key.keyId)}
                  >
                    Rotacionar
                  </Button>
                  <Button
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

  function toggleCity(id: string) {
    setCityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
      className="mb-10 space-y-4 rounded-lg border border-greenBlue-400 bg-white-1000 p-6"
    >
      <label className="block text-sm text-greenDark-800">
        Nome do parceiro
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="block text-sm text-greenDark-800">
        E-mails dos responsáveis (recebem os avisos de expiração)
        <input
          className={inputClass}
          value={emails}
          placeholder="a@parceiro.com, b@parceiro.com"
          onChange={(e) => setEmails(e.target.value)}
        />
      </label>
      <label className="block text-sm text-greenDark-800">
        IPs ou CIDRs permitidos (opcional, IPv4)
        <input
          className={inputClass}
          value={ips}
          placeholder="203.0.113.10, 198.51.100.0/24"
          onChange={(e) => setIps(e.target.value)}
        />
      </label>
      <label className="block text-sm text-greenDark-800">
        Ambiente (não muda depois)
        <select
          className={inputClass}
          value={environment}
          onChange={(e) =>
            setEnvironment(e.target.value as IntegrationEnvironment)
          }
        >
          <option value="LIVE">LIVE (dados reais)</option>
          <option value="TEST">TEST (sandbox, dados fictícios)</option>
        </select>
      </label>
      <fieldset>
        <legend className="mb-1 text-sm text-greenDark-800">
          Cidades liberadas
        </legend>
        <div className="grid max-h-48 grid-cols-2 gap-1 overflow-y-auto">
          {(cities ?? []).map((city) => (
            <label key={city.id} className="text-sm text-greenDark-800">
              <input
                type="checkbox"
                checked={cityIds.includes(city.id)}
                onChange={() => toggleCity(city.id)}
              />{" "}
              {city.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-3">
        <Button buttonType="submit" className="w-fit" loading={isLoading}>
          Cadastrar integração
        </Button>
        <Button buttonType="button" className="w-fit" onClick={onDone}>
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
  const [openId, setOpenId] = useState("");
  // A key completa fica só neste estado local (nunca no cache persistido).
  const [issued, setIssued] = useState<IssuedApiKey | null>(null);

  const cityName = (id: string) =>
    cities?.find((city) => city.id === id)?.name ?? id;

  async function toggleStatus(client: IntegrationClient) {
    const suspending = client.status === "ACTIVE";
    if (
      suspending &&
      !confirm("Suspender bloqueia todas as chaves deste parceiro. Continuar?")
    ) {
      return;
    }
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

  return (
    <div style={wrapper} className="py-14">
      <div className="mb-14 flex items-center justify-between">
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
        <ul className="space-y-4">
          {clients.map((client) => (
            <li
              key={client.id}
              className="rounded-lg border border-greenBlue-400 bg-white-1000 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-greenBlue-1000">
                    {client.name}{" "}
                    <Badge
                      variant={
                        client.environment === "LIVE" ? "default" : "warning"
                      }
                    >
                      {client.environment}
                    </Badge>{" "}
                    <Badge
                      variant={
                        client.status === "ACTIVE" ? "success" : "destructive"
                      }
                    >
                      {client.status === "ACTIVE" ? "Ativa" : "Suspensa"}
                    </Badge>
                  </p>
                  <p className="text-sm text-greenDark-800">
                    Responsáveis: {client.ownerEmails.join(", ")}
                  </p>
                  <p className="text-sm text-greenDark-800">
                    Cidades: {client.allowedCityIds.map(cityName).join(", ")}
                  </p>
                  <p className="text-sm text-greenDark-800">
                    IPs permitidos:{" "}
                    {client.ipAllowlist.length
                      ? client.ipAllowlist.join(", ")
                      : "qualquer"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="h-fit w-fit"
                    onClick={() => toggleStatus(client)}
                  >
                    {client.status === "ACTIVE" ? "Suspender" : "Reativar"}
                  </Button>
                  <Button
                    className="h-fit w-fit"
                    onClick={() =>
                      setOpenId((prev) => (prev === client.id ? "" : client.id))
                    }
                  >
                    {openId === client.id ? "Ocultar chaves" : "Chaves"}
                  </Button>
                </div>
              </div>

              {openId === client.id && (
                <ClientKeys client={client} onIssued={setIssued} />
              )}
            </li>
          ))}
        </ul>
      )}

      <RevealKeyDialog issued={issued} onClose={() => setIssued(null)} />
    </div>
  );
};

export default IntegracoesPage;
