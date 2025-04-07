#!/usr/bin/sh
# GNU Compilation of WRF dependencies

# Exit on error to prevent proceeding with unresolved issues
set -e

    
#PreConfiguration
export HOME=`pwd`

mkdir $HOME/WRF

cd $HOME/WRF

mkdir Downloads
mkdir Library

cd Downloads

#Downloads
wget -c https://www.zlib.net/zlib-1.3.1.tar.gz
wget -c https://support.hdfgroup.org/ftp/HDF5/releases/hdf5-1.10/hdf5-1.10.5/src/hdf5-1.10.5.tar.gz
wget -c https://downloads.unidata.ucar.edu/netcdf-c/4.9.0/netcdf-c-4.9.0.tar.gz
wget -c https://downloads.unidata.ucar.edu/netcdf-fortran/4.6.0/netcdf-fortran-4.6.0.tar.gz
wget -c http://www.mpich.org/static/downloads/3.3.1/mpich-3.3.1.tar.gz
wget -c https://download.sourceforge.net/libpng/libpng-1.6.37.tar.gz
wget -c https://www.ece.uvic.ca/~frodo/jasper/software/jasper-1.900.1.zip

# Compilers
export DIR=$HOME/WRF/Library
export CC=gcc
export CXX=g++
export FC=gfortran
export F77=gfortran

#zlib
tar -xzvf zlib-1.3.1.tar.gz
cd zlib-1.3.1
./configure --prefix=$DIR
make
make install
cd ..

#hdf5
tar -xvzf hdf5-1.10.5.tar.gz
cd hdf5-1.10.5
./configure --prefix=$DIR --with-zlib=$DIR --enable-hl --enable-fortran
make check
make install
cd ..

export HDF5=$DIR
export LD_LIBRARY_PATH=$DIR/lib:$LD_LIBRARY_PATH

#netcdf
tar -xvzf netcdf-c-4.9.0.tar.gz
cd netcdf-c-4.9.0/
export CPPFLAGS=-I$DIR/include 
export LDFLAGS=-L$DIR/lib
./configure --prefix=$DIR --disable-dap
make check
make install
export PATH=$DIR/bin:$PATH
export NETCDF=$DIR
cd ..

#netcdf-fortran
tar -xvzf netcdf-fortran-4.6.0.tar.gz
cd netcdf-fortran-4.6.0/
export LD_LIBRARY_PATH=$DIR/lib:$LD_LIBRARY_PATH
export CPPFLAGS=-I$DIR/include 
export LDFLAGS=-L$DIR/lib
export FCFLAGS="-fallow-argument-mismatch"
export FFLAGS="-fallow-argument-mismatch"
export LIBS="-lnetcdf -lhdf5_hl -lhdf5 -lz"
./configure --prefix=$DIR --disable-shared
make check
make install
cd ..

#mpich
tar -xvzf mpich-3.3.1.tar.gz
cd mpich-3.3.1/
./configure --prefix=$DIR
make
make install
cd ..

export PATH=$DIR/bin:$PATH

#libpng
export LDFLAGS=-L$DIR/lib
export CPPFLAGS=-I$DIR/include
tar -xvzf libpng-1.6.37.tar.gz
cd libpng-1.6.37/
./configure --prefix=$DIR
make
make install
cd ..

#jasper
unzip jasper-1.900.1.zip
cd jasper-1.900.1
autoreconf -i
./configure --prefix=$DIR
make
make install
export JASPERLIB=$DIR/lib
export JASPERINC=$DIR/include
cd ..

#WRF
wget -c https://github.com/wrf-model/WRF/archive/v4.1.2.tar.gz
tar -xvzf v4.1.2.tar.gz -C $HOME/WRF
cd $HOME/WRF/WRF-4.1.2
./clean
printf "34\n1\n" | ./configure
./compile em_real
cd ..
export WRF_DIR=$HOME/WRF/WRF-4.1.2

#WPS
wget -c https://github.com/wrf-model/WPS/archive/v4.1.tar.gz
tar -xvzf v4.1.tar.gz -C $HOME/WRF
cd $HOME/WRF/WPS-4.1
printf "3\n" | ./configure
./compile

cd ..

