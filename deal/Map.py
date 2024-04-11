# import matplotlib.pyplot as plt
# import cartopy.crs as ccrs
# import cartopy.feature as cfeature
# from PIL import Image
#
#
# # 设置图形尺寸
# fig = plt.figure(figsize=(7, 7), dpi=120)  # 6x6英寸，100DPI
#
# # 创建地图投影
# ax = plt.axes(projection=ccrs.PlateCarree())
#
# # 设置绘图范围为东经120度到180度，赤道到北纬60度
# ax.set_extent([100, 180, -10, 70], crs=ccrs.PlateCarree())
#
# # 添加陆地特征，填充为灰色
# ax.add_feature(cfeature.LAND, edgecolor='black', facecolor='gray')
#
# # 添加海岸线
# ax.coastlines()
#
# # 可选：添加网格线
# #ax.gridlines(draw_labels=False, linewidth=0.5, color='black', alpha=0.5, linestyle='--')
#
# # 移除图表周围的边框和标签
# for spine in ax.spines.values():
#     spine.set_visible(False)
#
# # 调整布局
# plt.tight_layout()
#
# # 保存图像到文件，使用bbox_inches='tight'来裁剪周围的空白
# plt.savefig('map_800x800.png', bbox_inches='tight', pad_inches=0)
#
# img_path = 'map_800x800.png'
# img = Image.open(img_path)
#
# img_resized = img.resize((800, 800))
#
# resized_img_path = 'map_800x800_resized.png'
# img_resized.save(resized_img_path)
# plt.close(fig)


from PIL import Image
import numpy as np
import matplotlib.pyplot as plt

# 加载图像
img_path = 'map_600x600_resized.png'
img = Image.open(img_path)

# 转换为灰度图像
gray_img = img.convert('L')

# 将图像转换为numpy数组
img_array = np.array(gray_img)

# 定义阈值
threshold = 128
binary_img_array = np.where(img_array > threshold, 1, 0)


# print(binary_img_array.shape)
#
#
# #创建一个新的图形用于显示
# fig, ax = plt.subplots(figsize=(7, 7), dpi=100)
#
# # 显示二值化图像，保证数据填充整个绘图区域
# # 注意这里我们不再提供extent参数，因为我们不显示坐标轴
# ax.imshow(binary_img_array, cmap='gray', aspect='auto')
#
#
# # 关闭坐标轴，这样我们就不会看到周围的经纬度标签
# plt.axis('on')
#
# # 使用紧凑布局，确保图像数据填充整个图表区域
# plt.subplots_adjust(left=0, right=1, bottom=0, top=1)
#
# # 显示图像
# plt.show()
