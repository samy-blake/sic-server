function getRandomString(s: number) {
  if (s % 2 == 1) {
    throw new Deno.errors.InvalidData("Only even sizes are supported");
  }
  const buf = new Uint8Array(s / 2);
  crypto.getRandomValues(buf);
  let ret = "";
  for (let i = 0; i < buf.length; ++i) {
    ret += ("0" + buf[i].toString(16)).slice(-2);
  }
  return ret;
}

function shuffleArrayStrings(arr: string[]): string[] {
  const copy = [...arr]; // Original nicht verändern

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // zufälliger Index 0..i
    [copy[i], copy[j]] = [copy[j], copy[i]]; // swap
  }

  return copy;
}

export { getRandomString, shuffleArrayStrings };
