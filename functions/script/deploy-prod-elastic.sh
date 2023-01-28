echo "ELASTIC_USER_NAME: $ELASTIC_USER_NAME" 
echo "ELASTIC_PASSWORD: $ELASTIC_PASSWORD" 
echo "ELASTIC_END_POINT: $ELASTIC_END_POINT" 
# echo "ELASTIC_VENDOR_PROD_INDEX: $ELASTIC_VENDOR_PROD_INDEX" 
firebase use io-box
firebase projects:list

read -r -p "Are you sure? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
then
    echo "gogo"
    firebase functions:config:set \
        elasticsearch.username=$ELASTIC_USER_NAME \
        elasticsearch.password=$ELASTIC_PASSWORD \
        elasticsearch.url=$ELASTIC_END_POINT \
        # elasticsearch.vendor_prod_index=$ELASTIC_VENDOR_PROD_INDEX

    # firebase deploy --only functions:scheduledElasticHealthCheck,functions:elasticVendorProdSearch
    # DEPRECATED: elasticVendorProdSearch
    # firebase deploy --only functions:elasticVendorProdSearch
    firebase deploy --only functions:elasticInoutBoxSearch
    # firebase deploy --only functions:elastic.scheduledElasticHealthCheck
else
    echo "exit"
fi


