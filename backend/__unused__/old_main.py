import errno
import io
import json
import math
import os
import re
import threading
import time
import numpy as np
from pywhispercpp.model import Model
import asyncio
from websockets import serve
import uuid
from translated_model import TranslatedModel
from modules.pywhisper_cpp_binding.pywhisper_binding import simple
from pydub import AudioSegment
from pydub.silence import split_on_silence

# run: python3 main.py

# TODO: on stop recording, clear chunks
# TODO: to prevent chunks from getting too large, every 5 seconds, clear out the last 3 seconds or something
# TODO: ignoring silences - maybe better to ignore it by decibles
# TODO: Weird bug with audio transcription not working well with custom Mic, but decent with computer Mic
chunks = []
global group
group = 0

def clean_chunks():
  # remove first 3 items to keep it lean
  if len(chunks) >= 5:
    print("CLEARING CHUNKS")
    global group
    group+= 1
    chunks.clear()
    # del chunks[:7]

async def handle_client(websocket, path):
  print("New client connected")
  async for message in websocket:
      # Convert it to mp3 chunk
      wav_segment = AudioSegment.from_wav(io.BytesIO(message))
      filename = f"./temp1/out-{group}.mp3"
      # TEST
      print(wav_segment.rms)
      # Set a threshold value for silence
      RMS_THRESHOLD2 = 400

      # Check if the audio is silent
      # Compute the Root Mean Square (RMS) amplitude of the audio data
      # to check for silence in the audio blob
      # TODO: cleanup
      # Transcribe when silent OR ~2 seconds audio is queued~
      if (wav_segment.rms < RMS_THRESHOLD2 and len(chunks) > 2):
          print("The audio is silent.- transcribe the blobs -")
          if not os.path.exists(os.path.dirname(filename)):
            try:
                os.makedirs(os.path.dirname(filename))
            except OSError as exc: # Guard against race condition
                if exc.errno != errno.EEXIST:
                    raise

          with open(filename, "wb") as f:
            f.write(b"".join(chunks))
          chunks.clear() # delete transcribed chunk
          # time.sleep(0.2)
          mp3_seg = AudioSegment.from_mp3(filename)
          print(f"mp3_seg: {mp3_seg.rms}")
          if mp3_seg.rms < RMS_THRESHOLD2: continue

          transcription = simple(filename, model=model)
          print(transcription)
          if transcription != None and transcription != "":
            await websocket.send(format_data_to_json(transcription=transcription))
      else: 
          print("The audio is not silent or chunk length < 2.")
          # # 44.1 kHz is a standard sample rate for mp3s. 
          # # needed to prevent audio to be slowed down
          wav_segment = wav_segment.set_frame_rate(44100)
          mp3_segment = wav_segment.export(None, format="mp3", bitrate="192k")
                
          # # Convert it to mp3Blob
          mp3_blob = mp3_segment.read()
          # # Add to chunks array - combining chunks together
          chunks.append(mp3_blob)
          # print(f"chunk len: {len(chunks)}")
      

def format_data_to_json(transcription):
  translated_model = TranslatedModel(text=transcription, group=group)
  trimmed_text = re.sub(r'\[[^]]*\]', '', translated_model.text)
  json_string = json.dumps({"text": trimmed_text, "group": translated_model.group})
  return json_string

async def main():
  global model
  model = Model('base.en', n_threads=8, print_progress=False, print_realtime=False)
  async with serve(handle_client, "localhost", 8765):
    await asyncio.Future()


if __name__ == "__main__":
  asyncio.run(main())