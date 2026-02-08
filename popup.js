let currentFeed = "A"; 

const loadBtn = document.getElementById("showPosts");
const switchBtn = document.getElementById("toggleMode");
const counterSpan = document.getElementById("counter");
const otherCountSpan = document.getElementById("otherCount");
const list = document.getElementById("posts");
const titleEl = document.getElementById("feedTitle");


const statusEl = document.getElementById("status");

function showStatus(text) {
  
  statusEl.textContent = text;
  statusEl.style.visibility = "visible";

}

function hideStatus() {
  statusEl.style.visibility = "hidden";
  
}



function renderPosts(posts) {
  list.innerHTML = "";
  if (!posts.length) { list.innerHTML = "<li>No posts yet</li>"; return; }
  posts.forEach(post => {
    const li = document.createElement("li");
    const title = document.createElement("div");
    title.textContent = post.title;
    title.style.fontWeight = "bold";
    const desc = document.createElement("div");
    desc.textContent = post.desc || post.date || "";
    desc.className = "desc";
    li.appendChild(title);
    li.appendChild(desc);
    list.appendChild(li);
  });
}

function applyFeedTheme() {
  if (currentFeed === "A") {
    titleEl.textContent = "FERIT News";
    document.body.classList.remove("feed-b");
    document.body.classList.add("feed-a");
  } else {
    titleEl.textContent = "Student Jobs";
    document.body.classList.remove("feed-a");
    document.body.classList.add("feed-b");
  }
}



async function loadPosts() {
  const key = currentFeed === "A" ? "lastFiveA" : "lastFiveB";
  const data = await browser.storage.local.get(key);
  renderPosts(data[key] || []);
}




async function updateCounter() {
  const key = currentFeed === "A" ? "newCountA" : "newCountB";
  const otherKey = currentFeed === "A" ? "newCountB" : "newCountA";

  const data = await browser.storage.local.get([key, otherKey]);
  counterSpan.textContent = data[key] || 0;
  otherCountSpan.textContent = data[otherKey] || 0;
}


loadBtn.addEventListener("click", async () => {
  showStatus("Loading posts…");
  browser.runtime.sendMessage({ action: "checkNow" });

  
  setTimeout(() => {
    loadPosts();
    updateCounter();
    hideStatus();
  }, 500);
});


switchBtn.addEventListener("click", async () => {
  currentFeed = currentFeed === "A" ? "B" : "A";
  
  applyFeedTheme();
  await updateCounter();
  loadPosts();
});

document.getElementById("resetCounter").addEventListener("click", async () => {
  const key = currentFeed === "A" ? "newCountA" : "newCountB";
  await browser.storage.local.set({ [key]: 0 });
  await updateCounter();

  
  browser.runtime.sendMessage({ action: "updateBadge" });
});

applyFeedTheme();
updateCounter();
loadPosts();



updateCounter();
loadPosts();
