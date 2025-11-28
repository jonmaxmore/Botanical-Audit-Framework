/**
 * Bridge file so existing tooling that looks for `.lintstagedrc.js`
 * will reuse the canonical CommonJS config.
 */
import config from './.lintstagedrc.cjs';

export default config;
