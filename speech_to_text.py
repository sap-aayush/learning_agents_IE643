import speech_recognition as sr

r = sr.Recognizer()

with sr.Microphone() as source:
    # read the audio data from the default microphone
    print("Start recording")
    audio_data = r.record(source, duration=10)
    print("Recognizing...")
    # convert speech to text
    text = r.recognize_google(audio_data)
    print(text)
    with open("unstructured.txt", "a") as file:
        file.write(text + "\n")