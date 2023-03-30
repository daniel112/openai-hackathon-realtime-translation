# Research Notes

## Local Whisper Model vs Whisper API

Pros & Cons

### Local

> https://github.com/openai/whisper

- Supports offline
- much lower latency
- Free to use
- requires pulling latest for up to date model
- Requires decent compute power (based on your chosen model)
- Flexible resource allocation
  - different sized models to use for your use case
  - the larger the model, the more accurate. but the slower it is

## API

- No maintenance needed on making sure model is up to date
- higher latency
- Cost $ to use
- Requires less resources to use
