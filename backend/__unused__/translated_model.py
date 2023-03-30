import json

class TranslatedModel:
  def __init__(self, text, group, transcription_time, translation_time):
      self.text = text
      self.group = group
      self.transcription_time = transcription_time
      self.translation_time = translation_time