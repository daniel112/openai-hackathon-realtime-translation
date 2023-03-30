import asyncio
import base64
import json
from pywhispercpp.model import Model
import websockets
import threading
from pydub import AudioSegment
from voice import generate_audio
from process_audio import process_audio_into_file_queue, file_queue_processor
from modules import WSRequestModel, summarize


async def websocket_cb(websocket, _):
    print("Audio websocket connected")
    chunks = []
    threading.Thread(target=file_queue_processor, daemon=True,
                     args=(websocket, whisper_model,)).start()
    while True:
        try:
            if websocket.closed:
                return
            # Receive audio data from the client
            json_string = await websocket.recv()
            json_data = json.loads(json_string)
            request_model = WSRequestModel(json_data)
            if request_model.name == "audio":
                # decode base64
                decode_bytes = base64.b64decode(request_model.data)
                with open('./temp1/test.wav', "wb") as wav_file:
                    wav_file.write(decode_bytes)
                # Process the audio data in a separate thread
                wav_segment = AudioSegment.from_wav('./temp1/test.wav')
                wav_segment.set_frame_rate(44100)
                processing_thread = threading.Thread(
                    target=process_audio_into_file_queue, args=(wav_segment, chunks, request_model))
                processing_thread.start()
                processing_thread.join()
            
            elif request_model.name == "summarize":
                summarized = summarize(request_model.data)
                json_string = json.dumps(
                    {"type": request_model.name, "text": summarized})
                await websocket.send(json_string)
            elif request_model.name == "voice":
                filename = generate_audio(text=request_model.data)
                json_string = json.dumps(
                    {"type": request_model.name, "filename": filename})
                await websocket.send(json_string)

        except websockets.exceptions.ConnectionClosed:
            print("WebSocket connection closed")
            break
        except ValueError:
            print('Received non-JSON message:', json_string)
            break
        except Exception as e:
            print("ERROR BRO - main.py")
            print(e)
            break


async def start_websocket_server():
    async with websockets.serve(websocket_cb, "localhost", 8765) as websocket:
        await asyncio.Future()  # run forever

global whisper_model
whisper_model = Model('base', n_threads=8,
                      print_progress=False, print_realtime=False)
asyncio.run(start_websocket_server())
