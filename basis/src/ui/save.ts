/* Handing the viewer a file: a recorded take.

   Two places this page runs, and they save differently. Opened as a
   shared page inside claude.ai, the frame blocks downloads, and the page
   asks the viewer through the `downloads` capability instead: they see the
   file's name and size and choose to keep it or not. Run anywhere else
   (the dev server, a saved copy) there is no `window.claude`, and an
   ordinary download link does the job. */

interface Downloads {
  save(request: { filename: string; data: Blob | string }): Promise<{ status: "saved" | "delivered" }>;
}
type Use = (name: "downloads") => Promise<Downloads | null>;

let host: Promise<Downloads | null> | null = null;
function downloads(): Promise<Downloads | null> {
  const use = (window as unknown as { claude?: { use?: Use } }).claude?.use;
  if (!use) return Promise.resolve(null);
  return (host ??= use("downloads").catch(() => null));
}

export async function save(filename: string, data: Blob, notify: (text: string) => void): Promise<void> {
  const size = `${(data.size / 1e6).toFixed(1)} MB`;
  const d = await downloads();
  if (d) {
    try {
      const r = await d.save({ filename, data });
      if (r.status === "saved") notify(`Saved ${filename} (${size}).`);
    } catch (e) {
      const code = (e as { code?: string }).code;
      notify(code === "declined" ? `${filename} was not saved.` : `${filename} could not be saved here (${code ?? "unavailable"}).`);
    }
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(data);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
  notify(`Saved ${filename} (${size}).`);
}
