echo "ELASTIC_DEV_USER_NAME: $ELASTIC_DEV_USER_NAME" 
echo "ELASTIC_DEV_PASSWORD: $ELASTIC_DEV_PASSWORD" 
echo "ELASTIC_DEV_END_POINT: $ELASTIC_DEV_END_POINT" 
echo "ELASTIC_VENDOR_PROD_INDEX: $ELASTIC_VENDOR_PROD_INDEX" 
firebase use io-box
firebase projects:list

read -r -p "Are you sure? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
then
    echo "gogo"
    firebase functions:config:set \
        elasticsearch.username=$ELASTIC_DEV_USER_NAME \
        elasticsearch.password=$ELASTIC_DEV_PASSWORD \
        elasticsearch.url=$ELASTIC_DEV_END_POINT \
        elasticsearch.vendor_prod_index=$ELASTIC_VENDOR_PROD_INDEX

    # firebase deploy --only functions:scheduledElasticHealthCheck,functions:elasticVendorProdSearch
    firebase deploy --only functions:elasticVendorProdSearch
    # firebase deploy --only functions:elastic.scheduledElasticHealthCheck
else
    echo "exit"
fi


