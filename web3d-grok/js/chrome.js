/* Fight chrome. Pause / New / P key. Same idea as FrameForge2D extras.js. */
export function bindChrome(state) {
  const pauseBtn = document.getElementById("btn-pause");
  const toggle = () => {
    if (!state.match) return;
    state.match.paused = !state.match.paused;
    if (pauseBtn) pauseBtn.textContent = state.match.paused ? "Play" : "Pause";
  };
  if (pauseBtn) pauseBtn.addEventListener("click", (e) => { e.preventDefault(); toggle(); });
  const neu = document.getElementById("btn-new");
  if (neu) neu.addEventListener("click", (e) => { e.preventDefault(); location.reload(); });
  const info = document.getElementById("btn-info");
  if (info) info.addEventListener("click", () => document.getElementById("info")?.classList.toggle("open"));
  addEventListener("keydown", (e) => {
    if (e.key !== "p" && e.key !== "P" && e.key !== "Escape") return;
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    e.preventDefault();
    toggle();
  });
}
