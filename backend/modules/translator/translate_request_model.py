class TranslateRequestModel:
    def __init__(self, text, to_language:str, from_language="English", ):
        self.text = text
        self.from_language = from_language
        self.to_language = to_language
