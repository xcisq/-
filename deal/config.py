import numpy as np
import os
import matplotlib.pyplot as plt

# 设置matplotlib字体参数，以支持中文显示
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei']  # 使用微软雅黑字体
plt.rcParams['axes.unicode_minus'] = False  # 正确显示负号

# D = 300  # 扩散系数，单位是平方米每秒 (m²/s)
# dx = 10000  # 网格间距，单位是米 (m)
# dt = 3600 * 24  # 时间步长，24小时
# frames = 20  # 总帧数
# decay_constant = 1.768e-9  # 氚的衰变常数

# 模拟网格的尺寸，调整为更小的区域
grid_size_x, grid_size_y = 600, 600

# 初始化浓度网格为零
# concentration = np.random.rand(grid_size_x, grid_size_y) * 1e-6
concentration = np.zeros((grid_size_x, grid_size_y))

# 在特定区域设置初始高浓度
concentration[224:230, 209:220] = 100
#concentration[224:230, 209:220] = 100
# # 设置初始浓度阈值，低于该值的浓度设置为0
# threshold = 1e-5
# concentration[concentration < threshold] = 0

# 创建存储图像的目录
output_dir = r'D:\小徐快乐学习\计设\核扩散项目\image'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
#nc_files = [f'./data/CA202202{day:02d}.nc' for day in range(10, 11)]
nc_files = [f'D:\\data\\CA202202{day:02d}.nc' for day in range(10, 11)]


#nc_files = [f'data/CA202209{day:02d}.nc' for day in range(1, 9)]

# 指定地理位置范围
# extent = (100, 180, 70, -10)  # 根据您的数据调整这些值
extent = (120, 180, 60, 0)  # 根据您的数据调整这些值