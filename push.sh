MSSG=""

if [ -z "$1" ] 
	then
		MSSG="Commit message"
	else
		MSSG=$1
fi


git add .
git commit -am "$MSSG"

npm version patch

git commit -am "version"
git push origin master

npm publish