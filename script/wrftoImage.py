import xarray as xr 
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import numpy as np
import pandas as pd

def generate_windspeed_image(ds, time_index=0,output_file="wind_vector_plot.png"):
    lats = ds['XLAT'].isel(Time=time_index).values
    lons = ds['XLONG'].isel(Time=time_index).values


    u_values = ds['U10'].isel(Time=time_index).values  # Componente U del vento
    v_values = ds['V10'].isel(Time=time_index).values  # Componente V del vento


    # Calcola l'intensità del vento (magnitudine)
    wind_speed = np.sqrt(u_values**2 + v_values**2)


    # Riduci la densità delle frecce campionando i dati
    step = 5  # Cambia questo valore per regolare la densità delle frecce
    lats_sampled = lats[::step, ::step]
    lons_sampled = lons[::step, ::step]
    u_sampled = u_values[::step, ::step]
    v_sampled = v_values[::step, ::step]
    wind_speed_sampled = wind_speed[::step, ::step]

    # Create a figure and axis with Cartopy
    fig, ax = plt.subplots(figsize=(12, 8), subplot_kw={'projection': ccrs.PlateCarree()})
    ax.set_extent([lons.min(), lons.max(), lats.min(), lats.max()], crs=ccrs.PlateCarree())


    # Aggiungi caratteristiche geografiche
    ax.add_feature(cfeature.LAND, edgecolor="black", facecolor="lightgray")
    ax.add_feature(cfeature.BORDERS, linestyle=":")
    ax.add_feature(cfeature.COASTLINE)

    # Aggiungi data e ora sulla mappa
    # Ottieni la data e l'ora dal dataset e convertila nel formato richiesto
    # time_str = str(ds["Times"].isel(Time=time_index).values)

    # ax.text(
    #     0.01, -0.1,  # Posizione relativa (in basso a sinistra)
    #     f"Data e Ora: {time_str}",  # Data e ora formattata        transform=ax.transAxes,
    #     fontsize=10,
    #     color='black',
    #     bbox=dict(facecolor='white', alpha=0.8, edgecolor='none')
    # )


    # Plotta le frecce del vento sopra i dati della temperatura
    quiver = ax.quiver(
        lons_sampled, lats_sampled, u_sampled, v_sampled,wind_speed_sampled, # Direzione del vento
        scale=300,  # Scala per la lunghezza delle frecce
        pivot='middle',  # Le frecce sono centrate
        cmap='viridis',  # Colormap per l'intensità del vento
        color='black',  # Colore delle frecce
        alpha=0.9,
        transform=ccrs.PlateCarree()
    )


    # Aggiungi una barra dei colori per l'intensità del vento
    cbar = plt.colorbar(quiver, ax=ax, orientation='vertical', pad=0.1, aspect=30)
    cbar.set_label('Intensità del vento (m/s)', fontsize=12)


    # Aggiungi griglie e titolo
    ax.gridlines(draw_labels=True, alpha=0.5)
    plt.title('Direzione e Intensità del Vento (10m)', fontsize=14)


    # plt.show()

    # Salva la figura
    plt.savefig(output_file, dpi=300, bbox_inches='tight')

    # Chiudi la figura
    plt.close(fig)

def generate_temperature_image(ds, time_index=0, output_file="temperature_plot.png"):
    # Estrai i dati di temperatura
    lats = ds['XLAT'].isel(Time=time_index).values
    lons = ds['XLONG'].isel(Time=time_index).values
    temperature = ds['T2'].isel(Time=time_index).values  # Temperatura a 2 metri

    # Crea una figura e un asse con Cartopy
    fig, ax = plt.subplots(figsize=(12, 8), subplot_kw={'projection': ccrs.PlateCarree()})
    ax.set_extent([lons.min(), lons.max(), lats.min(), lats.max()], crs=ccrs.PlateCarree())

    # Aggiungi caratteristiche geografiche
    ax.add_feature(cfeature.LAND, edgecolor="black", facecolor="lightgray")
    ax.add_feature(cfeature.BORDERS, linestyle=":")
    ax.add_feature(cfeature.COASTLINE)

    # Plotta la temperatura
    temp_plot = ax.contourf(lons, lats, temperature, cmap='coolwarm', levels=20, transform=ccrs.PlateCarree())
    
    # Aggiungi una barra dei colori per la temperatura
    cbar = plt.colorbar(temp_plot, ax=ax, orientation='vertical', pad=0.1, aspect=30)
    cbar.set_label('Temperatura (K)', fontsize=12)

    # Aggiungi griglie e titolo
    ax.gridlines(draw_labels=True, alpha=0.5)
    plt.title('Temperatura a 2 metri', fontsize=14)

    # Salva la figura
    plt.savefig(output_file, dpi=300, bbox_inches='tight')

    # Chiudi la figura
    plt.close(fig)


def generate_precipitation_image(ds, time_index=0, output_file="precipitation_plot.png"):
    # Estrai i dati di precipitazione
    lats = ds['XLAT'].isel(Time=time_index).values
    lons = ds['XLONG'].isel(Time=time_index).values
    precipitation = ds['RAINC'].isel(Time=time_index).values  # Precipitazione cumulativa

    # Crea una figura e un asse con Cartopy
    fig, ax = plt.subplots(figsize=(12, 8), subplot_kw={'projection': ccrs.PlateCarree()})
    ax.set_extent([lons.min(), lons.max(), lats.min(), lats.max()], crs=ccrs.PlateCarree())

    # Aggiungi caratteristiche geografiche
    ax.add_feature(cfeature.LAND, edgecolor="black", facecolor="lightgray")
    ax.add_feature(cfeature.BORDERS, linestyle=":")
    ax.add_feature(cfeature.COASTLINE)

    # Plotta la precipitazione
    precip_plot = ax.contourf(lons, lats, precipitation, cmap='Blues', levels=20, transform=ccrs.PlateCarree())
    
    # Aggiungi una barra dei colori per la precipitazione
    cbar = plt.colorbar(precip_plot, ax=ax, orientation='vertical', pad=0.1, aspect=30)
    cbar.set_label('Precipitazione (mm)', fontsize=12)

    # Aggiungi griglie e titolo
    ax.gridlines(draw_labels=True, alpha=0.5)
    plt.title('Precipitazione Cumulativa', fontsize=14)

    # Salva la figura
    plt.savefig(output_file, dpi=300, bbox_inches='tight')

    # Chiudi la figura
    plt.close(fig)


def generate_humidity_image(ds, time_index=0, output_file="humidity_plot.png"):
    # Estrai i dati di umidità
    lats = ds['XLAT'].isel(Time=time_index).values
    lons = ds['XLONG'].isel(Time=time_index).values
    humidity = ds['Q2'].isel(Time=time_index).values  # Umidità a 2 metri

    # Crea una figura e un asse con Cartopy
    fig, ax = plt.subplots(figsize=(12, 8), subplot_kw={'projection': ccrs.PlateCarree()})
    ax.set_extent([lons.min(), lons.max(), lats.min(), lats.max()], crs=ccrs.PlateCarree())

    # Aggiungi caratteristiche geografiche
    ax.add_feature(cfeature.LAND, edgecolor="black", facecolor="lightgray")
    ax.add_feature(cfeature.BORDERS, linestyle=":")
    ax.add_feature(cfeature.COASTLINE)

    # Plotta l'umidità
    humidity_plot = ax.contourf(lons, lats, humidity, cmap='viridis', levels=20, transform=ccrs.PlateCarree())
    
    # Aggiungi una barra dei colori per l'umidità
    cbar = plt.colorbar(humidity_plot, ax=ax, orientation='vertical', pad=0.1, aspect=30)
    cbar.set_label('Umidità (kg/kg)', fontsize=12)

    # Aggiungi griglie e titolo
    ax.gridlines(draw_labels=True, alpha=0.5)
    plt.title('Umidità a 2 metri', fontsize=14)

    # Salva la figura
    plt.savefig(output_file, dpi=300, bbox_inches='tight')

    # Chiudi la figura
    plt.close(fig)


def generate_minimal_wind_image(ds,time_index=0, output_file="minimal_wind_plot.png"):
    lats = ds['XLAT'].isel(Time=time_index).values
    lons = ds['XLONG'].isel(Time=time_index).values

    u_values = ds['U10'].isel(Time=time_index).values
    v_values = ds['V10'].isel(Time=time_index).values

    wind_speed = np.sqrt(u_values**2 + v_values**2)

    step = 5
    lats_sampled = lats[::step, ::step]
    lons_sampled = lons[::step, ::step]
    u_sampled = u_values[::step, ::step]
    v_sampled = v_values[::step, ::step]
    wind_speed_sampled = wind_speed[::step, ::step]

    fig, ax = plt.subplots(figsize=(12, 8), subplot_kw={'projection': ccrs.PlateCarree()})
    ax.set_extent([lons.min(), lons.max(), lats.min(), lats.max()], crs=ccrs.PlateCarree())

    ax.add_feature(cfeature.LAND, edgecolor="black", facecolor="lightgray")
    ax.add_feature(cfeature.BORDERS, linestyle=":")
    ax.add_feature(cfeature.COASTLINE)

    quiver = ax.quiver(
        lons_sampled, lats_sampled, u_sampled, v_sampled, wind_speed_sampled,
        scale=300, pivot='middle', cmap='viridis', alpha=0.9, transform=ccrs.PlateCarree()
    )

    # Rimuovi assi e bordi
    ax.axis('off')

    # Rimuovi gli spazi bianchi attorno alla mappa
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

    # Salva la figura
    plt.savefig(output_file, dpi=300, bbox_inches='tight', pad_inches=0)

    # Chiudi la figura
    plt.close(fig)


def generate_minimal_temperature_image(ds, time_index=0, output_file="minimal_temperature_plot.png"):
    lats = ds['XLAT'].isel(Time=time_index).values
    lons = ds['XLONG'].isel(Time=time_index).values
    temperature = ds['T2'].isel(Time=time_index).values

    fig, ax = plt.subplots(figsize=(12, 8), subplot_kw={'projection': ccrs.PlateCarree()})
    ax.set_extent([lons.min(), lons.max(), lats.min(), lats.max()], crs=ccrs.PlateCarree())

    ax.add_feature(cfeature.LAND, edgecolor="black", facecolor="lightgray")
    ax.add_feature(cfeature.BORDERS, linestyle=":")
    ax.add_feature(cfeature.COASTLINE)

    temp_plot = ax.contourf(lons, lats, temperature, cmap='coolwarm', levels=20, transform=ccrs.PlateCarree())
    
    # Rimuovi assi e bordi
    ax.axis('off')

    # Rimuovi gli spazi bianchi attorno alla mappa
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

    # Salva la figura
    plt.savefig(output_file, dpi=300, bbox_inches='tight', pad_inches=0)

    # Chiudi la figura
    plt.close(fig)

def generate_minimal_precipitation_image(ds, time_index=0, output_file="minimal_precipitation_plot.png"):

    lats = ds['XLAT'].isel(Time=time_index).values
    lons = ds['XLONG'].isel(Time=time_index).values
    precipitation = ds['RAINC'].isel(Time=time_index).values

    fig, ax = plt.subplots(figsize=(12, 8), subplot_kw={'projection': ccrs.PlateCarree()})
    ax.set_extent([lons.min(), lons.max(), lats.min(), lats.max()], crs=ccrs.PlateCarree())

    ax.add_feature(cfeature.LAND, edgecolor="black", facecolor="lightgray")
    ax.add_feature(cfeature.BORDERS, linestyle=":")
    ax.add_feature(cfeature.COASTLINE)

    precip_plot = ax.contourf(lons, lats, precipitation, cmap='Blues', levels=20, transform=ccrs.PlateCarree())
    
    # Rimuovi assi e bordi
    ax.axis('off')

    # Rimuovi gli spazi bianchi attorno alla mappa
    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

    # Salva la figura
    plt.savefig(output_file, dpi=300, bbox_inches='tight', pad_inches=0)

    # Chiudi la figura
    plt.close(fig)



if __name__ == "__main__":
    # Apri il file NetCDF
    nc_file = "WRF1HOUR.nc"

    ds = xr.open_dataset(nc_file)

    # Genera l'immagine del vento
    # generate_windspeed_image(ds, time_index=0)
    # Genera l'immagine della temperatura
    # generate_temperature_image(ds, time_index=0)

    for tx in range(len(ds["Time"])):
        time_str = ds["Times"].isel(Time=0).values.item().decode("utf-8")
        forecast_time = pd.to_datetime(time_str.replace("_", " "))
        forecast_time= forecast_time.strftime("%Y%m%d")

        generate_minimal_wind_image(ds, time_index=tx,output_file=f"Image/minimal_wind_plot{forecast_time}:{tx}.png")

        generate_minimal_temperature_image(ds, time_index=tx,output_file=f"Image/minimal_temperature_plot{forecast_time}:{tx}.png")

        generate_minimal_precipitation_image(ds, time_index=tx,output_file=f"Image/minimal_rain_plot{forecast_time}:{tx}.png")

    # Chiudi il dataset
    ds.close()
