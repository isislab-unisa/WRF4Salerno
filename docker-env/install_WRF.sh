#!/usr/bin/sh
# GNU Compilation of WRF dependencies

# Exit on error to prevent proceeding with unresolved issues
set -ex

    
#PreConfiguration
export HOME=`pwd`

# check if folder exists
if [ -d "$HOME/WRF" ]; then
    echo "Directory $HOME/WRF already exists. Please remove it or choose a different location."
else
    mkdir $HOME/WRF
fi

cd $HOME/WRF

if [ -d "$HOME/WRF/Library" ]; then
    echo "Directory $HOME/WRF/Library already exists. Please remove it or choose a different location."
else
    mkdir Library
fi
if [ -d "$HOME/WRF/Downloads" ]; then
    echo "Directory $HOME/WRF/Downloads already exists"
    cd Downloads
else
    mkdir Downloads
    cd Downloads
    #Downloads
    wget -c https://www.zlib.net/zlib-1.3.1.tar.gz
    wget -c https://support.hdfgroup.org/ftp/HDF5/releases/hdf5-1.10/hdf5-1.10.5/src/hdf5-1.10.5.tar.gz
    wget -c https://downloads.unidata.ucar.edu/netcdf-c/4.9.0/netcdf-c-4.9.0.tar.gz
    wget -c https://downloads.unidata.ucar.edu/netcdf-fortran/4.6.0/netcdf-fortran-4.6.0.tar.gz
    wget -c http://www.mpich.org/static/downloads/3.3.1/mpich-3.3.1.tar.gz
    wget -c https://download.sourceforge.net/libpng/libpng-1.6.37.tar.gz
    wget -c https://www.ece.uvic.ca/~frodo/jasper/software/jasper-1.900.1.zip
fi


# Compilers
export DIR=$HOME/WRF/Library
export CC=gcc
export CXX=g++
export FC=gfortran
export F77=gfortran
# export F90=gfortran


#zlib
if [ -d "$HOME/WRF/Downloads/zlib-1.3.1" ]; then
    echo "Directory $HOME/WRF/Library/zlib-1.3.1 already exists"
else
    tar -xzvf zlib-1.3.1.tar.gz
    cd zlib-1.3.1
    ./configure --prefix=$DIR
    make
    make install
    cd ..
fi

#hdf5
if [ -d "$HOME/WRF/Downloads/hdf5-1.10.5" ]; then
    echo "Directory $HOME/WRF/Library/hdf5-1.10.5 already exists"
else
    tar -xvzf hdf5-1.10.5.tar.gz
    cd hdf5-1.10.5
    ./configure --prefix=$DIR --with-zlib=$DIR --enable-hl --enable-fortran
    make check
    make install
    cd ..
fi

export HDF5=$DIR
export LD_LIBRARY_PATH=$DIR/lib:$LD_LIBRARY_PATH

#netcdf
if [ -d "$HOME/WRF/Downloads/netcdf-c-4.9.0" ]; then
    echo "Directory $HOME/WRF/Library/netcdf-c-4.9.0 already exists"
else
    tar -xvzf netcdf-c-4.9.0.tar.gz
    cd netcdf-c-4.9.0/
    export CPPFLAGS=-I$DIR/include 
    export LDFLAGS=-L$DIR/lib
    ./configure --prefix=$DIR --disable-dap --disable-nczarr 
    make check
    make install
    export PATH=$DIR/bin:$PATH
    cd ..
fi
export NETCDF=$DIR

#netcdf-fortran
if [ -d "$HOME/WRF/Downloads/netcdf-fortran-4.6.0" ]; then
    echo "Directory $HOME/WRF/Library/netcdf-fortran-4.6.0 already exists"
else
    tar -xvzf netcdf-fortran-4.6.0.tar.gz
    cd netcdf-fortran-4.6.0/
    export LD_LIBRARY_PATH=$DIR/lib:$LD_LIBRARY_PATH
    export CPPFLAGS=-I$DIR/include 
    export LDFLAGS=-L$DIR/lib
    export FCFLAGS="-fallow-argument-mismatch"
    export CFLAGS="-fallow-argument-mismatch -fallow-invalid-boz"
    export FFLAGS="-fallow-argument-mismatch"
    # export LIBS="-lnetcdf -lhdf5_hl -lhdf5 -lz"
    # export LIBS="-lhdf5_hl -lhdf5 -lz -lcurl -lgfortran -lgcc -lm -ldl -lpnetcdf -lnetcdf"
    export LIBS="-lnetcdf -lhdf5_hl -lhdf5 -lz"

    ./configure --prefix=$DIR --disable-shared
    make check
    make install
    cd ..
    unset CFLAGS
fi

#mpich

if [ -d "$HOME/WRF/Downloads/mpich-3.3.1" ]; then
    echo "Directory $HOME/WRF/Library/mpich-3.3.1 already exists"
else
    tar -xvzf mpich-3.3.1.tar.gz
    cd mpich-3.3.1/
    ./configure --prefix=$DIR
    make
    make install
    cd ..
    export PATH=$DIR/bin:$PATH
fi

#libpng
export LDFLAGS=-L$DIR/lib
export CPPFLAGS=-I$DIR/include
if [ -d "$HOME/WRF/Downloads/libpng-1.6.37" ]; then
    echo "Directory $HOME/WRF/Library/libpng-1.6.37 already exists"
else
    tar -xvzf libpng-1.6.37.tar.gz
    cd libpng-1.6.37/
    ./configure --prefix=$DIR
    make
    make install
    cd ..
fi

#jasper
if [ -d "$HOME/WRF/Downloads/jasper-1.900.1" ]; then
    echo "Directory $HOME/WRF/Library/jasper-1.900.1 already exists"
else
    unzip jasper-1.900.1.zip
    cd jasper-1.900.1
    autoreconf -i
    ./configure --prefix=$DIR --build=aarch64-unknown-linux-gnu
    make
    make install
    export JASPERLIB=$DIR/lib
    export JASPERINC=$DIR/include
    cd ..
fi

#WRF
if [ -d "$HOME/WRF/WRF" ]; then
    echo "Directory $HOME/WRF/WRF already exists"
else
    git clone --recurse-submodule https://github.com/wrf-model/WRF.git $HOME/WRF/WRF
    cd $HOME/WRF/WRF
    ./clean
    printf "34\n1\n" | ./configure
    ./compile em_real
    cd ..
    export WRF_DIR=$HOME/WRF/WRF
fi


#WPS
if [ -d "$HOME/WRF/WPS" ]; then
    echo "Directory $HOME/WRF/WPS already exists"
else
    git clone --recurse-submodule https://github.com/wrf-model/WPS.git $HOME/WRF/WPS
    cd $HOME/WRF/WPS
    printf "3\n" | ./configure
    ./compile
fi
cd ..