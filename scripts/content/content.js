
(function () {
	var sourceEl;
	var data;
	var schemaVersion;

	// Don't process if the body content doesn't look like a recognised JSON schema
	try {
		if (document.body.childNodes[0] && document.body.childNodes[0].tagName !== "PRE") return;
		sourceEl = document.body.children.length ? document.body.childNodes[0] : document.body;
		data = JSON.parse(sourceEl.innerText);
		if (!data.schemaVersion) return;
		schemaVersion = parseInt(data.schemaVersion, 10);
	} catch(e) {
		return;
	}

	// Hide the default rendering of the JSON
	sourceEl.style.display = 'none';

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
				document.body.innerHTML = Mustache.to_html(req.responseText, data);
				document.body.style.display = 'block';
				$('time').each(function() {
					var mo = moment($(this).attr('datetime'));
					$(this).html(mo.fromNow()).attr('title', mo.format("dddd, MMMM Do YYYY, h:mm:ss a"));
				});
				return cb ? cb() : true;
			}
		};
		req.send(null);
	};
}());
