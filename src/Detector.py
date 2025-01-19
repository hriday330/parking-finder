import cv2
import time
import requests
import base64
import os
from io import BytesIO
from PIL import Image

# Claude API configuration
CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
CLAUDE_API_KEY = "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"  # Replace with your actual API key

# IP Camera URL
IP_CAMERA_URL = "http://128.189.228.47:8080/video"

# Folder to save images
SAVE_PATH = "captured_image.jpg"

def capture_image_from_ip_camera():
    """Captures a single frame from the IP camera and saves it locally."""
    cap = cv2.VideoCapture(IP_CAMERA_URL, cv2.CAP_FFMPEG)
    if not cap.isOpened():
        raise RuntimeError("Cannot access the IP camera. Check the URL and connectivity.")

    ret, frame = cap.read()
    if ret:
        cv2.imwrite(SAVE_PATH, frame)
    else:
        raise RuntimeError("Failed to capture image from the IP camera.")

    cap.release()

def send_image_to_claude(image_path):
    """Sends the captured image to Claude API for analysis."""
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")

        headers = {
            "x-api-key": CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

        data = {
            "model": "claude-3-opus-20240229",
            "max_tokens": 1024,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "How many red objects are in this image? Please respond with just a number."
                        },
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": encoded_string
                            }
                        }
                    ]
                }
            ]
        }

        response = requests.post(CLAUDE_API_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()

        if "content" in result and len(result["content"]) > 0:
            try:
                # Extract just the number from Claude's response
                response_text = result["content"][0]["text"]
                number = int(''.join(filter(str.isdigit, response_text)))
                print("Claude Response (Number):", number)
                return number
            except (ValueError, IndexError) as e:
                print(f"Could not parse a number from Claude's response: {response_text}")
                return None
        else:
            print("Unexpected response format from Claude:", result)
            return None

    except requests.exceptions.RequestException as e:
        print(f"Request to Claude failed: {e}")
        if 'response' in locals():
            print(f"Response text: {response.text}")
        return None
    except Exception as e:
        print(f"Error processing Claude response: {e}")
        return None

def main():
    while True:
        try:
            capture_image_from_ip_camera()
            print("Captured image.")

            number_of_toys = send_image_to_claude(SAVE_PATH)

            if number_of_toys is not None:
                print(f"Number of toys with wheels: {number_of_toys}")

            time.sleep(10)

        except Exception as e:
            print(f"Main loop error: {e}")
            break

if __name__ == "__main__":
    main()