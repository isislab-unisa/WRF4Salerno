"""a Convertitor of a WRF file to a GeoJSON file"""

import xarray as xr
import geopandas as gpd
from shapely.geometry import Point
import pandas as pd
import matplotlib.colors as mcolors
import numpy as np
import matplotlib.pyplot as plt

# def temperature_to_color(temperature):
#     """Convert temperature to a color."""
#     cmap = plt.cm.get_cmap('coolwarm')  # Color map for temperature
#     norm = mcolors.Normalize(vmin=250, vmax=310)  # Normalize temperature in Kelvin (example range)
#     rgba = cmap(norm(temperature))  # Get RGBA color
#     # Convert to hex color
#     return mcolors.rgb2hex(rgba[:3])



def create_field(ds, output_file:str, forecast_time:pd.Timestamp,date:str = None):
    """Create a field from a WRF file and save it as a GeoJSON file.
    Args:
        ds (xarray.Dataset): The WRF dataset.
        output_file (str): The output GeoJSON file path.
    """
    

    nj = ds.dims['south_north']
    ni = ds.dims['west_east']

    lat = ds["XLAT"].isel(Time=forecast_time).values
    lon = ds["XLONG"].isel(Time=forecast_time).values

    
    # t_values = ds["T"].isel(Time=0,bottom_top=0).values + 273.15 # K
    # rain_values = ds["RAINC"].isel(Time=forecast_time).values
    # rainn_values = ds["RAINNC"].isel(Time=forecast_time).values
    # total_rain = rain_values + rainn_values

    # Extract the forecast hour
    # Extract U, V, and RAINC variables
    u_values = ds["U10"].isel(Time=forecast_time).values
    v_values = ds["V10"].isel(Time=forecast_time).values
    t_values = ds["T2"].isel(Time=forecast_time).values


    features = []


    for j in range(nj):
        for i in range(ni):
            temperature = (float(t_values[j, i])-273.15) # Convert to Fahrenheit
            # color = temperature_to_color(temperature)

            # rain = float(total_rain[j, i])
            point = Point(float(lon[j, i]), float(lat[j, i]))

            features.append({
                    "geometry": point,
                    "temperature": round(temperature, 2),
                    "u_values" : round(float(u_values[j, i]),2),
                    "v_values" : round(float(v_values[j, i]),2),
                    "time": forecast_time,
                    "latitude": round(float(lat[j, i]),2),
                   "longitude": round(float(lon[j, i]),2),
                })
    # Create a GeoDataFrame
    gdf = gpd.GeoDataFrame(features, geometry='geometry')
    
    gdf.crs = "EPSG:4326"  # Set the coordinate reference system to WGS84

    # Save to GeoJSON
    gdf.to_file(output_file, driver='GeoJSON')

if __name__ == "__main__":
    wrf_file= "WRF1HOUR.nc"
    ds = xr.open_dataset(wrf_file)
    time_str = ds["Times"].isel(Time=0).values.item().decode("utf-8")
    forecast_time = pd.to_datetime(time_str.replace("_", " "))
    forecast_time= forecast_time.strftime("%Y%m%d")
    output_file = f"public/json/output_{forecast_time}.geojson"


    for tx in range(len(ds["Time"])):
        output_file = f"public/json/output_{tx}.geojson"
        create_field(ds, output_file, tx, forecast_time)
    # Close the dataset
    ds.close()