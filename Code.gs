// ======================================================================
// PASTE YOUR GOOGLE DRIVE FOLDER ID BETWEEN THE QUOTES BELOW.
// (See SETUP.md, Step 2, for how to find it.)
// ======================================================================
const DRIVE_FOLDER_ID = "PASTE_YOUR_DRIVE_FOLDER_ID_HERE";

const PAPERS_SHEET_NAME = "Papers";
const BLOG_SHEET_NAME = "Blog";
const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB safety limit — see SETUP.md if you need this larger

// ---------------------------------------------------------------------
// doGet — the website calls this to READ the current list of papers or
// blog posts, straight from the Sheet, live (no caching delay).
// ---------------------------------------------------------------------
function doGet(e) {
  try {
    const type = ((e.parameter && e.parameter.type) || "papers").toLowerCase();
    const sheetName = (type === "blogs" || type === "blog") ? BLOG_SHEET_NAME : PAPERS_SHEET_NAME;
    return jsonOutput({ success: true, rows: readSheet(sheetName) });
  } catch (err) {
    return jsonOutput({ success: false, error: err.message });
  }
}

// ---------------------------------------------------------------------
// doPost — the website calls this to WRITE a new paper or blog post.
// ---------------------------------------------------------------------
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === "addPaper") return jsonOutput(addPaper(data));
    if (data.action === "addBlog") return jsonOutput(addBlog(data));
    return jsonOutput({ success: false, error: "Unknown action: " + data.action });
  } catch (err) {
    return jsonOutput({ success: false, error: err.message });
  }
}

function addPaper(data) {
  if (!data.title) throw new Error("Title is required.");
  if (!data.fileBase64) throw new Error("A file is required.");

  const bytes = Utilities.base64Decode(data.fileBase64);
  if (bytes.length > MAX_FILE_BYTES) {
    throw new Error("That file is larger than the " + (MAX_FILE_BYTES / (1024 * 1024)) + "MB limit.");
  }

  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const blob = Utilities.newBlob(bytes, data.fileType || "application/octet-stream", data.fileName || data.title);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const fileUrl = file.getUrl();

  const sheet = getSheet(PAPERS_SHEET_NAME);
  sheet.appendRow([data.title, data.year || "", data.journal || "", data.doi || "", fileUrl, new Date()]);
  SpreadsheetApp.flush();

  return { success: true, rows: readSheet(PAPERS_SHEET_NAME) };
}

function addBlog(data) {
  if (!data.title) throw new Error("Title is required.");
  if (!data.content) throw new Error("Post content is required.");

  const date = data.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  const sheet = getSheet(BLOG_SHEET_NAME);
  sheet.appendRow([data.title, date, data.content, data.link || "", new Date()]);
  SpreadsheetApp.flush();

  return { success: true, rows: readSheet(BLOG_SHEET_NAME) };
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('No tab named "' + name + '" was found in this Sheet.');
  return sheet;
}

function readSheet(name) {
  const sheet = getSheet(name);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map((h) => String(h).trim().toLowerCase());
  return values
    .slice(1)
    .filter((row) => row.some((cell) => String(cell).trim() !== ""))
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        let v = row[i];
        if (v instanceof Date) v = Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
        obj[h] = v === undefined || v === null ? "" : String(v);
      });
      return obj;
    })
    .reverse(); // newest first, so a fresh upload appears at the top instantly
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
