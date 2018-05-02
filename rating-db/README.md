# rating-db

MongoDB container for ratings demo app

To prepopulate the db with data, after deploying the app enter:

`kubectl exec -it $pod -- bash ./import.sh`

where `$pod` is the pod name for the db.