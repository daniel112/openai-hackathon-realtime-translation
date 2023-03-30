## Python

Requires

- Python 3.9+
- FFmpeg - `brew install ffmpeg` (Mac)

## Quick Setup

- `cd backend`
- Run `pip install -r requirements.txt`
- Create a `.env` file in `/backend` with the values in template file (see `.env.template`)
- Update your `.env` file with your own values

## Run Python Websocket server

- Run `python main.py`

### Dependencies

`asyncio` - for asynchronous event handling
`base64` - for decoding the audio data
`json` - for parsing the WebSocket messages
`websockets` - for the WebSocket client and server implementation
`threading` - for running the audio processing in a separate thread
`pydub` - for audio processing and conversion
`pywhispercpp` - for OpenAI's Whisper speech recognition

### Project Description

    This program is a real-time audio transcription and translation service that listens to incoming audio data and streams it to a connected client. The client can then receive the transcribed text and translated text in real-time.

    The /backend folder holds main.py and dependent scripts that connects to a WebSocket server and receives audio data from clients. The audio data is then processed and saved to a file. The script uses the following libraries:

### How to use

    1. cd into /backend
    2. Install the dependencies using pip install -r requirements.txt.
    3. Run the script using 'python main.py'.
    4. Connect to the WebSocket server using a WebSocket client. Our front-end application creates the socket connection.

    Code Overview:

    server.py: Main program that starts the websocket server and handles incoming connections
    modules/translate_request_model.py: Data model for the translation request
    modules/transcribe_audio.py: Function that transcribes the audio using the Whisper Model
    modules/translate.py: Function that translates the text using the GPT-3 engine
    modules/file_queue_processor.py: Function that processes the audio file queue and sends the transcribed and translated text to the connected client in real-time

Future Improvements:

- Error handling and logging
- Support for multiple clients
- Dynamic language detection and translation
- More configurable engine and model options

### Resources

Resources used and referenced to build this App

Whisper Model and API resources:

- https://github.com/openai/whisper#available-models-and-languages
- https://github.com/ggerganov/whisper.cpp/blob/master/examples/stream/stream.cpp
- https://github.com/abdeladim-s/pywhispercpp - whisper cpp binding

Audio manipulation and chunking:

- https://github.com/jiaaro/pydub/blob/master/API.markdown
- https://github.com/jiaaro/pydub/issues/169
