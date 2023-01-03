#!/bin/bash

SELECTED_PROJ=$1
echo "selected proejct: $SELECTED_PROJ"

firebase login
gcloud auth login

firebase projects:list
firebase use $SELECTED_PROJ

gcloud projects list
gcloud config set project $SELECTED_PROJ

BUCKET_BASE_PATH=gs://$SELECTED_PROJ.appspot.com
FILE_NAME=date +"%Y-%m-%d:%T"
# gs://io-box-develop.appspot.com/backups/date+%Y-%m-%d:%T
BUCKET_PATH=$BUCKET_BASE_PATH/backups/$FILE_NAME

gcloud firestore export BUCKET_PATH
gsutil cp -r $BUCKET_PATH stuff/latest-data/firestore

firebase auth:export stuff/latest-data/auth_export/accounts.json --format=json
# firebase auth:import stuff/local-data/auth.json

# bks=$(gsutil ls $BUCKET_BASE_PATH | grep -v "backup")
# for bk in ${bks[@]}
# do
#         echo "export bucket: $bk"
# done
