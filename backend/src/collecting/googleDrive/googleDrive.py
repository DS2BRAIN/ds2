from src.collecting.connector import Connector


class GoogleDrive(Connector):
    def __init__(self, credentials_path, ):
        pass

    @classmethod
    def verify(cls, *args, **kwargs):
        pass

    def collect(self, *args, **kwargs):
        pass


def test():
    import io
    import os
    import pickle
    from unicodedata import normalize

    from google_auth_oauthlib.flow import InstalledAppFlow
    # from googleapiclient.discovery import build
    from googleapiclient.http import MediaIoBaseDownload
    from google.auth.transport.requests import Request

    # If modifying these scopes, delete the file token.pickle.
    SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

    # If there are no (valid) credentials available, let the user log in.
    creds = None

    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)

    print(creds)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    # drive_service = build('drive', 'v3', credentials=creds)

    file_id = '1w8AQjhujqhMDXhLrz1t4Vtz7M557jiVW'
    file_info = drive_service.files().get(fileId=file_id).execute()
    file_name = normalize('NFC', file_info['name'])

    request = drive_service.files().get_media(fileId=file_id)

    fh = io.FileIO(file_name, 'wb')
    downloader = MediaIoBaseDownload(fh, request)

    done = False
    while done is False:
        status, done = downloader.next_chunk()
        print("Download %d%%." % int(status.progress() * 100))


if __name__ == "__main__":
    # file_id = 'https://drive.google.com/file/d/12wDRRNzoFQUhfz9bYvNBq_L4VxNbCofu/view?usp=sharing'
    # file_id = '12wDRRNzoFQUhfz9bYvNBq_L4VxNbCofu'
    # destination = './dd.jpg'
    test()
