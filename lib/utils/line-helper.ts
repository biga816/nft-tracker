import { config } from "https://deno.land/x/dotenv@v3.1.0/mod.ts";

const { LINE_TOKEN, LINE_URL } = config();

export async function sendLineNotify(params: {
  message: string;
  imageThumbnail?: string;
  imageFullsize?: string;
}): Promise<void> {
  const body = new URLSearchParams({
    ...params,
  });

  await fetch(LINE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LINE_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  console.log(JSON.stringify(params, null, 2));
}
