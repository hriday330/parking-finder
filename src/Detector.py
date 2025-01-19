import cv2
import numpy as np
import time

class Detector:
    def __init__(self, url, configPath, modelPath, classPath):
        self.videoPath = url # path to video to analyze
        self.configPath = configPath # path to configuration file
        self.modelPath = modelPath # path to pre-trained model
        self.classPath = classPath

        self.net = cv2.dnn_DetectionModel(self.modelPath, self.configPath)
        self.net.setInputSize(320, 320)
        self.net.setInputScale(1.0/127.5)
        self.net.setInputMean((127.5, 127.5, 127.5))
        self.net.setInputSwapRB(True)

        self.readClasses()
        print("hi")

    def readClasses(self):
        # Reads all the classes identifiable into list
        with open(self.classPath, 'r') as f:
            self.classList = f.read().splitlines()

        # Background, do not want classes in 0th index
        self.classList.insert(0, '__Background__')
        print(self.classList)

    def onVideo(self):
        cap = cv2.VideoCapture(self.videoPath, cv2.CAP_FFMPEG)
        cap.set(38,1)
        #print(cv2.getBuildInformation())
        (success, image) = cap.read()

        while success:
            classLabelIDs, confidences, bboxes = self.net.detect(image, confThreshold = 0.5)
            bboxes = list(bboxes)
            confidences = list(np.array(confidences).reshape(1, -1)[0])
            confidences = list(map(float, confidences))

            # non-maxima suppression of bounding box (removes overlapping bounding boxes)
            bboxIndex = cv2.dnn.NMSBoxes(bboxes, confidences, score_threshold = 0.5, nms_threshold = 0.2)

            if len(bboxIndex) != 0: # there are bounding boxes
                for i in range(0, len(bboxIndex)):
                    bbox = bboxes[np.squeeze(bboxIndex[i])]
                    classConfidence = confidences[np.squeeze(bboxIndex[i])]
                    classLabelID = np.squeeze(classLabelIDs[np.squeeze(bboxIndex[i])])
                    classLabel = self.classList[classLabelID]

                    displayText = "{}:{:.2f}".format(classLabel, classConfidence)

                    # Draw box
                    x,y,w,h = bbox
                    if (displayText == "surfboard" or displayText == "skis" or displayText == "toothbrush"):
                        cv2.rectangle(image, (x,y), (x+w, y+h), color=(255, 255, 255), thickness=2)
                        cv2.putText(image, displayText, (x, y-10), cv2.FONT_HERSHEY_TRIPLEX, 2, (255, 255, 255), 2)

            cv2.imshow("Result", cv2.resize(image, (1200, 600))) # Show
            cv2.resizeWindow("Result", 1200, 600)
            # Get keyboard event, if q, exit
            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                break

            (success, image) = cap.read()
        cv2.destroyAllWindows()