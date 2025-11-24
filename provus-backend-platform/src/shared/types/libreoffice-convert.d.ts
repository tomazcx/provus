declare module 'libreoffice-convert' {
  export function convert(
    input: Buffer,
    format: string,
    filter: undefined,
    callback: (err: Error | null, done: Buffer) => void,
  ): void;
}
