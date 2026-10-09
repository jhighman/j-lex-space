/* Handing the viewer a JSON file to keep.

   A shared page runs in a frame that blocks downloads, so a "Save" that
   made a file would do nothing there and say nothing about it. The JSON is
   copied to the clipboard instead, under the name it should be saved as.
   Where the clipboard is refused too, it is shown selected in a box to copy
   by hand. Must be called from inside the click that asked for it. */

export function keep(name: string, data: unknown, notify: (text: string) => void, show: (text: string, json: string) => void): void {
  const json = JSON.stringify(data, null, 2);
  const by = () => show(`Copy this and save it as ${name}:`, json);
  try {
    navigator.clipboard.writeText(json).then(
      () => notify(`Copied. Paste it into a file named ${name} to keep it.`),
      by,
    );
  } catch {
    by();
  }
}
