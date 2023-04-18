import os
import openai
from .translate_request_model import TranslateRequestModel
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

openai.api_key = os.getenv('OPENAI_API_KEY')
# for azure: your endpoint should look like the following https://YOUR_RESOURCE_NAME.openai.azure.com/
# for openai: https://api.openai.com/v1
openai.api_base = os.getenv('API_BASE')
# https://github.com/openai/openai-python#microsoft-azure-endpoints
# for azure: azure
# for openai: open_ai
openai.api_type = os.getenv('OPENAI_TYPE')

# for Azure GPT3-5 turbo: 2023-03-15-preview
openai.api_version = os.getenv('OPENAI_API_VERSION')


def translate(request_model: TranslateRequestModel):
    """
    Translate the text and return result
    """
    try:
        print(f"--DEBUG: Translating from {request_model.from_language} to {request_model.to_language}")
        print(f"--DEBUG: Txt to translate: {request_model.text}")
        response = openai.ChatCompletion.create(
            engine=os.getenv('OPENAI_DEPLOYMENT_NAME'),
            messages=[
                {"role": "system", "content": f"You are an accurate language translator that will translate {request_model.from_language} text to {request_model.to_language}. Do not include the pronounciation. You reply only with the direct translation, with brief to-the-point answers with no elaboration."},
                {"role": "user", "content": f"Translate the following: {request_model.text}"}
            ]
        )
        return response['choices'][0]['message']['content']
    except Exception as e:
        print('Error during translate: ', e)
        return ""



if __name__ == '__main__':
    print(translate("talk about ice cream."))
