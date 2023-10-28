<p align="center">
    <img src="https://drive.google.com/uc?id=1N3CW-z4Ekm69tR6sbcpw_InyUGnxz3wb" alt="buncors logo" width="250" height="250" />
</p>

# buncors

The cors middleware that enables a [bunrest](https://www.npmjs.com/package/bunrest) server to handle cors requests. It also handles preflight requests 😃.

## Default Response Headers

If no options are provided, the response headers will be as follows:

```txt
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 5
```

**NOTE:** The allow headers will always append `Content-Type` to your response headers so no need to add it to the list.

## Usage Examples

**Globally**

```ts
import server from "bunrest";
import cors from "buncors";
const app = server();

app.use(cors());

app.listen(Bun.env.PORT, () => {
	console.log(`[startup]: Server running on port "${Bun.env.PORT}"`);
});
```

**Specific Route**

```ts
import server from "bunrest";
import cors from "buncors";
const app = server();

app.post("/auth", cors(), async (req, res) => {
	// some processing code
	res.status(200).json({ success: true });
});

app.listen(Bun.env.PORT, () => {
	console.log(`[startup]: Server running on port "${Bun.env.PORT}"`);
});
```

## Preflight Example

Note that in most cases, you will not have to explicity handle a preflight request separately.

```ts
import server from "bunrest";
import cors from "buncors";
const app = server();

app.post("/auth", async (req, res) => {
	// some processing code
	res.status(200).json({ success: true });
});

app.options(
	"/auth",
	cors({
		allowedHeaders: ["X-TOKEN"],
		methods: ["POST"],
		origins: ["www.cerebrus.dev"],
	})
);

app.listen(Bun.env.PORT, () => {
	console.log(`[startup]: Server running on port "${Bun.env.PORT}"`);
});
```

## CorsOptions Interface

```ts
	origins?: string | string[];
	methods?: string[];
	allowedHeaders?: string[];
	maxAge?: number;
	allowCredentials?: boolean;
	exposedHeaders?: string[];
```

| Param            | Type                          | Default                          | Is Required? | Description                                                                                                                               |
| ---------------- | ----------------------------- | -------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| origins          | `string, string[], undefined` | `*`                              | No           | Sets the `Access-Control-Allow-Origin` header; if set, it will dynamically return the correct origin or the first origin is not accetped. |
| methods          | `string[], undefined`         | `GET,HEAD,PUT,PATCH,POST,DELETE` | No           | Sets the `Access-Control-Allow-Methods` header.                                                                                           |
| allowedHeaders   | `string[], undefined`         | `Content-Type`                   | No           | Sets the `Access-Control-Allow-Headers` header; will always append `Content-Type` to the allowed headers.                                 |
| maxAge           | `number, undefined`           | `5`                              | No           | Sets the `Access-Control-Max-Age` header in **seconds**.                                                                                  |
| allowCredentials | `boolean, undefined`          | `undefined`                      | No           | Sets the `Access-Control-Allow-Credentials` header.                                                                                       |
| exposedHeaders   | `string[], undefined`         | `undefined`                      | No           | Sets the `Access-Control-Expose-Headers` header.                                                                                          |

<br />

# Changelog

## v0.2.x

<details open>
<summary><strong>v0.2.3</strong></summary>

- Added gloabl decleration compatibility
</details>
<br />

<details>
<summary><strong>v0.2.2</strong></summary>

- Better handling of wildcard origin
</details>
<br />

<details>
<summary><strong>v0.2.1</strong></summary>

- Removed console log statement
- Handling spaces in allowedHeaders request
</details>
<br />

<details>
<summary><strong>v0.2.0</strong></summary>

- Updated handler to manage allowedHeaders regardless of ordering or case
- Enabled non preflight requests returning headers EXCEPT allowedMethods
- Now you can send exposed headers back to the client
</details>
<br />

## v0.1.x

<details>
<summary><strong>v0.1.2</strong></summary>

- Removed console log statement
</details>
<br />

<details>
<summary><strong>v0.1.1</strong></summary>

- Added lib to NPM
</details>
<br />

<details>
<summary><strong>v0.1.0</strong></summary>

- Initial commit
</details>
