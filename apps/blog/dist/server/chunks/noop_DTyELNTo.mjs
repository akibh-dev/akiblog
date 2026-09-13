globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as verifyOptions, s as isESMImportedImage, t as baseService } from "./service_VnbTjK8t.mjs";
//#region ../../node_modules/.pnpm/astro@7.3.2_@emnapi+core@1.11.1_@emnapi+runtime@1.11.3_@types+node@22.20.2_jiti@2.7.0_tsx@4.23.13/node_modules/astro/dist/assets/services/noop.js
var noop_default = {
	...baseService,
	propertiesToHash: ["src"],
	async validateOptions(options) {
		if (isESMImportedImage(options.src) && options.src.format === "svg") options.format = "svg";
		else delete options.format;
		verifyOptions(options);
		return options;
	},
	async transform(inputBuffer, transformOptions) {
		return {
			data: inputBuffer,
			format: transformOptions.format
		};
	}
};
//#endregion
export { noop_default as default };
