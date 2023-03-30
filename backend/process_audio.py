
import asyncio
import json
import os
import queue
import re
import string
import time
from pydub import AudioSegment
from modules import translate, TranslateRequestModel, transcribe_audio, WSRequestModel, FileTranslateRequestModel


file_q = queue.Queue()
grp = 0
# Set a threshold value for silence
# use the Root Mean Square (RMS) amplitude of the audio data
# to check for silence in the audio blob
RMS_THRESHOLD = 300


def process_audio_into_file_queue(wav_segment: AudioSegment, audioChunks: list, ws_request_model: WSRequestModel):
    """
    processes the audio segment and either:
      - append it to the chunks array - when we're collecting audio
      - convert the chunks array into an audio file for a later file processing
    """
    global grp

    # first 2 chunks will always make it in for a workaround to a bug
    # - if we start off with silence, it wont be able to process the audio
    if len(audioChunks) < 2:
        audioChunks.append(wav_segment)
        return
    
    print(wav_segment.rms)

    # Naive solution to streaming translation real time with correction
    # We do this by appending each NON SILENT audio chunk in an array and then translating the entire audio array every time until we receive silence.
    # When we receive a "silent" chunk we can safely assume it is the end of a sentence or phrase > clear out the array and start over
    # Process > Transcribe > Translate every audio chunk as we receive them
    if wav_segment.rms < RMS_THRESHOLD:
        print("- SILENCE DETECTED -")
        audioChunks.clear()
        grp += 1
    else:
        print("The audio is not silent, process it")
        audioChunks.append(wav_segment)

        # combine each item in the audio chunk and export into a .wav file
        combined_sounds = audioChunks[0]
        for item in audioChunks[1:]:
            combined_sounds = combined_sounds + item
        file_path = f"./temp1/path-{grp}.wav"
        combined_sounds.export(file_path, format="wav")

        # add the file to process in the queue thread
        file_translate_request_model = FileTranslateRequestModel(filepath=file_path, ws_request_model=ws_request_model, group=grp)
        file_q.put(file_translate_request_model)

def file_queue_processor(websocket, whisper_model):
    """
    Threaded process that keeps waiting for data to be pushed into the file queue
    it will process each item sequentially and transform it before sending back to the client
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(_worker(websocket, whisper_model))
    loop.close()

####
# PRIVATE METHODS
####


def _format_data_to_json(text: string, transcription_time: float, translation_time: float, group: float):
    """
    Formats the text response to json before sending it back to client
    """
    trimmed_text = text
    # trimmed_text = re.sub(r'\[[^]]*\]', '', text)
    json_string = json.dumps(
        {"text": trimmed_text, "group": group, "transcriptionTime": transcription_time, "translationTime": translation_time})
    return json_string


async def _worker(websocket, model):
    """
    threaded worker to process the audio file queue
      transcribe it through the Whisper Model
      and send it back to client
    """
    while True:
        try:
            if websocket.closed:
                return
            
            if not file_q.empty():
                # each item in the queue is an instance of FileTranslateRequestModel
                file_request_model = file_q.get()

                original_language_iso = file_request_model.ws_request_model.language_from.iso
                from_language_label = file_request_model.ws_request_model.language_from.label
                to_language_label = file_request_model.ws_request_model.language_to.label

                start_time = time.time()
                transcription = transcribe_audio(file_request_model.filepath, model=model, language=original_language_iso)
                end_time = time.time()
                transcription_time = end_time - start_time#f"{end_time - start_time:.3f} s"

                # delete the file after processing to save space
                os.remove(file_request_model.filepath)

                if transcription != None and transcription != "":
                    translate_request_model = TranslateRequestModel(
                        text=transcription, from_language=from_language_label, to_language=to_language_label)
                    
                    # if language_from and language_to is the same, its just a transcription
                    if translate_request_model.from_language == translate_request_model.to_language:
                         # send to client listeners
                        await websocket.send(_format_data_to_json(
                            text=transcription, 
                            transcription_time=transcription_time, 
                            translation_time=0.0,
                            group=file_request_model.group
                        ))
                        continue
                    
                    start_time = time.time()
                    translation = translate(translate_request_model)
                    end_time = time.time()
                    translation_time = end_time - start_time

                    # send to client listeners
                    await websocket.send(_format_data_to_json(
                        text=translation, 
                        transcription_time=transcription_time, 
                        translation_time=translation_time,
                        group=file_request_model.group
                    ))

                file_q.task_done()
        except Exception as e:
            print("ERROR BRO - _worker()")
            file_q.task_done()
            print(e)
            # break
        
