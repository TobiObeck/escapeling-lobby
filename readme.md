## Run client

**Do once:**

You need to specifically install npm with the version: v14.17.6

Download from here (scroll down a bit to the downloads):

https://nodejs.org/en/blog/release/v14.17.6/


```
cd client
npm install
```

```
cd client
npm run start
```

## Setup & run server

### Set up a python conda environment with the required packages:

```
conda create -n lobby python=3.8.
```

Or manually install the packages with `conda install some-package`:

```
conda install flask
conda install flask_socketio
conda install colorama
```

### run server

run server as python file

```
python .\server\server.py
```

or alterantively run as flask application

**Set environmental variables:**

Unfortunately, the next few steps have to be done for every new conda session, because conda doesn't preserve the environmental variables.

On Windows with **powershell**, set a `FLASK_APP` variable to the location where `server.py` is located. Also set a `FLASK_ENV` variable to development:

```powershell
$env:FLASK_APP =".\server\server.py"
$env:FLASK_ENV="development"
```

On Windows with **cmd**:

```
set FLASK_APP=.\server\server.py
set FLASK_ENV=development
```

On Linux/Mac with **shell**:

```shell
export FLASK_APP=.\server\server.py
export FLASK_ENV=development
```

You can check with powershell if the environment variables have been set correctly (powershell): `gci env:* | sort-object name`


# Deployment Notes

**Config Vars**
https://dashboard.heroku.com/apps/escapeling-lobby/settings

FLASK_APP   server\server.py
SECRET_KEY  not gonna tell you