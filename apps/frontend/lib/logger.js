/* eslint-disable no-console */
export const createLogger = (scope = 'frontend') => {
  const prefix = `[${scope}]`;

  return {
    debug: (...args) => console.debug(prefix, ...args),
    info: (...args) => console.info(prefix, ...args),
    warn: (...args) => console.warn(prefix, ...args),
    error: (...args) => console.error(prefix, ...args)
  };
};

export const logger = createLogger('frontend');
