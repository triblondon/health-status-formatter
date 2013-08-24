
(function () {
	var
	child,
	data,
	minsev = 4,
	sev,
	i,
	s,
	scripts = [
		'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js',
		'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.0.0/js/bootstrap.min.js',
		'https://cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js',
		'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.1.0/moment.min.js'
	];

	// Don't process if the body content doesn't look like JSON
	if (!(document.body && (document.body.childNodes[0] && document.body.childNodes[0].tagName == "PRE" || document.body.children.length == 0))) {
		return;
	}

	// Parse JSON and ensure it looks like a healthcheck response
	child = document.body.children.length ? document.body.childNodes[0] : document.body;
	try {
		data = JSON.parse(child.innerText);
	} catch(e) {
		return;
	}
	if (data.schemaVersion && parseFloat(data.schemaVersion) == 1 && data.checks && Array.isArray(data.checks)) {

		// Hide the default rendering of the JSON
		child.style.display = 'none';

		// Load additional scripts
		loadScripts(function() {

			// Add extra data for templating
			for (i=0, s=data.checks.length; i<s; i++) {
				sev = data.checks[i].ok ? 4 : (data.checks[i].severity ? data.checks[i].severity : 1);
				data.checks[i].statusclass = (sev < 4) ? 'sev-'+sev : 'ok';
				data.checks[i].idx = i;
				minsev = Math.min(minsev, sev);
			}
			data.statusclass = (minsev < 4) ? 'sev-'+minsev : 'ok';
			data.statussummary = (minsev < 4) ? 'Reporting problems' : 'All checks OK';

			// Load the template and render it
			var req = new XMLHttpRequest();
			req.open("GET", chrome.extension.getURL('template.html'), true);
			req.onreadystatechange = function() {
				if (req.readyState == 4 && req.status == 200) {
					document.body.innerHTML = Mustache.to_html(req.responseText, data);
					scripts = [chrome.extension.getURL('format.js')];
					loadScripts();
				}
			};
			req.send(null);
		});

		function loadScripts(cb) {
			if (!scripts.length) return cb ? cb() : true;
			var url = scripts.shift();
			var el = document.createElement('script');
			el.src = url;
			el.onload = function() { loadScripts(cb); };
			document.getElementsByTagName("head")[0].appendChild(el);
			if (child) child.style.display = 'block';
		};
	}
}());
