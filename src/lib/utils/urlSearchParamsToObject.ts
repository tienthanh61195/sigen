function paramsToObject(entries: IterableIterator<[string, string]>) {
  const result: Record<string, any> = {}
  for (const [key, value] of entries) { // each 'entry' is a [key, value] tupple
    result[key] = value;
  }
  return result;
}

export default function urlSearchParamsToObject(url: string) {
  const search = url.substring(url.lastIndexOf('?') + 1);
  const urlParams = new URLSearchParams(url);
  const entries = urlParams.entries(); //returns an iterator of decoded [key,value] tuples
  return paramsToObject(entries);
}