from eccodes import (
    codes_grib_new_from_samples,
    codes_set,
    codes_set_array,
    codes_write,
    codes_release,
)
import xarray as xr
import numpy as np
import pandas as pd
from datetime import datetime

def create_field(ds,param_category:int, param_number:int, values, forecast_hours, base_date, filename:str,level=None,
    level_value=None,):

    # ds = xr.open_dataset("wrfoutput.nc", engine="netcdf4")

    gid = codes_grib_new_from_samples("GRIB2")

    nj = ds.dims["south_north"]
    ni = ds.dims["west_east"]

    lat = ds["XLAT"].isel(Time=forecast_hours).values
    lon = ds["XLONG"].isel(Time=forecast_hours).values
    lat_first = lat[0, 0].item()   
    lon_first = lon[0, 0].item()    
    lat_last = lat[-1, -1].item()   
    lon_last = lon[-1, -1].item()   

    # Parameter metadata
    codes_set(gid, "discipline", 0)
    codes_set(gid, "parameterCategory", param_category)
    codes_set(gid, "parameterNumber", param_number)


    # Set the level type and value
    if not level == None:
        codes_set(gid, "typeOfFirstFixedSurface", level)
    if not level_value == None:
        codes_set(gid, "scaledValueOfFirstFixedSurface", level_value)

    codes_set(gid, "gridType", "regular_ll")
    codes_set(gid, "Ni", ni)
    codes_set(gid, "Nj", nj)
    codes_set(gid, "latitudeOfFirstGridPointInDegrees", lat_first)
    codes_set(gid, "longitudeOfFirstGridPointInDegrees", lon_first)
    codes_set(gid, "latitudeOfLastGridPointInDegrees", lat_last)
    codes_set(gid, "longitudeOfLastGridPointInDegrees", lon_last)

    # Forecast time settings
    codes_set(gid, "dataDate", int(base_date.strftime("%Y%m%d")))
    codes_set(gid, "dataTime", int(base_date.strftime("%H%M")))
    codes_set(gid, "forecastTime", forecast_hours)

    # Set values
    codes_set_array(gid, "values", values)

    # Append to file
    with open(filename, "ab") as f:
        codes_write(gid, f)

    codes_release(gid)

# Output file
filename = "salerno_2days_random.grib2"


def convertitorWRFtoGRIB2(fileinput,fileoutput=None,base_time=None,FileForDays:bool=False):
    # Open the NetCDF file
    ds = xr.open_dataset(fileinput,engine="netcdf4")

    if base_time==None:
        # Extract base_date from the first timestamp in "Times"
        time_str = ds["Times"].isel(Time=0).values.item().decode("utf-8")
        base_time = pd.to_datetime(time_str.replace("_", " "))

    if fileoutput==None:
        # Create output filename
        fileoutput = fileinput.replace(".nc", "")
        fileoutput = fileoutput+"_" + base_time.strftime("%Y%m%d") + ".grib2"



    #TODO: Make a file for each day of file wrf in input
    if FileForDays:
        pass

    open(fileoutput, "wb").close()  # Clear if exists


    for fh in range(len(ds["Time"])):
        # Extract U, V, and RAINC variables
        u_values = ds["U10"].isel(Time=fh).values
        v_values = ds["V10"].isel(Time=fh).values
        
        create_field(ds,2, 2, u_values.flatten(), fh, base_time, filename)   # U-wind
        create_field(ds,2, 3, v_values.flatten(), fh, base_time, filename)   # V-wind
        
        # Extract T and T2 variables
        t_values = ds["T"].isel(Time=fh,bottom_top=0).values + 273.15
        create_field(ds,0, 0, t_values.flatten(), fh, base_time, filename, 100,50000)  # Temperature
        # t2_values = ds["T2"].isel(Time=fh).values
        # create_field(0, 0, t2_values.flatten(), fh, base_time, filename)  # Temperature


        #Extract PSFC, Q2
        psfc_values = ds["PSFC"].isel(Time=fh).values
        create_field(ds,3, 0, psfc_values.flatten(), fh, base_time, filename)  # Surface Pressure
        
        q2_values = ds["Q2"].isel(Time=fh).values
        create_field(ds,1, 10, q2_values.flatten(), fh, base_time, filename)  # Humidity
        

        # TODO: Test CLDFRA,QCLOUD with cloudy Day
        total_cloud_cover = ds["CLDFRA"].isel(Time=fh,bottom_top=0).values * 100
        create_field(ds,6, 1, total_cloud_cover.flatten(), fh, base_time, filename,100,50000)  # Cloud Cover
        qcloud = ds["QCLOUD"].isel(Time=fh,bottom_top=0).values
        create_field(ds,1, 22, qcloud.flatten(), fh, base_time, filename,100,85000)  # Cloud Water
        

        # FIXME: The RAINC,RAINNC,QRAIN and QVAPOR variables are not visualized in the output file
        rain_values = ds["RAINC"].isel(Time=fh).values
        rainn_values = ds["RAINNC"].isel(Time=fh).values
        create_field(ds,1, 8, rain_values.flatten(), fh, base_time, filename,1)  # Rain
        create_field(ds,1, 9, rainn_values.flatten(), fh, base_time, filename,1)  # Rain
        qrain = ds["QRAIN"].isel(Time=fh,bottom_top=0).values
        qvapor = ds["QVAPOR"].isel(Time=fh,bottom_top=0).values

        create_field(ds,1, 24, qrain.flatten(), fh, base_time, filename)  # Rain Water
        create_field(ds,1, 0, qvapor.flatten(), fh, base_time, filename,105,85000)  # Vapor



convertitorWRFtoGRIB2("wrfExample.nc",fileoutput=filename)


print(f"🌧️ GRIB2 file with random 48h forecast for Salerno written: {filename}")
