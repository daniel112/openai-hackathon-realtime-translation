import os
import azure.cognitiveservices.speech as speechsdk
import time

SPEECH_KEY=""
REGION=""

def cognitive_speech_API():
  # This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
  speech_config = speechsdk.SpeechConfig(subscription="", region="eastus")
  # audio_output_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)
  # audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
  # speech_config.speech_recognition_language="en-US"

  audio_file_path = './audio-sample/wav/what-is-it-like-to-be-a-crocodile.wav'
  audio_config = speechsdk.audio.AudioConfig(filename=audio_file_path)

  speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config, language="en-US")
  start_time = time.time()

  result = speech_recognizer.recognize_once_async().get()

  if result.reason == speechsdk.ResultReason.RecognizedSpeech:
      print(result.text)
  elif result.reason == speechsdk.ResultReason.NoMatch:
      print("No speech could be recognized")
  elif result.reason == speechsdk.ResultReason.Canceled:
      cancellation_details = result.cancellation_details
      print(f"Speech Recognition canceled: {cancellation_details.reason}")

      if cancellation_details.reason == speechsdk.CancellationReason.Error:
          print(f"Error details: {cancellation_details.error_details}")

  handle_message_time = time.time() - start_time
  print(f"execution time: {handle_message_time}")


def recognize_from_microphone():
    # This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
    speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=REGION)
    speech_config.speech_recognition_language="en-US"

    audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

    print("Speak into your microphone.")
    start_time = time.monotonic()
    speech_recognition_result = speech_recognizer.recognize_once()#speech_recognizer.recognize_once_async().get()
    end_time = time.monotonic()

    if speech_recognition_result.reason == speechsdk.ResultReason.RecognizedSpeech:
        print("Recognized: {}".format(speech_recognition_result.text))
    elif speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
        print("No speech could be recognized: {}".format(speech_recognition_result.no_match_details))
    elif speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
        cancellation_details = speech_recognition_result.cancellation_details
        print("Speech Recognition canceled: {}".format(cancellation_details.reason))
        if cancellation_details.reason == speechsdk.CancellationReason.Error:
            print("Error details: {}".format(cancellation_details.error_details))
            print("Did you set the speech resource key and region values?")
    
    print(f"execution time: {end_time - start_time}")
# recognize_from_microphone()
cognitive_speech_API()