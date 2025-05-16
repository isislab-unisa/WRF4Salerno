# Use Ubuntu as the base image
FROM ubuntu:22.04

RUN rm -rf /etc/apt/apt.conf.d/*

#Install dependencies
RUN apt-get update -y
RUN apt-get install -y build-essential
RUN apt-get install -y csh
RUN apt-get install -y gfortran
RUN apt-get install -y m4
RUN apt-get install -y curl
RUN apt-get install -y wget
RUN apt-get install -y perl
RUN apt-get install -y git
RUN apt-get install -y mpich
RUN apt-get install -y gcc
RUN apt-get install -y g++
RUN apt-get install -y libtool
RUN apt-get install -y automake
RUN apt-get install -y autoconf
RUN apt-get install -y make
RUN apt-get install -y m4
RUN apt-get install -y grads
RUN apt-get install -y default-jre
RUN apt-get install -y unzip
RUN apt-get install -y nco
RUN apt-get install -y nano
# Create directories
RUN mkdir -p /wrf 


WORKDIR /wrf

# Install WRF
COPY install_WRF.sh /wrf/install.sh
RUN chmod +x /wrf/install.sh && /wrf/install.sh

# Copy the WRF source code
COPY install_GFS.sh /wrf/WRF/install_GFS.sh
RUN chmod +x /wrf/WRF/install_GFS.sh
COPY cleaner.sh /wrf/WRF/cleaner.sh
RUN chmod +x /wrf/WRF/cleaner.sh
COPY setup_namelist.sh /wrf/WRF/setup_namelist.sh
RUN chmod +x /wrf/WRF/setup_namelist.sh
COPY run_WRF.sh /wrf/WRF/run.sh
RUN chmod +x /wrf/WRF/run.sh

ENTRYPOINT ["/bin/bash"]
