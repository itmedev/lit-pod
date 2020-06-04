import { fetch } from "./fetcher";

interface FetchFileOptions {
  fetch: typeof window.fetch;
  init: RequestInit;
}

const defaultFetchFileOptions = {
  fetch: fetch,
};

/**
 * Fetches a file at a given IRI, and returns it as a blob of data.
 *
 * @param url The IRI of the fetched file
 * @param options Fetching options: a custom fetcher and/or headers.
 */
export async function fetchFile(
  input: RequestInfo,
  options: Partial<FetchFileOptions> = defaultFetchFileOptions
): Promise<Response> {
  const config = {
    ...defaultFetchFileOptions,
    ...options,
  };
  return config.fetch(input, config.init);
}

/**
 * Deletes a file at a given IRI
 *
 * @param input The IRI of the file to delete
 */
export async function deleteFile(
  input: RequestInfo,
  options: Partial<FetchFileOptions> = defaultFetchFileOptions
): Promise<Response> {
  const config = {
    ...defaultFetchFileOptions,
    ...options,
  };
  return config.fetch(input, {
    ...options.init,
    method: "DELETE",
  });
}