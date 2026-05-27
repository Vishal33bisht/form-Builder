import { env } from "~/env";

export const apiDocsUrl =
  env.NEXT_PUBLIC_API_DOCS_URL ||
  env.NEXT_PUBLIC_API_URL?.replace(/\/trpc\/?$/, "/docs") ||
  "http://localhost:8000/docs";
