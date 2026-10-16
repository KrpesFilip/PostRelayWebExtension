# PostRelay

**Firefox extension that tracks new posts on two websites so you don't miss them**

PostRelay checks the FERIT student news page and the Osijek student jobs listings in the background, counts posts you haven't seen yet, and shows the latest ones in a small popup. The toolbar badge shows how many new posts each site has.

> Author: Filip Krpes.

## Features

- Background check of both sites every 30 minutes
- Toolbar badge with new post counts for each feed (`FERIT;Jobs`)
- Popup with the five latest posts from the selected feed
- One-click switch between the two feeds, each with its own color theme
- Manual refresh button to check right away
- Reset button to mark the current feed as read
- Everything is stored locally in the browser; nothing is sent to an outside server

## Monitored sites

| Feed | Source |
|---|---|
| FERIT News | [ferit.unios.hr/studenti](https://www.ferit.unios.hr/studenti/#objave), student announcements |
| Student Jobs | [studentski-poslovi.hr](https://studentski-poslovi.hr/poslovi/osijek), physical jobs in Osijek |

## Tech stack

| Area | Technology |
|---|---|
| Platform | Firefox WebExtension (Manifest V2) |
| Language | JavaScript, HTML, CSS |
| Browser APIs | `alarms`, `storage.local`, `browserAction`, `runtime` messaging |
| Parsing | `fetch` + `DOMParser` |

## Architecture

```
FERIT site        Student jobs site
     │                    │
     └──── fetch + DOMParser (every 30 min or on demand)
                    │
                    ▼
            background.js ──── storage.local  (seen post IDs, new counts, last 5 posts)
                    │                  ▲
                    ▼                  │
             toolbar badge       popup.js (read posts, switch feed, reset counter)
```

On each check, the background script compares the fetched post IDs with the ones it saw last time. Any post with an unknown ID adds to that feed's new count.


## Usage

- **Load button** checks both sites now and shows the latest posts.
- **Switch button** toggles between FERIT News and Student Jobs. The small counter next to it shows new posts on the other feed.
- **Check button** resets the new post counter for the current feed.

