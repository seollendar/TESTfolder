import time
import os
import sys
import json
import requests

deviceList = ['GBS020201', 
'GBS020202', 
'GBS020203', 
'GBS020204', 
'GBS020205', 
'GBS020206', 
'GBS030305', 
'GBS030306', 
'GBS030307', 
'GBS030309', 
'GBS030310', 
'GBS030314', 
'GBS031301', 
'GBS031303', 
'GBS031304', 
'GBS031401', 
'GBS031402', 
'GBS031403']

aeidList = ['Sb3ee4228f54643bd9538779b5695574b', 
'S87a191b080524b19b9bdad797ea1e420', 
'S97e6a23d7ca2431ba5f85a4c3f7a4b50', 
'S861bcfba840247ee84c228f13b7ca1e1', 
'S12feac876c72408c9a7645cba5751be2', 
'S17678cfb230a419fa5bd9115cd916d65', 
'S4c546d6478294d5fbb156d784988a7f9', 
'S1c449131fb4c4762bdf7d1c92970c06b', 
'S76235fccad984bc9903bb86f33fa70ff', 
'Sbd935e2b014542899315a93d3c957829', 
'S518b96f9838745dc87a87dcc1deabadd', 
'Scdeaaa41d4384f08bdda4c951e386ecb', 
'S766363ef987c4a5fb64c099ef4c5db0a', 
'S8d607ce91d4d4ddfa43fca21b4fe797e', 
'S5002c44d97cc49a2b8c5d893feded74d', 
'Sfdb734e02f9043c193e842eb638b8840', 
'S00c5ef0f694144329523cc66f2a2ac21', 
'S1d0e62dc7b744eafa07c2a6ecc7cde3e']


serverURL = 'http://n-mas.ntels.com:19000/~/CB00011/welding' 

def createContentInstance(AEName, ContainerName, origin, data, printOptionInt):  
  headers = {
    "Accept": "application/json",
    "X-M2M-Origin": origin,
    "X-M2M-RI": "1234",
    "Content-Type": "application/json;ty=4"
  }
  request_URL = serverURL + "/" + AEName + "/" + ContainerName  # http://n-mas.ntels.com:19000/~/CB00011/welding/GBS031301/cnt-report
  if(printOptionInt):
    print("CreateContentInstance..")
    print("\n>", request_URL)
    #print("\n>", headers)
    #print("\n>", data)    
  response = requests.post(request_URL, data=data, headers=headers)
  responseCode = response.status_code  
  if(printOptionInt):
    print("responseCode: ", responseCode)
    print(response.text)
  return responseCode
 

 
if __name__ == '__main__' :
  print('MHsong')
  path = './data/'
  fn=['' for i in range(18)] ## file name list
  rf=['' for i in range(18)] ## file object list

  fn[0] = path + deviceList[0] + '.csv'
  fn[1] = path + deviceList[1] + '.csv'
  fn[2] = path + deviceList[2] + '.csv'
  fn[3] = path + deviceList[3] + '.csv'
  fn[4] = path + deviceList[4] + '.csv'
  fn[5] = path + deviceList[5] + '.csv'
  fn[6] = path + deviceList[6] + '.csv'
  fn[7] = path + deviceList[7] + '.csv'
  fn[8] = path + deviceList[8] + '.csv'
  fn[9] = path + deviceList[9] + '.csv'
  fn[10] = path + deviceList[10] + '.csv'
  fn[11] = path + deviceList[11] + '.csv'
  fn[12] = path + deviceList[12] + '.csv'
  fn[13] = path + deviceList[13] + '.csv'
  fn[14] = path + deviceList[14] + '.csv'
  fn[15] = path + deviceList[15] + '.csv'
  fn[16] = path + deviceList[16] + '.csv'
  fn[17] = path + deviceList[17] + '.csv'

  ## FILE OPEN
  for i in range(18):
    #print(fn[i])
    rf[i] = open(fn[i], mode='rt', encoding='utf-8')  
  print(rf, '\n')
  

  j=0
  while(1):
    print("========", j, "========")

    ## READ LINE & UPLOAD DATA FOR ALL FILES
    for i in range(18): 
      line = rf[i].readline() 
      if(line):
        try:
          resCode = createContentInstance(deviceList[i], 'cnt-report', aeidList[i], line, printOptionInt=0)
          if( resCode == 201):
            print(">", '[', time.strftime('%H:%M:%S', time.localtime(time.time())),']', j, i, fn[i], "Created..")
          else : 
            print(">", '[', time.strftime('%H:%M:%S', time.localtime(time.time())),']', j, i, fn[i], "Response Code:      ", resCode)
        except:
          print("Upload Error..")
    j=j+1
    
  print("##########\n")
  sys.exit()
  
  
  ## FOR TEST
  i=0
  for line in r[1].readlines():
    resCode = createContentInstance(deviceList[1], 'cnt-report', aeidList[1], line, printOptionInt=0)
    if( resCode == 201):
      print(">", i, "Created..")
    else : 
      print(">", i, "Response Code:      ", resCode)
    i = i+1
    


  
#line = r.readline()
#if(createContentInstance('GBS031301', 'cnt-report', 'S766363ef987c4a5fb64c099ef4c5db0a', line, printOptionInt=1) == 201):
#  print("Created")

#print(r.readline().split(','))
#a = r.readline().split()
#print(a)
  


#line = json.dumps(r.readline().split(','))

#path = './data/'
#file_list = os.listdir(path)
#print(file_list)
#sys.exit()

  
