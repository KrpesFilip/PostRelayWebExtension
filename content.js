const observer = new MutationObserver(() => {
  const posts = Array.from(document.querySelectorAll(".job-post")).map(el => {
    const title = el.querySelector("h5")?.textContent.trim() || "No title";
    const date = el.querySelector("span")?.textContent.trim() || "";
    const link = el.dataset.url || "";
    const id = link || title + date;
    return { id, title, date, link };
  });

  
  browser.storage.local.set({ lastFiveB: posts.slice(0,5) });
});


observer.observe(document.body, { childList: true, subtree: true });
