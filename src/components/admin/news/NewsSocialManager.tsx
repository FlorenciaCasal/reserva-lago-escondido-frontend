"use client";

import React from "react";
import { Clipboard, Loader2, Save, Sparkles } from "lucide-react";
import {
  generateNewsSocialContent,
  listNewsSocialContents,
  saveNewsSocialContent,
} from "@/services/news";
import type { News, NewsSocialContent, NewsSocialContentInput, SocialPlatform } from "@/types/news";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

const emptyContent: Record<SocialPlatform, NewsSocialContentInput> = {
  INSTAGRAM: {
    caption: "",
    body: "",
    hashtags: "",
    callToAction: "",
    altText: "",
  },
  FACEBOOK: {
    caption: "",
    body: "",
    hashtags: "",
    callToAction: "",
    altText: "",
  },
};

type Props = {
  news: News;
};

function platformLabel(platform: SocialPlatform) {
  return platform === "INSTAGRAM" ? "Instagram" : "Facebook";
}

function getCopyText(platform: SocialPlatform, content: NewsSocialContentInput) {
  if (platform === "INSTAGRAM") {
    return [content.caption, content.callToAction, content.hashtags].filter(Boolean).join("\n\n");
  }
  return [content.body, content.callToAction, content.hashtags].filter(Boolean).join("\n\n");
}

function hasSocialContent(platform: SocialPlatform, content: NewsSocialContentInput) {
  const fields =
    platform === "INSTAGRAM"
      ? [content.caption, content.hashtags, content.altText, content.callToAction]
      : [content.body, content.hashtags, content.callToAction];

  return fields.some((field) => Boolean(field?.trim()));
}

export default function NewsSocialManager({ news }: Props) {
  const [activePlatform, setActivePlatform] = React.useState<SocialPlatform>("INSTAGRAM");
  const [contents, setContents] = React.useState<Record<SocialPlatform, NewsSocialContentInput>>(emptyContent);
  const [resultVisible, setResultVisible] = React.useState<Record<SocialPlatform, boolean>>({
    INSTAGRAM: false,
    FACEBOOK: false,
  });
  const [instructions, setInstructions] = React.useState<Record<SocialPlatform, string>>({
    INSTAGRAM: "",
    FACEBOOK: "",
  });
  const [loading, setLoading] = React.useState(true);
  const [generating, setGenerating] = React.useState<SocialPlatform | null>(null);
  const [saving, setSaving] = React.useState<SocialPlatform | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!success) return;

    const timeout = window.setTimeout(() => setSuccess(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [success]);

  React.useEffect(() => {
    setLoading(true);
    listNewsSocialContents(news.id)
      .then((items) => {
        const next = { ...emptyContent };
        const visible = {
          INSTAGRAM: false,
          FACEBOOK: false,
        };

        items.forEach((item: NewsSocialContent) => {
          const itemContent = {
            caption: item.caption ?? "",
            body: item.body ?? "",
            hashtags: item.hashtags ?? "",
            callToAction: item.callToAction ?? "",
            altText: item.altText ?? "",
          };

          next[item.platform] = itemContent;
          visible[item.platform] = hasSocialContent(item.platform, itemContent);
        });
        setContents(next);
        setResultVisible(visible);
      })
      .catch(() => setError("No se pudieron cargar los borradores sociales."))
      .finally(() => setLoading(false));
  }, [news.id]);

  const content = contents[activePlatform];
  const busy = loading || Boolean(generating) || Boolean(saving);
  const showResult = resultVisible[activePlatform];
  const canSave = showResult && hasSocialContent(activePlatform, content);

  function setField<K extends keyof NewsSocialContentInput>(key: K, value: NewsSocialContentInput[K]) {
    setContents((current) => ({
      ...current,
      [activePlatform]: {
        ...current[activePlatform],
        [key]: value,
      },
    }));
  }

  async function onGenerate(platform: SocialPlatform) {
    setGenerating(platform);
    setError(null);
    setSuccess(null);

    try {
      const generated = await generateNewsSocialContent(news.id, platform, {
        instructions: instructions[platform],
      });
      setContents((current) => ({
        ...current,
        [platform]: {
          caption: generated.caption ?? "",
          body: generated.body ?? "",
          hashtags: generated.hashtags ?? "",
          callToAction: generated.callToAction ?? "",
          altText: generated.altText ?? "",
        },
      }));
      setResultVisible((current) => ({ ...current, [platform]: true }));
      setSuccess(`${platformLabel(platform)} generado. Revisalo y guardalo para persistirlo.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `No se pudo generar ${platformLabel(platform)}.`);
    } finally {
      setGenerating(null);
    }
  }

  async function onSave(platform: SocialPlatform) {
    setSaving(platform);
    setError(null);
    setSuccess(null);

    try {
      const saved = await saveNewsSocialContent(news.id, platform, contents[platform]);
      setContents((current) => ({
        ...current,
        [platform]: {
          caption: saved.caption ?? "",
          body: saved.body ?? "",
          hashtags: saved.hashtags ?? "",
          callToAction: saved.callToAction ?? "",
          altText: saved.altText ?? "",
        },
      }));
      setSuccess(`${platformLabel(platform)} guardado correctamente.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `No se pudo guardar ${platformLabel(platform)}.`);
    } finally {
      setSaving(null);
    }
  }

  async function copyText(label: string, value?: string | null) {
    const text = value?.trim();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950" id="news-social">
      <div className="border-b border-neutral-800 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
          Redes sociales
        </p>
        <h2 className="text-base font-semibold text-neutral-100">Preparacion manual</h2>
      </div>

      <div className="border-b border-neutral-800 p-4">
        <div className="inline-flex rounded-lg border border-neutral-800 bg-neutral-900 p-1">
          {(["INSTAGRAM", "FACEBOOK"] as SocialPlatform[]).map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => setActivePlatform(platform)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                activePlatform === platform
                  ? "bg-primary text-white"
                  : "text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              {platformLabel(platform)}
            </button>
          ))}
        </div>
      </div>

      {(error || success || copied) && (
        <div className="fixed left-1/2 top-16 z-50 w-fit max-w-[calc(100%-2rem)] -translate-x-1/2 sm:top-4 sm:max-w-3xl">
          <div
            className={`rounded-lg border p-3 text-sm shadow-2xl shadow-black/40 backdrop-blur-md ${
              error
                ? "border-red-800 bg-red-950/95 text-red-200"
                : "border-green-800 bg-green-950/95 text-green-200"
            }`}
          >
            {error || copied ? (copied ? `${copied} copiado.` : error) : success}
          </div>
        </div>
      )}

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Indicaciones para regenerar (opcional)
            </span>
            <textarea
              className={`${inputClass} min-h-20 resize-y`}
              disabled={busy}
              value={instructions[activePlatform]}
              onChange={(event) =>
                setInstructions((current) => ({ ...current, [activePlatform]: event.target.value }))
              }
            />
          </label>

          {showResult && (
            <>
              {activePlatform === "INSTAGRAM" ? (
                <>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Caption
                    </span>
                    <textarea
                      className={`${inputClass} min-h-36 resize-y leading-relaxed`}
                      disabled={busy}
                      value={content.caption ?? ""}
                      onChange={(event) => setField("caption", event.target.value)}
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Hashtags
                    </span>
                    <textarea
                      className={`${inputClass} min-h-20 resize-y`}
                      disabled={busy}
                      value={content.hashtags ?? ""}
                      onChange={(event) => setField("hashtags", event.target.value)}
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Texto alternativo
                    </span>
                    <textarea
                      className={`${inputClass} min-h-20 resize-y`}
                      disabled={busy}
                      value={content.altText ?? ""}
                      onChange={(event) => setField("altText", event.target.value)}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Texto para Facebook
                    </span>
                    <textarea
                      className={`${inputClass} min-h-44 resize-y leading-relaxed`}
                      disabled={busy}
                      value={content.body ?? ""}
                      onChange={(event) => setField("body", event.target.value)}
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Hashtags opcionales
                    </span>
                    <textarea
                      className={`${inputClass} min-h-16 resize-y`}
                      disabled={busy}
                      value={content.hashtags ?? ""}
                      onChange={(event) => setField("hashtags", event.target.value)}
                    />
                  </label>
                </>
              )}

              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  CTA
                </span>
                <input
                  className={inputClass}
                  disabled={busy}
                  value={content.callToAction ?? ""}
                  onChange={(event) => setField("callToAction", event.target.value)}
                />
              </label>
            </>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={() => onGenerate(activePlatform)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating === activePlatform ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generar
            </button>
            <button
              type="button"
              disabled={busy || !canSave}
              onClick={() => onSave(activePlatform)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              {saving === activePlatform ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar
            </button>
          </div>
        </div>

        {showResult ? (
          <SocialPreview
            news={news}
            platform={activePlatform}
            content={content}
            onCopy={copyText}
          />
        ) : (
          <aside className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 p-5 text-sm leading-6 text-neutral-400">
            Genera el contenido para {platformLabel(activePlatform)}. El resultado aparecera aca para revisar, editar, previsualizar y copiar.
          </aside>
        )}
      </div>
    </section>
  );
}

type PreviewProps = {
  news: News;
  platform: SocialPlatform;
  content: NewsSocialContentInput;
  onCopy: (label: string, value?: string | null) => void;
};

function SocialPreview({ news, platform, content, onCopy }: PreviewProps) {
  const copyAll = getCopyText(platform, content);

  return (
    <aside className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
          Preview {platformLabel(platform)}
        </p>
        <button
          type="button"
          disabled={!copyAll}
          onClick={() => onCopy("Contenido completo", copyAll)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800 disabled:opacity-40"
          aria-label="Copiar contenido completo"
        >
          <Clipboard className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className={platform === "INSTAGRAM" ? "mx-auto max-w-[320px] overflow-hidden rounded-xl border border-neutral-700 bg-black" : "rounded-xl border border-neutral-700 bg-neutral-950"}>
        <div className="flex items-center gap-3 border-b border-neutral-800 px-3 py-3">
          <div className="h-9 w-9 rounded-full bg-primary/80" />
          <div>
            <p className="text-sm font-semibold text-neutral-100">Reserva Natural Lago Escondido</p>
            <p className="text-xs text-neutral-500">{platformLabel(platform)}</p>
          </div>
        </div>

        {news.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={news.imageUrl} alt={content.altText || news.title} className="aspect-square w-full object-cover" />
        )}

        <div className="space-y-3 p-3 text-sm leading-6 text-neutral-200">
          {platform === "INSTAGRAM" ? (
            <>
              <p className="whitespace-pre-wrap">{content.caption || "El caption generado aparecera aca."}</p>
              {content.callToAction && <p className="font-semibold text-primary-light">{content.callToAction}</p>}
              {content.hashtags && <p className="whitespace-pre-wrap text-sky-300">{content.hashtags}</p>}
              {content.altText && (
                <p className="border-t border-neutral-800 pt-3 text-xs leading-5 text-neutral-400">
                  Alt text: {content.altText}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="whitespace-pre-wrap">{content.body || "El texto adaptado para Facebook aparecera aca."}</p>
              {content.callToAction && <p className="font-semibold text-primary-light">{content.callToAction}</p>}
              {content.hashtags && <p className="whitespace-pre-wrap text-sky-300">{content.hashtags}</p>}
            </>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {platform === "INSTAGRAM" && (
          <>
            <CopyButton label="Caption" value={content.caption} onCopy={onCopy} />
            <CopyButton label="Hashtags" value={content.hashtags} onCopy={onCopy} />
            <CopyButton label="Alt text" value={content.altText} onCopy={onCopy} />
          </>
        )}
        {platform === "FACEBOOK" && (
          <>
            <CopyButton label="Texto" value={content.body} onCopy={onCopy} />
            <CopyButton label="Hashtags" value={content.hashtags} onCopy={onCopy} />
          </>
        )}
        <CopyButton label="CTA" value={content.callToAction} onCopy={onCopy} />
      </div>
    </aside>
  );
}

type CopyButtonProps = {
  label: string;
  value?: string | null;
  onCopy: (label: string, value?: string | null) => void;
};

function CopyButton({ label, value, onCopy }: CopyButtonProps) {
  return (
    <button
      type="button"
      disabled={!value?.trim()}
      onClick={() => onCopy(label, value)}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-100 hover:bg-neutral-800 disabled:opacity-40"
    >
      <Clipboard className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
