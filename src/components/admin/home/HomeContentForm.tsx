"use client";

import React from "react";
import { getAdminHomeContent, updateAdminHomeContent, uploadHomeImage } from "@/services/home";
import type { HomeContent, HomePillarContent } from "@/types/home";

const emptyPillar: HomePillarContent = {
  title: "",
  value: "",
  suffix: "",
  statLabel: "",
  text: "",
  ctaLabel: "",
};

const emptyContent: HomeContent = {
  heroTitle: "",
  heroSubtitle: "",
  heroImageUrl: "",
  introText: "",
  actionTitle: "",
  conservar: emptyPillar,
  habitar: emptyPillar,
  producir: emptyPillar,
  projectsTitle: "",
  projectsCtaLabel: "",
  newsTitle: "",
  newsCtaLabel: "",
  visitsEyebrow: "",
  visitsTitle: "",
  visitsText: "",
  visitsCtaLabel: "",
  visitsImageUrl: "",
};

type PillarKey = "conservar" | "habitar" | "producir";
type ImageField = "heroImageUrl" | "visitsImageUrl";

export default function HomeContentForm() {
  const [form, setForm] = React.useState<HomeContent>(emptyContent);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState<ImageField | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAdminHomeContent()
      .then((content) => setForm(content))
      .catch(() => setError("No se pudo cargar el contenido del Home."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const canSave =
    Boolean(form.heroTitle.trim()) &&
    Boolean(form.heroSubtitle.trim()) &&
    Boolean(form.heroImageUrl.trim()) &&
    Boolean(form.introText.trim()) &&
    Boolean(form.actionTitle.trim()) &&
    isPillarComplete(form.conservar) &&
    isPillarComplete(form.habitar) &&
    isPillarComplete(form.producir) &&
    Boolean(form.projectsTitle.trim()) &&
    Boolean(form.projectsCtaLabel.trim()) &&
    Boolean(form.newsTitle.trim()) &&
    Boolean(form.newsCtaLabel.trim()) &&
    Boolean(form.visitsEyebrow.trim()) &&
    Boolean(form.visitsTitle.trim()) &&
    Boolean(form.visitsText.trim()) &&
    Boolean(form.visitsCtaLabel.trim()) &&
    Boolean(form.visitsImageUrl.trim()) &&
    !saving &&
    !uploading;

  function updateField<K extends keyof HomeContent>(key: K, value: HomeContent[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updatePillar(key: PillarKey, field: keyof HomePillarContent, value: string) {
    setForm((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [field]: value,
      },
    }));
  }

  async function handleImageUpload(field: ImageField, file?: File) {
    if (!file) return;

    setUploading(field);
    setError(null);
    setMessage(null);

    try {
      const asset = await uploadHomeImage(file);
      updateField(field, asset.url);
      setMessage("Imagen cargada correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la imagen.");
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const saved = await updateAdminHomeContent({
        heroTitle: form.heroTitle.trim(),
        heroSubtitle: form.heroSubtitle.trim(),
        heroImageUrl: form.heroImageUrl.trim(),
        introText: form.introText.trim(),
        actionTitle: form.actionTitle.trim(),
        conservar: trimPillar(form.conservar),
        habitar: trimPillar(form.habitar),
        producir: trimPillar(form.producir),
        projectsTitle: form.projectsTitle.trim(),
        projectsCtaLabel: form.projectsCtaLabel.trim(),
        newsTitle: form.newsTitle.trim(),
        newsCtaLabel: form.newsCtaLabel.trim(),
        visitsEyebrow: form.visitsEyebrow.trim(),
        visitsTitle: form.visitsTitle.trim(),
        visitsText: form.visitsText.trim(),
        visitsCtaLabel: form.visitsCtaLabel.trim(),
        visitsImageUrl: form.visitsImageUrl.trim(),
      });
      setForm(saved);
      setMessage("Contenido del Home guardado correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el contenido.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <p className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-300">
          Cargando contenido...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
          Administración
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
          Home
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Edita el contenido editorial propio de la página de inicio.
        </p>
      </header>

      {message && (
        <div className="fixed left-1/2 top-16 z-50 w-fit max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl border border-green-700 bg-green-950/95 p-4 text-sm text-green-200 shadow-2xl shadow-black/40 backdrop-blur-md sm:top-4 sm:max-w-3xl">
          {message}
        </div>
      )}

      {error && (
        <div className="fixed left-1/2 top-16 z-50 w-fit max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl border border-red-800 bg-red-950/95 p-4 text-sm text-red-200 shadow-2xl shadow-black/40 backdrop-blur-md sm:top-4 sm:max-w-3xl">
          {error}
        </div>
      )}

      <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Hero</h2>
        <TextInput label="Título" value={form.heroTitle} onChange={(value) => updateField("heroTitle", value)} maxLength={180} />
        <Textarea label="Bajada" value={form.heroSubtitle} onChange={(value) => updateField("heroSubtitle", value)} rows={3} maxLength={220} />
        <ImageInput
          label="Imagen"
          imageUrl={form.heroImageUrl}
          uploading={uploading === "heroImageUrl"}
          onChange={(file) => void handleImageUpload("heroImageUrl", file)}
        />
      </section>

      <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Introducción</h2>
        <Textarea label="Texto" value={form.introText} onChange={(value) => updateField("introText", value)} rows={4} maxLength={500} />
      </section>

      <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Líneas de acción</h2>
        <TextInput label="Título de sección" value={form.actionTitle} onChange={(value) => updateField("actionTitle", value)} maxLength={100} />
        <PillarFields title="Conservar" pillar={form.conservar} onChange={(field, value) => updatePillar("conservar", field, value)} />
        <PillarFields title="Habitar" pillar={form.habitar} onChange={(field, value) => updatePillar("habitar", field, value)} />
        <PillarFields title="Producir" pillar={form.producir} onChange={(field, value) => updatePillar("producir", field, value)} />
      </section>

      <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Proyectos</h2>
        <TextInput label="Título de sección" value={form.projectsTitle} onChange={(value) => updateField("projectsTitle", value)} maxLength={100} />
        <TextInput label="Texto del enlace" value={form.projectsCtaLabel} onChange={(value) => updateField("projectsCtaLabel", value)} maxLength={80} />
      </section>

      <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Novedades</h2>
        <TextInput label="Título de sección" value={form.newsTitle} onChange={(value) => updateField("newsTitle", value)} maxLength={100} />
        <TextInput label="Texto del enlace" value={form.newsCtaLabel} onChange={(value) => updateField("newsCtaLabel", value)} maxLength={80} />
      </section>

      <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Visitas</h2>
        <TextInput label="Eyebrow" value={form.visitsEyebrow} onChange={(value) => updateField("visitsEyebrow", value)} maxLength={80} />
        <TextInput label="Título" value={form.visitsTitle} onChange={(value) => updateField("visitsTitle", value)} maxLength={160} />
        <Textarea label="Texto" value={form.visitsText} onChange={(value) => updateField("visitsText", value)} rows={4} maxLength={500} />
        <TextInput label="Texto del botón" value={form.visitsCtaLabel} onChange={(value) => updateField("visitsCtaLabel", value)} maxLength={80} />
        <ImageInput
          label="Imagen"
          imageUrl={form.visitsImageUrl}
          uploading={uploading === "visitsImageUrl"}
          onChange={(file) => void handleImageUpload("visitsImageUrl", file)}
        />
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSave}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

function TextInput({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}) {
  const id = React.useId();

  return (
    <div>
      <label className="text-sm font-medium text-neutral-200" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  maxLength: number;
}) {
  const id = React.useId();

  return (
    <div>
      <label className="text-sm font-medium text-neutral-200" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        maxLength={maxLength}
        className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm leading-6 text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
      />
    </div>
  );
}

function ImageInput({
  label,
  imageUrl,
  uploading,
  onChange,
}: {
  label: string;
  imageUrl: string;
  uploading: boolean;
  onChange: (file?: File) => void;
}) {
  const id = React.useId();

  return (
    <div>
      <label className="text-sm font-medium text-neutral-200" htmlFor={id}>
        {label}
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-24 w-40 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <input
            id={id}
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => onChange(event.target.files?.[0])}
            className="block w-full text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-100 hover:file:bg-neutral-700 disabled:opacity-50"
          />
          {uploading && <p className="mt-2 text-xs text-neutral-400">Cargando imagen...</p>}
        </div>
      </div>
    </div>
  );
}

function PillarFields({
  title,
  pillar,
  onChange,
}: {
  title: string;
  pillar: HomePillarContent;
  onChange: (field: keyof HomePillarContent, value: string) => void;
}) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-neutral-800 p-4">
      <legend className="px-2 text-sm font-semibold text-neutral-200">
        {title}
      </legend>
      <div className="grid gap-4 md:grid-cols-3">
        <TextInput label="Título" value={pillar.title} onChange={(value) => onChange("title", value)} maxLength={80} />
        <TextInput label="Cifra/dato" value={pillar.value} onChange={(value) => onChange("value", value)} maxLength={20} />
        <TextInput label="Sufijo" value={pillar.suffix} onChange={(value) => onChange("suffix", value)} maxLength={10} />
      </div>
      <TextInput label="Texto asociado a la cifra" value={pillar.statLabel} onChange={(value) => onChange("statLabel", value)} maxLength={120} />
      <Textarea label="Descripción" value={pillar.text} onChange={(value) => onChange("text", value)} rows={3} maxLength={220} />
      <TextInput label="Texto del CTA" value={pillar.ctaLabel} onChange={(value) => onChange("ctaLabel", value)} maxLength={40} />
    </fieldset>
  );
}

function isPillarComplete(pillar: HomePillarContent) {
  return (
    Boolean(pillar.title.trim()) &&
    Boolean(pillar.value.trim()) &&
    Boolean(pillar.statLabel.trim()) &&
    Boolean(pillar.text.trim()) &&
    Boolean(pillar.ctaLabel.trim())
  );
}

function trimPillar(pillar: HomePillarContent): HomePillarContent {
  return {
    title: pillar.title.trim(),
    value: pillar.value.trim(),
    suffix: pillar.suffix.trim(),
    statLabel: pillar.statLabel.trim(),
    text: pillar.text.trim(),
    ctaLabel: pillar.ctaLabel.trim(),
  };
}
