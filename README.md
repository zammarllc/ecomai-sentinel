# EcomAI Sentinel

Internal tooling for managing query intelligence and forecast synchronisation in the EcomAI Sentinel backend.

## Data Loop

The data loop tracks recently ingested queries that are tagged with the `stock` label and keeps the `forecast` table aligned with the latest activity.

1. Incoming queries persist through `api/queries/persistQuery`. When the payload includes the `stock` tag, the handler schedules a background run of the shared `syncLoop` utility without awaiting the result. This keeps the API response quick while still guaranteeing eventual synchronisation.
2. `shared/utils/syncLoop` looks back across a 30 minute window (configurable) for stock-tagged queries, aggregates them by symbol, and upserts the associated forecast rows through Prisma. Any symbol that exceeds the configured activity threshold raises an alert via the provided logger or optional alert handler.
3. The loop responds with the processed symbols and alerts so that callers can instrument their own monitoring pipelines if needed.

### Troubleshooting

- **Sync loop not firing**: Confirm that the persisted query includes the lower-cased `stock` tag. Queries without the tag short-circuit and skip the loop entirely.
- **Forecast rows missing**: Ensure the Prisma schema defines a unique field (default: `symbol`) on the `forecast` model. Override `forecastIdentifierField` when invoking the loop if your schema uses a different column name.
- **Alerts not visible**: Provide a custom `alertHandler` when calling `syncLoop` to forward alerts to your monitoring stack. Without a handler the loop will log them via the supplied logger.
- **Slow responses**: Because the sync executes in the background, response latency should remain unaffected. If delays occur, audit the Prisma connection and confirm there are no long-running transactions blocking query persistence.
