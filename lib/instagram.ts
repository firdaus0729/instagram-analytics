import { InstagramAccount } from "@/models/InstagramAccount";
import { connectToDatabase } from "./db";

const META_OAUTH_BASE = "https://www.facebook.com/v21.0/dialog/oauth";
const META_TOKEN_ENDPOINT = "https://graph.facebook.com/v21.0/oauth/access_token";
const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

export function buildInstagramLoginUrl(state: string) {
  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !redirectUri) {
    throw new Error("META_APP_ID or INSTAGRAM_REDIRECT_URI is not configured");
  }

  const url = new URL(META_OAUTH_BASE);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  // Minimal required scope for Instagram Graph API access
  // pages_show_list is required to list Facebook Pages and access Instagram Business accounts
  url.searchParams.set("scope", "pages_show_list");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeCodeForShortLivedToken(code: string) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!appId || !appSecret || !redirectUri) {
    throw new Error(
      "META_APP_ID, META_APP_SECRET, or INSTAGRAM_REDIRECT_URI is not configured"
    );
  }

  const url = new URL(META_TOKEN_ENDPOINT);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);

  const res = await fetch(url.toString(), { 
    method: "GET",
    signal: AbortSignal.timeout(30000) // 30 second timeout
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to exchange code: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  return data;
}

export async function exchangeShortForLongLivedToken(
  shortLivedToken: string
) {
  const appSecret = process.env.META_APP_SECRET;
  const appId = process.env.META_APP_ID;

  if (!appId || !appSecret) {
    throw new Error("META_APP_ID or META_APP_SECRET is not configured");
  }

  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const res = await fetch(url.toString(), { 
    method: "GET",
    signal: AbortSignal.timeout(30000) // 30 second timeout
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to exchange for long-lived token: ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  return data;
}

export async function refreshLongLivedToken(longLivedToken: string) {
  const appSecret = process.env.META_APP_SECRET;
  const appId = process.env.META_APP_ID;

  if (!appId || !appSecret) {
    throw new Error("META_APP_ID or META_APP_SECRET is not configured");
  }

  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", longLivedToken);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to refresh long-lived token: ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  return data;
}

export async function ensureValidLongLivedToken(instagramAccountId: string) {
  await connectToDatabase();
  const account = await InstagramAccount.findById(instagramAccountId);
  if (!account) throw new Error("Instagram account not found");

  const now = new Date();
  if (
    account.tokenExpiresAt &&
    account.tokenExpiresAt.getTime() - now.getTime() < 1000 * 60 * 60 * 24 * 5
  ) {
    // Refresh if less than 5 days left
    const currentToken = account.longLivedToken ?? account.accessToken;
    const refreshed = await refreshLongLivedToken(currentToken);
    account.longLivedToken = refreshed.access_token;
    account.tokenExpiresAt = new Date(
      Date.now() + refreshed.expires_in * 1000
    );
    await account.save();
  }

  return account.longLivedToken ?? account.accessToken;
}


