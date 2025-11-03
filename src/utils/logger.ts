const info = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.log("[info]", ...args);
};

const warn = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.warn("[warn]", ...args);
};

const error = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.error("[error]", ...args);
};

export default { info, warn, error };
