const MAX = 6;
const KEY = "autoch_recently_viewed";

export function useRecentlyViewed() {
  const get = (): number[] => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  };
  const add = (id: number) => {
    const list = [id, ...get().filter(x => x !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  };
  return { get, add };
}
