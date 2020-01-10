SERVER_CHOICE=$1

if [ "$SERVER_CHOICE" = "" ]
then
    SERVER_CHOICE="python"
fi

if [ "$SERVER_CHOICE" = "python" ]
then
    python -m SimpleHTTPServer
    exit 0
fi

if [ "$SERVER_CHOICE" = "node" ]
then
    live-server
    exit 0
fi


echo "Unknown Server Choice"
exit 1



