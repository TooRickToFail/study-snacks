import { serve } from "https://deno.land/std/http/server.ts";
import {
  S3Client,
  GetObjectCommand,
} from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID")!,
    secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // allow all domains; or set your Netlify URL for more security
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    // Preflight request
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const { searchParams } = new URL(req.url);
  const key = decodeURIComponent(searchParams.get("key") || "");
  if (!key) return new Response("Missing file key", { status: 400, headers: corsHeaders });

  try {
    const command = new GetObjectCommand({
      Bucket: "study-snacks",
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 120 });

    return new Response(JSON.stringify({ url }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return new Response("Failed to generate URL", { status: 500, headers: corsHeaders });
  }
});
