

import { POST as webhookHandler } from "./webhook/xendit";

export default async function handler(req, res) {
  if (req.method === "POST") {
    return webhookHandler(req, res);
  }

  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}