import openai
import os

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


def summarize(text: str):
    """
    Summarize the text. returns a summarized version of the given text
    """
    try:
        response = openai.ChatCompletion.create(
            engine=os.getenv('OPENAI_DEPLOYMENT_NAME'),
            messages=[
                {"role": "system", "content": f"You are a transcript summarizer. Please summarize the transcript given by the user. Summarize the text into english"},
                {"role": "user", "content": text}
            ]
        )
        return response['choices'][0]['message']['content']
    except Exception as e:
        print('Error during summarize: ', e)
        return ""



if __name__ == '__main__':
    react_native_presentation = "Hey everyone, umm, today I want to talk to you about React Native and why it's so much easier than native development. So, as you may know, React Native is a framework for building mobile applications that allows you to use JavaScript and React to create native applications for iOS and Android. And let me tell you, uhh, it's a game-changer.\n\nFirst off, let's talk about development time. With React Native, you can write code once and deploy it to multiple platforms, saving you a ton of time and effort. Plus, since you're using JavaScript, which is a high-level programming language, you don't have to worry about the low-level details that come with native development. This means that you can focus on building great features and user experiences, rather than getting bogged down in the nitty-gritty of platform-specific code.\n\nAnother big advantage of React Native is the ability to use third-party libraries and components. There are tons of open-source libraries out there that can help you build amazing applications quickly and easily. And since React Native is built on top of React, which is a popular web development framework, many web developers can easily transition to mobile development using React Native.\n\nSo, in conclusion, uhh, React Native is a powerful tool for building mobile applications quickly and easily. With its ability to use JavaScript, third-party libraries, and its cross-platform compatibility, it's a great choice for developers looking to build high-quality mobile applications without the headache of native development."

    print(summarize(react_native_presentation))
