// ============================================================
// FILL IN THIS ONE VALUE — see SETUP.md, Step 4, for how to get it.
// ============================================================

const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyh6DfDTtGa2TEvZoP4ednIQ_I9Zy3TOhY337EOB4hkorDVNaV726KZmXQXBFkjdsRn2w/exec",
};

// ---- Shared helpers used by every page (no need to edit below this line) ----

function isConfigured() {
  return CONFIG.APPS_SCRIPT_URL && CONFIG.APPS_SCRIPT_URL.indexOf("PASTE_") !== 0;
}

async function fetchRows(type) {
  if (!isConfigured()) {
    throw new Error("The site isn't connected yet — paste your Web App URL into config.js. See SETUP.md.");
  }
  const res = await fetch(CONFIG.APPS_SCRIPT_URL + "?type=" + encodeURIComponent(type), { cache: "no-store" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Could not load data.");
  return data.rows;
}

async function postToScript(payload) {
  if (!isConfigured()) {
    throw new Error("The site isn't connected yet — paste your Web App URL into config.js. See SETUP.md.");
  }
  const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    // text/plain avoids the browser sending a CORS "preflight" request, which
    // Apps Script Web Apps don't handle — keep this header exactly as-is.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Something went wrong.");
  return data.rows;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}
