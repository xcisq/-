from netCDF4 import Dataset
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LogNorm
import os
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import folium
from config import grid_size_x, grid_size_y


# 加载洋流数据的函数
def load_current_data(nc_file):
    ds = Dataset(nc_file, mode='r')
    UVEL = 'UVEL'
    VVEL = 'VVEL'
    u_data = ds.variables[UVEL][:][0, 0, :, :].data
    v_data = ds.variables[VVEL][:][0, 0, :, :].data
    u_data_no_nan = np.nan_to_num(u_data, nan=0)
    v_data_no_nan = np.nan_to_num(v_data, nan=0)
    u_current = np.round(u_data_no_nan * 100, 3)  # 转换为米/秒并四舍五入
    v_current = np.round(v_data_no_nan * 100, 3)  # 转换为米/秒并四舍五入
    return u_current, v_current


def bilinear_interpolation(x, y, grid):
    x1 = int(x)
    x2 = x1 + 1
    y1 = int(y)
    y2 = y1 + 1

    Q11 = grid[y1, x1]
    Q12 = grid[y2, x1]
    Q21 = grid[y1, x2]
    Q22 = grid[y2, x2]

    R1 = (x2 - x) * Q11 + (x - x1) * Q21
    R2 = (x2 - x) * Q12 + (x - x1) * Q22

    P = (y2 - y) * R1 + (y - y1) * R2
    return P


#-----------------------------------------------------
def simulate_with_given_current(concentration, D, dt, dx, decay_constant, v_current, u_current):
    new_concentration = np.copy(concentration)
    concentration_change = np.zeros_like(concentration)  # 初始化一个与concentration同维度的数组来记录变化量

    # 执行扩散过程，考虑质量守恒
    for i in range(1, concentration.shape[0] - 1):
        for j in range(1, concentration.shape[1] - 1):
            diffusion_term =  D * dt / dx ** 2 * (
                concentration[i + 1, j] + concentration[i - 1, j] +
                concentration[i, j + 1] + concentration[i, j - 1] -
                4 * concentration[i, j]
            )
            concentration_change[i, j] += diffusion_term  # 更新变化量，不直接加到new_concentration上

    new_concentration += concentration_change  # 应用扩散过程的变化量

    # 清空变化量数组，为下一步计算准备
    concentration_change = np.zeros_like(concentration)

    # 执行迁移和洋流效果，更新后的版本确保质量守恒
    for i in range(1, concentration.shape[0] - 1):
        for j in range(1, concentration.shape[1] - 1):
            di = int(np.round(bilinear_interpolation(j, i, v_current)))
            dj = int(np.round(bilinear_interpolation(j, i, u_current)))

            target_i = int(max(min(i + di, concentration.shape[0] - 2), 1))
            target_j = int(max(min(j + dj, concentration.shape[1] - 2), 1))

            if 0 <= target_i < concentration.shape[0] and 0 <= target_j < concentration.shape[1]:
                concentration_change[i, j] -= 0.15*concentration[i, j]  # 源位置减少
                concentration_change[target_i, target_j] += 0.09*concentration[i, j]  # 目标位置增加

    new_concentration += concentration_change  # 将迁移和洋流的变化量应用到新浓度上

    # 衰变过程
    new_concentration *= np.exp(-decay_constant * dt)

    return new_concentration

def visualize_and_save_on_map(concentration_matrix, day, output_dir, extent):
    # 创建一个地图投影
    projection = ccrs.PlateCarree()

    # 创建一个图形对象
    fig, ax = plt.subplots(figsize=(12, 8), subplot_kw={'projection': projection})

    # 设置地图的显示范围
    ax.set_extent(extent, crs=ccrs.PlateCarree())

    # 添加陆地、海岸线和边界
    ax.add_feature(cfeature.LAND)
    ax.add_feature(cfeature.COASTLINE)
    ax.add_feature(cfeature.BORDERS, linestyle=':')

    # 创建对数归一化对象
    norm = LogNorm(vmin=np.clip(concentration_matrix.min(), a_min=1e-10, a_max=None), vmax=concentration_matrix.max())

    # 获取指定范围内的经纬度
    lon_min, lon_max, lat_min, lat_max = extent
    lons = np.linspace(lon_min, lon_max, grid_size_x)
    lats = np.linspace(lat_min, lat_max, grid_size_y)
    lon2d, lat2d = np.meshgrid(lons, lats)

    # 将浓度数据绘制在地图上
    plt_contourf = ax.contourf(lon2d, lat2d, concentration_matrix, transform=ccrs.PlateCarree(), cmap='viridis',
                               norm=norm)

    # 添加颜色条
    cbar = plt.colorbar(plt_contourf, ax=ax, shrink=0.7)
    cbar.set_label('浓度')

    # 添加网格线和标签
    gl = ax.gridlines(draw_labels=True, linewidth=1, color='gray', alpha=0.5, linestyle='--')
    gl.top_labels = gl.right_labels = False

    # 设置标题和标签
    ax.set_title(f'第{day}天的浓度分布图', fontsize=16)

    # 保存图形
    plt.savefig(os.path.join(output_dir, f'concentration_map_day_{day:03d}.png'), dpi=300)
    plt.close(fig)



