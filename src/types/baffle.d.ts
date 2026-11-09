declare module 'baffle' {
  interface BaffleOptions {
    characters?: string | string[];
    exclude?: string[];
    speed?: number;
  }
  interface Baffle {
    start(): Baffle;
    stop(): Baffle;
    reveal(duration?: number, delay?: number): Baffle;
    text(fn: (text: string) => string): Baffle;
    set(options: BaffleOptions): Baffle;
    once(): Baffle;
  }
  function baffle(elements: string | Element | Element[] | NodeList, options?: BaffleOptions): Baffle;
  export default baffle;
}
