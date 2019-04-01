export function createFixedHashGenerator() {
  let hashIndex = 0;
  return () => `h45h${hashIndex++}`;
}
