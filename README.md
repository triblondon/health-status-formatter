# README
A Chrome extension to make it easier for humans to read healthcheck JSON

This is a forked version of Health Status Formatter created by Andrew Betts. Ongoing development for FT should continue in the Finacial Times github account.

## Install this extension:
The latest version of the extension can be obtained from the Chrome Web Store.

You can then test by going to http://build.origami.ft.com/__health.  Without the extension, you will see JSON.  With the extension you will see a human-readable explanation of current healthchecks and which (if any) are failing.


## To develop and test this extension:
Clone this Git project, then:

	Go to chrome://extensions
	Tick "Developer mode"
	Choose "Load unpacked extension", then select the folder into which the project was cloned.