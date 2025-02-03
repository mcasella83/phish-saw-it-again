import {
  PhishShowApiResponse,
  PhishShowSetlist,
  PhishSetlistApiResponse,
} from "./types";

export async function getShowsByUsername(
  username: string,
): Promise<PhishShowApiResponse> {
  console.log("Making API request for username:", username);
  const response = await fetch(`/api/phish/shows?username=${username}`, {
    headers: {
      Accept: "application/json; charset=utf-8",
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  console.log("response=", response);
  if (!response.ok) {
    throw new Error("Failed to fetch shows");
  }
  const data: PhishShowApiResponse = await response.json();
  console.log("API response data:", data);

  if (data.error && data.error_message) {
    console.log("throwing error");
    throw new Error(data.error_message);
  }

  return data;
}

export async function getShowSetList(id: string) {
  console.log("Making API request for id:", id);
  const response = await fetch(`/api/phish/showsetlist/${id}`, {
    headers: {
      Accept: "application/json; charset=utf-8",
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  console.log("response=", response);
  if (!response.ok) {
    throw new Error("Failed to fetch show setlists");
  }
  const apiResponse: PhishSetlistApiResponse = await response.json();
  console.log("API response data:", apiResponse);

  if (apiResponse.error && apiResponse.error_message) {
    console.log("throwing error");
    throw new Error(apiResponse.error_message);
  }

  const setlist: PhishShowSetlist = { date: apiResponse.data.showdate }

  return setlist;
}
