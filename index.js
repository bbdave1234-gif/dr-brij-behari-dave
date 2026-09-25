export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle paper upload
    if (url.pathname === "/api/upload-paper" && request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("paper");

        if (!file) {
          return new Response(JSON.stringify({ error: "No file provided" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const filename = `papers/${Date.now()}-${file.name}`;

        await env.PAPERS_BUCKET.put(filename, file.stream(), {
          httpMetadata: { contentType: file.type },
        });

        return new Response(JSON.stringify({ 
          success: true, 
          file: filename 
        }), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // For all other requests, serve the static website
    return env.ASSETS.fetch(request);
  }
};