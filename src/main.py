from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Detector import *
import os

app = FastAPI()
configPath = os.path.join("model_data", "ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt")
modelPath = os.path.join("model_data", "frozen_inference_graph.pb")
classPath = os.path.join("model_data", "coco.names")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/parking/{location}")
async def funcy():
    # Get from website
    # Ask to connect to the right camera
    url = "192.168.68.108:8080" # Replace this
    Detector(url, configPath, modelPath, classPath)
    return 2

def main():
    url = "http://128.189.228.47:8080"
    detector = Detector("http://128.189.228.47:8080/video", configPath, modelPath, classPath)
    detector.onVideo()

if __name__ == '__main__':
    main()