import os
import time
from pywhispercpp.model import Model
from pywhispercpp.examples.recording import logging

file = '../../audio-sample/wav/what-is-it-like-to-be-a-crocodile.wav'

# TODO: can possibly use callback to get the result faster
def callback(segment):
    # print("new segment callback START")
    print(segment[0].text)
    # print("new segment callback END")

def transcribe_audio(fileInput, model, language="en", segmentCb=callback):
    """
    transcribe the audio file and return the text
    audio_language needs to be in ISO 639-1 format. ref: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    """
    # all params: https://abdeladim-s.github.io/pywhispercpp/#pywhispercpp.constants.PARAMS_SCHEMA
    try:
        segments = model.transcribe(fileInput, 
                                    # log_level=logging.CRITICAL, 
                                    single_segment=True, # force single segment output (useful for streaming)
                                    n_processors=None,
                                    no_context=True,
                                    language=language,
                                    translate=False # whether to translate the audio to English
                                    # speed_up=True,
                                    # split_on_word=True
                                    # new_segment_callback=segmentCb
                                    )
        text = None
        for segment in segments:
            print(segment.text)
            text = ""
            text += f"{segment.text}"

        return text

    except Exception as e:
            print("ERROReeeee")
            print(e)


# from pywhispercpp.examples.assistant import Assistant
# my_assistant = Assistant(model='base',commands_callback=print, n_threads=8)
# my_assistant.start()
# Uncomment below to test audio transcription file
# start_time = time.time()
# model = Model('base.en', n_threads=8, print_progress=False, print_realtime=False, speed_up=True,)
# result = simple("../../audio-sample/mp3/what-is-it-like-to-be-a-crocodile.mp3", model)
# print("----RESULT----")
# print(result)

# handle_message_time = time.time() - start_time
# print(f"execution time: {handle_message_time}")
