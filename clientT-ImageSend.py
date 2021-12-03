import json
import requests
from PIL import Image
import numpy as np
import sys
# test_image = Image.open('test_image7.jpg')
# pixels = np.array(test_image)/255.0
# print("pixels: ", pixels)

# address = 'http://localhost:8501/v1/models/mnist:predict'
# data = json.dumps({'instances':pixels.tolist()})
# print("data: ",data)

# result = requests.post(address, data=data)
# predictions = json.loads(str(result.content, 'utf-8'))['predictions']

# for prediction in predictions:
#   print(prediction)
#   print(np.argmax(prediction))

def getPredictNum(test_image, modelName, modelPort):
  pixels = np.array(test_image)/255.0
  # print("pixels: ", pixels)

  address = 'http://localhost:'+modelPort+'/v1/models/'+modelName+':predict'
  data = json.dumps({'instances':pixels.tolist()})
  # print("data: ",data)

  result = requests.post(address, data=data)
  predictions = json.loads(str(result.content, 'utf-8'))['predictions']

  for prediction in predictions:
    # print(prediction)
    predict = np.argmax(prediction)
  
  return predict


if __name__ == '__main__':
  # test_image = Image.open(sys.argv[1])
  # res = getPredictNum(test_image)
  # print(res)
  # sys.stdout.flush()
  imgpath = './fileUploads/'+ sys.argv[1]
  test_image = Image.open(imgpath)
  print(getPredictNum(test_image, sys.argv[2], sys.argv[3]))