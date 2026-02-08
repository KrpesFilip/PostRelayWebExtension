const FEED_A_URL = "https://www.ferit.unios.hr/studenti/#objave";
const FEED_B_URL = "https://studentski-poslovi.hr/poslovi/osijek?category=fizicki-poslovi&province=sve-zupanije&activated_from=all&min_hour_rate=";


const CHECK_INTERVAL_MINUTES = 30;


async function ensureSingleAlarm() {
  const existing = await browser.alarms.get("checkNews");

  if (!existing) {
    browser.alarms.create("checkNews", {
      periodInMinutes: CHECK_INTERVAL_MINUTES
    });
  }
}

ensureSingleAlarm();

browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "checkNow") {
    checkForUpdates();
  }
});




async function updateBadge() {
  const data = await browser.storage.local.get(["newCountA", "newCountB"]);
  const text = (data.newCountA || data.newCountB) ? `${data.newCountA || 0};${data.newCountB || 0}` : "";
  browser.browserAction.setBadgeText({ text });
  browser.browserAction.setBadgeBackgroundColor({ color: "#032a97" });
}


async function fetchFeedA() {
  try {
    const res = await fetch(FEED_A_URL);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const postsContainer = doc.querySelector("#news");
    if (!postsContainer) return [];

    const postElements = postsContainer.querySelectorAll(".objava a.box");
    return Array.from(postElements).map(el => ({
      id: el.id || el.href,
      title: el.querySelector("h3")?.textContent.trim() || "No title",
      desc: el.querySelector("p")?.textContent.trim() || "",
      link: el.href
    }));

  } catch (err) {
    console.error("Feed A fetch failed:", err);
    return [];
  }
}


async function fetchFeedB() {
  try {
    const res = await fetch(FEED_B_URL);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const postElements = doc.querySelectorAll(".job-post");
    return Array.from(postElements).map(el => {
      const title = el.querySelector("h5")?.textContent.trim() || "No title";
      const date = el.querySelector("span")?.textContent.trim() || "";
      const link = el.dataset.url || "";
      const id = link || title + date;
      return { id, title, date, link };
    });

  } catch (err) {
    console.error("Feed B fetch failed:", err);
    return [];
  }
}


async function checkForUpdates() {

  const postsA = await fetchFeedA();
  const storedA = await browser.storage.local.get(["seenIdsA", "newCountA", "lastFiveA"]);
  const seenIdsA = storedA.seenIdsA || [];
  let newCountA = storedA.newCountA || 0;
  const newPostsA = postsA.filter(p => !seenIdsA.includes(p.id));
  if (newPostsA.length) newCountA += newPostsA.length;

  await browser.storage.local.set({
    seenIdsA: postsA.map(p => p.id),
    newCountA,
    lastFiveA: postsA.slice(0,5)
  });

 
  const postsB = await fetchFeedB();
  const storedB = await browser.storage.local.get(["seenIdsB", "newCountB", "lastFiveB"]);
  const seenIdsB = storedB.seenIdsB || [];
  let newCountB = storedB.newCountB || 0;
  const newPostsB = postsB.filter(p => !seenIdsB.includes(p.id));
  if (newPostsB.length) newCountB += newPostsB.length;

  await browser.storage.local.set({
    seenIdsB: postsB.map(p => p.id),
    newCountB,
    lastFiveB: postsB.slice(0,5)
  });

  updateBadge();
}


browser.alarms.onAlarm.addListener(checkForUpdates);

browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "updateBadge") {
    updateBadge();
  }
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.newCountA || changes.newCountB)) {
    updateBadge();
  }
});



checkForUpdates();
updateBadge();
