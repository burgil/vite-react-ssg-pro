/**
 * Node.js ESM module hook to stub out binary asset imports during SSR prerendering.
 * Vite transforms these imports into hashed URL strings at build time,
 * but Node.js/tsx cannot load binary files as ES modules.
 */
export async function load(url, context, nextLoad) {
    if (/\.(srt|mp3|mp4|wav|ogg|webm|png|jpg|jpeg|gif|webp|svg|woff2?|ttf|eot|avif)(\?.*)?$/.test(url)) {
        return { shortCircuit: true, format: 'module', source: 'export default ""' };
    }
    return nextLoad(url, context);
}
