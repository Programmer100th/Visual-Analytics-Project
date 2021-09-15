import numpy as np
from matplotlib import pyplot as plt
from sklearn.decomposition import PCA
from sklearn import preprocessing
import pandas as pd
import math
import csv

url='./geoviewsnew.tsv'

features=['longitude', 'latitude', 'relevance']

# load dataset into Pandas DataFrame
df=np.genfromtxt(url,skip_header=1,usecols=[1,2,5],delimiter='\t',encoding="utf8",invalid_raise=False)

file_in_geonames = open(url, "r", encoding='utf-8')

cur_list = []

for row in file_in_geonames:
  cur_list.append(row.strip().split('\t'))

final_list = []
list_for_points = []
for i in range(1,len(cur_list)):
  if cur_list[i][5] != "":
    floats = cur_list[i][1:3]
    rel = cur_list[i][5]
    final_list.append([*floats, rel])
    list_for_points.append([cur_list[i][0], cur_list[i][4], rel, cur_list[i][6]])


list_new = np.array(final_list)


'''
ax = plt.axes(projection = '3d')


# Data for three-dimensional scattered points
zdata = list_new[:,2].astype(float)
xdata = list_new[:,0].astype(float)
ydata = list_new[:,1].astype(float)
ax.scatter3D(xdata, ydata, zdata, c=zdata, cmap='Dark2');

plt.show()

'''

#normalize the data with StandardScaler
d_std = preprocessing.StandardScaler().fit_transform(list_new)
#d_std is a numpy array with scaled (Z-score) data
#compute PCA
pca=PCA(n_components=2)
d_pca=pca.fit_transform(d_std)
#d_pca is a numpy array with transformed data

with open('./points_new.tsv', 'w', newline='', encoding="utf-8") as out_file:
    tsv_writer = csv.writer(out_file, delimiter='\t')
    tsv_writer.writerow(['name', 'category', 'relevance', 'country_iso', 'x', 'y'])
    for i in range(0, len(d_pca)):
      row = [list_for_points[i][0], list_for_points[i][1], list_for_points[i][2], list_for_points[i][3], d_pca[i][0], d_pca[i][1]]
      tsv_writer.writerow(row)


'''

#plotting d_pca 
plt.plot(d_pca[:,0],d_pca[:,1],
         'o', markersize=7,
         color='blue',
         alpha=0.5,
         label='PCA transformed data in the new 2D space')
plt.xlabel('X1')
plt.ylabel('X2')
plt.xlim([-4,4]) 
plt.ylim([-4,4]) 
plt.legend()
plt.show()


'''
