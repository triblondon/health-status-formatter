# README
A Chrome extension to make it easier for humans to read healthcheck JSON

## Install this extension:
To install this extension, you will need to download the CRX file from the "build" directory of this project, then

	Go to chrome://settings/extensions
	Tick "Developer mode"
	Drag the downloaded CRX file into the middle of the Chrome extensions window
	Accept the request to install

You can then test by going to http://build.origami.ft.com/__health.  Without the extension, you will see JSON.  With the extension you will see a human-readable explanation of current healthchecks and which (if any) are failing.


## To develop and test this extension:
Clone this Git project, then:

	Go to chrome://settings/extensions
	Tick "Developer mode"
	Choose "Load unpacked extension", then select the folder into which the project was cloned.

Once you are satisfied with the improvement, please choose "Pack extension" from the Chrome settings page, then commit the revised CRX into the "build" folder of this repository.
