class WSRequestModel:
  def __init__(self, json_data):
    self.name = json_data['name']
    self.data = json_data['data']

    if json_data.get('languageFrom') and json_data.get('languageTo'):
      self.language_from = LanguageModel(json_data['languageFrom'])
      self.language_to = LanguageModel(json_data['languageTo'])

class LanguageModel:
  def __init__(self, json_data):
      self.label = json_data['label']
      self.iso = json_data['iso']