globalThis.process ??= {};
globalThis.process.env ??= {};
import { t as getInstalledRenderScope } from "./entrypoints_DxPAaSGr.mjs";
import { C as removeBase, S as prependForwardSlash, s as isESMImportedImage, x as joinPaths } from "./service_VnbTjK8t.mjs";
import { n as propsToFilename, t as hashTransform } from "./assets_S6fyrMdL.mjs";
//#region ../../node_modules/.pnpm/astro@7.3.2_@emnapi+core@1.11.1_@emnapi+runtime@1.11.3_@types+node@22.20.2_jiti@2.7.0_tsx@4.23.13/node_modules/astro/dist/core/render-scope/record.js
function recordStaticImage(image) {
	getInstalledRenderScope()?.getStore()?.staticImages?.push(image);
}
//#endregion
//#region ../../node_modules/.pnpm/@astrojs+cloudflare@14.3.1_@types+node@22.20.2_astro@7.3.2_@emnapi+core@1.11.1_@emnapi+_d24f6ce86edb5b359f44fba36322f67d/node_modules/@astrojs/cloudflare/dist/utils/static-image-collection.js
function installAddStaticImage(config) {
	if (globalThis.astroAsset?.addStaticImage) return;
	if (!globalThis.astroAsset) globalThis.astroAsset = { referencedImages: /* @__PURE__ */ new Set() };
	globalThis.astroAsset.addStaticImage = (options, hashProperties, _originalFSPath) => {
		if (!globalThis.astroAsset.staticImages) globalThis.astroAsset.staticImages = /* @__PURE__ */ new Map();
		const ESMImportedImageSrc = isESMImportedImage(options.src) ? options.src.src : options.src;
		const finalOriginalPath = removeBase(removeBase(ESMImportedImageSrc, config.base), config.assetsPrefix ?? "");
		const hash = hashTransform(options, config.imageServiceEntrypoint, hashProperties);
		let finalFilePath;
		let transformsForPath = globalThis.astroAsset.staticImages.get(finalOriginalPath);
		const transformForHash = transformsForPath?.transforms.get(hash);
		if (transformsForPath && transformForHash) finalFilePath = transformForHash.finalPath;
		else {
			finalFilePath = prependForwardSlash(joinPaths(isESMImportedImage(options.src) ? "" : config.buildAssets, prependForwardSlash(propsToFilename(finalOriginalPath, options, hash))));
			if (!transformsForPath) {
				globalThis.astroAsset.staticImages.set(finalOriginalPath, {
					originalSrcPath: _originalFSPath,
					transforms: /* @__PURE__ */ new Map()
				});
				transformsForPath = globalThis.astroAsset.staticImages.get(finalOriginalPath);
			}
			transformsForPath.transforms.set(hash, {
				finalPath: finalFilePath,
				transform: options
			});
		}
		recordStaticImage({
			originalPath: finalOriginalPath,
			hash,
			finalPath: finalFilePath,
			originalSrcPath: _originalFSPath,
			transform: options
		});
		if (config.assetsPrefix) return encodeURI(joinPaths(config.assetsPrefix, finalFilePath));
		return encodeURI(prependForwardSlash(joinPaths(config.base, finalFilePath)));
	};
}
//#endregion
export { installAddStaticImage };
