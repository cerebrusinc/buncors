import { Handler } from "bunrest/src/server/request";
import { BunResponse } from "bunrest/src/server/response";

/**
 * ```ts
 * import type { CorsOptions } from "buncors";
 * ```
 * The cors options interface enabling you to take full control of your bunrest server's security! If not set, the default headers set will be:
 *
 * ```txt
 * Access-Control-Allow-Origin: *
 * Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
 * Access-Control-Allow-Headers: Content-Type
 * Access-Control-Max-Age: 5
 * ```
 */
interface CorsOptions {
	/**Sets the `Access-Control-Allow-Origin` header; Defaults to `*` but if set, it will dynamically return the correct origin or the first origin is not accetped  */
	origins?: string | string[];
	/**Sets the `Access-Control-Allow-Methods` header; Defaults to `GET,HEAD,PUT,PATCH,POST,DELETE` */
	methods?: string[];
	/**Sets the `Access-Control-Allow-Headers` header; Defaults to `Content-Type` and will always append `Content-Type` to the allowed headers */
	allowedHeaders?: string[];
	/**Sets the `Access-Control-Max-Age` header in **seconds**; Defaults to `5` */
	maxAge?: number;
	/**Sets the `Access-Control-Allow-Credentials` header; This header is **NOT SET** unless you give it a value */
	allowCredentials?: boolean;
	/**Sets the `Access-Control-Expose-Headers` header; This header is **NOT SET** unless you give it a value */
	exposedHeaders?: string[];
}

/**
 * The cors middleware that enables a `bunrest` server to handle cors requests. It also handles preflight requests :)
 *
 * ### Default Response Headers
 * If no options are provided, the response headers will be as follows:
 *
 * ```txt
 * Access-Control-Allow-Origin: *
 * Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
 * Access-Control-Allow-Headers: Content-Type
 * Access-Control-Max-Age: 5
 * ```
 *
 * **NOTE:** The allow headers will always append `Content-Type` to your response headers so no need to add it to the list
 *
 * ### Usage Example
 *
 * ```ts
 * import server from "bunrest";
 * import cors from "buncors";
 * const app = server();
 *
 * app.post("/auth", cors(), async (req, res) => {
 *      // some processing code
 *      res.status(200).json({ success: true });
 * });
 *
 * app.listen(Bun.env.PORT, () => {
 *      console.log(`[startup]: Server running on port "${Bun.env.PORT}"`);
 * });
 * ```
 *
 * ### Preflight Example
 *
 * ```ts
 * import server from "bunrest";
 * import cors from "buncors";
 * const app = server();
 *
 * app.post("/auth", async (req, res) => {
 *      // some processing code
 *      res.status(200).json({ success: true });
 * });
 *
 * app.options("/auth", cors({
 *      allowedHeaders: ["X-TOKEN"],
 *      methods: ["POST"],
 *      origins: ["https://www.cerebrus.dev"]
 * }));
 *
 * app.listen(Bun.env.PORT, () => {
 *      console.log(`[startup]: Server running on port "${Bun.env.PORT}"`);
 * });
 * ```
 *
 * @param options `CorsOptions`; Defaults to undefined with presets.
 * @returns a middleware function; type `Handler`
 * @version bunrest : ^1.3.6
 */
function cors(options?: CorsOptions): Handler {
	const origins: string | string[] = options?.origins ? options.origins : "*";
	const methods: string[] = options?.methods
		? options.methods
		: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"];
	const allowedHeaders: string[] = options?.allowedHeaders
		? [...options.allowedHeaders, "Content-Type"]
		: ["Content-Type"];
	const maxAge: number = options?.maxAge ? options.maxAge : 5;
	const allowCredentials: boolean | undefined = options?.allowCredentials
		? options.allowCredentials
		: undefined;
	const exposedHeaders: string[] | undefined = options?.exposedHeaders
		? options.exposedHeaders
		: undefined;

	const _isOrigin = (path: string): boolean => {
		if (Array.isArray(origins)) return origins.includes(path);
		else return path === origins;
	};

	const _isValidMethod = (method: string): boolean => {
		return methods.includes(method);
	};

	const _isValidRequestHeaders = (headers: string): boolean => {
		const headersArr = headers.split(",");
		const allowedHeadersArr = allowedHeaders.join(",").toLowerCase().split(",");
		let valid: boolean = true;

		headersArr.map((h) => {
			allowedHeadersArr.includes(h.toLowerCase().trim())
				? null
				: (valid = false);
		});

		return valid;
	};

	const _validReqHandler = (
		res: BunResponse,
		resHeaders: { [key: string]: any }
	): void => {
		switch (Array.isArray(origins)) {
			case true:
				resHeaders["Access-Control-Allow-Origin"] = origin;
				res.setHeader("Access-Control-Allow-Origin", origin);

				resHeaders["Vary"] = "Accept-Encoding, Origin";
				res.setHeader("Vary", "Accept-Encoding, Origin");

				break;
			default:
				resHeaders["Access-Control-Allow-Origin"] = "*";
				res.setHeader("Access-Control-Allow-Origin", "*");
		}

		resHeaders["Access-Control-Allow-Headers"] = allowedHeaders.join(",");
		res.setHeader("Access-Control-Allow-Headers", allowedHeaders.join(","));

		resHeaders["Access-Control-Max-Age"] = maxAge;
		res.setHeader("Access-Control-Max-Age", maxAge);

		if (allowCredentials) {
			resHeaders["Access-Control-Allow-Credentials"] = `${allowCredentials}`;
			res.setHeader("Access-Control-Allow-Credentials", `${allowCredentials}`);
		}

		if (exposedHeaders) {
			resHeaders["Access-Control-Expose-Headers"] = exposedHeaders.join(",");
			res.setHeader("Access-Control-Expose-Headers", exposedHeaders.join(","));
		}
	};

	const middelware: Handler = (req, res, next?) => {
		switch (req.method) {
			case "OPTIONS":
				// Get the origin header and compare it's value to the initialised value
				const origin = req.headers ? req.headers["origin"] : "*";
				const isvalidOrigin = origins === "*" ? true : _isOrigin(origin);
				// Get the request method header (if none, then use the request mehtod) and compare it's value to the initialised value
				const method = req.headers
					? req.headers["access-control-request-method"]
					: req.method;
				const isValidMethod = _isValidMethod(method);

				// In case of a preflight, check the request headers and compare them to the allowed headers
				const requestHeaders = req.headers
					? req.headers["access-control-request-headers"]
					: null;
				const isValidHeaders = requestHeaders
					? _isValidRequestHeaders(requestHeaders)
					: true;

				if (isvalidOrigin && isValidMethod && isValidHeaders) {
					const resHeaders: { [key: string]: any } = {};
					_validReqHandler(res, resHeaders);

					resHeaders["Access-Control-Allow-Methods"] = methods.join(",");
					res.setHeader("Access-Control-Allow-Methods", methods.join(","));

					res
						.option({
							status: 204,
							headers: resHeaders,
							statusText: "204 No Content",
						})
						.headers(resHeaders)
						.status(204)
						.send("");
				} else if (!isvalidOrigin) {
					res
						.option({ status: 400, statusText: "400 Bad Request" })
						.status(400)
						.send("");
				} else if (!isValidMethod) {
					res
						.option({ status: 405, statusText: "405 Method Not Allowed" })
						.status(405)
						.send("");
				} else {
					res
						.option({ status: 406, statusText: "406 Not Acceptable" })
						.status(406)
						.send("");
				}
				break;
			default:
				// @ts-ignore
				const host = req.headers["host"];
				const isvalidOriginNoPreflight =
					origins === "*" ? true : _isOrigin(host);
				const isValidMethodNoPreflight = _isValidMethod(req.method);

				if (isvalidOriginNoPreflight && isValidMethodNoPreflight) {
					const resHeaders: { [key: string]: any } = {};
					_validReqHandler(res, resHeaders);

					res
						.option({
							headers: resHeaders,
						})
						.headers(resHeaders);
				} else if (!isValidMethodNoPreflight) {
					res
						.option({ status: 405, statusText: "405 Method Not Allowed" })
						.status(405)
						.send("");
				} else {
					res.status(400).send("");
				}
				// @ts-ignore
				next();
		}
	};

	return middelware;
}

export default cors;
export { CorsOptions };
