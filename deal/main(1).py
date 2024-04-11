import subprocess
import os
from config import nc_files, output_dir, extent,concentration
from Map import binary_img_array
from utils_binary import load_current_data, simulate_with_given_current, visualize_and_save_on_map
import random
D = 300  # 扩散系数，单位是平方米每秒 (m²/s)
dx = 10000  # 网格间距，单位是米 (m)
dt = 3600*24  # 时间步长，24小时
frames = 20  # 总帧数
decay_constant = 1.768e-9  # 氚的衰变常数
beta = 10
# 模拟网格的尺寸，调整为更小的区域
grid_size_x, grid_size_y = 600, 600
# 执行模拟并保存带地图的浓度图像
# 执行20天的模拟，每天使用不同的洋流数据
# for day in range(1, frames + 1):
#     nc_file = nc_files[day - 1]  # 从列表中获取当前天的文件名
#     u_current, v_current = load_current_data(nc_file)  # 加载当天的洋流数据
#     # 模拟扩散
#     concentration = simulate_with_given_current(concentration, D, dt, dx, decay_constant, v_current, u_current)
#     # 可视化并保存结果到地图上
#     visualize_and_save_on_map(concentration, day, output_dir, extent)
#     # 打印状态更新
#     print(f"Day {day}: Simulation and map visualization done.")
# 假设 frames 是你想要随机抽取（并可能重复）的文件数量
for day in range(1, frames + 1):
    #nc_file = nc_files[day - 1]  # 从列表中获取当前天的文件名
    nc_file = nc_files[0]
    u_current, v_current = load_current_data(nc_file)  # 加载当天的洋流数据
    # 模拟扩散
    concentration = simulate_with_given_current(concentration, D, dt, dx, decay_constant, v_current, u_current,binary_img_array)
    # 可视化并保存结果到地图上
    visualize_and_save_on_map(concentration, day, output_dir, extent)
    #visualize_and_save_on_map_folium(concentration, day, output_dir, extent)
    # 打印状态更新
    print(f"Day {day}: Simulation and map visualization done.")

#使用ffmpeg生成视频的命令
ffmpeg_cmd = [
    r"D:\ffmeg\ffmpeg-6.1.1-essentials_build\bin\ffmpeg.exe",
    '-framerate', '8',  # 设置视频的帧率
    '-i', os.path.join(output_dir, 'concentration_map_day_%03d.png'),  # 输入图像序列格式
    '-c:v', 'libx264',  # 设置视频编码器
    '-vf', 'scale=1280:-2,setpts=2.0*PTS' , # 设置视频大小
    '-pix_fmt', 'yuv420p',  # 设置像素格式
    '-crf', '15',  # 设置视频质量
    '-preset', 'slow',  # 设置编码速度
    os.path.join(output_dir, 'diffusion_video4.mp4')  # 输出视频文件名
]

# 执行ffmpeg命令，生成视频
subprocess.run(ffmpeg_cmd, check=True)