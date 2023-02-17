#!/bin/sh

# @file Backup major ForgeRock platform (tenant) configuraiton components for selected realm.
# @author Konstantin.Lapine@forgerock.com
# @example Call from any place in file system; it will create folders for the environment and realm in that location.
# ENVIRONMENT=kl03; REALM=alpha; /path/to/frodo-backup-realm-configuration.sh $ENVIRONMENT $REALM; ls $ENVIRONMENT/$REALM

exportComponent()
{
    COMPONENT=$1
    echo $COMPONENT
    mkdir -p -- $COMPONENT
    cd $COMPONENT

    COMMAND="frodo $COMPONENT"
    if [ $1 == email ]
    then
        COMMAND+=" template"
    fi
    COMMAND+=" export -A"
    if [ $1 == idm ]
    then
         COMMAND+=" -D ."
    fi
    COMMAND="$COMMAND $ENVIRONMENT $REALM"

    echo $COMMAND
    $COMMAND

    cd ..
}

# Navigate to the caller location.
cd "$(pwd)"

ENVIRONMENT=$1
mkdir -p -- $ENVIRONMENT
cd $ENVIRONMENT

REALM=$2
DATE_TIME=$(date +"%Y-%m-%d_%H-%M-%S")
FOLDER="${REALM}_${DATE_TIME}"
mkdir -p -- $FOLDER
cd $FOLDER

for c in agent app email idm idp journey saml script service theme
do
    exportComponent $c
done

cd ../..
