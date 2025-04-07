# Use Ubuntu as the base image
FROM ubuntu:22.04

#Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    csh \
    gfortran \
    m4 \
    curl \
    wget \
    perl \
    git \
    mpich \
    gcc \
    gfortran \
    g++ \
    libtool \
    automake \
    autoconf \
    make \
    m4 \
    grads \
    default-jre \
    csh

# Create directories
RUN mkdir -p /wrf 


WORKDIR /wrf

COPY install.sh /wrf/install.sh

ENTRYPOINT ["/bin/bash"]
