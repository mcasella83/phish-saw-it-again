import { useApiCounter } from './api-context';

let incrementApiCallCount: (() => void) | null = null;

export function setApiCallCounter(increment: () => void) {
  incrementApiCallCount = increment;
}

export async function getShowsByUsername(username: string) {
  console.log("Making API request for username:", username);
  incrementApiCallCount?.();
  const response = await fetch(`/api/phish/shows?username=${username}`);

  console.log("response=", response);
  if (!response.ok) {
    throw new Error("Failed to fetch shows");
  }
  const data = await response.json();
  console.log("API response data:", data);

  if (data.error && data.error_message) {
    console.log("throwing error");
    throw new Error(data.error_message);
  }

  return data;
}

export async function getShowSetList(id: string){
  console.log("Making API request for id:", id);
  incrementApiCallCount?.();
  const response = await fetch(`/api/phish/showsetlist/${id}`);

  console.log("response=", response);
  if (!response.ok) {
    throw new Error("Failed to fetch show setlists");
  }
  const data = await response.json();
  console.log("API response data:", data);

  if (data.error && data.error_message) {
    console.log("throwing error");
    throw new Error(data.error_message);
  }

  return data;
}