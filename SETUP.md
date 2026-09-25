# Setup Guide — read this top to bottom, in order

This version removes every manual step from before. Once it's connected:
- Uploading a paper on **upload.html** saves the file to **Google Drive**, adds a
  row to your **Google Sheet**, and shows the paper on the same page **instantly**
  — no copy-pasting, no waiting.
- Writing a post on the new **write-post.html** page does the same for blog posts.
- There's no Cloudinary and no "Publish to web" CSV link anymore (both are gone) —
  everything now goes through one small, free Google script that reads and writes
  your Sheet directly, live.

You'll do three things: (1) set up a Google Sheet, (2) set up a Google Drive
folder + a small Google script, (3) paste one link into `config.js` and put the
`simple-website` folder online. Takes about 15–20 minutes the first time.

---

## Step 1 — Create your Google Sheet

1. Go to **https://sheets.google.com** and create a new blank spreadsheet. Name it
   whatever you like, e.g. "Research Site Data".
2. Rename the first tab (bottom-left) to **Papers** (exact spelling, capital P).
   In row 1, type these column headers, one per cell, in this exact order:
   ```
   Title | Year | Journal | DOI | File Link | Timestamp
   ```
3. Click the **+** at the bottom to add a second tab. Rename it **Blog** (exact
   spelling). In row 1, type these headers, in this exact order:
   ```
   Title | Date | Content | Link | Timestamp
   ```
4. That's it for the Sheet for now — leave both tabs otherwise empty. Keep this
   Sheet's tab open in your browser; you'll come back to it in Step 3.

*(You do **not** need to do "File → Publish to web" this time — that step, and the
CSV links it produced, are no longer used.)*

## Step 2 — Create a Google Drive folder for the paper files

1. Go to **https://drive.google.com**.
2. Click **+ New → New folder**. Name it something like "Research Papers".
3. Open the folder, and look at your browser's address bar. It will look like:
   ```
   https://drive.google.com/drive/folders/1AbCdeFGhijKLmnoPQRstuVWxyz
   ```
4. Copy the part **after** `/folders/` — that long string of letters/numbers
   (e.g. `1AbCdeFGhijKLmnoPQRstuVWxyz`). That's your **Folder ID**. Save it
   somewhere (a Notepad file) — you'll need it in the next step.

## Step 3 — Add the Google Apps Script (this is what makes it automatic)

1. Go back to your Google **Sheet** from Step 1.
2. Click **Extensions → Apps Script** in the menu bar. A new tab opens with a
   code editor.
3. You'll see a file called `Code.gs` with some placeholder text like
   `function myFunction() {}`. **Select all of that text and delete it.**
4. Open the `google-apps-script/Code.gs` file from the folder I've given you,
   copy its **entire** contents, and paste it into that empty editor.
5. Near the top, find this line:
   ```
   const DRIVE_FOLDER_ID = "PASTE_YOUR_DRIVE_FOLDER_ID_HERE";
   ```
   Replace `PASTE_YOUR_DRIVE_FOLDER_ID_HERE` with the Folder ID you copied in
   Step 2, keeping the quote marks. For example:
   ```
   const DRIVE_FOLDER_ID = "1AbCdeFGhijKLmnoPQRstuVWxyz";
   ```
6. Click the **Save** icon (or press Ctrl+S).
7. Now click the blue **Deploy** button (top-right) → **New deployment**.
8. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
9. Fill in:
   - **Description**: anything, e.g. "Site backend"
   - **Execute as**: **Me** (your own Google account)
   - **Who has access**: **Anyone**
10. Click **Deploy**.
11. Google will ask you to **authorize** the script. Click **Authorize access**,
    choose your Google account, and if you see a screen saying "Google hasn't
    verified this app" — this is completely normal for a script you wrote
    yourself. Click **Advanced**, then **Go to [your project name] (unsafe)**,
    then **Allow**.
12. You'll now see a **Web app URL** that looks like:
    ```
    https://script.google.com/macros/s/AKfycb.../exec
    ```
    **Copy this entire URL.** This is the one link that connects your website
    to your Sheet and Drive.

*(If you ever edit the script later, you must repeat Deploy → **Manage
deployments** → edit (pencil icon) → change Version to "New version" → Deploy,
or your changes won't go live.)*

## Step 4 — Connect the website to it

1. Open the `simple-website` folder I've given you, and open **config.js** in
   Notepad (or any plain text editor).
2. Replace `PASTE_YOUR_WEB_APP_URL_HERE` with the Web app URL you copied in
   Step 3, keeping the quote marks:
   ```
   APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycb.../exec",
   ```
3. Save the file.

## Step 5 — Put the site online (Cloudflare Pages — same place as before)

Since your site is already live on Cloudflare Pages, you just need to upload
this updated version over it:

1. Go to **https://dash.cloudflare.com** and log in.
2. Go to **Workers & Pages** → click your existing project (the one behind
   `restless-shape-48bf.bbdave1357.workers.dev`).
3. Go to the **Deployments** tab → look for a button like **"Create deployment"**
   or **"Upload assets"**.
4. Drag the entire `simple-website` folder (or all the files inside it — index.html,
   publications.html, blog.html, upload.html, write-post.html, style.css, profile.jpg,
   config.js) onto the upload area.
5. Wait for it to finish — it publishes to the same address you already have.

*(Starting fresh instead? Go to Workers & Pages → Create → Pages → Upload assets,
and drag the folder in the same way. You'll get a new `*.pages.dev` address.)*

## Step 6 — Test it

1. Open your live site → **Upload a Paper**. Fill in a title, drag a PDF into the
   box (or click it to browse your computer), click **Publish paper**. Within a
   couple of seconds it should say "Published!" and the paper should appear in
   the list right below, with the counter above updated.
2. Do the same on **Write a Post** for a blog post.
3. Open your Google Sheet — you'll see the new row appeared automatically in the
   **Papers** or **Blog** tab. Open your Google Drive folder — you'll see the
   uploaded file sitting there, viewable by anyone with the link.

## Step 7 — Point people to it from your WordPress blog

Your blog at **bb4dave.wordpress.com** is on a WordPress.com plan that blocks the
custom upload form itself from running inside a WordPress page or post (it strips
out that kind of code for security, unless you're on their Business plan). The
simple, free way around this: add an ordinary **link** from WordPress to your
Cloudflare site.

1. In WordPress, edit any page or post (or your site's menu).
2. Add a normal text/button link, e.g. "Read my Research Papers", pointing to:
   ```
   https://restless-shape-48bf.bbdave1357.workers.dev/publications.html
   ```
   and another one, e.g. "Upload a Paper", pointing to `.../upload.html`.
3. That's it — visitors click through from your WordPress blog to the live,
   fully working tool.

---

## Troubleshooting

- **"The site isn't connected yet" message**: `config.js` still has the
  placeholder text — redo Step 4.
- **Counters show "—"**: usually means the Web app URL in `config.js` is wrong,
  or the deployment's "Who has access" wasn't set to **Anyone**. Recheck Step 3.
- **"No tab named Papers/Blog was found"**: your Sheet tabs aren't named exactly
  `Papers` and `Blog` — check spelling and capitalization.
- **Upload fails partway / times out**: very large files can be slow through this
  method. The limit is set to 25MB in `Code.gs` (`MAX_FILE_BYTES`) — you can raise
  it, but very large files (40MB+) risk failing; if that happens often, say so and
  we can switch large files to a different storage method.
- **A change you made to Code.gs doesn't seem to apply**: you edited the script
  but didn't redeploy — see the note at the end of Step 3 ("Manage deployments" →
  New version).
