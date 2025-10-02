# RPGM Tools

## Installation (for development)
- `pnpm install`

## Development
- `pnpm build`
- Pulling api from dev server
  - `pnpm openapi`
  - This will fetch the api types from whatever dev server is running at the `OPENAPI_INPUT` environment variable

> [!IMPORTANT]
> Do not push without building first, as your changes won't be reflected in consumer projects
