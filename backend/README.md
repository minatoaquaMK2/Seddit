<!--
    DO NOT CHANGE THIS FILE - IT MAY BE UPDATED DURING THE ASSIGNMENT
-->
## Seddit Backend

Do not change any file in the backend directory.

Any changes you make to the backend will be lost.

## Running the Backend on your Own Machine

You can use virtual env [recommended].

```bash
cd backend
# create a sandbox for the backend 
virtualenv -p /usr/local/bin/python3 env

# enter sandbox
source env/bin/activate
# set up sandbox
pip install -r requirements.txt
# run backend! Will print out a bunch of info including a line like this:
#  * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
# visit the url on this line (e.g. http://127.0.0.1:5000/) to see the backend docs!
python backend_server.py
```


# User Data

in `backend/db/users.csv` there is a list of all users within the provided database, you can login as any of these users for testing or create your own account. 
