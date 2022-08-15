"""Translates text into the target language.

Target must be an ISO 639-1 language code.
See https://g.co/cloud/translate/v2/translate-reference#supported_languages
"""
from google.cloud import translate_v2 as translate
from google.cloud import vision
import six
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="./src/training/graphite-ally-268401-d5996b9a2754.json"

class GoogleTranslate:
    def __init__(self):
        self.translate_client = translate.Client()

    def googletranslate(self, text, languageCode):
        if isinstance(text, six.binary_type):
            text = text.decode('utf-8')

        # Text can also be a sequence of strings, in which case this method
        # will return a sequence of results for each text.
        result = self.translate_client.translate(
            text, target_language=languageCode)

        return result['translatedText']

