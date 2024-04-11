import os.path
import cdsapi

year = '2022'
month = ['08']

# day = ['23', '24', '25', '26', '27', '28', '29', '30', '31']
day = ['01']
# day = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30','31']
time = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']

c = cdsapi.Client()

for m in month:
    for d in day:
        for t in time:
                if not os.path.exists(year + m + d):
                    os.mkdir(year+m + d)
                if not os.path.exists(year + m + d + '/ERA5U'):
                    os.mkdir(year+m + d + '/ERA5U')
                c.retrieve(
                    'reanalysis-era5-single-levels',
                    {
                        'product_type': 'reanalysis',
                        'variable': '10m_u_component_of_wind',
                        'year': year,
                        'month': m,
                        'day': d,
                        'time': t,
                        'area': [
                            60, 120, 20,
                            160,
                        ],
                        'format': 'netcdf',
                    },
                    year+m+d+'/ERA5U/'+t[:2] + '.nc')

for m in month:
    for d in day:
        for t in time:
                if not os.path.exists(year + m + d):
                    os.mkdir(year+m + d)
                if not os.path.exists(year + m + d + '/ERA5V'):
                    os.mkdir(year+m + d + '/ERA5V')
                c.retrieve(
                    'reanalysis-era5-single-levels',
                    {
                        'product_type': 'reanalysis',
                        'variable': '10m_v_component_of_wind',
                        'year': year,
                        'month': m,
                        'day': d,
                        'time': t,
                        'area': [
                            60, 120, 0,
                            180,
                        ],
                        'format': 'netcdf',
                    },
                    year+m+d+'/ERA5V/'+t[:2] + '.nc')