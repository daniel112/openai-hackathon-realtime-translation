import os
import time
import requests
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
# Increasing stability will make the voice more consistent between re-generations, but it can also make it sounds a bit monotone. On longer text fragments we recommend lowering this value.
ELEVENLABS_VOICE_STABILITY = 0.30

# High enhancement boosts overall voice clarity and target speaker similarity. Very high values can cause artifacts, so adjusting this setting to find the optimal value is encouraged.
ELEVENLABS_VOICE_SIMILARITY = 0.80

# Choose your favorite ElevenLabs voice
ELEVENLABS_VOICE_NAME = "daniel-yo" # my custom cloned voice
DEFAULT_VOICE_FILENAME = "voice.mp3"
PATH_TO_FRONTEND_APP_SRC_AUDIO = "../frontend/src/audio"


def get_voices() -> list:
    """Fetch the list of available ElevenLabs voices.
    :returns: A list of voice JSON dictionaries.
    :rtype: list
    """
    url = "https://api.elevenlabs.io/v1/voices"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "accept": "application/json"
    }
    response = requests.get(url, headers=headers)
    # print(response.json())
    return response.json()["voices"]

ELEVENLABS_ALL_VOICES = get_voices()

def generate_audio(text: str, output_path: str = f"{PATH_TO_FRONTEND_APP_SRC_AUDIO}/{DEFAULT_VOICE_FILENAME}") -> str:
    """Converts
    :param text: The text to convert to audio.
    :type text : str
    :param output_path: The location to save the finished mp3 file.
    :type output_path: str
    :returns: The output path for the successfully saved file.
    :rtype: str
    """
    voices = ELEVENLABS_ALL_VOICES
    try:
      voice_id = next(filter(lambda v: v["name"] == ELEVENLABS_VOICE_NAME, voices))["voice_id"]
    except StopIteration:
      voice_id = voices[0]["voice_id"]

    print(f"voiceid {voice_id}")
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "content-type": "application/json"
    }
    data = {
        "text": text,
        "voice_settings": {
            "stability": ELEVENLABS_VOICE_STABILITY,
            "similarity_boost": ELEVENLABS_VOICE_SIMILARITY,
        }
    }
    response = requests.post(url, json=data, headers=headers)
    with open(output_path, "wb") as output:
      output.write(response.content)
    
    time.sleep(0.5)
    return DEFAULT_VOICE_FILENAME

