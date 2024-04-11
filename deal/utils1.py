from netCDF4 import Dataset
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LogNorm
import os
import cartopy.crs as ccrs
import cartopy.feature as cfeature

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
    u_current = np.round(u_data_no_nan * 5, 3)  # 转换为米/秒并四舍五入
    v_current = np.round(v_data_no_nan * 5, 3)  # 转换为米/秒并四舍五入
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


# -----------------------------------------------------
# def simulate_with_given_current(concentration, D, dt, dx, decay_constant, v_current, u_current):
#     new_concentration = np.copy(concentration)
#     concentration_change = np.zeros_like(concentration)  # 初始化一个与concentration同维度的数组来记录变化量

#     # 执行扩散过程，考虑质量守恒
#     for i in range(1, concentration.shape[0] - 1):
#         for j in range(1, concentration.shape[1] - 1):
#             diffusion_term =  D * dt / dx ** 2 * (
#                 concentration[i + 1, j] + concentration[i - 1, j] +
#                 concentration[i, j + 1] + concentration[i, j - 1] -
#                 4 * concentration[i, j]
#             )
#             concentration_change[i, j] += diffusion_term  # 更新变化量，不直接加到new_concentration上

#     new_concentration += concentration_change  # 应用扩散过程的变化量

#     # 清空变化量数组，为下一步计算准备
#     concentration_change = np.zeros_like(concentration)

#     # 执行迁移和洋流效果，更新后的版本确保质量守恒
#     for i in range(1, concentration.shape[0] - 1):
#         for j in range(1, concentration.shape[1] - 1):
#             di = int(np.round(bilinear_interpolation(j, i, v_current)))
#             dj = int(np.round(bilinear_interpolation(j, i, u_current)))

#             target_i = int(max(min(i + di, concentration.shape[0] - 2), 1))
#             target_j = int(max(min(j + dj, concentration.shape[1] - 2), 1))

#             if 0 <= target_i < concentration.shape[0] and 0 <= target_j < concentration.shape[1]:
#                 concentration_change[i, j] -= 0.15*concentration[i, j]  # 源位置减少
#                 concentration_change[target_i, target_j] += 0.15*concentration[i, j]  # 目标位置增加

#     new_concentration += concentration_change  # 将迁移和洋流的变化量应用到新浓度上

#     # 衰变过程
#     new_concentration *= np.exp(-decay_constant * dt)

#     return new_concentration


def simulate_with_given_current(concentration, D, dt, dx, decay_constant, v_current, u_current, beta, index1):
    new_concentration = np.copy(concentration)
    concentration_change = np.zeros_like(concentration)

    # 执行扩散过程，考虑质量守恒
    for _ in range(beta):  # 假定扩散过程重复执行β次
        for i in range(1, concentration.shape[0] - 1):
            for j in range(1, concentration.shape[1] - 1):
                # diffusion_term = D * dt / dx ** 2 * (
                diffusion_term = 0.2 * (
                        concentration[i + 1, j] + concentration[i - 1, j] +
                        concentration[i, j + 1] + concentration[i, j - 1] -
                        4 * concentration[i, j])
                concentration_change[i, j] += diffusion_term

        new_concentration += concentration_change
        concentration_change = np.zeros_like(concentration)  # 重置变化量数组
    concentration_change_source = np.zeros_like(concentration)
    # 执行迁移和洋流效果，更新后的版本确保质量守恒
    for i in range(1, new_concentration.shape[0] - 1):
        for j in range(1, new_concentration.shape[1] - 1):
            # di = int(np.round(np.double(v_current[i, j] * dt / dx)))  # 注意乘以beta
            # dj = int(np.round(np.double(u_current[i, j] * dt / dx)))  # 注意乘以beta
            di = int(np.round(np.double(v_current[i, j])))  # 注意乘以beta
            dj = int(np.round(np.double(u_current[i, j])))  # 注意乘以beta
            if index1 < 10:
                target_i = int(max(min(i + di, new_concentration.shape[0] - 2), 1))
                target_j = int(max(min(j + dj, new_concentration.shape[1] - 2), 1))
                if 0 <= target_i < concentration.shape[0] and 0 <= target_j < concentration.shape[1]:
                    concentration_change[i, j] -= 0.15 * concentration[i, j]  # 源位置减少
                    concentration_change[target_i, target_j] += 0.15 * concentration[i, j]  # 目标位置增加

                # concentration_change[i, j] = new_concentration[target_i, target_j]
                # concentration_change_source[target_i, target_j] = new_concentration[target_i, target_j]
            # di = int(np.round(bilinear_interpolation(j, i, v_current * beta)))  # 注意乘以beta
            # dj = int(np.round(bilinear_interpolation(j, i, u_current * beta)))  # 注意乘以beta

            else:
                # 为了确保每个小方格都有唯一的浓度输入，使用逆向导数法
                source_i = int(max(min(i - di, new_concentration.shape[0] - 2), 1))
                source_j = int(max(min(j - dj, new_concentration.shape[1] - 2), 1))
                if 0 <= source_i < concentration.shape[0] and 0 <= source_j < concentration.shape[1]:
                    concentration_change[i, j] += 0.15 * concentration[source_i, source_j]  # 源位置减少
                    concentration_change[source_i, source_j] -= 0.15 * concentration[source_i, source_j]  # 目标位置增加

                # concentration_change[i, j] = new_concentration[source_i, source_j]
                # concentration_change_source[source_i,source_j] = new_concentration[source_i, source_j]

    # new_concentration = concentration_change+new_concentration-0.1*concentration_change_source
    new_concentration += concentration_change  # 将迁移和洋流的变化量应用到新浓度上

    # 衰变过程
    new_concentration *= np.exp(-decay_constant * dt)

    return new_concentration


# -----------------------------------------------------
def visualize_and_save_concentration(concentration_matrix, day, output_dir):
    # 创建对数归一化对象
    norm = LogNorm(vmin=np.clip(concentration_matrix.min(), a_min=1e-10, a_max=None), vmax=concentration_matrix.max())

    # 可视化浓度矩阵
    fig, ax = plt.subplots(figsize=(10, 8))
    cax = ax.imshow(concentration_matrix, cmap='viridis', norm=norm, origin='lower')
    ax.set_title(f'第{day}天的浓度分布')
    ax.set_xlabel('X 网格')
    ax.set_ylabel('Y 网格')
    plt.colorbar(cax, ax=ax, label='浓度')

    # 保存图像
    plt.savefig(os.path.join(output_dir, f'concentration_day_{day:03d}.png'), dpi=300)
    plt.close(fig)


def visualize_and_save_on_map(concentration_matrix, day, output_dir, extent):
    """
    Visualize the concentration data on a map and save the figure.
    `extent` is a tuple containing the longitude and latitude bounds in the form of
    (lon_min, lon_max, lat_min, lat_max).
    """
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

# def visualize_and_save_on_map(concentration_matrix, day, output_dir, extent, land_mask):
#     """
#     Visualize the concentration data on a map and save the figure.
#     `extent` is a tuple containing the longitude and latitude bounds in the form of
#     (lon_min, lon_max, lat_min, lat_max).
#     """
#     # 创建一个地图投影
#     projection = ccrs.PlateCarree()

#     # 创建一个图形对象
#     fig, ax = plt.subplots(figsize=(12, 8), subplot_kw={'projection': projection})

#     # 设置地图的显示范围
#     ax.set_extent(extent, crs=ccrs.PlateCarree())

#     # 添加陆地、海岸线和边界
#     ax.add_feature(cfeature.LAND)
#     ax.add_feature(cfeature.COASTLINE)
#     ax.add_feature(cfeature.BORDERS, linestyle=':')

#     # 创建对数归一化对象
#     norm = LogNorm(vmin=np.clip(concentration_matrix.min(), a_min=1e-10, a_max=None), vmax=concentration_matrix.max())

#     # 获取指定范围内的经纬度
#     lon_min, lon_max, lat_min, lat_max = extent
#     grid_size_x, grid_size_y = concentration_matrix.shape
#     lons = np.linspace(lon_min, lon_max, grid_size_x)
#     lats = np.linspace(lat_min, lat_max, grid_size_y)
#     lon2d, lat2d = np.meshgrid(lons, lats)

#     # 应用陆地掩模
#     concentration_matrix = np.where(land_mask, concentration_matrix, 0)

#     # 将浓度数据绘制在地图上
#     plt_contourf = ax.contourf(lon2d, lat2d, concentration_matrix, transform=ccrs.PlateCarree(), cmap='viridis',
#                                norm=norm)

#     # 添加颜色条
#     cbar = plt.colorbar(plt_contourf, ax=ax, shrink=0.7)
#     cbar.set_label('浓度')

#     # 添加网格线和标签
#     gl = ax.gridlines(draw_labels=True, linewidth=1, color='gray', alpha=0.5, linestyle='--')
#     gl.top_labels = gl.right_labels = False

#     # 设置标题和标签
#     ax.set_title(f'第{day}天的浓度分布图', fontsize=16)

#     # 保存图形
#     plt.savefig(os.path.join(output_dir, f'concentration_map_day_{day:03d}.png'), dpi=300)
#     plt.close(fig)