from .ws_request_model import WSRequestModel

class FileTranslateRequestModel:
  def __init__(self, filepath, ws_request_model: WSRequestModel, group):
    self.filepath = filepath
    self.ws_request_model = ws_request_model
    self.group = group
