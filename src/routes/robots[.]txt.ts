import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/robots.txt")({
  GET: async () => {
    return new Response(
      `User-agent: *\nAllow: /\n\nSitemap: https://fashionlovabety.store/sitemap.xml`,
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  },
});
