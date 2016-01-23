
(function () {
	var sourceEl;
	var data;
	var schemaVersion;

	// Don't process if the body content doesn't look like a recognised JSON schema
	try {
		if (!document.body || (document.body.childNodes[0] && document.body.childNodes[0].tagName !== "PRE")) return;
		sourceEl = document.body.childNodes[0] || document.body;
		data = JSON.parse(sourceEl.innerText);
		if (!data.schemaVersion) return;
		schemaVersion = parseInt(data.schemaVersion, 10);
	} catch(e) {
		return;
	}

	// Stop the browser's default rendering of the JSON from appearing
	document.body.innerHTML = '';

	if (location.pathname.indexOf('health') !== -1 && schemaVersion == 1 && data.checks && Array.isArray(data.checks)) {

		var minsev = 4;
		var sev;

		// Add extra data for templating
		for (i=0, s=data.checks.length; i<s; i++) {
			sev = data.checks[i].ok ? 4 : (data.checks[i].severity ? data.checks[i].severity : 1);
			data.checks[i].statusclass = (sev < 4) ? 'sev-'+sev : 'ok';
			data.checks[i].idx = i;
			minsev = Math.min(minsev, sev);
		}
		data.statusclass = (minsev < 4) ? 'sev-'+minsev : 'ok';
		data.statussummary = (minsev < 4) ? 'Reporting problems' : 'All checks OK';

		renderTemplate('health', data, function () {
			var converter = new Showdown.converter();
			$('.check table td').each(function() {
				var pattern = /\b((?:https?|ftp|file):\/\/)([-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[-A-Za-z0-9+&@#\/%=~_|])/ig;
				var html = $(this).text().replace(pattern, "<a href='$&'>$2</a>");
				html = converter.makeHtml(html);
				$(this).html(html);
			});
		});

	} else if (location.pathname.indexOf('about') !== -1 && schemaVersion == 1) {

		var knownProps = ['schemaVersion', 'name', 'purpose', 'systemCode', 'audience', 'serviceTier', 'dateCreated', 'dateDeployed', 'appVersion', 'apiVersion', 'apiVersions', 'primaryUrl', '_hostname', 'links', 'contacts'];

		// Backwards compat
		if (data.hostname && !data._hostname) {
			data._hostname = data.hostname;
			delete data.hostname;
		}

		data.custom = JSON.stringify(Object.keys(data).reduce(function(out, key) {
			if (knownProps.indexOf(key) === -1) out[key] = data[key];
			return out;
		}, {}), undefined, 4);
		if (data.custom === '{}') {
			data.custom = undefined;
		}

		if (data.links) {
			data.links.sort(function(a, b) { return a.category > b.category ? 1 : -1; });
			data.links = data.links.map(function(item) {
				item.categorySlug = (item.category || "").replace(/\W/, '').toLowerCase();
				return item;
			})
		}

		data.contactsCount = data.contacts ? data.contacts.length : 0;
		data.linksCount = data.links ? data.links.length : 0;
		data.apisCount = data.apiVersions ? data.apiVersions.length : 0;
		data.serviceTierSlug = (data.serviceTier || "").replace(/\W/, '').toLowerCase();
		data.audienceSlug = (data.audience || "").replace(/\W/, '').toLowerCase();

		renderTemplate('about', data);
	}

	function renderTemplate(name, data, cb) {
		var req = new XMLHttpRequest();
		req.open("GET", chrome.extension.getURL('templates/'+name+'.html'), true);
		req.onreadystatechange = function() {
			if (req.readyState == 4 && req.status == 200) {

				// Brief delay to ensure that if there's a battle between this plugin and JSONView, this one is more likely to be the last one to modify the DOM.  Wish there were a better way to stop JSONView running on our metadata endpoints.
				setTimeout(function() {
					document.body.innerHTML = Mustache.to_html(req.responseText, data);
					$('time').each(function() {
						var mo = moment($(this).attr('datetime'));
						$(this).html(mo.fromNow()).attr('title', mo.format("dddd, MMMM Do YYYY, h:mm:ss a"));
					});
					if (cb) cb();
				}, 250);
			}
		};
		req.send(null);
	};
}());
