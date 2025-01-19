from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Detector import run_camera
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
async def get_parking_availability(location : str):
    # Get from website
    # Ask to connect to the right camera
    if (location == "ubc"):
        url = "http://128.189.228.47:8080/video"
    else:
        url = "sfu"
    return run_camera(url)