"use client";

import React from "react";
import { getAdminPreserveContent, updateAdminPreserveContent } from "@/services/preserve";
import type { PreserveContent } from "@/types/preserve";

const emptyContent: PreserveContent = {
  intro: "",
  heroAsideLines: [""],
  whatEyebrow: "",
  whatWeDoText: "",
  bullets: [""],
  territoryEyebrow: "",
  territoryTitle: "",
  territoryText: "",
  territoryMetricValue: "",
  territoryMetricDescription: "",
  territoryResearchTitle: "",
  territoryResearchDescription: "",
  territoryEducationTitle: "",
  territoryEducationDescription: "",
};

export default function PreserveContentForm() {
  const [form, setForm] = React.useState<PreserveContent>(emptyContent);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAdminPreserveContent()
      .then((content) => setForm(content))
      .catch(() => setError("No se pudo cargar el contenido de Conservar."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const cleanHeroAsideLines = form.heroAsideLines.map((item) => item.trim()).filter(Boolean);
  const cleanBullets = form.bullets.map((item) => item.trim()).filter(Boolean);
  const canSave =
    Boolean(form.intro.trim()) &&
    cleanHeroAsideLines.length > 0 &&
    Boolean(form.whatEyebrow.trim()) &&
    Boolean(form.whatWeDoText.trim()) &&
    cleanBullets.length > 0 &&
    Boolean(form.territoryEyebrow.trim()) &&
    Boolean(form.territoryTitle.trim()) &&
    Boolean(form.territoryText.trim()) &&
    Boolean(form.territoryMetricValue.trim()) &&
    Boolean(form.territoryMetricDescription.trim()) &&
    Boolean(form.territoryResearchTitle.trim()) &&
    Boolean(form.territoryResearchDescription.trim()) &&
    Boolean(form.territoryEducationTitle.trim()) &&
    Boolean(form.territoryEducationDescription.trim()) &&
    !saving;

  function updateHeroAsideLine(index: number, value: string) {
    setForm((current) => ({
      ...current,
      heroAsideLines: current.heroAsideLines.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function addHeroAsideLine() {
    setForm((current) => ({
      ...current,
      heroAsideLines: [...current.heroAsideLines, ""],
    }));
  }

  function removeHeroAsideLine(index: number) {
    setForm((current) => ({
      ...current,
      heroAsideLines: current.heroAsideLines.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function updateBullet(index: number, value: string) {
    setForm((current) => ({
      ...current,
      bullets: current.bullets.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  }

  function addBullet() {
    setForm((current) => ({
      ...current,
      bullets: [...current.bullets, ""],
    }));
  }

  function removeBullet(index: number) {
    setForm((current) => ({
      ...current,
      bullets: current.bullets.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const saved = await updateAdminPreserveContent({
        intro: form.intro.trim(),
        heroAsideLines: cleanHeroAsideLines,
        whatEyebrow: form.whatEyebrow.trim(),
        whatWeDoText: form.whatWeDoText.trim(),
        bullets: cleanBullets,
        territoryEyebrow: form.territoryEyebrow.trim(),
        territoryTitle: form.territoryTitle.trim(),
        territoryText: form.territoryText.trim(),
        territoryMetricValue: form.territoryMetricValue.trim(),
        territoryMetricDescription: form.territoryMetricDescription.trim(),
        territoryResearchTitle: form.territoryResearchTitle.trim(),
        territoryResearchDescription: form.territoryResearchDescription.trim(),
        territoryEducationTitle: form.territoryEducationTitle.trim(),
        territoryEducationDescription: form.territoryEducationDescription.trim(),
      });
      setForm(saved);
      setMessage("Contenido de Conservar guardado correctamente.");
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
          Conservar
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Edita la bajada principal y los textos institucionales de Conservar.
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
        <div>
          <label className="text-sm font-medium text-neutral-200" htmlFor="intro">
            Bajada principal
          </label>
          <textarea
            id="intro"
            value={form.intro}
            onChange={(event) => setForm((current) => ({ ...current, intro: event.target.value }))}
            rows={3}
            maxLength={500}
            className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm leading-6 text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-neutral-200">
              Texto editorial del hero
            </label>
            <button
              type="button"
              onClick={addHeroAsideLine}
              className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-800"
            >
              Agregar linea
            </button>
          </div>

          {form.heroAsideLines.map((line, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={line}
                onChange={(event) => updateHeroAsideLine(index, event.target.value)}
                maxLength={40}
                className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
                placeholder={`Linea ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeHeroAsideLine(index)}
                disabled={form.heroAsideLines.length <= 1}
                className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-200" htmlFor="whatEyebrow">
            Eyebrow de Que hacemos
          </label>
          <input
            id="whatEyebrow"
            value={form.whatEyebrow}
            onChange={(event) => setForm((current) => ({ ...current, whatEyebrow: event.target.value }))}
            maxLength={80}
            className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-200" htmlFor="whatWeDoText">
            Texto introductorio
          </label>
          <textarea
            id="whatWeDoText"
            value={form.whatWeDoText}
            onChange={(event) => setForm((current) => ({ ...current, whatWeDoText: event.target.value }))}
            rows={7}
            maxLength={1200}
            className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm leading-6 text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-neutral-200">
              Listado
            </label>
            <button
              type="button"
              onClick={addBullet}
              className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-800"
            >
              Agregar item
            </button>
          </div>

          {form.bullets.map((bullet, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={bullet}
                onChange={(event) => updateBullet(index, event.target.value)}
                maxLength={180}
                className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
                placeholder={`Item ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeBullet(index)}
                disabled={form.bullets.length <= 1}
                className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-6">
        <div>
          <label className="text-sm font-medium text-neutral-200" htmlFor="territoryEyebrow">
            Eyebrow de enfoque
          </label>
          <input
            id="territoryEyebrow"
            value={form.territoryEyebrow}
            onChange={(event) => setForm((current) => ({ ...current, territoryEyebrow: event.target.value }))}
            maxLength={100}
            className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-200" htmlFor="territoryTitle">
            Titulo de enfoque
          </label>
          <input
            id="territoryTitle"
            value={form.territoryTitle}
            onChange={(event) => setForm((current) => ({ ...current, territoryTitle: event.target.value }))}
            maxLength={160}
            className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-200" htmlFor="territoryText">
            Texto de enfoque
          </label>
          <textarea
            id="territoryText"
            value={form.territoryText}
            onChange={(event) => setForm((current) => ({ ...current, territoryText: event.target.value }))}
            rows={4}
            maxLength={700}
            className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm leading-6 text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-neutral-200" htmlFor="territoryMetricValue">
              Eje 1 - titulo
            </label>
            <input
              id="territoryMetricValue"
              value={form.territoryMetricValue}
              onChange={(event) => setForm((current) => ({ ...current, territoryMetricValue: event.target.value }))}
              maxLength={30}
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-200" htmlFor="territoryMetricDescription">
              Eje 1 - descripción
            </label>
            <input
              id="territoryMetricDescription"
              value={form.territoryMetricDescription}
              onChange={(event) => setForm((current) => ({ ...current, territoryMetricDescription: event.target.value }))}
              maxLength={140}
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-neutral-200" htmlFor="territoryResearchTitle">
              Eje 2 - titulo
            </label>
            <input
              id="territoryResearchTitle"
              value={form.territoryResearchTitle}
              onChange={(event) => setForm((current) => ({ ...current, territoryResearchTitle: event.target.value }))}
              maxLength={80}
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-200" htmlFor="territoryResearchDescription">
              Eje 2 - descripción
            </label>
            <input
              id="territoryResearchDescription"
              value={form.territoryResearchDescription}
              onChange={(event) => setForm((current) => ({ ...current, territoryResearchDescription: event.target.value }))}
              maxLength={180}
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-neutral-200" htmlFor="territoryEducationTitle">
              Eje 3 - titulo
            </label>
            <input
              id="territoryEducationTitle"
              value={form.territoryEducationTitle}
              onChange={(event) => setForm((current) => ({ ...current, territoryEducationTitle: event.target.value }))}
              maxLength={80}
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-200" htmlFor="territoryEducationDescription">
              Eje 3 - descripción
            </label>
            <input
              id="territoryEducationDescription"
              value={form.territoryEducationDescription}
              onChange={(event) => setForm((current) => ({ ...current, territoryEducationDescription: event.target.value }))}
              maxLength={180}
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-500 focus:border-primary"
            />
          </div>
        </div>
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
